# Research-Backed Criteria for Deep Reviews

<!-- v1.0 | 2026-01-29 -->

Use this reference when performing thorough skill reviews. These criteria come from official vendor documentation and peer-reviewed research.

---

## 1. XML Tag Usage (Anthropic Official)

Claude is trained on XML-tagged prompts. Research shows 15-20% improvement with proper XML structure.

### What to Check

| Check | Pass | Fail |
|-------|------|------|
| Instructions wrapped | `<instructions>...</instructions>` | Plain prose |
| Examples tagged | `<example>...</example>` | Unmarked examples |
| Context separated | `<context>...</context>` | Mixed with instructions |
| Consistent naming | Same tags throughout | Inconsistent tags |

### Recommended Tags

- `<instructions>` - Core directives
- `<example>` or `<examples>` - Demonstrations
- `<context>` - Background information
- `<thinking>` and `<answer>` - Chain-of-thought separation
- `<formatting>` - Output format specifications

**Source**: [Anthropic Prompt Engineering - Use XML Tags](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/use-xml-tags)

---

## 2. Example Quality (Academic Consensus)

Research shows 3-5 diverse examples optimal. Quality matters more than quantity.

### Assessment Criteria

| Criterion | Good | Bad |
|-----------|------|-----|
| **Relevance** | Mirrors actual use cases | Generic/unrelated |
| **Diversity** | Covers edge cases | All similar |
| **Format** | Input/output pairs in `<example>` tags | Prose descriptions |
| **Count** | 3-5 examples | 0-1 or 10+ |

### Warning Signs

- **Too few**: No examples = Claude guesses format
- **Too many**: >10 examples = diminishing returns, token waste
- **Wrong order**: Example order affects performance (Lu et al., 2022)

**Sources**:
- Anthropic: "3-5 diverse, relevant examples"
- arXiv:2509.13196: Performance degrades beyond ~20 examples
- EMNLP 2022 (Min et al.): Format matters more than label correctness

---

## 3. Prompt Defect Categories

A taxonomy of 6 defect dimensions from academic research.

| Category | What to Check | Red Flags |
|----------|---------------|-----------|
| **Specification** | Clear intent? | Ambiguous instructions |
| **Input/Content** | Data well-formatted? | Messy input structure |
| **Structure** | Organized with delimiters? | Wall of text |
| **Context** | Sufficient background? | Missing critical info |
| **Performance** | Token-efficient? | Bloated instructions |
| **Maintainability** | Easy to modify? | Hardcoded values, fragile patterns |

**Source**: arXiv:2509.14404 - "A Taxonomy of Prompt Defects in LLM Systems"

---

## 4. Anti-Patterns from Official Sources

### From OWASP LLM Top 10 2025

| Risk | Detection | Mitigation |
|------|-----------|------------|
| Prompt injection | User input mixed with instructions | Separate with XML tags, validate input |
| Scope creep | No defined boundaries | Explicit "do not" statements |

### From OpenAI/Anthropic Docs

| Anti-Pattern | Problem | Fix |
|--------------|---------|-----|
| Over-specification | "MUST", "CRITICAL", "NEVER" overuse | Natural language works |
| Conflicting instructions | Model spends tokens reconciling | Clear hierarchy |
| Vague tool rules | "Use tools when helpful" | Specify exact conditions |
| Passive personality | "Be helpful" | Explicit behavioral rules |

### From Academic Research

| Anti-Pattern | Evidence | Impact |
|--------------|----------|--------|
| Single complex prompt | arXiv:2411.09916 | Most common failure mode |
| Ignoring token limits | Multiple sources | Parsing struggles |
| No iteration | Practitioner guides | First attempt rarely optimal |

---

## 5. Formatting Effectiveness

Research shows format can vary performance by 40%.

### Model-Specific Preferences

| Model | Preferred Format | Source |
|-------|-----------------|--------|
| Claude | XML tags, Markdown | Anthropic official |
| GPT-4 | Markdown headers | arXiv:2411.10541 |
| GPT-3.5 | JSON | arXiv:2411.10541 |

### Universal Principles

1. **Clarity > complexity** - Direct instructions outperform elaborate engineering
2. **Consistent delimiters** - Pick XML or Markdown, use throughout
3. **Hierarchical structure** - Headers for sections, tags for components
4. **Tables for comparisons** - Easier for LLMs to scan than prose

---

## 6. Evaluation Metrics (HELM-Inspired)

For comprehensive skill assessment, evaluate across multiple dimensions.

| Metric | Question | Scoring |
|--------|----------|---------|
| **Clarity** | Can a human understand in one read? | 1-5 scale |
| **Actionability** | Is each instruction executable? | Pass/Fail per instruction |
| **Robustness** | Would rewording break it? | Test 3 phrasings |
| **Maintainability** | Can it be updated without breaking? | Identify brittle parts |
| **Safety** | Are boundaries defined? | Check scope statements |

---

## 7. When to Use Deep Review

| Scenario | Use Deep Review |
|----------|-----------------|
| Open-source contribution | Yes - higher bar for community skills |
| Production skill | Yes - reliability matters |
| Personal/experimental | No - standard review sufficient |
| User requests thorough review | Yes - consult this file |

---

## Quick Checklist for Deep Review

```
Deep Review Criteria:
- [ ] XML tags used for structure?
- [ ] 3-5 diverse examples present?
- [ ] No defects in 6 taxonomy categories?
- [ ] No anti-patterns from vendor docs?
- [ ] Format matches model preferences?
- [ ] Passes HELM-inspired metrics?
```
