# research Skill Specification

## Overview

`research` is a Claude Code skill that performs deep research on any topic from the last 30 days. It operates as a **pure orchestrator** — dispatching 6-10 parallel sub-agents across community discussions and official/authoritative sources, then synthesizing a two-sided report with cross-reference analysis.

The skill combines a Python script (`last30days.py`) for Reddit/X data with real engagement metrics, and parallel sub-agents for broader community forums (HN, Stack Overflow, Dev.to, etc.) and official sources (documentation, academic papers, industry reports).

The skill operates in three modes depending on available API keys: **reddit-only** (OpenAI key), **x-only** (xAI key), or **both** (full cross-validation). Sub-agents are always dispatched regardless of API key availability.

## Architecture

### Two-Layer Design

**Layer 1: Python Script** (`scripts/last30days.py`)
- Handles Reddit and X/Twitter via OpenAI Responses API and xAI Responses API
- Provides real engagement metrics (upvotes, likes, reposts, comments)
- Runs synchronously before sub-agent dispatch
- Uses automatic model selection to stay current with latest models

**Layer 2: Sub-Agent Orchestration** (SKILL.md)
- Detects available MCP tools (Brave Search, etc.) before dispatch
- Dispatches 6-10 `general-purpose` sub-agents in parallel
- Half cover community sources, half cover official/authoritative sources
- Each agent uses MCP tools first, falling back to WebSearch
- Results collected and synthesized into a two-sided report

### Orchestration Flow

```
Parse Intent → Setup Check → MCP Detection → Run Script → Dispatch Agents → Collect → Synthesize → Report
```

### Agent Allocation by Depth

| Depth Flag | Community Agents | Official Agents | Total |
|------------|-----------------|-----------------|-------|
| `--quick`  | 3 (C1-C3)      | 3 (O1-O3)      | 6     |
| *(default)* | 4 (C1-C4)     | 4 (O1-O4)      | 8     |
| `--deep`   | 5 (C1-C5)      | 5 (O1-O5)      | 10    |

### Community Agent Focus Areas
- **C1**: HN + tech forums (Lobsters, Stack Overflow)
- **C2**: Broader community discussions (forums, Discourse, Product Hunt)
- **C3**: Niche communities + comparisons (review sites, specialized forums)
- **C4**: Developer/creator communities (Dev.to, GitHub Discussions, blogs)
- **C5**: International perspectives + user reviews (G2, Capterra)

### Official Agent Focus Areas
- **O1**: Official docs + changelogs + release notes
- **O2**: Industry publications + analysis
- **O3**: Academic papers + research
- **O4**: Government/institutional + standards bodies
- **O5**: Expert blogs + thought leadership

### MCP Tool Detection

Before dispatching sub-agents, the skill uses `ToolSearch` to detect available MCP search tools (primarily Brave Search). The detection result is embedded into every sub-agent prompt as a `{MCP_TOOLS}` instruction block, ensuring agents use the highest-quality available tools:

1. **MCP available**: Agents use `brave_web_search` / `brave_news_search` first, fall back to WebSearch
2. **MCP unavailable**: Agents use WebSearch directly

This ensures optimal tool usage without hardcoding MCP dependencies.

### Python Script Modules

The orchestrator (`last30days.py`) coordinates discovery, enrichment, normalization, scoring, deduplication, and rendering. Each concern is isolated in `scripts/lib/`:

- **env.py**: Load and validate API keys from `~/.config/last30days/.env`
- **dates.py**: Date range calculation and confidence scoring
- **cache.py**: 24-hour TTL caching keyed by topic + date range
- **http.py**: stdlib-only HTTP client with retry logic
- **models.py**: Auto-selection of OpenAI/xAI models with 7-day caching
- **openai_reddit.py**: OpenAI Responses API + web_search for Reddit
- **xai_x.py**: xAI Responses API + x_search for X
- **reddit_enrich.py**: Fetch Reddit thread JSON for real engagement metrics
- **normalize.py**: Convert raw API responses to canonical schema
- **score.py**: Compute popularity-aware scores (relevance + recency + engagement)
- **dedupe.py**: Near-duplicate detection via text similarity
- **render.py**: Generate markdown and JSON outputs
- **schema.py**: Type definitions and validation

### Reference Files

- **references/source_categories.md**: Community vs official source taxonomy, domain exclusion lists, query adaptation by type
- **references/subagent_prompts.md**: Prompt templates for community and official agents with MCP-first tool instructions
- **references/output_format.md**: Two-sided report template with stats footer

## Two-Sided Output

The skill produces a structured report with:

1. **What the Community Says** — Reddit/X engagement data + HN/forum/blog discussions
2. **What the Official Sources Say** — Docs, papers, publications, institutional reports
3. **Where They Agree & Disagree** — Cross-reference table (Aligned / Divergent / Gap)
4. **Stats Footer** — Real numbers from all sources + agent dispatch summary

## Embedding in Other Skills

Other skills can import the research context in several ways:

### Inline Context Injection
```markdown
## Recent Research Context
!python3 ~/.claude/skills/research/scripts/last30days.py "your topic" --emit=context
```

### Read from File
```markdown
## Research Context
!cat ~/.local/share/last30days/out/last30days.context.md
```

### Get Path for Dynamic Loading
```bash
CONTEXT_PATH=$(python3 ~/.claude/skills/research/scripts/last30days.py "topic" --emit=path)
cat "$CONTEXT_PATH"
```

### JSON for Programmatic Use
```bash
python3 ~/.claude/skills/research/scripts/last30days.py "topic" --emit=json > research.json
```

## CLI Reference

```
python3 ~/.claude/skills/research/scripts/last30days.py <topic> [options]

Options:
  --refresh           Bypass cache and fetch fresh data
  --mock              Use fixtures instead of real API calls
  --emit=MODE         Output mode: compact|json|md|context|path (default: compact)
  --sources=MODE      Source selection: auto|reddit|x|both (default: auto)
  --quick             Fewer sources (8-12 each), skill dispatches 6 agents
  --deep              Comprehensive sources (50-70 Reddit, 40-60 X), skill dispatches 10 agents
```

## Output Files

All outputs are written to `~/.local/share/last30days/out/`:

- `report.md` - Human-readable full report
- `report.json` - Normalized data with scores
- `last30days.context.md` - Compact reusable snippet for other skills
- `raw_openai.json` - Raw OpenAI API response
- `raw_xai.json` - Raw xAI API response
- `raw_reddit_threads_enriched.json` - Enriched Reddit thread data
