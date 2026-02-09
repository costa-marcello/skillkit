# Ultrathink Examples

Two worked examples demonstrating the full ULTRATHINK response structure across different domains. Each domain reference file contains 2-3 additional domain-specific examples.

<example>
**User prompt:** ULTRATHINK: Our deployment pipeline fails every Friday but works Monday-Thursday.

**Response:**

### Deep Reasoning Chain

**Domain detected:** Problem-Solving
**Lenses applied:** Human, Structural, Inclusivity, Sustainability + Root Cause Diagnosis

**Problem:** Deployment pipeline has a temporal failure pattern -- fails every Friday, succeeds Monday through Thursday. Must identify root cause and prevent recurrence.

**Approaches:**
1. **Environment diff analysis** -- Compare Friday-specific state (disk space, running processes, config) to successful days
2. **Temporal analysis** -- Investigate cron jobs, cache expiry, certificate rotation, or scheduled tasks that run weekly
3. **Load analysis** -- Check whether Friday traffic patterns or batch jobs create resource contention

**Analysis through lenses:**

*Human:* Team is frustrated -- Fridays are high-stress because deployments block weekend releases. The person who first noticed may have already investigated partially; gather their observations before duplicating effort.

*Structural:* Pipeline has 4 stages: build, test, deploy, verify. Need to identify which stage fails. Friday-specific factors: weekly cron jobs, log rotation, database maintenance windows, SSL certificate checks, external service maintenance windows.

*Inclusivity:* If the fix requires deep DevOps knowledge, document it so any team member can diagnose recurrence. The on-call engineer (who may be junior) needs to understand the failure mode.

*Sustainability:* A one-off Friday fix is insufficient -- need monitoring that alerts on the precondition, not just the failure. Prevent the class of problem, not just this instance.

*Root Cause Diagnosis:*
- Why does deployment fail? -> Build artifacts are corrupted
- Why are artifacts corrupted? -> Disk space insufficient during build
- Why is disk space insufficient? -> Log aggregation job runs Thursday night, fills /tmp
- Why does log aggregation fill /tmp? -> Retention policy keeps 7 days of verbose logs, Thursday is peak log volume day
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
**User prompt:** ULTRATHINK: Our API handles user uploads -- review the security of our file validation.

**Response:**

### Deep Reasoning Chain

**Domain detected:** Software Engineering
**Lenses applied:** Human, Structural, Inclusivity, Sustainability + Adversarial/Security

**Problem:** File upload validation security assessment. Must prevent malicious uploads while supporting legitimate use cases. Constraints: public-facing API, user-generated content, cloud storage backend.

**Approaches:**
1. **MIME-type check only** -- Check `Content-Type` header
2. **Magic bytes + extension + size** -- Multi-layer validation without sandboxing
3. **Sandbox processing pipeline** -- Quarantine, scan, process in isolated environment

**Analysis through lenses:**

*Human:* Users expect immediate upload feedback. Sandbox pipeline adds 2-5s latency (acceptable for documents, frustrating for profile photos). Error messages must explain rejection without revealing validation logic to attackers.

*Structural:* MIME-type is trivially spoofed (1 header change). Magic bytes + extension catches 95% of attacks at near-zero latency cost. Sandbox adds infrastructure (container orchestration, virus scanning) but catches polyglot files and zero-days.

*Inclusivity:* File size limits must accommodate users on slow connections (progress indication, resumable uploads). Allowed file types should include formats common in non-Western markets (e.g., `.hwp` for Korean documents if applicable). Error messages need i18n.

*Sustainability:* MIME-only requires no maintenance but provides no security. Multi-layer validation is self-contained. Sandbox requires ongoing infrastructure maintenance and scanning rule updates.

*Adversarial/Security:* MIME-type spoofing is trivial. Polyglot files (valid JPEG that is also valid JavaScript) bypass extension checks. Zip bombs exhaust server memory during extraction. Path traversal in archive filenames (e.g., `../../etc/passwd`). SVG files can contain embedded JavaScript. EXIF data can contain PHP payloads.

**Logical chain:** MIME-only is insecure (eliminated). Sandbox is ideal but adds infrastructure complexity disproportionate for most apps. Multi-layer validation with specific hardening addresses 95%+ of attack vectors. Therefore: **Multi-layer validation (Option 2)** with sandbox reserved for high-risk file types (archives, SVGs).

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
    // Use sharp or similar -- do not parse EXIF manually
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
