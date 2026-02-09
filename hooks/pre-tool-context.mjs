#!/usr/bin/env node

// PreToolUse hook: thinking-based context retrieval.
//
// Fires on the first tool call per user turn, extracts reasoning from
// the transcript JSONL, and searches Qdrant + claude-mem with that
// refined query. Results inject as additionalContext before the tool
// executes.
//
// Why this works: user prompts are often vague ("fix that thing"), but
// Claude's reasoning expands them into precise technical queries
// ("the auth timeout in session handler"). Searching with the reasoning
// text produces better retrieval results.
//
// Hook event: PreToolUse (matcher: Read|Grep|Glob|Bash|WebSearch|WebFetch|Task)
// Stdin: { session_id, transcript_path, tool_name, tool_input, cwd }
// Stdout: { hookSpecificOutput: { hookEventName: "PreToolUse", additionalContext: "..." } }

import { readFileSync, existsSync, writeFileSync, mkdirSync, statSync } from "node:fs"
import { join } from "node:path"
import { tmpdir } from "node:os"
import {
  DEFAULT_CWD,
  createLogger, withTimeout, loadMcpConfig, validateCwd,
} from "./lib/qdrant.mjs"
import {
  CODE_SIGNALS, DOCS_SIGNALS, MEM_SIGNALS,
  SEARCH_TIMEOUT_MS, MEM_LIMIT,
  getCache, setCache,
  searchQdrant, searchMemory, formatMemory,
} from "./lib/search.mjs"
import { extractReasoning, findTranscriptPath } from "./lib/transcript.mjs"

const { warn, info } = createLogger("pre-tool-context.mjs")

const MIN_REASONING_LEN = parseInt(process.env.HOOK_MIN_REASONING_LEN, 10) || 20
const GUARD_TTL_MS = parseInt(process.env.HOOK_GUARD_TTL_MS, 10) || 60000
const CACHE_PREFIX = "ptc-"

const mcpConfig = loadMcpConfig({ warn })

// ─── Read stdin ─────────────────────────────────────────────────────────────
let input = ""
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

if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) process.exit(0)

const sessionId = parsed.session_id
if (!sessionId || typeof sessionId !== "string") process.exit(0)

// ─── First-tool-per-turn guard ──────────────────────────────────────────────
// Only run once per user turn to avoid adding latency to every tool call.
const guardDir = join(tmpdir(), "pre-tool-guard")
const guardFile = join(guardDir, `${sessionId}.lock`)

try {
  if (existsSync(guardFile)) {
    const lockStat = statSync(guardFile)
    const age = Date.now() - lockStat.mtimeMs
    if (age < GUARD_TTL_MS) process.exit(0)
  }
  // Create or update lock file
  if (!existsSync(guardDir)) mkdirSync(guardDir, { recursive: true })
  writeFileSync(guardFile, String(Date.now()))
} catch {
  // Guard failure is non-fatal, proceed with search
}

// ─── Locate transcript and extract reasoning ────────────────────────────────
const transcriptPath = parsed.transcript_path || findTranscriptPath(sessionId)
if (!transcriptPath) {
  warn("no_transcript", { sessionId })
  process.exit(0)
}

const reasoning = extractReasoning(transcriptPath)
if (!reasoning || reasoning.length < MIN_REASONING_LEN) {
  // Reasoning too short or empty. Try tool_input as fallback query.
  const toolInput = parsed.tool_input || {}
  const fallbackQuery = toolInput.command || toolInput.pattern || toolInput.file_path || toolInput.query || ""
  if (!fallbackQuery || fallbackQuery.length < MIN_REASONING_LEN) process.exit(0)

  // Use fallback but skip if it's a trivial path or command
  info("fallback_to_tool_input", { len: fallbackQuery.length })
}

const query = reasoning && reasoning.length >= MIN_REASONING_LEN
  ? reasoning
  : (parsed.tool_input?.command || parsed.tool_input?.pattern || parsed.tool_input?.file_path || parsed.tool_input?.query || "")

if (!query || query.length < MIN_REASONING_LEN) process.exit(0)

// ─── Check dedup cache ──────────────────────────────────────────────────────
const cacheKey = CACHE_PREFIX + query
const cached = getCache(cacheKey)
if (cached) {
  const output = {
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      additionalContext: cached,
    },
  }
  process.stdout.write(JSON.stringify(output))
  process.exit(0)
}

// ─── Signal classification ──────────────────────────────────────────────────
let searchCode = CODE_SIGNALS.test(query)
let searchDocs = DOCS_SIGNALS.test(query)
const searchMem = MEM_SIGNALS.test(query)

// Fallback: no signals + > 30 chars = code + docs (same logic as context.mjs)
if (!searchCode && !searchDocs && !searchMem) {
  if (query.length <= 30) process.exit(0)
  searchCode = true
  searchDocs = true
}

const cwd = validateCwd(parsed.cwd || DEFAULT_CWD, { warn })

// ─── Search ─────────────────────────────────────────────────────────────────
const startTime = Date.now()
withTimeout(
  (async () => {
    const parts = []
    const promises = []

    if (searchCode || searchDocs) {
      promises.push(
        searchQdrant(query, { searchCode, searchDocs, cwd, mcpConfig })
          .then((ctx) => { if (ctx) parts.push(`## Code Context (from reasoning)${ctx}`) })
          .catch((e) => { warn("qdrant_error", { error: e.message }) })
      )
    }

    if (searchMem) {
      promises.push(
        searchMemory(query, MEM_LIMIT)
          .then((obs) => { const m = formatMemory(obs); if (m) parts.push(m) })
          .catch((e) => { warn("mem_error", { error: e.message }) })
      )
    }

    await Promise.all(promises)

    if (!parts.length) process.exit(0)

    const contextText = parts.join("\n")
    setCache(cacheKey, contextText)

    const output = {
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        additionalContext: contextText,
      },
    }

    process.stdout.write(JSON.stringify(output))
    info("search_complete", {
      duration_ms: Date.now() - startTime,
      source: reasoning && reasoning.length >= MIN_REASONING_LEN ? "reasoning" : "tool_input",
      signals: { code: searchCode, docs: searchDocs, mem: searchMem },
    })
  })(),
  SEARCH_TIMEOUT_MS,
).catch((e) => {
  if (e.message === "timeout") warn("hook_search_timeout")
  process.exit(0)
})
