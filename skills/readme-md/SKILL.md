---
name: readme-md
description: Guides README creation and improvement with audience-matched templates. Use when writing READMEs for open source, personal, internal, or config projects, or when the user mentions documentation, README, or project setup.
license: MIT
context: fork
agent: general-purpose
---

# Crafting Effective READMEs

## Overview

READMEs answer questions your audience will have. Different audiences need different information - a contributor to an OSS project needs different context than future-you opening a config folder.

**Always ask:** Who will read this, and what do they need to know?

<instructions>

## Quick Workflow

Copy this checklist:

```
README Progress:
- [ ] Task identified: Creating / Adding / Updating / Reviewing
- [ ] Audience identified: _____
- [ ] Project type: OSS / Personal / Internal / Config
- [ ] Template selected from templates/
- [ ] Draft complete
- [ ] Asked: "Anything else to highlight?"
```

## Process

### Step 1: Identify the Task

**Ask:** "What README task are you working on?"

| Task | When |
|------|------|
| **Creating** | New project, no README yet |
| **Adding** | Need to document something new |
| **Updating** | Capabilities changed, content is stale |
| **Reviewing** | Checking if README is still accurate |

### Step 2: Task-Specific Questions

**Creating initial README:**
1. What type of project? (see Project Types below)
2. What problem does this solve in one sentence?
3. What's the quickest path to "it works"?
4. Anything notable to highlight?

**Adding a section:**
1. What needs documenting?
2. Where should it go in the existing structure?
3. Who needs this info most?

**Updating existing content:**
1. What changed?
2. Read current README, identify stale sections
3. Propose specific edits

**Reviewing/refreshing:**
1. Read current README
2. Check against actual project state (package.json, main files, etc.)
3. Flag outdated sections
4. Update "Last reviewed" date if present

### Step 3: Always Ask

After drafting, ask: **"Anything else to highlight or include that I might have missed?"**

## Project Types

| Type | Audience | Key Sections | Template |
|------|----------|--------------|----------|
| **Open Source** | Contributors, users worldwide | Install, Usage, Contributing, License | `assets/templates/oss.md` |
| **Personal** | Future you, portfolio viewers | What it does, Tech stack, Learnings | `assets/templates/personal.md` |
| **Internal** | Teammates, new hires | Setup, Architecture, Runbooks | `assets/templates/internal.md` |
| **Config** | Future you (confused) | What's here, Why, How to extend, Gotchas | `assets/templates/xdg-config.md` |

**Ask the user** if unclear. Don't assume OSS defaults for everything.

## Essential Sections (All Types)

Every README needs at minimum:

1. **Name** - Self-explanatory title
2. **Description** - What + why in 1-2 sentences  
3. **Usage** - How to use it (examples help)

</instructions>

## Examples

<example>
**Task:** Creating README for OSS CLI tool

**Before (typical first draft):**
```markdown
# mytool
A tool for doing stuff with files.

## Installation
npm install mytool

## Usage
mytool [options]
```

**After (audience-focused):**
```markdown
# mytool
Convert CSV files to JSON with one command. Handles messy data, encoding issues, and files up to 2GB.

## Quick Start
```bash
npm install -g mytool
mytool input.csv > output.json
```

## Common Use Cases
```bash
# Skip header row
mytool --skip-header data.csv

# Handle non-UTF8 encoding
mytool --encoding latin1 legacy.csv
```
```

**Why better:** Shows the problem it solves, demonstrates real scenarios, gives copy-paste commands.
</example>

<example>
**Task:** Updating README after adding new feature

**Before (buried in wall of text):**
```markdown
## Features
This tool does X, Y, Z. It also now supports authentication via OAuth which can be configured using environment variables or a config file.
```

**After (scannable, actionable):**
```markdown
## Features
- **X** - Does this
- **Y** - Does that
- **Z** - Does the other thing
- **OAuth auth** (new in v2.0) - See [Authentication](#authentication)

## Authentication
Set `MYTOOL_OAUTH_TOKEN` or add to `~/.mytoolrc`:
```yaml
auth:
  provider: oauth
  token: your-token
```
```

**Why better:** New feature is discoverable, has its own section, shows exactly how to use it.
</example>

<example>
**Task:** Config folder README (for future-you)

**Before (no README or unhelpful):**
```markdown
# Config
My config files.
```

**After (answers future-you's questions):**
```markdown
# Neovim Config

## What's Here
- `init.lua` - Entry point, loads everything else
- `lua/plugins/` - Plugin configs (lazy.nvim)
- `lua/keymaps.lua` - All custom keybindings

## Key Choices
- **Why lazy.nvim?** Fastest loader, good defaults
- **Why no LSP here?** Using Mason, see `lua/plugins/lsp.lua`

## Gotchas
- Run `:Lazy sync` after pulling changes
- `<leader>` is space (set in init.lua line 12)
```

**Why better:** Future-you at 2am will thank past-you for the "Gotchas" section.
</example>

## References

| File | Purpose |
|------|---------|
| `references/section-checklist.md` | Which sections to include by project type |
| `references/style-guide.md` | Common README mistakes and prose guidance |
| `references/art-of-readme.md` | Philosophy: cognitive funneling, brevity, key elements |
| `references/make-a-readme.md` | Section-by-section guidance for what to include |
| `references/standard-readme-spec.md` | Formal spec for standardised README format |
| `references/standard-readme-example-minimal.md` | Minimal compliant README example |
| `references/standard-readme-example-maximal.md` | Full-featured README example |
| `assets/templates/` | Ready-to-use templates: oss, personal, internal, xdg-config |
