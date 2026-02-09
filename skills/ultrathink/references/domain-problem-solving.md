# Domain: Problem-Solving

**Sections:** Universal Lens Interpretation · Augmentation Lens: Root Cause Diagnosis · Domain Evaluation Criteria · Examples

## Universal Lens Interpretation

How the 4 universal lenses apply to problem-solving:

### Human
- Who is experiencing the problem? What is their urgency level?
- What have they already tried? What is their frustration state?
- What is their capacity to implement the solution (technical skill, time, authority)?
- Is the problem reporter the same as the problem owner?

### Structural
- System topology: what connects to what? Where are the boundaries?
- Constraint map: what cannot change? (budget, timeline, technology, contracts)
- Resource availability: time, budget, people, tools
- Timeline pressure: is this a fire or a slow burn?

### Inclusivity
- Does the solution work for all affected parties or just the loudest?
- Are edge-case users considered in the fix?
- Is the diagnostic process accessible to non-experts?
- Will the fix introduce new problems for a different group?

### Sustainability
- Does this fix the root cause or the symptom?
- Will this problem recur? What prevents recurrence?
- Is the fix maintainable by the team that inherits it?
- Does the fix introduce new problems elsewhere?

## Augmentation Lens: Root Cause Diagnosis

Evaluates whether the analysis reaches the actual cause rather than stopping at symptoms. This lens adds systematic causal reasoning that the universal four cannot cover.

### Evaluation Criteria
- Apply the "5 Whys" to distinguish symptoms from causes
- Map the causal chain: event → proximate cause → root cause → systemic factor
- Is there a pattern of recurrence suggesting systemic issues?

### Guiding Questions
- Does the proposed fix address the layer that prevents recurrence?
- What is the cheapest experiment to validate the diagnosis before investing in the fix?
- If we fix this, what breaks next? (downstream dependencies)

## Domain Evaluation Criteria

Beyond the universal quality gate, verify for this domain:
- [ ] Symptom vs. root cause explicitly distinguished?
- [ ] Causal chain documented (not just "fix X")?
- [ ] Solution validated against recurrence potential?
- [ ] Diagnostic reasoning shown (not just the answer)?

## Examples

<example>
**Prompt:** ULTRATHINK: Our Node.js API server's memory usage climbs steadily until it crashes every 2-3 days.

**Domain detected:** Problem-Solving
**Lenses applied:** Human, Structural, Inclusivity, Sustainability + Root Cause Diagnosis

### Deep Reasoning Chain

**Problem:** Progressive memory leak in production API server. Process memory grows linearly until OOM kill at ~1.5GB, causing 2-5 minutes of downtime every 2-3 days. Must identify the leak source and fix without a full rewrite.

**Approaches:**
1. **Heap snapshot comparison** — Take snapshots at intervals, diff retained objects to find growing allocations
2. **Code audit of known leak patterns** — Review event listeners, closures, caches, and stream handling for common Node.js leak sources
3. **Binary search via feature flags** — Disable subsystems one at a time to isolate the leaking component

**Analysis through lenses:**

*Human:* On-call engineers are restarting the server manually at 3 AM. This is unsustainable and breeds burnout. A short-term mitigation (auto-restart) buys investigation time without disrupting users.

*Structural:* Server handles 3 subsystems: REST API, WebSocket connections, and background job processing. Memory growth is linear (~50MB/hour), suggesting a per-request or per-connection leak rather than a one-time allocation. V8 heap limit is 1.5GB by default.

*Inclusivity:* The fix must be documented so any backend engineer can diagnose similar leaks in the future. Heap profiling requires tooling setup—provide a runbook, not tribal knowledge.

*Sustainability:* A band-aid (periodic restart) masks the problem and may hide additional leaks. The fix should include a memory monitoring alert that catches regressions before they reach production.

*Root Cause Diagnosis:*
- Why does memory grow? → Retained objects accumulate in heap
- Why are objects retained? → WebSocket connection handler registers error listeners but never removes them on disconnect
- Why aren't listeners removed? → The `on('error')` listener is added per-message inside the connection handler, not once per connection
- Why wasn't this caught? → No memory profiling in staging; load tests run for 10 minutes (too short to observe growth)
- Root cause: Event listener leak in WebSocket message handler—each message adds a listener, none are removed

### Edge Cases

- **Multiple leak sources:** WebSocket fix reduces growth but doesn't eliminate it. *Mitigation:* After fixing, re-profile to confirm flat memory curve; if growth persists, repeat heap diff analysis for remaining leaks.
- **Fix causes WebSocket errors to go unhandled.** *Mitigation:* Move the error listener to connection-level (registered once), not message-level. Verify error handling coverage with fault injection test.
- **Heap snapshots too large to analyze.** *Mitigation:* Use `--max-old-space-size=512` in staging to trigger the leak faster; take snapshots at 200MB intervals instead of waiting for 1.5GB.

### The Deliverable

**Diagnosis Report:**

| Layer | Finding |
|-------|---------|
| Symptom | Memory grows ~50MB/hour until OOM crash at 1.5GB |
| Proximate cause | Event listeners accumulate on WebSocket connections |
| Root cause | `on('error')` registered per-message inside `ws.on('message')` handler instead of once per connection |
| Systemic factor | No memory regression testing; load tests too short to surface gradual leaks |

**Fix:**
1. Immediate: Move `on('error')` listener to connection-level handler (registered once in `ws.on('connection')`)
2. Short-term: Add memory usage monitoring with alert at 70% of heap limit (1.05GB)
3. Long-term: Add 1-hour load test to CI that asserts memory delta < 10MB over the run

**Validation experiment:** Deploy fix to one instance. Monitor heap size for 48 hours. Expected: flat memory curve (< 5MB/hour growth). Compare against unfixed instance running in parallel.
</example>

<example>
**Prompt:** ULTRATHINK: Customer complaints increased 40% this month but nothing changed in our product.

**Domain detected:** Problem-Solving
**Lenses applied:** Human, Structural, Inclusivity, Sustainability + Root Cause Diagnosis

### Deep Reasoning Chain

**Problem:** 40% increase in customer complaints with no corresponding product changes. Must identify the source and determine whether this is a product issue, external factor, or measurement artifact.

**Approaches:**
1. **Complaint categorization** — Classify complaints by type and find the spike source
2. **External factor analysis** — Investigate seasonal patterns, competitor actions, market events
3. **Hidden change audit** — Review third-party dependencies, infrastructure changes, support staffing, pricing/billing changes

**Analysis through lenses:**

*Human:* Customer frustration is real regardless of cause. Support team may be demoralized by volume. The "nothing changed" claim needs verification—changes below leadership visibility (dependency updates, infra config) are still changes.

*Structural:* Complaint channels: email, in-app, social, phone. Need per-channel breakdown. 40% increase: is this absolute or relative? (100 → 140 vs 1000 → 1400 have different implications.) Timeframe: sudden spike or gradual climb?

*Inclusivity:* Are complaints concentrated in a specific user segment (geography, plan tier, device type)? A change affecting mobile users won't show in desktop metrics. Non-English-speaking users may complain less but churn more.

*Sustainability:* If the cause is external (competitor launched better feature), a quick fix won't help—need strategic response. If internal (hidden change), fix and add change monitoring.

*Root Cause Diagnosis:*
- Why did complaints increase? → Users report "slow loading" and "timeouts"
- Why are users experiencing slowness? → API response times increased 3x
- Why did API response times increase? → Third-party payment processor updated their API (added verification step)
- Why wasn't this caught? → No performance monitoring on third-party API latency
- Root cause: Unmonitored third-party dependency change

### Edge Cases

- **Multiple simultaneous causes:** Slowness AND a billing error AND seasonal spike. *Mitigation:* Categorize complaints before investigating; don't assume single cause.
- **Measurement artifact:** New complaint form is easier to submit, inflating volume without more actual issues. *Mitigation:* Check complaint-per-active-user ratio, not just absolute count.
- **Correlation without causation:** Complaints spike coincides with but isn't caused by the identified change. *Mitigation:* Check complaint timing against API latency timeline; look for causal lag.

### The Deliverable

**Investigation Report:**

| Layer | Finding |
|-------|---------|
| Symptom | 40% increase in customer complaints |
| Proximate cause | Users experiencing 3x slower page loads and timeout errors |
| Root cause | Third-party payment processor API update added verification step (+800ms per call) |
| Systemic factor | No latency monitoring on external API dependencies |

**Action Priorities:**
1. Immediate: Contact payment processor about performance regression; request timeline for fix
2. Short-term: Add client-side caching for payment verification to reduce API calls by ~60%
3. Long-term: Implement latency budgets and alerting for all third-party API dependencies

**Validation plan:** After implementing caching (#2), monitor complaint volume for 2 weeks. Expected reduction: 25-30% (the payment-related complaints). Remaining complaints need separate categorization.
</example>
