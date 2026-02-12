// Transcript reader for Claude Code JSONL conversation files.
//
// Extracts the last assistant reasoning (text + thinking blocks) from
// the tail of a transcript file, for use as a refined search query.

import { existsSync, readdirSync, statSync } from "node:fs"
import { join } from "node:path"
import { openSync, readSync, closeSync, fstatSync } from "node:fs"
import { createLogger } from "./qdrant.mjs"

const { warn } = createLogger("transcript.mjs")

const HOME = process.env.HOME || process.env.USERPROFILE || ""
const PROJECTS_DIR = join(HOME, ".claude", "projects")

// ─── Find transcript path by session ID ──────────────────────────────────────

/**
 * Scan directories under ~/.claude/projects/ for a file named {sessionId}.jsonl.
 * @param {string} sessionId
 * @returns {string|null} Full path if found, null otherwise. Never throws.
 */
export function findTranscriptPath(sessionId) {
  try {
    if (!sessionId || !existsSync(PROJECTS_DIR)) return null

    const target = `${sessionId}.jsonl`

    // Breadth-first search through project directories
    const queue = [PROJECTS_DIR]

    while (queue.length > 0) {
      const dir = queue.shift()
      let entries
      try {
        entries = readdirSync(dir, { withFileTypes: true })
      } catch {
        continue
      }

      for (const entry of entries) {
        const fullPath = join(dir, entry.name)
        if (entry.isFile() && entry.name === target) {
          return fullPath
        }
        if (entry.isDirectory()) {
          queue.push(fullPath)
        }
      }
    }

    return null
  } catch (err) {
    warn("find_transcript_failed", { error: err.message, sessionId })
    return null
  }
}

// ─── Extract reasoning from transcript tail ──────────────────────────────────

/**
 * Read the tail of a transcript JSONL file and extract the last assistant
 * message's reasoning (text and thinking blocks).
 *
 * @param {string} transcriptPath  Absolute path to the JSONL file
 * @param {object} [opts]
 * @param {number} [opts.tailBytes]  Bytes to read from end (default: 20000)
 * @returns {string} Concatenated reasoning text, or "" on any error
 */
export function extractReasoning(transcriptPath, { tailBytes } = {}) {
  try {
    if (!transcriptPath || !existsSync(transcriptPath)) return ""

    const envBytes = parseInt(process.env.HOOK_TRANSCRIPT_TAIL_BYTES, 10)
    const maxBytes = tailBytes ?? (envBytes || 20000)

    const maxLen = parseInt(process.env.HOOK_MAX_REASONING_LEN, 10) || 1500

    // Read the tail of the file efficiently
    const { text: tail, partial } = readTail(transcriptPath, maxBytes)
    if (!tail) return ""

    // Split into lines. Discard first line only when we started mid-file
    // (the first line will be truncated). When we read the entire file,
    // the first line is complete.
    const lines = tail.split("\n")
    if (partial) lines.shift()

    // Parse lines in reverse order (most recent first)
    const reversedLines = lines.reverse()

    let bestContent = null

    for (const line of reversedLines) {
      const trimmed = line.trim()
      if (!trimmed) continue

      let parsed
      try {
        parsed = JSON.parse(trimmed)
      } catch {
        continue // malformed JSON, skip
      }

      // Only look at assistant messages
      if (parsed?.type !== "assistant") continue
      const msg = parsed?.message
      if (!msg || msg.role !== "assistant") continue
      if (!Array.isArray(msg.content)) continue

      // Extract text and thinking blocks from this message
      const parts = []
      for (const block of msg.content) {
        if (block.type === "text" && block.text) {
          parts.push(block.text)
        } else if (block.type === "thinking" && block.thinking) {
          parts.push(block.thinking)
        }
        // Skip tool_use and tool_result blocks
      }

      if (parts.length === 0) continue

      // We found the most recent assistant message with reasoning
      if (!bestContent) {
        bestContent = { id: msg.id, parts: [...parts] }
        continue
      }

      // If this message has the same ID, accumulate (same API request)
      if (msg.id && msg.id === bestContent.id) {
        bestContent.parts.push(...parts)
        continue
      }

      // Different message ID means we've moved past the most recent one
      break
    }

    if (!bestContent || bestContent.parts.length === 0) return ""

    const result = bestContent.parts.join("\n\n")
    return result.length > maxLen ? result.slice(0, maxLen) : result
  } catch (err) {
    warn("extract_reasoning_failed", { error: err.message, transcriptPath })
    return ""
  }
}

// ─── Internal: read last N bytes of a file ───────────────────────────────────

/**
 * @returns {{ text: string, partial: boolean }} text content and whether
 *   the read started mid-file (meaning the first line is truncated).
 */
function readTail(filePath, maxBytes) {
  let fd
  try {
    fd = openSync(filePath, "r")
    const stats = fstatSync(fd)
    const fileSize = stats.size

    if (fileSize === 0) return { text: "", partial: false }

    const bytesToRead = Math.min(maxBytes, fileSize)
    const offset = fileSize - bytesToRead
    const buffer = Buffer.alloc(bytesToRead)

    readSync(fd, buffer, 0, bytesToRead, offset)
    return { text: buffer.toString("utf-8"), partial: offset > 0 }
  } catch (err) {
    warn("read_tail_failed", { error: err.message, filePath })
    return { text: "", partial: false }
  } finally {
    if (fd !== undefined) {
      try { closeSync(fd) } catch { /* ignore */ }
    }
  }
}
