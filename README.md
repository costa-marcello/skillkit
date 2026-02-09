# skillkit

Skills and hooks for Claude Code.

A collection of 19 ready-to-install skills and a hooks system that adds context intelligence to your Claude Code sessions. Each skill handles a specific workflow so you can focus on building rather than configuring.

## Skills

| Skill | Description | Install |
|-------|-------------|---------|
| changelog | Generates and updates CHANGELOG.md from git history | `npx skills add costa-marcello/skillkit/changelog` |
| ci-cd | Creates production-ready GitHub Actions workflows | `npx skills add costa-marcello/skillkit/ci-cd` |
| claude-md | Manages CLAUDE.md files -- audits, reviews, improves | `npx skills add costa-marcello/skillkit/claude-md` |
| codex | Runs Codex CLI for code analysis, refactoring, or automated editing using gpt-5.2-codex | `npx skills add costa-marcello/skillkit/codex` |
| docx | Creates, edits, and analyses Word documents | `npx skills add costa-marcello/skillkit/docx` |
| find-skills | Helps discover and install agent skills | `npx skills add costa-marcello/skillkit/find-skills` |
| frontend-design | Creates distinctive, production-grade frontend interfaces | `npx skills add costa-marcello/skillkit/frontend-design` |
| gemini | Runs Gemini CLI for code review, plan review, or large context (>200k) processing using Gemini 3 Pro | `npx skills add costa-marcello/skillkit/gemini` |
| mermaid-diagrams | Creates software diagrams using Mermaid syntax | `npx skills add costa-marcello/skillkit/mermaid-diagrams` |
| pdf | Extracts text, creates, merges, and splits PDFs | `npx skills add costa-marcello/skillkit/pdf` |
| pptx | Creates, edits, and analyses PowerPoint presentations | `npx skills add costa-marcello/skillkit/pptx` |
| readme-md | Guides README creation and improvement | `npx skills add costa-marcello/skillkit/readme-md` |
| research | Researches any topic by dispatching 6-10 parallel sub-agents across community discussions and official sources | `npx skills add costa-marcello/skillkit/research` |
| shadcn-ui | Provides shadcn/ui installation and implementation guidance | `npx skills add costa-marcello/skillkit/shadcn-ui` |
| skill-creator | Guides creation of Claude Code skills | `npx skills add costa-marcello/skillkit/skill-creator` |
| skill-reviewer | Reviews and fixes Claude Code skills | `npx skills add costa-marcello/skillkit/skill-reviewer` |
| smart-merge | Merges branches with comprehensive validation | `npx skills add costa-marcello/skillkit/smart-merge` |
| ultrathink | Multi-lens analysis with domain-specific augmentation | `npx skills add costa-marcello/skillkit/ultrathink` |
| xlsx | Creates, edits, and analyses spreadsheets | `npx skills add costa-marcello/skillkit/xlsx` |

## Hooks

A set of hooks that connect Claude Code to Qdrant and claude-mem for automatic context injection and post-commit indexing. Every prompt gets relevant code snippets and past decisions. Every commit keeps the vector store current.

See [hooks/README.md](hooks/README.md) for full setup instructions.

## Install

Install any skill with:

```
npx skills add costa-marcello/skillkit/<skill-name>
```

For example:

```
npx skills add costa-marcello/skillkit/changelog
```

## Licence

MIT
