---
name: review-skill
description: "Reviews and automatically fixes Claude Code skills against official Anthropic best practices. Use when checking skill quality, refactoring bloated skills, improving discoverability, or contributing to open-source skills. Supports review, auto-fix, external review, and PR modes."
license: MIT
argument-hint: "[skill-path] [mode]"
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
| **Review + Auto-Fix** (default) | User says "review", "check", "grade", or gives no mode | Run full deep review, then auto-fix all findings |
| **Review Only** | User says "report only", "no fix", "read-only" | Run full deep review, report only, no changes |
| **Auto-Fix Only** | User says "fix", "improve", "refactor", "auto-fix" | Skip report, apply fixes directly |
| **External Review** | User says "external", target is a GitHub URL | Clone to /tmp/, full deep review, report only (read-only) |
| **Auto-PR** | User says "PR", "contribute", "auto-pr" | Fork, full deep review, fix, submit PR |

When no mode keyword is present, default to **Review + Auto-Fix**. The deep review always runs in every mode. Auto-fix always follows the deep review unless the user explicitly requests report-only output.

## Setup (Optional)

Install `create-skill` for automated validation: see `references/setup.md`

All modes work without it using manual evaluation.

---

<instructions>

## Mode 1: Review + Auto-Fix (Default)

Run a full deep review across every evaluation dimension, then automatically fix all findings.

**Step 1: Run automated validation** (if create-skill installed):
```bash
python3 "$CREATE_SKILL"/scripts/quick_validate.py <target-skill>
python3 "$CREATE_SKILL"/scripts/security_scan.py <target-skill> --verbose
```

**Step 2: Structural evaluation** -- Read `references/evaluation-checklist.md` and check every item against the target skill. Record pass/fail for each item with the file path and line number of the finding.

**Step 3: Content quality evaluation** -- Read `references/content-quality-checklist.md` and evaluate all 8 dimensions (degrees of freedom, conciseness, actionability, options overload, script quality, feedback loops, consistency, time-sensitive content). Record findings per dimension.

**Step 4: Deep review** -- Read `references/research-backed-criteria.md` and check all 6 criteria. Record a pass/fail verdict for each:
1. XML tag usage
2. Example quality (3-5 diverse examples)
3. Defect taxonomy (specification, input, structure, context, performance, maintainability)
4. Anti-patterns (OWASP, vendor docs, academic)
5. Formatting effectiveness
6. HELM-inspired metrics (clarity, actionability, robustness, maintainability, safety)

**Step 5: Generate report** as markdown with:
- Executive summary table (aspect, grade, notes)
- Section-by-section findings with file paths and line numbers
- Deep review results table (criterion, verdict, evidence)
- Combined grade using the unified rubric from `references/evaluation-checklist.md`
- Recommended fixes ranked by severity (major first, then minor)

**Step 6: Verify report** before presenting:
- [ ] Every finding has a file path and line number
- [ ] Grade matches rubric criteria
- [ ] Fixes are actionable (no "consider" or "ensure")
- [ ] Deep review covers all 6 criteria from `references/research-backed-criteria.md`

**Step 7: Present report, then proceed to auto-fix.** After showing the full review report, automatically apply all recommended fixes using the Auto-Fix procedure (Mode 2). Do not wait for user confirmation. The review informs the fix -- every finding from Steps 2-4 becomes a fix target.

<example>
**Review + Auto-Fix Report Format:**

# Skill Review: pdf

## Executive Summary

| Aspect | Grade | Notes |
|--------|-------|-------|
| Frontmatter | A | Third-person description with triggers |
| Structure | B | 487 lines -- close to 500-line limit |
| Content Quality | B | One decision point missing a default |
| Deep Review | B | Missing 2 example tags, no defect in other criteria |
| Scripts | A | Proper error handling throughout |
| **Combined** | **B** | One minor structural issue |

## Deep Review Results

| Criterion | Verdict | Evidence |
|-----------|---------|----------|
| XML tag usage | Pass | `<instructions>` and `<example>` tags present |
| Example quality | Fail | Only 2 examples, need 3-5 diverse cases |
| Defect taxonomy | Pass | No specification, input, structure, context, performance, or maintainability defects |
| Anti-patterns | Pass | No OWASP, vendor, or academic anti-patterns |
| Formatting | Pass | Consistent Markdown + XML structure |
| HELM metrics | Pass | Clarity 5/5, Actionability pass, Robustness pass, Maintainability pass, Safety pass |

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

---

## Auto-Fix Applied

Proceeding to fix all findings above...

**Changes summary:** 2 issues fixed, 1 file reorganised, line count reduced from 487 to 395.
</example>

</instructions>

<instructions>

## Mode 2: Auto-Fix

Automatically refactor a skill to meet best practices. When triggered by Mode 1 (Review + Auto-Fix), use the review findings as the fix list. When triggered standalone, run Steps 1-2 below to identify issues first.

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
| Missing `context: fork` (task-based skill) | Check for task-based signals (`<instructions>` tags, script references, `agent` field, 3+ numbered steps). Add to frontmatter only when signals are present. |
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
**Auto-Fix: No issues found (Grade A skill)**

Skill `changelog` analysed. 280 lines, all checks pass. No fixes needed.

**Changes summary:** 0 issues found, 0 files changed. Skill meets Grade A criteria.
</example>

<example>
**File Naming When Moving**
- `learn.md` → `references/learning-guide.md`
- `reference.md` → `references/[descriptive-name].md`
- `ui-reference.md` + `official-ui-reference.md` → `references/cli-reference.md` (merge)
</example>

</instructions>

<instructions>

## Mode 3: External Review

Review a skill from an external GitHub repository without modifying it. Clone to `/tmp/review-target`, identify the author's intent, run all three evaluation checks (structural, content quality, deep review), generate a read-only improvement report with strengths and findings, then delete the clone.

Read `references/mode-external-review.md` for the full step-by-step procedure.

</instructions>

<instructions>

## Mode 4: Auto-PR

Fork an external skill repository, improve it, and submit a pull request. Run a full deep review, apply auto-fix using the findings, verify all changes are additive (no deletions, no functionality removed), pass the self-review respect check, then create a PR with summary, rationale, and test plan.

Read `references/mode-auto-pr.md` for the full step-by-step procedure. Use `references/pr-template.md` for the PR format.

</instructions>

## References

| File | Purpose | Used By |
|------|---------|---------|
| `references/evaluation-checklist.md` | Structural validation + unified grading rubric | Review, Auto-Fix |
| `references/content-quality-checklist.md` | Content effectiveness (8 dimensions) | Review, Auto-Fix |
| `references/research-backed-criteria.md` | Deep review with academic citations | All modes (always runs) |
| `references/script-quality.md` | Script error handling, constants | Review, Auto-Fix |
| `references/feedback-loops.md` | Multi-step workflow validation | Review, Auto-Fix |
| `references/mode-external-review.md` | Full External Review procedure | External Review |
| `references/mode-auto-pr.md` | Full Auto-PR procedure with respect checks | Auto-PR |
| `references/pr-template.md` | PR description template | Auto-PR |
| `references/marketplace_template.json` | marketplace.json template | Auto-PR |
| `references/sources.md` | Bibliography | Review (deep) |
| `references/setup.md` | create-skill installation | Setup |

[Official Best Practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)
