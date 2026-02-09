# Feedback Loop Patterns

Complex operations need validation checkpoints.

Cross-reference: Part of `content-quality-checklist.md` Section 6.

---

## Assessment Questions

- [ ] **Multi-step workflows have verification steps**
- [ ] **Critical operations have rollback/recovery paths**
- [ ] **Checklists provided for 5+ step workflows**
- [ ] **Validation runs BEFORE destructive actions**

---

## When Feedback Loops Are Required

| Operation Type | Feedback Loop Needed |
|----------------|---------------------|
| Single-file edits | No |
| Multi-file refactors | Yes - verify after each stage |
| Database operations | Yes - validate before commit |
| External API calls | Yes - check response before continuing |
| Document generation | Yes - preview before finalizing |

---

## Feedback Loop Pattern

```markdown
# GOOD - Validation before proceeding
1. Make edits to `document.xml`
2. **Validate immediately**: `python scripts/validate.py`
3. If validation fails:
   - Review error message
   - Fix the issue
   - Run validation again
4. **Only proceed when validation passes**
5. Rebuild: `python scripts/build.py`
```

---

## Checklist Template

For workflows with 5+ steps, provide copy-paste checklist:

```markdown
Copy this checklist and track progress:

Task Progress:
- [ ] Step 1: Analyze input
- [ ] Step 2: Create plan file
- [ ] Step 3: Validate plan (CHECKPOINT)
- [ ] Step 4: Execute changes
- [ ] Step 5: Verify output (CHECKPOINT)
```

---

## Missing Loop Detection

Red flags:
- "Make all changes, then verify at the end"
- No validation step between planning and execution
- Destructive operations without confirmation
- Multi-file operations without intermediate checks
