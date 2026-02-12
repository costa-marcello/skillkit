---
name: changelog
description: "Generates and updates CHANGELOG.md files from git history using Keep a Changelog format. Use when creating changelogs, adding release notes, documenting version history, or preparing release documentation."
license: MIT
context: fork
agent: general-purpose
allowed-tools: Read, Write, Edit, Grep, Glob, Bash(git *)
argument-hint: "[date-range]"
---

# Changelog

Generates human-readable changelogs from git commit history following Keep a Changelog format and Conventional Commits conventions.

## Capabilities

1. **Generate changelog** from git commits (date range, tag range, or since last release)
2. **Update existing changelog** by adding new entries to the Unreleased section
3. **Create new changelog** with proper structure and initial content
4. **Translate commits** from developer language to user-friendly descriptions

## Auto-Detection Workflow

When invoked, detect the git state and act accordingly:

```
/changelog (no args)
    |
    +-- Check: Does CHANGELOG.md exist?
    |       |
    |       +-- NO  --> Create New Changelog (full git history)
    |       |
    |       +-- YES --> Check: Are there commits since last tag?
    |               |
    |               +-- NO  --> Report "Changelog is up to date"
    |               |
    |               +-- YES --> Are all commits pushed to remote?
    |                       |
    |                       +-- NO  --> Update/create Unreleased section
    |                       +-- YES --> Auto-detect version, create release entry
    |                                   (no Unreleased section in output)
    |
/changelog [date range]  --> Generate entries for specific period
```

**Detection logic:** Compare `git log <last-tag>..HEAD` with `git log <last-tag>..origin/<branch>`. If HEAD matches the remote, all commits are pushed and the changelog creates a versioned release. If HEAD is ahead of origin, unpushed commits go into Unreleased.

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

Triggered automatically when `/changelog` detects all commits since the last tag are pushed to remote:

1. Auto-detect the next version (see Version Auto-Detection below)
2. Gather commits since the last tag
3. Group by change type (Added, Changed, Fixed, etc.)
4. Filter noise (merge commits, CI/CD changes, refactors unless significant)
5. Translate technical commits to user-friendly descriptions
6. Create a versioned section with the auto-detected version and today's date
7. Remove any existing Unreleased section and its footer link
8. Update footer comparison links

## Git Analysis Commands

```bash
# All commits since last tag
git log --oneline $(git describe --tags --abbrev=0 2>/dev/null || echo "")..HEAD

# Check if HEAD is pushed (0 = all pushed, >0 = unpushed commits)
git rev-list --count origin/$(git branch --show-current)..HEAD

# Commits between tags
git log --oneline v1.0.0..v1.1.0

# Commits in date range (adjust dates to match the requested period)
git log --oneline --since="2025-01-01" --until="2025-01-31"

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

When commits are unpushed (Unreleased path), append a version suggestion:

```
Next version: X.Y.Z (bump -- reason)
Commits since vCURRENT: N total (N included, N filtered)
```

When all commits are pushed (release path), use the auto-detected version directly to create the versioned release entry. Do not ask the user for a version number.

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
**User request**: `/changelog` (no arguments, no existing CHANGELOG.md)
**Action**: No CHANGELOG.md found. Create from full git history.
**Output**:
```markdown
# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- User authentication with OAuth2 support
- Dashboard analytics widget

### Fixed
- Resolved timeout on large file uploads

[Unreleased]: https://github.com/owner/repo/compare/v0.0.0...HEAD
```
</example>

<example>
**User request**: `/changelog` (all commits pushed to remote)
**Action**: Detect all commits are pushed. Auto-detect version from commit types (feat commits = minor bump). Create versioned release entry with today's date.
**Output**:
```markdown
## [2.1.0] - 2025-11-15

### Added
- Dark mode theme support
- Export data to CSV format

### Fixed
- Fixed crash when processing files over 100MB
```
No Unreleased section in output because all changes are released.
</example>

<example>
**User request**: "Generate release notes for commits between v1.2.0 and v1.3.0"
**Action**: Run `git log v1.2.0..v1.3.0`, categorize, translate to user-friendly descriptions.
**Output**:
```markdown
## [1.3.0] - 2025-10-01

### Added
- Webhook support for real-time event notifications
- Bulk import from CSV files

### Changed
- Improved search performance by 40%

### Fixed
- Resolved timezone display issues in reports
```
</example>

<example>
**User request**: "Add this week's changes to the changelog"
**Action**: Run `git log --since="7 days ago"`, categorize, append to Unreleased section.
**Output**: Updated CHANGELOG.md with new entries added under `## [Unreleased]`:
```markdown
## [Unreleased]

### Added
- Keyboard shortcuts for common actions

### Fixed
- Fixed pagination on search results page
```
</example>

<example>
**User request**: "Create release notes for the app store"
**Action**: Analyse recent commits, filter technical noise, write user-friendly descriptions.
**Output**:
```markdown
What's New:
- You can now switch to dark mode from Settings
- Export your data as a spreadsheet with one tap
- Fixed a crash that happened when uploading large files
- Search results load faster than before
```
</example>

## References

| File | Content |
|------|---------|
| `references/changelog_format.md` | Full Keep a Changelog spec, Conventional Commits mapping, writing style guide, anti-patterns, complete example |
