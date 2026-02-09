// Shared Qdrant utilities for Claude Code hooks.
//
// Extracted from context.mjs and post-commit-index.mjs to eliminate
// duplicated path resolution, config loading, logging, and timeout code.

import { readFileSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

// ─── Path resolution (portable, no hardcoded user paths) ─────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url))
export const PROJECT_ROOT = resolve(__dirname, "..", "..", "..")
export const HOME = process.env.HOME || process.env.USERPROFILE || ""

export const MCP_SERVER_BUILD = process.env.MCP_SERVER_BUILD
  || join(HOME, ".npm-global/lib/node_modules/@mhalder/qdrant-mcp-server/build")
export const MCP_JSON_PATH = join(PROJECT_ROOT, ".mcp.json")
export const DEFAULT_CWD = PROJECT_ROOT

// ─── Structured logging (visible via Ctrl+O verbose mode) ────────────────────
export function createLogger(hookName) {
  function log(level, event, data = {}) {
    const entry = {
      ts: new Date().toISOString(),
      hook: hookName,
      level,
      event,
      ...data,
    }
    console.error(JSON.stringify(entry))
  }
  return {
    log,
    warn: (event, data) => log("warn", event, data),
    info: (event, data) => log("info", event, data),
  }
}

// ─── Timeout wrapper (clears timer to prevent process hang) ──────────────────
export function withTimeout(promise, ms) {
  let timer
  const race = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error("timeout")), ms)
  })
  return Promise.race([promise, race]).finally(() => clearTimeout(timer))
}

// ─── Load config from .mcp.json ────────────────────────────────────────────
export function loadMcpConfig(logger) {
  try {
    const raw = readFileSync(MCP_JSON_PATH, "utf-8")
    return JSON.parse(raw).mcpServers["qdrant-codemad"].env
  } catch (e) {
    logger.warn("config_load_failed", { error: e.message })
    process.exit(0)
  }
}

// ─── Set env vars for MCP server modules ────────────────────────────────────
const ENV_KEYS = ["QDRANT_URL", "QDRANT_API_KEY", "EMBEDDING_PROVIDER", "EMBEDDING_MODEL", "VOYAGE_API_KEY"]

export function setQdrantEnv(mcpConfig, logger) {
  for (const key of ENV_KEYS) {
    if (mcpConfig[key] != null && mcpConfig[key] !== "") {
      process.env[key] = mcpConfig[key]
    } else if (logger) {
      logger.warn("missing_config_key", { key })
    }
  }
}

// ─── Path traversal guard ────────────────────────────────────────────────────
export function validateCwd(cwd, logger) {
  if (cwd.includes("..")) {
    logger.warn("cwd_path_traversal", { cwd })
    return DEFAULT_CWD
  }
  return cwd
}
