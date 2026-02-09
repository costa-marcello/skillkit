# Domain: Strategy

**Sections:** Universal Lens Interpretation · Augmentation Lens: Probabilistic Reasoning · Domain Evaluation Criteria · Examples

## Universal Lens Interpretation

How the 4 universal lenses apply to strategy:

### Human
- Stakeholder buy-in: who resists and why? What is their emotional stake?
- Change fatigue: how many changes has this team absorbed recently?
- Communication clarity: can non-technical audiences understand the strategy?
- Emotional stakes of the decision: careers, livelihoods, team identity

### Structural
- Resource requirements: budget, people, time, opportunity cost
- Dependency chains: what must happen first? What are the critical path items?
- Competitive dynamics: market position, moat durability, competitor response time
- Organizational constraints: team size, culture, technical debt, existing commitments

### Inclusivity
- Which teams or departments are affected but not consulted?
- Whose voice is missing from the strategy table?
- Does this strategy disproportionately burden one group (e.g., engineering absorbs all execution risk)?
- Are international/remote team members included in decision-making?

### Sustainability
- Does this strategy compound (build advantage over time) or deplete (burn runway)?
- What is the cost of reversal if the strategy fails?
- How does this look in 3 years? Does it create optionality or lock-in?
- Is the strategy robust to leadership changes?

## Augmentation Lens: Probabilistic Reasoning

Evaluates the likelihood of assumptions holding, the reversibility of decisions, and the second-order effects of failure. Strategy decisions are bets under uncertainty; this lens makes the betting explicit.

### Evaluation Criteria
- What is the probability of each assumed condition holding true?
- What are the second-order effects if the key assumption fails?
- Is this a one-way door (irreversible) or two-way door (reversible)?

### Guiding Questions
- Pre-mortem: "It is 1 year from now and this failed --- why?"
- What would change our mind? (Identify the falsifiable signal)
- What is the expected value, not just the best case?

## Domain Evaluation Criteria

Beyond the universal quality gate, verify for this domain:
- [ ] Key assumptions stated and probability-weighted?
- [ ] Reversibility assessed for each recommendation?
- [ ] Stakeholder impact mapped?
- [ ] Pre-mortem scenario included?

## Examples

<example>
**Prompt:** ULTRATHINK: Should we enter the European market this year or double down on US growth?

**Domain detected:** Strategy
**Lenses applied:** Human, Structural, Inclusivity, Sustainability + Probabilistic Reasoning

### Deep Reasoning Chain

**Problem:** Market expansion decision with constrained resources. Must choose between EU entry and US consolidation. Constraints: 18-month runway, 40-person team, B2B SaaS with US-only compliance.

**Approaches:**
1. **Full EU launch Q3** --- Dedicated team, local entity, GDPR compliance sprint
2. **US-only with limited EU pilot** --- 3 lighthouse customers, minimal compliance, test demand
3. **Deferred entry via local partnership** --- Revenue share with EU reseller, no entity needed

**Analysis through lenses:**

*Human:* Team is stretched (recent attrition). Full EU launch risks burnout. Pilot approach lets 2-3 motivated team members lead without overloading. Stakeholders (board) expect growth signal---partnership satisfies this without execution risk.

*Structural:* Full launch requires ~$800K (entity, compliance, hiring) and 6-month lead time. Pilot requires ~$150K. Partnership requires ~$50K + 30% revenue share. Current burn rate leaves 12 months at full-launch cost.

*Inclusivity:* EU customers need GDPR compliance, local-language support, EU payment methods, and local business hours. Pilot with English-only excludes DACH and Southern European markets (60% of EU B2B SaaS TAM).

*Sustainability:* Full launch creates permanent cost structure. Partnership is reversible. Pilot compounds---lighthouse customers become case studies for full launch.

*Probabilistic Reasoning:* P(full launch ROI positive in 18mo) ~ 25%. P(pilot validates demand) ~ 70%. P(partnership generates revenue in 6mo) ~ 55%. Pre-mortem: "We launched in EU and burned $600K with 3 customers because we underestimated localization costs."

**Logical chain:** Runway constraint eliminates full launch (12mo at burn = too tight). Partnership tests demand but cedes margin and control. Pilot balances signal-to-board with reversibility. Therefore -> **EU pilot with 3 lighthouse customers**, gate to full launch at $100K ARR from pilot cohort.

### Edge Cases

- **Pilot customers churn due to incomplete localization.** *Mitigation:* Select English-first companies (UK, Netherlands, Nordics) for pilot cohort.
- **Board interprets pilot as lack of ambition.** *Mitigation:* Frame as "market validation phase" with explicit full-launch trigger criteria.
- **Regulatory surprise (Digital Markets Act).** *Mitigation:* Legal review of DMA applicability before pilot launch; budget $30K contingency.

### The Deliverable

**Recommendation:** EU pilot (Option 2) with phased gate.

| Assumption | Confidence | Falsification Signal |
|------------|------------|---------------------|
| EU demand exists for our product | Medium (60%) | <5 qualified inbound leads in 3 months |
| English-first pilot is representative | Medium (55%) | Pilot customers request localization within 60 days |
| Team can handle pilot without backfilling | High (80%) | Sprint velocity drops >20% in US product |

**Action Plan:**
1. Weeks 1-2: Identify 10 target accounts (UK, NL, Nordics), begin outreach
2. Weeks 3-4: GDPR compliance gap analysis, estimate remediation cost
3. Months 2-3: Onboard first 3 pilot customers with dedicated CSM
4. Month 6: Gate review---proceed to full launch if pilot ARR > $100K

**Sacrificed:** Speed-to-market (6 months slower than full launch). Accepted because: preserves runway and reversibility.
</example>

<example>
**Prompt:** ULTRATHINK: Our main competitor just launched the feature we had planned for next quarter. Pivot or stay the course?

**Domain detected:** Strategy
**Lenses applied:** Human, Structural, Inclusivity, Sustainability + Probabilistic Reasoning

### Deep Reasoning Chain

**Problem:** Competitive response decision. Competitor launched a feature we planned for Q2. Must decide whether to accelerate, differentiate, or pivot. Constraints: 6-person engineering team, feature was 30% designed, competitor has 3x our market share.

**Approaches:**
1. **Accelerate and ship in 6 weeks** --- Cut scope to MVP, redirect engineering from other priorities
2. **Differentiate --- build a better version** --- Take full quarter, add capabilities competitor missed
3. **Deprioritize and pivot to adjacent opportunity** --- Concede this feature, invest in a gap they haven't addressed

**Analysis through lenses:**

*Human:* Team morale impact: "They beat us" narrative is demoralizing. Accelerating risks burnout on top of disappointment. Differentiation gives the team a "we're building something better" narrative. Pivot feels like retreat unless framed as strategic.

*Structural:* Accelerate: requires pulling 4 engineers off current work (Q1 roadmap slips 6 weeks). Differentiate: stays on timeline but Q2 is now a feature parity + improvement play. Pivot: requires identifying the adjacent opportunity (research cost: 2 weeks). Competitor's version: check reviews and social media for gaps.

*Inclusivity:* Customer segment analysis: does the competitor's feature serve all our customer segments or just the overlap? If they built for enterprise and our customers are SMB, their launch may not matter to our users.

*Sustainability:* Accelerating to match creates a "feature treadmill"---they ship, we react, they ship again. Differentiation breaks the cycle if we nail a genuine capability gap. Pivot to an adjacent opportunity builds a unique moat.

*Probabilistic Reasoning:* P(6-week ship meets quality bar) ~ 40%---rushed features accumulate debt. P(differentiated version wins customers back) ~ 60% if the gap is real. P(adjacent opportunity exists and is viable) ~ 50%---requires validation. Pre-mortem for accelerate: "We shipped a buggy clone, got compared unfavorably, and lost the 6 weeks we needed for Q1 deliverables."

**Logical chain:** Accelerating is high-risk (40% quality) and reactive (treadmill). Pivot requires unvalidated adjacent opportunity. Differentiation leverages existing design work (30% done) and gives a positive team narrative. But only if the competitor's version has genuine gaps. Therefore -> **Investigate competitor gaps (1 week), then either differentiate (if gaps found) or pivot (if competitor nailed it).**

### Edge Cases

- **Competitor's version is actually good.** Differentiation is harder. *Mitigation:* Talk to 5 customers in the first week---if they've already adopted the competitor's feature, pivot.
- **Sales team pressures for immediate response.** *Mitigation:* Arm sales with a "our approach" narrative for the investigation week; silence is worse than "we're taking a different approach."
- **Adjacent opportunity requires skills the team doesn't have.** *Mitigation:* Scope adjacent features to current team capabilities; hiring for a pivot doubles the timeline.

### The Deliverable

**Competitive Response Brief:**

**Immediate action (Week 1):** Competitor gap analysis + 5 customer interviews. Deliverables: gap report, customer sentiment summary.

**Decision gate (End of Week 1):**

| Finding | Action | Probability |
|---------|--------|-------------|
| Competitor missed 2+ significant capabilities | Differentiate (12-week build) | ~45% |
| Competitor's version is adequate but not great | Differentiate on integration/workflow | ~30% |
| Competitor nailed it | Pivot to [identified adjacent opportunity] | ~25% |

**Decision matrix:**

| Factor | Accelerate | Differentiate | Pivot |
|--------|-----------|---------------|-------|
| Team morale | Low (crunch + copy) | High (craft narrative) | Medium (feels like retreat) |
| Quality risk | High (40% on-time) | Low (full quarter) | Medium (new territory) |
| Competitive position | Parity at best | Potential advantage | Unique positioning |
| Revenue impact (6mo) | Neutral | +15% if gap is real | Unknown |

**Recommendation:** Do not decide today. Invest 1 week in investigation, then commit fully to one path. The cost of 1 week of clarity is far less than 6 weeks of wrong direction.
</example>
