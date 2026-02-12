# Hook Templates

Ready-to-use bash templates for common hook patterns.

---

## Pre-Tool Validation

Blocks dangerous commands and warns on credential exposure.

<example>
**Pre-Tool Validation Hook** (`pre-tool-validate.sh`)

```bash
#!/bin/bash
set -euo pipefail

INPUT="$(cat)"
TOOL_NAME="$(echo "$INPUT" | jq -r '.tool_name')"
CMD="$(echo "$INPUT" | jq -r '.tool_input.command // empty')"

if [[ "$TOOL_NAME" == "Bash" ]]; then
  # Block rm -rf /
  if echo "$CMD" | grep -qE 'rm\s+-rf\s+/'; then
    echo '{}' | jq -cn '{
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: "Dangerous rm command detected"
      }
    }'
    exit 0
  fi

  # Block force push to main
  if echo "$CMD" | grep -qE 'git\s+push.*--force.*(main|master)'; then
    echo '{}' | jq -cn '{
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: "Force push to main/master not allowed"
      }
    }'
    exit 0
  fi

  # Soft-warning: possible credential exposure
  if echo "$CMD" | grep -qE '(password|secret|api_key)\s*='; then
    echo '{}' | jq -cn '{
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "ask",
        permissionDecisionReason: "Possible credential exposure in command",
        additionalContext: "Command may include a secret. Confirm intent and avoid committing secrets."
      }
    }'
    exit 0
  fi
fi

exit 0
```

**Behaviour:** Denies `rm -rf /` and force-push to main. Prompts the user on commands containing credential patterns.
</example>

---

## Post-Tool Formatting

Runs language-specific formatters after file edits.

<example>
**Post-Tool Formatter Hook** (`post-tool-format.sh`)

```bash
#!/bin/bash
set -euo pipefail

INPUT="$(cat)"
TOOL_NAME="$(echo "$INPUT" | jq -r '.tool_name')"
FILE_PATH="$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')"

if [[ "$TOOL_NAME" =~ ^(Edit|Write)$ && -n "$FILE_PATH" && -f "$FILE_PATH" ]]; then
  case "$FILE_PATH" in
    *.js|*.ts|*.jsx|*.tsx|*.json|*.md)
      npx prettier --write "$FILE_PATH" 2>/dev/null || true
      ;;
    *.py)
      ruff format "$FILE_PATH" 2>/dev/null || true
      ;;
    *.go)
      gofmt -w "$FILE_PATH" 2>/dev/null || true
      ;;
    *.rs)
      rustfmt "$FILE_PATH" 2>/dev/null || true
      ;;
  esac
fi

exit 0
```

**Behaviour:** Detects file extension and runs the appropriate formatter. Failures are silenced to avoid blocking Claude.
</example>

---

## Post-Tool Security Audit

Checks edited files for hardcoded secrets and debug statements.

<example>
**Post-Tool Security Audit Hook** (`post-tool-audit.sh`)

```bash
#!/bin/bash
set -euo pipefail

INPUT="$(cat)"
TOOL_NAME="$(echo "$INPUT" | jq -r '.tool_name')"
FILE_PATH="$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')"

if [[ "$TOOL_NAME" =~ ^(Edit|Write)$ && -n "$FILE_PATH" && -f "$FILE_PATH" ]]; then
  # Check for hardcoded secrets
  if grep -qE '(password|secret|api_key|token)\s*[:=]\s*["\x27][^"\x27]+["\x27]' "$FILE_PATH"; then
    echo "WARNING: Possible hardcoded secret in $FILE_PATH" >&2
  fi

  # Check for console.log in production code
  if [[ "$FILE_PATH" =~ \.(ts|js|tsx|jsx)$ ]] && grep -q 'console.log' "$FILE_PATH"; then
    echo "NOTE: console.log found in $FILE_PATH" >&2
  fi
fi

exit 0
```

**Behaviour:** Sends warnings to stderr (visible in verbose mode) without blocking tool execution.
</example>

---

## Stop Hook (Run Tests)

Detects the project's test framework and runs tests when Claude finishes.

<example>
**Stop Hook** (`stop-run-tests.sh`)

```bash
#!/bin/bash
set -euo pipefail

# Run tests after Claude finishes
cd "$CLAUDE_PROJECT_DIR"

# Detect test framework
if [[ -f "package.json" ]]; then
  if grep -q '"vitest"' package.json; then
    npm run test 2>&1 | head -50
  elif grep -q '"jest"' package.json; then
    npm test 2>&1 | head -50
  fi
elif [[ -f "pytest.ini" ]] || [[ -f "pyproject.toml" ]]; then
  pytest --tb=short 2>&1 | head -50
fi

exit 0
```

**Behaviour:** Auto-detects vitest, jest, or pytest and runs tests. Output is truncated to 50 lines.
</example>

---

## Session Start

Checks git status and dependency state at session start.

<example>
**Session Start Hook** (`session-start-init.sh`)

```bash
#!/bin/bash
set -euo pipefail

cd "$CLAUDE_PROJECT_DIR"

# Check git status
echo "=== Git Status ==="
git status --short

# Check for uncommitted changes
if ! git diff --quiet; then
  echo "WARNING: Uncommitted changes detected"
fi

# Verify dependencies
if [[ -f "package.json" ]]; then
  if [[ ! -d "node_modules" ]]; then
    echo "NOTE: node_modules missing, run npm install"
  fi
fi

exit 0
```

**Behaviour:** Stdout is injected into Claude's context at session start, providing environment awareness.
</example>

---

## Context Re-Injection After Compaction

Preserves critical instructions when context is compacted.

<example>
**PreCompact Hook** (`pre-compact-preserve.sh`)

```bash
#!/bin/bash
set -euo pipefail

# Inject critical context before compaction
cat <<'CONTEXT'
PRESERVED CONTEXT:
- Always run tests before committing
- Never modify files in vendor/ or node_modules/
- Current sprint: authentication refactor
CONTEXT

exit 0
```

**Behaviour:** Stdout from PreCompact hooks is included in the compacted context, preserving key instructions that would otherwise be lost.
</example>

---

## Async Test Runner

Runs tests in the background after tool use without blocking Claude.

<example>
**Async PostToolUse Test Runner** (settings.json)

```json
{
  "PostToolUse": [
    {
      "matcher": "Edit|Write",
      "hooks": [
        {
          "type": "command",
          "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/async-test.sh",
          "async": true
        }
      ]
    }
  ]
}
```

**Hook script** (`async-test.sh`):

```bash
#!/bin/bash
set -euo pipefail

cd "$CLAUDE_PROJECT_DIR"

# Run tests in background -- results logged, not blocking
if [[ -f "package.json" ]]; then
  npm test >> /tmp/claude-test-results.log 2>&1
fi
```

**Behaviour:** Tests run asynchronously after every file edit. Results go to a log file. Claude is not blocked.
</example>

---

## Session State Persistence

Saves and restores session state across SessionStart and SessionEnd.

<example>
**Session State Pair**

SessionStart hook (`session-restore.sh`):

```bash
#!/bin/bash
set -euo pipefail

STATE_FILE="$CLAUDE_PROJECT_DIR/.claude/session-state.json"

if [[ -f "$STATE_FILE" ]]; then
  echo "=== Restored Session State ==="
  cat "$STATE_FILE"
fi

exit 0
```

SessionEnd hook (`session-save.sh`):

```bash
#!/bin/bash
set -euo pipefail

STATE_FILE="$CLAUDE_PROJECT_DIR/.claude/session-state.json"
mkdir -p "$(dirname "$STATE_FILE")"

# Save current branch and recent files
jq -cn \
  --arg branch "$(cd "$CLAUDE_PROJECT_DIR" && git branch --show-current 2>/dev/null || echo 'unknown')" \
  --arg timestamp "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  '{branch: $branch, saved_at: $timestamp}' > "$STATE_FILE"

exit 0
```

**Behaviour:** SessionEnd saves the working branch and timestamp. SessionStart restores this context into Claude's next session.
</example>

---

## MCP Tool Audit Logger

Logs all MCP tool invocations for compliance auditing.

<example>
**MCP Audit Hook** (settings.json + script)

```json
{
  "PostToolUse": [
    {
      "matcher": "mcp__.*",
      "hooks": [
        {
          "type": "command",
          "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/mcp-audit.sh",
          "async": true
        }
      ]
    }
  ]
}
```

**Hook script** (`mcp-audit.sh`):

```bash
#!/bin/bash
set -euo pipefail

INPUT="$(cat)"
TOOL_NAME="$(echo "$INPUT" | jq -r '.tool_name')"
TIMESTAMP="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

echo "{\"timestamp\":\"$TIMESTAMP\",\"tool\":\"$TOOL_NAME\"}" \
  >> "$CLAUDE_PROJECT_DIR/.claude/mcp-audit.jsonl"

exit 0
```

**Behaviour:** Appends a JSON line for every MCP tool call. Runs asynchronously to avoid blocking.
</example>

---

## Stop Hook with Infinite Loop Guard

Prevents the Stop hook from blocking indefinitely by checking `stop_hook_active`.

<example>
**Safe Stop Hook** (`stop-safe.sh`)

```bash
#!/bin/bash
set -euo pipefail

# Guard against infinite Stop loop
if [[ "${stop_hook_active:-}" == "true" ]]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

# Run checks
if [[ -f "package.json" ]]; then
  RESULT=$(npm test 2>&1 | tail -5)
  if echo "$RESULT" | grep -q "FAIL"; then
    echo "Tests failed. Fix before stopping." >&2
    exit 2
  fi
fi

exit 0
```

**Behaviour:** Checks `stop_hook_active` first. If already in a Stop hook cycle, exits cleanly to break the loop. Otherwise runs tests and blocks on failure.
</example>
