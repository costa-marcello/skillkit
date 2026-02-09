---
name: codex
description: Invokes Codex CLI for code analysis, refactoring, or automated editing. Use when the user asks to run codex exec, codex resume, or references OpenAI Codex.
context: fork
---

# Codex Skill Guide

## When to Use Codex
- **Tricky Debugging**: Exceptional at finding elusive bugs that are hard to track down (mystery bugs, race conditions, edge cases)
- **Security Analysis**: Industry-leading vulnerability discovery - found zero-day CVEs in production frameworks, autonomous patch generation
- **Code Review**: Comprehensive security-focused code reviews, identifying vulnerabilities and anti-patterns
- **Complex Refactoring**: Large-scale code transformations with deep understanding of codebase context
- **Agentic Coding**: Multi-step autonomous software engineering tasks

<instructions>

## Running a Task

1. Use `gpt-5.3-codex` model. Ask the user (via `AskUserQuestion`) which reasoning effort to use (`xhigh`, `high`, `medium`, or `low`). Default to `medium` if the user does not specify.
2. Select the sandbox mode required for the task; default to `--sandbox read-only` unless edits or network access are necessary.
3. Assemble the command with the appropriate options:
   - `-m, --model <MODEL>`
   - `--config model_reasoning_effort="<high|medium|low>"`
   - `--sandbox <read-only|workspace-write|danger-full-access>`
   - `--full-auto`
   - `-C, --cd <DIR>`
   - `--skip-git-repo-check` (include after confirming with user on first use per session)
4. When continuing a previous session, use `codex exec --skip-git-repo-check resume --last` via stdin. When resuming, only add configuration flags if explicitly requested by the user (e.g., different model or reasoning effort). Resume syntax: `echo "your prompt here" | codex exec [flags] resume --last 2>/dev/null`. Flags must be placed between `exec` and `resume`.
5. **IMPORTANT**: By default, append `2>/dev/null` to all `codex exec` commands to suppress thinking tokens (stderr). Only show stderr if the user explicitly requests to see thinking tokens or if debugging is needed.
6. Run the command, capture stdout/stderr (filtered as appropriate), and summarize the outcome for the user.
7. **After Codex edits files**, verify changes before proceeding:
   - Run `git diff` to review modifications
   - Run tests if applicable (`npm test`, `pytest`, etc.)
   - Only commit or continue after validation passes
8. **After Codex completes**, inform the user: "You can resume this Codex session at any time by saying 'codex resume' or asking me to continue with additional analysis or changes."

### Task Checklist

```
- [ ] 1. Select model (default: gpt-5.3-codex) and reasoning effort
- [ ] 2. Select sandbox mode (default: read-only)
- [ ] 3. Assemble command with flags
- [ ] 4. Get permission for high-impact flags (if --full-auto or danger-full-access)
- [ ] 5. Run command with 2>/dev/null
- [ ] 6. Summarize outcome
- [ ] 7. Verify changes (git diff, tests) if edits made
- [ ] 8. Inform user about resume option
```

</instructions>

### Quick Reference
| Use case | Sandbox mode | Key flags |
| --- | --- | --- |
| Read-only review or analysis | `read-only` | `--sandbox read-only 2>/dev/null` |
| Apply local edits | `workspace-write` | `--sandbox workspace-write --full-auto 2>/dev/null` |
| Permit network or broad access | `danger-full-access` | `--sandbox danger-full-access --full-auto 2>/dev/null` |
| Resume recent session | Inherited from original | `echo "prompt" \| codex exec [flags] resume --last 2>/dev/null` (flags between exec/resume) |
| Run from another directory | Match task needs | `-C <DIR>` plus other flags `2>/dev/null` |

## Examples

<example>
**User**: "Review this file for security vulnerabilities"

**Claude assembles**:
```bash
codex exec --skip-git-repo-check -m gpt-5.3-codex --config model_reasoning_effort="high" --sandbox read-only 2>/dev/null
```

**After completion**: "Analysis complete. Found 2 potential SQL injection vulnerabilities in `db/queries.ts`. You can resume this Codex session at any time by saying 'codex resume' or asking me to continue with additional analysis."
</example>

<example>
**User**: "Fix the race condition bug in the worker pool"

**Claude assembles**:
```bash
codex exec --skip-git-repo-check -m gpt-5.3-codex --config model_reasoning_effort="high" --sandbox workspace-write --full-auto 2>/dev/null
```

**After edits**: Runs `git diff` to show changes, runs `npm test` to verify fix, then: "Fixed the race condition by adding mutex locks. Tests pass. You can resume this session with 'codex resume'."
</example>

<example>
**User**: "Continue analyzing that code" (after previous session)

**Claude assembles**:
```bash
echo "Continue the security analysis, focusing on authentication flows" | codex exec --skip-git-repo-check resume --last 2>/dev/null
```

**Note**: No model/sandbox flags needed—inherited from original session.
</example>

## Reasoning Effort Levels

Model: `gpt-5.3-codex` (400K input / 128K output). Check [Codex releases](https://github.com/openai/codex/releases) for current pricing and benchmarks.

| Reasoning | Best for |
| --- | --- |
| `xhigh` | Zero-day vulnerability discovery, deep architecture analysis, multi-hour agentic tasks |
| `high` | Security analysis, complex refactoring, performance optimisation, debugging race conditions |
| `medium` (default) | Feature additions, bug fixes, code review, standard refactoring |
| `low` | Quick fixes, formatting, documentation, simple changes |

Cached input tokens receive a significant discount. Repeated context within 24 hours benefits from this automatically.

## Following Up
- After every `codex` command, immediately use `AskUserQuestion` to confirm next steps, collect clarifications, or decide whether to resume with `codex exec resume --last`.
- When resuming, pipe the new prompt via stdin: `echo "new prompt" | codex exec resume --last 2>/dev/null`. The resumed session automatically uses the same model, reasoning effort, and sandbox mode from the original session.
- Restate the chosen model, reasoning effort, and sandbox mode when proposing follow-up actions.

## Error Handling
- Stop and report failures whenever `codex --version` or a `codex exec` command exits non-zero; request direction before retrying.
- Before you use high-impact flags (`--full-auto`, `--sandbox danger-full-access`, `--skip-git-repo-check`) ask the user for permission using AskUserQuestion unless it was already given.
- When output includes warnings or partial results, summarize them and ask how to adjust using `AskUserQuestion`.

## CLI Version

Requires a recent Codex CLI version for gpt-5.3-codex model support (check: `codex --version`). See [Codex releases](https://github.com/openai/codex/releases) for latest. The CLI defaults to `gpt-5.3-codex` on all platforms.

Use `/model` slash command within a Codex session to switch models, or configure default in `~/.codex/config.toml`.
