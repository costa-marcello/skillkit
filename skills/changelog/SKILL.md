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

Generates human-readable changelogs from git commit history and manages the full release lifecycle. Follows Keep a Changelog format and Conventional Commits conventions.

<instructions>

## Step 1: Determine Mode

Read `$ARGUMENTS` and select exactly one mode. State your mode before doing anything else.

| Check (in this order) | Mode |
|-----------------------|------|
| `$ARGUMENTS` contains "release" (case-insensitive) | **RELEASE** — commit, tag, push |
| `$ARGUMENTS` contains "push" (case-insensitive) | **PUSH** — commit if needed, push |
| Everything else (no arguments, date ranges, free-text) | **UPDATE** — commit only, no push |

Once you have stated your mode, follow ONLY the matching section below. Do not mix steps from other modes.

---

## UPDATE Mode

Updates or creates CHANGELOG.md and commits. Never pushes.

1. **Pre-flight:** `git status --porcelain` must return empty (CHANGELOG.md exempt). If dirty, abort.
2. **Check for CHANGELOG.md** at project root.
   - If missing: create from full git history (see Creating a New Changelog below).
   - If present: update with new entries (see Updating an Existing Changelog below).
3. `git add CHANGELOG.md`
4. `git commit -m "<descriptive message>"`
5. Report what was committed. Suggest `/changelog push` to push, or `/changelog release` to tag a version.

---

## PUSH Mode

Completes unreleased entries if new commits exist, commits if needed, pushes to remote.

1. **Pre-flight:**
   - `git status --porcelain` must return empty. If dirty, abort.
   - `git fetch origin`
   - Branch not behind remote: `git rev-list --count HEAD..origin/$(git branch --show-current)`. If behind, abort.
2. Read CHANGELOG.md. Identify last documented version from `## [x.y.z]` headers.
3. Get corresponding tag: `git tag --sort=-v:refname | head -1`
4. Gather commits since that point: `git log --oneline <last-tag>..HEAD`
5. If new undocumented commits exist, categorize them (see Commit Categorization below) and add to the Unreleased section.
6. If CHANGELOG.md changed:
   - `git add CHANGELOG.md`
   - `git commit -m "Update changelog with recent changes"`
7. `git push`
8. **Verify:** `git log --oneline -1` and confirm the push succeeded.

---

## RELEASE Mode

Creates a versioned release entry, commits, tags with an annotated tag, and pushes.

1. **Pre-flight:**
   - `git status --porcelain` must return empty. If dirty, abort.
   - `git fetch origin`
   - Branch not behind remote: `git rev-list --count HEAD..origin/$(git branch --show-current)`. If behind, abort.
2. **Determine version:**
   - If the user provided a version (e.g., `/changelog release v1.2.0`), use it directly.
   - Otherwise, auto-detect using Version Auto-Detection below.
3. **Check no duplicate tag:** `git tag -l vX.Y.Z`. If the tag exists, abort.
4. Gather commits since the last tag: `git log --oneline <last-tag>..HEAD`
5. Categorize commits (see Commit Categorization below).
6. Filter noise (merge commits, CI/CD changes, refactors unless significant).
7. Translate technical commits to user-friendly descriptions.
8. Create a versioned section `## [X.Y.Z] - YYYY-MM-DD` with today's date.
9. Remove any existing Unreleased section and its footer link.
10. Update footer comparison links.
11. `git add CHANGELOG.md`
12. `git commit -m "Release vX.Y.Z"`
13. `git tag -a vX.Y.Z -m "Release vX.Y.Z - <one-line summary of changes>"`
14. `git push --follow-tags`
15. **Verify:** `git ls-remote --tags origin | grep vX.Y.Z` and report the version, tag, and commit hash.

---

## Creating a New Changelog

Used by UPDATE mode when no CHANGELOG.md exists.

1. Detect git remote URL for footer links: `git remote get-url origin`
2. Get all tags: `git tag --sort=-v:refname`
3. Analyse git history and categorize commits (see Commit Categorization below)
4. Generate CHANGELOG.md with header, Unreleased section, version sections for existing tags, and footer links
5. **Verify:** Entry count matches expected categorized commits
6. Write CHANGELOG.md to project root

## Updating an Existing Changelog

Used by UPDATE and PUSH modes when CHANGELOG.md exists.

1. Read existing CHANGELOG.md
2. Identify last documented version from `## [x.y.z]` headers
3. Get corresponding tag: `git tag --sort=-v:refname | head -1`
4. Gather commits since that point: `git log --oneline <last-tag>..HEAD`
5. If no new commits: report "Changelog is up to date" and exit
6. Categorize new commits (see Commit Categorization below)
7. Add entries to Unreleased section (create section if missing)
8. Preserve all existing content exactly
9. **Verify:** New entry count matches new commit count (minus filtered)

## Commit Categorization

Map Conventional Commits prefixes to Keep a Changelog sections. See `references/changelog_format.md` for the full mapping, writing style, and anti-patterns.

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

Used by RELEASE mode when the user does not provide an explicit version.

**Step 1: Get current version**

```bash
git tag --sort=-v:refname | head -1
```

If no tags exist, treat the current version as `0.0.0`.

**Step 2: Scan commits for the highest bump signal**

Check all commits since the last tag: `git log --pretty=format:"%s%n%b" <last-tag>..HEAD`. Apply the highest-priority rule that matches:

| Priority | Signal | Bump |
|----------|--------|------|
| 1 | Breaking change — BREAKING CHANGE in body/footer, or type! suffix (feat!, fix!) | Major |
| 2 | New feature — feat or feat(scope) prefix | Minor |
| 3 | Bug fix or improvement — fix, perf, or other included types | Patch |

If all commits were filtered (docs, test, ci, chore only), output "No release needed" instead of a version.

**Step 3: Report**

```
Next version: X.Y.Z (bump — reason)
Commits since vCURRENT: N total (N included, N filtered)
```

Use the auto-detected version for the release entry and annotated tag. Do not ask the user.

See `references/changelog_format.md` for edge cases.

## Git Analysis Commands

```bash
# All commits since last tag
git log --oneline $(git describe --tags --abbrev=0 2>/dev/null || echo "")..HEAD

# Commits between tags
git log --oneline v1.0.0..v1.1.0

# Commits in date range
git log --oneline --since="2025-01-01" --until="2025-01-31"

# Current tags
git tag --sort=-v:refname | head -10
```

</instructions>

<formatting>

## Output Format

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
**Mode**: UPDATE
**Action**: No CHANGELOG.md found. Create from full git history. Commit.
**Steps**:
1. Generate CHANGELOG.md from all commits
2. `git add CHANGELOG.md`
3. `git commit -m "Add changelog from git history"`
**Output**: Created CHANGELOG.md and committed. Run `/changelog push` when ready to push.
</example>

<example>
**User request**: `/changelog` (existing CHANGELOG.md, new commits since last tag)
**Mode**: UPDATE
**Action**: Add new entries to Unreleased section. Commit.
**Steps**:
1. Update CHANGELOG.md with new Unreleased entries
2. `git add CHANGELOG.md`
3. `git commit -m "Update changelog with recent changes"`
**Output**: Updated Unreleased section and committed.
</example>

<example>
**User request**: `/changelog push`
**Mode**: PUSH
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
**Mode**: RELEASE
**Action**: Detect version from commit types (or use explicit version). Create versioned entry. Commit, tag, push.
**Steps (auto-detected)**:
1. Auto-detect version: v2.1.0 (minor bump, new features detected)
2. Write release entry to CHANGELOG.md
3. `git add CHANGELOG.md`
4. `git commit -m "Release v2.1.0"`
5. `git tag -a v2.1.0 -m "Release v2.1.0 - Dark mode and CSV export"`
6. `git push --follow-tags`
**Steps (explicit)**: Same, but skip auto-detection and use the provided version.
**Output**: Released vX.Y.Z, tagged, and pushed to remote.
</example>

<example>
**User request**: "Add this week's changes to the changelog"
**Mode**: UPDATE
**Action**: Run `git log --since="7 days ago"`, categorize, append to Unreleased section. Commit.
**Output**: Updated CHANGELOG.md with new entries under `## [Unreleased]` and committed.
</example>

## References

| File | Content |
|------|---------|
| `references/changelog_format.md` | Full Keep a Changelog spec, Conventional Commits mapping, writing style guide, anti-patterns, release workflow reference, complete example |
