---
name: production-audit
description: "Audits a codebase for production readiness across six dimensions: API completeness, frontend-backend sync, security, scalability, infrastructure, and dead code/architecture. Use when asked for a launch assessment, production readiness check, pre-deployment audit, or multi-agent patchwork cleanup."
license: MIT
argument-hint: "[scope]"
allowed-tools: "Read, Grep, Glob, Bash, Write, Edit, LSP, Task, SendMessage, TeamCreate, TaskCreate, TaskUpdate, TaskList, TaskGet, ToolSearch"
---

# Production Audit Skill

<instructions>

## Audit Workflow

This audit produces a **read-only assessment report** with evidence (file paths, line numbers, severity). It does not auto-fix anything.

If `$ARGUMENTS` specifies a scope (e.g., "security only", "skip dead code", "focus on scalability"), narrow the audit to those dimensions only. Otherwise, audit all six dimensions.

### Step 1: Discover Project Structure

Map the project layout before spawning audit agents:

1. Identify the directory structure (frontend, backend/API, shared packages, monorepo layout)
2. Find the database layer (ORM schema, migrations, raw SQL, database config)
3. Locate auth configuration (middleware, session management, OAuth providers, API key validation)
4. Find payment or billing integration files (webhook handlers, checkout flows)
5. Identify environment and deployment config (.env.example, Docker, CI/CD, cloud configs)
6. Detect the primary framework and language (Next.js, Django, Rails, Express, Go, etc.)

Store this map as a numbered list of directories and key files. Pass it verbatim to every audit agent.

**CHECKPOINT**: Verify the project map covers all major directories. If the project lacks a category (e.g., no payment integration), note it as "not applicable" rather than skipping it silently.

### Step 2: Determine Scope and Spawn Audit Team

**Scope narrowing**: Users can narrow the audit via `$ARGUMENTS` or natural language:
- "audit security only" -- spawn only the security agent
- "audit everything except dead code" -- skip Agent 4
- "focus on API completeness" -- spawn only Agent 1

When the user specifies a target user count (e.g., "10k users"), pass that to the scalability agent as a sizing constraint.

**Agent assignment**: Spawn up to 4 agents in parallel. Each agent handles one or two audit dimensions and writes findings to a structured section.

| Agent | Dimensions | Reference |
| --- | --- | --- |
| Agent 1: API & Sync | API endpoint mapping + frontend-backend sync | `references/api-audit.md` |
| Agent 2: Security | Auth coverage, validation, CORS, secrets, injection, CSRF, CSP, dependency vulnerabilities, cookie security, password hashing. If Semgrep MCP is available, run `semgrep_scan` alongside manual checks. | `references/security-audit.md` |
| Agent 3: Scalability & Infra | Query performance, indexes, caching, CI/CD, monitoring | `references/scalability-audit.md` + `references/infrastructure-audit.md` |
| Agent 4: Dead Code & Architecture | Unused files, orphaned components, duplicate utilities, patchwork, stale config, architectural quality, code complexity | `references/dead-code-audit.md` + `references/architecture-audit.md` |

If the project does not have a frontend (e.g., API-only service, CLI tool), merge Agent 1's scope into Agent 3 and spawn 3 agents instead.

Use this template for each agent spawn prompt:

```
Goal:    Audit [dimension(s)] for production readiness.
Context: [Paste project structure map from Step 1, including framework/language detected]
Scope:   Read `references/[dimension]-audit.md` for the full checklist.
         Adapt checks to the project's framework -- the reference uses web app examples but the patterns apply to any stack.
         Produce findings only -- do not fix anything.
Output:  One markdown section per sub-dimension using the finding format from Step 3.
```

### Step 3: Finding Format

Every finding must follow this structure:

```markdown
### [BLOCKER|WARNING|IMPROVEMENT] Short title

**Dimension**: API Mapping | Frontend-Backend Sync | Security | Scalability | Infrastructure | Dead Code & Architecture
**File**: `path/to/file.ts:42`
**Evidence**: What was found and why it matters
**Impact**: What breaks or degrades if this is not addressed
```

Severity definitions:
- **BLOCKER**: Must fix before launch. Security vulnerabilities, broken core flows, data loss risks, missing auth on sensitive routes.
- **WARNING**: Fix within first sprint post-launch. Performance issues under load, missing monitoring, incomplete error handling, partial implementations.
- **IMPROVEMENT**: Fix when convenient. Code quality, dead code removal, test coverage gaps, documentation.

### Step 4: Verify and Synthesise Report

After all agents complete, the lead verifies and assembles the final report:

1. Collect all findings from agents
2. **CHECKPOINT**: Verify every finding has all five required fields (severity in heading, dimension, file path with line number, evidence, impact). Reject malformed findings back to the agent for correction.
3. Deduplicate (different agents may flag the same file)
4. Sort by severity: blockers first, then warnings, then improvements
5. Add an executive summary with counts per severity and dimension
6. Add a recommended fix order (blockers grouped by dependency -- fix auth middleware before individual route fixes)

### Report Output

Save the report to `PRODUCTION-AUDIT.md` in the project root. Follow the full template in `references/report-template.md` (executive summary, findings by severity, findings by dimension, recommended fix order).

### Task Checklist

```
- [ ] 1. Map project structure (directories, framework, database, auth, payments, config)
- [ ] 2. CHECKPOINT: Verify project map is complete. Note any N/A categories.
- [ ] 3. Determine scope (full audit or narrowed via $ARGUMENTS)
- [ ] 4. Read reference files for each audit dimension in scope
- [ ] 5. Spawn audit agents in parallel with project map + checklists
- [ ] 6. Collect findings from all agents
- [ ] 7. CHECKPOINT: Verify every finding has severity, dimension, file path, evidence, and impact
- [ ] 8. Deduplicate findings (different agents may flag the same file)
- [ ] 9. Write executive summary with counts and recommended fix order
- [ ] 10. Save report to `PRODUCTION-AUDIT.md` in project root
```

</instructions>

<examples>

<example>
**User**: "Audit this project for production readiness"

**Claude**:
1. Reads project structure: Next.js 15 monorepo, `app/api/` for routes, Prisma in `prisma/`, Firebase config in `lib/auth/`
2. Reads all four reference files for audit checklists
3. Spawns 4 agents in parallel, each with the project map and their dimension checklist
4. Collects 47 findings: 8 blockers, 15 warnings, 24 improvements
5. Verifies all findings have severity, dimension, file path, evidence, and impact
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
**User**: "/production-audit security only"

**Claude**:
1. Parses `$ARGUMENTS` = "security only"
2. Maps project structure
3. Spawns only the security agent with `references/security-audit.md`
4. Produces a focused report covering only security findings
</example>

<example>
**User**: "Run a production audit but focus on scalability -- we expect 10k concurrent users"

**Claude**:
1. Maps project structure
2. Spawns all 4 agents but gives Agent 3 (Scalability & Infra) extra context about the 10k concurrency target
3. Agent 3 checks connection pool sizing against 10k users, evaluates caching strategy, checks for WebSocket/SSE scaling limits
4. Report highlights scalability blockers prominently in the executive summary
</example>

<example>
**User**: "Audit this Django REST API -- it's a backend-only service, no frontend"

**Claude**:
1. Maps project structure: Django 5 with DRF, PostgreSQL, Celery workers, Redis cache, deployed on AWS ECS
2. Skips frontend-backend sync (no frontend). Merges API audit into scalability agent.
3. Spawns 3 agents: Security, Scalability & Infra (including API completeness), Dead Code & Architecture
4. Security agent adapts checks to Django middleware, DRF permissions, and Celery task auth
5. Produces report with Django-specific findings (e.g., missing `DEFAULT_PERMISSION_CLASSES`, unprotected Celery tasks)
</example>

<example>
**User**: "Audit this project" (but the project is a Rust CLI tool with no web server, no database, no frontend)

**Claude**:
1. Maps project structure: Rust binary crate, `src/main.rs` + `src/lib.rs`, no web framework, no database, no frontend
2. Marks API Mapping, Frontend-Backend Sync, and Scalability as "not applicable"
3. Spawns 3 agents: Security (input validation, dependency audit, command injection), Infrastructure (CI/CD, release binaries, environment config), Dead Code & Architecture
4. Report is shorter but still follows the standard template, with N/A dimensions clearly marked
</example>

</examples>

<context>

## Tips

1. **Run early.** Catches architectural issues before they compound. The audit is read-only and works at any stage.
2. **Commit the report.** `PRODUCTION-AUDIT.md` is designed for team review. Finding IDs (B-001, W-001) work as ticket references.
3. **Re-audit after fixes.** Run the audit again after resolving blockers to verify they are fixed and no new issues were introduced.

</context>
