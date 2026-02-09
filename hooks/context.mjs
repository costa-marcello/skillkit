#!/usr/bin/env node

// Context Intelligence Hook + CLI
//
// Single hook, two search paths:
//   1. Qdrant — code snippets and project docs (code context)
//   2. claude-mem — past decisions, bug fixes, patterns, gotchas (project memory)
//
// Hook mode (UserPromptSubmit):
//   Reads stdin JSON, routes to Qdrant and/or claude-mem based on prompt
//   signals, outputs hookSpecificOutput JSON to stdout.
//
// CLI mode (sub-agent access):
//   node context.mjs "query"                    # auto-detect
//   node context.mjs "query" --code             # Qdrant code only
//   node context.mjs "query" --docs             # Qdrant docs only
//   node context.mjs "query" --mem              # claude-mem only
//   node context.mjs "query" --cwd /other/path  # custom cwd
//   node context.mjs "query" --dry-run          # show signal detection
//   node context.mjs --health                   # check service health

import { readFileSync } from "node:fs"
import {
  DEFAULT_CWD,
  createLogger, withTimeout, loadMcpConfig, validateCwd,
} from "./lib/qdrant.mjs"
import {
  SKIP_PATTERNS, CODE_SIGNALS, KNOWLEDGE_SIGNALS,
  MIN_PROMPT_LEN, SEARCH_TIMEOUT_MS, CLI_TIMEOUT_MS, MEM_LIMIT,
  getCache, setCache,
  searchQdrant, searchMemory, formatMemory,
} from "./lib/search.mjs"
import { extractReasoning, findTranscriptPath } from "./lib/transcript.mjs"

const { warn, info } = createLogger("context.mjs")

const mcpConfig = loadMcpConfig({ warn })
const MIN_REASONING_LEN = parseInt(process.env.HOOK_MIN_REASONING_LEN, 10) || 20

// ─── Retrieval guidance (injected alongside search results) ──────────────────
const RETRIEVAL_GUIDANCE = `## Active Retrieval

After understanding the request, search for deeper context if the pre-fetched results are insufficient:

- **Code**: \`mcp__qdrant-codemad__search_code\` for implementation details, files, and code patterns
- **Docs**: \`mcp__qdrant-codemad__hybrid_search\` with \`collection: "codemad-docs"\` for project documentation and agent history
- **Git**: \`mcp__qdrant-codemad__search_git_history\` for commit history and past changes
- **Broad**: \`mcp__qdrant-codemad__contextual_search\` for combined code + git history sweep
- **Memory**: \`mcp__plugin_claude-mem_mcp-search__search\` for past work. Query by observation type:
  Bug Fix (root cause, solution, workaround) | Feature (how it works, why it exists, what changed)
  Refactor (pattern, approach, trade-off) | Discovery (gotcha, unexpected behaviour, lesson)
  Decision (why chosen, alternatives, pros/cons) | Change (what changed, what it replaced, impact)

Route: code/implementation → search_code, docs/history → hybrid_search on codemad-docs, past decisions/patterns/gotchas → claude-mem, complex/unfamiliar → all.`

// ─── Health check mode ──────────────────────────────────────────────────────
if (process.argv.includes("--health")) {
  const startTime = Date.now()
  Promise.allSettled([
    searchQdrant("health check", { searchCode: true, searchDocs: false, cwd: DEFAULT_CWD, mcpConfig }),
    searchMemory("health check", 1),
  ]).then((results) => {
    const checks = [
      { service: "qdrant", status: results[0].status === "fulfilled" ? "ok" : "fail", error: results[0].reason?.message },
      { service: "memory", status: results[1].status === "fulfilled" ? "ok" : "fail", error: results[1].reason?.message },
    ]
    const allOk = checks.every((c) => c.status === "ok")
    console.log(JSON.stringify({ checks, duration_ms: Date.now() - startTime, ok: allOk }, null, 2))
    process.exit(allOk ? 0 : 1)
  })
} else {
  // ─── CLI mode detection ─────────────────────────────────────────────────────
  const cliQuery = process.argv[2]

  if (cliQuery && !cliQuery.startsWith("{") && !cliQuery.startsWith("--")) {
    const args = process.argv.slice(2)
    const query = args[0]

    // Dry-run: show signal detection without searching
    if (args.includes("--dry-run")) {
      const signals = {
        code: CODE_SIGNALS.test(query),
        knowledge: KNOWLEDGE_SIGNALS.test(query),
        skip: SKIP_PATTERNS.test(query.trim().replace(/[.,!?;:]+$/, "")),
        tooShort: query.length < MIN_PROMPT_LEN,
      }
      const hasSignal = signals.code || signals.knowledge
      const fallback = !hasSignal && query.length > 30
      console.log(JSON.stringify({ query, signals, wouldSearch: hasSignal || fallback, fallback }, null, 2))
      process.exit(0)
    }

    const hasCode = args.includes("--code")
    const hasDocs = args.includes("--docs")
    const hasMem = args.includes("--mem")
    const cwdIdx = args.indexOf("--cwd")
    const cwd = validateCwd(cwdIdx !== -1 && args[cwdIdx + 1] ? args[cwdIdx + 1] : DEFAULT_CWD, { warn })

    // If no flags, search all. If any flag, search only what's flagged.
    const anyFlag = hasCode || hasDocs || hasMem
    const searchCode = anyFlag ? hasCode : true
    const searchDocs = anyFlag ? hasDocs : true
    const searchMem = anyFlag ? hasMem : true

    // Check cache before searching
    const cached = getCache(query)
    if (cached) {
      process.stdout.write(cached)
    } else {
      const startTime = Date.now()
      withTimeout(
        (async () => {
          const parts = []
          const promises = []

          if (searchCode || searchDocs) {
            promises.push(
              searchQdrant(query, { searchCode, searchDocs, cwd, mcpConfig })
                .then((ctx) => { if (ctx) parts.push(`## Qdrant Context${ctx}`) })
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
          if (parts.length) {
            const output = parts.join("\n")
            setCache(query, output)
            process.stdout.write(output)
          }
          info("search_complete", { duration_ms: Date.now() - startTime, signals: { code: searchCode, docs: searchDocs, mem: searchMem } })
        })(),
        CLI_TIMEOUT_MS,
      ).catch((e) => {
        warn("cli_error", { error: e.message })
        process.exit(1)
      })
    }
  } else {
    // ─── Hook mode ──────────────────────────────────────────────────────────
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

    // Schema validation: must be a non-null, non-array object
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) process.exit(0)

    const prompt = parsed.prompt
    if (!prompt || typeof prompt !== "string") process.exit(0)

    // Fast-path skip
    if (prompt.length < MIN_PROMPT_LEN) process.exit(0)
    if (prompt.startsWith("/")) process.exit(0)

    const stripped = prompt.trim().replace(/[.,!?;:]+$/, "")
    if (SKIP_PATTERNS.test(stripped)) process.exit(0)

    // Classify prompt — skip only if no signals match AND prompt is short.
    // Longer prompts (>30 chars) with no signal match get a fallback search
    // to avoid false negatives for config/infra/tooling questions.
    let searchCode = CODE_SIGNALS.test(prompt)
    let searchKnowledge = KNOWLEDGE_SIGNALS.test(prompt)
    if (!searchCode && !searchKnowledge) {
      if (prompt.length <= 30) process.exit(0)
      searchCode = true
      searchKnowledge = true
    }

    const cwd = validateCwd(parsed.cwd || DEFAULT_CWD, { warn })

    // ─── Extract previous turn's reasoning ────────────────────────────
    let reasoningQuery = null
    const sessionId = parsed.session_id
    if (sessionId) {
      const transcriptPath = parsed.transcript_path || findTranscriptPath(sessionId)
      if (transcriptPath) {
        const reasoning = extractReasoning(transcriptPath)
        if (reasoning && reasoning.length >= MIN_REASONING_LEN && reasoning !== prompt) {
          reasoningQuery = reasoning
        }
      }
    }

    // Check cache before searching
    const cacheKey = reasoningQuery ? `r:${prompt}` : prompt
    const cached = getCache(cacheKey)
    if (cached) {
      const output = {
        hookSpecificOutput: {
          hookEventName: "UserPromptSubmit",
          additionalContext: cached,
        },
      }
      process.stdout.write(JSON.stringify(output))
    } else {
      const startTime = Date.now()
      withTimeout(
        (async () => {
          const parts = []

          // Qdrant and mem searches run in parallel
          const promises = []

          if (searchCode || searchKnowledge) {
            promises.push(
              searchQdrant(prompt, { searchCode: true, searchDocs: true, cwd, mcpConfig })
                .then((ctx) => { if (ctx) parts.push(`## Qdrant Context${ctx}`) })
                .catch((e) => { warn("qdrant_error", { error: e.message }) })
            )
          }

          if (searchKnowledge) {
            promises.push(
              searchMemory(prompt, MEM_LIMIT)
                .then((obs) => { const m = formatMemory(obs); if (m) parts.push(m) })
                .catch((e) => { warn("mem_error", { error: e.message }) })
            )
          }

          // Reasoning-based search (parallel with prompt search)
          if (reasoningQuery) {
            let rCode = CODE_SIGNALS.test(reasoningQuery)
            let rKnowledge = KNOWLEDGE_SIGNALS.test(reasoningQuery)
            if (!rCode && !rKnowledge && reasoningQuery.length > 30) {
              rCode = true; rKnowledge = true
            }
            if (rCode || rKnowledge) {
              promises.push(
                searchQdrant(reasoningQuery, { searchCode: true, searchDocs: true, cwd, mcpConfig })
                  .then((ctx) => { if (ctx) parts.push(`## Reasoning Context${ctx}`) })
                  .catch((e) => { warn("reasoning_qdrant_error", { error: e.message }) })
              )
            }
            if (rKnowledge) {
              promises.push(
                searchMemory(reasoningQuery, MEM_LIMIT)
                  .then((obs) => { const m = formatMemory(obs); if (m) parts.push(`## Reasoning Memory${m}`) })
                  .catch((e) => { warn("reasoning_mem_error", { error: e.message }) })
              )
            }
          }

          await Promise.all(promises)

          if (!parts.length) process.exit(0)

          // Prepend retrieval guidance so Claude knows how to search actively
          parts.unshift(RETRIEVAL_GUIDANCE)

          const contextText = parts.join("\n")
          setCache(cacheKey, contextText)

          const output = {
            hookSpecificOutput: {
              hookEventName: "UserPromptSubmit",
              additionalContext: contextText,
            },
          }

          process.stdout.write(JSON.stringify(output))
          info("search_complete", {
            duration_ms: Date.now() - startTime,
            signals: { code: searchCode, knowledge: searchKnowledge },
            hasReasoning: !!reasoningQuery,
          })
        })(),
        SEARCH_TIMEOUT_MS,
      ).catch((e) => {
        if (e.message === "timeout") warn("hook_search_timeout")
        process.exit(0)
      })
    }
  }
}
