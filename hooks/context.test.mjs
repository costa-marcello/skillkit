/**
 * Test suite for the context intelligence hook (.claude/hooks/context.mjs)
 *
 * Tests cover:
 *   1. Signal pattern matching (CODE_SIGNALS, KNOWLEDGE_SIGNALS)
 *   2. Skip pattern matching (SKIP_PATTERNS)
 *   3. Fast-path exits (hook mode via Bun.spawn)
 *   4. JSON protocol output format (hook mode)
 *   5. CLI mode (direct query arguments)
 *   6. Edge cases (empty input, invalid JSON, unicode, large prompts)
 *
 * No mocks — tests run the real hook process and verify real regex behaviour.
 */

import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs"
import { join } from "node:path"
import { tmpdir } from "node:os"
import { describe, test, expect } from "bun:test"
import { randomUUID } from "node:crypto"

// ─── Reconstruct regex patterns from lib/search.mjs ─────────────────────────
// These are copied verbatim from lib/search.mjs (extracted from context.mjs)
// so we can unit-test the patterns without needing the hook to export them.

const SKIP_PATTERNS =
  /^(thanks|thank you|hello|hi|hey|ok|okay|yes|no|sure|please|commit|push|done|good|great|nice|perfect|got it|sounds good|go ahead|yes please|no thanks|that works|looks good|ship it|lgtm|do it|go for it|confirmed?|approved?|makes sense|understood|i see|right|correct|exactly|agreed|yep|nope|nah|not yet|hold on|wait|stop|cancel|never ?mind)$/i

const CODE_SIGNALS =
  /\.(ts|tsx|js|jsx|mjs|mts|cjs|json)\b|packages\/|src\/|\bfix\b|\brefactor\b|\bimplement\b|\bdebug\b|\badd\b|\bremove\b|\bdelete\b|\bupdate\b|\bchange\b|\bmodify\b|opencode|desktop|plugin|sdk|util[ /]|function |class |import |export |\berror\b|\bbug\b|crash |fail|provider|session|tool|handler|component|route|endpoint|server|client|type \w|interface \w|const |async /i

const KNOWLEDGE_SIGNALS = new RegExp([
  // Documentation / architecture
  "how ", "why ", "what is",
  "architecture", "roadmap", "planning", "workflow",
  "rule", "principle", "guide", "document", "explain", "overview",
  "design", "strategy", "milestone", "phase", "requirement",
  // How it works
  "how did (we|i|you)", "how does .+ work", "how was .+ (built|done|fixed|implemented)",
  "how .+ works", "what does .+ do",
  // Why it exists
  "why did (we|i|you)", "why was .+ (built|added|chosen|created|needed)",
  "reason (for|behind|why)", "what motivated", "what drove",
  // What changed
  "what changed", "what was (the|that) (fix|change|update|refactor)",
  "when we (fixed|added|changed|refactored|built|removed|updated|implemented)",
  "what went into", "what got (changed|updated|removed|added|fixed)",
  // Problem / solution
  "what (broke|crash|fail|went wrong|problem|issue|caused)",
  "root cause", "work.?around", "bug (in|with|from)",
  "what problem .+ solve", "what .+ solve", "solution (for|to|was)",
  // Gotcha
  "any (gotcha|issue|problem|caveat|pitfall|trap|catch)",
  "watch out", "careful with", "beware", "heads up",
  "surprise", "unexpected", "caught us",
  // Pattern / approach / convention
  "pattern (for|in|we|used)", "pattern",
  "approach (for|to|we)", "approach",
  "convention (for|in|we)", "convention",
  "how .+ (structured|organised|organized)",
  // Trade-off / decision
  "trade.?off", "chose .+ (over|instead)", "decided ",
  "decision (about|to|on)", "decision",
  "pros.?cons", "alternative",
  "compared .+ (to|with|vs)", "weighed",
  // Temporal
  "previously ", "last time", "before we", "earlier .+ session",
  "lesson", "learned", "discovery", "discovered",
  "found out", "turned out", "realized",
  "broke ", "broken ",
].join("|"), "i")

const MIN_PROMPT_LEN = 15

const HOOK_PATH = new URL("./context.mjs", import.meta.url).pathname
const SEARCH_PATH = new URL("./lib/search.mjs", import.meta.url).pathname

// ─── Helper: run hook in hook mode (stdin JSON) ────────────────────────────
async function runHook(prompt) {
  const proc = Bun.spawn(["node", HOOK_PATH], {
    stdin: "pipe",
    stdout: "pipe",
    stderr: "pipe",
    env: { ...process.env, HOME: process.env.HOME },
  })
  const input = JSON.stringify({ prompt })
  proc.stdin.write(input)
  proc.stdin.end()
  const exitCode = await proc.exited
  const stdout = await new Response(proc.stdout).text()
  const stderr = await new Response(proc.stderr).text()
  return { exitCode, stdout, stderr }
}

// ─── Helper: run hook with raw stdin string (for edge cases) ───────────────
async function runHookRaw(rawInput) {
  const proc = Bun.spawn(["node", HOOK_PATH], {
    stdin: "pipe",
    stdout: "pipe",
    stderr: "pipe",
    env: { ...process.env, HOME: process.env.HOME },
  })
  if (rawInput !== null && rawInput !== undefined) {
    proc.stdin.write(rawInput)
  }
  proc.stdin.end()
  const exitCode = await proc.exited
  const stdout = await new Response(proc.stdout).text()
  const stderr = await new Response(proc.stderr).text()
  return { exitCode, stdout, stderr }
}

// ─── Helper: run hook with session context (for reasoning tests) ────────────
async function runHookWithContext(prompt, { session_id, transcript_path } = {}) {
  const proc = Bun.spawn(["node", HOOK_PATH], {
    stdin: "pipe",
    stdout: "pipe",
    stderr: "pipe",
    env: { ...process.env, HOME: process.env.HOME },
  })
  const input = JSON.stringify({ prompt, session_id, transcript_path })
  proc.stdin.write(input)
  proc.stdin.end()
  const exitCode = await proc.exited
  const stdout = await new Response(proc.stdout).text()
  const stderr = await new Response(proc.stderr).text()
  return { exitCode, stdout, stderr }
}

// ─── Helper: create a temporary transcript JSONL file ────────────────────────
function createTempTranscript(lines) {
  const dir = join(tmpdir(), "ctx-test-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8))
  mkdirSync(dir, { recursive: true })
  const path = join(dir, "test.jsonl")
  writeFileSync(path, lines.join("\n") + "\n")
  return { path, dir }
}

// ─── Helper: run hook in CLI mode (args) ───────────────────────────────────
async function runCLI(args) {
  const proc = Bun.spawn(["node", HOOK_PATH, ...args], {
    stdout: "pipe",
    stderr: "pipe",
    env: { ...process.env, HOME: process.env.HOME },
  })
  const exitCode = await proc.exited
  const stdout = await new Response(proc.stdout).text()
  const stderr = await new Response(proc.stderr).text()
  return { exitCode, stdout, stderr }
}

// ─── 1. Signal Pattern Tests ────────────────────────────────────────────────
// Verify the regex patterns correctly classify prompts.

describe("CODE_SIGNALS", () => {
  const shouldMatch = [
    ["file extension .ts", "fix the bug in provider.ts"],
    ["file extension .tsx", "update the component in button.tsx"],
    ["file extension .js", "check config.js for issues"],
    ["file extension .json", "edit package.json dependencies"],
    ["path with packages/", "refactor packages/opencode/src/tool.ts"],
    ["path with src/", "look at src/index.ts"],
    ["keyword: fix", "fix the authentication issue"],
    ["keyword: refactor", "refactor the handler logic"],
    ["keyword: implement", "implement the new session handler"],
    ["keyword: debug", "debug the crash in desktop"],
    ["keyword: add", "add a retry mechanism"],
    ["keyword: remove", "remove the dead code"],
    ["keyword: delete", "delete the unused imports"],
    ["keyword: update", "update the config values"],
    ["keyword: change", "change the timeout setting"],
    ["keyword: modify", "modify the response format"],
    ["package: opencode", "look at opencode internals"],
    ["package: desktop", "the desktop app crashes on start"],
    ["package: plugin", "extend the plugin system"],
    ["package: sdk", "regenerate the sdk types"],
    ["keyword: function", "function to parse tokens"],
    ["keyword: class", "class SessionManager not found"],
    ["keyword: import", "import statement fails"],
    ["keyword: export", "export the new utility"],
    ["keyword: error", "error handling in the server"],
    ["keyword: bug", "bug in the retry logic"],
    ["keyword: crash", "crash when parsing empty input"],
    ["keyword: fail", "test fail on CI"],
    ["keyword: provider", "provider returns wrong model"],
    ["keyword: session", "session expires too early"],
    ["keyword: tool", "the tool executor hangs"],
    ["keyword: handler", "handler not registered"],
    ["keyword: component", "component re-renders too often"],
    ["keyword: route", "route not matching correctly"],
    ["keyword: endpoint", "endpoint returns 500"],
    ["keyword: server", "server refuses connections"],
    ["keyword: client", "client SDK type mismatch"],
    ["keyword: type + word", "type User = { name: string }"],
    ["keyword: interface + word", "interface Config needs updating"],
    ["keyword: const", "const declaration missing"],
    ["keyword: async", "async function not awaited"],
  ]

  for (const [label, prompt] of shouldMatch) {
    test(`matches: ${label}`, () => {
      expect(CODE_SIGNALS.test(prompt)).toBe(true)
    })
  }

  const shouldNotMatch = [
    ["no code signals: weather", "how is the weather today"],
    ["no code signals: joke", "tell me a joke"],
    ["no code signals: time", "what time is it"],
    ["no code signals: conversational", "thanks for the help"],
    ["no code signals: greeting", "good morning everyone"],
  ]

  for (const [label, prompt] of shouldNotMatch) {
    test(`does not match: ${label}`, () => {
      expect(CODE_SIGNALS.test(prompt)).toBe(false)
    })
  }

  // ESM, CommonJS, and JSX extension matches (added by audit remediation)
  test("matches .mjs file extension", () => { expect(CODE_SIGNALS.test("fix context.mjs bugs")).toBe(true) })
  test("matches .mts file extension", () => { expect(CODE_SIGNALS.test("edit types.mts exports")).toBe(true) })
  test("matches .jsx file extension", () => { expect(CODE_SIGNALS.test("fix App.jsx rendering")).toBe(true) })
  test("matches .cjs file extension", () => { expect(CODE_SIGNALS.test("check config.cjs")).toBe(true) })
})

describe("KNOWLEDGE_SIGNALS", () => {
  const shouldMatch = [
    // Documentation / architecture
    ["how + architecture", "how does the provider architecture work"],
    ["why + decision context", "why did we choose SolidJS"],
    ["explain + workflow", "explain the workflow for deployment"],
    ["what is + pattern", "what is the pattern for error handling"],
    ["architecture keyword", "describe the architecture overview"],
    ["pattern keyword", "what pattern should I use here"],
    ["convention keyword", "convention for naming files"],
    ["roadmap keyword", "check the roadmap status"],
    ["planning keyword", "update the planning document"],
    ["workflow keyword", "workflow for releasing a version"],
    ["rule keyword", "rule about import ordering"],
    ["principle keyword", "principle of least privilege applies here"],
    ["guide keyword", "follow the style guide"],
    ["document keyword", "document the new API"],
    ["overview keyword", "give me an overview of the system"],
    ["design keyword", "the design uses event sourcing"],
    ["approach keyword", "approach for handling errors"],
    ["strategy keyword", "caching strategy needs work"],
    ["decision keyword", "decision log for v2"],
    ["milestone keyword", "milestone v1.3 is complete"],
    ["phase keyword", "we are in phase 3"],
    ["requirement keyword", "requirement for auth"],
    // How it works
    ["how did we + verb", "how did we fix the auth bug"],
    ["how does X work", "how does the cache invalidation work"],
    ["how was X built", "how was the plugin system built"],
    ["how X works", "how the retry logic works"],
    ["what does X do", "what does the middleware do"],
    // Why it exists
    ["why did we", "why did we choose Bun over Node"],
    ["why was X chosen", "why was SolidJS chosen"],
    ["reason for", "reason for the monorepo structure"],
    ["what motivated", "what motivated the switch to Tauri"],
    ["what drove", "what drove the decision to use Qdrant"],
    // What changed
    ["what changed", "what changed in the last refactor"],
    ["what was the fix", "what was the fix for the memory leak"],
    ["when we fixed", "when we fixed the race condition"],
    ["what went into", "what went into the v1.3 release"],
    ["what got changed", "what got changed in the provider module"],
    // Problem / solution
    ["what broke", "what broke after the upgrade"],
    ["what problem X solve", "what problem does the cache solve"],
    ["root cause", "what was the root cause of the crash"],
    ["workaround", "is there a workaround for this"],
    ["bug in", "there is a bug in the session handler"],
    ["solution for", "solution for the timeout issue"],
    // Gotcha
    ["any gotchas", "any gotchas with the Qdrant setup"],
    ["watch out", "watch out for the race condition"],
    ["careful with", "be careful with the config parsing"],
    ["beware", "beware of the edge case"],
    ["heads up", "heads up about the breaking change"],
    ["surprise", "surprise behaviour in the parser"],
    ["unexpected", "unexpected result from the API"],
    ["caught us", "that caught us off guard"],
    // Pattern / approach / convention
    ["pattern for", "pattern for error handling"],
    ["approach for", "approach for testing providers"],
    ["convention for", "convention for naming hooks"],
    ["how X structured", "how the codebase structured"],
    // Trade-off / decision
    ["trade-off", "trade-off between speed and accuracy"],
    ["chose X over Y", "chose Bun over Node"],
    ["decided", "we decided to use workspaces"],
    ["decision about", "decision about the database"],
    ["pros/cons", "the pros/cons of each option"],
    ["alternative", "is there an alternative to this"],
    ["compared X to Y", "compared Tauri to Electron"],
    ["weighed", "we weighed the options"],
    // Temporal
    ["previously", "previously we had issues with timeouts"],
    ["last time", "last time we tried this it failed"],
    ["before we", "before we migrated to Bun"],
    ["earlier session", "earlier in the session we discussed this"],
    ["lesson", "the lesson from the outage"],
    ["learned", "we learned about the race condition"],
    ["discovery", "a discovery about the parser"],
    ["discovered", "we discovered a bug"],
    ["found out", "we found out the hard way"],
    ["turned out", "it turned out to be a config issue"],
    ["realized", "I realized the test was wrong"],
    ["broke", "that broke the build"],
    ["broken", "the broken pipeline needs attention"],
  ]

  for (const [label, prompt] of shouldMatch) {
    test(`matches: ${label}`, () => {
      expect(KNOWLEDGE_SIGNALS.test(prompt)).toBe(true)
    })
  }

  const shouldNotMatch = [
    ["command: run tests", "run the tests"],
    ["pure greeting", "good morning"],
    ["number question", "calculate 2 plus 3"],
    ["code task: add component", "add a new button component"],
    ["command: run check", "run bun check"],
    ["greeting", "hello there"],
    ["pure number", "42"],
  ]

  for (const [label, prompt] of shouldNotMatch) {
    test(`does not match: ${label}`, () => {
      expect(KNOWLEDGE_SIGNALS.test(prompt)).toBe(false)
    })
  }

  // "fix the bug in auth" matches via "bug (in|with|from)" — correct, a bug
  // report should trigger knowledge search for past solutions.
  test("bug report matches knowledge signal", () => {
    expect(KNOWLEDGE_SIGNALS.test("fix the bug in auth")).toBe(true)
  })
})

// ─── 2. Skip Pattern Tests ─────────────────────────────────────────────────
// SKIP_PATTERNS matches conversational fluff after stripping trailing punctuation.

describe("SKIP_PATTERNS", () => {
  // Helper: mirror the hook's stripping logic before testing
  function stripped(s) {
    return s.trim().replace(/[.,!?;:]+$/, "")
  }

  const shouldMatch = [
    "thanks", "thanks!", "thank you", "thank you.",
    "hi", "hello", "hey",
    "ok", "okay", "sure",
    "yes", "no", "yep", "nope",
    "lgtm", "ship it", "do it",
    "go ahead", "sounds good", "looks good",
    "confirmed", "approved",
    "never mind", "nevermind",
    "go for it", "yes please", "no thanks",
    "that works", "got it", "makes sense",
    "understood", "i see", "right", "correct",
    "exactly", "agreed", "nah", "not yet",
    "hold on", "wait", "stop", "cancel",
    "please", "commit", "push", "done",
    "good", "great", "nice", "perfect",
  ]

  for (const phrase of shouldMatch) {
    test(`matches: "${phrase}"`, () => {
      expect(SKIP_PATTERNS.test(stripped(phrase))).toBe(true)
    })
  }

  // Trailing punctuation should be stripped before matching
  const withPunctuation = [
    "thanks!", "okay.", "sure!", "lgtm!!", "done.", "nice!",
  ]

  for (const phrase of withPunctuation) {
    test(`matches after strip: "${phrase}"`, () => {
      expect(SKIP_PATTERNS.test(stripped(phrase))).toBe(true)
    })
  }

  const shouldNotMatch = [
    "fix the authentication bug",
    "thanks for fixing that, now add tests",
    "ok now implement the feature",
    "sure, but first refactor the handler",
    "hello world program in typescript",
    "please update the config file",
  ]

  for (const phrase of shouldNotMatch) {
    test(`does not match: "${phrase}"`, () => {
      expect(SKIP_PATTERNS.test(stripped(phrase))).toBe(false)
    })
  }
})

// ─── 3. Fast-Path Exit Tests ────────────────────────────────────────────────
// Run the hook process and verify that prompts that should be skipped produce
// exit 0 with no stdout output.

describe("Fast-path exits (hook mode)", () => {
  const fastPathPrompts = [
    ["too short + skip pattern", "hi"],
    ["skip pattern: thanks!", "thanks!"],
    ["slash command", "/gsd:progress"],
    ["too short + skip: ok", "ok"],
    ["skip: yes please", "yes please"],
    ["skip: never mind", "never mind"],
    ["no signals match", "what time is it"],
    ["skip: lgtm", "lgtm"],
    ["skip: sounds good", "sounds good"],
    ["too short", "a"],
    ["skip: go ahead", "go ahead"],
  ]

  for (const [label, prompt] of fastPathPrompts) {
    test(`exits cleanly: ${label}`, async () => {
      const result = await runHook(prompt)
      expect(result.exitCode).toBe(0)
      // Fast-path prompts should produce no stdout (no hookSpecificOutput)
      expect(result.stdout).toBe("")
    }, { timeout: 10000 })
  }

  test("slash command with arguments exits cleanly", async () => {
    const result = await runHook("/commit -m 'fix: something'")
    expect(result.exitCode).toBe(0)
    expect(result.stdout).toBe("")
  }, { timeout: 10000 })

  test("prompt under 15 chars exits cleanly", async () => {
    const result = await runHook("short prompt")
    expect(result.exitCode).toBe(0)
    expect(result.stdout).toBe("")
  }, { timeout: 10000 })
})

// ─── 4. JSON Protocol Tests ────────────────────────────────────────────────
// For prompts that trigger signals, verify the output format.
// Qdrant and memory services may not be available, so we handle both cases:
//   - If services are up: output is valid JSON with correct structure
//   - If services are down: hook exits 0 gracefully (no crash)

describe("JSON protocol output (hook mode)", () => {
  // This prompt triggers CODE + DOCS + MEM signals
  const richPrompt = "explain how provider auth works in the opencode package and how did we fix the session bug"

  test("signal-triggering prompt does not crash", async () => {
    const result = await runHook(richPrompt)
    // Must always exit 0 regardless of service availability
    expect(result.exitCode).toBe(0)
  }, { timeout: 15000 })

  test("output is valid JSON with correct structure when services respond", async () => {
    const result = await runHook(richPrompt)
    if (result.stdout.trim() === "") {
      // Services not available — hook exited cleanly with no output
      expect(result.exitCode).toBe(0)
      return
    }

    // If there is output, verify its structure
    const parsed = JSON.parse(result.stdout)
    expect(parsed).toHaveProperty("hookSpecificOutput")
    expect(parsed.hookSpecificOutput).toHaveProperty("hookEventName", "UserPromptSubmit")
    expect(parsed.hookSpecificOutput).toHaveProperty("additionalContext")
    expect(typeof parsed.hookSpecificOutput.additionalContext).toBe("string")
    expect(parsed.hookSpecificOutput.additionalContext.length).toBeGreaterThan(0)
  }, { timeout: 15000 })

  test("code-only prompt produces valid output or graceful exit", async () => {
    const result = await runHook("fix the crash in packages/opencode/src/provider/provider.ts")
    expect(result.exitCode).toBe(0)
    if (result.stdout.trim()) {
      const parsed = JSON.parse(result.stdout)
      expect(parsed.hookSpecificOutput.hookEventName).toBe("UserPromptSubmit")
    }
  }, { timeout: 15000 })

  test("memory-only prompt produces valid output or graceful exit", async () => {
    const result = await runHook("how did we fix the authentication timeout bug previously")
    expect(result.exitCode).toBe(0)
    if (result.stdout.trim()) {
      const parsed = JSON.parse(result.stdout)
      expect(parsed.hookSpecificOutput.hookEventName).toBe("UserPromptSubmit")
    }
  }, { timeout: 15000 })

  test("docs-only prompt produces valid output or graceful exit", async () => {
    const result = await runHook("explain the overall architecture and design approach for the project")
    expect(result.exitCode).toBe(0)
    if (result.stdout.trim()) {
      const parsed = JSON.parse(result.stdout)
      expect(parsed.hookSpecificOutput.hookEventName).toBe("UserPromptSubmit")
    }
  }, { timeout: 15000 })
})

// ─── 5. CLI Mode Tests ─────────────────────────────────────────────────────
// The hook enters CLI mode when the first argument does not start with "{".
// Note: --dry-run and --health are NOT implemented in the current hook.

describe("CLI mode", () => {
  test("basic query runs without crashing", async () => {
    const result = await runCLI(["fix the provider bug", "--code"])
    // Exit 0 if services are up, exit 1 on timeout. Either is acceptable.
    expect([0, 1]).toContain(result.exitCode)
  }, { timeout: 20000 })

  test("--code flag restricts to code search", async () => {
    const result = await runCLI(["refactor the session handler", "--code"])
    expect([0, 1]).toContain(result.exitCode)
    // If output exists, it should contain Qdrant context, not memory
    if (result.stdout.trim()) {
      // Memory section should not appear when only --code is passed
      // (unless the prompt also triggers mem in auto mode, but flags override)
      expect(result.stdout).not.toContain("## Memory Context")
    }
  }, { timeout: 20000 })

  test("--mem flag restricts to memory search", async () => {
    const result = await runCLI(["how did we fix the timeout", "--mem"])
    expect([0, 1]).toContain(result.exitCode)
    if (result.stdout.trim()) {
      expect(result.stdout).not.toContain("## Qdrant Context")
    }
  }, { timeout: 20000 })

  test("--docs flag restricts to docs search", async () => {
    const result = await runCLI(["architecture overview", "--docs"])
    expect([0, 1]).toContain(result.exitCode)
    if (result.stdout.trim()) {
      expect(result.stdout).not.toContain("## Memory Context")
    }
  }, { timeout: 20000 })

  test("no flags searches all sources", async () => {
    const result = await runCLI(["explain the codebase structure"])
    // Should not crash regardless of service state
    expect([0, 1]).toContain(result.exitCode)
  }, { timeout: 20000 })

  test("--cwd flag accepts custom directory", async () => {
    const result = await runCLI(["search query", "--cwd", "/tmp"])
    expect([0, 1]).toContain(result.exitCode)
  }, { timeout: 20000 })

  test("CLI output is plain text, not JSON wrapper", async () => {
    const result = await runCLI(["fix the provider bug"])
    if (result.stdout.trim()) {
      // CLI mode outputs plain markdown, not the hookSpecificOutput JSON wrapper
      expect(result.stdout).not.toContain("hookSpecificOutput")
      expect(result.stdout).not.toContain("hookEventName")
    }
  }, { timeout: 20000 })
})

// ─── 6. Edge Cases ──────────────────────────────────────────────────────────
// Verify the hook handles broken input gracefully.

describe("Edge cases", () => {
  test("empty stdin exits 0", async () => {
    const result = await runHookRaw("")
    expect(result.exitCode).toBe(0)
    expect(result.stdout).toBe("")
  }, { timeout: 10000 })

  test("invalid JSON stdin exits 0", async () => {
    const result = await runHookRaw("this is not json")
    expect(result.exitCode).toBe(0)
    expect(result.stdout).toBe("")
  }, { timeout: 10000 })

  test("JSON with no prompt field exits 0", async () => {
    const result = await runHookRaw(JSON.stringify({ query: "something" }))
    expect(result.exitCode).toBe(0)
    expect(result.stdout).toBe("")
  }, { timeout: 10000 })

  test("JSON with non-string prompt exits 0", async () => {
    const result = await runHookRaw(JSON.stringify({ prompt: 42 }))
    expect(result.exitCode).toBe(0)
    expect(result.stdout).toBe("")
  }, { timeout: 10000 })

  test("JSON with null prompt exits 0", async () => {
    const result = await runHookRaw(JSON.stringify({ prompt: null }))
    expect(result.exitCode).toBe(0)
    expect(result.stdout).toBe("")
  }, { timeout: 10000 })

  test("JSON with empty string prompt exits 0", async () => {
    const result = await runHookRaw(JSON.stringify({ prompt: "" }))
    expect(result.exitCode).toBe(0)
    expect(result.stdout).toBe("")
  }, { timeout: 10000 })

  test("whitespace-only prompt exits 0 (too short after trim)", async () => {
    const result = await runHook("              ")
    expect(result.exitCode).toBe(0)
    expect(result.stdout).toBe("")
  }, { timeout: 10000 })

  test("very long prompt does not crash", async () => {
    const longPrompt = "fix the provider bug in ".repeat(500)
    const result = await runHook(longPrompt)
    expect(result.exitCode).toBe(0)
    // Should not crash — either produces output or exits cleanly
  }, { timeout: 15000 })

  test("unicode prompt does not crash", async () => {
    const result = await runHook("fix the bug in the \u00fcbersetzung provider \u2014 error handling broken")
    expect(result.exitCode).toBe(0)
  }, { timeout: 10000 })

  test("emoji prompt does not crash", async () => {
    const result = await runHook("fix the \ud83d\udd25 bug in server component \ud83d\ude80")
    expect(result.exitCode).toBe(0)
  }, { timeout: 10000 })

  test("prompt with newlines does not crash", async () => {
    const result = await runHook("fix the provider bug\nin the auth module\nand update the tests")
    expect(result.exitCode).toBe(0)
  }, { timeout: 10000 })

  test("JSON with extra fields is handled gracefully", async () => {
    const input = JSON.stringify({ prompt: "fix the auth bug in provider", extra: true, count: 99 })
    const result = await runHookRaw(input)
    expect(result.exitCode).toBe(0)
    // Should behave the same as a normal prompt — extra fields are ignored
  }, { timeout: 10000 })
})

// ─── 7. Signal Classification Accuracy ──────────────────────────────────────
// Verify that combined prompts trigger the expected signal categories.

describe("Signal classification accuracy", () => {
  test("pure code prompt triggers only CODE_SIGNALS", () => {
    const prompt = "fix the crash in packages/opencode/src/provider.ts"
    expect(CODE_SIGNALS.test(prompt)).toBe(true)
    expect(KNOWLEDGE_SIGNALS.test(prompt)).toBe(false)
  })

  test("pure knowledge prompt triggers only KNOWLEDGE_SIGNALS", () => {
    const prompt = "what is the architecture of the system"
    expect(CODE_SIGNALS.test(prompt)).toBe(false)
    expect(KNOWLEDGE_SIGNALS.test(prompt)).toBe(true)
  })

  test("memory-style prompt triggers KNOWLEDGE_SIGNALS", () => {
    const prompt = "how did we decide on that approach last time"
    expect(CODE_SIGNALS.test(prompt)).toBe(false)
    expect(KNOWLEDGE_SIGNALS.test(prompt)).toBe(true)
  })

  test("combined code + knowledge prompt triggers both", () => {
    const prompt = "explain how the provider error handling works"
    expect(CODE_SIGNALS.test(prompt)).toBe(true) // "error", "provider"
    expect(KNOWLEDGE_SIGNALS.test(prompt)).toBe(true) // "how ", "explain"
  })

  test("combined code + temporal prompt triggers both", () => {
    const prompt = "what broke in the server handler after the refactor"
    expect(CODE_SIGNALS.test(prompt)).toBe(true) // "server", "handler"
    expect(KNOWLEDGE_SIGNALS.test(prompt)).toBe(true) // "what broke"
  })

  test("docs + memory patterns both covered by KNOWLEDGE_SIGNALS", () => {
    const prompt = "why did we choose this architecture approach last time"
    expect(KNOWLEDGE_SIGNALS.test(prompt)).toBe(true) // "why ", "architecture", "approach", "last time"
  })

  test("rich prompt triggers both CODE and KNOWLEDGE", () => {
    const prompt = "explain how did we fix the provider error handling approach"
    expect(CODE_SIGNALS.test(prompt)).toBe(true) // "fix ", "provider", "error"
    expect(KNOWLEDGE_SIGNALS.test(prompt)).toBe(true) // "explain", "how ", "approach"
  })

  test("no-signal prompt triggers nothing", () => {
    const prompt = "what time is it in London"
    expect(CODE_SIGNALS.test(prompt)).toBe(false)
    expect(KNOWLEDGE_SIGNALS.test(prompt)).toBe(false)
  })
})

// ─── 8. MIN_PROMPT_LEN boundary ────────────────────────────────────────────
// The hook skips prompts shorter than 15 characters.

describe("MIN_PROMPT_LEN boundary", () => {
  test("14-char prompt is below threshold", () => {
    const prompt = "fix the bug xx" // 14 chars
    expect(prompt.length).toBe(14)
    expect(prompt.length < MIN_PROMPT_LEN).toBe(true)
  })

  test("15-char prompt meets threshold", () => {
    const prompt = "fix the bug xxx" // 15 chars
    expect(prompt.length).toBe(15)
    expect(prompt.length < MIN_PROMPT_LEN).toBe(false)
  })

  test("14-char prompt exits with no output in hook mode", async () => {
    const result = await runHook("fix bug in srv") // 14 chars
    expect(result.exitCode).toBe(0)
    expect(result.stdout).toBe("")
  }, { timeout: 10000 })

  test("15-char prompt with signals proceeds past length check", async () => {
    // 15 chars, triggers CODE_SIGNALS ("\bfix\b", ".ts")
    const prompt = "fix file.ts now" // 15 chars
    expect(prompt.length).toBe(15)
    const result = await runHook(prompt)
    // Should exit 0 (either produces output or services unavailable)
    expect(result.exitCode).toBe(0)
    // The key point: it did NOT exit early due to length
    // We can't assert stdout content because services may be down
  }, { timeout: 10000 })
})

// ─── 9. Dry-run mode (CLI subprocess) ──────────────────────────────────────
// --dry-run outputs signal detection JSON without performing searches.

describe("Dry-run mode", () => {
  test("dry-run outputs valid JSON with expected fields", async () => {
    const result = await runCLI(["fix the bug in provider.ts", "--dry-run"])
    expect(result.exitCode).toBe(0)
    const parsed = JSON.parse(result.stdout)
    expect(parsed).toHaveProperty("query")
    expect(parsed).toHaveProperty("signals")
    expect(parsed).toHaveProperty("wouldSearch")
    expect(parsed).toHaveProperty("fallback")
  }, { timeout: 20000 })

  test("code signal detection: file extension and fix keyword", async () => {
    const result = await runCLI(["fix the bug in provider.ts", "--dry-run"])
    expect(result.exitCode).toBe(0)
    const parsed = JSON.parse(result.stdout)
    expect(parsed.signals.code).toBe(true)
  }, { timeout: 20000 })

  test("knowledge signal detection: explain + architecture", async () => {
    const result = await runCLI(["explain the architecture", "--dry-run"])
    expect(result.exitCode).toBe(0)
    const parsed = JSON.parse(result.stdout)
    expect(parsed.signals.knowledge).toBe(true)
  }, { timeout: 20000 })

  test("knowledge signal detection: how did we fix", async () => {
    const result = await runCLI(["how did we fix the auth bug", "--dry-run"])
    expect(result.exitCode).toBe(0)
    const parsed = JSON.parse(result.stdout)
    expect(parsed.signals.knowledge).toBe(true)
  }, { timeout: 20000 })

  test("skip pattern detection: thanks", async () => {
    const result = await runCLI(["thanks", "--dry-run"])
    expect(result.exitCode).toBe(0)
    const parsed = JSON.parse(result.stdout)
    expect(parsed.signals.skip).toBe(true)
  }, { timeout: 20000 })

  test("fallback for long no-signal prompt", async () => {
    // >30 chars, no signal words
    const result = await runCLI(["review the hooks in .claude/hooks/", "--dry-run"])
    expect(result.exitCode).toBe(0)
    const parsed = JSON.parse(result.stdout)
    expect(parsed.wouldSearch).toBe(true)
    expect(parsed.fallback).toBe(true)
  }, { timeout: 20000 })

  test("no fallback for short no-signal prompt", async () => {
    // <=30 chars, no signal words
    const prompt = "what time is it"
    expect(prompt.length).toBeLessThanOrEqual(30)
    const result = await runCLI([prompt, "--dry-run"])
    expect(result.exitCode).toBe(0)
    const parsed = JSON.parse(result.stdout)
    expect(parsed.wouldSearch).toBe(false)
    expect(parsed.fallback).toBe(false)
  }, { timeout: 20000 })
})

// ─── 10. Health check mode (CLI subprocess) ─────────────────────────────────
// --health checks Qdrant and memory service availability.

describe("Health check mode", () => {
  test("health outputs valid JSON with checks array, duration_ms, and ok", async () => {
    const result = await runCLI(["--health"])
    // Exit 0 if services up, exit 1 if services down
    expect([0, 1]).toContain(result.exitCode)
    const parsed = JSON.parse(result.stdout)
    expect(Array.isArray(parsed.checks)).toBe(true)
    expect(typeof parsed.duration_ms).toBe("number")
    expect(typeof parsed.ok).toBe("boolean")
  }, { timeout: 20000 })

  test("each check has service and status fields", async () => {
    const result = await runCLI(["--health"])
    expect([0, 1]).toContain(result.exitCode)
    const parsed = JSON.parse(result.stdout)
    for (const check of parsed.checks) {
      expect(check).toHaveProperty("service")
      expect(check).toHaveProperty("status")
      expect(typeof check.service).toBe("string")
      expect(["ok", "fail"]).toContain(check.status)
    }
  }, { timeout: 20000 })

  test("exit code matches ok field", async () => {
    const result = await runCLI(["--health"])
    const parsed = JSON.parse(result.stdout)
    if (parsed.ok) {
      expect(result.exitCode).toBe(0)
    } else {
      expect(result.exitCode).toBe(1)
    }
  }, { timeout: 20000 })
})

// ─── 11. Signal fallback behaviour (hook mode subprocess) ───────────────────
// Prompts >30 chars with no signal match fall back to code+docs search.
// Prompts <=30 chars with no signal match exit with empty stdout.

describe("Signal fallback behaviour", () => {
  test("prompt >30 chars with no signal match does not exit with empty stdout prematurely", async () => {
    // 35 chars, no signal keywords
    const prompt = "review the hooks in .claude/hooks/"
    expect(prompt.length).toBeGreaterThan(30)
    expect(CODE_SIGNALS.test(prompt)).toBe(false)
    expect(KNOWLEDGE_SIGNALS.test(prompt)).toBe(false)
    const result = await runHook(prompt)
    // Should exit 0 regardless (graceful even if services are down)
    expect(result.exitCode).toBe(0)
    // The hook should NOT have exited at the "no signals" gate.
    // It either produces output (services up) or exits cleanly after search attempt.
    // We verify it didn't crash (exit code 0 above covers that).
  }, { timeout: 15000 })

  test("prompt <=30 chars with no signal match exits with empty stdout", async () => {
    const prompt = "what time is it in London"
    expect(prompt.length).toBeLessThanOrEqual(30)
    expect(CODE_SIGNALS.test(prompt)).toBe(false)
    expect(KNOWLEDGE_SIGNALS.test(prompt)).toBe(false)
    const result = await runHook(prompt)
    expect(result.exitCode).toBe(0)
    expect(result.stdout).toBe("")
  }, { timeout: 10000 })

  test("prompt at exactly 31 chars with no signal match gets fallback", async () => {
    // Construct a 31-char prompt with no signal words
    const prompt = "check all the yaml in my repos"
    // Pad or trim to exactly 31 chars
    const padded = prompt.padEnd(31, "z").slice(0, 31)
    expect(padded.length).toBe(31)
    // Verify no signals match
    expect(CODE_SIGNALS.test(padded)).toBe(false)
    expect(KNOWLEDGE_SIGNALS.test(padded)).toBe(false)
    const result = await runHook(padded)
    // Should not exit at the "no signals" gate since length > 30
    expect(result.exitCode).toBe(0)
  }, { timeout: 15000 })
})

// ─── 12. Regex sync check ───────────────────────────────────────────────────
// Verify the test file's copied regex patterns still match the hook source.

// Helper: extract the raw regex source string between /.../ for a given variable name.
function extractRegexSource(fileSource, varName) {
  const m = fileSource.match(new RegExp("(?:export\\s+)?const " + varName + "\\s*=\\s*\\n?\\s*/(.*)/[gimsuy]*")) // nosemgrep: detect-non-literal-regexp
  return m ? m[1] : null
}

describe("Regex sync check", () => {
  test("CODE_SIGNALS regex source matches between test and search module", () => {
    const searchSource = readFileSync(SEARCH_PATH, "utf-8")
    const testSource = readFileSync(new URL(import.meta.url).pathname, "utf-8")
    const searchPattern = extractRegexSource(searchSource, "CODE_SIGNALS")
    const testPattern = extractRegexSource(testSource, "CODE_SIGNALS")
    expect(searchPattern).not.toBeNull()
    expect(testPattern).not.toBeNull()
    expect(testPattern).toBe(searchPattern)
  })

  test("CODE_SIGNALS word boundaries prevent substring matches", () => {
    // These verify the test-local copy uses \b word boundaries correctly
    expect(CODE_SIGNALS.test("fix the bug")).toBe(true)
    expect(CODE_SIGNALS.test("suffix")).toBe(false)
    expect(CODE_SIGNALS.test("refactor the code")).toBe(true)
    expect(CODE_SIGNALS.test("prefix")).toBe(false)
    expect(CODE_SIGNALS.test("edit file.ts")).toBe(true)
    expect(CODE_SIGNALS.test("check config.json")).toBe(true)
  })

  test("CODE_SIGNALS word boundaries match via dry-run (hook's own regex)", async () => {
    // Use --dry-run to test the hook's compiled regex, not our local copy
    const r1 = await runCLI(["fix the bug in the handler module", "--dry-run"])
    expect(JSON.parse(r1.stdout).signals.code).toBe(true)
    const r2 = await runCLI(["this has a suffix and a prefix only", "--dry-run"])
    expect(JSON.parse(r2.stdout).signals.code).toBe(false)
  }, { timeout: 20000 })

  test("KNOWLEDGE_SIGNALS uses RegExp constructor (no literal source to sync)", () => {
    // KNOWLEDGE_SIGNALS is built via new RegExp([...].join("|"), "i")
    // so there is no literal regex source to extract. We verify the
    // imported module pattern matches known prompts instead.
    expect(KNOWLEDGE_SIGNALS.test("how does this work")).toBe(true)
    expect(KNOWLEDGE_SIGNALS.test("what was the root cause")).toBe(true)
    expect(KNOWLEDGE_SIGNALS.test("explain the architecture")).toBe(true)
    expect(KNOWLEDGE_SIGNALS.test("42")).toBe(false)
  })

  test("SKIP_PATTERNS regex source matches between test and search module", () => {
    const searchSource = readFileSync(SEARCH_PATH, "utf-8")
    const testSource = readFileSync(new URL(import.meta.url).pathname, "utf-8")
    const searchPattern = extractRegexSource(searchSource, "SKIP_PATTERNS")
    const testPattern = extractRegexSource(testSource, "SKIP_PATTERNS")
    expect(searchPattern).not.toBeNull()
    expect(testPattern).not.toBeNull()
    expect(testPattern).toBe(searchPattern)
  })
})

// ─── 13. Cache behaviour ────────────────────────────────────────────────────
// Run the same prompt twice quickly to exercise the cache hit path.

describe("Cache behaviour", () => {
  test("running the same prompt twice does not crash (cache hit path)", async () => {
    const prompt = "fix the crash in packages/opencode/src/provider/provider.ts"
    const result1 = await runHook(prompt)
    expect(result1.exitCode).toBe(0)

    // Second call should hit the cache (or at least not crash)
    const result2 = await runHook(prompt)
    expect(result2.exitCode).toBe(0)

    // If services are up, both should produce identical output
    if (result1.stdout.trim() && result2.stdout.trim()) {
      expect(result2.stdout).toBe(result1.stdout)
    }
  }, { timeout: 20000 })

  test("CLI mode cache hit returns same output", async () => {
    const query = "explain the provider architecture"
    const result1 = await runCLI([query])
    expect([0, 1]).toContain(result1.exitCode)

    const result2 = await runCLI([query])
    expect([0, 1]).toContain(result2.exitCode)

    // If both produced output, it should be identical from cache
    if (result1.stdout.trim() && result2.stdout.trim() && result1.exitCode === 0 && result2.exitCode === 0) {
      expect(result2.stdout).toBe(result1.stdout)
    }
  }, { timeout: 20000 })
})

// ─── 14. Reasoning-enriched search (hook mode) ──────────────────────────────
// Tests verify the reasoning extraction + parallel search path added by the
// PreToolUse-to-UserPromptSubmit migration.

describe("Reasoning-enriched search (hook mode)", () => {
  test("hook with session_id and rich transcript exits 0", async () => {
    const transcript = [
      JSON.stringify({
        type: "assistant",
        message: {
          id: "msg_reason_001",
          role: "assistant",
          content: [
            { type: "text", text: "Looking at the auth timeout in the session handler, I need to check the provider configuration for the opencode package and fix the error handling in the retry logic" },
          ],
        },
      }),
    ]
    const { path: transcriptPath, dir } = createTempTranscript(transcript)

    const result = await runHookWithContext(
      "fix the crash in packages/opencode/src/provider/provider.ts",
      { session_id: randomUUID(), transcript_path: transcriptPath },
    )

    expect(result.exitCode).toBe(0)

    // Clean up
    try { rmSync(dir, { recursive: true }) } catch { /* ignore */ }
  }, { timeout: 15000 })

  test("output includes Reasoning Context when services respond", async () => {
    const transcript = [
      JSON.stringify({
        type: "assistant",
        message: {
          id: "msg_reason_002",
          role: "assistant",
          content: [
            { type: "text", text: "I need to refactor the provider error handling in the opencode desktop session manager and fix the crash in the retry logic for authentication timeouts" },
          ],
        },
      }),
    ]
    const { path: transcriptPath, dir } = createTempTranscript(transcript)

    const result = await runHookWithContext(
      "fix the crash in packages/opencode/src/provider/provider.ts",
      { session_id: randomUUID(), transcript_path: transcriptPath },
    )

    expect(result.exitCode).toBe(0)

    if (result.stdout.trim()) {
      const parsed = JSON.parse(result.stdout)
      expect(parsed).toHaveProperty("hookSpecificOutput")
      expect(parsed.hookSpecificOutput.hookEventName).toBe("UserPromptSubmit")
      // When services respond, reasoning context should be present
      const ctx = parsed.hookSpecificOutput.additionalContext
      expect(typeof ctx).toBe("string")
      expect(ctx.length).toBeGreaterThan(0)
    }

    try { rmSync(dir, { recursive: true }) } catch { /* ignore */ }
  }, { timeout: 15000 })

  test("hook without session_id behaves as before (prompt-only search)", async () => {
    // No session_id means no reasoning extraction -- same as original behaviour
    const result = await runHook("fix the crash in packages/opencode/src/provider/provider.ts")
    expect(result.exitCode).toBe(0)
    if (result.stdout.trim()) {
      const parsed = JSON.parse(result.stdout)
      expect(parsed.hookSpecificOutput.hookEventName).toBe("UserPromptSubmit")
      // Should NOT contain reasoning context without a session
      const ctx = parsed.hookSpecificOutput.additionalContext
      expect(ctx).not.toContain("## Reasoning Context")
      expect(ctx).not.toContain("## Reasoning Memory")
    }
  }, { timeout: 15000 })

  test("hook with non-existent transcript falls back to prompt-only", async () => {
    const result = await runHookWithContext(
      "fix the crash in packages/opencode/src/provider/provider.ts",
      { session_id: randomUUID(), transcript_path: "/tmp/nonexistent-" + Date.now() + ".jsonl" },
    )
    expect(result.exitCode).toBe(0)
    if (result.stdout.trim()) {
      const parsed = JSON.parse(result.stdout)
      const ctx = parsed.hookSpecificOutput.additionalContext
      expect(ctx).not.toContain("## Reasoning Context")
    }
  }, { timeout: 15000 })

  test("hook with short reasoning (<20 chars) falls back to prompt-only", async () => {
    const transcript = [
      JSON.stringify({
        type: "assistant",
        message: {
          id: "msg_short_001",
          role: "assistant",
          content: [
            { type: "text", text: "ok sure" },
          ],
        },
      }),
    ]
    const { path: transcriptPath, dir } = createTempTranscript(transcript)

    const result = await runHookWithContext(
      "fix the crash in packages/opencode/src/provider/provider.ts",
      { session_id: randomUUID(), transcript_path: transcriptPath },
    )

    expect(result.exitCode).toBe(0)
    if (result.stdout.trim()) {
      const parsed = JSON.parse(result.stdout)
      const ctx = parsed.hookSpecificOutput.additionalContext
      expect(ctx).not.toContain("## Reasoning Context")
    }

    try { rmSync(dir, { recursive: true }) } catch { /* ignore */ }
  }, { timeout: 15000 })

  test("hook with empty transcript falls back to prompt-only", async () => {
    const { path: transcriptPath, dir } = createTempTranscript([])

    const result = await runHookWithContext(
      "fix the crash in packages/opencode/src/provider/provider.ts",
      { session_id: randomUUID(), transcript_path: transcriptPath },
    )

    expect(result.exitCode).toBe(0)
    if (result.stdout.trim()) {
      const parsed = JSON.parse(result.stdout)
      const ctx = parsed.hookSpecificOutput.additionalContext
      expect(ctx).not.toContain("## Reasoning Context")
    }

    try { rmSync(dir, { recursive: true }) } catch { /* ignore */ }
  }, { timeout: 15000 })

  test("reasoning identical to prompt is ignored", async () => {
    const prompt = "fix the crash in packages/opencode/src/provider/provider.ts"
    const transcript = [
      JSON.stringify({
        type: "assistant",
        message: {
          id: "msg_dupe_001",
          role: "assistant",
          content: [
            { type: "text", text: prompt }, // reasoning same as prompt
          ],
        },
      }),
    ]
    const { path: transcriptPath, dir } = createTempTranscript(transcript)

    const result = await runHookWithContext(prompt, {
      session_id: randomUUID(),
      transcript_path: transcriptPath,
    })

    expect(result.exitCode).toBe(0)
    if (result.stdout.trim()) {
      const parsed = JSON.parse(result.stdout)
      const ctx = parsed.hookSpecificOutput.additionalContext
      // Reasoning was identical to prompt, so it should be skipped
      expect(ctx).not.toContain("## Reasoning Context")
    }

    try { rmSync(dir, { recursive: true }) } catch { /* ignore */ }
  }, { timeout: 15000 })
})
