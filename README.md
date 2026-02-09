<div align="center">
  <img src="assets/logo.svg" alt="skillkit" width="80" />
  <h1>skillkit</h1>
  <p><strong>Skills and hooks for Claude Code</strong></p>

  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
  [![Skills](https://img.shields.io/badge/Skills-19-8B5CF6)](skills/)
  [![Hooks](https://img.shields.io/badge/Hooks-3-3B82F6)](hooks/)
</div>

## What is this?

Claude Code skills are reusable prompt packages that give Claude domain expertise in specific workflows. This repository bundles 19 skills covering document creation, development workflows, research, and design. The hooks add persistent memory to your sessions through vector search, so Claude remembers context across conversations.

## Quick start

```bash
# Install a skill
npx skills add costa-marcello/skillkit/changelog

# Install multiple skills
npx skills add costa-marcello/skillkit/pdf costa-marcello/skillkit/docx

# Use it — just invoke the skill in Claude Code
/changelog
```

## Skills

Install any skill with `npx skills add costa-marcello/skillkit/<name>`, then invoke it in Claude Code with `/<name>`.

### Documents and Data

| Skill | Description | Install |
|-------|-------------|---------|
| docx | Creates, edits, and analyses Word documents with tracked changes and formatting | `npx skills add costa-marcello/skillkit/docx` |
| pdf | Extracts text, creates, merges, splits PDFs and fills forms | `npx skills add costa-marcello/skillkit/pdf` |
| pptx | Creates, edits, and analyses PowerPoint presentations with layouts and design | `npx skills add costa-marcello/skillkit/pptx` |
| xlsx | Creates, edits, and analyses spreadsheets with formulas and formatting | `npx skills add costa-marcello/skillkit/xlsx` |

### Development

| Skill | Description | Install |
|-------|-------------|---------|
| ci-cd | Creates production-ready GitHub Actions workflows for CI/CD and security | `npx skills add costa-marcello/skillkit/ci-cd` |
| changelog | Generates and updates CHANGELOG.md from git history | `npx skills add costa-marcello/skillkit/changelog` |
| smart-merge | Merges branches with validation, preserving feature branches | `npx skills add costa-marcello/skillkit/smart-merge` |
| shadcn-ui | Provides shadcn/ui component installation and implementation guidance | `npx skills add costa-marcello/skillkit/shadcn-ui` |
| frontend-design | Creates distinctive, production-grade frontend interfaces | `npx skills add costa-marcello/skillkit/frontend-design` |
| mermaid-diagrams | Creates software diagrams using Mermaid syntax | `npx skills add costa-marcello/skillkit/mermaid-diagrams` |

### AI and Research

| Skill | Description | Install |
|-------|-------------|---------|
| codex | Runs Codex CLI for analysis, refactoring, or automated editing via gpt-5.2-codex | `npx skills add costa-marcello/skillkit/codex` |
| gemini | Runs Gemini CLI for code review, plan review, or large context processing via Gemini 3 Pro | `npx skills add costa-marcello/skillkit/gemini` |
| research | Dispatches 6-10 parallel sub-agents to research any topic across community and official sources | `npx skills add costa-marcello/skillkit/research` |
| ultrathink | Multi-lens analysis through human, structural, inclusivity, and sustainability perspectives | `npx skills add costa-marcello/skillkit/ultrathink` |

### Meta (Skills about Skills)

| Skill | Description | Install |
|-------|-------------|---------|
| claude-md | Audits, reviews, improves, and generates CLAUDE.md configuration files | `npx skills add costa-marcello/skillkit/claude-md` |
| readme-md | Guides README creation and improvement with audience-matched templates | `npx skills add costa-marcello/skillkit/readme-md` |
| skill-creator | Guides creation of new Claude Code skills with best practices | `npx skills add costa-marcello/skillkit/skill-creator` |
| skill-reviewer | Reviews and automatically fixes skills against Anthropic best practices | `npx skills add costa-marcello/skillkit/skill-reviewer` |
| find-skills | Helps discover and install skills from the marketplace | `npx skills add costa-marcello/skillkit/find-skills` |

## Hooks

Claude Code hooks are shell commands that run at specific lifecycle events. The hooks in this repository connect Claude Code to a vector store so that every prompt receives relevant context and every commit keeps the index current.

| Hook | Event | What it does |
|------|-------|--------------|
| context.mjs | UserPromptSubmit | Searches Qdrant and claude-mem for code, docs, and past decisions relevant to the current prompt |
| post-commit-index.mjs | PostToolUse (Bash) | Indexes changed files into Qdrant after each git commit to keep the vector store fresh |
| pre-tool-context.mjs | PreToolUse | Injects additional context before tool execution |

See [hooks/README.md](hooks/README.md) for full setup instructions.

**Prerequisites for hooks:** A running Qdrant instance and a Voyage AI API key for generating embeddings. Both services offer free tiers suitable for individual use.

## Prerequisites

- **Claude Code** (the CLI)
- **Node.js 18+**
- For hooks: a **Qdrant Cloud** account and a **Voyage AI** API key

## How skills work

Each skill lives in its own directory under `skills/`. The directory contains a `SKILL.md` file with YAML frontmatter followed by the prompt content:

```
skills/
  changelog/
    SKILL.md        # Frontmatter (name, description, licence) + prompt
  pdf/
    SKILL.md
  ...
```

When you install a skill with `npx skills add`, it gets copied into your project's `.claude/skills/` directory. Claude Code loads installed skills automatically and makes each one available as a slash command matching its name.

## Contributing

Contributions are welcome. To add or improve a skill:

1. Fork the repository.
2. Create a new directory under `skills/<name>/` or edit an existing one.
3. Each skill needs a `SKILL.md` with frontmatter (name, description, licence) and prompt content.
4. Run the skill-reviewer skill on your changes: `/skill-reviewer`
5. Open a pull request.

See the existing skills for examples of the expected format and structure.

## Licence

[MIT](LICENSE)
