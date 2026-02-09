# Skill Evaluation Checklist

Complete checklist based on [official Anthropic best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices).

## YAML Frontmatter

### Required Fields

- [ ] `name` field present and valid
  - Max 64 characters
  - Lowercase letters, numbers, hyphens only
  - No reserved words (anthropic, claude)
  - Gerund form recommended (processing-pdfs)

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

## Grading Rubric

| Grade | Criteria |
|-------|----------|
| **A** | All checks pass, under 300 lines, excellent structure |
| **B** | Minor issues (1-2 warnings), under 500 lines |
| **C** | Critical issues (over 500 lines OR missing context: fork) |
| **D** | Multiple critical issues |
| **F** | Missing description OR broken structure |

## Quick Auto-Fix Reference

| Issue | Auto-Fix Action |
|-------|-----------------|
| Noun phrase description | Rewrite with verb ("Processes...", "Extracts...") |
| Missing trigger | Add "Use when..." clause |
| Missing `context: fork` | Add to frontmatter |
| Over 500 lines | Extract to `references/` |
| Loose files | Move to `references/` with clear names |
| Duplicate refs | Merge into single file |
