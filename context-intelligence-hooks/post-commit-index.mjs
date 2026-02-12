#!/usr/bin/env node

// PostToolUse hook: re-index Qdrant (code + docs) after successful git commits.
//
// Hook event: PostToolUse (matcher: Bash)
// Stdin: { tool_name, tool_input: { command }, tool_output, cwd }
// Stdout: { "systemMessage": "Qdrant: re-indexed N code files ... Docs: re-indexed M files" }
//
// Deduplication:
//   Code — CodeIndexer.reindexChanges() deletes old chunks by relativePath filter
//   Docs — deterministic string IDs (file path) upserted via QdrantManager.addPoints()

import { readFileSync, existsSync } from "node:fs"
import { execSync } from "node:child_process"
import { join } from "node:path"
import {
  MCP_SERVER_BUILD, DEFAULT_CWD,
  createLogger, withTimeout, loadMcpConfig, setQdrantEnv, validateCwd,
} from "./lib/qdrant.mjs"

// ─── Constants (configurable via env vars) ───────────────────────────────────
const TIMEOUT_MS = parseInt(process.env.HOOK_INDEX_TIMEOUT, 10) || 55000
const DOC_MAX_LENGTH = 8000
const DOC_BATCH_LIMIT = parseInt(process.env.HOOK_DOC_BATCH_LIMIT, 10) || 20

const DOCS_COLLECTION = process.env.HOOK_DOCS_COLLECTION || "project-docs"
const COMMIT_PATTERN = /git\s+commit/
const ERROR_PATTERNS = /(?:^|\s)(?:error|fatal):|(?:\bfailed\b)/i
const DOC_EXTENSIONS = /\.(md|txt)$/
const DOC_DIRECTORIES = /^docs\/.*\.(md|txt|json|yaml|yml)$/

const { warn, info } = createLogger("post-commit-index.mjs")

// ─── Read stdin ─────────────────────────────────────────────────────────────
let input
try {
  input = readFileSync(0, "utf-8")
} catch {
  process.exit(0)
}

let parsed
try {
  parsed = JSON.parse(input)
} catch {
  process.exit(0)
}

if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) process.exit(0)

// ─── Fast-path exits ────────────────────────────────────────────────────────
if (parsed.tool_name !== "Bash") process.exit(0)

const command = parsed.tool_input?.command || ""
if (!COMMIT_PATTERN.test(command)) process.exit(0)

const output = parsed.tool_output || ""
if (ERROR_PATTERNS.test(output)) process.exit(0)

const mcpConfig = loadMcpConfig({ warn })
if (!mcpConfig) process.exit(0)
setQdrantEnv(mcpConfig, { warn })

// ─── Doc file detection ─────────────────────────────────────────────────────
function isDocFile(filePath) {
  return DOC_EXTENSIONS.test(filePath) || DOC_DIRECTORIES.test(filePath)
}

// ─── Get changed doc files from the commit ──────────────────────────────────
function getChangedDocFiles(cwd) {
  try {
    const output = execSync("git diff --name-only --diff-filter=ACMR HEAD~1 HEAD", {
      cwd,
      encoding: "utf-8",
      timeout: 5000,
    })
    return output.trim().split("\n").filter(f => f && isDocFile(f))
  } catch {
    return []
  }
}

// ─── Get deleted doc files from the commit ──────────────────────────────────
function getDeletedDocFiles(cwd) {
  try {
    const output = execSync("git diff --name-only --diff-filter=D HEAD~1 HEAD", {
      cwd,
      encoding: "utf-8",
      timeout: 5000,
    })
    return output.trim().split("\n").filter(f => f && isDocFile(f))
  } catch {
    return []
  }
}

// ─── Docs re-indexing ───────────────────────────────────────────────────────
// Uses file path as string ID. QdrantManager.normalizeId() converts it to a
// deterministic UUID via SHA-256, so re-indexing the same file overwrites the
// existing point (upsert) rather than creating a duplicate.
async function reindexDocs(changedFiles, deletedFiles, cwd, qdrant, embeddings) {
  const result = { docsIndexed: 0, docsDeleted: 0 }

  if (!changedFiles.length && !deletedFiles.length) return result

  const exists = await qdrant.collectionExists(DOCS_COLLECTION)
  if (!exists) {
    info("docs_collection_missing", { collection: DOCS_COLLECTION })
    return result
  }

  const collectionInfo = await qdrant.getCollectionInfo(DOCS_COLLECTION)

  // Delete points for removed doc files
  if (deletedFiles.length) {
    try {
      // Pass file paths as string IDs; normalizeId handles UUID conversion
      await qdrant.deletePoints(DOCS_COLLECTION, deletedFiles)
      result.docsDeleted = deletedFiles.length
      info("docs_deleted", { count: deletedFiles.length, files: deletedFiles })
    } catch (e) {
      warn("docs_delete_error", { error: e.message, files: deletedFiles })
    }
  }

  // Cap the number of files to index per commit to stay within timeout
  const capped = changedFiles.length > DOC_BATCH_LIMIT
    ? (info("docs_capped", { total: changedFiles.length, limit: DOC_BATCH_LIMIT }), changedFiles.slice(0, DOC_BATCH_LIMIT))
    : changedFiles

  // Index changed/added doc files
  for (const relPath of capped) {
    try {
      const fullPath = join(cwd, relPath)
      if (!existsSync(fullPath)) continue

      const content = readFileSync(fullPath, "utf-8")
      if (!content.trim()) continue

      const text = content.length > DOC_MAX_LENGTH ? content.slice(0, DOC_MAX_LENGTH) : content
      const { embedding } = await embeddings.embed(text)

      const point = {
        id: relPath, // deterministic: normalizeId converts to UUID via SHA-256
        vector: embedding,
        payload: {
          content: text,
          source: relPath,
          path: relPath,
          file: relPath,
          indexedAt: new Date().toISOString(),
        },
      }

      if (collectionInfo.hybridEnabled) {
        const { BM25SparseVectorGenerator } = await import(
          join(MCP_SERVER_BUILD, "embeddings", "sparse.js")
        )
        const sparseGen = new BM25SparseVectorGenerator()
        point.sparseVector = sparseGen.generate(text)
        await qdrant.addPointsWithSparse(DOCS_COLLECTION, [point])
      } else {
        await qdrant.addPoints(DOCS_COLLECTION, [point])
      }

      result.docsIndexed++
    } catch (e) {
      warn("doc_index_error", { file: relPath, error: e.message })
    }
  }

  return result
}

// ─── Re-index (code + docs) ─────────────────────────────────────────────────
const cwd = validateCwd(parsed.cwd || DEFAULT_CWD, { warn })

withTimeout(
  (async () => {
    const { QdrantManager } = await import(join(MCP_SERVER_BUILD, "qdrant", "client.js"))
    const { EmbeddingProviderFactory } = await import(join(MCP_SERVER_BUILD, "embeddings", "factory.js"))
    const { CodeIndexer } = await import(join(MCP_SERVER_BUILD, "code", "indexer.js"))

    const qdrant = new QdrantManager(mcpConfig.QDRANT_URL, mcpConfig.QDRANT_API_KEY)
    const embeddings = EmbeddingProviderFactory.createFromEnv()
    const codeIndexer = new CodeIndexer(qdrant, embeddings, {})

    // Run code re-index and doc file detection in parallel
    const changedDocFiles = getChangedDocFiles(cwd)
    const deletedDocFiles = getDeletedDocFiles(cwd)
    const [codeResult, docsResult] = await Promise.all([
      codeIndexer.reindexChanges(cwd),
      reindexDocs(changedDocFiles, deletedDocFiles, cwd, qdrant, embeddings),
    ])

    // Build structured output message
    const parts = []

    const codeTotal = (codeResult.filesAdded || 0)
      + (codeResult.filesModified || 0)
      + (codeResult.filesDeleted || 0)

    if (codeTotal > 0) {
      parts.push(
        `Code: re-indexed ${codeTotal} files`
        + ` (${codeResult.filesAdded} added, ${codeResult.filesModified} modified, ${codeResult.filesDeleted} deleted`
        + ` in ${codeResult.durationMs}ms)`
      )
    } else {
      parts.push("Code: no file changes detected")
    }

    const docsTotal = docsResult.docsIndexed + docsResult.docsDeleted
    if (docsTotal > 0) {
      const docParts = []
      if (docsResult.docsIndexed > 0) docParts.push(`${docsResult.docsIndexed} indexed`)
      if (docsResult.docsDeleted > 0) docParts.push(`${docsResult.docsDeleted} deleted`)
      parts.push(`Docs: re-indexed ${docsTotal} files (${docParts.join(", ")})`)
    } else {
      parts.push("Docs: no doc changes detected")
    }

    const message = `Qdrant post-commit: ${parts.join(". ")}`
    info("reindex_complete", {
      codeFiles: codeTotal,
      docsIndexed: docsResult.docsIndexed,
      docsDeleted: docsResult.docsDeleted,
    })

    process.stdout.write(JSON.stringify({ systemMessage: message }))
  })(),
  TIMEOUT_MS,
).catch((e) => {
  if (e.message === "timeout") {
    warn("index_timeout", { timeout_ms: TIMEOUT_MS })
  } else {
    warn("index_error", { error: e.message })
  }
  // Never break Claude's PostToolUse flow
  process.exit(0)
})
