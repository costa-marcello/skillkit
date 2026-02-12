# Mode 3: External Review

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

**Step 4: Run full evaluation** -- Run the same three checks as Mode 1 Steps 2-4:
1. Structural checks via `references/evaluation-checklist.md`
2. Content quality via `references/content-quality-checklist.md`
3. Deep review via `references/research-backed-criteria.md` (all 6 criteria: XML tags, example quality, defect taxonomy, anti-patterns, formatting, HELM metrics)

**Step 5: Generate improvement report** as markdown. Include:
- What the skill does well (acknowledge strengths first)
- Findings with file paths and line numbers
- Suggested improvements ranked by severity
- Do not make changes -- report only

**Step 6: Verify report** before presenting:
- [ ] Every finding has a file path and line number
- [ ] Grade matches rubric criteria
- [ ] Fixes are actionable (no "consider" or "ensure")

**Step 7: Clean up:**
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
