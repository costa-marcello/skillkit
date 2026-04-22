---
name: gemini
description: "Invokes Gemini CLI for code review, plan analysis, frontend development, or large-context (>200k token) processing. Use when the user asks to run Gemini CLI, references Google Gemini, or needs analysis that benefits from a 1M-token context window."
license: MIT
context: fork
---

# Gemini Skill Guide

## When to Use Gemini

- **Frontend Development**: Building UI components and pages (Gemini 3 Pro produces exceptional frontend quality). When the `frontend-design` skill is installed, load it and pass its guidelines to Gemini for design-driven results.
- **Code Review**: Comprehensive reviews across multiple files
- **Plan Review**: Analysing architectural plans, technical specifications, or project roadmaps
- **Big Context Processing**: Tasks requiring >200k tokens of context (entire codebases, documentation sets)
- **Multi-file Analysis**: Understanding relationships and patterns across many files

<instructions>

## Running a Task

1. Use the latest Gemini 3 Pro model by default (currently `gemini-3-pro-preview` at time of writing). Ask the user which model to use only if they want to change from the default. See the Model Selection table below for alternatives.

2. Select the approval mode based on execution context:
   - `yolo` -- Required for background/automated tasks (Claude Code tool calls, CI/CD). Prevents hung processes.
   - `auto_edit` -- Auto-approves edit tools only. Good for code reviews with suggestions.
   - `default` -- Prompts for approval. Only works in interactive terminal sessions. Never use in background shells.

3. Assemble the command:
   - `-m, --model <MODEL>` -- Model selection
   - `--approval-mode <default|auto_edit|yolo>` -- Control tool approval
   - `-y, --yolo` -- Shorthand for `--approval-mode yolo`
   - `-i, --prompt-interactive "prompt"` -- Execute prompt then continue interactively
   - `--include-directories <DIR>` -- Additional directories to include in workspace
   - `-s, --sandbox` -- Run in sandbox mode for isolation

4. For background/automated tasks, always use `--approval-mode yolo` and wrap with timeout:
   ```bash
   timeout 300 gemini -m gemini-3-pro-preview --approval-mode yolo "Your prompt here"
   ```

5. Run the command and capture the output.

6. After Gemini completes, inform the user: "The Gemini analysis is complete. You can start a new Gemini session for follow-up analysis."

### Frontend Design Integration

Gemini 3 Pro is exceptionally strong at frontend design. When the task involves building UI components, pages, or visual interfaces:

1. Check whether the `frontend-design` skill is installed.
2. If installed, load it and include its design guidelines (typography, colour, motion, accessibility) in the prompt sent to Gemini. This gives Gemini concrete aesthetic direction and prevents generic "AI slop" output.
3. If not installed, proceed with Gemini alone -- it still produces high-quality frontend code, but without the opinionated design system the `frontend-design` skill provides.

The combination works well because Gemini 3 Pro handles complex UI reasoning and the `frontend-design` skill supplies the design constraints that turn competent code into distinctive interfaces.

### Task Checklist

```
- [ ] 1. Confirm model (default: gemini-3-pro-preview)
- [ ] 2. Select approval mode (default: yolo for background)
- [ ] 3. Assemble command with flags
- [ ] 4. Wrap with timeout for background tasks
- [ ] 5. Run command
- [ ] 6. Summarise outcome to user
- [ ] 7. Ask user about next steps
```

</instructions>

### Quick Reference

| Use case | Approval mode | Command pattern |
| --- | --- | --- |
| Background code review | `yolo` | `timeout 300 gemini -m gemini-3-pro-preview --approval-mode yolo "prompt"` |
| Background analysis | `yolo` | `timeout 300 gemini -m gemini-3-pro-preview --approval-mode yolo "prompt"` |
| Speed-critical background | `yolo` | `timeout 300 gemini -m gemini-3-flash --approval-mode yolo "prompt"` |
| Cost-optimised background | `yolo` | `timeout 300 gemini -m gemini-2.5-flash --approval-mode yolo "prompt"` |
| Interactive code review | `default` | `gemini -m gemini-3-pro-preview --approval-mode default` |
| Code review with auto-edits | `auto_edit` | `gemini -m gemini-3-pro-preview --approval-mode auto_edit` |
| Interactive with prompt | `auto_edit` | `gemini -m gemini-3-pro-preview -i "prompt" --approval-mode auto_edit` |
| Multi-directory analysis | `yolo` | `--include-directories <DIR1> --include-directories <DIR2>` |

### Model Selection

Default to the latest Gemini 3 Pro model (currently `gemini-3-pro-preview`). Only switch when the user explicitly asks for speed, lower cost, or a legacy model.

| Model | Best for | Key trade-off |
| --- | --- | --- |
| `gemini-3-pro-preview` (default) | Complex reasoning, coding, frontend UI, agentic tasks | Highest quality, moderate cost |
| `gemini-3-flash` | Speed-critical applications needing sub-second latency | Distilled from 3 Pro, lower accuracy |
| `gemini-2.5-pro` | Legacy: stable all-around performance | Superseded by 3 Pro; do not pick unless user requests |
| `gemini-2.5-flash` | Legacy: high-volume cost-optimised tasks | Superseded; do not pick unless user requests |
| `gemini-2.5-flash-lite` | Legacy: maximum throughput | Superseded; do not pick unless user requests |

All models support 1M input tokens and 64-65k output tokens.

## Examples

<example>
**User**: "Review this codebase for security issues"

**Claude assembles**:
```bash
timeout 300 gemini -m gemini-3-pro-preview --approval-mode yolo \
  "Perform a comprehensive code review focusing on:
   1. Security vulnerabilities
   2. Performance issues
   3. Code quality and maintainability
   4. Best practices violations"
```

**After completion**: "Gemini found 3 potential issues: an SQL injection risk in `db/queries.ts`, an unvalidated redirect in `auth/callback.ts`, and a missing rate limiter on the `/api/upload` endpoint. You can start a new Gemini session for deeper analysis of any finding."
</example>

<example>
**User**: "Analyse the architecture of this project"

**Claude assembles**:
```bash
timeout 300 gemini -m gemini-3-pro-preview --approval-mode yolo \
  "Analyse the entire codebase to understand:
   1. Overall architecture
   2. Key patterns and conventions
   3. Potential technical debt
   4. Refactoring opportunities"
```

**After completion**: Summarises the architectural findings and asks the user about next steps.
</example>

<example>
**User**: "Build a responsive dashboard component"

**Claude checks**: `frontend-design` skill is installed. Loads it and extracts design guidelines.

**Claude assembles**:
```bash
timeout 300 gemini -m gemini-3-pro-preview --approval-mode yolo \
  "Build a responsive dashboard component with:
   1. Clean, modern UI design
   2. Smooth animations and transitions
   3. Accessible markup (ARIA labels, keyboard navigation)
   4. Mobile-first responsive layout

   Design constraints (from frontend-design skill):
   - Use distinctive typography (avoid Inter/Roboto/Arial)
   - Define colours as CSS custom properties, no hardcoded hex
   - Add entry animations and hover/scroll interactions
   - Respect prefers-reduced-motion
   - Every element must earn its place"
```

**After completion**: Reviews generated code with `git diff`, verifies accessibility and design quality, then reports results.
</example>

<example>
**User**: "Quick review of this file, speed matters"

**Claude assembles** (uses Flash for speed):
```bash
timeout 120 gemini -m gemini-3-flash --approval-mode yolo \
  "Review this file for bugs and anti-patterns"
```
</example>

## Following Up

- Gemini CLI sessions are one-shot or interactive. There is no built-in resume.
- For follow-up analysis, start a new Gemini session with context from previous findings.
- When proposing follow-up actions, restate the chosen model and approval mode.

## Error Handling

- Stop and report failures whenever `gemini --version` or a Gemini command exits non-zero. Request direction before retrying.
- Before using `--approval-mode yolo` for the first time in a session, confirm with the user.
- When output includes warnings or partial results, summarise them and ask how to adjust.
- For hung process detection and resolution, see `references/troubleshooting.md`.

## Tips for Large Context Processing

1. **Be specific**: Provide clear, structured prompts for what to analyse.
2. **Use include-directories**: Explicitly specify all relevant directories.
3. **Break down complex tasks**: Even with 1M tokens, structured analysis is more effective.
4. **Save findings**: Ask Gemini to output structured reports that can be saved for reference.

## CLI Version

Requires a Gemini CLI version that supports the Gemini 3 model family (v0.16.0 was the minimum at time of writing). Check with `gemini --version` and upgrade if the command fails with an unknown-model error.
