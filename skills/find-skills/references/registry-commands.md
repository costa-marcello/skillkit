# Registry Commands Reference

Full command reference for both skill registries.

---

## Open Ecosystem (`npx skills`)

```bash
npx skills find [query]           # Search for skills
npx skills add <package> -g -y    # Install globally
npx skills check                  # Check installed skills and updates
npx skills update                 # Update all installed skills
npx skills init <name>            # Create a new skill scaffold
npx skills remove <package>       # Remove an installed skill
```

**Package format:** `<owner/repo@skill-name>` (e.g., `vercel-labs/agent-skills@vercel-react-best-practices`)

**Browse:** https://skills.sh/

---

## CCPM (`ccpm`)

```bash
ccpm search <query>                  # Search for skills
ccpm install <skill-name>            # Install globally
ccpm install <skill-name> --project  # Install to current project only
ccpm info <skill-name>               # Get skill details before installing
ccpm list                            # List installed skills
ccpm uninstall <skill-name>          # Remove a skill
ccpm update                          # Update all installed skills
```

**Browse:** https://ccpm.dev

**Post-install:** Restart Claude Code after CCPM installs. CCPM skills load at startup.

---

## Common Skill Categories

Use these keywords when searching either registry:

| Category | Search Terms |
|----------|-------------|
| Web Development | react, nextjs, typescript, css, tailwind, vue, svelte |
| Testing | testing, jest, playwright, e2e, vitest, cypress |
| DevOps | deploy, docker, kubernetes, ci-cd, terraform, aws |
| Documentation | docs, readme, changelog, api-docs, jsdoc |
| Code Quality | review, lint, refactor, best-practices, eslint |
| Design | ui, ux, design-system, accessibility, shadcn |
| Productivity | workflow, automation, git, monorepo |
| Data & AI | data, ml, embeddings, vector, analysis |
