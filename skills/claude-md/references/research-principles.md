# Research-Backed Principles

<!-- v1.0.0 | 2026-01-30 -->

## Anthropic's Preference: Reasoning Over Rules

From official Anthropic documentation (as of skill v1.0):

| Finding | Source | Implication |
|---------|--------|-------------|
| "Claude generalizes from explanations" | Anthropic Claude documentation | Include "why" with every rule |
| "Understand why, not just what" | Anthropic model guidelines | Reasoning enables novel situations |
| Positively framed rules outperform prohibitions | Constitutional AI research | "Do X" beats "Don't do Y" |
| Context improves generalization | Claude prompting best practices | Models apply reasoning to edge cases |

## Academic Evidence: Hybrid is Optimal

| Finding | Source | Implication |
|---------|--------|-------------|
| Rules + reasoning = 57.7% quality improvement | ATLAS Benchmark (as of v1.0) | Combine both, don't choose one |
| Models game rules without understanding "why" | Specification Gaming Research | Reasoning prevents loopholes |
| Repetition improves compliance significantly | Industry research (as of v1.0) | Keep safety reminders |
| "Lost in the middle" effect | Liu et al. 2024 | Critical rules at start AND end |
| ~150-200 instruction limit | Industry analysis | Stay focused, not exhaustive |

## The Optimal Format

```
Directive + Brief Reasoning (1-2 sentences)
```

**Best format:** Tables with Rule | Bad | Good | Why columns
```markdown
| Rule | Bad | Good | Why |
|------|-----|------|-----|
| Never commit secrets | `git add .` with .env | `git add src/` explicit | In history forever; rotation expensive |
```

This combines:
- Clear directive
- Concrete examples
- Brief reasoning
