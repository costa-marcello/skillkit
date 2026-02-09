# Skill Evaluation Checklist

Complete checklist based on [official Anthropic best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices).

## YAML Frontmatter

### Required Fields

- [ ] `name` field present and valid
  - Max 64 characters
  - Lowercase letters, numbers, hyphens only
  - No reserved words (anthropic, claude)
  - Noun or short-phrase form preferred (pdf, changelog, smart-merge)

- [ ] `description` field present and valid
  - Non-empty
  - Max 1024 characters
  - **Third-person voice** (CRITICAL)
  - Includes trigger conditions ("Use when...")

- [ ] `context: fork` present **(MANDATORY)**
  - Ensures fresh context for subagent workflows
  - Prevents context pollution between invocations

### Description Quality

**Third-Person Voice Check:**

```
❌ "Browse YouTube videos..."          (imperative)
❌ "You can use this to..."            (second person)
❌ "I can help you..."                 (first person)
❌ "Complete toolkit for..."           (noun phrase)
✅ "Browses YouTube videos..."         (third-person verb)
✅ "Extracts text from PDFs..."        (third-person verb)
✅ "Processes Excel files and..."      (third-person verb)
```

**Trigger Conditions Check:**

```
❌ "Processes PDFs"
✅ "Extracts text from PDFs. Use when working with PDF files or when the user mentions document extraction."
```

## File Structure

### Core Requirements

- [ ] **SKILL.md body under 500 lines** (CRITICAL)
- [ ] **Only SKILL.md in root** (no loose .md files)
- [ ] Reference files in `references/` folder
- [ ] One level deep references (no nested references)

### Recommended Structure

```
skill-name/
├── SKILL.md              (under 500 lines)
└── references/
    ├── configuration.md  (if needed)
    ├── examples.md       (if needed)
    └── advanced.md       (if needed)
```

### File Naming

- [ ] Descriptive filenames (not doc1.md, file2.md)
- [ ] Use forward slashes (Unix-style paths)
- [ ] No Windows-style paths (backslashes)

## Content Quality

### Conciseness

- [ ] No obvious explanations Claude already knows
- [ ] Challenge each paragraph: "Does Claude need this?"
- [ ] Default assumption: Claude is already smart

**Good (concise):**
```markdown
Use pdfplumber for text extraction:
\`\`\`python
import pdfplumber
with pdfplumber.open("file.pdf") as pdf:
    text = pdf.pages[0].extract_text()
\`\`\`
```

**Bad (verbose):**
```markdown
PDF (Portable Document Format) files are a common file format...
To extract text from a PDF, you'll need to use a library...
There are many libraries available for PDF processing...
```

### Workflow Patterns

- [ ] Clear sequential steps for complex tasks
- [ ] Copy-paste checklist provided
- [ ] Validation/verification steps included
- [ ] Feedback loops for quality-critical operations

### Progressive Disclosure

- [ ] Main instructions in SKILL.md
- [ ] Detailed content in `references/`
- [ ] Large files include table of contents
- [ ] No duplication between files

## Scripts (if present)

- [ ] Explicit error handling (no bare except)
- [ ] No "voodoo constants" (all values justified)
- [ ] Clear documentation
- [ ] No hardcoded secrets or paths
- [ ] Required packages listed

## Unified Grading Rubric

This is the single grading rubric for the entire skill. Combine findings from this checklist and `content-quality-checklist.md` into one grade.

| Grade | Criteria |
|-------|----------|
| **A** | All structural and content checks pass. Under 300 lines. 3-5 diverse examples. Tight feedback loops. No contradictions. |
| **B** | 1-2 minor issues: slight verbosity, one missing default, minor inconsistent terminology, one piece of time-sensitive content. Under 500 lines. |
| **C** | 1 major issue: over 500 lines, missing `context: fork`, wrong degrees of freedom for task type, no feedback loop for destructive operations, or contradictions between files. |
| **D** | 2+ major issues from different categories. |
| **F** | Missing description, broken structure, or fundamentally unactionable instructions. |

### Major vs Minor Issues

**Major** (drops to C or below):
- Over 500 lines or missing `context: fork`
- Wrong degrees of freedom for the task type
- No feedback loop for destructive or complex operations
- Scripts with bare `except:` or undocumented constants
- Contradictions between SKILL.md and references
- Fundamentally vague or unactionable core instructions

**Minor** (drops to B):
- Slightly verbose explanations
- One missing default for a decision point
- One piece of time-sensitive content
- Minor undocumented constants
- Inconsistent terminology (same concept, different words)
