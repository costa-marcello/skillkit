# Anthropic Skill Authoring Best Practices Summary

This reference summarizes official Anthropic guidance for creating effective Claude Code skills. For complete documentation, see [Anthropic Best Practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices).

## Conciseness Requirements

- Keep SKILL.md under 500 lines (soft limit) or ~5,000 words
- Remove explanations of concepts Claude already knows
- Challenge the token cost of every paragraph—if it doesn't add unique procedural knowledge, delete it
- Prefer bundled references over inline content for detailed documentation
- Use progressive disclosure: metadata always loaded, SKILL.md on trigger, references on demand

## Degrees of Freedom Guidance

Match instruction specificity to task fragility:

| Freedom Level | When to Use | Instruction Style |
|---------------|-------------|-------------------|
| **High** | Multiple valid approaches; context determines best path | Text instructions with guidelines |
| **Medium** | Preferred patterns exist with acceptable variation | Pseudocode with parameters |
| **Low** | Operations are fragile; consistency critical; sequence matters | Exact scripts or step-by-step commands |

**Examples:**
- High freedom: Code reviews, troubleshooting, content analysis
- Medium freedom: API integration patterns, data processing workflows
- Low freedom: PDF rotation, database migrations, form validation

## Description Writing Rules

1. **Start with a third-person verb** (e.g., "Guides...", "Provides...", "Analyzes...")
2. **Include trigger keywords** that users might say to invoke the skill
3. **Be specific** about what the skill does AND when to use it
4. **Keep under 300 characters** for optimal display in skill listings (hard limit: 1024)
5. **Avoid generic phrases** like "helps with" or "assists in"

**Good example:**
```
"Guides users through creating effective Claude Code skills with specialized knowledge, workflows, and tool integrations. Use when users want to create a new skill, update an existing skill, or ask about skill structure."
```

**Bad example:**
```
"A skill for helping with skill creation"
```

## Progressive Disclosure Patterns

Structure skills in three loading tiers:

1. **Metadata** (~100 words) - Always in context
   - name and description in YAML frontmatter
   - Must be highly discoverable and trigger-rich

2. **SKILL.md body** (<5k words) - Loaded when skill triggers
   - Core procedural instructions
   - Decision trees and workflow steps
   - References to bundled resources

3. **Bundled resources** (unlimited) - Loaded as needed
   - Detailed documentation in `references/`
   - Scripts in `scripts/`
   - Templates and assets in `assets/`

## Structural Checklist

### Required Elements
- [ ] YAML frontmatter with `name` and `description`
- [ ] `description` in **third-person verb form** ("Processes...", "Extracts...") with "Use when..." trigger conditions
- [ ] `context: fork` set correctly for the skill's class (see `frontmatter_reference.md` — autonomous only; NOT for orchestrators or interactive skills)
- [ ] `<instructions>` tags wrap multi-step workflows (deep-review criterion 1)
- [ ] `<example>` blocks wrap 3 to 5 diverse concrete examples (deep-review criterion 2)

### Quality Checks
- [ ] No duplicate information between SKILL.md and references
- [ ] All referenced files (`scripts/`, `references/`, `assets/`) exist
- [ ] No hardcoded paths or personal information
- [ ] No version history in SKILL.md (use marketplace.json)
- [ ] Imperative/infinitive verb forms in the body (description stays third-person)
- [ ] Line count under 400 (Grade A) or under 500 (Grade B minimum)
- [ ] Multi-step workflows have a verification step before destructive actions
- [ ] Strong verbs in `<instructions>` ("run", "check", "verify") — not "consider", "ensure", "handle appropriately"

### Optional Enhancements
- [ ] `allowed-tools` for permission-free tool access
- [ ] `argument-hint` for autocomplete guidance

## Actionability Test

Before finalizing, verify instructions are actionable:

1. Can another Claude instance execute without guessing author intent?
2. Are there decision points without clear criteria?
3. Do multi-step workflows have verification between steps?
4. Are error recovery paths documented?

If any answer is "no," add specificity until actionable.

## Common Mistakes to Avoid

| Mistake | Fix |
|---------|-----|
| Generic description | Add specific trigger keywords |
| Missing `context: fork` on autonomous skill | Add only if the skill runs end-to-end without dispatching sub-agents and without pausing for the user |
| `context: fork` on orchestrator, interactive, or mode-style reasoning skill | Remove — see `frontmatter_reference.md` for the four-class taxonomy (only Class A autonomous gets fork) |
| Inline detailed docs | Move to `references/` files |
| Hardcoded paths | Use relative paths or placeholders |
| Version sections in SKILL.md | Track in marketplace.json only |
| Second-person voice | Use imperative/infinitive form |
| Over-specified flexible tasks | Match freedom to task fragility |
| Under-specified fragile tasks | Add exact scripts or commands |
