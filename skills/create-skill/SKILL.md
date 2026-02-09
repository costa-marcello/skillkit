---
name: create-skill
description: "Guides users through creating effective Claude Code skills with specialized knowledge, workflows, and tool integrations. Use when users want to create a new skill, update an existing skill, extract business logic into reusable packages, or ask about skill structure, frontmatter, or bundled resources."
license: Complete terms in LICENSE.txt
context: fork
argument-hint: "[skill description or name]"
---

# Skill Creator

<context>

## About Skills

Skills extend Claude's capabilities with specialized workflows, tool integrations, domain expertise, and bundled resources. See `references/skill_anatomy.md` for detailed structure.

**Key structure:** `SKILL.md` (required) + optional `scripts/`, `references/`, `assets/` directories.

##### YAML Frontmatter Reference

See `references/frontmatter_reference.md` for the complete field reference table. Key fields:

- **`name`**: Lowercase, hyphens only (max 64 chars)
- **`description`**: Third-person verb + triggers (max 1024 chars)
- **`context: fork`**: Required for task-based skills needing subagent access

Use `context: fork` when the skill performs multi-step autonomous tasks, should be available to subagents, or needs isolated context.

<example>
**Example: Task-based skill with subagent execution:**
```yaml
---
name: deep-research
description: Research a topic thoroughly using multiple sources
context: fork
agent: Explore
---

Research $ARGUMENTS thoroughly:
1. Find relevant files using Glob and Grep
2. Read and analyze the code
3. Summarize findings with specific file references
```
When invoked as `/deep-research authentication flow`, `$ARGUMENTS` becomes `authentication flow`.
</example>

<example>
**Example: Reference skill that runs inline:**
```yaml
---
name: api-conventions
description: API design patterns for this codebase
---

When writing API endpoints:
- Use RESTful naming conventions
- Return consistent error formats
```
</example>

##### Invocation Control

| Frontmatter | You can invoke | Claude can invoke | Subagents can use |
|-------------|----------------|-------------------|-------------------|
| (default) | Yes | Yes | No (runs inline) |
| `context: fork` | Yes | Yes | Yes |
| `disable-model-invocation: true` | Yes | No | No |
| `context: fork` + `disable-model-invocation: true` | Yes | No | Yes (when explicitly delegated) |

#### Bundled Resources (optional)

See `references/bundled_resources.md` for detailed guidance. Summary:

- **`scripts/`**: Executable code for deterministic or frequently-rewritten tasks
- **`references/`**: Documentation loaded on-demand (schemas, policies, guides)
- **`assets/`**: Output files (templates, images, fonts) not loaded into context

**CRITICAL** (for public distribution): No absolute paths, personal info, or version numbers in SKILL.md. Use relative paths only.

### Progressive Disclosure

Three-level loading: metadata (always) → SKILL.md (on trigger) → bundled resources (on demand). See `references/skill_anatomy.md` for details.

### Skill Creation Best Practices

Read `references/anthropic_best_practices_summary.md` before creating or updating skills. This summarizes Anthropic's official guidance on conciseness, degrees of freedom, description writing, and progressive disclosure.

For complete official documentation: [Anthropic Best Practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)

</context>

## CRITICAL: Edit Skills at Source Location

**NEVER edit skills in `~/.claude/plugins/cache/`** — changes there are lost on cache refresh. Before any edit, confirm the file path does NOT contain `/cache/` or `/plugins/cache/`. Always edit the source repository copy.

## Skill Creation Process

<instructions>

**User input:** $ARGUMENTS

If `$ARGUMENTS` is non-empty, treat it as the user's skill request. Extract the skill name, purpose, and any details provided. Skip Step 1 and proceed directly to Step 2 using the information given. Only ask clarifying questions if critical details are genuinely missing (e.g., no indication of what the skill should do at all).

If `$ARGUMENTS` is empty, begin at Step 1.

To create a skill, follow the "Skill Creation Process" in order, skipping steps only if there is a clear reason why they are not applicable.

### Step 1: Understanding the Skill with Concrete Examples

**Skip this step when:** the user has already described what the skill should do (via arguments or prior context).

When the skill's usage patterns are not yet clear, gather concrete examples of how it will be used. Start with the most important question and follow up as needed:

- "What functionality should the skill support?"
- "Can you give examples of how it would be used?"
- "What would a user say that should trigger this skill?"

Conclude this step when there is a clear sense of the functionality the skill should support.

### Step 2: Planning the Reusable Skill Contents

To turn concrete examples into an effective skill, analyze each example by:

1. Considering how to execute on the example from scratch
2. Determining the appropriate level of freedom for Claude
3. Identifying what scripts, references, and assets would be helpful when executing these workflows repeatedly

**Match specificity to task risk:**
- **High freedom (text instructions)**: Multiple valid approaches exist; context determines best path (e.g., code reviews, troubleshooting, content analysis)
- **Medium freedom (pseudocode with parameters)**: Preferred patterns exist with acceptable variation (e.g., API integration patterns, data processing workflows)
- **Low freedom (exact scripts)**: Operations are fragile, consistency critical, sequence matters (e.g., PDF rotation, database migrations, form validation)

See `references/planning_examples.md` for detailed examples (pdf-editor, frontend-webapp-builder, big-query skills).

Analyze each concrete example to create a list of reusable resources: scripts, references, and assets.

### Step 3: Initializing the Skill

At this point, it is time to actually create the skill.

Skip this step only if the skill being developed already exists, and iteration or packaging is needed. In this case, continue to the next step.

When creating a new skill from scratch, run `init_skill.py` to generate a complete template:

```bash
python3 scripts/init_skill.py <skill-name> --path <output-directory>
```

The script creates a skill directory with SKILL.md, frontmatter, resource directories, and example files. Customize or remove the generated files as needed.

### Step 4: Edit the Skill

When editing the (newly-generated or existing) skill, remember that the skill is being created for another instance of Claude to use. Focus on including information that would be beneficial and non-obvious to Claude. Consider what procedural knowledge, domain-specific details, or reusable assets would help another Claude instance execute these tasks more effectively.

#### Start with Reusable Skill Contents

To begin implementation, start with the reusable resources identified above: `scripts/`, `references/`, and `assets/` files. Note that this step may require user input. For example, when implementing a `brand-guidelines` skill, the user may need to provide brand assets or templates to store in `assets/`, or documentation to store in `references/`.

Also, delete any example files and directories not needed for the skill. The initialization script creates example files in `scripts/`, `references/`, and `assets/` to demonstrate structure, but most skills won't need all of them.

**When updating an existing skill**: Scan all existing reference files to check if they need corresponding updates. New features often require updates to architecture, workflow, or other existing documentation to maintain consistency.

#### Reference File Naming

Filenames must be self-explanatory without reading contents.

**Pattern**: `<content-type>_<specificity>.md`

**Examples**:
- ❌ `commands.md`, `cli_usage.md`, `reference.md`
- ✅ `script_parameters.md`, `api_endpoints.md`, `database_schema.md`

**Test**: Can someone understand the file's contents from the name alone?

#### Update SKILL.md

**Writing Style:** Write the entire skill using **imperative/infinitive form** (verb-first instructions), not second person. Use objective, instructional language (e.g., "To accomplish X, do Y" rather than "You should do X" or "If you need to do X"). This maintains consistency and clarity for AI consumption.

To complete SKILL.md, answer the following questions:

1. What is the purpose of the skill, in a few sentences?
2. When should the skill be used?
3. In practice, how should Claude use the skill? All reusable skill contents developed above should be referenced so that Claude knows how to use them.

**Use `<example>` blocks** around concrete examples to help Claude distinguish examples from instructions.

#### Consistency Verification

Before finalizing, verify no contradictions exist within SKILL.md, between SKILL.md and reference files, or in terminology (e.g., mixing "user" and "customer" inconsistently).

### Step 5: Sanitization Review (Optional)

**Ask the user before executing this step:** "This skill appears to be extracted from a business project. Would you like me to perform a sanitization review to remove business-specific content before public distribution?"

Skip this step if:
- The skill was created from scratch for public use
- The user explicitly declines sanitization
- The skill is intended for internal/private use only

**When to perform sanitization:**
- Skill was extracted from a business/internal project
- Skill contains domain-specific examples from real systems
- Skill will be distributed publicly or to other teams

**Sanitization process:**

1. **Load the checklist**: Read [references/sanitization_checklist.md](references/sanitization_checklist.md) for detailed guidance

2. **Run automated scans** to identify potential sensitive content:
   ```bash
   # Product/project names, person names, paths
   grep -rniE "portal|underwriting|mercury|glean|/Users/|/home/" skill-folder/

   # Chinese characters (if skill should be English-only)
   grep -rn '[一-龥]' skill-folder/
   ```

3. **Review and replace** each category:
   - Product/project names → generic terms
   - Person names → "Alice", "Bob", role-based references
   - Entity names → generic entities (ORDER, USER, PRODUCT)
   - Folder structures → generic paths
   - Internal jargon → industry-standard terms
   - Language-specific content → translate or remove

4. **Verify completeness**:
   - Re-run all grep patterns (should return no matches)
   - Read through skill to ensure coherence
   - Confirm skill still functions correctly

See `references/sanitization_checklist.md` for common replacement patterns.

### Step 6: Security Review

Before packaging or distributing a skill, run the security scanner:

```bash
python3 scripts/security_scan.py <path/to/skill-folder>           # Quick scan (required)
python3 scripts/security_scan.py <path/to/skill-folder> --verbose  # Detailed review
```

Install gitleaks first if not present (`brew install gitleaks` on macOS). The script prints installation instructions and remediation guidance for any issues found.

### Step 7: Packaging a Skill

Package the skill into a distributable zip. The script validates before packaging:

```bash
python3 scripts/package_skill.py <path/to/skill-folder>            # Output to current dir
python3 scripts/package_skill.py <path/to/skill-folder> ./dist      # Output to ./dist
```

The packaging script will:

1. **Validate** the skill automatically, checking:
   - YAML frontmatter format and required fields
   - Skill naming conventions and directory structure
   - Description completeness and quality
   - **Path reference integrity** - all `scripts/`, `references/`, and `assets/` paths mentioned in SKILL.md must exist

2. **Package** the skill if validation passes, creating a zip file named after the skill (e.g., `my-skill.zip`) that includes all files and maintains the proper directory structure for distribution.

**Common validation failure:** If SKILL.md references `scripts/my_script.py` but the file doesn't exist, validation will fail with "Missing referenced files: scripts/my_script.py". Ensure all bundled resources exist before packaging.

If validation fails, the script will report the errors and exit without creating a package. Fix any validation errors and run the packaging command again.

### Step 8: Update Marketplace

After packaging, update the marketplace registry to include the new or updated skill.

**For new skills**, add an entry to `.claude-plugin/marketplace.json`:

```json
{
  "name": "skill-name",
  "description": "Copy from SKILL.md frontmatter description",
  "source": "./",
  "strict": false,
  "version": "1.0.0",
  "category": "developer-tools",
  "keywords": ["relevant", "keywords"],
  "skills": ["./skill-name"]
}
```

**For updated skills**, bump the version in `plugins[].version` following semver:
- Patch (1.0.x): Bug fixes, typo corrections
- Minor (1.x.0): New features, additional references
- Major (x.0.0): Breaking changes, restructured workflows

**Also update** `metadata.version` and `metadata.description` if the overall plugin collection changed significantly.

### Step 9: Iterate

After testing the skill, users may request improvements. Often this happens right after using the skill, with fresh context of how the skill performed.

**Iteration workflow:**
1. Use the skill on real tasks
2. Notice struggles or inefficiencies
3. Identify how SKILL.md or bundled resources should be updated
4. Implement changes and test again

**Refinement filter:** Only add what solves observed problems. If best practices already cover it, don't duplicate.

</instructions>
