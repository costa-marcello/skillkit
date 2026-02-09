# Production Audit Report Template

Use this structure for the final `PRODUCTION-AUDIT.md` output.

```markdown
# Production Audit Report

**Project**: [project name]
**Date**: [audit date]
**Audited by**: Claude Code (production-audit skill)

---

## Executive Summary

**Readiness Score**: [X]% -- [launch-ready | not launch-ready | conditionally ready]

| Severity | Count |
| --- | --- |
| Blockers | [N] |
| Warnings | [N] |
| Improvements | [N] |

| Dimension | Blockers | Warnings | Improvements |
| --- | --- | --- | --- |
| API Mapping | [N] | [N] | [N] |
| Frontend-Backend Sync | [N] | [N] | [N] |
| Security | [N] | [N] | [N] |
| Scalability | [N] | [N] | [N] |
| Infrastructure | [N] | [N] | [N] |
| Dead Code & Architecture | [N] | [N] | [N] |

### Top Blockers

1. [One-line summary with file path]
2. [One-line summary with file path]
3. [One-line summary with file path]
4. [One-line summary with file path]
5. [One-line summary with file path]

---

## Findings by Severity

### Blockers (must fix before launch)

#### [B-001] [Short title]

**Dimension**: [dimension name]
**File**: `path/to/file.ts:42`
**Evidence**: [What was found]
**Impact**: [What breaks if not fixed]

[Repeat for each blocker]

### Warnings (fix within first sprint)

#### [W-001] [Short title]

**Dimension**: [dimension name]
**File**: `path/to/file.ts:42`
**Evidence**: [What was found]
**Impact**: [What degrades if not fixed]

[Repeat for each warning]

### Improvements (fix when convenient)

#### [I-001] [Short title]

**Dimension**: [dimension name]
**File**: `path/to/file.ts:42`
**Evidence**: [What was found]
**Impact**: [What improves if fixed]

[Repeat for each improvement]

---

## Findings by Dimension

### API Mapping

[List all findings for this dimension, linking to the finding IDs above]

### Frontend-Backend Sync

[List all findings]

### Security

[List all findings]

### Scalability

[List all findings]

### Infrastructure

[List all findings]

### Dead Code & Architecture

[List all findings]

---

## Recommended Fix Order

Address blockers in this order (grouped by dependency):

### Phase 1: Security Foundation
[Blockers that other fixes depend on -- auth middleware, secrets rotation]

### Phase 2: Core Functionality
[API completeness, broken frontend-backend wiring]

### Phase 3: Reliability
[Error handling, health checks, monitoring]

### Phase 4: Performance
[N+1 fixes, indexes, caching, connection pooling]

### Phase 5: Cleanup
[Dead code, stale config, commented-out code]

---

## Appendix

### API Endpoint Map

[Full table from API audit agent]

### Frontend-Backend Sync Map

[Full table from API audit agent. Omit this section if the project has no frontend.]

### Files Audited

[Count of files examined per directory]
```

## Readiness Score Calculation

Calculate the readiness score as:

```
score = 100 - (blockers * 8) - (warnings * 2) - (improvements * 0.5)
```

Clamp to 0-100 range.

| Score | Label |
| --- | --- |
| 90-100 | Launch-ready |
| 70-89 | Conditionally ready (warnings acceptable for soft launch) |
| 50-69 | Not launch-ready (blockers must be resolved) |
| 0-49 | Significant work remaining |

## Finding ID Convention

- `B-001` through `B-999` for blockers
- `W-001` through `W-999` for warnings
- `I-001` through `I-999` for improvements

Number sequentially within each severity. This allows the team to reference findings in tickets and PRs.
