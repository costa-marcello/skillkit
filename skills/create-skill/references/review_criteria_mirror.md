# Review Criteria as Authoring Rules

Every rule below is enforced by `review-skill` when a skill is reviewed. Authoring to these rules from the start — rather than fixing them later — is cheaper and produces a Grade A skill on first review. For full details, consult the canonical sources in `review-skill/references/`.

## Single principle

The `review-skill` checklists are authoring rules, not only review rules. Write the skill so every rule below is satisfied before validation ever runs.

## Structural rules (from `review-skill/references/evaluation-checklist.md`)

| Rule | How to satisfy while authoring |
|------|------------------------------|
| SKILL.md under 400 lines (Grade A) | While writing, move any section longer than 50 lines to `references/`. Stop and extract whenever the running line count passes 350. |
| Frontmatter: `name` is lowercase hyphen-case, max 64 chars, no reserved words | Choose the name once, when initialising the skill folder. Do not rename later. |
| Frontmatter: `description` is third-person verb ("Processes...", "Extracts...") | Write the description as the first thing after choosing the name. Start with the verb. Add "Use when..." triggers in the same sentence. |
| `context: fork` correctly applied (four-class taxonomy) | Decide the class BEFORE writing the body. See `frontmatter_reference.md`. Only Class A (autonomous) gets fork. Paired with `agent` if set. |
| Only SKILL.md in root; all supporting files in `references/`, `scripts/`, `assets/` | Never place a loose `.md` or script in root. Create `references/` before writing any reference content. |
| 3-5 diverse `<example>` blocks | Plan the examples during Step 2 (Planning). Each must cover a genuinely different scenario — not three variants of the same case. |
| `<instructions>` tags wrap multi-step workflows | Wrap every numbered-step workflow in `<instructions>...</instructions>` as you write it, not after. |
| Every multi-step workflow has a verification step | After writing the last step of a workflow, add a "Verify:" checkpoint before the workflow ends. Do this before moving on to the next section. |
| 0 contradictions within or across files | When a fact (a default, a rule, a path) is stated in SKILL.md, either keep it ONLY in SKILL.md or move it to a reference and delete from SKILL.md. Never state the same fact twice. |

## Content quality rules (from `review-skill/references/content-quality-checklist.md`)

Write to these eight dimensions as you author each paragraph:

1. **Degrees of freedom**: match instruction specificity to task fragility. Fragile operations need exact commands; flexible tasks take guidelines. Choose the level per section before writing it.
2. **Conciseness**: do not explain concepts Claude already knows (JSON, REST, HTTP, git basics). If a paragraph answers "does Claude already know this?" with yes, delete it now.
3. **Actionability**: use strong verbs only — "run", "check", "verify", "read", "write", "edit". Do not use "consider", "ensure", "handle appropriately", "as needed". Replace these as soon as you notice them.
4. **Options with defaults**: when listing 3+ options, name a default and an escape hatch in the same block. "Default to X. Use Y when Z."
5. **Script quality**: every `except:` must name a specific exception class and state a recovery action. Never write bare `except:`.
6. **Feedback loops**: every destructive action and every 5+ step workflow ends with a verification step (run a test, diff, re-read).
7. **Consistency**: the same concept has the same name everywhere. Pick one term per concept at the start; grep for variants before shipping.
8. **Time-sensitive content**: no date-conditional logic. Keep pinned versions with a comment noting they may be outdated. Wrap deprecated approaches in `<details>` with a deprecation label.

## Deep-review criteria (from `review-skill/references/research-backed-criteria.md`)

Apply these six criteria while drafting:

1. **XML tag usage**: use `<instructions>` for workflows, `<example>` for concrete cases, `<context>` for background. Structure first, prose second.
2. **Example quality**: 3-5 `<example>` blocks, each genuinely different. Include one success case, one edge case, one failure/recovery case at minimum.
3. **Defect taxonomy**: before finalising, check the skill does not have: specification defects (vague requirements), input defects (missing validation), structure defects (no sections or ordering), context defects (assumes knowledge not provided), performance defects (unbounded loops or scans), maintainability defects (duplication, magic numbers).
4. **Anti-patterns to avoid**: no OWASP anti-patterns (hardcoded secrets, unsafe deserialisation), no vendor-marketing prose ("revolutionary", "best-in-class"), no academic prose ("hereafter we shall..."), no "MUST"/"CRITICAL" over-specification.
5. **Formatting effectiveness**: tables for parallel rules, numbered lists for sequences, bullet lists for unordered groups. Pick the right structure; do not use prose to describe a table's worth of rules.
6. **HELM-inspired metrics**: before saving, self-check five qualities — clarity (a stranger can execute the skill), actionability (every directive has a strong verb), robustness (edge cases handled), maintainability (no duplication), safety (no destructive default paths).

## Process mirror

The creation process and the review process share criteria. When the author finishes drafting a section, they should mentally check the corresponding review-skill rule. When the skill is done, running `/review-skill` should find zero issues because the author already applied every rule.

If the review-skill flags something, it is a gap in the author's application of this mirror — not a surprise from the reviewer. That gap should be understood (why did I miss this rule?) and not just patched.
