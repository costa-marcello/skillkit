# Changelog

All notable changes to the claude-md skill are documented here.

---

## [1.1.0] - 2026-02-09

### Changed
- Extracted "Rule Quality Standards", "What Makes a Great CLAUDE.md", "Common Issues to Flag", and "What to NEVER Delete" sections from SKILL.md to `references/rule-quality-standards.md`. Reduced line count from 542 to 419.
- Replaced `tools` with `allowed-tools` in frontmatter (correct field name).
- Removed non-standard `version` field from frontmatter.
- Added `agent: general-purpose` to frontmatter (required with `context: fork` for write-capable skills).
- Fixed description: replaced em dash with period, added "Use when" trigger phrasing.
- Replaced `CRITICAL:` over-specification with natural language.
- Consolidated References section into a single table with file purposes.

### Added
- `references/rule-quality-standards.md` -- hybrid format, transformation examples, positive reframing, preservation rules.

---

## [1.0.0] - 2026-01-30

### Initial Release

Complete CLAUDE.md management skill with four operational modes:
- **Audit**: Discovery and quality scoring across all CLAUDE.md files
- **Review**: Detailed quality analysis with rule-by-rule assessment
- **Improve**: Targeted updates with diff-based modifications
- **Refactor**: Restructuring using progressive disclosure patterns

Core features:
- Research-backed quality criteria (100-point scoring system)
- Rule quality dimensions (reasoning, specificity, framing, examples, structure)
- Hybrid format guidance (directive + reasoning)
- Progressive disclosure architecture for monorepos

---

## Update Protocol

When maintaining this skill, follow these guidelines:

### Adding Research Citations
- Use stable references: "Anthropic documentation" rather than specific dates
- Include "(as of v1.0)" notation when referencing specific findings
- If citing academic papers, use author-year format (e.g., "Liu et al. 2024")

### Version Numbering
- **Major (X.0.0)**: Breaking changes to workflow or output format
- **Minor (0.X.0)**: New features, additional modes, or significant enhancements
- **Patch (0.0.X)**: Bug fixes, documentation updates, minor refinements

### Testing Changes
Before releasing updates:
1. Run the skill against a sample CLAUDE.md file
2. Verify all four modes produce expected output
3. Check that references load correctly
4. Validate line counts remain under targets (SKILL.md < 500 lines)

### Documenting Changes
- Add entry at top of this file (newest first)
- Include date and version number
- Categorize changes: Added, Changed, Deprecated, Removed, Fixed
