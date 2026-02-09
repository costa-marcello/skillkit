---
name: find-skills
description: "Helps users discover and install agent skills. Use when users ask 'how do I do X', 'find a skill for X', 'is there a skill that can...', 'ccpm', 'claude code skill', 'installed skills', or express interest in extending capabilities."
context: fork
---

# Find Skills

Discovers and installs skills from two registries: the open agent skills ecosystem and CCPM (Claude Code Plugin Manager).

## Two Registries

| Registry | CLI | When to Use |
|----------|-----|-------------|
| Open Ecosystem | `npx skills` | General agent skills (Vercel Labs, ComposioHQ, etc.) |
| CCPM | `ccpm` | Claude Code-specific skills |

## Open Ecosystem (skills.sh)

The Skills CLI (`npx skills`) is the package manager for the open agent skills ecosystem. Skills are modular packages that extend agent capabilities.

**Browse skills at:** https://skills.sh/

### Commands

```bash
# Search for skills
npx skills find [query]

# Install a skill
npx skills add <owner/repo@skill>

# Install globally with auto-confirm
npx skills add <package> -g -y

# Check for updates
npx skills check

# Update all installed skills
npx skills update
```

### Example Workflow

```bash
# User asks "how do I make my React app faster?"
npx skills find react performance

# Results show:
# vercel-labs/agent-skills@vercel-react-best-practices
# └ https://skills.sh/vercel-labs/agent-skills/vercel-react-best-practices

# Install it:
npx skills add vercel-labs/agent-skills@vercel-react-best-practices -g -y
```

## CCPM (Claude Code Skills)

CCPM manages Claude Code-specific skills. Skills require Claude Code restart after installation.

**Browse skills at:** https://ccpm.dev

### Commands

```bash
# Search for skills
ccpm search <query>

# Install a skill
ccpm install <skill-name>

# Install to current project only
ccpm install <skill-name> --project

# Force reinstall
ccpm install <skill-name> --force

# List installed skills
ccpm list

# Get skill details
ccpm info <skill-name>

# Uninstall a skill
ccpm uninstall <skill-name>
```

### Example Workflow

```bash
# User asks about PDF processing
ccpm search pdf

# Get details on a skill
ccpm info pdf-processor

# Install it
ccpm install pdf-processor

# Remind user to restart Claude Code
```

### Popular CCPM Skills

| Skill | Purpose |
|-------|---------|
| `skill-creator` | Create new Claude Code skills |
| `pdf-processor` | PDF manipulation and analysis |
| `docx` | Word document processing |
| `xlsx` | Excel spreadsheet operations |
| `pptx` | PowerPoint presentation creation |
| `cloudflare-troubleshooting` | Debug Cloudflare issues |
| `prompt-optimizer` | Improve prompt quality |

## Which Registry to Use?

| User Request | Registry | Why |
|--------------|----------|-----|
| General coding help (React, testing, etc.) | Open Ecosystem | Broader community skills |
| Claude Code-specific features | CCPM | Designed for Claude Code |
| Document processing (PDF, DOCX, etc.) | CCPM | Better integration |
| "installed skills", "my skills" | CCPM | Use `ccpm list` |

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

## When No Skills Are Found

1. Acknowledge that no existing skill was found
2. Offer to help with the task directly
3. Suggest creating a custom skill:
   - Open Ecosystem: `npx skills init my-skill`
   - CCPM: Use the `skill-creator` skill

## Troubleshooting

### "ccpm: command not found"
```bash
npm install -g @daymade/ccpm
```

### Skill not available after install (CCPM)
Restart Claude Code — skills are loaded at startup.

### Permission errors
Check write permissions to `~/.claude/skills/` or try user scope (default).
