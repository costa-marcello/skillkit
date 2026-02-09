# Setup: skill-creator Installation

Optional dependency for automated validation scripts.

## Installation Script

```bash
#!/bin/bash
set -e

# Check claude CLI exists
if ! command -v claude &> /dev/null; then
    echo "Error: claude CLI not found"
    echo "Install from: https://docs.anthropic.com/claude-code"
    exit 1
fi

# Check if skill-creator already exists
SKILL_CREATOR=$(find ~/.claude/plugins/cache -name "skill-creator" -type d 2>/dev/null | head -1)

if [ -n "$SKILL_CREATOR" ]; then
    echo "skill-creator already installed at: $SKILL_CREATOR"
    exit 0
fi

# Install from daymade-skills marketplace
echo "Installing skill-creator..."
if ! claude plugin marketplace add https://github.com/daymade/claude-code-skills; then
    echo "Error: Failed to add marketplace"
    exit 1
fi

if ! claude plugin install skill-creator@daymade-skills; then
    echo "Error: Failed to install skill-creator"
    exit 1
fi

SKILL_CREATOR=$(find ~/.claude/plugins/cache -name "skill-creator" -type d 2>/dev/null | head -1)
echo "Installed successfully at: $SKILL_CREATOR"
```

## Manual Fallback

If installation fails, use manual evaluation via `references/evaluation_checklist.md`.

## Validation Commands

Once installed:

```bash
# Quick structural validation
python3 "$SKILL_CREATOR"/*/quick_validate.py <target-skill>

# Security scan
python3 "$SKILL_CREATOR"/*/security_scan.py <target-skill> --verbose
```
