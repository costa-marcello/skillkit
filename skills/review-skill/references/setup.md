# Setup: create-skill Installation

Optional dependency for automated validation scripts.

## Installation

```bash
npx skills add costa-marcello/skillkit/create-skill
```

Check the create-skill is available after installation:

```bash
ls ~/.claude/skills/create-skill/scripts/
```

You should see `quick_validate.py` and `security_scan.py`.

## Manual Fallback

If installation fails, use manual evaluation via `references/evaluation_checklist.md`.

## Validation Commands

Once installed, set the path and run:

```bash
SKILL_CREATOR=~/.claude/skills/create-skill

# Quick structural validation
python3 "$SKILL_CREATOR"/scripts/quick_validate.py <target-skill>

# Security scan
python3 "$SKILL_CREATOR"/scripts/security_scan.py <target-skill> --verbose
```
