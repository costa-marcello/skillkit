# Bundled Resources Guide

Skills can include three types of bundled resources in addition to SKILL.md.

## Scripts (`scripts/`)

Executable code (Python/Bash/etc.) for tasks that require deterministic reliability or are repeatedly rewritten.

- **When to include**: When the same code is being rewritten repeatedly or deterministic reliability is needed
- **Example**: `scripts/rotate_pdf.py` for PDF rotation tasks
- **Benefits**: Token efficient, deterministic, may be executed without loading into context
- **Note**: Scripts may still need to be read by Claude for patching or environment-specific adjustments

## References (`references/`)

Documentation and reference material intended to be loaded as needed into context to inform Claude's process and thinking.

- **When to include**: For documentation that Claude should reference while working
- **Examples**: `references/finance.md` for financial schemas, `references/mnda.md` for company NDA template, `references/policies.md` for company policies, `references/api_docs.md` for API specifications
- **Use cases**: Database schemas, API documentation, domain knowledge, company policies, detailed workflow guides
- **Benefits**: Keeps SKILL.md lean, loaded only when Claude determines it's needed
- **Best practice**: If files are large (>10k words), include grep search patterns in SKILL.md
- **Avoid duplication**: Information should live in either SKILL.md or references files, not both. Prefer references files for detailed information unless it's truly core to the skill.

## Assets (`assets/`)

Files not intended to be loaded into context, but rather used within the output Claude produces.

- **When to include**: When the skill needs files that will be used in the final output
- **Examples**: `assets/logo.png` for brand assets, `assets/slides.pptx` for PowerPoint templates, `assets/frontend-template/` for HTML/React boilerplate, `assets/font.ttf` for typography
- **Use cases**: Templates, images, icons, boilerplate code, fonts, sample documents that get copied or modified
- **Benefits**: Separates output resources from documentation, enables Claude to use files without loading them into context

## Privacy and Path References

Skills for public distribution must not contain user-specific or company-specific information.

**Do not include:**
- Absolute paths to user directories (`/home/username/`, `/Users/username/`, `/mnt/c/Users/username/`)
- Personal usernames, company names, department names, product names
- OneDrive paths, cloud storage paths, or environment-specific absolute paths
- Hardcoded skill installation paths like `~/.claude/skills/`

**Do include:**
- Relative paths within the skill bundle (`scripts/example.py`, `references/guide.md`)
- Standard placeholders (`~/workspace/project`, `username`, `your-company`)
- Simple relative paths for bundled scripts (`scripts/script_name.py`) -- Claude resolves the actual location

## Versioning

Do not include version history or version numbers in SKILL.md.

- No version sections (`## Version`, `## Changelog`, `## Release History`) in SKILL.md
- No version numbers in SKILL.md body content
- Track versions in marketplace.json under `plugins[].version`
- Marketplace infrastructure manages versioning. SKILL.md should be timeless content focused on functionality.
