# Troubleshooting Hung Gemini Processes

A Gemini process hangs when it waits for interactive approval in a non-interactive shell. This happens when `--approval-mode default` is used in background execution (Claude Code tool calls, CI/CD pipelines).

## Symptoms

- Process running 20+ minutes with 0% CPU usage
- No network activity
- Process state shows 'S' (sleeping)

## Detection

```bash
# Check for hung processes
ps aux | grep -E "gemini.*gemini-3" | grep -v grep

# Get detailed process info
ps -o pid,etime,pcpu,stat,command -p <PID>

# Check network activity (0 connections = hung)
lsof -p <PID> 2>/dev/null | grep -E "(TCP|ESTABLISHED)" | wc -l
```

## Resolution

```bash
# Kill hung Gemini processes
pkill -9 -f "gemini.*gemini-3-pro-preview"

# Or kill a specific PID
kill -9 <PID>

# Verify cleanup
ps aux | grep gemini | grep -v grep
```

## Prevention

1. Always use `--approval-mode yolo` for background/automated tasks.
2. Wrap commands with timeout: `timeout 300 gemini ...`
3. Never use `--approval-mode default` in non-interactive shells.
4. Monitor the first run with `ps` to confirm the process completes.
