# Tool Names and Advanced Matchers

Complete reference for tool names used in hook matchers.

---

## Built-In Tool Names

| Tool | Description | Common in hooks? |
|------|-------------|-----------------|
| `Bash` | Execute shell commands | Yes |
| `Read` | Read file contents | Sometimes |
| `Write` | Create/overwrite files | Yes |
| `Edit` | Replace strings in files | Yes |
| `Glob` | Find files by pattern | Rarely |
| `Grep` | Search file contents | Rarely |
| `NotebookEdit` | Edit Jupyter notebooks | Rarely |
| `WebFetch` | Fetch URL content | Sometimes |
| `WebSearch` | Search the web | Rarely |
| `Task` | Spawn subagents | Sometimes |
| `Skill` | Invoke a skill | Rarely |
| `AskUserQuestion` | Prompt the user | Rarely |
| `EnterPlanMode` | Switch to plan mode | Rarely |
| `ExitPlanMode` | Leave plan mode | Rarely |
| `LSP` | Language server operations | Rarely |
| `TodoWrite` | Write todo items | Rarely |
| `TaskCreate` | Create team tasks | Rarely |
| `TaskUpdate` | Update team tasks | Rarely |
| `SendMessage` | Message teammates | Rarely |

**MCP tools** follow the pattern `mcp__{server}__{tool}`:
- `mcp__github__create_issue`
- `mcp__memory__store`
- `mcp__filesystem__read`

Run `claude --debug` to discover tool names as they fire.

---

## Matcher Pattern Reference

### Exact match

```json
{ "matcher": "Bash" }
```

Note: `Bash` also matches `BashTool` due to regex substring matching. Use `^Bash$` for exact-only.

### Multiple tools (OR)

```json
{ "matcher": "Write|Edit" }
```

### Anchored exact match

```json
{ "matcher": "^Write$" }
```

Matches only `Write`, not `TodoWrite` or `NotebookWrite`.

### Starts with

```json
{ "matcher": "^mcp__github__" }
```

### All MCP tools

```json
{ "matcher": "mcp__.*" }
```

### Specific MCP server

```json
{ "matcher": "mcp__memory__.*" }
```

### All file operations

```json
{ "matcher": "^(Read|Write|Edit|Glob|Grep)$" }
```

### Negative lookahead (exclude)

```json
{ "matcher": "^(?!Read).*" }
```

Matches everything except `Read`.

### Match all (no matcher)

Omit the `matcher` field entirely. The hook fires for every tool.

---

## Common Mistakes

| Mistake | Problem | Fix |
|---------|---------|-----|
| `"matcher": "bash"` | Case-sensitive. Won't match `Bash`. | Use `"Bash"` |
| `"matcher": "mcp__memory__*"` | `*` is literal, not a wildcard | Use `"mcp__memory__.*"` |
| `"matcher": "Write"` | Substring match hits `TodoWrite`, `NotebookWrite` | Use `"^Write$"` for exact |
| `"matcher": ".*"` on PreToolUse | Fires on every tool call. Prompt hooks here are expensive. | Be specific: `"Bash"` or `"Write\|Edit"` |

---

## Testing Matchers

```bash
# Test in terminal
node -e "console.log(/^Write$/.test('Write'))"        # true
node -e "console.log(/^Write$/.test('TodoWrite'))"     # false
node -e "console.log(/mcp__memory__.*/.test('mcp__memory__store'))"  # true
```

Or use `claude --debug` to see which matchers fire for each tool call.
