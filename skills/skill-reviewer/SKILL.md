---
name: skill-reviewer
version: 1.1.0
description: Reviews and automatically fixes Claude Code skills against official Anthropic best practices. Use when checking skill quality, refactoring bloated skills, improving discoverability, or contributing to open-source skills. Supports review, auto-fix, and PR modes.
context: fork
---

# Skill Reviewer

## Setup (Optional)

Install `skill-creator` for automated validation: see `references/setup.md`

All modes work without it using manual evaluation.

## Four Modes

| Mode | Use Case | Action |
|------|----------|--------|
| **Review** | Check skill quality | Generate report with grade |
| **Auto-Fix** | Fix your own skills | Automatically refactor |
| **External Review** | Evaluate others' skills | Report only (read-only) |
| **Auto-PR** | Contribute to open-source | Fork, fix, submit PR |

---

<instructions>

## Mode 1: Review (Default)

Evaluate a skill and generate a quality report.

**Automated validation** (if skill-creator installed):
```bash
python3 "$SKILL_CREATOR"/*/quick_validate.py <target-skill>
python3 "$SKILL_CREATOR"/*/security_scan.py <target-skill> --verbose
```

**Manual evaluation**: See `references/evaluation_checklist.md`

**Deep review**: For thorough analysis, also consult `references/research-backed-criteria.md`

**Report Format**: Output as markdown with:
- Executive summary table (aspect, grade, notes)
- Section-by-section findings
- Issues found with file paths and line numbers
- Recommended fixes

**Structural Checklist:**

| Category | Check | Required |
|----------|-------|----------|
| **Frontmatter** | `name` present (lowercase, hyphens) | Yes |
| | `description` in third-person verb | Yes |
| | `description` includes trigger conditions | Yes |
| | `context: fork` present | **Mandatory** |
| **Structure** | SKILL.md under 500 lines | Yes |
| | Only SKILL.md in root (no loose files) | Yes |
| | Reference files in `references/` folder | Yes |
| **Formatting** | Uses XML tags for structure (`<example>`, `<instructions>`) | Recommended |
| | Examples wrapped in `<example>` blocks | Recommended |

**Content Quality Checklist:** See `references/content-quality-checklist.md`

Key areas: Degrees of Freedom, Conciseness, Actionability, Options Overload, Script Quality, Feedback Loops, Consistency, Time-Sensitive Content

</instructions>

---

<instructions>

## Mode 2: Auto-Fix

Automatically refactor a skill to meet best practices.

```
Auto-Fix Progress:
- [ ] Step 1: Read SKILL.md and all loose files
- [ ] Step 2: Run evaluation, identify issues
- [ ] Step 3: Fix frontmatter (description, context: fork)
- [ ] Step 4: Create references/ folder if needed
- [ ] Step 5: Move content over 500 lines to references/
- [ ] Step 6: Move loose files to references/ with clear names
- [ ] Step 7: Update SKILL.md references section
- [ ] Step 8: Verify final line count under 500
- [ ] Step 9: Generate summary of changes (files modified, issues fixed, before/after line counts)
```

**Auto-Fix Actions:**

| Issue | Automatic Fix |
|-------|--------------|
| Description not third-person | Rewrite: "Processes...", "Extracts..." |
| Missing trigger conditions | Add "Use when..." clause |
| Missing `context: fork` | Add to frontmatter |
| SKILL.md over 500 lines | Extract sections to `references/` |
| Loose files in root | Move to `references/` with descriptive names |
| Duplicate reference files | Merge and deduplicate |

**Content Quality Fixes:**

| Issue | Automatic Fix |
|-------|--------------|
| Vague instructions ("consider", "ensure") | Rewrite with strong verbs ("check", "verify", "run") |
| Too many options without default | Add recommended default + escape hatch pattern |
| Missing feedback loop | Add validation checkpoint before destructive actions |
| Verbose explanations Claude knows | Flag for condensing (manual review) |
| Time-sensitive content | Flag for removal or add deprecation notice |
| Scripts with bare `except:` | Add specific error handling with recovery actions |
| No examples provided | Add 3-5 diverse `<example>` blocks |
| Plain text structure (no delimiters) | Add XML tags (`<instructions>`, `<context>`) |
| Over-specification ("MUST", "CRITICAL") | Use natural language; Claude follows clear instructions |

<example>
**File Naming When Moving**
- `learn.md` → `references/learning-guide.md`
- `reference.md` → `references/[descriptive-name].md`
- `ui-reference.md` + `official-ui-reference.md` → `references/cli-reference.md` (merge)
</example>

</instructions>

---

<instructions>

## Mode 3: External Review

Evaluate someone else's skill repository (read-only).

```
External Review Workflow:
- [ ] Clone repository to /tmp/
- [ ] Read ALL documentation first
- [ ] Identify author's intent
- [ ] Run evaluation checklist
- [ ] For deep review, check research-backed-criteria.md
- [ ] Generate improvement report (no changes)
```

</instructions>

---

<instructions>

## Mode 4: Auto-PR

Fork, improve, and submit PR to external skill repository.

```
Auto-PR Workflow:
- [ ] Fork repository (gh repo fork)
- [ ] Create feature branch
- [ ] Run Auto-Fix mode
- [ ] Self-review: respect check passed?
- [ ] Create PR with detailed explanation
```

### Core Principle: Additive Only

When improving external skills, NEVER:
- Delete existing files
- Remove functionality
- Change primary language
- Rename components

ALWAYS:
- Add new capabilities
- Preserve original content
- Explain every change

<example>
**Additive Changes**
- BAD: "Removed metadata.json (non-standard)"
- GOOD: "Added marketplace.json (metadata.json preserved)"
- BAD: "Rewrote README in English"
- GOOD: "Added README.en.md (Chinese preserved as default)"
</example>

### PR Tone Guidelines

<example>
**Respectful Framing**
- BAD: "Your skill doesn't follow best practices"
- GOOD: "This PR aligns with best practices for better discoverability"
- BAD: "Fixed the incorrect description"
- GOOD: "Improved description with trigger conditions"
</example>

### PR Required Sections

1. **Summary** - What this PR does
2. **What's NOT Changed** - Show respect for original
3. **Rationale** - Why each change helps
4. **Test Plan** - How to verify

Template: `references/pr_template.md`

### Self-Review Before Submitting

```
Respect Check:
- [ ] No files deleted?
- [ ] No functionality removed?
- [ ] Original language preserved?
- [ ] Author's design decisions respected?
- [ ] All changes are additive?
- [ ] PR explains the "why"?
```

</instructions>

---

## Common Issues & Fixes

<example>
**Description Not Third-Person**
- Before: `description: Complete PDF manipulation toolkit for...`
- After: `description: "Extracts text from PDFs, creates documents. Use when working with PDF files."`
</example>

<example>
**Missing context: fork**
- Before: frontmatter with only `name` and `description`
- After: add `context: fork` to frontmatter
</example>

<example>
**SKILL.md Over 500 Lines**
- Before: `SKILL.md (1500 lines)` with loose `.md` files in root
- After: `SKILL.md (~300 lines)` with content extracted to `references/`

**Extract**: configs, detailed examples, API docs → `references/`
**Keep**: quick start, reference table, core patterns, references section
</example>

---

## References

### Core Checklists
- `references/evaluation_checklist.md` - Structural validation
- `references/content-quality-checklist.md` - Content effectiveness

### Specialized Guides
- `references/script-quality.md` - Script error handling, constants
- `references/feedback-loops.md` - Multi-step workflow validation
- `references/research-backed-criteria.md` - Deep review with citations

### Templates & Sources
- `references/pr_template.md` - PR description template
- `references/marketplace_template.json` - marketplace.json template
- `references/sources.md` - Bibliography
- [Official Best Practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)
