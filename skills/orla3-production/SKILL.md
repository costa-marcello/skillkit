---
name: orla3-production
description: "Audits a codebase for production readiness across six dimensions: API completeness, frontend-backend sync, security, scalability, infrastructure, and dead code/architecture. Use when the user requests a launch assessment, production readiness check, pre-deployment audit, or multi-agent patchwork cleanup."
context: fork
agent: general-purpose
allowed-tools: "Read, Grep, Glob, Bash(which *), Bash(npx *), Bash(pnpm *), Bash(npm *), Bash(semgrep *), Bash(git log *), Bash(git diff *), Bash(wc *), Bash(ls *), LSP, ToolSearch, mcp__plugin_semgrep-plugin_semgrep__*"
---

# Production Audit Skill

## When to Use

- **Pre-launch assessment**: Core features work, needs gap analysis before production
- **Multi-agent cleanup**: Project built across multiple AI sessions with accumulated patchwork
- **Security review**: Auth, validation, injection, CSRF, CSP audit before real users
- **Scalability check**: Preparing for load -- find N+1 queries, missing indexes, caching gaps
- **Dead code sweep**: Orphaned files, unused imports, abandoned mocks, duplicate utilities

<instructions>

## Prerequisites

Check for these tools before starting. Skip gracefully if missing.

| Tool | Purpose | Fallback |
|------|---------|----------|
| Semgrep MCP | SAST, custom rules, supply chain, AST analysis | CLI or manual Grep |
| `semgrep` CLI | SAST when MCP unavailable | Manual Grep patterns |
| `pnpm` / `npm` | Typecheck, build, lint, dependency audit | Skip with warning |
| `knip` | Dead code detection via `npx knip` | Manual import tracing |

## Audit Workflow

This audit produces a **read-only assessment report** with evidence (file paths, line numbers, severity). It does not auto-fix anything.

### Step 1: Discover Project Structure

Map the project layout before spawning audit agents:

1. Identify directory structure (frontend, backend/API, shared packages, monorepo layout)
2. Find database layer (ORM schema, migrations, raw SQL, config)
3. Locate auth configuration (middleware, sessions, OAuth, API key validation)
4. Find payment/billing integration (webhook handlers, checkout flows)
5. Identify environment and deployment config (.env.example, Docker, CI/CD, cloud)
6. Detect primary framework and language (Next.js, Django, Rails, Express, Go, etc.)

Store this map as a numbered list. Pass it verbatim to every audit agent.

**Checkpoint**: Verify the map covers all major directories. Mark missing categories as "N/A" rather than skipping silently.

### Step 2: Run Automated Scans

Run all scans in parallel. If a tool is missing, log which tool was skipped and continue.

**2a. Security scan (Semgrep MCP preferred, CLI fallback):**

Use `ToolSearch: "+semgrep scan"` to check for Semgrep MCP tools.

| Priority | Method | Action |
|----------|--------|--------|
| 1st | Semgrep MCP | `semgrep_scan` on security-sensitive files. `semgrep_findings` for historical issues. `semgrep_scan_supply_chain` for dependency vulns. |
| 2nd | Semgrep CLI | `semgrep scan --config p/nextjs --config p/typescript --config p/nodejs --json --quiet .` |
| 3rd | Manual | Agent 2 performs full Grep analysis using `references/security-audit.md` patterns. |

**2b. Dead code scan:**
```bash
npx knip --reporter json 2>&1 || echo "SKIP: knip failed"
```

**2c. Dependency vulnerability scan:**
```bash
pnpm audit --json 2>&1 || npm audit --json 2>&1 || echo "SKIP: audit failed"
```

**2d. Type safety and build checks:**
```bash
pnpm typecheck 2>&1 | head -200 || true
pnpm build 2>&1 | tail -50 || true
```

**Checkpoint**: List which scans succeeded and which were skipped. Pass results to relevant agents in Step 3.

### Step 3: Spawn Audit Team

Spawn 4 agents in parallel. Each receives the project map from Step 1 and relevant scan data from Step 2.

| Agent | Dimensions | Reference | Scan Data |
|-------|-----------|-----------|-----------|
| Agent 1: API & Sync | API endpoint mapping + frontend-backend sync | `references/api-audit.md` | typecheck, build results |
| Agent 2: Security | Auth, validation, CORS, secrets, injection, CSRF, CSP, cookies, hashing, dependencies | `references/security-audit.md` | Semgrep results, pnpm audit, supply chain |
| Agent 3: Scalability & Infra | Queries, indexes, caching, rate limiting, CI/CD, monitoring, health checks, env config | `references/scalability-audit.md` + `references/infrastructure-audit.md` | build results (bundle sizes) |
| Agent 4: Dead Code & Architecture | Unused files, orphans, duplicates, patchwork, stale config, circular deps, complexity | `references/dead-code-audit.md` + `references/architecture-audit.md` | Knip results, typecheck results |

**No frontend?** Merge Agent 1 into Agent 3. Spawn 3 agents.

Agent spawn template:

```
Goal:    Audit [dimension(s)] for production readiness.
Context: [Project structure map from Step 1, including framework/language]
Scan data: [Relevant scan output from Step 2, or "no scan data -- tool was skipped"]
Scope:   Read `references/[dimension]-audit.md` for the full checklist.
         Use scan data as primary source when available. Supplement with Grep/Read.
         When scan data is missing, perform full manual analysis.
         Adapt checks to the project's framework.
         Produce findings only -- do not fix anything.
Output:  One markdown section per sub-dimension. Every finding uses the format from Step 4.
```

**Agent 2 Semgrep MCP enhancement** (when MCP tools found in Step 2a):

| Tool | Use For |
|------|---------|
| `semgrep_scan` | Targeted scans on files flagged during manual review (pass absolute paths) |
| `semgrep_scan_with_custom_rule` | Project-specific YAML rules (unvalidated input to SQL, missing auth on admin routes, hardcoded secrets). Use `semgrep_rule_schema` for correct structure. |
| `get_abstract_syntax_tree` | Trace data flow through nested function calls in complex files |
| `semgrep_findings` | Historical findings: `issue_type: "sast"` for code, `issue_type: "sca"` for supply chain |

### Step 4: Finding Format

Every finding follows this structure:

```markdown
### [BLOCKER|WARNING|IMPROVEMENT] Short title

**Dimension**: API Mapping | Frontend-Backend Sync | Security | Scalability | Infrastructure | Dead Code & Architecture
**File**: `path/to/file.ts:42`
**Evidence**: What was found and why it matters
**Impact**: What breaks or degrades if not addressed
```

Severity definitions:
- **BLOCKER**: Fix before launch. Security vulnerabilities, broken core flows, data loss risks, missing auth on sensitive routes.
- **WARNING**: Fix within first sprint. Performance under load, missing monitoring, incomplete error handling, partial implementations.
- **IMPROVEMENT**: Fix when convenient. Code quality, dead code, test coverage gaps, documentation.

### Step 5: Synthesise Report

After all agents complete:

1. Collect all findings from agents
2. Merge automated scan findings (Semgrep, Knip, pnpm audit) with agent findings
3. Deduplicate -- different agents or tools may flag the same file
4. Sort by severity: blockers first, then warnings, then improvements
5. Add executive summary with counts per severity and dimension
6. Add recommended fix order (blockers grouped by dependency -- fix auth middleware before individual route fixes)
7. Calculate readiness score: `score = 100 - (blockers * 8) - (warnings * 2) - (improvements * 0.5)`, clamped to 0-100

| Score | Label |
|-------|-------|
| 90-100 | Launch-ready |
| 70-89 | Conditionally ready (soft launch acceptable) |
| 50-69 | Not launch-ready (blockers must be resolved) |
| 0-49 | Significant work remaining |

Follow the full template in `references/report-template.md` for the output structure.

### Step 6: Customise Scope

Narrow the audit when the user specifies dimensions:
- "audit security only" -- spawn only the security agent
- "audit everything except dead code" -- skip Agent 4
- "focus on API completeness" -- spawn only Agent 1

When the user specifies a target user count (e.g., "10k users"), pass that to the scalability agent as a sizing constraint.

### Task Checklist

```
- [ ] 1. Map project structure (directories, framework, database, auth, payments, config)
- [ ] 2. Checkpoint: verify project map is complete. Note any N/A categories.
- [ ] 3. Run automated scans in parallel (Semgrep, Knip, pnpm/npm audit, typecheck, build)
- [ ] 4. Checkpoint: log which scans succeeded and which were skipped.
- [ ] 5. Read reference files for each audit dimension
- [ ] 6. Spawn audit agents in parallel with project map + scan data + checklists
- [ ] 7. Collect findings from all agents
- [ ] 8. Merge automated scan findings with agent findings
- [ ] 9. Deduplicate findings
- [ ] 10. Checkpoint: verify every finding has severity, dimension, file path, and evidence
- [ ] 11. Write executive summary with counts, readiness score, and recommended fix order
- [ ] 12. Save report to `PRODUCTION-AUDIT.md` in project root
```

</instructions>

## Report Output

Save to `PRODUCTION-AUDIT.md` in the project root. Follow `references/report-template.md` for the full structure (executive summary, findings by severity, findings by dimension, recommended fix order, readiness score).

<examples>

<example>
**User**: "Audit this project for production readiness"

**Claude**:
1. Maps project structure: Next.js 15 monorepo, `app/api/` for routes, Prisma in `prisma/`, Firebase config in `lib/auth/`
2. Runs automated scans in parallel: Semgrep (security), Knip (dead code), pnpm audit (dependencies), typecheck, build
3. Reads all four reference files for audit checklists
4. Spawns 4 agents in parallel, each with project map + relevant scan data + dimension checklist
5. Collects and merges 47 findings: 8 blockers, 15 warnings, 24 improvements
6. Writes `PRODUCTION-AUDIT.md` with executive summary and prioritised fix order

**Report excerpt**:
```markdown
## Executive Summary
- Blockers: 8 (3 security, 2 API, 2 infra, 1 scalability)
- Warnings: 15
- Improvements: 24
- Readiness: 62% -- not launch-ready until blockers resolved

### Top 5 Blockers
1. `/app/api/payments/webhook/route.ts:1` -- No Stripe signature verification
2. `/middleware.ts:15` -- Auth middleware skips /api/admin/* routes
3. `/app/api/users/[id]/route.ts:23` -- No ownership check, any user can edit any profile
4. No health check endpoint for load balancer
5. DATABASE_URL exposed in committed .env file
```
</example>

<example>
**User**: "Just check security and dead code, skip the rest"

**Claude**:
1. Maps project structure
2. Runs Semgrep + Knip scans only
3. Spawns 2 agents: Security + Dead Code & Architecture
4. Produces a focused report covering only those dimensions
</example>

<example>
**User**: "Run a production audit but focus on scalability -- we expect 10k concurrent users"

**Claude**:
1. Maps project structure
2. Runs all automated scans
3. Spawns all 4 agents but gives Agent 3 extra context: "Target: 10k concurrent users"
4. Agent 3 checks connection pool sizing, caching strategy, WebSocket/SSE scaling limits against 10k target
5. Report highlights scalability blockers prominently in executive summary
</example>

<example>
**User**: "Audit this Django REST API -- it's a backend-only service, no frontend"

**Claude**:
1. Maps project structure: Django 5 with DRF, PostgreSQL, Celery workers, Redis cache, deployed on AWS ECS
2. Skips frontend-backend sync. Merges API audit into scalability agent.
3. Spawns 3 agents: Security, Scalability & Infra (including API completeness), Dead Code & Architecture
4. Security agent adapts checks to Django middleware, DRF permissions, and Celery task auth
5. Produces report with Django-specific findings (e.g., missing `DEFAULT_PERMISSION_CLASSES`, unprotected Celery tasks)
</example>

</examples>

## Tips

1. **Run at 60% completion.** Catches architectural issues early. The audit is read-only.
2. **Commit the report.** `PRODUCTION-AUDIT.md` is designed for team review. Finding IDs (B-001, W-001, I-001) work as ticket references.
3. **Semgrep MCP gives the best results.** The Semgrep plugin enables targeted file scanning, custom rule authoring, supply chain analysis, and AST inspection without CLI install. If MCP is unavailable, `pip install semgrep` provides CLI fallback. Without either, manual Grep pattern matching is used.
4. **Re-audit after fixes.** Verify blockers are resolved and no new issues were introduced.
