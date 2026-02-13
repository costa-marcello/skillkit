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

## Pre-Flight Check

Before starting any mode, verify the target skill exists:

1. Check the target path contains a `SKILL.md` file. If not, report "No SKILL.md found at [path]" and stop.
2. List all files in the skill directory and `references/` (if present) to build a complete file inventory.
3. Record the initial line count of `SKILL.md` with `wc -l`.

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

**Step 8: Post-fix verification.** After auto-fix completes, re-run Steps 2-4 against the modified skill. If any issues remain, fix them. Repeat until 0 major and 0 minor issues remain. Report the final grade with before/after comparison.

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
- [ ] Step 1: Read SKILL.md and all files in root, references/, scripts/, assets/
- [ ] Step 2: Run structural check (evaluation-checklist.md), content quality check (content-quality-checklist.md), deep review (research-backed-criteria.md). List every issue with file path and line number.
- [ ] Step 3: Fix frontmatter (description, context: fork correctness, missing fields)
- [ ] Step 4: Create references/ folder if needed
- [ ] Step 5: Move content over 500 lines to references/
- [ ] Step 6: Move loose files to references/ with clear names
- [ ] Step 7: Update SKILL.md references section
- [ ] Step 8: Verify final line count under 400 (Grade A target) or under 500 (Grade B minimum)
- [ ] Step 9: Run evaluation again to confirm 0 major and 0 minor issues remain
- [ ] Step 10: Generate summary of changes (files modified, issues fixed, before/after line counts, final grade)
```

**Auto-Fix Actions:**

| Issue | Automatic Fix |
|-------|--------------|
| Description not third-person | Rewrite: "Processes...", "Extracts..." |
| Missing trigger conditions | Add "Use when..." clause |
| `context: fork` incorrectly applied | **Autonomous skills** (self-contained work, no sub-agent dispatch): add `context: fork` + `agent`. **Orchestrator skills** (dispatch sub-agents via Task tool): REMOVE `context: fork` and `agent` — a forked subagent cannot spawn further subagents. **Definitive conflict:** `context: fork` set AND `allowed-tools` contains `Task`, `TeamCreate`, `TaskCreate`, or `SendMessage`. **Body signals:** "spawn agents", "dispatch agents", "parallel agents/sub-agents", agent allocation tables, TaskOutput collection. |
| SKILL.md over 500 lines | Extract sections to `references/` |
| Loose files in root | Move to `references/` with descriptive names |
| Duplicate reference files | Merge and deduplicate |

**Content Quality Fixes:**

| Issue | Automatic Fix |
|-------|--------------|
| Vague instructions ("consider", "ensure") | Rewrite with strong verbs ("check", "verify", "run") |
| Too many options without default | Add recommended default + escape hatch pattern |
| Missing feedback loop | Add validation checkpoint before destructive actions |
| Verbose explanations Claude knows | Delete paragraphs that explain common concepts (JSON, APIs, HTTP). If the paragraph answers "Does Claude already know this?" with yes, remove it. |
| Time-sensitive content | Remove date-conditional logic. Replace pinned versions with "latest" plus a comment noting the version at time of writing. Wrap deprecated approaches in `<details>` with a deprecation label. |
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
- No `context: fork` -- autonomous skill (runs scripts, no sub-agent dispatch)
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
- Loose files moved and renamed: `formats.md` -> `references/export-formats.md`, `sql-ref.md` merged into `references/sql-syntax.md`, `tips.md` -> `references/troubleshooting.md`

**Changes summary:** 6 issues fixed, 3 files reorganised, line count reduced from 580 to 340.
</example>

<example>
**Auto-Fix: Grade D skill with multiple major issues**

Before (SKILL.md, 720 lines):
```yaml
---
name: api-tester
description: "Test your APIs"
license: MIT
---
```
Issues found:
- (M1) 720 lines, over 500-line limit
- (M8) Description imperative ("Test your") + no "Use when..." triggers
- (M2) Missing `context: fork` -- autonomous skill (no sub-agent dispatch) with script references
- (M7) 4 directives use "ensure" or "handle appropriately" with no defaults
- (m1) Lines 50-80 explain what REST APIs are
- (m8) 2 loose `.md` files in root beside SKILL.md

After (SKILL.md, 310 lines):
```yaml
---
name: api-tester
description: "Tests REST and GraphQL API endpoints with automated assertions. Use when validating API contracts, running regression tests, or checking response schemas."
license: MIT
context: fork
agent: general-purpose
---
```
- Description rewritten: third-person + three triggers
- `context: fork` added
- 410 lines extracted to `references/api-patterns.md` and `references/schema-validation.md`
- 4 vague directives replaced: "ensure response is valid" became "run `python3 scripts/validate_response.py --schema expected.json`"
- REST explanation deleted (Claude knows what REST is)
- Loose files moved: `common-headers.md` -> `references/http-headers.md`, `auth-flows.md` -> `references/authentication.md`

**Changes summary:** 6 major + 2 minor issues fixed, 2 files reorganised, line count reduced from 720 to 310. Grade improved from D to A.
</example>

<example>
**Auto-Fix: No issues found (Grade A skill)**

Skill `changelog` analysed. 280 lines, all checks pass. No fixes needed.

**Changes summary:** 0 issues found, 0 files changed. Skill meets Grade A criteria.

Note: When a skill dispatches sub-agents via the Task tool (orchestrator pattern), do NOT add `context: fork`. A forked subagent cannot spawn further subagents, breaking the dispatch chain.
</example>

</instructions>

<instructions>

## Mode 3: External Review

Review a skill from an external GitHub repository without modifying it.

Read `references/mode-external-review.md` for the full step-by-step procedure. If the reference fails to load, follow this inline summary:

1. Clone: `git clone <github-url> /tmp/review-target`
2. Read all files: SKILL.md first, then references/, scripts/, assets/.
3. Identify intent: What problem does the skill solve? Who uses it? What workflow does it automate?
4. Run all three evaluations (structural, content quality, deep review) using the same checklists as Mode 1 Steps 2-4.
5. Generate read-only report: strengths first, then findings with file paths and line numbers, ranked by severity.
6. Verify report: every finding has file path + line number, grade matches rubric, fixes use strong verbs.
7. Clean up: `rm -rf /tmp/review-target`

Do not modify any files. Report only.

</instructions>

<instructions>

## Mode 4: Auto-PR

Fork an external skill repository, improve it, and submit a pull request.

Read `references/mode-auto-pr.md` for the full procedure and `references/pr-template.md` for the PR format. If references fail to load, follow this inline summary:

1. Fork: `gh repo fork <github-url> --clone --remote`
2. Branch: `git checkout -b refactor/skill-best-practices`
3. Run full deep review (Mode 1 Steps 2-4).
4. Apply Auto-Fix (Mode 2) using review findings.
5. Self-review respect check -- verify: no files deleted, no functionality removed, original language preserved, all changes additive.
6. Create PR with: summary, what is NOT changed, rationale for each change, test plan.
7. Use `gh pr create` with the template from `references/pr-template.md`.

Core principle: additive only. Do not delete files or remove functionality.

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
