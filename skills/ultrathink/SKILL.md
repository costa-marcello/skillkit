---
name: ultrathink
description: Performs exhaustive multi-lens analysis through human, structural, inclusivity, and sustainability perspectives with domain-specific augmentation. Use when the user says "ULTRATHINK" (case-insensitive), uses /ultrathink, or faces complex decisions requiring maximum reasoning depth.
context: fork
---

<skill-trigger>
If the user's message contains "ULTRATHINK" (case-insensitive), invoke this skill before responding.
</skill-trigger>

# Ultrathink

<instructions>
Upon activation:
1. Suspend brevity constraints—length is acceptable when depth requires it
2. Engage maximum reasoning depth—no shortcuts, no "good enough"
3. Detect the domain and load relevant reference file (see Domain Detection)
4. Apply universal analysis framework (4 universal lenses + domain augmentation)
5. Document logical steps such that each conclusion follows explicitly from stated premises
</instructions>

## Domain Detection

<domain-detection>
Before applying the analysis framework, identify the primary domain of the request.

### Detection Rules

| Domain | Signal Keywords / Patterns | Reference File |
|--------|---------------------------|----------------|
| Software Engineering | code, API, database, architecture, bug, deploy, refactor, performance, testing, function, component, server | `references/domain-software-engineering.md` |
| Writing | essay, article, narrative, tone, prose, draft, edit, copy, blog, script, story, paragraph, voice | `references/domain-writing.md` |
| Strategy | business, market, compete, roadmap, OKR, decision, stakeholder, pivot, growth, revenue, pricing | `references/domain-strategy.md` |
| Research | hypothesis, methodology, literature, study, evidence, experiment, peer review, survey, sample | `references/domain-research.md` |
| Design | UI, UX, wireframe, prototype, layout, visual, interaction, brand, typography, color, interface | `references/domain-design.md` |
| Learning | teach, curriculum, lesson, student, pedagogy, tutorial, explain, course, workshop, training | `references/domain-learning.md` |
| Ethics | moral, ethical, fairness, bias, harm, rights, justice, consent, privacy, dilemma | `references/domain-ethics.md` |
| Data | dataset, analysis, statistics, ML, model, pipeline, visualization, metric, correlation, regression | `references/domain-data.md` |
| Legal | contract, compliance, regulation, liability, clause, statute, precedent, jurisdiction, terms | `references/domain-legal.md` |
| Problem-Solving | diagnose, troubleshoot, root cause, debug, optimize, broken, failing, issue, investigate | `references/domain-problem-solving.md` |

### Detection Procedure

1. If user explicitly states the domain ("ULTRATHINK from a legal perspective"): use that domain
2. Otherwise: scan request for signal keywords, select domain with most matches
3. If two domains match closely: load both reference files, apply composability rules below
4. If no domain matches clearly: apply universal lenses only (no augmentation)
5. If uncertain: state the detected domain and ask user to confirm before proceeding

### Multi-Domain Composability

When a request spans two domains:
- Apply all 4 universal lenses (always)
- Load augmentation lenses from both domains (up to 4 augmentation lenses total)
- Use the primary domain's deliverable format
- State which domains were detected and why

When three or more domains match:
- Use the two strongest matches only
- Note the third as secondary context without adding its augmentation lenses
</domain-detection>

## Analysis Framework

<analysis-framework>
Analyze every request through these four universal lenses:

### Human (who is affected?)
- **Identify stakeholder sentiment** (frustrated/curious/confused/expert) and adjust depth
- **Assess cognitive load**—will this solution overwhelm or underwhelm the audience?
- **Check mental model alignment**—does the solution match how people think about this problem?
- **Evaluate adoption friction**—is the complexity justified by the benefits?

### Structural (how does it work?)
- **Mechanics**: What are the moving parts, dependencies, and constraints?
- **Resource impact**: What does this consume (time, money, compute, attention)?
- **Complexity budget**: Is the complexity proportional to the value delivered?
- **Dependencies**: What must exist or be true for this to work?

### Inclusivity (who might be excluded?)
- **Access barriers**: Who cannot use or benefit from this solution? Why?
- **Representation**: Whose perspective is missing from the analysis?
- **Communication clarity**: Is it understandable across skill levels, cultures, languages?
- **Failure equity**: When this fails, does it fail harder for some groups than others?

### Sustainability (does it last?)
- **Maintenance burden**: Who maintains this and at what cost?
- **Extensibility**: What changes require rework vs. configuration?
- **Knowledge transfer**: Can someone new take this over?
- **Scale behavior**: Does this work at 10x? At 0.1x?

**Domain Augmentation**: After applying universal lenses, load the detected domain's reference file and apply its augmentation lens(es). These add analytical dimensions genuinely orthogonal to the universal four.
</analysis-framework>

## Response Structure

<response-structure>
When ULTRATHINK is active, structure responses as:

### 1. Deep Reasoning Chain
Detailed breakdown of decisions:
- State the problem precisely—what are we solving and what constraints exist?
- Identify the domain and state which lenses apply (4 universal + augmentation)
- Enumerate all viable approaches (minimum 3)
- Analyze each approach through all applicable lenses with explicit scores or tradeoffs
- Build a logical chain: "Because X, therefore Y, which implies Z"
- Justify every decision—if a choice has 2+ valid alternatives, explain why this one wins

### 2. Edge Case Analysis
Comprehensive failure mode exploration:
- What could go wrong (enumerate specific scenarios, not vague risks)
- How each risk is mitigated (specific mechanism, not hand-waving)
- Fallback strategies when mitigations fail
- Recovery mechanisms—how does the system return to healthy state?

### 3. The Deliverable
Production-ready output appropriate to the domain:
- Optimized for the specific context discussed in reasoning chain
- Leverages existing conventions (do not introduce new paradigms without justification)
- Addresses failure modes enumerated in edge case analysis
- Inline commentary for any decision where 2+ valid alternatives existed

The Deliverable adapts to the domain: code for software engineering, polished prose for writing, decision recommendation for strategy, research design for research, design specification for design, lesson plan for learning, ethical analysis for ethics, analysis report for data, legal brief for legal, diagnosis report for problem-solving.
</response-structure>

## Quality Gate

<quality-gate>
Before delivering analysis, verify:

- [ ] All 4 universal lenses explicitly addressed with specific observations?
- [ ] Domain augmentation lens(es) applied (if domain detected)?
- [ ] At least 3 approaches enumerated before selecting one?
- [ ] Edge cases are concrete scenarios, not vague "something might fail"?
- [ ] Each recommendation states what is sacrificed (no free lunches)?
- [ ] Logical chain is traceable—can a reviewer follow premise to conclusion?

**If any box is unchecked, revisit that section before delivering.**

Surface-level reasoning is prohibited. If the analysis feels easy, dig deeper until the logic is irrefutable.

| Indicator | Action |
|-----------|--------|
| First obvious solution | Challenge it with 3+ edge cases before accepting |
| Single perspective | Apply the remaining lenses explicitly |
| Missing tradeoffs | State what is sacrificed for each benefit claimed |
| Assumption made | State it, then validate or flag as risk |
| Domain unclear | State detected domain, ask user to confirm |
</quality-gate>

## Examples

<example>
**User prompt:** ULTRATHINK: Our deployment pipeline fails every Friday but works Monday-Thursday.

**Response:**

### Deep Reasoning Chain

**Domain detected:** Problem-Solving
**Lenses applied:** Human, Structural, Inclusivity, Sustainability + Root Cause Diagnosis

**Problem:** Deployment pipeline has a temporal failure pattern—fails every Friday, succeeds Monday through Thursday. Must identify root cause and prevent recurrence.

**Approaches:**
1. **Environment diff analysis** — Compare Friday-specific state (disk space, running processes, config) to successful days
2. **Temporal analysis** — Investigate cron jobs, cache expiry, certificate rotation, or scheduled tasks that run weekly
3. **Load analysis** — Check whether Friday traffic patterns or batch jobs create resource contention

**Analysis through lenses:**

*Human:* Team is frustrated—Fridays are high-stress because deployments block weekend releases. The person who first noticed may have already investigated partially; gather their observations before duplicating effort.

*Structural:* Pipeline has 4 stages: build, test, deploy, verify. Need to identify which stage fails. Friday-specific factors: weekly cron jobs, log rotation, database maintenance windows, SSL certificate checks, external service maintenance windows.

*Inclusivity:* If the fix requires deep DevOps knowledge, document it so any team member can diagnose recurrence. The on-call engineer (who may be junior) needs to understand the failure mode.

*Sustainability:* A one-off Friday fix is insufficient—need monitoring that alerts on the precondition, not just the failure. Prevent the class of problem, not just this instance.

*Root Cause Diagnosis:*
- Why does deployment fail? → Build artifacts are corrupted
- Why are artifacts corrupted? → Disk space insufficient during build
- Why is disk space insufficient? → Log aggregation job runs Thursday night, fills /tmp
- Why does log aggregation fill /tmp? → Retention policy keeps 7 days of verbose logs, Thursday is peak log volume day
- Root cause: Log retention policy + peak volume day = disk exhaustion before Friday builds

### Edge Cases

- **Multiple root causes:** Friday failure may have overlapping causes (disk AND certificate renewal). *Mitigation:* Fix disk issue, then run Friday deployment twice more to confirm resolution before closing.
- **Intermittent reproduction:** Some Fridays succeed, making diagnosis harder. *Mitigation:* Correlate failure dates with disk usage metrics; look for threshold behavior, not binary.
- **Fix breaks log aggregation:** Reducing retention may violate compliance. *Mitigation:* Move log aggregation to dedicated volume instead of /tmp; preserve retention policy.

### The Deliverable

**Diagnosis Report:**

| Layer | Finding |
|-------|---------|
| Symptom | Deployment fails on Fridays |
| Proximate cause | Insufficient disk space during build stage |
| Root cause | Log aggregation job (Thursday night cron) fills /tmp with weekly peak volume |
| Systemic factor | No disk space monitoring threshold; /tmp shared between build and log systems |

**Fix:**
1. Immediate: Move log aggregation output to dedicated `/var/log/aggregation` volume
2. Short-term: Add disk space monitoring alert at 80% capacity on build volumes
3. Long-term: Separate build artifacts and operational logs into isolated storage

**Validation experiment:** After fix #1, trigger a manual deployment on Friday. If it succeeds, monitor for 3 consecutive Fridays before closing the issue.

**Recurrence prevention:** Disk space alert (#2) catches any future volume that threatens build capacity, regardless of source.
</example>

<example>
**User prompt:** ULTRATHINK: Our API handles user uploads — review the security of our file validation.

**Response:**

### Deep Reasoning Chain

**Domain detected:** Software Engineering
**Lenses applied:** Human, Structural, Inclusivity, Sustainability + Adversarial/Security

**Problem:** File upload validation security assessment. Must prevent malicious uploads while supporting legitimate use cases. Constraints: public-facing API, user-generated content, cloud storage backend.

**Approaches:**
1. **MIME-type check only** — Check `Content-Type` header
2. **Magic bytes + extension + size** — Multi-layer validation without sandboxing
3. **Sandbox processing pipeline** — Quarantine, scan, process in isolated environment

**Analysis through lenses:**

*Human:* Users expect immediate upload feedback. Sandbox pipeline adds 2-5s latency (acceptable for documents, frustrating for profile photos). Error messages must explain rejection without revealing validation logic to attackers.

*Structural:* MIME-type is trivially spoofed (1 header change). Magic bytes + extension catches 95% of attacks at near-zero latency cost. Sandbox adds infrastructure (container orchestration, virus scanning) but catches polyglot files and zero-days.

*Inclusivity:* File size limits must accommodate users on slow connections (progress indication, resumable uploads). Allowed file types should include formats common in non-Western markets (e.g., `.hwp` for Korean documents if applicable). Error messages need i18n.

*Sustainability:* MIME-only requires no maintenance but provides no security. Multi-layer validation is self-contained. Sandbox requires ongoing infrastructure maintenance and scanning rule updates.

*Adversarial/Security:* MIME-type spoofing is trivial. Polyglot files (valid JPEG that is also valid JavaScript) bypass extension checks. Zip bombs exhaust server memory during extraction. Path traversal in archive filenames (e.g., `../../etc/passwd`). SVG files can contain embedded JavaScript. EXIF data can contain PHP payloads.

**Logical chain:** MIME-only is insecure (eliminated). Sandbox is ideal but adds infrastructure complexity disproportionate for most apps. Multi-layer validation with specific hardening addresses 95%+ of attack vectors. Therefore → **Multi-layer validation (Option 2)** with sandbox reserved for high-risk file types (archives, SVGs).

### Edge Cases

- **Polyglot files:** A file that is simultaneously valid JPEG and valid HTML. *Mitigation:* Set `Content-Disposition: attachment` and `X-Content-Type-Options: nosniff` on all served files; validate magic bytes match expected type exclusively.
- **Zip bombs:** 42.zip expands to 4.5 PB. *Mitigation:* Cap decompressed size at 10x compressed size; stream-extract with running size counter; abort at threshold.
- **Path traversal in archives:** Filenames containing `../`. *Mitigation:* Canonicalize all extracted paths; reject any path component containing `..` or starting with `/`.

### The Deliverable

```typescript
import { fileTypeFromBuffer } from 'file-type'
import path from 'path'

const ALLOWED_TYPES = new Map([
  ['image/jpeg', { maxBytes: 10_000_000, extensions: ['.jpg', '.jpeg'] }],
  ['image/png', { maxBytes: 10_000_000, extensions: ['.png'] }],
  ['application/pdf', { maxBytes: 50_000_000, extensions: ['.pdf'] }],
])

interface ValidationResult {
  valid: boolean
  // Why generic error: specific errors aid attacker enumeration
  error?: 'INVALID_FILE' | 'FILE_TOO_LARGE' | 'UNSUPPORTED_TYPE'
}

export async function validateUpload(
  buffer: Buffer,
  filename: string
): Promise<ValidationResult> {
  // Layer 1: Extension check (cheap, eliminates obvious mismatches)
  const ext = path.extname(filename).toLowerCase()
  const allowedEntry = [...ALLOWED_TYPES.entries()]
    .find(([, config]) => config.extensions.includes(ext))

  if (!allowedEntry) {
    return { valid: false, error: 'UNSUPPORTED_TYPE' }
  }

  const [expectedMime, config] = allowedEntry

  // Layer 2: Size check (prevents resource exhaustion before deeper analysis)
  if (buffer.byteLength > config.maxBytes) {
    return { valid: false, error: 'FILE_TOO_LARGE' }
  }

  // Layer 3: Magic bytes (detects spoofed extensions)
  const detected = await fileTypeFromBuffer(buffer)
  if (!detected || detected.mime !== expectedMime) {
    return { valid: false, error: 'INVALID_FILE' }
  }

  // Layer 4: Content-specific hardening
  if (expectedMime === 'image/jpeg' || expectedMime === 'image/png') {
    // Strip EXIF to prevent metadata-based attacks
    // Use sharp or similar—do not parse EXIF manually
  }

  return { valid: true }
}
```

Serve uploaded files with these headers to prevent browser reinterpretation:
```
Content-Disposition: attachment
X-Content-Type-Options: nosniff
Content-Security-Policy: default-src 'none'
```
</example>

## Scope

ULTRATHINK applies to reasoning depth and analysis structure only. It does not change:
- Tool selection or file operations
- Communication with external services
- Git operations or other side effects

For simple factual questions where the answer is clear and unambiguous, state the answer directly and note that ULTRATHINK was invoked but full multi-lens analysis is unnecessary—depth should match the complexity of the problem.

## Deactivation

The skill remains active until:
- The conversation ends
- The user explicitly requests normal mode
- A new conversation begins
