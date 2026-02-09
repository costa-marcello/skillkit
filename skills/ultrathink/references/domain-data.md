# Domain: Data

**Sections:** Universal Lens Interpretation · Augmentation Lens: Statistical Validity · Domain Evaluation Criteria · Examples

## Universal Lens Interpretation

How the 4 universal lenses apply to data analysis:

### Human
- Who consumes this analysis and what decisions will they make based on it?
- Are visualizations interpretable by the intended audience (executives vs. analysts)?
- What biases might the consumer bring? (confirmation bias toward expected results)
- Can the key insight be stated in one sentence?

### Structural
- Data pipeline architecture: source -> transform -> load -> analyze -> present
- Computation cost: can this run on schedule or does it require optimization?
- Storage requirements: hot vs. cold storage, retention policies
- Latency constraints: real-time, near-real-time, batch?
- Schema design: normalization vs. denormalization tradeoffs
- Data lineage: can you trace any output back to its source?

### Inclusivity
- Representation in the dataset: who is underrepresented or missing entirely?
- Accessibility of visualizations: color blindness, screen reader compatibility
- Jargon in reporting: can non-technical stakeholders understand the findings?
- Assumptions baked into the model: does the training data encode historical biases?

### Sustainability
- Pipeline maintainability: can someone else debug this in 6 months?
- Schema evolution strategy: how do you handle breaking changes?
- Data freshness requirements: what happens when data is stale?
- Documentation: is there a data dictionary? Are transformations documented?
- Monitoring and alerting: how do you know when the pipeline breaks?

## Augmentation Lens: Statistical Validity

Evaluates whether the quantitative claims are honest and methodologically sound. Data analysis is uniquely vulnerable to statistical misuse---this lens applies mathematical skepticism to prevent misleading conclusions.

### Evaluation Criteria
- Is the sample size sufficient for the claimed effect?
- Are statistical tests appropriate for the data type and distribution?
- Is correlation being presented as causation?

### Guiding Questions
- What is the confidence interval, not just the point estimate?
- Is the visualization honest? (axis scales, cherry-picked timeframes, missing context)
- Base rate: is the finding surprising given priors, or expected?

## Domain Evaluation Criteria

Beyond the universal quality gate, verify for this domain:
- [ ] Statistical tests appropriate for data type and distribution?
- [ ] Confidence intervals and effect sizes reported (not just p-values)?
- [ ] Visualizations accessible and honest (no misleading scales)?
- [ ] Data provenance and quality documented?

## Examples

<example>
**Prompt:** ULTRATHINK: Our A/B test shows 3% conversion uplift with p=0.04. Should we ship?

**Domain detected:** Data
**Lenses applied:** Human, Structural, Inclusivity, Sustainability + Statistical Validity

### Deep Reasoning Chain

**Problem:** A/B test result evaluation. 3% relative conversion uplift, p=0.04. Must determine whether to ship the variant. Constraints: e-commerce checkout flow, 14-day test, ~50K visitors per group.

**Approaches:**
1. **Ship immediately** --- Result is statistically significant (p < 0.05), implement the winner
2. **Extend the test** --- Run for another 2 weeks to increase confidence and observe weekly cycles
3. **Segment analysis before deciding** --- Break down by device, geography, and traffic source before shipping globally

**Analysis through lenses:**

*Human:* Product team is eager to ship (2 months of work on this variant). Decision-maker (VP Product) will see "statistically significant" and want to proceed. However, a 3% relative uplift on a 5% baseline conversion means going from 5.00% to 5.15%---is that business-meaningful even if statistically significant?

*Structural:* 50K visitors per group x 14 days. Baseline conversion ~5%. Expected conversions: ~2,500 per group. Effect size: 0.15 percentage points absolute (3% relative). At this sample size, the minimum detectable effect is approximately 0.5 percentage points---the detected effect (0.15 pp) is below MDE, suggesting the test was underpowered for this effect size.

*Inclusivity:* Overall result may mask segment-level differences. If the variant improves conversion for desktop users (+8%) but hurts mobile users (-2%), the blended result is positive but ships a degradation to 60% of traffic. Always check segments before shipping.

*Sustainability:* If we ship based on weak evidence and the effect isn't real, we've introduced an unvalidated change to the checkout flow. If we don't ship and the effect is real, we lose ~$X/month. The cost of extending the test (2 more weeks) is known; the cost of shipping a false positive is ongoing.

*Statistical Validity:* p=0.04 is barely below 0.05. With multiple metrics tracked (likely: conversion, revenue, bounce rate, time-on-page), the family-wise error rate inflates. If 5 metrics were tested, the Bonferroni-adjusted threshold is 0.01, and this result is not significant. Additionally: the 14-day window may not capture full weekly cycles (users who browse on weekends and buy on weekdays). The confidence interval on a 0.15pp effect likely spans from near-zero to ~0.30pp---the true effect could be negligible.

**Logical chain:** p=0.04 with likely multiple comparisons -> actual significance questionable. Effect size (0.15pp) below MDE -> test underpowered for this effect. 14-day window -> possible weekly cycle artifact. Therefore -> **Extend the test (Option 2)** for 2 more weeks to capture full weekly cycles, pre-register the single primary metric, and require p < 0.01.

### Edge Cases

- **Stakeholder pressure to ship now.** *Mitigation:* Present the confidence interval, not just p-value. "We're 95% confident the true effect is between 0.01% and 0.29%. Are you comfortable shipping a change that might have zero impact?"
- **Novelty effect.** Early test period shows inflated engagement because the variant is new, not better. *Mitigation:* Compare week 1 vs. week 2 conversion rates within the variant. If declining, novelty effect is likely.
- **The test is already "peeked at"** (someone checked results multiple times before the planned end date). *Mitigation:* Use sequential testing framework (like CUPED or always-valid p-values) that accounts for peeking. If not already using one, the current p-value is likely inflated.

### The Deliverable

**A/B Test Interpretation Report:**

| Metric | Control | Variant | Difference | 95% CI | p-value |
|--------|---------|---------|-----------|--------|---------|
| Conversion rate | 5.00% | 5.15% | +0.15pp | [0.01, 0.29] | 0.04 |

**Assessment:** Inconclusive. Do not ship.

**Reasons:**
1. **Effect size below MDE:** The test was powered to detect >=0.5pp differences. The observed 0.15pp effect is below the detection threshold---the result could be noise.
2. **Multiple comparisons:** If other metrics were tested alongside conversion, the adjusted significance threshold (~0.01) is not met.
3. **Narrow confidence interval spans near-zero:** The true effect could plausibly be 0.01pp (negligible) or 0.29pp (meaningful). We don't have enough precision.
4. **14-day duration:** Does not capture monthly billing cycles or full behavioral patterns.

**Recommendation:**
- Extend test to 28 days (captures 2 full weekly cycles)
- Pre-register conversion rate as the single primary metric
- Set decision threshold at p < 0.01 to account for prior peeking risk
- Run segment analysis (device, geography, new vs. returning) at test end
- If extended test confirms p < 0.01 with effect > 0.3pp: ship
- If extended test shows p > 0.01 or effect < 0.3pp: archive as learning
</example>

<example>
**Prompt:** ULTRATHINK: Design a data pipeline for real-time user behavior analytics.

**Domain detected:** Data
**Lenses applied:** Human, Structural, Inclusivity, Sustainability + Statistical Validity

### Deep Reasoning Chain

**Problem:** Design a data pipeline for real-time user behavior analytics. Must support dashboards, alerting, and ad-hoc analysis. Constraints: SaaS product with ~100K DAU, budget-conscious (startup), team has 2 data engineers.

**Approaches:**
1. **Batch ETL with hourly refresh** --- Traditional warehouse approach (extract, transform, load on schedule)
2. **Streaming pipeline** --- Event streaming (Kafka) -> stream processing (Flink/Spark Streaming) -> real-time store
3. **Hybrid** --- Stream for key metrics (latency-sensitive dashboards, alerts), batch for deep analysis (retention, cohorts, funnels)

**Analysis through lenses:**

*Human:* Product managers want real-time dashboards ("what's happening right now"). Data analysts want flexible query capabilities (ad-hoc SQL). These are different use cases with different latency requirements. Real-time is needed for: active users, error rates, feature adoption spikes. Batch is fine for: retention analysis, funnel conversion, cohort comparison.

*Structural:* 100K DAU x ~50 events/user/day = 5M events/day (~60 events/second average, ~300/second peak). This is modest scale---even a single Kafka broker handles this. Full streaming adds operational complexity (Kafka cluster, stream processing, schema registry, dead letter queues). Batch ETL at this scale runs in minutes, not hours.

*Inclusivity:* Dashboard consumers range from technical (can write SQL) to non-technical (need pre-built views). Self-serve analytics should support both. Event schema should be documented with a data dictionary accessible to non-engineers. Alerting thresholds should not be set only by engineers---product and support teams need input.

*Sustainability:* At 2 data engineers, operational complexity is the primary constraint. Kafka + Flink is 2-3 systems to operate. Managed services (Confluent, AWS Kinesis) reduce ops burden but increase cost. Batch ETL is operationally simple but doesn't grow into real-time needs. Hybrid is the most future-proof---batch foundation that incrementally adds streaming for specific use cases.

*Statistical Validity:* Real-time dashboards are prone to misinterpretation: small sample sizes in short time windows create volatile metrics. A "conversion drop" in the last hour might be 100 visitors---noise, not signal. Dashboards need: (a) sample size indicators, (b) confidence bands on real-time metrics, (c) comparison to historical baseline (same hour last week). Without these, stakeholders will chase noise.

**Logical chain:** Full streaming is over-engineered for 60 events/second and a 2-person team. Batch-only doesn't satisfy the "what's happening now" requirement. Hybrid balances real-time visibility with operational simplicity. At this scale, the "streaming" component can be as simple as a 1-minute micro-batch rather than true event streaming. Therefore -> **Hybrid (Option 3)** with batch as the foundation and micro-batch (not full streaming) for latency-sensitive metrics.

### Edge Cases

- **Traffic spike (10x during product launch).** *Mitigation:* Event ingestion buffer (even a simple queue) absorbs spikes. Batch processing scales linearly. Set auto-scaling on ingestion layer.
- **Schema change breaks downstream.** *Mitigation:* Schema registry (even a simple JSON Schema file) with backward compatibility enforcement. Version all events. Never remove fields; deprecate and add new ones.
- **Dashboard shows misleading real-time metric.** *Mitigation:* All real-time metrics include: (a) sample size, (b) comparison to 7-day average, (c) confidence indicator (green/yellow/red based on sample sufficiency).

### The Deliverable

**Architecture Recommendation:**

```
[Client SDK] -> [Event API] -> [Event Queue] -> [Batch ETL] -> [Data Warehouse]
                                    |
                            [Micro-batch (1min)] -> [Real-time Store] -> [Dashboards]
```

**Component selection:**

| Component | Recommendation | Why |
|-----------|---------------|-----|
| Event ingestion | API Gateway + SQS | Managed, scales automatically, no ops burden |
| Event queue | SQS (standard) | Sufficient for 300/sec peak; no Kafka ops overhead |
| Batch ETL | dbt + scheduled SQL | Team knows SQL; dbt is declarative and testable |
| Data warehouse | BigQuery or Snowflake | Managed, supports ad-hoc SQL, separates storage/compute |
| Micro-batch | Materialized views (1-min refresh) | No additional infrastructure; warehouse handles it |
| Real-time dashboards | Preset (Superset) or Metabase | Open source, SQL-native, supports both batch and live queries |

**Cost estimate:** ~$500-800/month at current scale (managed services, no dedicated infrastructure).

**Scaling triggers:**
- If events exceed 1,000/second: consider Kafka for ingestion (but still batch for processing)
- If real-time latency <10 seconds required: add dedicated stream processor
- If team grows to 5+ data engineers: evaluate full streaming architecture
</example>
