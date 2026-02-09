# Skill Planning Examples

These examples demonstrate how to analyze concrete use cases and identify reusable resources.

## Example 1: pdf-editor skill

**Trigger:** "Help me rotate this PDF"

**Analysis:**
1. Rotating a PDF requires re-writing the same code each time
2. A `scripts/rotate_pdf.py` script would be helpful to store in the skill

**Freedom Level:** Low (exact script) - PDF rotation is deterministic and fragile

## Example 2: frontend-webapp-builder skill

**Trigger:** "Build me a todo app" or "Build me a dashboard to track my steps"

**Analysis:**
1. Writing a frontend webapp requires the same boilerplate HTML/React each time
2. An `assets/hello-world/` template containing the boilerplate HTML/React project files would be helpful to store in the skill

**Freedom Level:** Medium (pseudocode with parameters) - Preferred patterns exist but implementation varies

## Example 3: big-query skill

**Trigger:** "How many users have logged in today?"

**Analysis:**
1. Querying BigQuery requires re-discovering the table schemas and relationships each time
2. A `references/schema.md` file documenting the table schemas would be helpful to store in the skill

**Freedom Level:** High (text instructions) - Multiple valid approaches depending on context

## Pattern Summary

| Use Case | Freedom | Resource Type | Example |
|----------|---------|---------------|---------|
| Deterministic operations | Low | `scripts/` | PDF rotation, image processing |
| Boilerplate code | Medium | `assets/` | Frontend templates, project scaffolds |
| Domain knowledge | High | `references/` | Database schemas, API docs, policies |
