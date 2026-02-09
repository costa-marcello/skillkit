# Sources and Bibliography

<!-- v1.0 | 2026-01-29 -->

Official documentation and peer-reviewed research used to develop review criteria.

---

## Official Vendor Documentation

### Anthropic (Claude)

| Resource | URL |
|----------|-----|
| Prompt Engineering Overview | https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview |
| Use XML Tags | https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/use-xml-tags |
| Multishot Prompting (Examples) | https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/multishot-prompting |
| Chain of Thought | https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/chain-of-thought |
| Claude 4 Best Practices | https://docs.anthropic.com/en/build-with-claude/prompt-engineering/claude-4-best-practices |
| Claude Code Best Practices | https://www.anthropic.com/engineering/claude-code-best-practices |
| Skill Best Practices | https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices |

### OpenAI

| Resource | URL |
|----------|-----|
| Prompt Engineering Guide | https://platform.openai.com/docs/guides/prompt-engineering |
| GPT-4.1 Prompting Guide | https://cookbook.openai.com/examples/gpt4-1_prompting_guide |
| Function Calling | https://platform.openai.com/docs/guides/function-calling |
| Reasoning Best Practices | https://platform.openai.com/docs/guides/reasoning-best-practices |

### Google (Gemini)

| Resource | URL |
|----------|-----|
| Prompt Design Strategies | https://ai.google.dev/gemini-api/docs/prompting-strategies |
| Gemini 3 Developer Guide | https://ai.google.dev/gemini-api/docs/gemini-3 |
| Prompt Engineering Whitepaper | https://www.kaggle.com/whitepaper-prompt-engineering |

### Microsoft (Azure)

| Resource | URL |
|----------|-----|
| Prompt Engineering Techniques | https://learn.microsoft.com/en-us/azure/ai-foundry/openai/concepts/prompt-engineering |
| System Message Design | https://learn.microsoft.com/en-us/azure/ai-foundry/openai/concepts/advanced-prompt-engineering |
| Safety System Messages | https://learn.microsoft.com/en-us/azure/ai-foundry/openai/concepts/system-message |

---

## Academic Papers

### Foundational (NeurIPS, EMNLP, ACL)

| Paper | Citation | Key Finding |
|-------|----------|-------------|
| Chain-of-Thought Prompting | Wei et al., NeurIPS 2022 | Intermediate reasoning improves complex tasks |
| Zero-Shot Reasoners | Kojima et al., NeurIPS 2022 | "Let's think step by step" boosts accuracy |
| Rethinking Demonstrations | Min et al., EMNLP 2022 | Format matters more than label correctness |
| Fantastically Ordered Prompts | Lu et al., ACL 2022 | Example order affects performance significantly |

### ArXiv (2024-2026)

| Paper | ArXiv ID | Key Finding |
|-------|----------|-------------|
| The Prompt Report | 2406.06608 | 58 prompting techniques catalogued |
| Prompt Format Impact | 2411.10541 | Format can vary performance by 40% |
| Prompt Defect Taxonomy | 2509.14404 | 6 defect categories identified |
| Few-shot Dilemma | 2509.13196 | Performance degrades beyond ~20 examples |
| Prompting Inversion | 2510.22251 | Advanced techniques hurt newer models |
| Many-Shot ICL | 2404.11018 | Hundreds of examples can help complex tasks |

---

## Benchmarks and Frameworks

| Resource | URL | Use |
|----------|-----|-----|
| Stanford HELM | https://crfm.stanford.edu/helm/ | Holistic LLM evaluation |
| IFEval | arXiv:2311.07911 | Instruction-following benchmark |
| InFoBench | arXiv:2401.03601 | Decomposed requirements following |
| DeepEval | https://github.com/confident-ai/deepeval | LLM output testing framework |

---

## Security References

| Resource | URL |
|----------|-----|
| OWASP LLM Top 10 2025 | https://genai.owasp.org/llmrisk/ |
| Prompt Injection Prevention | https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html |

---

## How to Cite

When referencing these sources in reviews:

```markdown
**Source**: [Anthropic Prompt Engineering](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview)

**Research**: arXiv:2411.10541 - Format can vary performance by 40%
```
