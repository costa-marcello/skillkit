---
name: find-skills
description: "Discovers and installs agent skills from the open ecosystem and CCPM registries. Use when users ask 'how do I do X', 'find a skill for X', 'is there a skill that can...', 'ccpm', 'claude code skill', 'installed skills', or want to extend capabilities."
license: MIT
context: fork
agent: general-purpose
---

# Find Skills

Search query: `$ARGUMENTS`

If `$ARGUMENTS` is empty, ask the user what skill they need.

<instructions>

## Step 1: Pick the Registry

| User Request | Registry | CLI | Browse |
|--------------|----------|-----|--------|
| General coding (React, testing, DevOps) | Open Ecosystem | `npx skills` | https://skills.sh/ |
| Claude Code features, document processing | CCPM | `ccpm` | https://ccpm.dev |
| "installed skills", "my skills" | CCPM | `ccpm list` | -- |

Default to **Open Ecosystem** when the request is general. Use **CCPM** when the request targets Claude Code workflows or document formats (PDF, DOCX, XLSX, PPTX).

## Step 2: Search

**Open Ecosystem:**
```bash
npx skills find $ARGUMENTS
```

**CCPM:**
```bash
ccpm search $ARGUMENTS
```

Run both searches when the registry is unclear. Present results from both.

## Step 3: Install

**Open Ecosystem:**
```bash
npx skills add <owner/repo@skill> -g -y
```

**CCPM:**
```bash
ccpm install <skill-name>
```

## Step 4: Verify Installation

**Open Ecosystem:**
```bash
npx skills check
```
Confirm the skill appears in the installed list.

**CCPM:**
```bash
ccpm list
```
Confirm the skill appears. Remind the user to restart Claude Code -- CCPM skills load at startup.

</instructions>

## Common Skill Categories

| Category | Example Queries |
|----------|-----------------|
| Web Development | react, nextjs, typescript, css, tailwind |
| Testing | testing, jest, playwright, e2e |
| DevOps | deploy, docker, kubernetes, ci-cd |
| Documentation | docs, readme, changelog, api-docs |
| Code Quality | review, lint, refactor, best-practices |
| Design | ui, ux, design-system, accessibility |
| Productivity | workflow, automation, git |

## Registry Commands Reference

### Open Ecosystem (`npx skills`)

```bash
npx skills find [query]           # Search for skills
npx skills add <package> -g -y    # Install globally
npx skills check                  # Check for updates
npx skills update                 # Update all installed
```

### CCPM (`ccpm`)

```bash
ccpm search <query>               # Search for skills
ccpm install <skill-name>         # Install a skill
ccpm install <skill-name> --project  # Install to current project only
ccpm info <skill-name>            # Get skill details
ccpm list                         # List installed skills
ccpm uninstall <skill-name>       # Remove a skill
```

## When No Skills Are Found

1. Tell the user no matching skill exists in either registry.
2. Help with the task directly using built-in capabilities.
3. If the user wants a reusable solution, create a custom skill:
   - Open Ecosystem: run `npx skills init my-skill`
   - CCPM: invoke the `/create-skill` skill

<example>
**User asks: "how do I make my React app faster?"**

1. Search: `npx skills find react performance`
2. Results show `vercel-labs/agent-skills@vercel-react-best-practices`
3. Install: `npx skills add vercel-labs/agent-skills@vercel-react-best-practices -g -y`
4. Verify: `npx skills check` -- confirm skill appears in list
</example>

<example>
**User asks: "is there a skill for PDF processing?"**

1. Search: `ccpm search pdf`
2. Check details: `ccpm info pdf-processor`
3. Install: `ccpm install pdf-processor`
4. Verify: `ccpm list` -- confirm `pdf-processor` appears
5. Remind user to restart Claude Code
</example>

<example>
**User asks: "what skills do I have installed?"**

1. Run: `ccpm list`
2. Run: `npx skills check`
3. Present combined results from both registries
</example>

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `ccpm: command not found` | Run `npm install -g @daymade/ccpm` |
| Skill not available after CCPM install | Restart Claude Code -- skills load at startup |
| Permission errors | Check write permissions to `~/.claude/skills/` |
