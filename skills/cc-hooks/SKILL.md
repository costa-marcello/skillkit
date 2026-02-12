---
name: cc-hooks
description: "Creates and improves event-driven hooks for Claude Code automation. Use when building, debugging, or refactoring PreToolUse guards, PostToolUse formatters, Stop hooks for testing, SessionStart environment setup, agent-based verification gates, or integrating Claude Code with CI/CD pipelines."
license: MIT
context: fork
agent: general-purpose
---

# Claude Code Hooks -- Reference

<context>
This skill provides the definitive reference for creating and improving Claude Code hooks -- event-driven scripts that respond to lifecycle events.

**When to use:**

- Building or improving event-driven automation for Claude Code
- Creating or refactoring PreToolUse guards to block dangerous commands
- Debugging hooks that fail silently or produce unexpected results
- Implementing PostToolUse formatters, linters, or auditors
- Adding Stop hooks for testing or notifications
- Setting up SessionStart/SessionEnd for environment management
- Integrating Claude Code with CI/CD pipelines (headless mode)
</context>

---

## Quick Reference

| Event | Decision Control | Hook Types | Use Case |
|-------|-----------------|------------|----------|
| `SessionStart` | No | command | Initialise environment, set `CLAUDE_ENV_FILE` |
| `UserPromptSubmit` | No | command, prompt | Preprocess/validate input |
| `PreToolUse` | allow/deny/ask + updatedInput | command, prompt | Validate, block dangerous commands |
| `PermissionRequest` | allow/deny/ask | command, prompt | Auto-allow/deny permissions |
| `PostToolUse` | block | command, prompt | Format, audit, notify |
| `PostToolUseFailure` | block | command, prompt | Capture failures, add guidance |
| `Notification` | No | command | Alert integrations |
| `SubagentStart` | No | command | Inspect subagent metadata |
| `SubagentStop` | block | command, prompt, agent | Verify subagent completion |
| `Stop` | block | command, prompt, agent | Run tests, summarise |
| `TeammateIdle` | exit code 2 only | command | Enforce quality gates before idle |
| `TaskCompleted` | exit code 2 only | command | Block task completion if criteria not met |
| `PreCompact` | No | command | Preserve critical context (matchers: `manual`, `auto`) |
| `SessionEnd` | No | command | Cleanup, save state (matchers: `clear`, `logout`, `prompt_input_exit`) |

## Hook Structure

```text
.claude/hooks/
├── pre-tool-validate.sh
├── post-tool-format.sh
├── post-tool-audit.sh
├── stop-run-tests.sh
└── session-start-init.sh
```

---

## Configuration

### settings.json

```json
{ "hooks": {
  "PostToolUse": [{ "matcher": "Edit|Write", "hooks": [
    { "type": "command", "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/post-tool-format.sh" }
  ]}],
  "PreToolUse": [{ "matcher": "Bash", "hooks": [
    { "type": "command", "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/pre-tool-validate.sh" }
  ]}],
  "Stop": [{ "hooks": [
    { "type": "command", "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/stop-run-tests.sh" }
  ]}]
}}
```

---

## Execution Model

<instructions>

Hooks receive a JSON payload via stdin (treat it as untrusted input) and run with your user permissions (outside the Bash tool sandbox). Default timeout is 60s per hook command. All matching hooks run in parallel. Identical commands are deduplicated.

### Hook Input (stdin)

```json
{ "hook_event_name": "PreToolUse", "tool_name": "Bash", "tool_input": { "command": "ls -la" } }
```

### Environment Variables (shell)

| Variable | Description |
|----------|-------------|
| `CLAUDE_PROJECT_DIR` | Absolute project root where Claude Code started |
| `CLAUDE_PLUGIN_ROOT` | Plugin root (plugin hooks only) |
| `CLAUDE_CODE_REMOTE` | `"true"` in remote/web environments; empty/local otherwise |
| `CLAUDE_ENV_FILE` | File path to persist `export ...` lines (available in SessionStart; check docs for Setup support) |

---

## Exit Codes

| Code | Meaning | Notes |
|------|---------|------|
| `0` | Success | JSON written to stdout is parsed for structured control |
| `2` | Blocking error | `stderr` becomes the message; JSON in stdout is ignored |
| Other | Non-blocking error | Execution continues; `stderr` is visible in verbose mode |

Stdout injection note: for `UserPromptSubmit`, `SessionStart`, and `Setup`, non-JSON stdout (exit 0) is injected into Claude's context. Most other events show stdout only in verbose mode.

---

## Decision Control + Input Modification

PreToolUse hooks can allow/deny/ask and optionally modify the tool input via `updatedInput`.

### Hook Output Schema

```json
{ "hookSpecificOutput": {
  "hookEventName": "PreToolUse",
  "permissionDecision": "allow",
  "permissionDecisionReason": "Reason shown to user (and to Claude on deny)",
  "updatedInput": { "command": "echo 'modified'" },
  "additionalContext": "Extra context added before tool runs"
}}
```

Older `decision`/`reason` fields are deprecated. Use the `hookSpecificOutput.*` fields.

<example>
**Redirect Sensitive File Edits**

Input: PreToolUse event for an Edit targeting `package-lock.json`.
Output: Redirect the edit to `/dev/null` with an allow decision.

```bash
#!/bin/bash
set -euo pipefail

INPUT="$(cat)"
FILE_PATH="$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')"

# Redirect package-lock.json edits to /dev/null
if [[ "$FILE_PATH" == *"package-lock.json" ]]; then
  UPDATED_INPUT="$(echo "$INPUT" | jq -c '.tool_input | .file_path = "/dev/null"')"
  jq -cn --argjson updatedInput "$UPDATED_INPUT" '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "allow",
      permissionDecisionReason: "Redirected write to /dev/null",
      updatedInput: $updatedInput
    }
  }'
  exit 0
fi

echo '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"allow"}}'
```
</example>

<example>
**Strip Sensitive Files from Git Add**

Input: PreToolUse event for a Bash command starting with `git add` that includes `.env` files.
Output: Modified command with `.env` references removed.

```bash
#!/bin/bash
set -euo pipefail

INPUT="$(cat)"
TOOL_NAME="$(echo "$INPUT" | jq -r '.tool_name')"
CMD="$(echo "$INPUT" | jq -r '.tool_input.command // empty')"

if [[ "$TOOL_NAME" == "Bash" && "$CMD" =~ ^git[[:space:]]+add ]]; then
  # Remove .env files from staging
  SAFE_CMD="$(echo "$CMD" | sed 's/\.env[^ ]*//g')"
  if [[ "$SAFE_CMD" != "$CMD" ]]; then
    echo '{}' | jq -cn --arg cmd "$SAFE_CMD" '{
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "allow",
        permissionDecisionReason: "Removed .env from git add",
        updatedInput: { command: $cmd }
      }
    }'
    exit 0
  fi
fi

echo '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"allow"}}'
```
</example>

<example>
**Prompt-Based Stop Hook**

Input: Stop event with task context.
Output: LLM evaluates whether all tasks are complete.

```json
{ "hooks": { "Stop": [{ "hooks": [{ "type": "prompt", "prompt": "Evaluate whether Claude should stop. Context JSON: $ARGUMENTS. Return {\"ok\": true} if all tasks are complete, otherwise {\"ok\": false, \"reason\": \"what remains\"}.", "timeout": 30 }] }] }}
```

Response schema:
- Allow: `{"ok": true}`
- Block: `{"ok": false, "reason": "Explanation shown to Claude"}`
</example>

<example>
**PostToolUse Audit Logger**

Input: PostToolUse event after any file write.
Output: Append a JSON line to an audit log (non-blocking).

```bash
#!/bin/bash
set -euo pipefail

INPUT="$(cat)"
TOOL_NAME="$(echo "$INPUT" | jq -r '.tool_name')"
FILE_PATH="$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')"
TIMESTAMP="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

if [[ -n "$FILE_PATH" ]]; then
  echo "{\"timestamp\":\"$TIMESTAMP\",\"tool\":\"$TOOL_NAME\",\"file\":\"$FILE_PATH\"}" \
    >> "$CLAUDE_PROJECT_DIR/.claude/edit-audit.jsonl"
fi

exit 0
```

Settings matcher: `"matcher": "Edit|Write"` with `"async": true`.
</example>

<example>
**SessionStart Environment Setup**

Input: SessionStart event at session launch.
Output: Write environment variables to `CLAUDE_ENV_FILE` so they persist across Bash calls.

```bash
#!/bin/bash
set -euo pipefail

cd "$CLAUDE_PROJECT_DIR"

# Persist environment variables for the session
if [[ -n "${CLAUDE_ENV_FILE:-}" ]]; then
  echo "export PROJECT_NAME=$(basename "$CLAUDE_PROJECT_DIR")" >> "$CLAUDE_ENV_FILE"
  echo "export NODE_ENV=development" >> "$CLAUDE_ENV_FILE"
fi

# Inject context into Claude's conversation
echo "=== Session Context ==="
git branch --show-current 2>/dev/null || echo "Not a git repo"
echo "Node: $(node --version 2>/dev/null || echo 'not installed')"

exit 0
```

Stdout is injected into Claude's context. `CLAUDE_ENV_FILE` exports persist across all Bash commands in the session.
</example>

---

## Prompt-Based Hooks

For complex decisions, use LLM-evaluated hooks (`type: "prompt"`) instead of bash scripts. They are most useful for `Stop` and `SubagentStop` decisions.

Default to command hooks for fast, deterministic checks. Use prompt hooks only when the decision requires natural language reasoning:

```json
{ "Stop": [{ "hooks": [
  { "type": "command", "command": ".claude/hooks/quick-check.sh" },
  { "type": "prompt", "prompt": "Verify code quality meets standards" }
]}] }
```

---

## Matchers

Matchers filter which tool triggers the hook:

- Exact match: `Write` matches only the Write tool
- Regex: `Edit|Write` or `Notebook.*`
- MCP tools: `mcp__github__.*` or `mcp__<server>__<tool>` (regex patterns)
- Match all: `*` (also works with `""` or omitted matcher)
- Event-specific matchers: `PreCompact` supports `manual`/`auto`; `SessionEnd` supports `clear`/`logout`/`prompt_input_exit`

---

## Security Best Practices

All hook templates already demonstrate `set -euo pipefail`, quoted variables, and absolute paths. Beyond those defaults, check for:

- No `eval` with untrusted input (stdin JSON is attacker-controlled)
- Target <1 second execution per hook. Profile with `time bash .claude/hooks/your-hook.sh < test-input.json` if a hook exceeds this
- Append structured JSON lines to an audit log file (see the Bash Command Logger and MCP Audit Logger templates in [references/hook-templates.md](references/hook-templates.md))
- Test hooks manually before deploying (see [references/troubleshooting.md](references/troubleshooting.md))

---

## Agent-Based Hooks

For multi-turn verification, use `type: "agent"`. An agent hook spawns a subagent that can use tools (up to 50 turns) to verify work before allowing Claude to proceed. Supported on `Stop` and `SubagentStop` events.

```json
{ "Stop": [{ "hooks": [{ "type": "agent", "prompt": "Run the test suite and verify all tests pass. Check that no console.log statements remain in production files.", "timeout": 120 }] }] }
```

Agent hooks return the same `{"ok": true}` / `{"ok": false, "reason": "..."}` schema as prompt hooks, but can use tools to gather evidence before deciding.

---

## Async Hooks

Add `"async": true` to run hooks in the background without blocking Claude. Useful for logging, notifications, and slow post-processing.

```json
{ "PostToolUse": [{ "matcher": "Bash", "hooks": [{ "type": "command", "command": ".claude/hooks/async-test-runner.sh", "async": true }] }] }
```

Async hooks do not block Claude's response. Their exit codes and stdout are ignored for decision control. Use them for fire-and-forget tasks like audit logging or CI triggers.

---

## Hook Composition

Multiple hooks on the same event run in parallel:

```json
{ "PostToolUse": [{ "matcher": "Edit|Write", "hooks": [
  { "type": "command", "command": ".claude/hooks/format.sh" },
  { "type": "command", "command": ".claude/hooks/audit.sh" },
  { "type": "command", "command": ".claude/hooks/notify.sh" }
]}] }
```

If you need strict ordering (format, then lint, then test), create one wrapper script that runs them sequentially.

---

## Verification

After creating or modifying a hook, verify it works before relying on it:

```bash
# 1. Test with sample input
export CLAUDE_PROJECT_DIR="$(pwd)"
echo '{"hook_event_name":"PreToolUse","tool_name":"Bash","tool_input":{"command":"ls"}}' \
  | bash .claude/hooks/your-hook.sh

# 2. Check exit code
echo $?  # 0 = success, 2 = blocking error

# 3. Validate JSON output
echo '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"allow"}}' | jq .

# 4. Run Claude with debug mode to confirm hook fires
claude --debug
```

See [references/troubleshooting.md](references/troubleshooting.md) for full diagnostics when hooks fail silently.

</instructions>

---

## References

- [references/hook-templates.md](references/hook-templates.md) -- 15 ready-to-use templates: pre-tool validation, post-tool formatting, security audit, stop hooks, session start/end, context re-injection, async test runner, session state persistence, MCP audit logging, infinite loop guard, desktop notifications, bash logging, protected files, sprint context, session archiving
- [references/input-output-schemas.md](references/input-output-schemas.md) -- Per-event JSON schemas (stdin input and stdout output) for all 14 hook events, plus tool-specific `tool_input` fields for Bash, Write, Edit, Read, Grep, Glob, and MCP tools
- [references/command-vs-prompt.md](references/command-vs-prompt.md) -- Decision tree for choosing between command, prompt, and agent hook types. Performance comparison, prompt authoring guidance, and combining strategies
- [references/tool-names.md](references/tool-names.md) -- Complete tool name reference (19+ built-in tools, MCP naming convention), advanced matcher patterns (anchored, negative lookahead, case-insensitive), and common matcher mistakes
- [references/troubleshooting.md](references/troubleshooting.md) -- Step-by-step diagnostics for hooks not triggering, command failures, prompt issues, infinite loops, output visibility, timeouts, environment variables, and common pitfalls
