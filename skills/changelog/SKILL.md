---
name: changelog
description: Generates and updates CHANGELOG.md files from git history using Keep a Changelog format. Triggers on /changelog command OR when user mentions changelog, release notes, what changed, version history, update changelog, generate changelog, create changelog, add to changelog, changelog entry, release documentation.
context: fork
allowed-tools: Read, Write, Edit, Grep, Glob, Bash(git *)
argument-hint: "[version or date-range or 'update']"
---

# Changelog

Generates human-readable changelogs from git commit history following Keep a Changelog format and Conventional Commits conventions.

## Capabilities

1. **Generate changelog** from git commits (date range, tag range, or since last release)
2. **Update existing changelog** by adding new entries to the Unreleased section
3. **Create new changelog** with proper structure and initial content
4. **Translate commits** from developer language to user-friendly descriptions

## Auto-Detection Workflow

When invoked without arguments, automatically detect and execute:

```
/changelog (no args)
    |
    +-- Check: Does CHANGELOG.md exist?
    |       |
    |       +-- NO  --> Create New Changelog (full git history)
    |       |
    |       +-- YES --> Check: Are there new commits since last entry?
    |               |
    |               +-- YES --> Update Unreleased section
    |               +-- NO  --> Report "Changelog is up to date"
    |
/changelog [version]     --> Convert Unreleased to version release
/changelog [date range]  --> Generate entries for specific period
```

**Default behavior requires zero input** — just run `/changelog` and the right thing happens.

<instructions>

## Creating a New Changelog

1. Verify no CHANGELOG.md exists at project root
2. Detect git remote URL for footer links: `git remote get-url origin`
3. Get all tags: `git tag --sort=-v:refname`
4. Analyze git history to gather commits
5. Categorize commits using Conventional Commits mapping (see references/changelog_format.md)
6. Generate CHANGELOG.md with:
   - Header explaining the format
   - Link to Keep a Changelog
   - Unreleased section with categorized changes
   - Version sections for each existing tag (if any)
   - Footer links to GitHub comparisons
7. **Verify:** Count entries match expected categorized commits
8. Write CHANGELOG.md to project root

## Updating an Existing Changelog

1. Read existing CHANGELOG.md
2. Identify last documented version from existing content (look for `## [x.y.z]` headers)
3. Get corresponding tag: `git tag --sort=-v:refname | head -1`
4. Gather commits since that point: `git log --oneline <last-tag>..HEAD`
5. If no new commits: report "Changelog is up to date" and exit
6. Categorize new commits using Conventional Commits mapping
7. Add entries to Unreleased section (create section if missing)
8. Preserve all existing content exactly
9. **Verify:** New entry count matches new commit count (minus filtered)
10. Write updated CHANGELOG.md

## Generating a Release Entry

1. Gather commits for the release range
2. Group by change type (Added, Changed, Fixed, etc.)
3. Filter noise (merge commits, CI/CD changes, refactors unless significant)
4. Translate technical commits to user-friendly descriptions
5. Format as new version section with ISO 8601 date

## Git Analysis Commands

```bash
# All commits since last tag
git log --oneline $(git describe --tags --abbrev=0 2>/dev/null || echo "")..HEAD

# Commits between tags
git log --oneline v1.0.0..v1.1.0

# Commits in date range
git log --oneline --since="2024-01-01" --until="2024-01-31"

# Get current tags
git tag --sort=-v:refname | head -10
```

## Commit Categorization

Map Conventional Commits prefixes to Keep a Changelog sections:

| Commit Prefix | Changelog Section |
|---------------|-------------------|
| `feat:`, `feature:` | Added |
| `fix:`, `bugfix:` | Fixed |
| `change:`, `refactor:` (user-visible) | Changed |
| `deprecate:`, `deprecated:` | Deprecated |
| `remove:`, `removed:` | Removed |
| `security:`, `sec:` | Security |
| `perf:` (user-visible) | Changed |
| `docs:`, `test:`, `ci:`, `chore:` | Usually filtered |

## Filtering Guidelines

**Include:**
- New features users can use
- Bug fixes affecting user experience
- Breaking changes (mark prominently)
- Security fixes
- Significant performance improvements

**Filter:**
- Merge commits
- Internal refactors (unless affecting API)
- Test additions/changes
- CI/CD configuration
- Documentation updates (unless user-facing)
- Typo fixes

## Translation Examples

| Technical Commit | User-Friendly Entry |
|------------------|---------------------|
| `fix(auth): resolve JWT expiry edge case` | Fixed session timeout issues for long-running sessions |
| `feat(api): add /users endpoint` | Added user management API endpoints |
| `perf(db): optimize query N+1` | Improved page load performance |
| `fix: handle null pointer in parser` | Fixed crash when processing empty input |

</instructions>

## Output Format

Generate changelog following this structure:

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- New feature description

### Changed
- Modified behavior description

### Fixed
- Bug fix description

## [1.0.0] - YYYY-MM-DD

### Added
- Initial release features

[Unreleased]: https://github.com/owner/repo/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/owner/repo/releases/tag/v1.0.0
```

## Examples

<example>
**User request**: `/changelog` (no arguments)
**Action**: Check if CHANGELOG.md exists → if no, create; if yes, update with new commits
**Output**: CHANGELOG.md created or updated automatically based on git history
</example>

<example>
**User request**: "Update changelog for v2.0.0 release"
**Action**: Gather commits since last tag, move Unreleased to new version section, add release date
**Output**: Updated CHANGELOG.md with new `## [2.0.0] - YYYY-MM-DD` section
</example>

<example>
**User request**: "Generate release notes for commits between v1.2.0 and v1.3.0"
**Action**: Run `git log v1.2.0..v1.3.0`, categorize, translate to user-friendly descriptions
**Output**: Formatted changelog entry ready to paste or insert
</example>

<example>
**User request**: "Add this week's changes to the changelog"
**Action**: Run `git log --since="7 days ago"`, categorize, append to Unreleased
**Output**: Updated CHANGELOG.md with new entries in Unreleased section
</example>

<example>
**User request**: "Create release notes for the app store"
**Action**: Analyze recent commits, filter technical noise, write user-friendly descriptions
**Output**: Clean, non-technical release notes suitable for end users
</example>

## Resources

See `references/changelog_format.md` for:
- Keep a Changelog specification and section definitions
- Conventional Commits type-to-section mapping
- Writing style guidelines for different audiences
- Anti-patterns to avoid
- Complete changelog example
- Git commands for commit analysis
