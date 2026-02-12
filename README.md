<div align="center">
  <img src="assets/logo.svg" alt="skillkit" width="80" />
  <h1>skillkit</h1>
  <p><strong>Skills for AI coding agents</strong></p>

  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
  [![Skills](https://img.shields.io/badge/Skills-22-8B5CF6)](skills/)
  [![Hooks](https://img.shields.io/badge/Hooks-3-3B82F6)](context-intelligence-hooks/)
</div>

---

## The problem with AI coding agents

AI coding agents are powerful out of the box. But ask one to create a Word document with tracked changes, build a CI/CD pipeline, generate a PowerPoint deck from a topic, or audit your codebase for production readiness, and you hit the same wall: the agent has general knowledge about these tasks but lacks the deep, step-by-step workflows that produce professional results.

You end up writing long prompts, correcting mistakes, and re-doing work. Every session starts from zero.

**Skillkit fixes this.** It gives your agent 22 specialist skills, each containing the exact workflows, decision trees, reference materials, and quality checks needed to do one job well. Instead of hoping the agent figures out the right approach, you give it a battle-tested playbook. Works with Claude Code, Cursor, Windsurf, and any agent that supports the skills protocol.

## Why these skills are different

Most agent skills are thin wrappers around a single prompt. Skillkit skills are structured knowledge packages built to a strict quality standard:

| What makes them different | Why it matters |
|--------------------------|----------------|
| **Decision trees, not just prompts** | Each skill contains branching workflows that adapt to what you actually need. The docx skill alone has five different workflows depending on whether you are reading, creating, editing, redlining, or converting. |
| **Bundled reference materials** | Skills carry their own documentation. The frontend-design skill includes 99 UX rules, 25+ chart types, style guides by industry, and 10 tech stack references. The pptx skill bundles a 9-stage content workflow with intake forms, rubrics, and design templates. This knowledge loads on demand without bloating your context window. |
| **Enforced quality gates** | Every skill must pass the review-skill, which checks against Anthropic's best practices. SKILL.md files stay under 500 lines. Descriptions follow a strict verb + trigger format so Claude can auto-invoke the right skill at the right time. |
| **Fork context by default** | Skills run in isolated subagent contexts. They do not pollute your main conversation. When a skill finishes, you get clean results without the noise of its internal reasoning. |
| **Multi-agent orchestration** | The research skill dispatches 6-10 parallel sub-agents across Reddit, X, Hacker News, official docs, and academic papers. The production-audit skill spawns 4 specialist agents to cover security, scalability, API completeness, and architecture simultaneously. These are not single-prompt tools. |
| **Self-improving ecosystem** | The create-skill and review-skill form a feedback loop. Create a new skill, review it against the quality standard, fix issues automatically. The find-skills skill discovers and installs more skills from the open ecosystem. |

## Quick start

```bash
# Install a single skill
npx skills add costa-marcello/skillkit -s changelog

# Install several at once
npx skills add costa-marcello/skillkit -s pdf -s docx -s ci-cd

# Use it in your agent
/changelog
/pdf
/ci-cd
```

That is the full setup. No configuration files, no environment variables, no build step. Install and use.

---

## All 22 skills

### Documents and Data

These four skills turn your agent into a document processing engine. They handle the Office formats that most AI tools struggle with, going beyond simple text extraction into full creation, editing, and format-aware manipulation.

<table>
<tr>
<th>Skill</th>
<th>What it does</th>
<th>Install</th>
</tr>
<tr>
<td><strong>docx</strong></td>
<td>

Creates, edits, and analyses Word documents. Five distinct workflows cover the full lifecycle: text extraction via pandoc, raw XML access for metadata and comments, new document creation with docx-js, OOXML editing for existing files, and a professional redlining workflow for tracked changes. The redlining workflow is particularly valuable for legal and business documents, where it implements minimal, precise edits that only mark changed text rather than replacing entire paragraphs. Bundles scripts for packing and unpacking OOXML archives and guides for DOM manipulation.

</td>
<td><code>npx skills add costa-marcello/skillkit -s docx</code></td>
</tr>
<tr>
<td><strong>pdf</strong></td>
<td>

Extracts text and tables from PDFs, creates new documents, merges, splits, rotates, watermarks, password-protects, and fills forms. Handles scanned documents through OCR with pytesseract. Converts markdown to PDF with professional typography including Chinese font support. Covers both Python libraries (pypdf, pdfplumber, reportlab) and command-line tools (pdftotext, qpdf, pdftk). Includes advanced reference material for pypdfium2 and JavaScript pdf-lib workflows.

</td>
<td><code>npx skills add costa-marcello/skillkit -s pdf</code></td>
</tr>
<tr>
<td><strong>pptx</strong></td>
<td>

Creates, edits, and analyses PowerPoint presentations. The standout feature is its content-first workflow: a 9-stage process that starts with an intake questionnaire, applies the Pyramid Principle (conclusion first, then reasons, then evidence), and scores output against a rubric requiring 75% or higher before delivery. Bundles reference files for slide templates, colour palettes, design elements, data chart orchestration, a visual guide, and a style guide. Also supports direct OOXML editing for precise slide manipulation.

</td>
<td><code>npx skills add costa-marcello/skillkit -s pptx</code></td>
</tr>
<tr>
<td><strong>xlsx</strong></td>
<td>

Creates, edits, and analyses spreadsheets with a focus on getting formulas right. Enforces a zero-formula-error standard: every model must be delivered without #REF!, #DIV/0!, #VALUE!, or #NAME? errors. Follows investment banking colour conventions (blue for inputs, black for formulas, green for cross-sheet links). Requires proper Excel formulas instead of hardcoded Python calculations, so spreadsheets stay dynamic. Includes a LibreOffice-powered recalculation script and a formula verification reference for debugging.

</td>
<td><code>npx skills add costa-marcello/skillkit -s xlsx</code></td>
</tr>
</table>

### Development

Seven skills that cover the development lifecycle from CI/CD setup through to branch management, UI implementation, visual documentation, and systematic debugging.

<table>
<tr>
<th>Skill</th>
<th>What it does</th>
<th>Install</th>
</tr>
<tr>
<td><strong>ci-cd</strong></td>
<td>

Creates production-ready GitHub Actions workflows. Covers test workflows, matrix builds across multiple OS and language versions, Docker image builds with registry pushes, security vulnerability scanning, deployment pipelines with approval gates, and reusable workflow patterns for monorepos. Includes reference YAML templates you can use as starting points and an anti-patterns guide that flags common mistakes. Scoped to GitHub Actions only, with clear guidance on when not to use it (GitLab, CircleCI, Jenkins, or one-off deployments).

</td>
<td><code>npx skills add costa-marcello/skillkit -s ci-cd</code></td>
</tr>
<tr>
<td><strong>changelog</strong></td>
<td>

Generates and updates CHANGELOG.md files from git history following Keep a Changelog format and Conventional Commits conventions. Auto-detects whether to create a new changelog, update an existing one, or add entries for a specific version. Translates developer commit messages into user-friendly descriptions. Suggests the next semantic version based on commit types (breaking, feat, fix) with copy-paste release commands. Works with date ranges, tag ranges, or "since last release" periods.

</td>
<td><code>npx skills add costa-marcello/skillkit -s changelog</code></td>
</tr>
<tr>
<td><strong>smart-merge</strong></td>
<td>

Merges branches with comprehensive pre-merge validation. Runs tests, lint, CI checks, and reviews PR comments before merging. Supports two modes: sync (pull main into your feature branch) and PR merge (merge feature into main via GitHub PR). The key behaviour is that it never deletes your feature branch and always returns you to your working branch. A safety-first approach that prevents the "I accidentally deleted my branch" problem.

</td>
<td><code>npx skills add costa-marcello/skillkit -s smart-merge</code></td>
</tr>
<tr>
<td><strong>shadcn-ui</strong></td>
<td>

Installs, configures, and implements shadcn/ui components with full accessibility support. Integrates with the shadcn MCP tools for component discovery and installation as the preferred workflow, falling back to CLI commands when MCP is unavailable. Covers React Hook Form with Zod validation for forms, Tailwind CSS variable theming, and advanced patterns. Bundled references include Next.js integration specifics, extended component patterns, CLI reference, configuration guide, and a learning path.

</td>
<td><code>npx skills add costa-marcello/skillkit -s shadcn-ui</code></td>
</tr>
<tr>
<td><strong>frontend-design</strong></td>
<td>

Creates distinctive, production-grade frontend interfaces that avoid generic "AI slop" aesthetics. This is not a component library. It is a design intelligence system with 99 UX rules, 25+ chart type references, style and colour guides organised by industry, typography pairing recommendations, and 10 tech stack code snippets. Every build starts with a design thinking checklist (purpose, tone, differentiator, constraints) and ends with a polish verification. Explicitly bans Inter, Roboto, purple gradients on white, and predictable layouts. Adapts to whatever framework you use (React, Vue, vanilla HTML/CSS) and respects existing UI libraries in your project.

</td>
<td><code>npx skills add costa-marcello/skillkit -s frontend-design</code></td>
</tr>
<tr>
<td><strong>mermaid-diagrams</strong></td>
<td>

Creates professional software diagrams using Mermaid syntax. Covers class diagrams, sequence diagrams, flowcharts (basic and advanced), entity-relationship diagrams, C4 architecture diagrams, state machines, git graphs, and Gantt charts. Each diagram type has its own reference file with syntax patterns and examples. Also includes theming and advanced feature references. Useful for documenting architecture, database schemas, API flows, and deployment pipelines as code.

</td>
<td><code>npx skills add costa-marcello/skillkit -s mermaid-diagrams</code></td>
</tr>
<tr>
<td><strong>debug</strong></td>
<td>

Guides systematic root-cause debugging through four phases: observe (gather evidence without assumptions), hypothesise (form testable theories ranked by likelihood), test (run the cheapest decisive experiment first), and fix (address the root cause, not the symptom). Enforces an iron law: no fixes without root cause investigation first. Works for any technical issue including test failures, runtime errors, performance regressions, integration failures, and deployment problems. Prevents the common anti-pattern of random fixes that waste time and mask underlying issues.

</td>
<td><code>npx skills add costa-marcello/skillkit -s debug</code></td>
</tr>
</table>

### AI and Research

Four skills that connect your agent to other AI models and deep research workflows. These turn your agent into an orchestrator that delegates to the best tool for each job.

<table>
<tr>
<th>Skill</th>
<th>What it does</th>
<th>Install</th>
</tr>
<tr>
<td><strong>codex</strong></td>
<td>

Invokes OpenAI's Codex CLI for tasks where Codex excels: tricky debugging (race conditions, edge cases), security analysis and vulnerability discovery, comprehensive code reviews, and large-scale refactoring. Runs as a forked subagent so Codex operates in its own sandbox. Supports configurable reasoning effort (xhigh, high, medium, low), three sandbox modes (read-only, workspace-write, full access), and session resumption for multi-turn tasks. Suppresses thinking tokens by default for clean output.

</td>
<td><code>npx skills add costa-marcello/skillkit -s codex</code></td>
</tr>
<tr>
<td><strong>gemini</strong></td>
<td>

Invokes Google's Gemini CLI for tasks that benefit from Gemini's 1M-token context window. Best for frontend development (Gemini 3 Pro produces high-quality UI code), code reviews spanning many files, architectural plan analysis, and processing entire codebases or documentation sets in a single pass. When the frontend-design skill is also installed, its guidelines are automatically passed to Gemini for design-driven results. Supports multiple approval modes for different execution contexts.

</td>
<td><code>npx skills add costa-marcello/skillkit -s gemini</code></td>
</tr>
<tr>
<td><strong>research</strong></td>
<td>

Dispatches 6-10 parallel sub-agents to research any topic from the last 30 days. Covers community sources (Reddit, X, Hacker News, Lobsters, developer forums, blogs) and official sources (documentation, academic papers, industry publications) in a single run. Produces a two-sided report with community findings, official findings, a cross-reference table showing where they agree and disagree, and real engagement statistics. Supports three depth levels (quick, default, deep) and four query types (prompting, recommendations, news, general). After research, it generates tailored prompts in whatever format the research recommends.

</td>
<td><code>npx skills add costa-marcello/skillkit -s research</code></td>
</tr>
<tr>
<td><strong>ultrathink</strong></td>
<td>

Performs exhaustive multi-lens analysis through four universal perspectives: human, structural, inclusivity, and sustainability. Detects the domain of your question (software engineering, strategy, legal, ethics, research, design, data, learning, writing, problem-solving) and loads domain-specific reference material to augment the universal framework. Suspends brevity constraints so depth takes priority over conciseness. Every conclusion follows explicitly from stated premises. Use it for complex decisions where getting the reasoning chain right matters more than getting a quick answer.

</td>
<td><code>npx skills add costa-marcello/skillkit -s ultrathink</code></td>
</tr>
</table>

### Meta (Skills about Skills)

Seven skills that manage the skillkit ecosystem itself: creating, reviewing, discovering, auditing, documenting, and automating hooks.

<table>
<tr>
<th>Skill</th>
<th>What it does</th>
<th>Install</th>
</tr>
<tr>
<td><strong>claude-md</strong></td>
<td>

The complete CLAUDE.md management tool. Five modes: audit (discover and score all rule files), review (detailed quality report against research-backed criteria), improve (targeted updates with diffs), refactor (restructure using progressive disclosure), and generate (create CLAUDE.md files for subdirectories that need context). Built on the insight that rules with reasoning outperform bare rules because models generalise from "why" explanations. Bundles references for quality criteria, anti-patterns, templates, update guidelines, and real examples.

</td>
<td><code>npx skills add costa-marcello/skillkit -s claude-md</code></td>
</tr>
<tr>
<td><strong>readme-md</strong></td>
<td>

Guides README creation and improvement with audience-matched templates. Identifies four project types (open source, personal, internal, config) and selects the right template for each. Handles four tasks: creating from scratch, adding sections, updating stale content, and reviewing against actual project state. Bundles the Standard README spec, the Art of README, a style guide for common prose mistakes, and section checklists by project type. Always asks what the audience needs to know before writing.

</td>
<td><code>npx skills add costa-marcello/skillkit -s readme-md</code></td>
</tr>
<tr>
<td><strong>create-skill</strong></td>
<td>

Guides creation of new Claude Code skills with best practices. Covers frontmatter configuration, skill anatomy, bundled resources (scripts, references, assets), sanitisation checklists for removing personal data, and planning examples. Produces skills that pass the review-skill on first try. If you want to package your own workflows as reusable skills, start here.

</td>
<td><code>npx skills add costa-marcello/skillkit -s create-skill</code></td>
</tr>
<tr>
<td><strong>review-skill</strong></td>
<td>

Reviews and automatically fixes skills against Anthropic's official best practices. Four modes: review (quality report with scores), auto-fix (read, evaluate, then apply fixes), external review (clone a GitHub URL and report), and auto-PR (fork, fix, submit pull request). Checks SKILL.md size, description format, file organisation, XML tag usage, portability, and script quality. Backed by research-based criteria and source documentation. Includes a marketplace template for publishing.

</td>
<td><code>npx skills add costa-marcello/skillkit -s review-skill</code></td>
</tr>
<tr>
<td><strong>cc-hooks</strong></td>
<td>

Creates and improves event-driven hooks for Claude Code automation. Covers all lifecycle events: PreToolUse guards that block dangerous commands, PostToolUse formatters and linters, Stop hooks for testing and notifications, and SessionStart/SessionEnd for environment setup and teardown. Includes patterns for agent-based verification gates and headless CI/CD integration. Bundles comprehensive reference material covering the hook API, stdin/stdout contracts, error handling, and real-world examples for each event type. Use it when you need to extend Claude Code's behaviour with custom automation.

</td>
<td><code>npx skills add costa-marcello/skillkit -s cc-hooks</code></td>
</tr>
<tr>
<td><strong>find-skills</strong></td>
<td>

Discovers and installs skills from two registries: the open agent skills ecosystem (skills.sh, covering Vercel Labs, ComposioHQ, and community publishers) and CCPM (Claude Code Plugin Manager for Claude-specific skills). Searches both registries, shows results with descriptions, and handles installation. Use it when you want to find a skill for something skillkit does not cover.

</td>
<td><code>npx skills add costa-marcello/skillkit -s find-skills</code></td>
</tr>
<tr>
<td><strong>production-audit</strong></td>
<td>

Audits a codebase for production readiness across six dimensions: API completeness, frontend-backend sync, security, scalability, infrastructure, and dead code/architecture. Spawns 4 parallel audit agents, each with detailed checklists loaded from reference files. Produces a structured report with severity levels (blocker, warning, improvement), file paths, line numbers, and evidence. Findings get IDs (B-001, W-001) that work as ticket references. Adapts to any stack: the examples cover Next.js monorepos, Django REST APIs, and backend-only services. Pairs with Semgrep MCP for automated vulnerability scanning.

</td>
<td><code>npx skills add costa-marcello/skillkit -s production-audit</code></td>
</tr>
</table>

---

## Hooks: persistent memory across sessions

Skills give your agent expertise. Hooks give it memory.

The three hooks in this repository connect your agent to a Qdrant vector store and claude-mem so that every prompt benefits from prior knowledge and every commit keeps the index current. Without hooks, each session starts from zero. With hooks, your agent remembers your codebase, past decisions, and patterns across sessions.

| Hook | Lifecycle event | What it does |
|------|----------------|--------------|
| **context.mjs** | UserPromptSubmit | Searches Qdrant for relevant code snippets and project docs, and claude-mem for past decisions and patterns. Injects matching context into Claude's system message before it responds. |
| **post-commit-index.mjs** | PostToolUse (Bash) | Detects git commits and re-indexes changed files into Qdrant. Handles both code files and documentation. Your vector store stays current after every commit. |
| **pre-tool-context.mjs** | PreToolUse | Injects additional context before tool execution. |

Hooks run in dual mode: they respond to lifecycle events automatically, and they work as standalone CLI tools (`node context-intelligence-hooks/context.mjs "query"`) for manual searches.

**Prerequisites:** A Qdrant Cloud account (free tier works) and a Voyage AI API key for embeddings (also free tier). See [context-intelligence-hooks/README.md](context-intelligence-hooks/README.md) for full setup instructions.

---

## How skills work

```
skills/
  changelog/
    SKILL.md             # Frontmatter + prompt (the skill itself)
  pdf/
    SKILL.md
    references/          # Deep reference docs, loaded on demand
      forms.md
      advanced-features.md
    scripts/             # Helper scripts bundled with the skill
  frontend-design/
    SKILL.md
    references/
      style-guide.md     # Styles, colours, typography by industry
      ui-rules.md        # 99 UX guidelines
      chart-types.md     # 25+ chart types
      checklist.md       # Pre-delivery verification
      search-domains.md  # 10 tech stacks with code
```

Each skill lives in its own directory under `skills/`. The `SKILL.md` file contains YAML frontmatter (name, description, licence, context mode) followed by the prompt content. Supporting materials go in `references/`, scripts in `scripts/`, and templates in `assets/`.

When you install a skill with `npx skills add`, it copies into your project's skills directory. Your agent loads installed skills automatically and makes each one available as a slash command matching its name.

Some skills accept arguments directly after the slash command. For example:

```bash
/research quantum computing        # Researches quantum computing
/changelog 2025-01-01..2025-02-01  # Changelog for a date range
/review-skill skills/my-skill      # Review a specific skill
```

The `references/` pattern is what keeps skills fast. The SKILL.md stays under 500 lines (the enforced limit), while deep reference materials load only when the skill needs them. The frontend-design skill, for example, has 99 UX rules and 25+ chart types available, but they only enter the context window when the skill reaches for them.

---

## Prerequisites

- **An AI coding agent** that supports the skills protocol (Claude Code, Cursor, Windsurf, etc.)
- **Node.js 18+**
- For hooks: a **Qdrant Cloud** account and a **Voyage AI** API key

---

## Contributing

Contributions are welcome. To add or improve a skill:

1. Fork the repository.
2. Create a new directory under `skills/<name>/` or edit an existing one.
3. Each skill needs a `SKILL.md` with frontmatter (name, description, licence) and prompt content.
4. Supporting docs go in `references/`, scripts in `scripts/`, templates in `assets/`.
5. Run the review-skill on your changes: `/review-skill`
6. Open a pull request.

For automated validation:

```bash
python3 skills/create-skill/scripts/quick_validate.py skills/<your-skill>
python3 skills/create-skill/scripts/security_scan.py skills/<your-skill> --verbose
```

---

## Licence

[MIT](LICENSE)
