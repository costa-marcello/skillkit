# Troubleshooting

Step-by-step diagnostics for common hook problems.

---

## Debugging Workflow

```bash
# Step 1: Enable debug mode
claude --debug

# Step 2: Toggle verbose hook output mid-session
# Press Ctrl+O to see hook execution details

# Step 3: Test a hook manually with stdin JSON
export CLAUDE_PROJECT_DIR="$(pwd)"
echo '{"hook_event_name":"PreToolUse","tool_name":"Bash","tool_input":{"command":"ls"}}' \
  | bash .claude/hooks/pre-tool-validate.sh

# Step 4: Check exit code
echo $?

# Step 5: Add logging inside the hook
echo "Hook fired: $(date)" >> /tmp/hook-debug.log

# Step 6: Validate JSON output
echo '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"allow"}}' | jq .
```

---

## Hook Not Triggering

**Diagnostic steps:**

1. Run `claude --debug` and look for:
   ```
   [DEBUG] Getting matching hook commands for PreToolUse with query: Bash
   [DEBUG] Found 0 hooks
   ```

2. Check hook file location. Must be one of:
   - Project: `.claude/settings.json`
   - User: `~/.claude/settings.json`

3. Validate JSON syntax:
   ```bash
   jq . .claude/settings.json
   ```
   Invalid JSON is silently ignored.

4. Check matcher case sensitivity. Tool names are PascalCase:
   - `"Bash"` not `"bash"`
   - `"Write"` not `"write"`

5. Test matcher in isolation:
   ```bash
   node -e "console.log(/Bash/.test('Bash'))"
   ```

---

## Command Hook Failing

**Diagnostic steps:**

1. Check debug output for:
   ```
   [DEBUG] Hook command completed with status 1: <error message>
   ```

2. Test the command directly:
   ```bash
   echo '{"tool_name":"Bash","tool_input":{"command":"ls"}}' | /path/to/hook.sh
   ```

3. Check executable permissions:
   ```bash
   chmod +x /path/to/hook.sh
   ```

4. Verify dependencies:
   ```bash
   which jq       # Required for JSON parsing
   which prettier  # If hook runs formatters
   ```

5. Check paths. Use `$CLAUDE_PROJECT_DIR` for project-relative paths:
   ```json
   { "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/script.sh" }
   ```

---

## Prompt Hook Not Working

**Common causes:**

1. **Missing `$ARGUMENTS`** -- the prompt receives no input:
   ```
   ✗ "Validate this command"
   ✓ "Validate this command: $ARGUMENTS"
   ```

2. **Ambiguous instructions** -- LLM can't decide:
   ```
   ✗ "Is this ok? $ARGUMENTS"
   ✓ "Block if command contains 'rm -rf' or force push. Return: {\"ok\": true} or {\"ok\": false, \"reason\": \"why\"}"
   ```

3. **No output format specified** -- LLM returns plain text instead of JSON. Always specify:
   ```
   Return ONLY valid JSON: {"ok": true} or {"ok": false, "reason": "explanation"}
   ```

---

## Hook Blocks Everything

**Diagnostic steps:**

1. Test with a known-safe input:
   ```bash
   echo '{"tool_name":"Read","tool_input":{"file_path":"test.txt"}}' | /path/to/hook.sh
   ```

2. Check if the default path returns a blocking response. Your hook should default to allowing:
   ```bash
   # Default to allow
   echo '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"allow"}}'
   ```

3. Review conditions. Common logic error:
   ```bash
   # Wrong: blocks everything not in the allowlist
   if [[ "$CMD" != "safe_command" ]]; then deny; fi

   # Right: blocks only known dangerous patterns
   if [[ "$CMD" =~ rm\ -rf ]]; then deny; fi
   ```

---

## Infinite Stop Loop

**Cause:** Stop hook blocks, Claude retries, hook blocks again, forever.

**Fix:** Check `stop_hook_active` before blocking:

```bash
INPUT="$(cat)"
STOP_ACTIVE="$(echo "$INPUT" | jq -r '.stop_hook_active')"

if [[ "$STOP_ACTIVE" == "true" ]]; then
  exit 0  # Break the loop
fi

# Your validation logic here
```

---

## Output Not Visible

| Situation | Cause | Fix |
|-----------|-------|-----|
| stdout not shown | Most events only show stdout in verbose mode | Use `claude --debug` or Ctrl+O |
| stderr not shown | stderr only visible in verbose mode (exit 0) | Use exit code 2 for blocking errors (stderr becomes the message) |
| SessionStart stdout missing | Hook returned JSON instead of plain text | For context injection, print plain text to stdout |

Events where stdout is injected into Claude's context: `UserPromptSubmit`, `SessionStart`, `PreCompact`.

---

## Timeouts

**Default:** 60 seconds per hook command.

**Symptoms:**
```
[DEBUG] Hook command timed out after 60000ms
```

**Fixes:**

1. Increase timeout:
   ```json
   { "type": "command", "command": "slow-script.sh", "timeout": 120 }
   ```

2. Use `"async": true` for non-blocking hooks:
   ```json
   { "type": "command", "command": "slow-script.sh", "async": true }
   ```

3. Optimise the script. Avoid network calls in synchronous hooks.

---

## Environment Variables Not Working

| Variable | Correct | Common mistake |
|----------|---------|---------------|
| `$CLAUDE_PROJECT_DIR` | Project root | `$CLAUDE_PROJECT_ROOT` (wrong name) |
| `$CLAUDE_ENV_FILE` | SessionStart only | Using in other events (not available) |
| `$CLAUDE_PLUGIN_ROOT` | Plugin hooks only | Using in project hooks (empty) |

In shell scripts, you can also parse `cwd` from stdin JSON:

```bash
CWD="$(echo "$INPUT" | jq -r '.cwd')"
```

---

## Common Pitfalls

| Pitfall | Cause | Fix |
|---------|-------|-----|
| Broken JSON parsing | Shell profile prints text (motd, banner) that corrupts stdin | Run hooks in a clean environment. Strip non-JSON lines before `jq`. |
| Hook claims ignorance | Claude says it does not know about hooks (GitHub #16326) | Known bug. Hooks still run. Do not rely on Claude acknowledging them. |
| Supply chain risk | Third-party hook scripts with malicious payloads (Snyk ToxicSkills: 36% had flaws) | Audit all hook scripts. Pin dependencies. Review code, not descriptions. |
| Matcher fires too broadly | `"Write"` matches `TodoWrite` and `NotebookWrite` | Use anchored pattern: `"^Write$"` |
| Permission denied | Script not executable | `chmod +x script.sh` |
