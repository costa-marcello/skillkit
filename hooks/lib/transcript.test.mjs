/**
 * Test suite for the transcript parser module (.claude/hooks/lib/transcript.mjs)
 *
 * Tests cover:
 *   1. extractReasoning — text blocks
 *   2. extractReasoning — thinking blocks
 *   3. extractReasoning — tool_use-only entries (returns "")
 *   4. Edge cases (missing file, empty file, null path, non-assistant entries, malformed JSON)
 *   5. Multiple messages — takes most recent
 *   6. Same-ID messages accumulate
 *   7. Truncation to max length
 *   8. findTranscriptPath — invalid inputs
 *
 * No mocks — tests use real temp files and verify real parsing behaviour.
 */

import { describe, test, expect, afterEach } from "bun:test"
import { writeFileSync, mkdirSync, existsSync, rmSync } from "node:fs"
import { join } from "node:path"
import { tmpdir } from "node:os"

const { extractReasoning, findTranscriptPath } = await import(
  new URL("./transcript.mjs", import.meta.url).href
)

// ─── Helper: create temp JSONL file ─────────────────────────────────────────

const tempDirs = []

function createTempJsonl(lines) {
  const dir = join(tmpdir(), "transcript-test-" + Date.now() + "-" + Math.random().toString(36).slice(2))
  mkdirSync(dir, { recursive: true })
  tempDirs.push(dir)
  const path = join(dir, "test.jsonl")
  writeFileSync(path, lines.join("\n") + "\n")
  return path
}

afterEach(() => {
  for (const dir of tempDirs) {
    if (existsSync(dir)) {
      rmSync(dir, { recursive: true, force: true })
    }
  }
  tempDirs.length = 0
})

// ─── 1. extractReasoning with text blocks ───────────────────────────────────

describe("extractReasoning — text blocks", () => {
  test("extracts text from a single text block", () => {
    const entry = JSON.stringify({
      type: "assistant",
      message: {
        id: "msg_001",
        role: "assistant",
        content: [
          { type: "text", text: "Looking at the auth timeout in session handler" },
        ],
      },
    })

    const path = createTempJsonl([entry])
    const result = extractReasoning(path)
    expect(result).toBe("Looking at the auth timeout in session handler")
  })

  test("extracts text from multiple text blocks in one message", () => {
    const entry = JSON.stringify({
      type: "assistant",
      message: {
        id: "msg_010",
        role: "assistant",
        content: [
          { type: "text", text: "First paragraph." },
          { type: "text", text: "Second paragraph." },
        ],
      },
    })

    const path = createTempJsonl([entry])
    const result = extractReasoning(path)
    expect(result).toBe("First paragraph.\n\nSecond paragraph.")
  })
})

// ─── 2. extractReasoning with thinking blocks ───────────────────────────────

describe("extractReasoning — thinking blocks", () => {
  test("extracts thinking text alongside regular text", () => {
    const entry = JSON.stringify({
      type: "assistant",
      message: {
        id: "msg_002",
        role: "assistant",
        content: [
          { type: "thinking", thinking: "I need to check the auth module" },
          { type: "text", text: "Let me read that file." },
        ],
      },
    })

    const path = createTempJsonl([entry])
    const result = extractReasoning(path)
    expect(result).toContain("I need to check the auth module")
    expect(result).toContain("Let me read that file.")
  })

  test("extracts thinking-only content when no text blocks present", () => {
    const entry = JSON.stringify({
      type: "assistant",
      message: {
        id: "msg_020",
        role: "assistant",
        content: [
          { type: "thinking", thinking: "Reasoning about the architecture" },
        ],
      },
    })

    const path = createTempJsonl([entry])
    const result = extractReasoning(path)
    expect(result).toBe("Reasoning about the architecture")
  })
})

// ─── 3. tool_use-only entries return "" ─────────────────────────────────────

describe("extractReasoning — tool_use only", () => {
  test("returns empty string when content has only tool_use blocks", () => {
    const entry = JSON.stringify({
      type: "assistant",
      message: {
        id: "msg_003",
        role: "assistant",
        content: [
          { type: "tool_use", id: "toolu_xxx", name: "Read", input: { file_path: "/path" } },
        ],
      },
    })

    const path = createTempJsonl([entry])
    const result = extractReasoning(path)
    expect(result).toBe("")
  })

  test("returns empty string when content has tool_use and tool_result blocks", () => {
    const entry = JSON.stringify({
      type: "assistant",
      message: {
        id: "msg_031",
        role: "assistant",
        content: [
          { type: "tool_use", id: "toolu_aaa", name: "Bash", input: { command: "ls" } },
          { type: "tool_result", tool_use_id: "toolu_aaa", content: "file.txt" },
        ],
      },
    })

    const path = createTempJsonl([entry])
    const result = extractReasoning(path)
    expect(result).toBe("")
  })
})

// ─── 4. Edge cases ──────────────────────────────────────────────────────────

describe("extractReasoning — edge cases", () => {
  test("returns empty string for non-existent file", () => {
    const result = extractReasoning("/tmp/does-not-exist-" + Date.now() + ".jsonl")
    expect(result).toBe("")
  })

  test("returns empty string for empty file", () => {
    const dir = join(tmpdir(), "transcript-test-empty-" + Date.now())
    mkdirSync(dir, { recursive: true })
    tempDirs.push(dir)
    const path = join(dir, "empty.jsonl")
    writeFileSync(path, "")
    const result = extractReasoning(path)
    expect(result).toBe("")
  })

  test("returns empty string for null path", () => {
    expect(extractReasoning(null)).toBe("")
  })

  test("returns empty string for undefined path", () => {
    expect(extractReasoning(undefined)).toBe("")
  })

  test("returns empty string for empty string path", () => {
    expect(extractReasoning("")).toBe("")
  })

  test("returns empty string when file contains only non-assistant entries", () => {
    const lines = [
      JSON.stringify({ type: "human", message: { role: "user", content: "Hello" } }),
      JSON.stringify({ type: "system", message: { role: "system", content: "You are helpful" } }),
      JSON.stringify({ type: "result", result: { output: "done" } }),
    ]
    const path = createTempJsonl(lines)
    const result = extractReasoning(path)
    expect(result).toBe("")
  })

  test("skips malformed JSON lines and still extracts valid entries", () => {
    const validEntry = JSON.stringify({
      type: "assistant",
      message: {
        id: "msg_040",
        role: "assistant",
        content: [{ type: "text", text: "Valid reasoning" }],
      },
    })
    const lines = [
      "this is not valid json {{{",
      validEntry,
      "also broken ]]",
    ]
    const path = createTempJsonl(lines)
    const result = extractReasoning(path)
    expect(result).toBe("Valid reasoning")
  })

  test("returns empty string when file has only malformed JSON", () => {
    const lines = [
      "not json at all",
      "{broken: true",
      "12345",
    ]
    const path = createTempJsonl(lines)
    const result = extractReasoning(path)
    expect(result).toBe("")
  })
})

// ─── 5. Multiple messages — takes most recent ──────────────────────────────

describe("extractReasoning — multiple messages", () => {
  test("returns only the most recent assistant message reasoning", () => {
    const older = JSON.stringify({
      type: "assistant",
      message: {
        id: "msg_old",
        role: "assistant",
        content: [{ type: "text", text: "Old reasoning from earlier" }],
      },
    })
    const newer = JSON.stringify({
      type: "assistant",
      message: {
        id: "msg_new",
        role: "assistant",
        content: [{ type: "text", text: "Fresh reasoning from latest" }],
      },
    })
    const path = createTempJsonl([older, newer])
    const result = extractReasoning(path)
    expect(result).toBe("Fresh reasoning from latest")
    expect(result).not.toContain("Old reasoning")
  })

  test("ignores earlier messages with different IDs", () => {
    const lines = [
      JSON.stringify({
        type: "assistant",
        message: {
          id: "msg_first",
          role: "assistant",
          content: [{ type: "text", text: "First message" }],
        },
      }),
      JSON.stringify({
        type: "assistant",
        message: {
          id: "msg_second",
          role: "assistant",
          content: [{ type: "text", text: "Second message" }],
        },
      }),
      JSON.stringify({
        type: "assistant",
        message: {
          id: "msg_third",
          role: "assistant",
          content: [{ type: "text", text: "Third and final message" }],
        },
      }),
    ]
    const path = createTempJsonl(lines)
    const result = extractReasoning(path)
    expect(result).toBe("Third and final message")
  })

  test("skips tool_use-only messages to find the most recent with reasoning", () => {
    const withText = JSON.stringify({
      type: "assistant",
      message: {
        id: "msg_with_text",
        role: "assistant",
        content: [{ type: "text", text: "This has actual reasoning" }],
      },
    })
    const toolOnly = JSON.stringify({
      type: "assistant",
      message: {
        id: "msg_tool_only",
        role: "assistant",
        content: [{ type: "tool_use", id: "toolu_1", name: "Read", input: {} }],
      },
    })
    const path = createTempJsonl([withText, toolOnly])
    const result = extractReasoning(path)
    // The tool-only message is most recent but has no reasoning,
    // so it extracts from the earlier message with text
    expect(result).toBe("This has actual reasoning")
  })
})

// ─── 6. Same-ID messages accumulate ─────────────────────────────────────────

describe("extractReasoning — same-ID accumulation", () => {
  test("concatenates parts from entries sharing the same message ID", () => {
    const part1 = JSON.stringify({
      type: "assistant",
      message: {
        id: "msg_shared",
        role: "assistant",
        content: [{ type: "text", text: "Part one of the reasoning" }],
      },
    })
    const part2 = JSON.stringify({
      type: "assistant",
      message: {
        id: "msg_shared",
        role: "assistant",
        content: [{ type: "text", text: "Part two of the reasoning" }],
      },
    })
    const path = createTempJsonl([part1, part2])
    const result = extractReasoning(path)
    expect(result).toContain("Part one of the reasoning")
    expect(result).toContain("Part two of the reasoning")
  })

  test("same-ID accumulation works across mixed content types", () => {
    const part1 = JSON.stringify({
      type: "assistant",
      message: {
        id: "msg_mixed",
        role: "assistant",
        content: [{ type: "thinking", thinking: "Thinking deeply" }],
      },
    })
    const part2 = JSON.stringify({
      type: "assistant",
      message: {
        id: "msg_mixed",
        role: "assistant",
        content: [{ type: "text", text: "Acting on the thought" }],
      },
    })
    const path = createTempJsonl([part1, part2])
    const result = extractReasoning(path)
    expect(result).toContain("Thinking deeply")
    expect(result).toContain("Acting on the thought")
  })
})

// ─── 7. Truncation to max length ────────────────────────────────────────────

describe("extractReasoning — truncation", () => {
  test("truncates output exceeding default max length of 1500 chars", () => {
    // Build text well over 1500 characters
    const longText = "A".repeat(2000)
    const entry = JSON.stringify({
      type: "assistant",
      message: {
        id: "msg_long",
        role: "assistant",
        content: [{ type: "text", text: longText }],
      },
    })
    const path = createTempJsonl([entry])
    const result = extractReasoning(path)
    expect(result.length).toBe(1500)
    expect(result).toBe("A".repeat(1500))
  })

  test("does not truncate text at or below max length", () => {
    const text = "B".repeat(1500)
    const entry = JSON.stringify({
      type: "assistant",
      message: {
        id: "msg_exact",
        role: "assistant",
        content: [{ type: "text", text }],
      },
    })
    const path = createTempJsonl([entry])
    const result = extractReasoning(path)
    expect(result.length).toBe(1500)
    expect(result).toBe(text)
  })

  test("text below max length is returned in full", () => {
    const text = "Short reasoning"
    const entry = JSON.stringify({
      type: "assistant",
      message: {
        id: "msg_short",
        role: "assistant",
        content: [{ type: "text", text }],
      },
    })
    const path = createTempJsonl([entry])
    const result = extractReasoning(path)
    expect(result).toBe("Short reasoning")
  })
})

// ─── 8. findTranscriptPath — invalid inputs ────────────────────────────────

describe("findTranscriptPath", () => {
  test("returns null for null session ID", () => {
    expect(findTranscriptPath(null)).toBeNull()
  })

  test("returns null for undefined session ID", () => {
    expect(findTranscriptPath(undefined)).toBeNull()
  })

  test("returns null for empty string session ID", () => {
    expect(findTranscriptPath("")).toBeNull()
  })

  test("returns null for a UUID that does not match any file", () => {
    const fakeId = "00000000-0000-0000-0000-000000000000"
    expect(findTranscriptPath(fakeId)).toBeNull()
  })
})
