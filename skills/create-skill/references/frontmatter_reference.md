# YAML Frontmatter Reference

Configure skill behavior using these fields between `---` markers:

```yaml
---
name: my-skill
description: What this skill does and when to use it. Use when...
context: fork
agent: Explore
disable-model-invocation: true
allowed-tools: Read, Grep, Bash(git *)
---
```

## Field Reference

| Field | Required | Description |
|-------|----------|-------------|
| `name` | No | Display name for the skill. If omitted, uses the directory name. Lowercase letters, numbers, and hyphens only (max 64 characters). No reserved words (anthropic, claude). Noun or short-phrase form preferred (pdf, changelog, smart-merge). |
| `description` | Recommended | What the skill does and when to use it. Claude uses this to decide when to apply the skill. If omitted, uses the first paragraph of markdown content. **Max 1024 characters.** |
| `context` | No | **Set to `fork` for task-based skills.** Ensures fresh context for each invocation and prevents context pollution. Without it, skills run inline and cannot be used by subagents. |
| `agent` | No | Which subagent type to use when `context: fork` is set. Options: `Explore`, `Plan`, `general-purpose`, or custom agents from `.claude/agents/`. Default: `general-purpose`. |
| `disable-model-invocation` | No | Set to `true` to prevent Claude from automatically loading this skill. Use for workflows you want to trigger manually with `/name`. Default: `false`. |
| `user-invocable` | No | Set to `false` to hide from the `/` menu. Use for background knowledge users shouldn't invoke directly. Default: `true`. |
| `allowed-tools` | No | Tools Claude can use without asking permission when this skill is active. Supports wildcards: `Read, Grep, Bash(git *)`, `Bash(npm *)`, `Bash(docker compose *)`. |
| `model` | No | Model to use when this skill is active. |
| `argument-hint` | No | Hint shown during autocomplete to indicate expected arguments. Example: `[issue-number]` or `[filename] [format]`. |
| `hooks` | No | Hooks scoped to this skill's lifecycle. Example: `hooks: { pre-invoke: [{ command: "echo Starting" }] }`. See Claude Code Hooks documentation. |

## Special Placeholder

`$ARGUMENTS` in skill content is replaced with text the user provides after the skill name. For example, `/deep-research quantum computing` replaces `$ARGUMENTS` with `quantum computing`.

## When to Use `context: fork`

Use `context: fork` when the skill:
- Performs multi-step autonomous tasks (research, analysis, code generation)
- Should be available to subagents spawned via the Task tool
- Needs isolated context that won't pollute the main conversation
- Contains explicit task instructions (not just guidelines or reference content)

Skills without `context: fork` run inline and cannot be used by subagents.

## Invocation Control Matrix

| Frontmatter | You can invoke | Claude can invoke | Subagents can use |
|-------------|----------------|-------------------|-------------------|
| (default) | Yes | Yes | No (runs inline) |
| `context: fork` | Yes | Yes | Yes |
| `disable-model-invocation: true` | Yes | No | No |
| `context: fork` + `disable-model-invocation: true` | Yes | No | Yes (when explicitly delegated) |
