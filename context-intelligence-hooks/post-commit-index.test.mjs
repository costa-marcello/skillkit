/**
 * Test suite for the post-commit index hook (.claude/hooks/post-commit-index.mjs)
 *
 * Tests cover:
 *   1. Regex pattern matching (COMMIT_PATTERN, ERROR_PATTERNS, DOC_EXTENSIONS, DOC_DIRECTORIES)
 *   2. isDocFile function logic (unit, reconstructed from source)
 *   3. Fast-path exits (subprocess via Bun.spawn)
 *   4. Edge cases (empty stdin, invalid JSON, missing fields)
 *   5. Valid commit detection (graceful behaviour regardless of Qdrant availability)
 *
 * No mocks — tests run the real hook process and verify real regex behaviour.
 */

import { readFileSync } from "node:fs"
import { describe, test, expect } from "bun:test"

// ─── Reconstruct regex patterns from the hook source ────────────────────────
// Copied verbatim from post-commit-index.mjs so we can unit-test the patterns
// without needing the hook to export them.

const COMMIT_PATTERN = /git\s+commit/
const ERROR_PATTERNS = /(?:^|\s)(?:error|fatal):|(?:\bfailed\b)/i
const DOC_EXTENSIONS = /\.(md|txt)$/
const DOC_DIRECTORIES = /^docs\/.*\.(md|txt|json|yaml|yml)$/

// ─── Reconstruct isDocFile from the hook source ─────────────────────────────
function isDocFile(filePath) {
  return DOC_EXTENSIONS.test(filePath) || DOC_DIRECTORIES.test(filePath)
}

const HOOK_PATH = new URL("./post-commit-index.mjs", import.meta.url).pathname

// ─── Helper: run hook with structured stdin data ────────────────────────────
async function runHook(stdinData) {
  const proc = Bun.spawn(["node", HOOK_PATH], {
    stdin: "pipe",
    stdout: "pipe",
    stderr: "pipe",
    env: { ...process.env, HOME: process.env.HOME },
  })
  proc.stdin.write(typeof stdinData === "string" ? stdinData : JSON.stringify(stdinData))
  proc.stdin.end()
  const exitCode = await proc.exited
  const stdout = await new Response(proc.stdout).text()
  const stderr = await new Response(proc.stderr).text()
  return { exitCode, stdout, stderr }
}

// ─── Helper: run hook with raw stdin string (for edge cases) ────────────────
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

// ─── 1. COMMIT_PATTERN Tests ────────────────────────────────────────────────
// Matches commands that contain "git commit" (with flexible whitespace).

describe("COMMIT_PATTERN", () => {
  const shouldMatch = [
    ["basic git commit", "git commit -m 'test'"],
    ["git commit with amend", "git commit --amend"],
    ["git commit with message flag", "git commit -m \"fix: auth bug\""],
    ["git commit with no-edit", "git commit --no-edit"],
    ["git commit with double space", "git  commit -m 'test'"],
    ["git commit in longer command", "cd /tmp && git commit -m 'init'"],
    ["git commit with all flag", "git commit -a -m 'update'"],
    ["git commit with signoff", "git commit --signoff -m 'fix'"],
  ]

  for (const [label, command] of shouldMatch) {
    test(`matches: ${label}`, () => {
      expect(COMMIT_PATTERN.test(command)).toBe(true)
    })
  }

  const shouldNotMatch = [
    ["git-commit (hyphenated)", "git-commit -m test"],
    ["git push", "git push origin main"],
    ["git pull", "git pull --rebase"],
    ["git add", "git add ."],
    ["git status", "git status"],
    ["git log", "git log --oneline"],
    ["git diff", "git diff HEAD~1"],
    ["no git at all", "bun test"],
    ["commit without git", "commit -m 'test'"],
    ["gitcommit (no space)", "gitcommit -m 'test'"],
  ]

  for (const [label, command] of shouldNotMatch) {
    test(`does not match: ${label}`, () => {
      expect(COMMIT_PATTERN.test(command)).toBe(false)
    })
  }
})

// ─── 2. ERROR_PATTERNS Tests ────────────────────────────────────────────────
// Matches error indicators in tool output (case-insensitive, word-boundary).

describe("ERROR_PATTERNS", () => {
  // The regex /(?:^|\s)(?:error|fatal):|(?:\bfailed\b)/i matches:
  //   - "error:" or "fatal:" preceded by start-of-string or whitespace
  //   - "failed" as a standalone word (word boundaries)
  // This correctly catches standard git error output like "error: pathspec"
  // and "fatal: not a git repository".

  const shouldMatch = [
    ["failed keyword", "command failed with exit code 1"],
    ["Failed capitalised", "Failed to push some refs"],
    ["FAILED uppercase", "FAILED with errors"],
    ["error:word (no space after colon)", "error:pathspec did not match"],
    ["fatal:word (no space after colon)", "fatal:repository not found"],
    ["ERROR:WORD uppercase", "ERROR:CONFIG not found"],
    ["error: with space (standard git format)", "error: pathspec 'foo' did not match"],
    ["fatal: with space (standard git format)", "fatal: not a git repository"],
    ["ERROR: uppercase with space", "ERROR: something went wrong"],
  ]

  for (const [label, output] of shouldMatch) {
    test(`matches: ${label}`, () => {
      expect(ERROR_PATTERNS.test(output)).toBe(true)
    })
  }

  const shouldNotMatch = [
    ["clean commit output", "[main abc1234] test commit\n 1 file changed"],
    ["success message", "Everything up-to-date"],
    ["normal diff output", "diff --git a/file.ts b/file.ts"],
    ["error without colon", "there was an error in the logic"],
    ["fatal without colon", "a fatal flaw in the design"],
    ["failed without word boundary", "unfailed attempt"],
    ["errorhandler (no boundary)", "errorhandler module loaded"],
  ]

  for (const [label, output] of shouldNotMatch) {
    test(`does not match: ${label}`, () => {
      expect(ERROR_PATTERNS.test(output)).toBe(false)
    })
  }
})

// ─── 3. DOC_EXTENSIONS Tests ────────────────────────────────────────────────
// Matches files ending in .md or .txt

describe("DOC_EXTENSIONS", () => {
  const shouldMatch = [
    ["README.md", "README.md"],
    ["CHANGELOG.md", "CHANGELOG.md"],
    ["notes.txt", "notes.txt"],
    ["path/to/doc.md", "path/to/doc.md"],
    ["deep/nested/file.txt", "deep/nested/file.txt"],
  ]

  for (const [label, path] of shouldMatch) {
    test(`matches: ${label}`, () => {
      expect(DOC_EXTENSIONS.test(path)).toBe(true)
    })
  }

  const shouldNotMatch = [
    ["TypeScript file", "index.ts"],
    ["JavaScript file", "config.js"],
    ["JSON file", "package.json"],
    ["YAML file", "config.yaml"],
    [".mjs file", "hook.mjs"],
    [".md in middle", "file.md.bak"],
    [".txt in middle", "file.txt.old"],
  ]

  for (const [label, path] of shouldNotMatch) {
    test(`does not match: ${label}`, () => {
      expect(DOC_EXTENSIONS.test(path)).toBe(false)
    })
  }
})

// ─── 4. DOC_DIRECTORIES Tests ───────────────────────────────────────────────
// Matches doc files in the docs/ directory only.
// Requires doc-like extensions (.md, .txt, .json, .yaml, .yml).

describe("DOC_DIRECTORIES", () => {
  const shouldMatch = [
    ["docs/api.md", "docs/api.md"],
    ["docs/schema.json", "docs/schema.json"],
    ["docs/config.yaml", "docs/config.yaml"],
    ["docs/nested/deep/file.md", "docs/nested/deep/file.md"],
  ]

  for (const [label, path] of shouldMatch) {
    test(`matches: ${label}`, () => {
      expect(DOC_DIRECTORIES.test(path)).toBe(true)
    })
  }

  const shouldNotMatch = [
    [".planning/roadmap.md (hidden dir excluded)", ".planning/roadmap.md"],
    [".planning/config.yaml (hidden dir excluded)", ".planning/config.yaml"],
    [".planning/config.yml (hidden dir excluded)", ".planning/config.yml"],
    [".planning/data.json (hidden dir excluded)", ".planning/data.json"],
    [".planning/notes.txt (hidden dir excluded)", ".planning/notes.txt"],
    [".planning/nested/deep.yml (hidden dir excluded)", ".planning/nested/deep.yml"],
    [".claude/rules/code-style.md (hidden dir excluded)", ".claude/rules/code-style.md"],
    [".claude/settings.json (hidden dir excluded)", ".claude/settings.json"],
    [".claude/hooks/context.mjs (not doc ext)", ".claude/hooks/context.mjs"],
    ["docs/code.ts (not doc ext)", "docs/code.ts"],
    [".planning/script.sh (not doc ext)", ".planning/script.sh"],
    ["src/file.md (wrong directory)", "src/file.md"],
    ["packages/file.md (wrong directory)", "packages/file.md"],
    ["file.md (no directory)", "file.md"],
    ["random/docs/file.md (docs not at root)", "random/docs/file.md"],
    [".config/settings.json (not special dir)", ".config/settings.json"],
  ]

  for (const [label, path] of shouldNotMatch) {
    test(`does not match: ${label}`, () => {
      expect(DOC_DIRECTORIES.test(path)).toBe(false)
    })
  }
})

// ─── 5. isDocFile Function Logic ────────────────────────────────────────────
// Reconstructed from source: DOC_EXTENSIONS.test(filePath) || DOC_DIRECTORIES.test(filePath)

describe("isDocFile", () => {
  const docFiles = [
    ["README.md (DOC_EXTENSIONS)", "README.md"],
    ["docs/api.md (DOC_DIRECTORIES)", "docs/api.md"],
    [".planning/roadmap.md (DOC_EXTENSIONS via .md)", ".planning/roadmap.md"],
    [".claude/rules/code-style.md (DOC_EXTENSIONS via .md)", ".claude/rules/code-style.md"],
    ["notes.txt (DOC_EXTENSIONS)", "notes.txt"],
    ["docs/schema.json (DOC_DIRECTORIES)", "docs/schema.json"],
    ["CHANGELOG.md (DOC_EXTENSIONS)", "CHANGELOG.md"],
  ]

  for (const [label, path] of docFiles) {
    test(`true: ${label}`, () => {
      expect(isDocFile(path)).toBe(true)
    })
  }

  const nonDocFiles = [
    ["src/index.ts (code file)", "src/index.ts"],
    [".claude/hooks/context.mjs (mjs in hidden dir)", ".claude/hooks/context.mjs"],
    ["docs/code.ts (ts in docs dir)", "docs/code.ts"],
    ["packages/opencode/src/tool.ts", "packages/opencode/src/tool.ts"],
    ["package.json (root, not in docs dir)", "package.json"],
    [".planning/script.sh (sh extension)", ".planning/script.sh"],
    ["src/utils/format.js", "src/utils/format.js"],
    [".planning/config.yaml (hidden dir excluded)", ".planning/config.yaml"],
    [".claude/settings.json (hidden dir excluded)", ".claude/settings.json"],
  ]

  for (const [label, path] of nonDocFiles) {
    test(`false: ${label}`, () => {
      expect(isDocFile(path)).toBe(false)
    })
  }
})

// ─── 6. Fast-Path Exits (subprocess) ───────────────────────────────────────
// Run the hook process and verify that inputs that should be skipped produce
// exit 0 with empty stdout.

describe("Fast-path exits", () => {
  test("tool_name !== 'Bash' exits cleanly (Read)", async () => {
    const result = await runHook({ tool_name: "Read", tool_input: { file_path: "/tmp/foo" } })
    expect(result.exitCode).toBe(0)
    expect(result.stdout).toBe("")
  }, { timeout: 10000 })

  test("tool_name !== 'Bash' exits cleanly (Write)", async () => {
    const result = await runHook({ tool_name: "Write", tool_input: { file_path: "/tmp/foo" } })
    expect(result.exitCode).toBe(0)
    expect(result.stdout).toBe("")
  }, { timeout: 10000 })

  test("tool_name !== 'Bash' exits cleanly (Edit)", async () => {
    const result = await runHook({ tool_name: "Edit" })
    expect(result.exitCode).toBe(0)
    expect(result.stdout).toBe("")
  }, { timeout: 10000 })

  test("command not matching COMMIT_PATTERN (git push)", async () => {
    const result = await runHook({
      tool_name: "Bash",
      tool_input: { command: "git push origin main" },
    })
    expect(result.exitCode).toBe(0)
    expect(result.stdout).toBe("")
  }, { timeout: 10000 })

  test("command not matching COMMIT_PATTERN (git status)", async () => {
    const result = await runHook({
      tool_name: "Bash",
      tool_input: { command: "git status" },
    })
    expect(result.exitCode).toBe(0)
    expect(result.stdout).toBe("")
  }, { timeout: 10000 })

  test("command not matching COMMIT_PATTERN (bun test)", async () => {
    const result = await runHook({
      tool_name: "Bash",
      tool_input: { command: "bun test" },
    })
    expect(result.exitCode).toBe(0)
    expect(result.stdout).toBe("")
  }, { timeout: 10000 })

  test("command not matching COMMIT_PATTERN (git add)", async () => {
    const result = await runHook({
      tool_name: "Bash",
      tool_input: { command: "git add ." },
    })
    expect(result.exitCode).toBe(0)
    expect(result.stdout).toBe("")
  }, { timeout: 10000 })

  test("output contains 'failed' exits cleanly", async () => {
    const result = await runHook({
      tool_name: "Bash",
      tool_input: { command: "git commit -m 'test'" },
      tool_output: "pre-commit hook failed with exit code 1",
    })
    expect(result.exitCode).toBe(0)
    expect(result.stdout).toBe("")
  }, { timeout: 10000 })

  test("output contains 'Failed' (capitalised) exits cleanly", async () => {
    const result = await runHook({
      tool_name: "Bash",
      tool_input: { command: "git commit -m 'test'" },
      tool_output: "Failed to create commit",
    })
    expect(result.exitCode).toBe(0)
    expect(result.stdout).toBe("")
  }, { timeout: 10000 })

  test("output contains 'error:word' (no space) exits cleanly", async () => {
    const result = await runHook({
      tool_name: "Bash",
      tool_input: { command: "git commit -m 'test'" },
      tool_output: "error:pathspec did not match any file(s)",
    })
    expect(result.exitCode).toBe(0)
    expect(result.stdout).toBe("")
  }, { timeout: 10000 })

  test("output contains 'fatal:word' (no space) exits cleanly", async () => {
    const result = await runHook({
      tool_name: "Bash",
      tool_input: { command: "git commit -m 'test'" },
      tool_output: "fatal:repository not found",
    })
    expect(result.exitCode).toBe(0)
    expect(result.stdout).toBe("")
  }, { timeout: 10000 })
})

// ─── 7. Edge Cases (subprocess) ─────────────────────────────────────────────
// Verify the hook handles broken or unexpected input gracefully.

describe("Edge cases", () => {
  test("empty stdin exits 0", async () => {
    const result = await runHookRaw("")
    expect(result.exitCode).toBe(0)
    expect(result.stdout).toBe("")
  }, { timeout: 10000 })

  test("invalid JSON stdin exits 0", async () => {
    const result = await runHookRaw("this is not json at all")
    expect(result.exitCode).toBe(0)
    expect(result.stdout).toBe("")
  }, { timeout: 10000 })

  test("partial JSON stdin exits 0", async () => {
    const result = await runHookRaw('{"tool_name": "Bash", "tool_input":')
    expect(result.exitCode).toBe(0)
    expect(result.stdout).toBe("")
  }, { timeout: 10000 })

  test("missing tool_input exits 0", async () => {
    const result = await runHook({ tool_name: "Bash" })
    expect(result.exitCode).toBe(0)
    expect(result.stdout).toBe("")
  }, { timeout: 10000 })

  test("missing tool_input.command exits 0", async () => {
    const result = await runHook({ tool_name: "Bash", tool_input: {} })
    expect(result.exitCode).toBe(0)
    expect(result.stdout).toBe("")
  }, { timeout: 10000 })

  test("null tool_input exits 0", async () => {
    const result = await runHook({ tool_name: "Bash", tool_input: null })
    expect(result.exitCode).toBe(0)
    expect(result.stdout).toBe("")
  }, { timeout: 10000 })

  test("empty object exits 0", async () => {
    const result = await runHook({})
    expect(result.exitCode).toBe(0)
    expect(result.stdout).toBe("")
  }, { timeout: 10000 })

  test("JSON array exits 0 (not an object with tool_name)", async () => {
    const result = await runHookRaw(JSON.stringify([1, 2, 3]))
    expect(result.exitCode).toBe(0)
    expect(result.stdout).toBe("")
  }, { timeout: 10000 })

  test("numeric JSON exits 0", async () => {
    const result = await runHookRaw("42")
    expect(result.exitCode).toBe(0)
    expect(result.stdout).toBe("")
  }, { timeout: 10000 })

  test("string JSON exits 0", async () => {
    const result = await runHookRaw('"hello"')
    expect(result.exitCode).toBe(0)
    expect(result.stdout).toBe("")
  }, { timeout: 10000 })

  test("null JSON exits cleanly (guarded by type check)", async () => {
    // JSON.parse("null") returns null, guarded by the null/type check after parse.
    const result = await runHookRaw("null")
    expect(result.exitCode).toBe(0)
    expect(result.stdout).toBe("")
  }, { timeout: 10000 })

  test("cwd with path traversal uses default or exits at config load", async () => {
    const result = await runHook({
      tool_name: "Bash",
      tool_input: { command: "git commit -m 'test'" },
      tool_output: "[main abc] test\n 1 file changed",
      cwd: "../../../etc",
    })
    expect(result.exitCode).toBe(0)
    // Hook may exit at loadMcpConfig (if .mcp.json is absent) before reaching
    // validateCwd. Both outcomes are safe: the traversal path is never used.
    const hasTraversalWarn = result.stderr.includes("cwd_path_traversal")
    const hasConfigWarn = result.stderr.includes("config_load_failed")
    expect(hasTraversalWarn || hasConfigWarn).toBe(true)
  }, { timeout: 60000 })

  test("extra fields in input do not cause crash", async () => {
    const result = await runHook({
      tool_name: "Read",
      tool_input: { file_path: "/tmp/foo" },
      extra_field: "should be ignored",
      nested: { deep: true },
    })
    expect(result.exitCode).toBe(0)
    expect(result.stdout).toBe("")
  }, { timeout: 10000 })
})

// ─── 8. Valid Commit Detection (subprocess, graceful) ───────────────────────
// For a valid commit input, the hook will attempt to connect to Qdrant.
// Qdrant may or may not be available. Test that the hook never crashes
// and produces valid output when it does respond.

describe("Valid commit detection", () => {
  const validCommitInput = {
    tool_name: "Bash",
    tool_input: { command: "git commit -m 'test'" },
    tool_output: "[main abc1234] test\n 1 file changed, 1 insertion(+)",
  }

  test("never crashes on valid commit (exit 0)", async () => {
    const result = await runHook(validCommitInput)
    expect(result.exitCode).toBe(0)
  }, { timeout: 60000 })

  test("stdout is either empty or valid JSON with systemMessage", async () => {
    const result = await runHook(validCommitInput)
    expect(result.exitCode).toBe(0)

    if (result.stdout.trim() === "") {
      // Qdrant not available or .mcp.json missing — hook exited gracefully
      return
    }

    // If there is output, it must be valid JSON with systemMessage key
    const parsed = JSON.parse(result.stdout)
    expect(parsed).toHaveProperty("systemMessage")
    expect(typeof parsed.systemMessage).toBe("string")
    expect(parsed.systemMessage.length).toBeGreaterThan(0)
  }, { timeout: 60000 })

  test("amend commit also triggers (not blocked)", async () => {
    const result = await runHook({
      tool_name: "Bash",
      tool_input: { command: "git commit --amend --no-edit" },
      tool_output: "[main abc1234] test\n 1 file changed",
    })
    expect(result.exitCode).toBe(0)
  }, { timeout: 60000 })

  test("commit with verbose output still triggers", async () => {
    const result = await runHook({
      tool_name: "Bash",
      tool_input: { command: "git commit -m 'feat: add feature'" },
      tool_output: "[dev a1b2c3d] feat: add feature\n 3 files changed, 42 insertions(+), 7 deletions(-)",
    })
    expect(result.exitCode).toBe(0)
  }, { timeout: 60000 })

  test("commit with cwd field accepted", async () => {
    const result = await runHook({
      tool_name: "Bash",
      tool_input: { command: "git commit -m 'fix: something'" },
      tool_output: "[main def5678] fix: something\n 1 file changed",
      cwd: "/tmp",
    })
    expect(result.exitCode).toBe(0)
  }, { timeout: 60000 })

  test("missing tool_output treated as empty (no error patterns)", async () => {
    // When tool_output is missing, the hook defaults to "" which has no error
    // patterns, so it proceeds past the error check. It will try to load
    // .mcp.json config and may exit there if not found.
    const result = await runHook({
      tool_name: "Bash",
      tool_input: { command: "git commit -m 'test'" },
    })
    expect(result.exitCode).toBe(0)
  }, { timeout: 60000 })
})

// ─── 9. Pattern Interaction Tests ───────────────────────────────────────────
// Verify that the combination of COMMIT_PATTERN and ERROR_PATTERNS works
// correctly in a pipeline (matching the hook's sequential checks).

describe("Pattern interaction (commit + error filtering)", () => {
  test("commit with clean output passes both checks", () => {
    const command = "git commit -m 'feat: new feature'"
    const output = "[main abc1234] feat: new feature\n 2 files changed"
    expect(COMMIT_PATTERN.test(command)).toBe(true)
    expect(ERROR_PATTERNS.test(output)).toBe(false)
  })

  test("commit with 'failed' in output would be filtered", () => {
    const command = "git commit -m 'test'"
    const output = "pre-commit hook failed with exit code 1"
    expect(COMMIT_PATTERN.test(command)).toBe(true)
    expect(ERROR_PATTERNS.test(output)).toBe(true)
  })

  test("non-commit command exits at commit check (error check never reached)", () => {
    const command = "git push origin main"
    const output = "command failed with exit code 1"
    expect(COMMIT_PATTERN.test(command)).toBe(false)
    // Error check never reached because commit check fails first
  })

  test("commit with 'Failed' in output is filtered", () => {
    const command = "git commit -m 'fix: resolve issue'"
    const output = "[main def5678] fix: resolve issue\nFailed to apply hook"
    expect(COMMIT_PATTERN.test(command)).toBe(true)
    expect(ERROR_PATTERNS.test(output)).toBe(true)
  })

  test("commit with 'error: space' is correctly filtered", () => {
    const command = "git commit -m 'test'"
    const output = "error: cannot lock ref 'refs/heads/main'"
    expect(COMMIT_PATTERN.test(command)).toBe(true)
    expect(ERROR_PATTERNS.test(output)).toBe(true)
  })

  test("commit with word 'error' (no colon) passes error check", () => {
    const command = "git commit -m 'fix error handling'"
    const output = "[main abc1234] fix error handling\n 1 file changed"
    expect(COMMIT_PATTERN.test(command)).toBe(true)
    expect(ERROR_PATTERNS.test(output)).toBe(false)
  })
})

// ─── 10. Regex sync check ──────────────────────────────────────────────────
// Verify the test file's copied regex patterns still match the hook source.

function extractRegexSource(fileSource, varName) {
  const m = fileSource.match(new RegExp("const " + varName + "\\s*=\\s*/(.*)/[gimsuy]*")) // nosemgrep: detect-non-literal-regexp
  return m ? m[1] : null
}

describe("Regex sync check", () => {
  test("COMMIT_PATTERN regex source matches between test and hook", () => {
    const hookSource = readFileSync(HOOK_PATH, "utf-8")
    const testSource = readFileSync(new URL(import.meta.url).pathname, "utf-8")
    const hookPattern = extractRegexSource(hookSource, "COMMIT_PATTERN")
    const testPattern = extractRegexSource(testSource, "COMMIT_PATTERN")
    expect(hookPattern).not.toBeNull()
    expect(testPattern).not.toBeNull()
    expect(testPattern).toBe(hookPattern)
  })

  test("ERROR_PATTERNS regex source matches between test and hook", () => {
    const hookSource = readFileSync(HOOK_PATH, "utf-8")
    const testSource = readFileSync(new URL(import.meta.url).pathname, "utf-8")
    const hookPattern = extractRegexSource(hookSource, "ERROR_PATTERNS")
    const testPattern = extractRegexSource(testSource, "ERROR_PATTERNS")
    expect(hookPattern).not.toBeNull()
    expect(testPattern).not.toBeNull()
    expect(testPattern).toBe(hookPattern)
  })

  test("DOC_EXTENSIONS regex source matches between test and hook", () => {
    const hookSource = readFileSync(HOOK_PATH, "utf-8")
    const testSource = readFileSync(new URL(import.meta.url).pathname, "utf-8")
    const hookPattern = extractRegexSource(hookSource, "DOC_EXTENSIONS")
    const testPattern = extractRegexSource(testSource, "DOC_EXTENSIONS")
    expect(hookPattern).not.toBeNull()
    expect(testPattern).not.toBeNull()
    expect(testPattern).toBe(hookPattern)
  })

  test("DOC_DIRECTORIES regex source matches between test and hook", () => {
    const hookSource = readFileSync(HOOK_PATH, "utf-8")
    const testSource = readFileSync(new URL(import.meta.url).pathname, "utf-8")
    const hookPattern = extractRegexSource(hookSource, "DOC_DIRECTORIES")
    const testPattern = extractRegexSource(testSource, "DOC_DIRECTORIES")
    expect(hookPattern).not.toBeNull()
    expect(testPattern).not.toBeNull()
    expect(testPattern).toBe(hookPattern)
  })
})
