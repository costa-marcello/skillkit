// Shared search logic for Claude Code hooks.
//
// Extracted from context.mjs so that multiple hooks can reuse signal
// detection, caching, and search functions without duplicating code.
//
// Key difference from context.mjs: searchQdrant accepts mcpConfig as
// an explicit parameter instead of relying on a module-level closure.

import { readFileSync, existsSync, writeFileSync, mkdirSync } from "node:fs"
import { join } from "node:path"
import { request } from "node:http"
import { createHash } from "node:crypto"
import { tmpdir } from "node:os"
import {
  MCP_SERVER_BUILD,
  createLogger, withTimeout, setQdrantEnv,
} from "./qdrant.mjs"

const { warn, info } = createLogger("search.mjs")

// ─── Constants (configurable via env vars) ───────────────────────────────────
export const MAX_CONTEXT = parseInt(process.env.HOOK_MAX_CONTEXT, 10) || 6000
export const MIN_PROMPT_LEN = parseInt(process.env.HOOK_MIN_PROMPT_LEN, 10) || 15
export const SEARCH_TIMEOUT_MS = parseInt(process.env.HOOK_SEARCH_TIMEOUT, 10) || 9000
export const CLI_TIMEOUT_MS = parseInt(process.env.HOOK_CLI_TIMEOUT, 10) || 15000
export const CODE_LIMIT = parseInt(process.env.HOOK_CODE_LIMIT, 10) || 3
export const DOCS_LIMIT = parseInt(process.env.HOOK_DOCS_LIMIT, 10) || 3
export const MEM_LIMIT = parseInt(process.env.HOOK_MEM_LIMIT, 10) || 5
export const MIN_SCORE = parseFloat(process.env.HOOK_MIN_SCORE) || 0.55
export const DOCS_COLLECTION = process.env.HOOK_DOCS_COLLECTION || "project-docs"

export const MEM_WORKER = process.env.MEM_WORKER_URL || "http://127.0.0.1:37777"

// ─── Cache constants ─────────────────────────────────────────────────────────
export const CACHE_TTL_MS = 30000
export const CACHE_DIR = join(tmpdir(), "context-hook-cache")

// ─── Signal patterns ─────────────────────────────────────────────────────────
export const SKIP_PATTERNS =
  /^(thanks|thank you|hello|hi|hey|ok|okay|yes|no|sure|please|commit|push|done|good|great|nice|perfect|got it|sounds good|go ahead|yes please|no thanks|that works|looks good|ship it|lgtm|do it|go for it|confirmed?|approved?|makes sense|understood|i see|right|correct|exactly|agreed|yep|nope|nah|not yet|hold on|wait|stop|cancel|never ?mind)$/i

// Qdrant signals: code-level questions about files, packages, implementations
// Word boundaries on common verbs to prevent false positives from substrings
export const CODE_SIGNALS =
  /\.(ts|tsx|js|jsx|mjs|mts|cjs|json)\b|packages\/|src\/|\bfix\b|\brefactor\b|\bimplement\b|\bdebug\b|\badd\b|\bremove\b|\bdelete\b|\bupdate\b|\bchange\b|\bmodify\b|opencode|desktop|plugin|sdk|util[ /]|function |class |import |export |\berror\b|\bbug\b|crash |fail|provider|session|tool|handler|component|route|endpoint|server|client|type \w|interface \w|const |async /i

// Knowledge signals: merged docs + memory triggers.
// When a knowledge signal fires, both Qdrant docs AND claude-mem are searched.
//
// Taxonomy:
//   Types: bug fix, feature, refactor, discovery, decision, change
//   Concepts: how it works, why it exists, what changed, problem/solution, gotcha, pattern, trade-off
export const KNOWLEDGE_SIGNALS = new RegExp([
  // ── Documentation / architecture patterns ──────────────────────
  "how ", "why ", "what is",
  "architecture", "roadmap", "planning", "workflow",
  "rule", "principle", "guide", "document", "explain", "overview",
  "design", "strategy", "milestone", "phase", "requirement",
  // ── How it works ───────────────────────────────────────────────
  "how did (we|i|you)", "how does .+ work", "how was .+ (built|done|fixed|implemented)",
  "how .+ works", "what does .+ do",
  // ── Why it exists ──────────────────────────────────────────────
  "why did (we|i|you)", "why was .+ (built|added|chosen|created|needed)",
  "reason (for|behind|why)", "what motivated", "what drove",
  // ── What changed ───────────────────────────────────────────────
  "what changed", "what was (the|that) (fix|change|update|refactor)",
  "when we (fixed|added|changed|refactored|built|removed|updated|implemented)",
  "what went into", "what got (changed|updated|removed|added|fixed)",
  // ── Problem / solution ─────────────────────────────────────────
  "what (broke|crash|fail|went wrong|problem|issue|caused)",
  "root cause", "work.?around", "bug (in|with|from)",
  "what problem .+ solve", "what .+ solve", "solution (for|to|was)",
  // ── Gotcha ─────────────────────────────────────────────────────
  "any (gotcha|issue|problem|caveat|pitfall|trap|catch)",
  "watch out", "careful with", "beware", "heads up",
  "surprise", "unexpected", "caught us",
  // ── Pattern / approach / convention ────────────────────────────
  "pattern (for|in|we|used)", "pattern",
  "approach (for|to|we)", "approach",
  "convention (for|in|we)", "convention",
  "how .+ (structured|organised|organized)",
  // ── Trade-off / decision ───────────────────────────────────────
  "trade.?off", "chose .+ (over|instead)", "decided ",
  "decision (about|to|on)", "decision",
  "pros.?cons", "alternative",
  "compared .+ (to|with|vs)", "weighed",
  // ── Temporal ───────────────────────────────────────────────────
  "previously ", "last time", "before we", "earlier .+ session",
  "lesson", "learned", "discovery", "discovered",
  "found out", "turned out", "realized",
  "broke ", "broken ",
].join("|"), "i")

// Backward-compatible aliases (used by unregistered pre-tool-context.mjs)
export const DOCS_SIGNALS = KNOWLEDGE_SIGNALS
export const MEM_SIGNALS = KNOWLEDGE_SIGNALS

// ─── Result cache (30s TTL, temp file based) ─────────────────────────────────
export function getCacheKey(prompt) {
  return createHash("md5").update(prompt).digest("hex").slice(0, 12)
}

export function getCache(prompt) {
  const key = getCacheKey(prompt)
  const file = join(CACHE_DIR, `${key}.json`)
  try {
    if (!existsSync(file)) return null
    const raw = readFileSync(file, "utf-8")
    const cached = JSON.parse(raw)
    if (Date.now() - cached.ts > CACHE_TTL_MS) return null
    return cached.data
  } catch {
    return null
  }
}

export function setCache(prompt, data) {
  const key = getCacheKey(prompt)
  try {
    if (!existsSync(CACHE_DIR)) mkdirSync(CACHE_DIR, { recursive: true })
    writeFileSync(join(CACHE_DIR, `${key}.json`), JSON.stringify({ ts: Date.now(), data }))
  } catch {
    // Cache write failure is non-fatal
  }
}

// ─── Lazy-load Qdrant modules (loaded once, only when needed) ────────────────
let _qdrantModules = null
export async function getQdrantModules() {
  if (!_qdrantModules) {
    const [qm, ef, ci, sv] = await Promise.all([
      import(join(MCP_SERVER_BUILD, "qdrant", "client.js")),
      import(join(MCP_SERVER_BUILD, "embeddings", "factory.js")),
      import(join(MCP_SERVER_BUILD, "code", "indexer.js")),
      import(join(MCP_SERVER_BUILD, "embeddings", "sparse.js")),
    ])
    _qdrantModules = {
      QdrantManager: qm.QdrantManager,
      EmbeddingProviderFactory: ef.EmbeddingProviderFactory,
      CodeIndexer: ci.CodeIndexer,
      BM25SparseVectorGenerator: sv.BM25SparseVectorGenerator,
    }
  }
  return _qdrantModules
}

// ─── Memory search via claude-mem HTTP API ──────────────────────────────────
const MAX_MEM_QUERY_LEN = 2000

export function searchMemory(query, limit) {
  return new Promise((resolve) => {
    // Sanitise: truncate long queries and validate limit is a positive integer
    const safeQuery = typeof query === "string" ? query.slice(0, MAX_MEM_QUERY_LEN) : ""
    const safeLimit = Math.max(1, Math.min(Number.isFinite(limit) ? Math.floor(limit) : MEM_LIMIT, 50))

    if (!safeQuery) {
      resolve([])
      return
    }

    const timer = setTimeout(() => {
      warn("mem_timeout", { query: safeQuery.slice(0, 50) })
      req.destroy()
      resolve([])
    }, 4000)

    const encoded = encodeURIComponent(safeQuery)
    const url = `${MEM_WORKER}/api/search?query=${encoded}&limit=${safeLimit}`

    // Validate the constructed URL before sending
    let parsedUrl
    try {
      parsedUrl = new URL(url)
      if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
        clearTimeout(timer)
        warn("mem_invalid_protocol", { protocol: parsedUrl.protocol })
        resolve([])
        return
      }
    } catch {
      clearTimeout(timer)
      warn("mem_invalid_url", { url: url.slice(0, 100) })
      resolve([])
      return
    }

    const req = request(url, { timeout: 4000 }, (res) => {
      let data = ""
      res.on("data", (chunk) => { data += chunk })
      res.on("end", () => {
        clearTimeout(timer)
        try {
          const parsed = JSON.parse(data)
          const text = parsed.content?.[0]?.text || ""
          // Extract observation lines (lines with IDs and titles)
          const lines = text.split("\n")
          const observations = []
          for (const line of lines) {
            if (line.includes("| #") && !line.includes("| ID |")) {
              const match = line.match(/\| (#\S+) \| .+? \| (.+?) \| (.+?) \|/)
              if (match) {
                observations.push({ id: match[1], type: match[2].trim(), title: match[3].trim() })
              }
            }
          }
          resolve(observations)
        } catch {
          warn("mem_invalid_json")
          resolve([])
        }
      })
    })
    req.on("error", (e) => {
      clearTimeout(timer)
      warn("mem_error", { error: e.message })
      resolve([])
    })
    req.on("timeout", () => {
      clearTimeout(timer)
      warn("mem_request_timeout")
      req.destroy()
      resolve([])
    })
    req.end()
  })
}

// ─── Qdrant client pool (reuse across calls within same process) ─────────────
let _clientPool = null

function getClientPool(mcpConfig) {
  const key = `${mcpConfig.QDRANT_URL}:${(mcpConfig.QDRANT_API_KEY || "").slice(0, 8)}`
  if (_clientPool && _clientPool.key === key) return _clientPool
  return null
}

async function getOrCreateClients(mcpConfig) {
  const existing = getClientPool(mcpConfig)
  if (existing) return existing

  const { QdrantManager, EmbeddingProviderFactory, CodeIndexer, BM25SparseVectorGenerator } = await getQdrantModules()

  const qdrant = new QdrantManager(mcpConfig.QDRANT_URL, mcpConfig.QDRANT_API_KEY)
  const embeddings = EmbeddingProviderFactory.createFromEnv()
  const codeIndexer = new CodeIndexer(qdrant, embeddings, { enableHybridSearch: true })

  _clientPool = {
    key: `${mcpConfig.QDRANT_URL}:${(mcpConfig.QDRANT_API_KEY || "").slice(0, 8)}`,
    qdrant, embeddings, codeIndexer, BM25SparseVectorGenerator,
  }
  return _clientPool
}

// ─── Qdrant search function ────────────────────────────────────────────────
export async function searchQdrant(query, { searchCode, searchDocs, cwd, mcpConfig }) {
  if (!mcpConfig) throw new Error("MCP config not available (.mcp.json missing or invalid)")
  setQdrantEnv(mcpConfig, { warn })

  const { qdrant, embeddings, codeIndexer, BM25SparseVectorGenerator } = await getOrCreateClients(mcpConfig)

  const truncatedQuery = query.length > 1000 ? query.slice(0, 1000) : query
  const searches = []

  if (searchCode) {
    searches.push(
      codeIndexer
        .searchCode(cwd, truncatedQuery, { limit: CODE_LIMIT, useHybrid: true })
        .then((results) => ({ type: "code", results }))
        .catch((e) => { warn("qdrant_code_error", { error: e.message }); return { type: "code", results: [] } })
    )
  }

  if (searchDocs) {
    searches.push(
      (async () => {
        const { embedding } = await embeddings.embed(truncatedQuery)
        const collectionInfo = await qdrant.getCollectionInfo(DOCS_COLLECTION)
        if (collectionInfo.hybridEnabled) {
          const sparseGen = new BM25SparseVectorGenerator()
          const sparseVector = sparseGen.generate(truncatedQuery)
          return { type: "docs", results: await qdrant.hybridSearch(DOCS_COLLECTION, embedding, sparseVector, DOCS_LIMIT) }
        }
        return { type: "docs", results: await qdrant.search(DOCS_COLLECTION, embedding, DOCS_LIMIT) }
      })()
        .catch((e) => { warn("qdrant_docs_error", { error: e.message }); return { type: "docs", results: [] } })
    )
  }

  const settled = await Promise.all(searches)

  let context = ""
  let contextLen = 0

  function addSection(heading, lang, content) {
    const section = `\n### ${heading}\n\`\`\`${lang}\n${content}\n\`\`\`\n`
    if (contextLen + section.length > MAX_CONTEXT) return false
    context += section
    contextLen += section.length
    return true
  }

  for (const group of settled) {
    if (group.type === "code") {
      for (const r of group.results) {
        if ((r.score || 0) < MIN_SCORE) continue
        if (!r.filePath || !r.content) continue
        const heading = `${r.filePath}:${r.startLine}-${r.endLine} (${r.language}, score: ${r.score.toFixed(2)})`
        const snippet = r.content.length > 1500 ? r.content.slice(0, 1500) + "\n// ..." : r.content
        if (!addSection(heading, r.language || "typescript", snippet)) break
      }
    }

    if (group.type === "docs") {
      for (const r of group.results) {
        if ((r.score || 0) < MIN_SCORE) continue
        const payload = r.payload || {}
        const path = payload.source || payload.path || payload.file || "doc"
        const text = payload.content || payload.text || payload.document || ""
        if (!text) continue
        const heading = `${path} (score: ${r.score.toFixed(2)})`
        const snippet = text.length > 1500 ? text.slice(0, 1500) + "\n..." : text
        if (!addSection(heading, "markdown", snippet)) break
      }
    }
  }

  return context
}

// ─── Format memory results ──────────────────────────────────────────────────
export function formatMemory(observations) {
  if (!observations.length) return ""
  const lines = observations.map((o) => `- **${o.id}** ${o.type} ${o.title}`)
  return `\n## Memory Context\n${lines.join("\n")}\n`
}
