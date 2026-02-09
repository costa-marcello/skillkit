# Content Quality Checklist

Evaluates skill **effectiveness**, not just structure. Use alongside `evaluation_checklist.md` for complete reviews.

Based on [Anthropic Best Practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices).

---

## 1. Degrees of Freedom Analysis

Match specificity to task fragility. Wrong freedom level = skill failure.

### Assessment Questions

- [ ] **Fragile operations use low freedom** (exact scripts, few parameters)
- [ ] **Flexible tasks allow high freedom** (text instructions, heuristics)
- [ ] **No over-constraining** on tasks with multiple valid approaches
- [ ] **No under-constraining** on operations requiring exact sequences

### Freedom Level Guide

| Task Type | Freedom | Format | Example |
|-----------|---------|--------|---------|
| Code reviews, troubleshooting | High | Text instructions | "Analyze structure, check edge cases" |
| API integration, data processing | Medium | Pseudocode + params | `process(data, format="json")` |
| Database migrations, form validation | Low | Exact scripts | `python scripts/migrate.py --verify` |

### Detection Patterns

**Too Rigid** (high freedom task with low freedom instructions):
```markdown
# BAD: Code review with exact steps
1. Check line 1-10 for imports
2. Check line 11-20 for class definition
3. Check exactly 5 edge cases
```

**Too Loose** (low freedom task with high freedom instructions):
```markdown
# BAD: Database migration with vague guidance
"Modify the schema as needed, being careful about data integrity"
```

### Bridge/Field Analogy

- **Narrow bridge with cliffs**: Exact instructions, no deviation (migrations, auth flows)
- **Open field**: General direction, Claude finds best route (analysis, reviews)

---

## 2. Conciseness Audit

Every token competes with conversation history. Challenge each paragraph.

### Assessment Questions

- [ ] **No explanations of common concepts** Claude already knows
- [ ] **Each paragraph justifies its token cost**
- [ ] **Code examples are minimal** (show pattern, not full implementation)
- [ ] **No filler phrases** ("It's important to note that...", "As you may know...")

### Token Cost Test

For each section, ask:
1. "Does Claude really need this explanation?"
2. "Can I assume Claude knows this?"
3. "Would removing this hurt Claude's ability to execute?"

### Detection Patterns

**Fails Conciseness** (unnecessary explanation):
```markdown
# BAD
PDF (Portable Document Format) files are a common file format that contains
text, images, and other content. To extract text from a PDF, you'll need to
use a library. There are many libraries available for PDF processing...
```

**Passes Conciseness** (direct instruction):
```markdown
# GOOD
Use pdfplumber for text extraction:
```python
import pdfplumber
with pdfplumber.open("file.pdf") as pdf:
    text = pdf.pages[0].extract_text()
```
```

### Common Violations

| Violation | Fix |
|-----------|-----|
| Explaining what APIs are | Remove entirely |
| Describing what JSON is | Assume known |
| "There are several ways to..." | Pick one, show it |
| History/background sections | Delete unless critical context |

---

## 3. Actionability Check

Abstract instructions cause Claude to guess. Concrete instructions execute.

### Assessment Questions

- [ ] **All instructions are executable** (not "consider doing X")
- [ ] **Examples show input/output pairs** where helpful
- [ ] **"As needed" always has a default** or heuristic
- [ ] **No ambiguous pronouns** (unclear "it", "this", "that")

### Actionability Test

Can Claude execute this instruction without:
1. Guessing author's intent?
2. Asking clarifying questions?
3. Making assumptions about scope?

### Detection Patterns

**Not Actionable** (vague):
```markdown
# BAD
"Review the code structure appropriately"
"Handle errors as needed"
"Adjust the output format"
```

**Actionable** (specific):
```markdown
# GOOD
"Check for: 1) Unused imports 2) Functions over 50 lines 3) Missing type hints"
"On HTTP 429: wait 2^n seconds (max 60s), retry up to 3 times"
"Output as JSON with fields: {status, message, data}"
```

### Verb Strength Scale

| Weak (avoid) | Strong (use) |
|--------------|--------------|
| Consider | Check for |
| Ensure | Verify that X returns Y |
| Handle appropriately | On error X, do Y |
| As needed | Default to X; use Y if Z |

---

## 4. Options Overload Detection

Multiple options without defaults cause decision paralysis.

### Assessment Questions

- [ ] **Tools/libraries have a recommended default**
- [ ] **Alternatives listed as escape hatches** (not buffets)
- [ ] **Decision criteria provided** when choice matters
- [ ] **No more than 3 primary paths** for any decision

### Options Pattern

**Correct Pattern** (default + escape hatch):
```markdown
# GOOD
Use pdfplumber for text extraction.

For scanned PDFs requiring OCR, use pdf2image with pytesseract instead.
```

**Anti-Pattern** (buffet of options):
```markdown
# BAD
You can use pypdf, or pdfplumber, or PyMuPDF, or pdf2image, or...
```

### Detection Checklist

- [ ] Any list of 3+ tools without recommendation?
- [ ] Any "you could do A, B, or C" without default?
- [ ] Any fork in workflow without decision criteria?

### Decision Tree Template

When multiple approaches exist, provide structure:
```markdown
**Choosing approach:**
- Need speed? → Use X
- Need accuracy? → Use Y
- Default (most cases) → Use Z
```

---

## 5. Script Quality

Scripts should solve problems, not punt to Claude.

**Quick checks:**
- [ ] Explicit error handling (no bare `except:`)
- [ ] All constants documented
- [ ] Recovery actions, not just failures
- [ ] No hardcoded secrets or user-specific paths

**Full patterns:** See `script-quality.md`

---

## 6. Feedback Loop Presence

Complex operations need validation checkpoints.

**Quick checks:**
- [ ] Multi-step workflows have verification steps
- [ ] Critical operations have rollback/recovery paths
- [ ] Checklists provided for 5+ step workflows
- [ ] Validation runs BEFORE destructive actions

**Full patterns:** See `feedback-loops.md`

---

## 7. Consistency Check

Contradictions waste Claude's reasoning tokens reconciling conflicts instead of executing.

### Assessment Questions

- [ ] **No conflicting instructions** within same file
- [ ] **No contradictions** between SKILL.md and references
- [ ] **Consistent terminology** throughout (same terms for same concepts)
- [ ] **Cross-references valid** (sections mentioned actually exist)

### Intra-File Contradictions

Check within each file for:

| Type | Example | Problem |
|------|---------|---------|
| Conflicting rules | "Always use JSON" + "Output YAML for configs" | Which takes priority? |
| Inconsistent defaults | Section A: "default: 3" / Section B: "default: 5" | Claude guesses |
| Mixed terminology | "skill" vs "plugin" vs "extension" | Confusing |
| Contradicting examples | Example 1 shows X, Example 2 contradicts | Which to follow? |

### Inter-File Contradictions

Check across SKILL.md and references:

| Type | Example | Problem |
|------|---------|---------|
| Conflicting counts | SKILL.md: "3 examples" / reference: "5 examples" | Mismatch |
| Different patterns | Two files show different error handling | Inconsistent |
| Stale references | "See section X" but X renamed/deleted | Broken link |
| Version drift | SKILL.md updated, references outdated | Desync |

### Detection Process

1. List all instructions/rules from SKILL.md
2. List all instructions/rules from each reference
3. Compare for conflicts (same topic, different guidance)
4. Check terminology consistency
5. Verify all cross-references resolve

### Quick Consistency Test

For each key decision in the skill, ask:
- Is this stated the same way everywhere?
- If mentioned in multiple places, do they agree?
- Would Claude get confused reading both?

---

## 8. Time-Sensitive Content Detection

Content that expires becomes dangerous misinformation.

### Assessment Questions

- [ ] **No date-conditional logic** ("If you're doing this before...")
- [ ] **Version numbers are current or clearly marked deprecated**
- [ ] **URLs point to stable documentation** (not blog posts)
- [ ] **Deprecated approaches in "Old Patterns" section**

### Detection Patterns

**Time-sensitive** (bad):
```markdown
# BAD
If you're doing this before August 2025, use the old API.
After August 2025, use the new API.
```

**Time-proof** (good):
```markdown
# GOOD
## Current method
Use the v2 API endpoint: `api.example.com/v2/messages`

## Old patterns
<details>
<summary>Legacy v1 API (deprecated 2025-08)</summary>
The v1 API used: `api.example.com/v1/messages`
This endpoint is no longer supported.
</details>
```

### Content Decay Checklist

- [ ] No "currently" or "at the time of writing"?
- [ ] No specific dates in conditional logic?
- [ ] API versions explicit and updatable?
- [ ] External links to official docs (not tutorials)?

### Half-Life Assessment

| Content Type | Typical Half-Life | Handling |
|--------------|-------------------|----------|
| Core algorithms | Years | Include directly |
| API endpoints | Months | Link to official docs |
| Library versions | Weeks | Use "latest" or pin with note |
| Blog tutorials | Days | Avoid or extract principles only |

---

## Grading Rubric

| Grade | Criteria |
|-------|----------|
| **A** | All 8 sections pass, excellent examples, tight feedback loops |
| **B** | 1-2 minor issues (slight verbosity, missing default) |
| **C** | 1 major issue (wrong freedom level, no feedback loop for complex task) |
| **D** | 2+ major issues (options overload AND contradictions across files) |
| **F** | Fundamentally unactionable OR scripts punt all problems to Claude |

### Major vs Minor Issues

**Major Issues** (grade drops to C or below):
- Wrong degrees of freedom for task type
- No feedback loop for destructive/complex operations
- Scripts with bare except or voodoo constants
- Fundamentally vague/unactionable core instructions
- Contradictions between SKILL.md and references

**Minor Issues** (grade drops to B):
- Slightly verbose explanations
- Missing default for one decision point
- One piece of time-sensitive content
- Minor magic numbers without documentation
- Inconsistent terminology (minor, same concept different words)

---

## Quick Reference

| Section | Core Question |
|---------|---------------|
| Degrees of Freedom | Is specificity matched to task fragility? |
| Conciseness | Does each paragraph justify token cost? |
| Actionability | Can Claude execute without guessing? |
| Options Overload | Is there a clear default? |
| Script Quality | Do scripts solve or punt? |
| Feedback Loops | Can Claude verify before proceeding? |
| Consistency | Do all files agree? No contradictions? |
| Time-Sensitive | Will this be wrong in 6 months? |
