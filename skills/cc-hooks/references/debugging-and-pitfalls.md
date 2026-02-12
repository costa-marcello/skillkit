# Debugging and Common Pitfalls

## Debugging Hooks

```bash
# Test a PostToolUse hook manually (stdin JSON)
export CLAUDE_PROJECT_DIR="$(pwd)"
echo '{"hook_event_name":"PostToolUse","tool_name":"Edit","tool_input":{"file_path":"'"$(pwd)"'/src/app.ts"}}' \
  | bash .claude/hooks/post-tool-format.sh

# Check exit code
echo $?

# Launch Claude Code with hook debug logging
claude --debug

# Toggle verbose hook output during a session
# Press Ctrl+O to see hook execution details
```

---

## Common Pitfalls

| Pitfall | Cause | Fix |
|---------|-------|-----|
| Infinite Stop loop | Stop hook blocks, Claude retries, hook blocks again | Check the `stop_hook_active` environment variable. When `"true"`, allow the stop to proceed. |
| Broken JSON parsing | Shell profile prints text (motd, banner) that corrupts stdin JSON | Run hooks in a clean environment. Add `exec 2>/dev/null` or strip non-JSON lines before `jq`. |
| Hook claims ignorance | Claude executes hooks but says it does not know about them (GitHub #16326) | This is a known bug. Hooks still run correctly. Do not rely on Claude acknowledging hook execution in conversation. |
| Slow hooks block Claude | Synchronous hook takes >60s | Set a shorter `timeout` or use `"async": true` for non-critical hooks. |
| Supply chain risk | Third-party hook scripts with malicious payloads (Snyk ToxicSkills: 36% of scanned skills had flaws) | Audit all hook scripts before use. Pin dependencies. Review code, not just descriptions. |
