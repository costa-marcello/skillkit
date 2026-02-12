---
name: claude-md
description: Manages CLAUDE.md files. Audits, reviews, improves, refactors, and generates subdirectory context. Discovers all CLAUDE.md files, evaluates quality against research-backed criteria, generates improvement reports, applies targeted updates, restructures using progressive disclosure, and creates contextual CLAUDE.md files for directories that benefit from instant context. Use when the user says "audit CLAUDE.md", "review my rules", "improve instructions", "organize Claude config", "generate subdirectory context", or "CLAUDE.md maintenance".
allowed-tools: Read, Glob, Grep, Bash, Edit
license: MIT
context: fork
agent: general-purpose
---

<!-- v1.2.0 | 2026-02-12 -->

# Claude MD

**Complete CLAUDE.md management:** Audit, Review, Improve, Refactor, and Generate. Core insight: rules with reasoning outperform bare rules. Models generalize from "why" explanations.

## Quick Reference

| Mode | When to Use | Output |
|------|-------------|--------|
| **Audit** | "Audit CLAUDE.md", "Check all my rule files" | Discovery + quality scores for all files |
| **Review** | "Review my CLAUDE.md", "Check instruction quality" | Detailed quality report + improvement suggestions |
| **Improve** | "Improve my rules", "Fix my CLAUDE.md" | Targeted updates with diffs |
| **Refactor** | "Organize Claude config", "Split CLAUDE.md" | Restructured files with progressive disclosure |
| **Generate** | "Generate subdirectory context", "Create package CLAUDE.md files" | New CLAUDE.md files for directories that need context |

### Mode Sequencing

Modes can be combined in workflows:

| Sequence | When to Use |
|----------|-------------|
| **Audit → Generate** | Audit finds gaps in subdirectory coverage → Generate creates missing files |
| **Audit → Review → Improve** | Full assessment → quality check → targeted fixes |
| **Generate → Review** | Create new files → verify quality meets standards |
| **Improve → Refactor** | Fix issues → restructure if still bloated |

**Generate as follow-up:** After running Audit, if subdirectories lack context files, Generate mode can create them. Generate reuses Phase 1 discovery if Audit was already run in the same session.

---

## Workflow Overview

<instructions>

### Phase 1: Discovery

Find all CLAUDE.md files in the repository:

```bash
find . -name "CLAUDE.md" -o -name ".claude.md" -o -name ".claude.local.md" 2>/dev/null | head -50
```

**File Types & Locations:**

| Type | Location | Purpose |
|------|----------|---------|
| Project root | `./CLAUDE.md` | Primary project context |
| Local overrides | `./.claude.local.md` | Personal/local settings (gitignored) |
| Global defaults | `~/.claude/CLAUDE.md` | User-wide defaults across all projects |
| Package-specific | `./packages/*/CLAUDE.md` | Module-level context in monorepos |
| Subdirectory | Any nested location | Feature/domain-specific context |
| Rules directory | `./.claude/rules/*.md` | Auto-loaded detailed rules |
| Reference docs | `./.claude/reference/*.md` | Large docs (NOT auto-loaded) |

**Note:** Claude auto-discovers CLAUDE.md files in parent directories, making monorepo setups work automatically.

### Phase 2: Quality Assessment

For each CLAUDE.md file, evaluate against quality criteria.

**Quick Assessment Checklist (100 points total):**

| Criterion | Points | Check |
|-----------|--------|-------|
| Commands/workflows | 12 | Are build/test/deploy commands present? |
| Architecture clarity | 12 | Can Claude understand the codebase structure? |
| Non-obvious patterns | 10 | Are gotchas and quirks documented? |
| Conciseness | 8 | No verbose explanations or obvious info? |
| Currency | 8 | Does it reflect current codebase state? |
| **Content Quality** | **50** | See sub-criteria below |

**Content Quality Sub-Criteria (50 points):**

| Sub-criterion | Points | Check |
|---------------|--------|-------|
| Reasoning presence | 15 | Do rules explain "why"? Hybrid style: "Prefer X—it provides Y" |
| Actionability | 10 | No vague language without defaults? Executable instructions? |
| Degrees of freedom | 10 | Rigid for safety, flexible for style? Matches consequence? |
| Options discipline | 5 | Default + escape hatch? Max 3 alternatives? |
| AI-optimized format | 10 | Tables, examples, code blocks over prose walls? |

**Quality Grades:**
- **A (90-100)**: Comprehensive, current, actionable
- **B (70-89)**: Good coverage, minor gaps
- **C (50-69)**: Basic info, missing key sections
- **D (30-49)**: Sparse or outdated
- **F (0-29)**: Missing or severely outdated

<example>
**Audit mode summary output:**

```markdown
## CLAUDE.md Audit Summary

- Files found: 4
- Average score: 72/100 (Grade B)
- Files needing update: 2

| File | Score | Grade | Key Issue |
|------|-------|-------|-----------|
| ./CLAUDE.md | 88/100 | B | Missing gotchas section |
| .claude/rules/coding.md | 91/100 | A | No issues |
| packages/api/CLAUDE.md | 54/100 | C | No commands, vague patterns |
| packages/shared/CLAUDE.md | 56/100 | C | Rules lack reasoning |
```
</example>

**Rule Quality Dimensions (for Review mode):**

| Dimension | Score | Criteria | Applies To |
|-----------|-------|----------|------------|
| **Reasoning** | 0-3 | 0=no why, 1=some, 2=most, 3=all have reasoning | Rules, Patterns, Conventions only |
| **Specificity** | 0-3 | 0=vague, 1=mixed, 2=mostly specific, 3=all actionable | Rules, Patterns, Gotchas |
| **Positive framing** | 0-3 | 0=all negative, 1=mostly negative, 2=mixed, 3=mostly positive | Rules only |
| **Examples** | 0-2 | 0=none, 1=some, 2=good/bad examples | Complex rules/patterns |
| **Structure** | 0-2 | 0=prose wall, 1=basic headers, 2=tables/hierarchy | All content |
| **Conflicts** | 0/-3 | 0=none, -1 per conflict found | All content |

**What needs reasoning vs what doesn't:**

| Section Type | Needs Reasoning? | Example |
|--------------|------------------|---------|
| Context/Description | No | "Stripe integration for subscriptions" — factual |
| Key Files | No | "`stripe.ts` - Stripe client" — factual |
| Architecture | No | Directory structure — factual |
| Commands | No | "`pnpm test`" — executable |
| **Rules/Hard Rules** | Yes | "Never commit secrets — in history forever" |
| **Patterns/Conventions** | Yes | "One route per file — keeps routing predictable" |
| **Gotchas** | Sometimes | Only if non-obvious why it's a gotcha |

### Phase 3: Quality Report Output

Output the quality report before making any updates.

**Report Format:**

<example>
```markdown
## CLAUDE.md Quality Report

### Summary
- Files found: X
- Average score: X/100
- Files needing update: X

### File-by-File Assessment

#### 1. ./CLAUDE.md (Project Root)
**Score: XX/100 (Grade: X)**

| Criterion | Score | Notes |
|-----------|-------|-------|
| Commands/workflows | X/12 | ... |
| Architecture clarity | X/12 | ... |
| Non-obvious patterns | X/10 | ... |
| Conciseness | X/8 | ... |
| Currency | X/8 | ... |
| Content Quality | X/50 | ... |

*Content Quality breakdown:*
| Sub-criterion | Score |
|---------------|-------|
| Reasoning presence | X/15 |
| Actionability | X/10 |
| Degrees of freedom | X/10 |
| Options discipline | X/5 |
| AI-optimized format | X/10 |

**Issues:**
- [List specific problems]

**Recommended additions:**
- [List what should be added]
```
</example>

### Phase 4: Issue Detection (Review Mode)

**Check rules and patterns for:** (not factual context sections)

| Issue Type | Detection | Example Problem | Applies To |
|------------|-----------|-----------------|------------|
| **Missing reasoning** | No "why", "because", explanation | "Never use any" (why?) | Rules, Patterns |
| **Vague instruction** | Not actionable, no concrete guidance | "Write clean code" | Rules, Patterns |
| **Negative-only framing** | "Don't", "Never", "Avoid" without positive alternative | "Don't hardcode URLs" | Rules only |
| **No examples** | Abstract rule without concrete illustration | Complex patterns need examples | Complex rules |
| **Conflicts** | Two rules that contradict | "Use Jest" + "Use Vitest" | All |
| **Redundant** | Duplicates another rule | Same instruction in two places | All |
| **Obvious** | Model does this without instruction | "Use correct syntax" | Rules |
| **Stale commands** | Build commands that no longer work | Outdated paths or scripts | Commands |
| **Missing dependencies** | Required tools not mentioned | Setup requirements omitted | Environment |

**Do NOT flag as issues:**
- Context sections without "why" (factual descriptions don't need reasoning)
- Key Files without explanations (file path + purpose is sufficient)
- Architecture sections without justification (structure is factual)

### Phase 5: Targeted Updates (Improve Mode)

After outputting the quality report, ask user for confirmation before updating.

**Update Guidelines (Critical):**

1. **Propose targeted additions only** - Focus on genuinely useful info:
   - Commands or workflows discovered during analysis
   - Gotchas or non-obvious patterns found in code
   - Package relationships that weren't clear
   - Testing approaches that work
   - Configuration quirks

2. **Keep it minimal** - Avoid:
   - Restating what's obvious from the code
   - Generic best practices already covered
   - One-off fixes unlikely to recur
   - Verbose explanations when a one-liner suffices

3. **Show diffs** - For each change, show:
   - Which CLAUDE.md file to update
   - The specific addition (as a diff or quoted block)
   - Brief explanation of why this helps future sessions

**Diff Format:**

<example>
```markdown
### Update: ./CLAUDE.md

**Why:** Build command was missing, causing confusion about how to run the project.

```diff
+ ## Quick Start
+
+ ```bash
+ npm install
+ npm run dev  # Start development server on port 3000
+ ```
```
```
</example>

### Phase 6: Refactoring (Refactor Mode)

For bloated files, restructure using progressive disclosure.

**Triage Assessment:**

| Signal | Score |
|--------|-------|
| Already uses `.claude/rules/` structure | +2 |
| Has clear hierarchy (headers, tables) | +1 |
| Contains reasoning ("why" explanations) | +1 |
| Rules are actionable and specific | +1 |
| Under 200 lines with dense content | +1 |
| Over 300 lines | -1 |
| Wall-of-text without structure | -2 |
| Contains contradictions | -2 |
| Mix of vague and specific rules | -1 |

| Score | Action |
|-------|--------|
| 4+ | **Skip** — already well-organized |
| 2-3 | **Light** — extract verbose sections |
| 0-1 | **Standard** — full refactoring |
| Negative | **Deep** — significant restructuring |

<example>
**Refactor triage output:**

```markdown
## Triage: ./CLAUDE.md (380 lines)

| Signal | Score |
|--------|-------|
| Uses `.claude/rules/` | 0 |
| Clear hierarchy | +1 |
| Has reasoning | 0 |
| Actionable rules | +1 |
| Length | -1 (>300) |
| Wall-of-text | -2 |

**Total: -1 → Decision: Standard refactoring**

Plan: Extract coding rules to `.claude/rules/coding.md`, add reasoning to bare directives, move testing patterns to `.claude/rules/testing.md`.
```
</example>

**Keep in root (high-value, frequently referenced):**

| Category | Example | Why Keep |
|----------|---------|----------|
| Project description | "React dashboard for analytics" | Sets context for all tasks |
| Commands | `pnpm build`, `pnpm test` | Used every session |
| Hard rules with reasoning | "Never commit secrets — in git history forever" | Safety reinforcement |
| Core principles (3-5) | "Type safety first", "Test behavior not implementation" | Philosophy that guides decisions |
| Priority hierarchy | "Safety > Core Principles > Style" | Conflict resolution |
| Critical @rules references | `@rules/safety.md` | Loads detailed content |

**Extract to `.claude/rules/` (detailed, topic-specific):**
- Detailed language conventions with examples
- Extensive testing patterns
- Framework-specific guidance
- Comprehensive workflow documentation
- Reference tables and checklists

**Output structure:**
```
project-root/
├── CLAUDE.md                     # High-value content with @references
└── .claude/
    ├── rules/                    # Auto-loaded by Claude Code
    │   ├── coding.md
    │   ├── testing.md
    │   ├── workflow.md
    │   └── safety.md
    └── reference/                # NOT auto-loaded (search-triggered)
        └── patterns.md
```

### Phase 7: Apply Updates

After user approval, apply changes using the Edit tool. Preserve existing content structure.

### Mode: Generate (Create Subdirectory Context)

**Triggers:** "Generate subdirectory context", "Create CLAUDE.md for packages", "Add directory context files"

**Workflow:** Scan directories, score by "needs context" heuristics, generate minimal CLAUDE.md files for high-value directories, get user approval before creating any files.

| Phase | Action | Detail |
|-------|--------|--------|
| G1 | Directory Discovery | Scan structure, skip `node_modules`, `dist`, `.git`, etc. Reuse Audit discovery if already run. |
| G2 | Directory Scoring | Score each directory (file count, entry points, naming clarity, monorepo signals). Threshold: >=6 full, 4-5 minimal, <4 skip. |
| G3 | Content Extraction | Extract purpose, key files, patterns, dependencies, gotchas from each candidate. |
| G4 | Preview Generation | Show proposed files with scores and content. |
| G5 | User Approval | Present options: approve all, select specific, modify, or cancel. Never auto-create. |
| G6 | File Creation | Write approved files. Verify: starts with `@../CLAUDE.md`, under 500 tokens, no root duplication. |

See [references/generation-workflow.md](references/generation-workflow.md) for the full scoring algorithm, extraction heuristics, and framework-specific guidance.

<example>
**Generate mode preview output:**

```markdown
## Proposed Subdirectory CLAUDE.md Files

### 1. src/api/CLAUDE.md (Score: 7)
**Reason:** 23 files, has index.ts, API domain

**Content:**
# API Layer

@../CLAUDE.md

## Context
Express routes with Zod validation. All routes require auth middleware.

## Key Files
- `index.ts` - Route registration
- `middleware/auth.ts` - JWT validation

## Patterns
- One route file per resource — keeps routing predictable
- Validation schemas co-located with routes — easier to maintain

## Gotchas
- Rate limiting applies per-user, not per-IP
```
</example>

</instructions>

---

## References

| File | Purpose |
|------|---------|
| `references/research-principles.md` | Anthropic and academic research findings on reasoning vs rules |
| `references/rule-quality-standards.md` | Hybrid format, transformation examples, positive reframing, preservation rules |
| `references/quality-criteria.md` | 100-point scoring rubric and rule quality dimensions |
| `references/templates.md` | CLAUDE.md templates for root, subfolder, monorepo, and rule files |
| `references/examples.md` | Before/after refactoring transformations |
| `references/anti-patterns.md` | Common mistakes to avoid when writing CLAUDE.md files |
| `references/user-tips.md` | Shortcuts and features to share with users |
| `references/execution-checklists.md` | Mode-specific progress checklists (Audit, Review, Improve, Refactor, Generate) |
| `references/generation-workflow.md` | Detailed Generate mode scoring algorithm and extraction heuristics |
| `references/subfolder-examples.md` | Real-world subfolder CLAUDE.md examples |
| `references/update-guidelines.md` | What to add vs what to skip when updating CLAUDE.md files |
| `references/changelog.md` | Version history and update protocol |
