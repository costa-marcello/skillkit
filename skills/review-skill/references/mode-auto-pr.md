# Mode 4: Auto-PR

Fork, improve, and submit PR to external skill repository.

```
Auto-PR Workflow:
- [ ] Fork repository (gh repo fork)
- [ ] Create feature branch
- [ ] Run full deep review (Mode 1, Steps 2-4)
- [ ] Run Auto-Fix mode using review findings
- [ ] Self-review: respect check passed?
- [ ] Create PR with detailed explanation
```

## Core Principle: Additive Only

When improving external skills, do not:
- Delete existing files
- Remove functionality
- Change the primary language
- Rename components

Instead:
- Add new capabilities alongside existing ones
- Preserve original content intact
- Explain every change in the PR description

<example>
**Additive Changes**
- BAD: "Removed metadata.json (non-standard)"
- GOOD: "Added marketplace.json (metadata.json preserved)"
- BAD: "Rewrote README in English"
- GOOD: "Added README.en.md (Chinese preserved as default)"
</example>

## PR Tone Guidelines

<example>
**Respectful Framing**
- BAD: "Your skill doesn't follow best practices"
- GOOD: "This PR aligns with best practices for better discoverability"
- BAD: "Fixed the incorrect description"
- GOOD: "Improved description with trigger conditions"
</example>

## PR Required Sections

1. **Summary** - What this PR does
2. **What's NOT Changed** - Show respect for original
3. **Rationale** - Why each change helps
4. **Test Plan** - How to verify

Template: `references/pr_template.md`

## Self-Review Before Submitting

```
Respect Check:
- [ ] No files deleted?
- [ ] No functionality removed?
- [ ] Original language preserved?
- [ ] Author's design decisions respected?
- [ ] All changes are additive?
- [ ] PR explains the "why"?
```
