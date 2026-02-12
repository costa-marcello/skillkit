---
name: ultrathink
description: Performs exhaustive multi-lens analysis through human, structural, inclusivity, and sustainability perspectives with domain-specific augmentation. Use when the user says "ULTRATHINK" (case-insensitive), uses /ultrathink, or faces complex decisions requiring maximum reasoning depth.
license: MIT
context: fork
agent: general-purpose
allowed-tools: Read, Grep, Glob
---

# Ultrathink

<instructions>
Upon activation:
1. Prioritise depth over brevity -- expand reasoning until the logic is complete
2. Engage maximum reasoning depth -- no shortcuts, no "good enough"
3. Detect the domain and load the relevant reference file (see Domain Detection)
4. Apply the universal analysis framework (4 universal lenses + domain augmentation)
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

Three compact examples below. See `references/examples.md` for full worked examples. Each domain reference file contains 2-3 additional domain-specific examples.

<example>
**Prompt:** ULTRATHINK: Our deployment pipeline fails every Friday but works Monday-Thursday.

**Domain detected:** Problem-Solving
**Lenses:** Human, Structural, Inclusivity, Sustainability + Root Cause Diagnosis

**Deep Reasoning Chain:** Three approaches investigated (environment diff, temporal analysis, load analysis). Root cause found via 5 Whys: log aggregation job runs Thursday night, fills /tmp, causing disk exhaustion before Friday builds.

**Edge Cases:** Multiple overlapping root causes, intermittent reproduction, fix breaking compliance retention.

**Deliverable:** Diagnosis report with layered findings (symptom, proximate cause, root cause, systemic factor). Three-phase fix: immediate (move log output), short-term (disk monitoring at 80%), long-term (isolated storage). Validation experiment: manual Friday deploy, monitor 3 consecutive Fridays.
</example>

<example>
**Prompt:** ULTRATHINK: Should we enter the European market this year or double down on US growth?

**Domain detected:** Strategy
**Lenses:** Human, Structural, Inclusivity, Sustainability + Probabilistic Reasoning

**Deep Reasoning Chain:** Three approaches (full EU launch, US-only with EU pilot, deferred partnership). Probability-weighted: P(full launch ROI in 18mo) ~25%, P(pilot validates demand) ~70%. Pre-mortem: "Burned $600K with 3 customers because we underestimated localisation." Runway constraint eliminates full launch.

**Edge Cases:** Pilot churn from incomplete localisation, board interpreting pilot as lack of ambition, regulatory surprise (Digital Markets Act).

**Deliverable:** Recommendation table with assumptions, confidence levels, and falsification signals. Phased action plan with gate review at $100K ARR from pilot cohort. Explicit sacrifice stated: 6 months slower than full launch.
</example>

<example>
**Prompt:** ULTRATHINK: This blog post loses the reader at paragraph 4. Help me restructure it.

**Domain detected:** Writing
**Lenses:** Human, Structural, Inclusivity, Sustainability + Aesthetic Judgment

**Deep Reasoning Chain:** Three approaches (inverted pyramid, problem-solution-evidence, narrative arc). Diagnosis: paragraphs 1-3 are throat-clearing with no stakes. The author's sharpest observation is buried in paragraph 5. Problem-solution-evidence fits the time-poor tech manager audience.

**Edge Cases:** Author resists restructuring (attached to chronological setup), multiple audiences (managers and ICs), SEO vs. readability tension.

**Deliverable:** Restructured outline with editorial annotations. Hook moved to paragraph 1. Each paragraph earns the next. Closing echoes the opening for structural completeness.
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
