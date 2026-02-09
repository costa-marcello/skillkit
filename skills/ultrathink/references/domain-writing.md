# Domain: Writing

**Sections:** Universal Lens Interpretation · Augmentation Lens: Aesthetic Judgment · Domain Evaluation Criteria · Examples

## Universal Lens Interpretation

How the 4 universal lenses apply to writing:

### Human
- Reader sentiment and emotional state: are they skeptical, curious, hostile, bored?
- Reading level appropriateness: match the audience (executive summary vs. technical deep-dive)
- Attention span assumptions: how much goodwill does the reader bring?
- Motivation to continue: why should they care past the first paragraph?

### Structural
- Argument flow: does each paragraph earn the next? Is there a logical chain?
- Evidence placement and density: claims supported before or after assertion?
- Sentence rhythm variation: long/short alternation prevents monotony
- Structural completeness: intro-body-conclusion or appropriate alternative (inverted pyramid, narrative arc)
- Paragraph-level logic: each paragraph has one job

### Inclusivity
- Jargon barriers: technical terms used without explanation exclude non-specialists
- Cultural assumptions in metaphors and examples: sports metaphors, Western-centric references
- Reading level accessibility: Flesch-Kincaid score appropriate for audience
- Bias in language choices: gendered language, ableist metaphors, loaded terms
- Representation in examples: whose stories are told?

### Sustainability
- Updatability: can this piece be refreshed without rewriting from scratch?
- Voice consistency: does this fit a series or publication's editorial standards?
- Argument durability: tied to a specific moment or timeless?
- Editorial workflow fit: can editors work with this structure?

## Augmentation Lens: Aesthetic Judgment

Evaluates whether the prose has craft—rhythm, surprise, voice, and resonance. The universal lenses assess function; this lens assesses art. Writing that is structurally sound but aesthetically flat fails to move or persuade.

### Evaluation Criteria
- Does the prose have rhythm, surprise, and voice—or does it read like a committee wrote it?
- Are sentences varied in length and structure (not all subject-verb-object)?
- Does the opening earn the reader's attention within 2 sentences?

### Guiding Questions
- Does the ending land with resonance (not just trail off)?
- Is there a signature move—a recurring technique that makes this writer recognizable?
- Read it aloud: does it flow without stumbling?

## Domain Evaluation Criteria

Beyond the universal quality gate, verify for this domain:
- [ ] Voice is consistent and distinctive (not generic AI prose)?
- [ ] Every paragraph advances the argument or narrative?
- [ ] Opening hooks within 2 sentences?
- [ ] Read aloud test: prose flows without stumbling?

## Examples

<example>
**Prompt:** ULTRATHINK: This blog post about remote work meanders and loses the reader at paragraph 4. Help me restructure it.

**Domain detected:** Writing
**Lenses applied:** Human, Structural, Inclusivity, Sustainability + Aesthetic Judgment

### Deep Reasoning Chain

**Problem:** Blog post loses reader engagement at paragraph 4. Must diagnose the structural failure and restructure without losing the author's voice. Constraints: existing content has good insights but poor organization; target audience is tech managers.

**Approaches:**
1. **Inverted pyramid** — Lead with the strongest conclusion, supporting evidence follows in descending importance
2. **Problem-solution-evidence** — Open with the pain point readers recognize, present the solution, then prove it works
3. **Narrative arc** — Tension (the problem), rising action (failed approaches), climax (the insight), resolution (the solution)

**Analysis through lenses:**

*Human:* Tech managers are time-poor. They'll give you 30 seconds before deciding to continue or close the tab. Paragraph 4 likely fails because the first 3 paragraphs are throat-clearing (background, definitions, "remote work is growing").

*Structural:* Diagnosis: paragraphs 1-3 are setup without stakes. Paragraph 4 introduces the actual argument but the reader has already lost trust. The evidence (which is strong) is buried in paragraphs 6-8 where few readers reach.

*Inclusivity:* Remote work advice often assumes US tech company context. If the audience is global, examples should include non-US work cultures. Avoid assuming everyone has a home office.

*Sustainability:* The inverted pyramid ages best—conclusions stay relevant even as supporting data updates. Narrative arc is engaging but harder to update without rewriting.

*Aesthetic Judgment:* Current draft opens with "Remote work has become increasingly common in recent years"—a sentence so generic it could start any of 10,000 blog posts. The author's actual voice emerges in paragraph 5 with a sharp observation about meeting culture. That voice should surface immediately.

**Logical chain:** Reader drops at paragraph 4 because paragraphs 1-3 are setup without payoff. Move the paragraph 5 insight to the opening (it's the sharpest sentence). Use problem-solution-evidence structure because the audience wants actionable advice, not narrative. Therefore → **Problem-solution-evidence** with the paragraph 5 insight as the hook.

### Edge Cases

- **Author resists restructuring:** They're attached to the chronological setup. *Mitigation:* Show the engagement data (paragraph 4 drop-off) and offer a compromise: keep one sentence of context, then jump to the hook.
- **Multiple audiences:** Post is shared with both managers and individual contributors. *Mitigation:* Lead with the manager pain point (their primary audience), add a callout box for IC perspective.
- **SEO vs. readability:** Inverted pyramid front-loads keywords but can feel robotic. *Mitigation:* Write for humans first; adjust keyword placement in editing pass without compromising flow.

### The Deliverable

**Restructured outline with editorial annotations:**

**Paragraph 1 (Hook + Problem):** Open with the sharp observation from original paragraph 5: "The most productive remote teams I've studied have one thing in common: they've abolished the status meeting." This is specific, surprising, and stakes-setting. *(Editorial note: this sentence works because it makes a falsifiable claim—the reader wants to know if it's true.)*

**Paragraph 2 (Why this matters):** One paragraph of context—not "remote work is growing" but "your team is losing 11 hours/week to meetings that could be async." Quantify the pain. *(Editorial note: numbers create urgency that adjectives cannot.)*

**Paragraph 3-5 (The Solution):** Three concrete practices, each in its own paragraph. Each follows the pattern: practice → evidence → implementation tip. *(Editorial note: one idea per paragraph; if you need two paragraphs for one practice, the practice needs simplifying.)*

**Paragraph 6 (Objection handling):** "But what about team culture?" Address the strongest counterargument directly. *(Editorial note: acknowledging objections builds trust; ignoring them breeds skepticism.)*

**Paragraph 7 (Close):** Return to the opening image—the team without status meetings—and show the result. End on a concrete action the reader can take Monday morning. *(Editorial note: the ending should echo the opening, creating a sense of completeness.)*
</example>

<example>
**Prompt:** ULTRATHINK: Write a persuasive executive summary for this quarterly report — the board is skeptical about our Q3 numbers.

**Domain detected:** Writing
**Lenses applied:** Human, Structural, Inclusivity, Sustainability + Aesthetic Judgment

### Deep Reasoning Chain

**Problem:** Executive summary for Q3 report aimed at a skeptical board. Must present disappointing numbers honestly while maintaining confidence in the strategy. Constraints: board has seen two mediocre quarters; credibility is at stake.

**Approaches:**
1. **Data-forward** — Lead with the metrics, contextualize immediately, then pivot to forward indicators
2. **Narrative-forward** — Lead with the strategic story ("Here's what we learned"), weave numbers into the narrative
3. **Comparison-forward** — Lead with competitor/market context ("The market contracted 12%; we contracted 8%"), then present relative performance

**Analysis through lenses:**

*Human:* Board members are skeptical, not hostile—they want to be convinced. Leading with excuses triggers resistance. Leading with raw bad numbers without context triggers panic. The sweet spot: acknowledge reality, then reframe with new information they don't have.

*Structural:* Executive summary must fit one page. Structure: situation (2 sentences), results (3-4 key metrics with context), forward indicators (leading metrics that predict recovery), ask (what you need from the board).

*Inclusivity:* Board members have varied financial literacy. CFO reads the numbers; non-financial directors need narrative. Layer the information: headline metric → context sentence → supporting data in parentheses.

*Sustainability:* The framing chosen here sets expectations for Q4. Over-promising now creates a credibility crisis next quarter. Under-promising wastes the opportunity to maintain board confidence.

*Aesthetic Judgment:* Executive summaries that read like dashboards get skimmed. One strong opening sentence can change how the entire page is read. "Q3 revenue fell 8% against plan—and this is the quarter that proved our pivot is working" is a sentence that earns the next paragraph.

**Logical chain:** Board is skeptical → data-forward builds trust (no spin perception). But raw numbers without context confirm their fears. Comparison-forward reframes the narrative without feeling evasive. Therefore → **Comparison-forward**, opening with market context, then pivoting to leading indicators that predict Q4 recovery.

### Edge Cases

- **Board member asks "why should we believe Q4 will be different?"** *Mitigation:* Include 2-3 leading indicators (pipeline value, trial conversions, logo wins) that are already measurable, not projected.
- **Numbers look worse with market context** (competitors grew while we shrank). *Mitigation:* Shift from market comparison to cohort analysis—show that recent customer cohorts have better retention/expansion than older ones.
- **Summary gets forwarded to investors without the full report.** *Mitigation:* Write it to stand alone—every claim has its supporting data point in the same paragraph.

### The Deliverable

**Executive Summary — Q3 FY26**

The enterprise SaaS market contracted 12% in Q3 as procurement cycles lengthened across our ICP. Against that backdrop, our revenue declined 8% against plan—outperforming the market by 4 points while completing a strategic pivot that positions us for accelerated Q4 growth.

**Key results:**
- **Revenue:** $4.2M (8% below plan, 4% above market decline rate)
- **Net retention:** 108% → 112%, driven by expansion in accounts onboarded to the new platform (vs. 94% retention on legacy)
- **Pipeline:** $18.2M qualified pipeline (+22% QoQ), with 40% from the new product line launched in August

**What changed:** Q3 was the first full quarter on the new pricing model. Early indicators confirm the thesis: average deal size increased 35% while sales cycle shortened by 12 days. The revenue miss reflects the transition trough—deals that started on old pricing but closed on new—not a demand problem.

**Forward indicators:**
- Trial-to-paid conversion: 18% → 24% (August cohort vs. June cohort)
- Logo wins in Q3: 14 new enterprise accounts (vs. 9 in Q2), including [notable brand]
- Q4 committed pipeline: $7.8M (93% of Q4 target already in late-stage)

**Ask:** Maintain current investment level through Q4. The leading indicators support our plan; reducing spend now would sacrifice the compounding effect of the platform transition during its highest-leverage quarter.

*(Editorial annotations: The opening sentence does three things simultaneously—establishes market context, presents our number, and reframes it. "Transition trough" names the phenomenon, making it a known pattern rather than a failure. The ask is one sentence because certainty is conveyed through brevity.)*
</example>
