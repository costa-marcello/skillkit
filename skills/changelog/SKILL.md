---
name: changelog
description: "Generates and updates CHANGELOG.md files from git history using Keep a Changelog format. Use when creating changelogs, adding release notes, documenting version history, or preparing release documentation."
context: fork
agent: general-purpose
allowed-tools: Read, Write, Edit, Grep, Glob, Bash(git *)
argument-hint: "[release or date-range]"
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
/changelog release       --> Auto-detect version from commits, convert Unreleased to release
/changelog [date range]  --> Generate entries for specific period
```

**Default behaviour requires zero input.** Run `/changelog` and the correct action runs automatically.

<instructions>

## Creating a New Changelog

1. Verify no CHANGELOG.md exists at project root
2. Detect git remote URL for footer links: `git remote get-url origin`
3. Get all tags: `git tag --sort=-v:refname`
4. Analyze git history to gather commits
5. Categorize commits using Conventional Commits mapping (see references/changelog_format.md)
6. Generate CHANGELOG.md with:
   - Header explaining the format
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

When the user runs `/changelog release` or asks to create a release:

1. Auto-detect the next version (see Version Auto-Detection below)
2. Gather commits since the last tag
3. Group by change type (Added, Changed, Fixed, etc.)
4. Filter noise (merge commits, CI/CD changes, refactors unless significant)
5. Translate technical commits to user-friendly descriptions
6. Convert the Unreleased section to the auto-detected version with today's date
7. Create a fresh empty Unreleased section above
8. Update footer comparison links

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

Map Conventional Commits prefixes to Keep a Changelog sections. See `references/changelog_format.md` for the full type-to-section mapping, writing style guidelines, and anti-patterns.

**Quick reference:**

| Commit Prefix | Changelog Section |
|---------------|-------------------|
| `feat:` | Added |
| `fix:` | Fixed |
| `refactor:` (user-visible) | Changed |
| `security:` | Security |
| `docs:`, `test:`, `ci:`, `chore:` | Filter out |

**Always include:** features, user-facing bug fixes, breaking changes, security fixes.
**Always filter:** merge commits, internal refactors, test changes, CI config, typos.

Translate technical commits to user-friendly language:
- `fix(auth): resolve JWT expiry edge case` -> "Fixed session timeout issues for long-running sessions"
- `feat(api): add /users endpoint` -> "Added user management API endpoints"

## Version Auto-Detection

Automatically detects the next version from commits since the last tag. Runs as part of every changelog action.

**Step 1: Get the current version**

```bash
git tag --sort=-v:refname | head -1
```

If no tags exist, treat the current version as `0.0.0`.

**Step 2: Scan commits since last tag for the highest bump signal**

Check all commits since the last tag using `git log --pretty=format:"%s%n%b" <last-tag>..HEAD`. Apply the highest-priority rule that matches:

| Priority | Signal | Bump |
|----------|--------|------|
| 1 | Breaking change -- BREAKING CHANGE in body/footer, or type! suffix (feat!, fix!) | Major |
| 2 | New feature -- feat or feat(scope) prefix | Minor |
| 3 | Bug fix or improvement -- fix, perf, or other included types | Patch |

If all commits were filtered (docs, test, ci, chore only), output "No release needed" instead of a version.

**Step 3: Output**

For `/changelog` (create/update), append a version suggestion after the changelog summary:

```
Next version: X.Y.Z (bump -- reason)
Commits since vCURRENT: N total (N included, N filtered)

To release:
  git tag vX.Y.Z && git push --tags
```

For `/changelog release`, use the auto-detected version directly to create the release entry. Do not ask the user for a version number.

See `references/changelog_format.md` for the full version detection rules and edge cases.

</instructions>

<formatting>

## Output Format

Generate changelog following this structure:

```markdown
# Changelog

All notable changes to this project will be documented in this file.

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

</formatting>

## Examples

<example>
**User request**: `/changelog` (no arguments)
**Action**: Check if CHANGELOG.md exists → if no, create; if yes, update with new commits
**Output**: CHANGELOG.md created or updated automatically based on git history
</example>

<example>
**User request**: `/changelog release`
**Action**: Auto-detect version from commits (e.g. feat commits = minor bump), move Unreleased to new version section with today's date
**Output**: Updated CHANGELOG.md with auto-detected version (e.g. `## [2.1.0] - 2024-03-15`)
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

## References

| File | Content |
|------|---------|
| `references/changelog_format.md` | Full Keep a Changelog spec, Conventional Commits mapping, writing style guide, anti-patterns, complete example |
