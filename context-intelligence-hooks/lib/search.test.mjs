/**
 * Test suite for the shared search module (.claude/hooks/lib/search.mjs)
 *
 * Tests cover:
 *   1. All exports exist and are the correct types
 *   2. Signal pattern matching (CODE_SIGNALS, KNOWLEDGE_SIGNALS, SKIP_PATTERNS)
 *   3. Cache round-trip (setCache, getCache, getCacheKey)
 *   4. Regex sync check (test-local patterns match search.mjs source)
 *   5. formatMemory output formatting
 *   6. Constants have expected default values
 *
 * No mocks -- tests use real module imports and real filesystem cache.
 */

import { readFileSync } from "node:fs"
import { describe, test, expect } from "bun:test"

const search = await import(new URL("./search.mjs", import.meta.url).href)
const SEARCH_PATH = new URL("./search.mjs", import.meta.url).pathname

// --- 1. Exports exist --------------------------------------------------------
// Verify every public name is accessible and has the right type.

describe("Exports exist", () => {
  const signalPatterns = [
    "CODE_SIGNALS", "KNOWLEDGE_SIGNALS", "DOCS_SIGNALS", "MEM_SIGNALS", "SKIP_PATTERNS",
  ]

  for (const name of signalPatterns) {
    test(`${name} is a RegExp`, () => {
      expect(search[name]).toBeInstanceOf(RegExp)
    })
  }

  const numericConstants = [
    "MAX_CONTEXT", "MIN_PROMPT_LEN", "SEARCH_TIMEOUT_MS", "CLI_TIMEOUT_MS",
    "CODE_LIMIT", "DOCS_LIMIT", "MEM_LIMIT", "MIN_SCORE",
    "CACHE_TTL_MS",
  ]

  for (const name of numericConstants) {
    test(`${name} is a number`, () => {
      expect(typeof search[name]).toBe("number")
    })
  }

  const stringConstants = ["MEM_WORKER", "CACHE_DIR"]

  for (const name of stringConstants) {
    test(`${name} is a string`, () => {
      expect(typeof search[name]).toBe("string")
    })
  }

  const cacheFunctions = ["getCacheKey", "getCache", "setCache"]

  for (const name of cacheFunctions) {
    test(`${name} is a function`, () => {
      expect(typeof search[name]).toBe("function")
    })
  }

  const searchFunctions = ["getQdrantModules", "searchMemory", "searchQdrant", "formatMemory"]

  for (const name of searchFunctions) {
    test(`${name} is a function`, () => {
      expect(typeof search[name]).toBe("function")
    })
  }
})

// --- 2. Signal pattern matching -----------------------------------------------
// Representative prompts for each signal category.

describe("CODE_SIGNALS matching", () => {
  const shouldMatch = [
    ["file extension .ts", "fix the bug in provider.ts"],
    ["file extension .json", "edit package.json"],
    ["path src/", "look at src/index.ts"],
    ["keyword fix", "fix the authentication issue"],
    ["keyword refactor", "refactor the handler logic"],
    ["keyword implement", "implement the new session handler"],
    ["keyword debug", "debug the crash in desktop"],
    ["keyword add", "add a retry mechanism"],
    ["keyword remove", "remove the dead code"],
    ["keyword error", "error handling in the server"],
    ["keyword bug", "bug in the retry logic"],
    ["keyword provider", "provider returns wrong model"],
    ["keyword handler", "handler not registered"],
    ["keyword component", "component re-renders too often"],
    ["keyword server", "server refuses connections"],
    ["keyword const", "const declaration missing"],
  ]

  for (const [label, prompt] of shouldMatch) {
    test(`matches: ${label}`, () => {
      expect(search.CODE_SIGNALS.test(prompt)).toBe(true)
    })
  }

  const shouldNotMatch = [
    ["weather", "how is the weather today"],
    ["joke", "tell me a joke"],
    ["time", "what time is it"],
    ["greeting", "good morning everyone"],
  ]

  for (const [label, prompt] of shouldNotMatch) {
    test(`does not match: ${label}`, () => {
      expect(search.CODE_SIGNALS.test(prompt)).toBe(false)
    })
  }
})

describe("KNOWLEDGE_SIGNALS matching", () => {
  const shouldMatch = [
    // Documentation / architecture
    ["explain keyword", "explain the architecture"],
    ["how keyword", "how does this system work"],
    ["why keyword", "why did we choose SolidJS"],
    ["architecture", "describe the architecture overview"],
    ["pattern", "what pattern should I use here"],
    ["convention", "convention for naming files"],
    ["workflow", "workflow for releasing a version"],
    ["design", "the design uses event sourcing"],
    ["strategy", "caching strategy needs work"],
    ["decision", "decision log for v2"],
    ["requirement", "requirement for auth"],
    // How it works / why / what changed
    ["how did we", "how did we fix the auth bug"],
    ["how does X work", "how does the cache invalidation work"],
    ["why did we", "why did we choose Bun over Node"],
    ["what changed", "what changed in the last refactor"],
    ["root cause", "what was the root cause of the crash"],
    ["any gotchas", "any gotchas with the Qdrant setup"],
    ["trade-off", "trade-off between speed and accuracy"],
    ["previously", "previously we had issues with timeouts"],
    ["last time", "last time we tried this it failed"],
    ["lesson", "the lesson from the outage"],
    ["discovered", "we discovered a bug"],
    ["turned out", "it turned out to be a config issue"],
    ["broke", "that broke the build"],
  ]

  for (const [label, prompt] of shouldMatch) {
    test(`matches: ${label}`, () => {
      expect(search.KNOWLEDGE_SIGNALS.test(prompt)).toBe(true)
    })
  }

  const shouldNotMatch = [
    ["run tests", "run the tests"],
    ["pure greeting", "good morning"],
    ["add component", "add a new button component"],
    ["run check", "run bun check"],
    ["greeting", "hello there"],
    ["pure number", "42"],
  ]

  for (const [label, prompt] of shouldNotMatch) {
    test(`does not match: ${label}`, () => {
      expect(search.KNOWLEDGE_SIGNALS.test(prompt)).toBe(false)
    })
  }
})

describe("SKIP_PATTERNS matching", () => {
  function stripped(s) {
    return s.trim().replace(/[.,!?;:]+$/, "")
  }

  const shouldMatch = [
    "thanks", "thanks!", "thank you", "hi", "hello", "hey",
    "ok", "okay", "sure", "yes", "no", "yep", "nope",
    "lgtm", "ship it", "do it", "go ahead", "sounds good",
    "looks good", "confirmed", "approved", "never mind",
    "got it", "makes sense", "understood", "i see",
    "right", "correct", "exactly", "agreed",
    "hold on", "wait", "stop", "cancel",
    "please", "commit", "push", "done",
    "good", "great", "nice", "perfect",
  ]

  for (const phrase of shouldMatch) {
    test(`matches: "${phrase}"`, () => {
      expect(search.SKIP_PATTERNS.test(stripped(phrase))).toBe(true)
    })
  }

  const shouldNotMatch = [
    "fix the authentication bug",
    "thanks for fixing that, now add tests",
    "ok now implement the feature",
    "hello world program in typescript",
    "please update the config file",
  ]

  for (const phrase of shouldNotMatch) {
    test(`does not match: "${phrase}"`, () => {
      expect(search.SKIP_PATTERNS.test(stripped(phrase))).toBe(false)
    })
  }
})

// --- 3. Cache round-trip ------------------------------------------------------

describe("Cache round-trip", () => {
  test("setCache then getCache returns stored data", () => {
    search.setCache("test-prompt", "test-data")
    const result = search.getCache("test-prompt")
    expect(result).toBe("test-data")
  })

  test("getCache returns null for nonexistent key", () => {
    const result = search.getCache("nonexistent-key-xyz")
    expect(result).toBeNull()
  })

  test("getCacheKey returns a 12-char hex string", () => {
    const key = search.getCacheKey("test")
    expect(key).toHaveLength(12)
    expect(/^[0-9a-f]{12}$/.test(key)).toBe(true)
  })

  test("getCacheKey is deterministic", () => {
    const a = search.getCacheKey("hello world")
    const b = search.getCacheKey("hello world")
    expect(a).toBe(b)
  })

  test("getCacheKey differs for different inputs", () => {
    const a = search.getCacheKey("input-one")
    const b = search.getCacheKey("input-two")
    expect(a).not.toBe(b)
  })

  test("setCache stores objects and getCache returns them", () => {
    const data = { results: [1, 2, 3], ok: true }
    search.setCache("test-object-prompt", data)
    const result = search.getCache("test-object-prompt")
    expect(result).toEqual(data)
  })
})

// --- 4. Regex sync check -----------------------------------------------------
// Verify test-local copies of patterns match the search.mjs source.

function extractRegexSource(fileSource, varName) {
  const m = fileSource.match(new RegExp("(?:export\\s+)?const " + varName + "\\s*=\\s*\\n?\\s*/(.*)/[gimsuy]*")) // nosemgrep: detect-non-literal-regexp
  return m ? m[1] : null
}

describe("Regex sync check", () => {
  const searchSource = readFileSync(SEARCH_PATH, "utf-8")
  const testSource = readFileSync(new URL(import.meta.url).pathname, "utf-8")

  test("CODE_SIGNALS regex source matches between search module and imported pattern", () => {
    const sourcePattern = extractRegexSource(searchSource, "CODE_SIGNALS")
    expect(sourcePattern).not.toBeNull()
    // Verify the imported regex has the same source
    expect(search.CODE_SIGNALS.source).toBe(sourcePattern)
  })

  test("KNOWLEDGE_SIGNALS is accessible and matches known prompts", () => {
    // KNOWLEDGE_SIGNALS uses RegExp constructor, no literal source to extract
    expect(search.KNOWLEDGE_SIGNALS.test("how does this work")).toBe(true)
    expect(search.KNOWLEDGE_SIGNALS.test("what was the root cause")).toBe(true)
    expect(search.KNOWLEDGE_SIGNALS.test("explain the architecture")).toBe(true)
    expect(search.KNOWLEDGE_SIGNALS.test("42")).toBe(false)
  })

  test("DOCS_SIGNALS and MEM_SIGNALS are aliases for KNOWLEDGE_SIGNALS", () => {
    expect(search.DOCS_SIGNALS).toBe(search.KNOWLEDGE_SIGNALS)
    expect(search.MEM_SIGNALS).toBe(search.KNOWLEDGE_SIGNALS)
  })

  test("SKIP_PATTERNS regex source matches between search module and imported pattern", () => {
    const sourcePattern = extractRegexSource(searchSource, "SKIP_PATTERNS")
    expect(sourcePattern).not.toBeNull()
    expect(search.SKIP_PATTERNS.source).toBe(sourcePattern)
  })

  test("CODE_SIGNALS word boundaries prevent substring matches", () => {
    expect(search.CODE_SIGNALS.test("fix the bug")).toBe(true)
    expect(search.CODE_SIGNALS.test("suffix")).toBe(false)
    expect(search.CODE_SIGNALS.test("refactor the code")).toBe(true)
    expect(search.CODE_SIGNALS.test("prefix")).toBe(false)
  })
})

// --- 5. formatMemory ----------------------------------------------------------

describe("formatMemory", () => {
  test("empty array returns empty string", () => {
    expect(search.formatMemory([])).toBe("")
  })

  test("observations produce markdown with heading and bullet points", () => {
    const observations = [
      { id: "#1", type: "bug_fix", title: "Fixed auth timeout" },
      { id: "#2", type: "decision", title: "Chose Bun over Node" },
    ]
    const result = search.formatMemory(observations)
    expect(result).toContain("## Memory Context")
    expect(result).toContain("- **#1** bug_fix Fixed auth timeout")
    expect(result).toContain("- **#2** decision Chose Bun over Node")
  })

  test("single observation produces one bullet point", () => {
    const observations = [
      { id: "#42", type: "discovery", title: "Race condition in cache" },
    ]
    const result = search.formatMemory(observations)
    expect(result).toContain("## Memory Context")
    expect(result).toContain("- **#42** discovery Race condition in cache")
    // Only one bullet point
    const bullets = result.match(/^- /gm)
    expect(bullets).toHaveLength(1)
  })
})

// --- 6. Constants have expected default values --------------------------------
// Verify defaults when no env overrides are set.

describe("Constants default values", () => {
  test("MAX_CONTEXT defaults to 6000", () => {
    expect(search.MAX_CONTEXT).toBe(6000)
  })

  test("MIN_SCORE defaults to 0.55", () => {
    expect(search.MIN_SCORE).toBe(0.55)
  })

  test("CACHE_TTL_MS defaults to 30000", () => {
    expect(search.CACHE_TTL_MS).toBe(30000)
  })

  test("MIN_PROMPT_LEN defaults to 15", () => {
    expect(search.MIN_PROMPT_LEN).toBe(15)
  })

  test("SEARCH_TIMEOUT_MS defaults to 9000", () => {
    expect(search.SEARCH_TIMEOUT_MS).toBe(9000)
  })

  test("CLI_TIMEOUT_MS defaults to 15000", () => {
    expect(search.CLI_TIMEOUT_MS).toBe(15000)
  })

  test("CODE_LIMIT defaults to 3", () => {
    expect(search.CODE_LIMIT).toBe(3)
  })

  test("DOCS_LIMIT defaults to 3", () => {
    expect(search.DOCS_LIMIT).toBe(3)
  })

  test("MEM_LIMIT defaults to 5", () => {
    expect(search.MEM_LIMIT).toBe(5)
  })

  test("MEM_WORKER contains localhost address", () => {
    expect(search.MEM_WORKER).toContain("127.0.0.1")
  })

  test("CACHE_DIR contains context-hook-cache", () => {
    expect(search.CACHE_DIR).toContain("context-hook-cache")
  })
})
