# Sub-Agent Prompt Templates

<!-- Templates used by the research skill orchestrator to construct sub-agent prompts.
     Variables: {TOPIC}, {QUERY_TYPE}, {FOCUS}, {QUERIES}, {DATE_FROM}, {MCP_TOOLS} -->

## MCP-First Tool Instructions

Include this block in EVERY sub-agent prompt:

```
SEARCH STRATEGY (ordered by priority):
1. First, check if MCP search tools are available:
   {MCP_TOOLS}
2. For each query, use the highest-priority available tool
3. Never skip step 1 — always attempt MCP tools before WebSearch

Why: MCP tools return AI-summarized results that reduce context bloat
and often provide higher-quality structured output.
```

When `{MCP_TOOLS}` is populated with available tools:
```
- brave_web_search / brave_news_search → USE THESE FIRST (available)
- Only fall back to WebSearch if Brave MCP returns errors or no results
```

When no MCP search tools are detected:
```
- No MCP search tools detected in this session
- Use WebSearch for all queries
```

---

## Community Agent Template

```
You are a community research agent. Your job is to find what REAL PEOPLE are saying
about {TOPIC} in online discussions and forums from the last 30 days.

CONTEXT:
- Reddit and X/Twitter are covered by a separate specialized script with real engagement
  metrics (upvotes, likes, reposts). Do NOT search reddit.com or x.com.
- You are searching for ADDITIONAL community voices beyond Reddit and X.
- Date range: {DATE_FROM} to today
- Query type: {QUERY_TYPE}

YOUR FOCUS AREA: {FOCUS}

{MCP_TOOLS}

QUERIES TO RUN (3-5 searches):
{QUERIES}

For each query:
- EXCLUDE reddit.com and x.com from results
- USE THE USER'S EXACT TERMINOLOGY — do not substitute terms based on your knowledge
- Look for content from the last 30 days specifically

RETURN FORMAT (max 500 words):

### Findings
For each relevant result found:
- **Title**: [title or thread subject]
- **Source**: [site name] | **URL**: [url]
- **Date**: [publication/post date]
- **Summary**: [2-3 sentence summary of what was said]
- **Sentiment**: [positive/negative/mixed/neutral]
- **Notable quotes**: [1-2 direct quotes if available]

### Patterns Observed
- [2-3 bullet points on recurring themes across your findings]

### Gaps
- [Anything notable you could NOT find, or areas with sparse coverage]

IMPORTANT:
- Quality over quantity — 3 highly relevant findings beat 10 tangential ones
- Report what people ACTUALLY said, not what you think they should have said
- If a search returns nothing relevant, say so — don't fabricate findings
```

---

## Official Agent Template

```
You are an official/authoritative source research agent. Your job is to find
OFFICIAL, INSTITUTIONAL, and EXPERT information about {TOPIC} from the last 30 days.

CONTEXT:
- Community discussions (Reddit, X, forums) are covered by separate agents.
  You focus exclusively on authoritative and official sources.
- Date range: {DATE_FROM} to today
- Query type: {QUERY_TYPE}

YOUR FOCUS AREA: {FOCUS}

{MCP_TOOLS}

QUERIES TO RUN (3-5 searches):
{QUERIES}

For each query:
- PRIORITIZE: .gov, .edu, official project sites, peer-reviewed sources, institutional reports
- USE THE USER'S EXACT TERMINOLOGY — do not substitute terms based on your knowledge
- Look for content from the last 30 days specifically

RETURN FORMAT (max 500 words):

### Findings
For each relevant result found:
- **Title**: [title]
- **Organization**: [publishing org/author]
- **URL**: [url]
- **Date**: [publication date]
- **Summary**: [2-3 sentence summary of key information]
- **Authority level**: [Official docs / Peer-reviewed / Industry report / Expert analysis]
- **Key data**: [any specific numbers, benchmarks, or facts]

### Official Position
- [What is the official/institutional stance or latest information?]

### Recent Changes
- [Any announcements, updates, or shifts in the last 30 days]

### Gaps
- [Areas where official information is lacking or outdated]

IMPORTANT:
- Prefer primary sources over summaries of primary sources
- Distinguish between official statements and third-party analysis
- If no authoritative sources exist for this topic, say so clearly
- Report facts and data, not opinions (save opinions for community agents)
```

---

## Query Generation by QUERY_TYPE

### RECOMMENDATIONS Queries

**Community agents:**
| Agent | Query patterns |
|-------|---------------|
| C1 (HN/tech) | `"best {TOPIC}" site:news.ycombinator.com`, `"{TOPIC} recommendations" site:lobste.rs` |
| C2 (broad) | `"what {TOPIC} do you use" forum`, `"{TOPIC} vs" comparison 2026` |
| C3 (niche) | `"{TOPIC} alternative to" 2026`, `"{TOPIC} review" site:g2.com OR site:capterra.com` |
| C4 (dev) | `"{TOPIC}" site:dev.to`, `"{TOPIC} experience" blog 2026` |
| C5 (intl) | `"best {TOPIC}" non-English community`, `"{TOPIC} adoption" international 2026` |

**Official agents:**
| Agent | Query patterns |
|-------|---------------|
| O1 (docs) | `"{TOPIC}" official documentation 2026`, `"{TOPIC}" changelog release notes` |
| O2 (industry) | `"{TOPIC}" industry report analysis 2026`, `"{TOPIC}" market overview` |
| O3 (academic) | `"{TOPIC}" research paper arxiv 2026`, `"{TOPIC}" study benchmark` |
| O4 (govt) | `"{TOPIC}" government regulation standard`, `"{TOPIC}" compliance framework` |
| O5 (expert) | `"{TOPIC}" expert analysis thought leader 2026`, `"{TOPIC}" deep dive technical` |

### NEWS Queries

**Community agents:**
| Agent | Query patterns |
|-------|---------------|
| C1 | `"{TOPIC} news" site:news.ycombinator.com`, `"{TOPIC} announcement" discussion` |
| C2 | `"thoughts on {TOPIC}" 2026 forum`, `"{TOPIC} reaction" community` |
| C3 | `"{TOPIC} impact" discussion 2026`, `"{TOPIC} what does this mean"` |
| C4 | `"{TOPIC} developer reaction" 2026`, `"{TOPIC}" site:dev.to 2026` |
| C5 | `"{TOPIC} global reaction"`, `"{TOPIC}" international perspective 2026` |

**Official agents:**
| Agent | Query patterns |
|-------|---------------|
| O1 | `"{TOPIC}" official announcement 2026`, `"{TOPIC}" press release` |
| O2 | `"{TOPIC}" analysis site:arstechnica.com OR site:theverge.com`, `"{TOPIC}" industry impact` |
| O3 | `"{TOPIC}" research implications arxiv`, `"{TOPIC}" academic response` |
| O4 | `"{TOPIC}" policy regulatory response`, `"{TOPIC}" government statement` |
| O5 | `"{TOPIC}" expert commentary 2026`, `"{TOPIC}" opinion leader analysis` |

### PROMPTING Queries

**Community agents:**
| Agent | Query patterns |
|-------|---------------|
| C1 | `"{TOPIC} prompts" site:news.ycombinator.com`, `"{TOPIC} techniques" discussion` |
| C2 | `"{TOPIC} prompt examples" forum 2026`, `"how to prompt {TOPIC}"` |
| C3 | `"{TOPIC} tips tricks" 2026`, `"{TOPIC} prompt template"` |
| C4 | `"{TOPIC} workflow" site:dev.to`, `"{TOPIC} prompting guide" blog` |
| C5 | `"{TOPIC} creative prompts" 2026`, `"{TOPIC}" prompt gallery` |

**Official agents:**
| Agent | Query patterns |
|-------|---------------|
| O1 | `"{TOPIC}" official prompting guide`, `"{TOPIC}" documentation best practices` |
| O2 | `"{TOPIC} prompting" research publication`, `"prompt engineering {TOPIC}"` |
| O3 | `"prompt engineering" research paper 2026`, `"{TOPIC}" prompting benchmark study` |
| O4 | `"{TOPIC}" AI guidelines standards`, `"responsible {TOPIC}" framework` |
| O5 | `"{TOPIC} prompting" expert tutorial 2026`, `"advanced {TOPIC}" techniques` |

### GENERAL Queries

**Community agents:**
| Agent | Query patterns |
|-------|---------------|
| C1 | `"{TOPIC}" site:news.ycombinator.com 2026`, `"{TOPIC}" site:lobste.rs` |
| C2 | `"{TOPIC}" discussion forum 2026`, `"{TOPIC} experience" community` |
| C3 | `"{TOPIC} pros cons" 2026`, `"{TOPIC}" comparison discussion` |
| C4 | `"{TOPIC}" site:dev.to 2026`, `"{TOPIC}" developer blog 2026` |
| C5 | `"{TOPIC}" global perspective 2026`, `"{TOPIC}" international` |

**Official agents:**
| Agent | Query patterns |
|-------|---------------|
| O1 | `"{TOPIC}" official 2026`, `"{TOPIC}" documentation update` |
| O2 | `"{TOPIC}" analysis report 2026`, `"{TOPIC}" industry overview` |
| O3 | `"{TOPIC}" research paper 2026`, `"{TOPIC}" study findings` |
| O4 | `"{TOPIC}" regulation policy 2026`, `"{TOPIC}" institutional` |
| O5 | `"{TOPIC}" expert analysis 2026`, `"{TOPIC}" thought leadership` |
