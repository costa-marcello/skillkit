# Input/Output Schemas

Complete JSON schemas for hook stdin and stdout.

---

## Common Input Fields

All hooks receive these fields via stdin:

```json
{
  "session_id": "abc123",
  "transcript_path": "~/.claude/projects/.../session.jsonl",
  "cwd": "/current/working/directory",
  "permission_mode": "default",
  "hook_event_name": "PreToolUse"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `session_id` | string | Unique session identifier |
| `transcript_path` | string | Path to session transcript (.jsonl) |
| `cwd` | string | Current working directory |
| `permission_mode` | string | `default`, `plan`, `acceptEdits`, `bypassPermissions` |
| `hook_event_name` | string | Name of the hook event |

---

## Per-Event Schemas

### PreToolUse

**Additional input fields:**

```json
{
  "tool_name": "Bash",
  "tool_input": {
    "command": "npm install",
    "description": "Install dependencies"
  }
}
```

**Output (via stdout):**

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "allow",
    "permissionDecisionReason": "Safe command",
    "updatedInput": { "command": "npm install --save-exact" },
    "additionalContext": "Extra context before tool runs"
  }
}
```

| Output field | Values | Purpose |
|-------------|--------|---------|
| `permissionDecision` | `allow`, `deny`, `ask` | Control whether the tool runs |
| `permissionDecisionReason` | string | Shown to user (and Claude on deny) |
| `updatedInput` | object | Partial update to tool_input fields |
| `additionalContext` | string | Injected before tool execution |

### PermissionRequest

Same input as PreToolUse. Same output schema but without `updatedInput`.

### PostToolUse

**Additional input fields:**

```json
{
  "tool_name": "Write",
  "tool_input": {
    "file_path": "/path/to/file.js",
    "content": "const x = 1;"
  },
  "tool_output": "File created successfully at: /path/to/file.js"
}
```

**Output:** Exit code 2 blocks (stderr becomes the message). Exit 0 with non-JSON stdout injects context in verbose mode.

### PostToolUseFailure

Same schema as PostToolUse. Fires when the tool execution fails instead of succeeds.

### UserPromptSubmit

**Additional input fields:**

```json
{
  "prompt": "Write a function to calculate factorial"
}
```

**Output:** Non-JSON stdout (exit 0) is injected into Claude's context. No decision control.

### Stop

**Additional input fields:**

```json
{
  "stop_hook_active": false
}
```

**Output (command hooks):** Exit code 2 blocks the stop. `stderr` becomes the blocking message.

**Output (prompt/agent hooks):**

```json
{
  "ok": true
}
```

or

```json
{
  "ok": false,
  "reason": "Tests are still failing"
}
```

**Important:** Check `stop_hook_active`. When `true`, allow the stop to avoid infinite loops.

### SubagentStop

Same schema as Stop. Fires when a subagent attempts to stop.

### SubagentStart

**Additional input fields:**

```json
{
  "subagent_type": "general-purpose"
}
```

**Output:** No decision control. Use for inspecting subagent metadata.

### SessionStart

**Additional input fields:**

```json
{
  "source": "startup"
}
```

**Output:** Non-JSON stdout (exit 0) is injected into Claude's context.

```json
{
  "hookSpecificOutput": {
    "hookEventName": "SessionStart",
    "additionalContext": "Current sprint: Sprint 23"
  }
}
```

`CLAUDE_ENV_FILE` is available. Write `export KEY=VALUE` lines to persist environment variables across Bash commands.

### SessionEnd

**Additional input fields:**

```json
{
  "reason": "clear"
}
```

Matchers: `clear`, `logout`, `prompt_input_exit`

**Output:** Ignored. Use for cleanup only.

### PreCompact

**Additional input fields:**

```json
{
  "trigger": "manual",
  "custom_instructions": "Preserve git commit messages"
}
```

Matchers: `manual`, `auto`

**Output:** Non-JSON stdout (exit 0) is included in the compacted context.

### Notification

No additional input fields.

**Output:** Ignored. Use for external alerts only.

### TeammateIdle

No additional input fields beyond common fields.

**Output:** Exit code 2 blocks the teammate from going idle. All other exit codes allow it.

### TaskCompleted

No additional input fields beyond common fields.

**Output:** Exit code 2 blocks task completion. All other exit codes allow it.

---

## Tool-Specific Input Fields

The `tool_input` object varies by tool. Common tools:

### Bash

```json
{
  "tool_input": {
    "command": "npm install",
    "description": "Install dependencies",
    "timeout": 120000,
    "run_in_background": false
  }
}
```

### Write

```json
{
  "tool_input": {
    "file_path": "/path/to/file.js",
    "content": "const x = 1;"
  }
}
```

### Edit

```json
{
  "tool_input": {
    "file_path": "/path/to/file.js",
    "old_string": "const x = 1;",
    "new_string": "const x = 2;",
    "replace_all": false
  }
}
```

### Read

```json
{
  "tool_input": {
    "file_path": "/path/to/file.js",
    "offset": 0,
    "limit": 100
  }
}
```

### Grep

```json
{
  "tool_input": {
    "pattern": "function.*",
    "path": "/path/to/search",
    "output_mode": "content"
  }
}
```

### Glob

```json
{
  "tool_input": {
    "pattern": "**/*.ts",
    "path": "/path/to/search"
  }
}
```

### MCP Tools

```json
{
  "tool_name": "mcp__github__create_issue",
  "tool_input": {
    // MCP tool-specific parameters
  }
}
```

---

## Parsing Input in Hooks

```bash
#!/bin/bash
set -euo pipefail

INPUT="$(cat)"
TOOL_NAME="$(echo "$INPUT" | jq -r '.tool_name')"
CMD="$(echo "$INPUT" | jq -r '.tool_input.command // empty')"
FILE_PATH="$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')"
SESSION_ID="$(echo "$INPUT" | jq -r '.session_id')"
```

Use `// empty` with `jq` to safely handle missing fields.
