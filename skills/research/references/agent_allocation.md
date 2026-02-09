# Agent Allocation Reference

<!-- Extracted from SKILL.md — full agent roles, focus areas, and dispatch pattern -->

## Agent Count by Depth

| Depth | Community Agents | Official Agents | Total |
|-------|-----------------|-----------------|-------|
| `--quick` | 3 (C1-C3) | 3 (O1-O3) | 6 |
| default | 4 (C1-C4) | 4 (O1-O4) | 8 |
| `--deep` | 5 (C1-C5) | 5 (O1-O5) | 10 |

## Community Agents

Each agent searches a different slice of the community landscape. All EXCLUDE reddit.com and x.com.

| Agent | Focus | When Active |
|-------|-------|-------------|
| C1 | HN + tech forums (Lobsters, Stack Overflow) | Always |
| C2 | Broader community discussions (forums, Discourse, Product Hunt) | Always |
| C3 | Niche communities + comparisons (review sites, specialized forums) | Always |
| C4 | Developer/creator communities (Dev.to, GitHub Discussions, blogs) | default + deep |
| C5 | International perspectives + user reviews (G2, Capterra, global forums) | deep only |

## Official Agents

Each agent searches a different slice of the authoritative landscape.

| Agent | Focus | When Active |
|-------|-------|-------------|
| O1 | Official docs + changelogs + release notes | Always |
| O2 | Industry publications + analysis (Ars Technica, Wired, InfoQ) | Always |
| O3 | Academic papers + research (arXiv, Google Scholar) | Always |
| O4 | Government/institutional + standards bodies | default + deep |
| O5 | Expert blogs + thought leadership | deep only |

## Constructing Sub-Agent Prompts

For each agent, build a prompt from the templates in `subagent_prompts.md`:

1. Choose **Community Agent Template** or **Official Agent Template**
2. Fill in variables: `{TOPIC}`, `{QUERY_TYPE}`, `{FOCUS}`, `{QUERIES}` (3-5 queries adapted to QUERY_TYPE), `{DATE_FROM}` (30 days ago), `{MCP_TOOLS}`
3. Each Task call uses `subagent_type: "general-purpose"`

## Dispatch Pattern Example (default depth, 8 agents)

```
Task(description="C1: HN + tech forums", subagent_type="general-purpose", prompt="[filled community template]")
Task(description="C2: broad community", subagent_type="general-purpose", prompt="[filled community template]")
Task(description="C3: niche + comparisons", subagent_type="general-purpose", prompt="[filled community template]")
Task(description="C4: dev communities", subagent_type="general-purpose", prompt="[filled community template]")
Task(description="O1: official docs", subagent_type="general-purpose", prompt="[filled official template]")
Task(description="O2: industry pubs", subagent_type="general-purpose", prompt="[filled official template]")
Task(description="O3: academic papers", subagent_type="general-purpose", prompt="[filled official template]")
Task(description="O4: govt/institutional", subagent_type="general-purpose", prompt="[filled official template]")
```

**DISPATCH ALL AGENTS IN A SINGLE MESSAGE.** Do not dispatch sequentially.
