---
name: changelog
description: "Generates changelogs and manages releases. Use when updating changelogs, pushing changelog changes, preparing releases, or tagging versions."
license: MIT
context: fork
agent: general-purpose
allowed-tools: Read, Write, Edit, Grep, Glob, Bash(git *), Bash(gh *)
argument-hint: "[instructions] or [push] or [release [version]]"
---

# Changelog

Generates human-readable changelogs from git commit history and manages the full release lifecycle. Commits automatically, pushes on request, tags and releases when told. Follows Keep a Changelog format and Conventional Commits conventions.

## Capabilities

1. **Generate changelog** from git commits (date range, tag range, or since last release)
2. **Update existing changelog** by adding new entries to the Unreleased section
3. **Create new changelog** with proper structure and initial content
4. **Translate commits** from developer language to user-friendly descriptions
5. **Commit** changelog updates automatically
6. **Push** changelog commits to remote on request
7. **Tag and release** with annotated tags on request

## Workflow Modes

When invoked, detect the mode from `$ARGUMENTS` and act accordingly:

```
/changelog [instructions]
    |
    +-- Mode: UPDATE (default)
    |   Update or create CHANGELOG.md, commit. No push.
    |
/changelog push
    |
    +-- Mode: PUSH
    |   Complete unreleased entries if new commits exist,
    |   commit if needed, push to remote.
    |
/changelog release [version]
    |
    +-- Mode: RELEASE
        Create versioned release entry, commit, tag, push.
```

**Detection logic:**
- `$ARGUMENTS` contains "release" (case-insensitive) → **release mode**
- `$ARGUMENTS` contains "push" (case-insensitive) → **push mode**
- Everything else → **update mode**

**Update mode** handles: no arguments, date ranges, free-text instructions (e.g., "add this week's changes"). Always commits, never pushes.

**Push mode** handles: `/changelog push`. Completes the Unreleased section with any new commits not yet documented, commits if changes were made, then pushes.

**Release mode** handles: `/changelog release` (auto-detect version) or `/changelog release v2.0.0` (explicit version).

<instructions>

## Pre-Flight Checks

Run these checks before any git operations:

1. **Clean working directory:** `git status --porcelain` must return empty (CHANGELOG.md changes we are about to write are exempt). If dirty, abort and tell the user to commit or stash first.
2. **Fetch latest remote state (push and release modes):** `git fetch origin`
3. **Branch not behind remote (push and release modes):** Compare local and remote with `git rev-list --count HEAD..origin/$(git branch --show-current)`. If behind, abort and tell the user to pull first.
4. **No duplicate tag (release mode only):** Check `git tag -l vX.Y.Z`. If the tag exists, abort and report the conflict.

## Creating a New Changelog

1. Verify no CHANGELOG.md exists at project root
2. Detect git remote URL for footer links: `git remote get-url origin`
3. Get all tags: `git tag --sort=-v:refname`
4. Analyse git history to gather commits
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

Triggered when `$ARGUMENTS` contains the word "release" (case-insensitive):

1. Determine the version:
   - If the user provided a version (e.g., `/changelog release v1.2.0`), use it directly
   - Otherwise, auto-detect using Version Auto-Detection below
2. Gather commits since the last tag
3. Group by change type (Added, Changed, Fixed, etc.)
4. Filter noise (merge commits, CI/CD changes, refactors unless significant)
5. Translate technical commits to user-friendly descriptions
6. Create a versioned section with the version and today's date
7. Remove any existing Unreleased section and its footer link
8. Update footer comparison links

## Post-Changelog Actions

After writing CHANGELOG.md, run the appropriate git workflow.

### Update Mode (default)

1. `git add CHANGELOG.md`
2. `git commit -m "Update changelog"` (use a descriptive message based on changes made)
3. **Stop.** Do not push. Report what was committed.

### Push Mode

1. Check for new commits not yet in the Unreleased section. If found, add them first (follow the Updating an Existing Changelog steps above).
2. `git add CHANGELOG.md` (if changes were made)
3. `git commit -m "Update changelog"` (if changes were made)
4. `git push`
5. **Verify:** `git log --oneline -1` and confirm the push succeeded

### Release Mode

1. `git add CHANGELOG.md`
2. `git commit -m "Release vX.Y.Z"`
3. `git tag -a vX.Y.Z -m "Release vX.Y.Z - <one-line summary of changes>"`
4. `git push --follow-tags`
5. **Verify:** `git ls-remote --tags origin | grep vX.Y.Z` and report the version, tag, and commit hash

## Git Analysis Commands

```bash
# All commits since last tag
git log --oneline $(git describe --tags --abbrev=0 2>/dev/null || echo "")..HEAD

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

Automatically detects the next version from commits since the last tag. Used in release mode when the user does not provide an explicit version.

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

Report the detected version:

```
Next version: X.Y.Z (bump -- reason)
Commits since vCURRENT: N total (N included, N filtered)
```

Use the auto-detected version to create the versioned release entry and the annotated tag. Do not ask the user for a version number.

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
**Mode**: Update
**Action**: No CHANGELOG.md found. Create from full git history. Commit.
**Steps**:
1. Generate CHANGELOG.md from all commits
2. `git add CHANGELOG.md`
3. `git commit -m "Add changelog from git history"`
**Output**: Created CHANGELOG.md and committed. Run `/changelog push` when ready to push.
</example>

<example>
**User request**: `/changelog` (existing CHANGELOG.md, new commits since last tag)
**Mode**: Update
**Action**: Add new entries to Unreleased section. Commit.
**Steps**:
1. Update CHANGELOG.md with new Unreleased entries
2. `git add CHANGELOG.md`
3. `git commit -m "Update changelog with recent changes"`
**Output**: Updated Unreleased section and committed.
</example>

<example>
**User request**: `/changelog push`
**Mode**: Push
**Action**: Check for new commits not yet in Unreleased. Complete the section if needed. Commit and push.
**Steps**:
1. Find 3 commits not yet documented, add to Unreleased section
2. `git add CHANGELOG.md`
3. `git commit -m "Update changelog with recent changes"`
4. `git push`
**Output**: Added 3 entries to Unreleased, committed, and pushed to remote.
</example>

<example>
**User request**: `/changelog release` or `/changelog release v2.0.0`
**Mode**: Release
**Action**: Detect version automatically from commit types, or use the explicit version provided. Create versioned release entry. Commit, tag, push.
**Steps (auto-detected version)**:
1. Auto-detect version: v2.1.0 (minor bump, new features detected)
2. Write release entry to CHANGELOG.md
3. `git add CHANGELOG.md`
4. `git commit -m "Release v2.1.0"`
5. `git tag -a v2.1.0 -m "Release v2.1.0 - Dark mode and CSV export"`
6. `git push --follow-tags`
**Steps (explicit version)**: Same workflow, but skip auto-detection and use the provided version directly (e.g., `v2.0.0`).
**Output**: Released vX.Y.Z, tagged, and pushed to remote.
</example>

<example>
**User request**: "Add this week's changes to the changelog"
**Mode**: Update
**Action**: Run `git log --since="7 days ago"`, categorize, append to Unreleased section. Commit.
**Output**: Updated CHANGELOG.md with new entries under `## [Unreleased]` and committed.
</example>

## References

| File | Content |
|------|---------|
| `references/changelog_format.md` | Full Keep a Changelog spec, Conventional Commits mapping, writing style guide, anti-patterns, release workflow reference, complete example |
