---
name: codex
description: Invokes Codex CLI for code analysis, refactoring, or automated editing. Use when the user asks to run codex exec, codex resume, or references OpenAI Codex.
license: MIT
context: fork
---

# Codex Skill Guide

## When to Use Codex
- **Tricky Debugging**: Exceptional at finding elusive bugs that are hard to track down (mystery bugs, race conditions, edge cases)
- **Security Analysis**: Industry-leading vulnerability discovery - found zero-day CVEs in production frameworks, autonomous patch generation
- **Code Review**: Comprehensive security-focused code reviews, identifying vulnerabilities and anti-patterns
- **Complex Refactoring**: Large-scale code transformations with deep understanding of codebase context
- **Agentic Coding**: Multi-step autonomous software engineering tasks

## Defaults

- **Model**: use the Codex CLI default (currently `gpt-5.3-codex`; the CLI picks this automatically, so omit `-m` unless overriding).
- **Reasoning effort**: `medium` unless the user selects otherwise.
- **Sandbox mode**: `read-only` unless edits or network access are needed.
- **stderr**: suppress with `2>/dev/null` to drop thinking tokens. Show stderr only when the user asks for thinking output or when debugging an error.

<instructions>

## Running a Task

1. Ask the user (via `AskUserQuestion`) which reasoning effort to use (`xhigh`, `high`, `medium`, or `low`). Default to `medium` if the user does not specify.
2. Select the sandbox mode required for the task; default to `--sandbox read-only` unless edits or network access are necessary.
3. Assemble the command with the appropriate options:
   - `-m, --model <MODEL>` (omit to use the CLI default)
   - `--config model_reasoning_effort="<high|medium|low>"`
   - `--sandbox <read-only|workspace-write|danger-full-access>`
   - `--full-auto`
   - `-C, --cd <DIR>`
   - `--skip-git-repo-check` (include after confirming with user on first use per session)
4. To continue a previous session, pipe the new prompt via stdin: `echo "your prompt here" | codex exec [flags] resume --last 2>/dev/null`. Flags go between `exec` and `resume`. Resume inherits the model, reasoning effort, and sandbox mode from the original session. Pass flags only to override one of those values.
5. Append `2>/dev/null` to every `codex exec` command to suppress thinking tokens (stderr). Show stderr only if the user asks to see thinking tokens or if you need to debug a failure.
6. Run the command, capture stdout/stderr (filtered as appropriate), and summarise the outcome for the user.
7. After Codex edits files, verify changes before proceeding:
   - Run `git diff` to review modifications
   - Run tests if applicable (`npm test`, `pytest`, etc.)
   - Only commit or continue after validation passes
8. After Codex completes, tell the user: "You can resume this Codex session at any time by saying 'codex resume' or asking me to continue with additional analysis or changes."

### Task Checklist

```
- [ ] 1. Select reasoning effort (default: medium)
- [ ] 2. Select sandbox mode (default: read-only)
- [ ] 3. Assemble command with flags (model defaults to CLI's current default)
- [ ] 4. Get permission for high-impact flags (if --full-auto or danger-full-access)
- [ ] 5. Run command with 2>/dev/null
- [ ] 6. Summarise outcome
- [ ] 7. Verify changes (git diff, tests) if edits made
- [ ] 8. Inform user about resume option
```

## Following Up

- After every `codex` command, use `AskUserQuestion` to confirm next steps, collect clarifications, or decide whether to resume with `codex exec resume --last`.
- Restate the chosen reasoning effort and sandbox mode when proposing follow-up actions.

## Error Handling

- Stop and report failures whenever `codex --version` or a `codex exec` command exits non-zero; request direction before retrying.
- Before using high-impact flags (`--full-auto`, `--sandbox danger-full-access`, `--skip-git-repo-check`), ask the user for permission using `AskUserQuestion` unless permission was already granted.
- When output includes warnings or partial results, summarise them and ask how to adjust using `AskUserQuestion`.

</instructions>

### Quick Reference

Append `2>/dev/null` to every command below to suppress thinking tokens.

| Use case | Sandbox mode | Key flags |
| --- | --- | --- |
| Read-only review or analysis | `read-only` | `--sandbox read-only` |
| Apply local edits | `workspace-write` | `--sandbox workspace-write --full-auto` |
| Permit network or broad access | `danger-full-access` | `--sandbox danger-full-access --full-auto` |
| Resume recent session | Inherited from original | `echo "prompt" \| codex exec resume --last` (add flags between `exec` and `resume` only to override inherited values) |
| Run from another directory | Match task needs | `-C <DIR>` plus other flags |

## Examples

<example>
**User**: "Review this file for security vulnerabilities"

**Claude assembles**:
```bash
codex exec --skip-git-repo-check --config model_reasoning_effort="high" --sandbox read-only 2>/dev/null
```

**After completion**: "Analysis complete. Found 2 potential SQL injection vulnerabilities in `db/queries.ts`. You can resume this Codex session at any time by saying 'codex resume' or asking me to continue with additional analysis."
</example>

<example>
**User**: "Fix the race condition bug in the worker pool"

**Claude assembles**:
```bash
codex exec --skip-git-repo-check --config model_reasoning_effort="high" --sandbox workspace-write --full-auto 2>/dev/null
```

**After edits**: Runs `git diff` to show changes, runs `npm test` to verify fix, then: "Fixed the race condition by adding mutex locks. Tests pass. You can resume this session with 'codex resume'."
</example>

<example>
**User**: "Continue analysing that code" (after previous session)

**Claude assembles**:
```bash
echo "Continue the security analysis, focusing on authentication flows" | codex exec --skip-git-repo-check resume --last 2>/dev/null
```

**Note**: No model/sandbox flags needed -- inherited from original session.
</example>

## Reasoning Effort Levels

Codex CLI context window: 400K input / 128K output. Check [Codex releases](https://github.com/openai/codex/releases) for current pricing and benchmarks.

| Reasoning | Best for |
| --- | --- |
| `xhigh` | Zero-day vulnerability discovery, deep architecture analysis, multi-hour agentic tasks |
| `high` | Security analysis, complex refactoring, performance optimisation, debugging race conditions |
| `medium` (default) | Feature additions, bug fixes, code review, standard refactoring |
| `low` | Quick fixes, formatting, documentation, simple changes |

Cached input tokens receive a significant discount. Repeated context within 24 hours benefits from this automatically.

## CLI Version

Requires a recent Codex CLI version. Check with `codex --version`. See [Codex releases](https://github.com/openai/codex/releases) for the latest version and current default model.

Use the `/model` slash command within a Codex session to switch models, or configure the default in `~/.codex/config.toml`.
