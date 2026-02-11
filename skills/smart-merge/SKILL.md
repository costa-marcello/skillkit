---
name: smart-merge
description: Merges branches with comprehensive validation while preserving feature branches. Use when user wants to merge PR, sync with main, update feature branch, complete merge, or finalize work. Runs full validation (tests, lint, CI, review comments), merges without deleting branches, and always returns to the working branch.
license: MIT
context: fork
---

# Smart Merge

Merges branches with comprehensive pre-merge validation while preserving your feature branch and staying on it.

## Two Merge Modes

| Mode | Direction | Purpose | Command |
|------|-----------|---------|---------|
| **Sync** | main → feature | Keep feature branch current with main | `git merge origin/main` |
| **PR Merge** | feature → main | Complete your work via PR | `gh pr merge --merge` |

**Key behavior:** Feature branch is NEVER deleted. You always stay on (or return to) your working branch.

## Quick Reference

```bash
# Sync: bring main into your feature branch
git fetch origin && git merge origin/main

# PR Merge: merge your PR without deleting branch
gh pr merge --merge  # Note: NO --delete-branch flag
```

---

## Pre-Merge Validation Checklist

**ALWAYS verify before ANY merge:**

| Check | Command | Required |
|-------|---------|----------|
| Tests passing | `pnpm test` / `npm test` / `pytest` | Yes |
| Lint clean | `pnpm lint` / `npm run lint` / `ruff check` | Yes |
| Type check | `pnpm typecheck` / `tsc --noEmit` / `mypy` | Yes |
| Build succeeds | `pnpm build` / `npm run build` | Yes |
| CI green (PR mode) | `gh pr checks $PR` | Yes |
| Comments replied (PR mode) | See comment check below | Yes |

### Language-Specific Validation

<details>
<summary>TypeScript/JavaScript</summary>

```bash
#!/bin/bash
set -e
echo "Running quality gate..."
pnpm typecheck || npx tsc --noEmit
pnpm lint || npm run lint
pnpm test || npm test
pnpm build || npm run build
echo "All checks passed"
```
</details>

<details>
<summary>Python</summary>

```bash
#!/bin/bash
set -e
echo "Running quality gate..."
mypy src/ || python -m mypy src/
ruff check src/ || pylint src/
pytest
echo "All checks passed"
```
</details>

<details>
<summary>Go</summary>

```bash
#!/bin/bash
set -e
echo "Running quality gate..."
go fmt ./... && test -z "$(gofmt -l .)"
golangci-lint run
go test ./...
go build ./...
echo "All checks passed"
```
</details>

---

## Mode 1: Sync (main → feature)

Use this to keep your feature branch up-to-date with main. Run regularly to catch conflicts early.

### Workflow

```bash
# 1. Save current branch name
FEATURE_BRANCH=$(git branch --show-current)

# 2. Fetch latest
git fetch origin

# 3. Run validation BEFORE merge
pnpm test && pnpm lint && pnpm typecheck

# 4. Merge main into feature
git merge origin/main

# 5. Resolve any conflicts, then:
git add .
git commit -m "chore: sync with main"

# 6. Run validation AFTER merge
pnpm test && pnpm lint && pnpm typecheck

# 7. Verify still on feature branch
git branch --show-current  # Should show $FEATURE_BRANCH
```

### Conflict Resolution

If conflicts occur:
1. Review conflicts: `git diff --name-only --diff-filter=U`
2. Resolve each file manually or with merge tool
3. Stage resolved files: `git add <file>`
4. Complete merge: `git commit`
5. Run validation again

### Alternative: Rebase (Linear History)

```bash
git fetch origin
git rebase origin/main
# If conflicts, resolve per commit, then: git rebase --continue
git push --force-with-lease  # Required after rebase
```

**Warning:** Only rebase local/personal branches. Never rebase shared branches.

---

## Mode 2: PR Merge (feature → main)

Use this when your work is complete and PR is approved.

### Pre-Merge Requirements

1. **All CI checks green**
2. **Code review approved**
3. **All review comments replied** (verify, don't reply from this skill)
4. **No merge conflicts**
5. **Tests pass locally**

### Check Review Comments

```bash
PR=$(gh pr view --json number -q '.number')
REPO=$(gh repo view --json nameWithOwner -q '.nameWithOwner')

# Count unreplied comments
UNREPLIED=$(gh api repos/$REPO/pulls/$PR/comments --jq '
  [.[] | select(.in_reply_to_id) | .in_reply_to_id] as $replied |
  [.[] | select(.in_reply_to_id == null) | select(.id | IN($replied[]) | not)]
  | length
' 2>/dev/null) || {
  echo "Warning: Could not fetch comments. Verify manually."
  UNREPLIED=0
}

if [ "$UNREPLIED" -gt 0 ]; then
  echo "STOP: $UNREPLIED unreplied comments. Address them first."
  exit 1
fi
```

### PR Merge Workflow

```bash
# 1. Save current branch
FEATURE_BRANCH=$(git branch --show-current)

# 2. Get PR info
PR=$(gh pr view --json number -q '.number')

# 3. Run full validation
pnpm test && pnpm lint && pnpm typecheck && pnpm build

# 4. Verify CI
gh pr checks $PR

# 5. Show PR summary
gh pr view $PR --json title,commits,changedFiles --jq '
  "Title: \(.title)\nCommits: \(.commits | length)\nFiles changed: \(.changedFiles)"
'

# 6. CONFIRM with user before proceeding

# 7. Execute merge (NO --delete-branch flag!)
gh pr merge $PR --merge --body "$(cat <<'EOF'
- Key change 1
- Key change 2

Tests: passed
Reviews: addressed
EOF
)"

# 8. Return to feature branch (gh pr merge switches to main)
git checkout "$FEATURE_BRANCH"
echo "Back on $FEATURE_BRANCH"
```

### Merge Message Format

Keep it concise (~10 lines max):

```
- Key change 1 (what was added/fixed)
- Key change 2
- Key change 3

Tests: X passed
Reviews: N/N addressed
Refs: #123, PROJ-456
```

---

## Post-Merge Verification

After ANY merge operation:

```bash
# 1. Verify you're on feature branch
git branch --show-current

# 2. Check clean state
git status

# 3. Verify merge in history
git log --oneline -5

# 4. Run full validation
pnpm test && pnpm lint && pnpm typecheck

# 5. Start application and smoke test
pnpm dev  # or: npm run dev
```

---

## Important Rules

### Do
- Run full validation (test, lint, typecheck) before merging
- Run validation again after merge completes
- Confirm with user before PR merge
- Return to feature branch after operations
- Keep feature branch intact (no deletion)

### Avoid
- Using `--delete-branch` flag (preserves your branch)
- Merging with failing tests or lint
- Skipping user confirmation on PR merge
- Replying to PR comments from this skill (use separate review workflow)
- Force pushing to shared branches

### Stop if
- Tests failing
- Lint errors exist
- CI checks pending or failing
- Unreplied review comments exist
- Merge conflicts unresolved

---

## Branch Preservation

This skill explicitly preserves your feature branch:

| Operation | Branch Status |
|-----------|---------------|
| Sync (main → feature) | Feature branch updated, stays checked out |
| PR Merge | Feature branch kept, switch back after merge |

If you WANT to delete after merge (rare):
```bash
# Only after successful merge AND you're done with the branch
git branch -d feature/my-branch           # local
git push origin --delete feature/my-branch # remote
```

---

## Error Recovery

**Merge failed mid-way:**
```bash
git merge --abort  # Cancel incomplete merge
git status         # Verify clean state
```

**Accidentally on wrong branch:**
```bash
git checkout feature/your-branch
```

**Need to undo merge:**
```bash
git reflog                    # Find commit before merge
git reset --hard HEAD~1       # Undo last merge commit
# Or: git reset --hard <sha>  # Reset to specific commit
```

---

## Comparison with Other Approaches

| Approach | Deletes Branch | Stays on Feature | This Skill |
|----------|----------------|------------------|------------|
| `gh pr merge --delete-branch` | Yes | No | Not used |
| `gh pr merge --merge` | No | Switches to main | Used + switch back |
| `git merge origin/main` | No | Yes | Used for sync |

---

## Related Workflows

- **Code Review**: Address comments before using PR merge mode
- **CI/CD**: Ensure all checks pass before merge
- **Conflict Resolution**: Resolve before completing merge
