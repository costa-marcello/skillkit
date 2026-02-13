---
name: review-code
description: "Reviews current git changes with a senior engineer lens. Detects SOLID violations, YAGNI/DRY/KISS breaches, security risks, performance issues, and proposes actionable improvements. Use when reviewing pull requests, checking code quality before merging, or auditing changes for security vulnerabilities."
license: MIT
---

# Review Code

Review current git changes with focus on SOLID, engineering best practices (YAGNI, DRY, KISS), architecture, removal candidates, and security risks. Default to review-only output unless the user asks to implement changes.

## Severity Levels

| Level | Name | Description | Action |
|-------|------|-------------|--------|
| **P0** | Critical | Security vulnerability, data loss risk, correctness bug | Must block merge |
| **P1** | High | Logic error, significant SOLID violation, performance regression | Should fix before merge |
| **P2** | Medium | Code smell, maintainability concern, minor SOLID violation | Fix in this PR or create follow-up |
| **P3** | Low | Style, naming, minor suggestion | Optional improvement |

**Verdict mapping:** Any P0 or P1 finding = REQUEST_CHANGES. P2 findings only = COMMENT. No findings = APPROVE.

<instructions>

## Workflow

### 1) Preflight context

- Run `git status -sb`, `git diff --stat`, and `git diff` to scope changes.
- Use `Grep` to find related modules, usages, and contracts when the diff touches shared interfaces or exports.
- Identify entry points, ownership boundaries, and critical paths (auth, payments, data writes, network).

**Review approach** — review the code, not the diff. Follow control flow via goto definition rather than reading in textual diff order. Understand the change in context of the surrounding system, not as an isolated patch.

**Edge cases:**
- **No changes**: If `git diff` is empty, ask the user whether to review staged changes (`git diff --cached`) or a specific commit range.
- **Large diff (>400 lines)**: Summarise by file first, then review in batches by module/feature area. Research shows review effectiveness peaks at 200-400 lines and drops sharply beyond that threshold.
- **Mixed concerns**: Group findings by logical feature, not by file order.

### 2) SOLID + architecture smells

- Load `references/solid-checklist.md` for specific prompts.
- Check for:
  - **SRP**: Overloaded modules with unrelated responsibilities.
  - **OCP**: Frequent edits to add behaviour instead of extension points.
  - **LSP**: Subclasses that break expectations or require type checks.
  - **ISP**: Wide interfaces with unused methods.
  - **DIP**: High-level logic tied to low-level implementations.
- When proposing a refactor, explain *why* it improves cohesion/coupling and outline a minimal, safe split.
- If the refactor is non-trivial, propose an incremental plan instead of a large rewrite.

### 3) Engineering best practices

- Load `references/best-practices-checklist.md` for specific prompts.
- Check for:
  - **YAGNI**: speculative features, unused abstractions, premature generalisation, configuration for hypothetical future needs.
  - **DRY**: duplicated logic across files (but tolerate small local repetition over premature abstraction).
  - **KISS**: over-engineered solutions, unnecessary indirection layers, complex patterns where a simple approach works.
  - **Law of Demeter**: long method chains reaching through multiple objects (`a.b.c.d()`).
  - **Composition over inheritance**: deep inheritance trees, base classes used purely for code sharing.
  - **Premature optimisation**: complex caching, pooling, or micro-optimisation without profiling evidence.
  - **Fail fast**: silent error swallowing, fallback values that mask bugs, late detection of invalid state.
  - **Principle of Least Surprise**: methods with misleading names, unexpected side effects, non-obvious return values.
- **AI-generated code patterns**: higher redundancy (duplicated logic, lower code reuse), missing refactoring after initial pass, code that passes tests but lacks structural quality. Apply extra DRY and KISS scrutiny to code produced by AI agents.
- Grade YAGNI and KISS violations at P2 minimum. Speculative code that adds maintenance burden without current value is a real cost.

### 4) Removal candidates + iteration plan

- Load `references/removal-plan.md` for template.
- Identify removal candidates:
  - Run `Grep` for functions, classes, and exports added or touched in the diff. Check each has at least one caller outside its own file.
  - Search for feature flags in the diff. If a flag is permanently off or has no toggle path, the gated code is a removal candidate.
  - Check for commented-out code blocks and TODO markers older than the current PR.
- Distinguish **safe delete now** (zero references, no external consumers) vs **defer with plan** (active callers need migration).
- Provide a follow-up plan with concrete steps and checkpoints (tests/metrics).

### 5) Security and reliability scan

- Load `references/security-checklist.md` for coverage.
- Check for:
  - XSS, injection (SQL/NoSQL/command), SSRF, path traversal
  - AuthZ/AuthN gaps, missing tenancy checks
  - Secret leakage or API keys in logs/env/files
  - Rate limits, unbounded loops, CPU/memory hotspots
  - Unsafe deserialisation, weak crypto, insecure defaults
  - **Race conditions**: concurrent access, check-then-act, TOCTOU, missing locks
- Apply shift-left security: never assume incoming data is clean, validate at every system boundary.
- Report both **exploitability** and **impact** for each finding.

### 6) Code quality scan

- Load `references/code-quality-checklist.md` for coverage.
- Check for:
  - **Error handling**: swallowed exceptions, overly broad catch, missing error handling, async errors
  - **Performance**: N+1 queries, CPU-intensive ops in hot paths, missing cache, unbounded memory
  - **Boundary conditions**: null/undefined handling, empty collections, numeric boundaries, off-by-one
- Flag issues that may cause silent failures or production incidents.

### 7) Output format

Structure the review as follows:

```markdown
## Code Review Summary

**Files reviewed**: X files, Y lines changed
**Overall assessment**: [APPROVE / REQUEST_CHANGES / COMMENT]

---

## Findings

### P0 - Critical
(none or list)

### P1 - High
- **[file:line]** Brief title
  - Description of issue
  - Suggested fix

### P2 - Medium
...

### P3 - Low
...

---

## Removal/Iteration Plan
(if applicable)

## Additional Suggestions
(optional improvements, not blocking)
```

**Inline comments**: When providing file-specific findings outside the summary table, use this format:

> **[P1] path/to/file.ts:42** -- Description of the issue and suggested fix.

**Clean review**: If no issues found, state:
- What was checked
- Any areas not covered (e.g., "Did not verify database migrations")
- Residual risks or recommended follow-up tests

### 8) Next steps confirmation

After presenting findings, ask user how to proceed:

```markdown
---

## Next Steps

I found X issues (P0: _, P1: _, P2: _, P3: _).

**How would you like to proceed?**

1. **Fix all** - I'll implement all suggested fixes
2. **Fix P0/P1 only** - Address critical and high priority issues
3. **Fix specific items** - Tell me which issues to fix
4. **No changes** - Review complete, no implementation needed
```

Do NOT implement changes until the user confirms. This is a review-first workflow.

</instructions>

<example>
**Small diff, clean review (no issues)**

## Code Review Summary

**Files reviewed**: 2 files, 18 lines changed
**Overall assessment**: APPROVE

---

## Findings

### P0 - Critical
(none)

### P1 - High
(none)

### P2 - Medium
(none)

### P3 - Low
(none)

---

## Notes
- Checked: error handling, null safety, SOLID adherence
- Not covered: database migration verification (no schema changes in diff)
- Residual risk: none identified
</example>

<example>
**Medium diff with mixed severity findings**

## Code Review Summary

**Files reviewed**: 5 files, 142 lines changed
**Overall assessment**: REQUEST_CHANGES

---

## Findings

### P0 - Critical
(none)

### P1 - High
- **src/auth/session.ts:34** Missing tenant check on session lookup
  - `getSession(id)` retrieves any session regardless of tenant
  - Add `WHERE tenant_id = ?` to the query or validate tenant after fetch

### P2 - Medium
- **src/api/users.ts:78** SRP violation: route handler contains business logic and database queries
  - Extract validation to a service layer, keep the handler thin
- **src/utils/cache.ts:12** Cache has no TTL, stale data served indefinitely
  - Add a `maxAge` parameter, default to 300 seconds

### P3 - Low
- **src/api/users.ts:92** Magic number `50` used for pagination limit
  - Extract to a named constant: `const DEFAULT_PAGE_SIZE = 50`
</example>

<example>
**Large diff (>400 lines), batched review**

## Code Review Summary

**Files reviewed**: 12 files, 847 lines changed
**Overall assessment**: REQUEST_CHANGES

**Batch summary** (reviewed by module):
| Module | Files | Lines | Findings |
|--------|-------|-------|----------|
| auth | 3 | 280 | 1x P1, 2x P2 |
| payments | 4 | 340 | 1x P0, 1x P3 |
| shared/utils | 5 | 227 | 2x P2 |

---

## Findings

### P0 - Critical
- **src/payments/charge.ts:56** Race condition: balance check then deduction without transaction
  - Two concurrent requests can both pass the balance check and overdraw
  - Wrap in `SELECT FOR UPDATE` or use atomic `UPDATE ... WHERE balance >= amount`

### P1 - High
- **src/auth/middleware.ts:23** JWT `aud` claim not validated
  - Tokens issued for other services are accepted
  - Add `audience` check to `jwt.verify()` options
</example>

<example>
**Review reasoning: tracing a race condition through control flow**

The diff adds a `withdrawFunds` handler in `src/api/accounts.ts`. Rather than reading the diff top-to-bottom, follow the control flow:

1. **Entry point**: `POST /accounts/:id/withdraw` calls `withdrawFunds(req, res)`.
2. **Balance check (line 34)**: `const account = await Account.findById(id)` fetches balance.
3. **Deduction (line 38)**: `account.balance -= amount; await account.save()`.
4. **Gap**: Between lines 34 and 38, no lock or transaction. Two concurrent requests can both read the same balance, both pass the check, and both deduct -- overdrawing the account.

This is a check-then-act (TOCTOU) race condition. Graded P0 because it affects financial data integrity. The fix is to wrap the read and write in a database transaction with `SELECT ... FOR UPDATE`, or use an atomic update: `UPDATE accounts SET balance = balance - ? WHERE id = ? AND balance >= ?`.

This example shows the review approach: trace data flow from entry point through state mutation, check for atomicity gaps, then grade by impact.
</example>

## Resources

### references/

| File | Purpose |
|------|---------|
| `solid-checklist.md` | SOLID smell prompts and refactor heuristics |
| `security-checklist.md` | Web/app security and runtime risk checklist |
| `code-quality-checklist.md` | Error handling, performance, boundary conditions |
| `best-practices-checklist.md` | YAGNI, DRY, KISS, Law of Demeter, composition, fail fast |
| `removal-plan.md` | Template for deletion candidates and follow-up plan |
