# Command vs Prompt Hooks

Decision guide for choosing between command-based and prompt-based hooks.

---

## Decision Tree

```
Need a hook?
│
├─ Simple yes/no validation?
│  └─ COMMAND (faster, free)
│
├─ Natural language understanding needed?
│  └─ PROMPT (LLM evaluation)
│
├─ External tool interaction?
│  └─ COMMAND (formatters, linters, git)
│
├─ Complex reasoning required?
│  └─ PROMPT (context-aware decisions)
│
├─ Multi-turn tool verification?
│  └─ AGENT (up to 50 tool-use turns)
│
└─ Logging or notification only?
   └─ COMMAND (no decision needed)
```

---

## Characteristics

| Aspect | Command | Prompt | Agent |
|--------|---------|--------|-------|
| **Execution** | Shell command | LLM evaluates prompt | Subagent with tools |
| **Speed** | <100ms | 1-3s | 5-60s |
| **Cost** | Free | ~$0.001-0.01/call | Higher (multi-turn) |
| **Complexity** | Shell scripting | Natural language | Full tool access |
| **Context awareness** | Limited | High | Highest |
| **Reasoning** | No | Yes | Yes + tool verification |
| **Supported events** | All | Most | Stop, SubagentStop |

---

## When to Use Each

### Command hooks

Use for:
- File operations (check existence, read metadata)
- Running tools (prettier, eslint, gofmt)
- Pattern matching (grep, regex)
- Logging to files
- Desktop notifications
- Fast validation (file size, permissions, blocked commands)

Do not use for:
- Natural language analysis
- Complex decision logic
- Context-aware validation

### Prompt hooks

Use for:
- Semantic validation (is this commit message good?)
- Complex decision trees
- Context-aware checks (should Claude stop now?)
- Code quality reasoning
- Intent analysis

Do not use for:
- Simple pattern matching (use command + grep)
- High-frequency events (too slow and expensive)
- Non-decision tasks (logging, notifications)

### Agent hooks

Use for:
- Verifying test suites pass before stopping
- Multi-file validation that requires reading code
- Complex verification that needs tool access

Only available on Stop and SubagentStop events.

---

## Performance Guidance

**High-frequency events** (PreToolUse, PostToolUse): prefer command hooks. Every tool call triggers these, so prompt hooks add latency and cost.

**Low-frequency events** (Stop, UserPromptSubmit): prompt hooks are fine. Cost and latency matter less when they fire once per session.

**Combine both** when you need a fast pre-filter and a smart validator:

```json
{
  "PreToolUse": [
    {
      "matcher": "Bash",
      "hooks": [
        { "type": "command", "command": ".claude/hooks/quick-check.sh" },
        { "type": "prompt", "prompt": "Validate safety: $ARGUMENTS" }
      ]
    }
  ]
}
```

All hooks in an array run in parallel. If any blocks, execution stops.

---

## Writing Effective Prompt Hooks

**Be specific about output format:**

```
Return JSON: {"ok": true} or {"ok": false, "reason": "explanation"}
```

**Provide clear criteria:**

```
Block if:
1. Command contains 'rm -rf /'
2. Force push to main branch
3. Credentials in plain text

Otherwise approve.
```

**Always use $ARGUMENTS:**

```
Analyse this input: $ARGUMENTS

Check for security issues...
```

`$ARGUMENTS` is replaced with the hook input JSON at runtime.

**Keep prompts focused.** A prompt hook that tries to check 10 things will be slower and less accurate than one that checks 2-3 specific things.
