---
name: review-skill
description: "Reviews and automatically fixes Claude Code skills against official Anthropic best practices. Use when checking skill quality, refactoring bloated skills, improving discoverability, or contributing to open-source skills. Supports review, auto-fix, external review, and PR modes."
license: MIT
context: fork
agent: general-purpose
---

# Review Skill

## Target Skill

The target skill to review is: `$ARGUMENTS`

If `$ARGUMENTS` is empty, ask the user which skill to review.

## Mode Selection

| Mode | Trigger | Action |
|------|---------|--------|
| **Review** (default) | User says "review", "check", "grade", or gives no mode | Generate quality report |
| **Auto-Fix** | User says "fix", "improve", "refactor", "auto-fix" | Read, evaluate, then apply fixes |
| **External Review** | User says "external", target is a GitHub URL | Clone to /tmp/, report only (read-only) |
| **Auto-PR** | User says "PR", "contribute", "auto-pr" | Fork, fix, submit PR |

When no mode keyword is present, default to **Review**.

## Setup (Optional)

Install `create-skill` for automated validation: see `references/setup.md`

All modes work without it using manual evaluation.

---

<instructions>

## Mode 1: Review (Default)

Evaluate a skill and generate a quality report.

**Step 1: Run automated validation** (if create-skill installed):
```bash
python3 "$CREATE_SKILL"/scripts/quick_validate.py <target-skill>
python3 "$CREATE_SKILL"/scripts/security_scan.py <target-skill> --verbose
```

**Step 2: Structural evaluation** -- Read `references/evaluation_checklist.md` and check every item against the target skill. Record pass/fail for each item with the file path and line number of the finding.

**Step 3: Content quality evaluation** -- Read `references/content-quality-checklist.md` and evaluate all 8 dimensions (degrees of freedom, conciseness, actionability, options overload, script quality, feedback loops, consistency, time-sensitive content). Record findings per dimension.

**Step 4: Deep review** (run when the skill targets open-source distribution, production use, or the user requests thorough analysis) -- Read `references/research-backed-criteria.md` and check XML tag usage, example quality, defect taxonomy, anti-patterns, formatting, and HELM-inspired metrics.

**Step 5: Generate report** as markdown with:
- Executive summary table (aspect, grade, notes)
- Section-by-section findings with file paths and line numbers
- Combined grade using the unified rubric from `references/evaluation_checklist.md`
- Recommended fixes ranked by severity (major first, then minor)

**Step 6: Verify report** before presenting:
- [ ] Every finding has a file path and line number
- [ ] Grade matches rubric criteria
- [ ] Fixes are actionable (no "consider" or "ensure")

<example>
**Review Report Format:**

# Skill Review: pdf

## Executive Summary

| Aspect | Grade | Notes |
|--------|-------|-------|
| Frontmatter | A | Third-person description with triggers |
| Structure | B | 487 lines -- close to 500-line limit |
| Content Quality | B | One decision point missing a default |
| Scripts | A | Proper error handling throughout |
| **Combined** | **B** | One minor structural issue |

## Findings

### 1. Line count approaching limit (Minor)
**File:** `SKILL.md` (487 lines)
**Fix:** Move the "Advanced Extraction" section (lines 320-410) to `references/advanced-extraction.md`.

### 2. Missing default for output format (Minor)
**File:** `SKILL.md`, line 145
**Finding:** Lists JSON, CSV, and Markdown output without recommending a default.
**Fix:** Add "Default to Markdown. Use JSON when the user needs machine-readable output."

## Recommended Fixes (by severity)

1. Extract advanced section to references (structural)
2. Add default output format recommendation (content)
</example>

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
**Before/After: Auto-Fix on a bloated skill**

Before (SKILL.md, 580 lines):
```yaml
---
name: data-export
description: "Export data from databases"
license: MIT
---
```
- No trigger conditions in description
- No `context: fork` despite script usage
- 580 lines with inline SQL reference (lines 310-520)
- Vague step: "Ensure the export format is correct"
- 3 loose files in root: `formats.md`, `sql-ref.md`, `tips.md`

After (SKILL.md, 340 lines):
```yaml
---
name: data-export
description: "Exports data from SQL and NoSQL databases to CSV, JSON, or Parquet. Use when extracting datasets, scheduling recurring exports, or migrating between storage systems."
license: MIT
context: fork
agent: general-purpose
---
```
- Description rewritten: third-person verb + three trigger conditions
- `context: fork` added (scripts and `<instructions>` tags present)
- SQL reference extracted to `references/sql-syntax.md` (210 lines saved)
- Vague step rewritten: "Run `python3 scripts/validate_schema.py` against the output file"
- Loose files moved: `formats.md` → `references/export-formats.md`, `sql-ref.md` merged into `references/sql-syntax.md`, `tips.md` → `references/troubleshooting.md`

**Changes summary:** 6 issues fixed, 3 files reorganised, line count reduced from 580 to 340.
</example>

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

Evaluate someone else's skill repository (read-only). Do not modify any files.

**Step 1: Clone the repository:**
```bash
git clone <github-url> /tmp/review-target
```

**Step 2: Read all files** in the skill directory. Start with SKILL.md, then read every file in `references/`, `scripts/`, and `assets/`.

**Step 3: Identify the author's intent** by answering:
- What problem does this skill solve?
- Who is the target user?
- What workflow does it automate?

**Step 4: Run structural evaluation** -- Apply `references/evaluation_checklist.md` against the cloned skill. Record pass/fail per item.

**Step 5: Run content quality evaluation** -- Apply `references/content-quality-checklist.md` across all 8 dimensions.

**Step 6: Run deep review** (for open-source or production skills) -- Apply `references/research-backed-criteria.md`.

**Step 7: Generate improvement report** as markdown. Include:
- What the skill does well (acknowledge strengths first)
- Findings with file paths and line numbers
- Suggested improvements ranked by severity
- Do not make changes -- report only

**Step 8: Clean up:**
```bash
rm -rf /tmp/review-target
```

<example>
**External Review Summary:**

The `data-pipeline` skill handles CSV-to-database ingestion with retry logic and schema validation.

**Strengths:**
- Clear step-by-step workflow with validation checkpoints
- Scripts have proper error handling

**Findings:**
1. (Major) SKILL.md at 620 lines -- exceeds 500-line limit. Move lines 400-580 to `references/schema-validation.md`.
2. (Minor) Description uses imperative voice ("Browse data..."). Change to "Browses data sources and ingests..."
3. (Minor) No `context: fork` despite having `<instructions>` tags and script references.
</example>

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

## References

| File | Purpose | Used By |
|------|---------|---------|
| `references/evaluation_checklist.md` | Structural validation + unified grading rubric | Review, Auto-Fix |
| `references/content-quality-checklist.md` | Content effectiveness (8 dimensions) | Review, Auto-Fix |
| `references/research-backed-criteria.md` | Deep review with academic citations | Review (deep) |
| `references/script-quality.md` | Script error handling, constants | Review, Auto-Fix |
| `references/feedback-loops.md` | Multi-step workflow validation | Review, Auto-Fix |
| `references/pr_template.md` | PR description template | Auto-PR |
| `references/marketplace_template.json` | marketplace.json template | Auto-PR |
| `references/sources.md` | Bibliography | Review (deep) |
| `references/setup.md` | create-skill installation | Setup |

[Official Best Practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)
