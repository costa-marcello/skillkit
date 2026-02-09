# Marketplace Update Guide

After packaging a skill, update the marketplace registry so the skill is discoverable.

## New Skills

Add an entry to `.claude-plugin/marketplace.json`:

```json
{
  "name": "skill-name",
  "description": "Copy from SKILL.md frontmatter description",
  "source": "./",
  "strict": false,
  "version": "1.0.0",
  "category": "developer-tools",
  "keywords": ["relevant", "keywords"],
  "skills": ["./skill-name"]
}
```

## Updated Skills

Bump the version in `plugins[].version` following semver:

| Change Type | Version Bump | Examples |
|-------------|-------------|----------|
| Patch (1.0.x) | Bug fixes, typo corrections | Fixed broken path reference |
| Minor (1.x.0) | New features, additional references | Added new workflow step |
| Major (x.0.0) | Breaking changes, restructured workflows | Renamed frontmatter fields |

Also update `metadata.version` and `metadata.description` if the overall plugin collection changed significantly.
