---
name: smart-merge
description: Merges branches with comprehensive validation while preserving feature branches. Use when user wants to merge PR, sync with main, update feature branch, complete merge, or finalize work. Runs full validation (tests, lint, CI, review comments), merges without deleting branches, and always returns to the working branch.
license: MIT
context: fork
agent: general-purpose
allowed-tools: Read, Grep, Glob, Bash(git *), Bash(gh *), Bash(pnpm *), Bash(npm *), Bash(npx *), Bash(yarn *), Bash(pytest *), Bash(python *), Bash(mypy *), Bash(ruff *), Bash(pylint *), Bash(go *), Bash(golangci-lint *), Bash(wc *)
---

# Smart Merge

Merges branches with pre-merge validation while preserving your feature branch.

## Two Merge Modes

| Mode | Direction | Purpose | Core Command |
|------|-----------|---------|--------------|
| **Sync** | main -> feature | Keep feature branch current | `git merge origin/main` |
| **PR Merge** | feature -> main | Complete work via PR | `gh pr merge --merge` |

Feature branch is never deleted. You stay on (or return to) your working branch after every operation.

## Package Manager Detection

Detect the project's package manager before running validation. The script checks in priority order: `pnpm-lock.yaml` wins over any other lock file, so projects with multiple lock files default to pnpm.

| Lock File | Manager | Run Command |
|-----------|---------|-------------|
| `pnpm-lock.yaml` | pnpm | `pnpm <script>` |
| `package-lock.json` | npm | `npm run <script>` |
| `yarn.lock` | yarn | `yarn <script>` |
| `requirements.txt` / `pyproject.toml` | pip/poetry | `pytest` / `ruff check` / `mypy` |
| `go.mod` | go | `go test ./...` / `go build ./...` |

```bash
# Auto-detect package manager (pnpm wins on ties)
if [ -f pnpm-lock.yaml ]; then PM="pnpm"
elif [ -f yarn.lock ]; then PM="yarn"
elif [ -f package-lock.json ]; then PM="npm run"
elif [ -f go.mod ]; then PM="go"
elif [ -f pyproject.toml ] || [ -f requirements.txt ]; then PM="python"
else PM="pnpm"; fi
```

<instructions>

## Pre-Merge Validation

Run these checks before every merge. Stop and report failures instead of proceeding.

| Check | JS/TS Command | Python Command | Go Command | Gate |
|-------|---------------|----------------|------------|------|
| Type check | `$PM typecheck` or `npx tsc --noEmit` | `mypy src/` | `go vet ./...` | Block |
| Lint | `$PM lint` | `ruff check src/` | `golangci-lint run` | Block |
| Tests | `$PM test` | `pytest` | `go test ./...` | Block |
| Build | `$PM build` | N/A | `go build ./...` | Block |
| CI green | `gh pr checks $PR` | Same | Same | Block (PR mode only) |
| Comments replied | See comment check below | Same | Same | Block (PR mode only) |

If any check fails, stop the merge and report which check failed with the full error output.

## Mode 1: Sync (main -> feature)

Bring main into your feature branch. Run regularly to catch conflicts early.

**Steps:**

1. Save current branch: `FEATURE_BRANCH=$(git branch --show-current)`
2. Fetch latest: `git fetch origin`
3. Run pre-merge validation (all checks above except CI and comments)
4. Merge main into feature: `git merge origin/main`
5. If conflicts occur, resolve them (see Conflict Resolution below)
6. Run validation again after merge completes
7. Verify you are still on `$FEATURE_BRANCH`: `git branch --show-current`

**Conflict Resolution:**

1. List conflicted files: `git diff --name-only --diff-filter=U`
2. Resolve each file
3. Stage resolved files: `git add <file>` (stage each file by name, not `git add .`)
4. Complete merge: `git commit`
5. Re-run validation

**Rebase alternative (linear history):**

Use rebase only on local/personal branches, never on shared branches.

```bash
git fetch origin
git rebase origin/main
# On conflicts: resolve, then git rebase --continue
git push --force-with-lease
```

## Mode 2: PR Merge (feature -> main)

Merge your PR after approval. Confirm with the user before executing the merge.

**Steps:**

1. Save current branch: `FEATURE_BRANCH=$(git branch --show-current)`
2. Get PR number: `PR=$(gh pr view --json number -q '.number')`
3. Check for unreplied review comments (see below). If any exist, stop and report them.
4. Run full pre-merge validation (all checks including CI)
5. Show PR summary to user:
   ```bash
   gh pr view $PR --json title,commits,changedFiles --jq '
     "Title: \(.title)\nCommits: \(.commits | length)\nFiles changed: \(.changedFiles)"
   '
   ```
6. Ask the user to confirm before proceeding
7. Pick merge strategy. Default to `--merge`. Use `--squash` if the repo enforces squash merges, `--rebase` if it enforces linear history. Check repo policy: `gh repo view --json mergeCommitAllowed,squashMergeAllowed,rebaseMergeAllowed`
8. Execute merge (do not use `--delete-branch`):
   ```bash
   gh pr merge $PR --merge --body "$(cat <<'EOF'
   - Key change 1
   - Key change 2

   Tests: passed
   Reviews: addressed
   EOF
   )"
   ```
9. Return to feature branch: `git checkout "$FEATURE_BRANCH"`

**Check unreplied review comments:**

```bash
PR=$(gh pr view --json number -q '.number')
REPO=$(gh repo view --json nameWithOwner -q '.nameWithOwner')

UNREPLIED=$(gh api repos/$REPO/pulls/$PR/comments --jq '
  [.[] | select(.in_reply_to_id) | .in_reply_to_id] as $replied |
  [.[] | select(.in_reply_to_id == null) | select(.id | IN($replied[]) | not)]
  | length
' 2>/dev/null) || {
  echo "Warning: Could not fetch comments. Verify manually."
  UNREPLIED=0
}

if [ "$UNREPLIED" -gt 0 ]; then
  echo "Blocked: $UNREPLIED unreplied comments. Address them before merging."
  exit 1
fi
```

## Post-Merge Verification

Run this checklist after every merge operation:

```
Post-Merge Checklist:
- [ ] On correct branch: git branch --show-current
- [ ] Clean working tree: git status
- [ ] Merge visible in history: git log --oneline -5
- [ ] Validation passes: $PM test && $PM lint && $PM typecheck
```

If any check fails, see Error Recovery below.

## Merge Message Format

Keep merge messages under 10 lines:

```
- Key change 1 (what was added/fixed)
- Key change 2
- Key change 3

Tests: X passed
Reviews: N/N addressed
Refs: #123, PROJ-456
```

</instructions>

## Rules

| Rule | Action |
|------|--------|
| Run validation before and after every merge | Block the merge on any failure |
| Confirm with user before PR merge | Show PR summary first, then ask |
| Never use `--delete-branch` flag | Feature branch must survive the merge |
| Never reply to PR comments from this skill | Report unreplied comments, let user handle them |
| Never force push to shared branches | Use `--force-with-lease` only on personal branches after rebase |
| Stop on failing tests, lint errors, pending CI, unreplied comments, or unresolved conflicts | Report the failure and do not proceed |

## Branch Preservation

| Operation | Branch Status After |
|-----------|---------------------|
| Sync (main -> feature) | Feature branch updated, stays checked out |
| PR Merge (feature -> main) | Feature branch kept, switched back after merge |

To delete a branch after merge (only when the user explicitly requests it):

```bash
git branch -d feature/my-branch           # local
git push origin --delete feature/my-branch # remote
```

## Error Recovery

**Merge failed mid-way:**
```bash
git merge --abort  # Cancel incomplete merge
git status         # Verify clean state
```

**On wrong branch after merge:**
```bash
git checkout "$FEATURE_BRANCH"
```

**Undo a completed merge:**
```bash
git reflog                  # Find the commit before the merge
git reset --hard <sha>      # Reset to that commit
```

<example>
**Sync: Simple merge with no conflicts**

User: "Sync my branch with main"

1. Detected pnpm from `pnpm-lock.yaml`
2. Ran `pnpm test && pnpm lint && pnpm typecheck` -- all passed
3. Ran `git fetch origin && git merge origin/main` -- fast-forward merge
4. Ran validation again -- all passed
5. Confirmed on branch `feature/auth-flow`

Result: Branch synced, 0 conflicts, all checks green.
</example>

<example>
**Sync: Merge with conflicts**

User: "Update my feature branch from main"

1. Detected npm from `package-lock.json`
2. Ran `npm run test && npm run lint` -- passed
3. Ran `git fetch origin && git merge origin/main` -- 2 conflicts in `src/api.ts` and `src/config.ts`
4. Listed conflicts: `git diff --name-only --diff-filter=U`
5. Resolved both files, staged with `git add src/api.ts src/config.ts`
6. Completed merge: `git commit`
7. Ran validation again -- passed
8. Confirmed on branch `feature/new-api`

Result: Branch synced, 2 conflicts resolved, all checks green.
</example>

<example>
**PR Merge: Successful merge after review**

User: "Merge my PR"

1. Detected pnpm, ran full validation -- all passed
2. Checked unreplied comments -- 0 unreplied
3. Verified CI: `gh pr checks 47` -- all green
4. Showed summary: "Title: Add auth module | Commits: 3 | Files changed: 7"
5. User confirmed
6. Ran `gh pr merge 47 --merge` (no `--delete-branch`)
7. Returned to `feature/auth-module` with `git checkout`

Result: PR #47 merged, feature branch preserved, back on working branch.
</example>

<example>
**PR Merge: Blocked by unreplied comments**

User: "Merge my PR into main"

1. Detected pnpm, ran validation -- all passed
2. Checked unreplied comments -- found 2 unreplied
3. Stopped. Reported: "Blocked: 2 unreplied review comments on PR #32. Address them before merging."

Result: Merge blocked. User needs to reply to review comments first.
</example>
