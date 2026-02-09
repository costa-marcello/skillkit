# Domain: Ethics

**Sections:** Universal Lens Interpretation · Augmentation Lens: Moral Framework Analysis · Domain Evaluation Criteria · Examples

## Universal Lens Interpretation

How the 4 universal lenses apply to ethical analysis:

### Human
- Who bears the consequences of this decision? Map all affected parties.
- What power asymmetries exist between decision-makers and affected parties?
- What are the emotional stakes? (fear, trust, dignity, autonomy)
- Is consent informed and genuine, or coerced by circumstance?

### Structural
- What institutional or systemic constraints shape the available options?
- What mechanisms enforce the decision? What accountability structures exist?
- What feedback loops amplify or dampen the effects?
- What precedent exists for this type of decision?

### Inclusivity
- Whose voices are absent from the decision-making process?
- Who bears disproportionate risk from this decision?
- Are cultural value differences respected or overridden?
- Is consent meaningful for all affected parties (power, information, alternatives)?

### Sustainability
- Does this create precedent others will follow? What norm does it establish?
- What second-order norms does this decision reinforce or erode?
- Is the ethical framework durable under changing conditions (technology, culture, law)?
- Does this decision compound trust or deplete it?

## Augmentation Lens: Moral Framework Analysis

Evaluates the decision through multiple ethical traditions to find convergence and genuine dilemmas. Ethical analysis that uses only one framework is advocacy; this lens forces multi-framework comparison to reveal where the answer is clear and where it is genuinely contested.

### Evaluation Criteria
- **Utilitarian analysis**: What produces the greatest good for the greatest number? Measurable harms and benefits?
- **Deontological analysis**: What do duty, rights, and rules demand? Are we treating people as ends, not means?
- **Virtue ethics analysis**: What would a virtuous person or organization do? What character does this action express?

### Guiding Questions
- **Care ethics**: What do relationships and responsibilities of care demand?
- **Convergence test**: Where do all frameworks agree? (high confidence) Where do they diverge? (genuine dilemma requiring explicit tradeoff)
- Would we be comfortable if this decision were made public and scrutinized?

## Domain Evaluation Criteria

Beyond the universal quality gate, verify for this domain:
- [ ] Multiple moral frameworks explicitly applied (not just "it feels wrong")?
- [ ] Affected parties enumerated with power analysis?
- [ ] Framework convergence/divergence clearly stated?
- [ ] Recommendation acknowledges genuine tradeoffs (not "the right thing is obvious")?

## Examples

<example>
**Prompt:** ULTRATHINK: We can improve our ML model accuracy by 15% using demographic data. Should we?

**Domain detected:** Ethics
**Lenses applied:** Human, Structural, Inclusivity, Sustainability + Moral Framework Analysis

### Deep Reasoning Chain

**Problem:** ML model accuracy can be improved by 15% by incorporating demographic data (age, gender, location, ethnicity). Must determine whether to use this data. Constraints: consumer-facing product, regulated industry (financial services), model affects loan approval decisions.

**Approaches:**
1. **Use all available data** — Maximize model accuracy, use demographic features directly
2. **Use anonymized proxies only** — Remove protected attributes but allow correlated features (zip code, browsing behavior)
3. **Reject demographic data entirely** — Fairness-first approach, accept lower accuracy for equal treatment

**Analysis through lenses:**

*Human:* Affected parties: loan applicants (most directly affected — approval/denial changes their life trajectory), the company (accuracy affects profitability and default rates), regulators (enforcement obligations), society (systemic fairness norms). Power asymmetry: the company decides; applicants have no visibility into the model. The 15% accuracy improvement means fewer defaults — but also means the model learns historical patterns that may encode discrimination.

*Structural:* Legal framework: Equal Credit Opportunity Act (ECOA) prohibits discrimination on race, color, religion, national origin, sex, marital status, age. Using demographic data directly violates ECOA even if it improves accuracy. Proxy discrimination (using zip code as a proxy for race) is also legally challenged but harder to prove. Enforcement: CFPB audits, disparate impact analysis.

*Inclusivity:* Historical lending data encodes decades of redlining and discriminatory practices. A model trained on this data will learn that certain demographics are "riskier" — but this reflects historical injustice, not individual creditworthiness. The 15% accuracy improvement may be an artifact of the model successfully learning to discriminate. Communities that were historically denied credit will continue to be denied, compounding the disadvantage.

*Sustainability:* If we use demographic data and it becomes public (data breach, regulatory audit, whistleblower), the reputational damage exceeds the financial benefit of 15% accuracy. Regulatory trend: global movement toward algorithmic fairness requirements (EU AI Act, US proposed regulations). Building fairness in now is cheaper than retrofitting later.

*Moral Framework Analysis:*

**Utilitarian:** 15% accuracy improvement reduces defaults → lower costs → potentially lower rates for all borrowers. But: the "all borrowers" benefit is distributed broadly while the harm (denial based on demographics) is concentrated on specific groups. Concentrated harm to vulnerable populations outweighs diffuse benefit to the majority.

**Deontological:** Using demographic data treats applicants as members of groups rather than individuals. This violates the Kantian imperative to treat people as ends in themselves. An applicant should be judged on their individual creditworthiness, not their demographic group's historical patterns.

**Virtue ethics:** A virtuous financial institution would not profit from historical discrimination patterns. The question "what kind of company do we want to be?" has a clear answer: one that makes fair decisions.

**Care ethics:** The relationship between lender and borrower involves a duty of care. Using data that perpetuates disadvantage for already-disadvantaged communities violates this duty.

**Convergence:** All four frameworks reject Option 1 (use all data directly). The convergence is strong — this is not a genuine dilemma.

**Divergence on Options 2 vs. 3:** Utilitarian reasoning supports Option 2 (proxies improve accuracy without direct discrimination). Deontological reasoning supports Option 3 (proxies may still encode protected attributes). This is a genuine tension.

**Logical chain:** Direct use of demographic data violates law and all ethical frameworks (eliminated). Proxies are legally gray and ethically contested. Full rejection of demographic features sacrifices accuracy but ensures fairness. In a regulated industry affecting life outcomes (loans), fairness should dominate accuracy. Therefore → **Option 3 (reject demographic data)** with investment in alternative accuracy improvements (more behavioral data, better feature engineering on non-demographic signals).

### Edge Cases

- **Model without demographic data performs poorly for minority groups.** Without demographic-aware calibration, the model may actually be less fair. *Mitigation:* Use demographic data for fairness auditing (disparate impact testing) but not for prediction. Test model outputs for demographic bias even when demographics aren't inputs.
- **Competitor uses demographic data and wins market share.** *Mitigation:* Regulatory risk is their problem. Position fairness as competitive advantage in marketing ("we evaluate you as an individual"). Regulatory enforcement will eventually level the playing field.
- **"Anonymous" proxies correlate 0.95 with race.** At this correlation level, using the proxy is effectively using the protected attribute. *Mitigation:* Set a decorrelation threshold (e.g., r < 0.3 with any protected attribute) for all features.

### The Deliverable

**Ethical Analysis: Demographic Data in ML Lending Model**

| Framework | Option 1: Use All | Option 2: Proxies Only | Option 3: Reject All |
|-----------|-------------------|----------------------|---------------------|
| Utilitarian | Improves accuracy but concentrates harm | Moderate improvement, diffuse risk | Lower accuracy, equitable treatment |
| Deontological | Violates individual dignity | Potentially violates in practice | Respects individual assessment |
| Virtue ethics | Profits from injustice | Ambiguous intent | Demonstrates fairness commitment |
| Care ethics | Violates duty of care | Partial compliance | Fulfills duty of care |
| Legal | Violates ECOA | Gray area, litigation risk | Compliant |

**Recommendation:** Option 3 — reject demographic data for model training. Invest in:
1. Alternative feature engineering (transaction patterns, payment history depth)
2. Fairness auditing using demographic data (test outcomes, not predictions)
3. Decorrelation analysis for all features (threshold: r < 0.3 with protected attributes)
4. Regular disparate impact testing with published results

**Stakeholder impact:**

| Stakeholder | Impact | Mitigation |
|-------------|--------|-----------|
| Applicants (majority) | Slightly less accurate predictions | Better feature engineering compensates partially |
| Applicants (minority) | More equitable treatment | Primary beneficiary of this decision |
| Company | 15% accuracy loss, lower default prediction | Reduced regulatory risk, brand differentiation |
| Regulators | Compliant model | Proactive transparency builds goodwill |

**What we sacrifice:** 15% accuracy improvement. This means higher default rates (~2-3% estimated), costing approximately $X annually. This is the explicit cost of fairness — and it is worth paying.
</example>

<example>
**Prompt:** ULTRATHINK: Our terms of service update removes users' ability to export their data. How should we handle this?

**Domain detected:** Ethics
**Lenses applied:** Human, Structural, Inclusivity, Sustainability + Moral Framework Analysis

### Deep Reasoning Chain

**Problem:** ToS update removes data export functionality. Must decide how to implement this change ethically. Constraints: 50K active users, some have years of data on the platform, export was previously a documented feature.

**Approaches:**
1. **Proceed with clear communication** — Update ToS, notify users, remove export on effective date
2. **Grandfather existing users** — New users lose export; existing users retain it permanently
3. **Maintain export as paid feature** — Move from free tier to paid, preserving the capability

**Analysis through lenses:**

*Human:* Users who chose this platform partly because of data export feel betrayed. Data portability is increasingly seen as a right, not a feature. Users with years of accumulated data have high switching costs—removing export effectively locks them in. Emotional impact: frustration, distrust, feeling trapped.

*Structural:* Why is export being removed? (Cost? Competitive strategy? Technical complexity?) If cost: quantify and compare to user trust damage. If competitive (lock-in strategy): this is the most ethically problematic motivation. If technical: timeline for re-implementation matters. Legal: GDPR Article 20 grants data portability rights for EU users—this change may violate law for a segment of the user base.

*Inclusivity:* Power users with large datasets are most affected. Casual users may not notice. However, the users who care most about export are often the most valuable (enterprise, power users, advocates). Non-technical users who don't understand export still have a right to their data—they just don't know they're losing something.

*Sustainability:* Removing export creates short-term lock-in but long-term trust erosion. When users discover they can't leave, they warn others. The "enshittification" narrative (platforms degrade after capturing users) will be applied to this change. Precedent: every company that removed data portability faced backlash (see: social media platform export controversies).

*Moral Framework Analysis:*

**Utilitarian:** Removing export saves $X in engineering costs. But: user trust damage, potential churn of high-value users, regulatory fines (GDPR), and negative press have higher expected costs. Net utility is negative.

**Deontological:** Users created data on the platform. It is their data. Removing their ability to access it treats them as means (revenue source) rather than ends (data owners with rights). This violates their autonomy.

**Virtue ethics:** A trustworthy company does not trap its users. The question "would we be proud to explain this decision publicly?" has a clear answer: no.

**Care ethics:** The company-user relationship involves an implicit promise: "your data is yours." Breaking this promise damages the relationship of care.

**Convergence:** All frameworks reject Option 1 (remove without mitigation). Strong convergence—this is not a genuine dilemma.

**Divergence on Options 2 vs. 3:** Grandfathering (Option 2) creates a two-tier system that's complex to maintain. Paid export (Option 3) commodifies a right but preserves access. Both are ethically superior to removal.

**Logical chain:** All frameworks reject outright removal. GDPR may legally prohibit it for EU users regardless. Grandfathering creates technical complexity and a precedent of tiered rights. Paid export maintains access while addressing cost concerns. But: charging for access to one's own data feels wrong (deontological objection). Therefore → **Don't remove export.** If cost is the issue, optimize the implementation. If competitive lock-in is the motivation, find another strategy—data portability is a user right, not a feature.

### Edge Cases

- **Company genuinely can't afford to maintain export.** *Mitigation:* Offer a 6-month sunset period with unlimited exports, then provide a manual request process (slower but available). Never fully remove access to user data.
- **Export enables competitors to poach users.** This is the real motivation for most export removal. *Mitigation:* Compete on value, not lock-in. Users who would leave already want to—removing export just makes them angry AND trapped.
- **GDPR creates a legal obligation but only for EU users.** *Mitigation:* Apply the same standard globally. Maintaining two systems (export for EU, no export for others) is more expensive than just keeping export. And it's the right thing to do.

### The Deliverable

**Ethical Analysis: Data Export Removal**

**Recommendation:** Do not remove data export.

| Motivation for Removal | Ethical Assessment | Alternative |
|-----------------------|-------------------|-------------|
| Engineering cost | Legitimate concern | Optimize export (batch processing, scheduled exports instead of real-time) |
| Competitive lock-in | Ethically unacceptable | Compete on product value, not switching costs |
| Technical complexity | Legitimate concern | Simplify format (CSV instead of full API), accept slower processing |
| Abuse prevention | Legitimate concern | Rate limit exports, require authentication, audit trail |

**If removal is truly unavoidable:**
1. 90-day advance notice to all users
2. Unlimited exports during the notice period
3. Post-removal: manual export request via support (slower, not eliminated)
4. Grandfather existing users for minimum 12 months
5. Published timeline for export restoration

**Communication framework:**
- Lead with honesty: "We're making a change that affects how you access your data."
- Explain why: the real reason, not a corporate euphemism
- State what you're doing to mitigate: specific timelines and alternatives
- Invite feedback: give users a channel to express concerns before the change takes effect

**What we sacrifice by keeping export:** Engineering resources (~$X/year estimated). What we preserve: user trust, GDPR compliance, brand integrity, and the ability to say "your data is always yours."
</example>
