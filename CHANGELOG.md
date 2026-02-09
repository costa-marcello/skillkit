# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

## [0.2.1] - 2026-02-09

### Changed
- Broadened README and project language from Claude Code-only to support all AI coding agents

### Fixed
- Fixed install commands across README and review-skill to use documented `-s` flag format

## [0.2.0] - 2026-02-09

### Changed
- Updated README to reflect 21 skills and added orla3-production skill entry to the skills table
- Improved changelog skill with restructured SKILL.md
- Improved docx skill with restructured SKILL.md and references
- Improved ultrathink skill with domain-specific examples
- Improved review-skill with updated research-backed criteria
- Improved research skill with refined prompt generation and references

## [0.1.0] - 2026-02-09

### Added
- Initial release with 19 skills for Claude Code
- Document and data skills: docx, pdf, pptx, xlsx
- Development skills: ci-cd, changelog, smart-merge, shadcn-ui, frontend-design, mermaid-diagrams
- AI and research skills: codex, gemini, research, ultrathink
- Meta skills: claude-md, readme-md, create-skill, review-skill, find-skills
- Production-audit skill for codebase readiness checks across six dimensions
- Orla3-production skill for project-specific production audits
- Lifecycle hooks for Qdrant vector store and claude-mem persistent context
- Logo and README with skill categories, badges, and contributing guide
- Skill symlinks under `.claude/skills` and `.agents/skills`
- `.gitattributes` to mark OOXML schemas as vendored

### Changed
- Renamed skill-creator and skill-reviewer to create-skill and review-skill
- Aligned create-skill and review-skill with task-based `context:fork` detection
- Updated codex skill model from gpt-5.2-codex to gpt-5.3-codex
- Improved gemini and shadcn-ui skills with better structure
- Improved production-audit with architecture, complexity, and deeper security checks
- Improved production-audit skill structure and conciseness
- Improved review-skill with actionable steps, examples, and self-consistency checks
- Improved pptx skill with extracted template workflow and XML tags
- Improved pdf skill with XML structure, examples, and error handling
- Improved xlsx skill with XML tags, examples, and extracted references
- Improved create-skill with reduced duplication and end-to-end workflow
- Improved claude-md skill with extracted content to references and consolidated structure
- Improved research skill with corrected agent type and tighter exception handling
- Improved find-skills with XML structure, examples, and verification step
- Improved readme-md skill with restructured templates and trimmed references
- Rewrote README with detailed skill descriptions

### Fixed
- Fixed codex skill contradictions and removed stale data
- Fixed skill-creator `$ARGUMENTS` routing and cross-file inconsistencies
- Fixed production-audit review findings: consistent labels, Grep tool syntax, architecture split
- Removed hardcoded completion percentages from production-audit skill
- Fixed script invocations and variable names after skill rename
- Fixed review-skill over-specification and deduplicated steps

[Unreleased]: https://github.com/costa-marcello/skillkit/compare/v0.2.1...HEAD
[0.2.1]: https://github.com/costa-marcello/skillkit/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/costa-marcello/skillkit/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/costa-marcello/skillkit/releases/tag/v0.1.0
