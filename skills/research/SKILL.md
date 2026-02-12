---
name: research
description: "Researches any topic by dispatching 6-10 parallel sub-agents across community discussions and official sources. Use when user wants deep research, topic analysis, community sentiment, or asks 'what's new with X'."
license: MIT
argument-hint: "[topic]"
---

<instructions>

# research: Deep Research Any Topic

Research ANY topic across Reddit, X, community forums, official docs, academic papers, and industry publications. Dispatches 6-10 parallel sub-agents to cover every angle — community AND official sources — then synthesizes a two-sided report.

Use cases:
- **Prompting**: "photorealistic people in Nano Banana Pro" — learn techniques from community tips AND official guides
- **Recommendations**: "best Claude Code skills" — get specific names from community + official feature comparisons
- **News**: "what's happening with OpenAI" — community reactions + official announcements
- **General**: any topic — understand what the community says AND what officials report

<example>
Input: `/research best Claude Code skills`
Output: Two-sided report with:
- Community: "Most mentioned: /commit (5x, r/ClaudeAI + HN), remotion skill (4x, X + Dev.to)..."
- Official: "Anthropic docs highlight /pr, /review as recommended workflows..."
- Cross-reference: 3 aligned, 1 divergent, 1 gap
- Stats: 12 Reddit threads (847 upvotes) + 8 X posts + 6 community + 4 official sources
Then waits for user's vision to write a tailored prompt.
</example>

<example>
Edge case — Web-only mode (no API keys):
SCRIPT_DATA returns "Mode: web-only". Sub-agents do ALL discovery work.
Display omits Reddit/X stats lines. Report still delivers full two-sided analysis.
</example>

<example>
Edge case — Agent failure:
C4 returns empty or errors. Log "C4: dev communities — no results".
Continue with C1-C3 data. Note gap in stats footer: "1 agent failed".
</example>

<example>
Edge case — Sources disagree:
Community (C2): "Tool A recommended (12 upvotes on HN)"
Official (O1): "Tool B is the documented approach"
Cross-reference: Mark as "Divergent" with both views attributed.
</example>

## Parse User Intent

**User input:** $ARGUMENTS

Extract four variables from user input before proceeding:

| Variable | Extract | Example |
|----------|---------|---------|
| `TOPIC` | What they want to learn about | "web app mockups", "Claude Code skills" |
| `TARGET_TOOL` | Where they'll use prompts (or "unknown") | "Nano Banana Pro", "Midjourney" |
| `QUERY_TYPE` | PROMPTING \| RECOMMENDATIONS \| NEWS \| GENERAL | Auto-detect from phrasing |
| `DEPTH` | `--quick` (6 agents) \| default (8) \| `--deep` (10) | Flag in user input |

See `references/intent_parsing.md` for query type definitions, detection patterns, and variable storage rules.

Do not ask about target tool before research. If unspecified, ask after showing results.

<context>
State: TOPIC, TARGET_TOOL, QUERY_TYPE, DEPTH are now defined.
Next: Determine API key availability to select script mode.
</context>

## Setup Check

The Python script works in three modes based on available API keys:

1. **Full Mode** (both keys): Reddit + X with real engagement metrics
2. **Partial Mode** (one key): Reddit-only or X-only
3. **Web-Only Mode** (no keys): Script provides no data, sub-agents do all the work

API keys are optional. The skill always dispatches sub-agents regardless. Determine mode quickly.

## MCP Tool Detection

Use `ToolSearch` with query `"brave search"` to check for Brave MCP tools. Record as `AVAILABLE_MCP_TOOLS`.

Construct the `MCP_TOOLS` instruction block embedded into every sub-agent prompt:
- **Brave available**: Use `brave_web_search` and `brave_news_search` as PRIMARY tools; fall back to `WebSearch` only on errors
- **No MCP tools**: Use `WebSearch` for all queries

<context>
State: MCP_TOOLS instruction block is defined. Script runs synchronously.
Output: SCRIPT_DATA (Reddit/X results with engagement metrics, or empty if web-only mode).
</context>

## Phase 1: Run Python Script (Reddit + X)

Run the research script synchronously — it provides Reddit/X data with real engagement metrics that sub-agents cannot replicate.

```bash
RESEARCH_SCRIPT="$([ -f .claude/skills/research/scripts/research.py ] && echo .claude/skills/research/scripts/research.py || echo ~/.claude/skills/research/scripts/research.py)" && python3 "$RESEARCH_SCRIPT" "$TOPIC" --emit=compact 2>&1
```

The `$DEPTH` flag maps to: `--quick` -> pass `--quick`; default -> no flag; `--deep` -> pass `--deep`.

Store the output as `SCRIPT_DATA`. Check mode from output:
- **"Mode: both"** / **"Mode: reddit-only"** / **"Mode: x-only"**: Script found data
- **"Mode: web-only"**: No API keys, sub-agents provide all data

Do not stop or warn if web-only. Proceed to Phase 2.

<context>
State: SCRIPT_DATA collected. All agents launched in ONE message for parallelism.
Dependencies: MCP_TOOLS block embedded in every sub-agent prompt.
</context>

## Phase 2: Sub-Agent Dispatch

Launch all agents in a single message with multiple Task tool calls for maximum parallelism.

Refer to `references/subagent_prompts.md` for prompt templates and `references/source_categories.md` for source taxonomy.

### Agent Allocation

Dispatch community agents (C1-C5) and official agents (O1-O5) in parallel. Agent count scales with depth:
- `--quick`: 6 (3C + 3O) | default: 8 (4C + 4O) | `--deep`: 10 (5C + 5O)

Build each prompt from templates in `references/subagent_prompts.md`, filling: `{TOPIC}`, `{QUERY_TYPE}`, `{FOCUS}`, `{QUERIES}`, `{DATE_FROM}`, `{MCP_TOOLS}`. Use `subagent_type: "general-purpose"`.

See `references/agent_allocation.md` for full agent roles, focus areas, and dispatch pattern.

Dispatch all agents in a single message. Do not dispatch sequentially.

## Phase 3: Collect Results

After dispatching, collect results from all agents:

1. Call `TaskOutput` for each dispatched agent
2. Organize into: `COMMUNITY_FINDINGS` (C1-C5) and `OFFICIAL_FINDINGS` (O1-O5)
3. **Graceful failure**: If an agent fails or returns empty, log which agent failed, continue with remaining results, note the gap in the final report. Do not retry.

<context>
State: SCRIPT_DATA + COMMUNITY_FINDINGS + OFFICIAL_FINDINGS all collected.
Mode: Synthesis — ground in actual research, not pre-existing knowledge.
</context>

## Phase 4: Judge Synthesis

Synthesize all findings (SCRIPT_DATA + COMMUNITY_FINDINGS + OFFICIAL_FINDINGS) into a coherent two-sided report.

### Weighting

| Source | Weight | Why |
|--------|--------|-----|
| Reddit (from script) | HIGHEST | Real upvotes + comments = proven engagement |
| X (from script) | HIGHEST | Real likes + reposts = proven engagement |
| HN / Lobsters | HIGH | Voting system = community curation |
| Official docs | HIGH | Authoritative, primary source |
| Academic papers | HIGH | Peer-reviewed |
| Industry publications | MEDIUM | Expert but potentially biased |
| Expert blogs | MEDIUM-LOW | Individual perspective |
| Misc community | MEDIUM-LOW | Volume varies |

### Cross-Reference Analysis

Identify 3-5 topics where community and official sources can be compared:
- **Aligned**: Both sides agree
- **Divergent**: Community says one thing, officials say another
- **Gap**: One side has information the other lacks

## Internalize the Research

Ground your synthesis in actual research content, not pre-existing knowledge. Read all agent outputs carefully, paying attention to exact names, specific insights, and real engagement numbers.

### If QUERY_TYPE = RECOMMENDATIONS

Extract specific names from all sources (script + community + official agents). Count mentions across sources, note which sources recommend each, list by popularity.

<example>
BAD: "Skills are powerful. Keep them under 500 lines."
GOOD: "Most mentioned: /commit (5 mentions, r/ClaudeAI + HN), remotion skill (4x, X + Dev.to), git-worktree (3x, GitHub Discussions). Official docs highlight /pr as recommended."
</example>

### For All Query Types

From the actual research output, identify:
- **PROMPT FORMAT** — Does research recommend JSON, structured params, natural language, keywords?
- Top 3-5 patterns/techniques that appeared across multiple sources
- Specific keywords, structures, or approaches mentioned by the sources
- Common pitfalls mentioned by the sources

If research says "use JSON prompts" or "structured prompts", deliver prompts in that format later.

Self-check: Re-read your synthesis before displaying. If it does not match what the research actually says, rewrite it.

## Display Two-Sided Report

Refer to `references/output_format.md` for the full template. Do not output any "Sources:" lists.

### 1. What the Community Says

Synthesize SCRIPT_DATA (Reddit/X) + COMMUNITY_FINDINGS (C1-C5):

<example>
If RECOMMENDATIONS:

Most Mentioned:
1. [Specific name] - mentioned {n}x (r/sub, HN, @handle, blog.com)
2. [Specific name] - mentioned {n}x (sources)
3. [Specific name] - mentioned {n}x (sources)

Notable mentions: [other specific things with 1-2 mentions]
</example>

<example>
If PROMPTING/NEWS/GENERAL:

What the community is saying:

[2-4 sentences synthesizing key insights from the actual research output.]

Key patterns:
1. [Pattern from research]
2. [Pattern from research]
3. [Pattern from research]
</example>

### 2. What the Official Sources Say

Synthesize OFFICIAL_FINDINGS (O1-O5):
- Key findings with authority attribution
- Recent official changes with dates
- Gaps in official coverage

### 3. Where They Agree and Disagree

Cross-reference table (3-5 rows):

| Topic | Community View | Official Position | Status |
|-------|---------------|-------------------|--------|
| [aspect] | [what community says] | [what officials say] | Aligned / Divergent / Gap |

### 4. Stats Footer

Display real numbers from the research:
```
All agents reported back!
|- Reddit: {n} threads | {upvotes} upvotes | {comments} comments
|- X: {n} posts | {likes} likes | {reposts} reposts
|- Community web: {n} sources (HN, forums, blogs)
|- Official web: {n} sources (docs, papers, reports)
|- Agents dispatched: {total} ({C}C + {O}O)
|- Cross-reference: {agree} aligned, {disagree} divergent, {gaps} gaps
```

If web-only mode, omit Reddit/X lines and add the API key hint from `references/output_format.md`.

### 5. Invitation

```
Share your vision for what you want to create and I'll write a thoughtful prompt
you can copy-paste directly into {TARGET_TOOL}.
```

Use real numbers from the research output. Patterns should be actual insights, not generic advice.

If TARGET_TOOL is still unknown after showing results, ask now:
```
What tool will you use these prompts with?

Options:
1. [Most relevant tool based on research]
2. Nano Banana Pro (image generation)
3. ChatGPT / Claude (text/code)
4. Other (tell me)
```

After displaying the report and invitation, wait for the user to respond.

## Prompt Generation

When the user shares their vision, write ONE tailored prompt using expertise from BOTH community and official sources.

Match the format the research recommends (JSON, structured params, natural language, keywords).

See `references/prompt_generation.md` for the full prompt writing protocol, quality checklist, and output footer templates.

## Context Memory

After research completes, retain topic expertise for follow-up questions. See `references/context_memory.md` for full context retention protocol.

## Installation and Usage

For installation steps, API key setup, usage examples, and CLI options, see `references/readme.md`.

</instructions>
