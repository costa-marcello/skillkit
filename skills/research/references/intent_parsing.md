# Intent Parsing Reference

<!-- Extracted from SKILL.md — full query type definitions, detection patterns, and variable storage -->

## Variables to Extract

Before doing anything, parse the user's input for these four variables:

1. **TOPIC**: What they want to learn about
2. **TARGET_TOOL** (if specified): Where they'll use the prompts (e.g., "Nano Banana Pro", "Midjourney")
3. **QUERY_TYPE**: One of the four types below
4. **DEPTH**: Controls sub-agent count via flags

## Query Type Definitions

| Type | Trigger Patterns | Example |
|------|-----------------|---------|
| **PROMPTING** | "X prompts", "prompting for X", "X best practices" | "photorealistic people prompts" |
| **RECOMMENDATIONS** | "best X", "top X", "what X should I use" | "best Claude Code skills" |
| **NEWS** | "what's happening with X", "X news", "latest on X" | "what's new with OpenAI" |
| **GENERAL** | Anything that doesn't match above | "how does RAG work" |

## Depth Flags

| Flag | Agents | Split |
|------|--------|-------|
| `--quick` | 6 | 3 community + 3 official |
| *(default)* | 8 | 4 community + 4 official |
| `--deep` | 10 | 5 community + 5 official |

## Common Detection Patterns

- `[topic] for [tool]` -> "web mockups for Nano Banana Pro" -> TOOL IS SPECIFIED
- `[topic] prompts for [tool]` -> "UI design prompts for Midjourney" -> TOOL IS SPECIFIED
- Just `[topic]` -> "iOS design mockups" -> TOOL NOT SPECIFIED, that's OK
- "best [topic]" or "top [topic]" -> QUERY_TYPE = RECOMMENDATIONS

## Variable Storage

Store as: `TOPIC`, `TARGET_TOOL` (or "unknown"), `QUERY_TYPE`, `DEPTH`.

Do not ask about target tool before research. If tool is specified, use it. If not, run research first, then ask after showing results.
