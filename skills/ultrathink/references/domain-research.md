# Domain: Research

**Sections:** Universal Lens Interpretation · Augmentation Lens: Evidential Rigor · Domain Evaluation Criteria · Examples

## Universal Lens Interpretation

How the 4 universal lenses apply to research:

### Human
- Researcher bias awareness: confirmation bias, anchoring, availability heuristic
- Cognitive traps: sunk cost (continuing a failing methodology), narrative fallacy (finding stories in noise)
- Audience expectations for rigor: academic peer review vs. industry report vs. internal memo
- Ethical implications of findings: who benefits and who could be harmed by the results?

### Structural
- Methodology soundness: sampling strategy, control design, variable isolation
- Data collection feasibility: access to participants, cost, timeline, tooling
- Analytical framework alignment: does the analysis method match the research question type?
- Resource constraints: time, funding, access to participants, computational resources

### Inclusivity
- Sample representation: who is studied vs. who is excluded? What populations are underrepresented?
- Geographic and cultural bias in methodology: are instruments validated cross-culturally?
- Accessibility of findings to non-specialist audiences: plain-language summaries, visualizations
- Language of dissemination: is the research only accessible in English?

### Sustainability
- Reproducibility: can someone replicate this study with the documented methodology?
- Longitudinal viability: does the methodology work for follow-up studies?
- Data preservation and sharing: is data archived for future researchers?
- Knowledge contribution: incremental improvement vs. foundational contribution

## Augmentation Lens: Evidential Rigor

Evaluates whether the evidence actually supports the conclusions drawn. Research is uniquely vulnerable to the gap between "data exists" and "data proves the claim"---this lens applies systematic skepticism to that gap.

### Evaluation Criteria
- Does the evidence actually support the conclusion (or merely correlate)?
- What alternative explanations exist for the same data?
- Is the sample size sufficient for the claimed effect size?

### Guiding Questions
- What would disconfirming evidence look like? Would this methodology detect it?
- What is the weakest link in the evidence chain?
- Is the base rate accounted for? (Is this finding surprising given priors, or expected?)

## Domain Evaluation Criteria

Beyond the universal quality gate, verify for this domain:
- [ ] Methodology matches research question type (qualitative/quantitative/mixed)?
- [ ] Alternative explanations explicitly addressed?
- [ ] Limitations stated before conclusions?
- [ ] Reproducibility path documented?

## Examples

<example>
**Prompt:** ULTRATHINK: Design a study to measure whether our new onboarding reduces churn by 20%.

**Domain detected:** Research
**Lenses applied:** Human, Structural, Inclusivity, Sustainability + Evidential Rigor

### Deep Reasoning Chain

**Problem:** Design a study to test whether a new onboarding flow reduces customer churn by 20% compared to the current flow. Must produce actionable results within a business planning cycle. Constraints: SaaS product with ~2,000 new signups/month, current 90-day churn rate is 35%.

**Approaches:**
1. **Randomized A/B test** --- Split new signups 50/50, measure 90-day churn for each cohort
2. **Before/after comparison with historical controls** --- Launch new onboarding, compare churn to previous 3 months
3. **Multivariate regression** --- Collect data on confounds (plan type, company size, acquisition channel), model churn as function of onboarding type + controls

**Analysis through lenses:**

*Human:* Stakeholders want quick answers ("is it working?"). A/B test takes 90+ days for churn data to mature. Business pressure will push for early reads---resist premature conclusions. The product team emotionally invested in the new onboarding may have confirmation bias when interpreting ambiguous results.

*Structural:* A/B test sample size calculation: to detect a 20% relative reduction (35% -> 28%) with 80% power and alpha=0.05, need ~900 per group. At 1,000 signups/group/month, minimum 2 months enrollment + 3 months observation = 5 months total. Before/after is faster but can't control for seasonality, marketing changes, or product updates during the period.

*Inclusivity:* Onboarding effectiveness may vary by user segment. Enterprise users vs. SMB, technical vs. non-technical, English vs. non-English. If the new onboarding works for power users but fails for casual users, the average may mask segment-specific harm. Stratified analysis required.

*Sustainability:* A/B test infrastructure should be reusable for future experiments. Document the methodology so the team can run their own studies. Churn measurement must be consistently defined (what counts as churn? Non-login for 30 days? Subscription cancellation? Downgrade?).

*Evidential Rigor:* Before/after comparison has a fatal flaw: any concurrent change (new feature, pricing change, market shift) is an alternative explanation. A/B test controls for this. However, A/B test assumes no spillover (users in group A don't interact with group B users). For SaaS with team accounts, this is risky---both versions could exist within one company. Randomization unit should be organization, not individual user, to prevent contamination. This reduces effective sample size.

**Logical chain:** Before/after cannot establish causation (too many confounds). Multivariate regression is sophisticated but still observational---residual confounding remains. A/B test is the gold standard for causal inference. With organization-level randomization to prevent spillover, at ~400 organizations/month, we need 3 months enrollment + 3 months observation = 6 months. Therefore -> **Randomized A/B test at organization level** with pre-registered analysis plan and interim monitoring.

### Edge Cases

- **Organization-level randomization reduces sample size below power threshold.** *Mitigation:* Extend enrollment period to 4 months, or accept 70% power with documented limitation. Do not switch to user-level randomization---spillover bias is worse than low power.
- **Product team ships improvements during the test.** *Mitigation:* Freeze the test flows during the study. Log all product changes with timestamps to assess potential contamination.
- **Churn definition changes mid-study.** *Mitigation:* Pre-register the churn definition before starting. Use the primary definition for the main analysis; run sensitivity analyses with alternative definitions.

### The Deliverable

**Research Design Document:**

**Research question:** Does the new onboarding flow reduce 90-day organizational churn by >=20% relative to the current flow?

**Design:** Randomized controlled trial, organization-level assignment, 1:1 allocation ratio.

**Sample size:** 450 organizations per group (total N=900). Based on: baseline churn 35%, minimum detectable effect 7 percentage points (20% relative reduction), alpha=0.05 (two-sided), power=80%.

**Timeline:**
- Month 1: Instrument tracking, pre-register analysis plan, randomization setup
- Months 2-5: Enrollment (target 450/group)
- Months 5-8: Observation period (90-day churn window for last enrolled cohort)
- Month 8: Primary analysis
- Month 9: Report and recommendations

**Primary outcome:** 90-day organizational churn rate (defined as: no active user login for 30+ consecutive days OR subscription cancelled OR downgraded to free tier).

**Analysis plan:**
- Primary: Chi-square test of churn proportions, two-sided alpha=0.05
- Secondary: Stratified analysis by segment (plan tier, company size, acquisition channel)
- Sensitivity: Alternative churn definitions (14-day, 60-day windows)
- Interim: Monthly safety monitoring (stop if new onboarding churn exceeds control by >10 percentage points)

**Limitations:**
- Organization-level randomization reduces effective sample size
- 90-day window may miss longer-term effects (recommend 6-month follow-up)
- Does not identify *which elements* of the new onboarding drive the effect (requires follow-up study)
</example>

<example>
**Prompt:** ULTRATHINK: Review this literature review section --- is it comprehensive enough for a peer-reviewed submission?

**Domain detected:** Research
**Lenses applied:** Human, Structural, Inclusivity, Sustainability + Evidential Rigor

### Deep Reasoning Chain

**Problem:** Assess completeness and quality of a literature review for peer-reviewed submission. Must identify coverage gaps, methodological concerns, and structural issues. Constraints: academic journal in applied psychology, quantitative study, literature review section currently covers 34 sources.

**Approaches:**
1. **Systematic review audit** --- Apply PRISMA-style criteria to check for systematic coverage
2. **Narrative synthesis assessment** --- Evaluate argument flow, thematic organization, and gap identification
3. **Scoping review comparison** --- Map the covered territory against known sub-topics to identify blind spots

**Analysis through lenses:**

*Human:* Reviewers expect literature reviews to demonstrate mastery of the field. Missing a seminal paper signals unfamiliarity. Including too many tangentially related papers signals lack of focus. The sweet spot: every cited paper either establishes the theoretical foundation, demonstrates the gap, or justifies the methodology.

*Structural:* 34 sources for an applied psychology study: reasonable if focused, thin if the field is large. Check: (a) publication date range (too narrow = recency bias, too broad = ancient sources), (b) journal quality (predatory journals undermine credibility), (c) methodology diversity (all surveys? Missing experimental evidence?), (d) geographic diversity (all WEIRD samples?).

*Inclusivity:* Literature reviews in psychology often over-represent WEIRD (Western, Educated, Industrialized, Rich, Democratic) populations. Check for cross-cultural studies. Also check for gender balance in cited authors---citation bias reinforces existing inequity.

*Sustainability:* A well-structured literature review serves as a resource for future researchers. Thematic organization (vs. chronological) ages better because new papers slot into existing themes rather than requiring restructuring.

*Evidential Rigor:* Check for cherry-picking: does the review cite studies that contradict the proposed hypothesis? A literature review that only cites supporting evidence is advocacy, not scholarship. Does the review distinguish between strong evidence (RCTs, meta-analyses) and weak evidence (case studies, opinion pieces)? Is the "gap" genuinely unaddressed, or has it been answered in a study the author missed?

**Logical chain:** A PRISMA-style audit would be inappropriate for a narrative review in a primary study (that's a different paper type). Scoping review comparison identifies what's missing. Narrative synthesis assessment evaluates how well the covered territory is presented. Both are needed: scope check first (is anything missing?), then quality check (is what's there well-presented?). Therefore -> **Scoping comparison + narrative quality audit**, two-pass review.

### Edge Cases

- **The "gap" has been addressed in a preprint or conference paper.** *Mitigation:* Search Google Scholar, PsycINFO, and SSRN for recent preprints matching key terms. Journals increasingly expect preprint awareness.
- **Seminal paper is missing but in a different discipline.** Cross-disciplinary citations are easy to miss. *Mitigation:* Check reference lists of the 3 most-cited papers in the review---backward citation tracking catches cross-disciplinary foundations.
- **Review section is well-written but theoretically shallow.** Covers many papers but doesn't synthesize into a theoretical argument. *Mitigation:* Look for a clear "thread"---does each paragraph build toward the research question, or is it a list of paper summaries?

### The Deliverable

**Literature Review Assessment:**

**Coverage Analysis:**

| Dimension | Status | Concern |
|-----------|--------|---------|
| Seminal papers | 5 of 7 key papers cited | Missing: [Author, Year] and [Author, Year] |
| Recency | Range 2008-2024, median 2019 | Adequate for the field |
| Methodology diversity | 28 quantitative, 4 qualitative, 2 meta-analyses | Needs more meta-analytic evidence |
| Geographic diversity | 30 US/UK, 3 EU, 1 East Asia | Significant WEIRD bias |
| Contradictory evidence | 2 studies cited that challenge hypothesis | Needs 1-2 more for balance |

**Structural Assessment:**
- Organization: Thematic (good). Four themes identified, but themes 2 and 3 overlap and should be merged or distinguished more clearly.
- Flow: Strong in sections 1-2, weak in section 3 (reads as a list of studies rather than a synthesis).
- Gap statement: Present but understated. The gap should be the punchline of the literature review---currently buried in the second-to-last paragraph.

**Recommendations:**
1. Add missing seminal papers (2 sources)
2. Include 3-4 non-WEIRD studies to address geographic bias
3. Add 1-2 recent meta-analyses to strengthen the evidence base
4. Merge or sharpen themes 2 and 3
5. Move gap statement to final paragraph with explicit connection to research question
6. Add 1-2 contradictory findings with discussion of why they don't undermine the hypothesis
</example>
