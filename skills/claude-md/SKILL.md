---
name: claude-md
version: 1.0.0
description: Manages CLAUDE.md files — audits, reviews, improves, refactors, and generates subdirectory context. Discovers all CLAUDE.md files, evaluates quality against research-backed criteria, generates improvement reports, applies targeted updates, restructures using progressive disclosure, and creates contextual CLAUDE.md files for directories that benefit from instant context. Use for "audit CLAUDE.md", "review my rules", "improve instructions", "organize Claude config", "generate subdirectory context", or "CLAUDE.md maintenance".
tools: Read, Glob, Grep, Bash, Edit
license: MIT
context: fork
---

<!-- v1.0.0 | 2026-01-30 -->

# Claude MD

**Complete CLAUDE.md management:** Audit, Review, Improve, and Refactor. Core insight: rules with reasoning outperform bare rules—models generalize from "why" explanations.

---

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

#### Phase G1: Directory Discovery

**If Audit was run first:** Reuse Phase 1 discovery results — no need to rescan.

**Otherwise:** Scan project structure to identify candidate directories:

```bash
find . -type d -not -path '*/\.*' -not -path '*/node_modules/*' -not -path '*/dist/*' -not -path '*/__pycache__/*' -not -path '*/build/*' -not -path '*/coverage/*' | head -100
```

**Skip directories:** `.git`, `node_modules`, `dist`, `build`, `coverage`, `__pycache__`, `.next`, `.nuxt`, `vendor`

#### Phase G2: Directory Scoring

For each directory, calculate a "needs context" score:

| Signal | Score | Detection |
|--------|-------|-----------|
| File count >15 | +3 | `ls -1 | wc -l` |
| Has index/entry file | +2 | `index.ts`, `main.py`, `mod.rs` exists |
| Non-obvious naming | +2 | Abbreviations, domain jargon, single letters |
| Deep nesting (>3 levels) | +1 | Path depth from root |
| Has existing config | +1 | `tsconfig.json`, `package.json`, `.env.example` |
| Is monorepo package | +3 | Under `packages/`, `apps/`, `services/` |
| Has README | +1 | Existing documentation to extract from |
| Already has CLAUDE.md | -10 | Skip if exists |
| Standard framework dir | -5 | `node_modules`, `dist`, `.git`, `__pycache__` |
| Shallow with few files | -2 | <5 files, no nesting — not complex enough |

**Threshold:**
- Score >= 6: High priority — generate with full content
- Score 4-5: Medium priority — generate minimal file
- Score < 4: Skip — directory is self-explanatory

#### Phase G3: Content Extraction

For each candidate directory, extract:

1. **Purpose**: From README, package.json description, or top-level comments
2. **Key files**: Entry points, configs, main exports
3. **Patterns**: Common conventions visible in file structure
4. **Dependencies**: Internal imports to other project directories
5. **Gotchas**: Non-obvious from naming alone

#### Phase G4: Preview Generation

Generate preview of proposed CLAUDE.md files. Present to user:

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

---

### 2. packages/shared/CLAUDE.md (Score: 6)
**Reason:** Monorepo package, 18 files
...
```

#### Phase G5: User Approval

**CRITICAL:** Never create files without user confirmation.

Present options:
1. Approve all proposed files
2. Select specific files to create
3. Request modifications before creation
4. Cancel generation

#### Phase G6: File Creation

After approval, create files using Write tool. Verify each file:
- [ ] Starts with `@../CLAUDE.md` to inherit parent context
- [ ] Under 500 tokens (target 150-300)
- [ ] Follows generated template from `references/templates.md`
- [ ] No duplicate info from root CLAUDE.md
- [ ] Specific to directory, not generic advice

See [references/generation-workflow.md](references/generation-workflow.md) for detailed scoring algorithm and extraction heuristics.

</instructions>

---

## Research-Backed Principles

See [references/research-principles.md](references/research-principles.md) for detailed research findings on:
- Anthropic's preference for reasoning over rules
- Academic evidence that hybrid format (directive + reasoning) is optimal
- The optimal table format with Rule | Bad | Good | Why columns

---

## Rule Quality Standards

### What Makes a High-Quality Rule

| Dimension | Bad | Good |
|-----------|-----|------|
| **Clarity** | "Be careful with auth" | "Auth errors fail immediately—retrying won't fix and wastes quota" |
| **Reasoning** | "Never use any" | "Use `unknown` + narrowing—preserves type safety through the codebase" |
| **Positive framing** | "Don't hardcode URLs" | "Read URLs from config—avoids hitting wrong environment" |
| **Specificity** | "Write good tests" | "Test behavior, not implementation—tests should survive refactoring" |
| **Examples** | (abstract) | Include Bad/Good columns in tables |

### The Hybrid Format

Anthropic research shows this format is most effective:

```
Directive + Brief Reasoning (1-2 sentences)
```

**Patterns that work:**

| Pattern | Example | Best For |
|---------|---------|----------|
| **Table with Why** | `\| Rule \| Why \|` | Hard rules, reference docs |
| **Inline dash** | "Prefer X — it provides Y benefit" | Principles, guidelines |
| **Because clause** | "Do X because Y" | Prose instructions |
| **Bad/Good/Why table** | Full 4-column table | Complex patterns with anti-patterns |

### Transformation Examples

| Before (Rule-only) | After (Hybrid) |
|--------------------|----------------|
| "Never commit secrets" | "Never commit secrets — in git history forever; rotation expensive" |
| "Use TypeScript" | "Use TypeScript — static types catch errors at compile time" |
| "Don't use any" | "Use `unknown` + narrowing — preserves type safety" |
| "Write tests" | "Test behavior, not implementation — tests should survive refactoring" |
| "Handle errors" | "Catch at boundaries (API routes, handlers) — bubble up otherwise" |

### Positive Reframing

| Negative (Less Effective) | Positive (More Effective) |
|---------------------------|---------------------------|
| "Don't hardcode URLs" | "Read URLs from config — avoids wrong environment" |
| "Never use console.log" | "Use structured logger — enables filtering and persistence" |
| "Avoid magic numbers" | "Extract constants with descriptive names — self-documenting" |
| "Don't skip tests" | "Run quality gate after changes — format → lint → typecheck → test" |

---

## What Makes a Great CLAUDE.md

**Key principles:**
- Concise and human-readable
- Actionable commands that can be copy-pasted
- Project-specific patterns, not generic advice
- Non-obvious gotchas and warnings
- Rules include reasoning ("why")

**Recommended sections** (use only what's relevant):
- Commands (build, test, dev, lint)
- Architecture (directory structure)
- Key Files (entry points, config)
- Code Style (project conventions)
- Environment (required vars, setup)
- Testing (commands, patterns)
- Gotchas (quirks, common mistakes)
- Workflow (when to do what)
- Hard Rules (with reasoning)
- Core Principles (with reasoning)

---

## Common Issues to Flag

1. **Stale commands**: Build commands that no longer work
2. **Missing dependencies**: Required tools not mentioned
3. **Outdated architecture**: File structure that's changed
4. **Missing environment setup**: Required env vars or config
5. **Broken test commands**: Test scripts that have changed
6. **Undocumented gotchas**: Non-obvious patterns not captured
7. **Rules without reasoning**: "Do X" without "because Y"
8. **Vague instructions**: "Be careful" without specifics
9. **Negative-only framing**: "Don't X" without positive alternative
10. **Conflicting rules**: Two rules that contradict each other

---

## IMPORTANT — What to NEVER Delete

| Keep | Why (Research-backed) |
|------|----------------------|
| Safety reminders ("never commit secrets") | Repetition improves compliance (industry research, as of v1.0) |
| Rules with reasoning ("X — because Y") | Context improves generalization (Anthropic documentation) |
| Priority hierarchies | Models struggle with implicit priority (LLM prompting research) |
| Critical rules even if "obvious" | Training patterns need override reinforcement |

---

## Execution Checklists

See [references/execution-checklists.md](references/execution-checklists.md) for mode-specific execution checklists (Audit, Review, Improve, Refactor).

---

## Anti-Patterns

See [references/anti-patterns.md](references/anti-patterns.md) for common mistakes to avoid.

---

## User Tips to Share

See [references/user-tips.md](references/user-tips.md) for shortcuts and features to share with users.

---

## References

See `references/` for detailed documentation:
- `research-principles.md` — Anthropic and academic research findings
- `quality-criteria.md` — Detailed quality assessment criteria
- `templates.md` — CLAUDE.md templates for various project types
- `examples.md` — Before/after transformation examples
- `anti-patterns.md` — Common mistakes to avoid
- `user-tips.md` — Shortcuts and features to share
- `execution-checklists.md` — Mode-specific execution checklists
- `generation-workflow.md` — Detailed Generate mode algorithm and heuristics
- `subfolder-examples.md` — Real-world subfolder CLAUDE.md examples
- `changelog.md` — Version history and update protocol
