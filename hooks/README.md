# Hooks

Three hooks that add context intelligence to Claude Code. They connect Claude to your project's vector store and memory system so every prompt and commit benefits from prior knowledge.

## context.mjs (UserPromptSubmit)

Runs on every prompt. Searches Qdrant (code snippets and project docs) and claude-mem (decisions, patterns, bug fixes) to inject relevant context into Claude's system message. This gives Claude awareness of your codebase and past decisions without you needing to paste anything manually.

## post-commit-index.mjs (PostToolUse: Bash)

Detects git commit commands and re-indexes changed files into Qdrant. Handles both code files (via CodeIndexer) and documentation (via QdrantManager). This keeps your vector store up to date after every commit so future prompts always reference the latest code.

## pre-tool-context.mjs

Injects context before tool execution.

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

Set these in your shell profile or `.env` file as needed.
