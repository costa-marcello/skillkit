# Hooks

Three hooks that add context intelligence to Claude Code. They connect Claude to your project's vector store and memory system so every prompt and commit benefits from prior knowledge.

## context.mjs (UserPromptSubmit)

Runs on every prompt. Searches Qdrant (code snippets and project docs) and claude-mem (decisions, patterns, bug fixes) to inject relevant context into Claude's system message. This gives Claude awareness of your codebase and past decisions without you needing to paste anything manually.

## post-commit-index.mjs (PostToolUse: Bash)

Detects git commit commands and re-indexes changed files into Qdrant. Handles both code files (via CodeIndexer) and documentation (via QdrantManager). This keeps your vector store up to date after every commit so future prompts always reference the latest code.

## pre-tool-context.mjs (PreToolUse: Read|Grep|Glob|Bash|WebSearch|WebFetch|Task)

Fires once per user turn on the first matching tool call. Extracts Claude's reasoning from the session transcript and uses it as a refined search query against Qdrant and claude-mem. Results inject as `additionalContext` before the tool executes.

This works because user prompts are often vague ("fix that thing"), but Claude's internal reasoning expands them into precise technical queries ("the auth timeout in session handler"). Searching with the reasoning text produces better retrieval results than the raw prompt alone.

A per-session guard file prevents the hook from running on every tool call within the same turn. The guard expires after 60 seconds (configurable via `HOOK_GUARD_TTL_MS`).

## Setup

### 1. Add hooks to your settings

Copy the hook configuration into your project's `.claude/settings.json`. You can use `hooks/settings.example.json` as a reference:

```bash
cp hooks/settings.example.json .claude/settings.json
```

Or merge the hooks block into your existing settings file.

### 2. Configure MCP servers

The hooks require two MCP servers:

- **Qdrant MCP server** — stores and searches code snippets and project documentation
- **claude-mem** — stores decisions, patterns, and bug fixes across sessions

Add them to your `.mcp.json`:

```json
{
  "mcpServers": {
    "qdrant": {
      "command": "npx",
      "args": ["-y", "@mhalder/qdrant-mcp-server"],
      "env": {
        "QDRANT_URL": "https://your-qdrant-instance.cloud",
        "QDRANT_API_KEY": "your-api-key-here",
        "EMBEDDING_PROVIDER": "voyage",
        "VOYAGE_API_KEY": "your-voyage-key-here"
      }
    }
  }
}
```

### 3. Environment variables

| Variable | Purpose | Default |
|----------|---------|---------|
| `HOOK_DOCS_COLLECTION` | Qdrant collection name for docs | `project-docs` |
| `HOOK_INDEX_TIMEOUT` | Indexing timeout in ms | `55000` |
| `HOOK_DOC_BATCH_LIMIT` | Max docs per indexing batch | `20` |
| `HOOK_SEARCH_TIMEOUT` | Search timeout in ms (context + pre-tool hooks) | `9000` |
| `HOOK_CLI_TIMEOUT` | CLI mode timeout in ms | `15000` |
| `HOOK_MAX_CONTEXT` | Max characters of context injected per search | `6000` |
| `HOOK_MIN_PROMPT_LEN` | Minimum prompt length to trigger search | `15` |
| `HOOK_CODE_LIMIT` | Max code results per search | `3` |
| `HOOK_DOCS_LIMIT` | Max doc results per search | `3` |
| `HOOK_MEM_LIMIT` | Max memory results per search | `5` |
| `HOOK_MIN_SCORE` | Minimum similarity score for results | `0.55` |
| `HOOK_GUARD_TTL_MS` | Pre-tool guard lock expiry in ms | `60000` |
| `HOOK_MIN_REASONING_LEN` | Min reasoning length to use as search query | `20` |
| `HOOK_TRANSCRIPT_TAIL_BYTES` | Bytes to read from transcript tail | `20000` |
| `HOOK_MAX_REASONING_LEN` | Max reasoning length extracted from transcript | `1500` |

Set these in your shell profile or `.env` file as needed.

### 4. Running tests

All hooks have comprehensive test suites using Bun's test runner:

```bash
node hooks/context.test.mjs
node hooks/post-commit-index.test.mjs
node hooks/lib/search.test.mjs
node hooks/lib/transcript.test.mjs
```
