---
name: mediabunny-migration
description: Migrating from deprecated @remotion/media-parser and @remotion/webcodecs to the new Mediabunny-backed Video and Audio components. Use when updating a project that imports from these deprecated packages or when choosing video/audio components for a new project.
metadata:
  tags: mediabunny, migration, video, audio, media-parser, webcodecs, deprecation
---

Two packages are deprecated as of 1 February 2026 and will be removed in a future major version:

- `@remotion/media-parser` — deprecated
- `@remotion/webcodecs` — deprecated

Replace them with the new components from `@remotion/media`, which are backed by Mediabunny and offer frame-accurate, fast, minimal-fetch video and audio playback.

## What changed

The legacy `<Video>` and `<Audio>` components from the `remotion` package have been renamed to clarify their HTML5 implementation:

- `<Video>` (from `remotion`) → now `<Html5Video>`
- `<Audio>` (from `remotion`) → now `<Html5Audio>`

The new `<Video>` and `<Audio>` from `@remotion/media` replace them as the preferred components. They use Mediabunny under the hood for absolute frame accuracy and reduced data fetching.

## Install

```bash title="Add @remotion/media"
npm install @remotion/media
```

## Migration patterns

### Video

Before:

```tsx title="Old — Html5 video tag"
import { Video } from "remotion";

<Video src={staticFile("clip.mp4")} />
```

After:

```tsx title="New — Mediabunny-backed Video"
import { Video } from "@remotion/media";

<Video src={staticFile("clip.mp4")} />
```

The prop API is intentionally compatible. Swap the import path; remove the import from `"remotion"`.

### Audio

Before:

```tsx title="Old — Html5 audio tag"
import { Audio } from "remotion";

<Audio src={staticFile("soundtrack.mp3")} />
```

After:

```tsx title="New — Mediabunny-backed Audio"
import { Audio } from "@remotion/media";

<Audio src={staticFile("soundtrack.mp3")} />
```

### media-parser consumers

If you imported `parseMedia` or related utilities from `@remotion/media-parser`, consult the official Mediabunny migration guide at `/docs/mediabunny/new-video` for the replacement API. The new `<Video>` handles most use cases that previously required manual media parsing.

## Current recommendation (as of v4.x)

The `@remotion/media` package is still experimental. The Remotion team's current recommendation is:

- Videos: `<OffthreadVideo>` (from `remotion`) for production renders
- Audio: `<Html5Audio>` (from `remotion`) for production renders

Use `@remotion/media` components in new projects where you want to adopt the future default early, or in projects that already removed `@remotion/media-parser`. Do not mix `<Video>` from `remotion` and `<Video>` from `@remotion/media` in the same file — rename one import to avoid collision:

```tsx title="Avoid naming collision"
import { Video as MediaVideo } from "@remotion/media";
import { OffthreadVideo } from "remotion";
```

## Advantages of the new components

- Absolute frame accuracy — no drift on long clips
- Minimal data fetching — only the frames needed for the current render window are decoded
- Speed — faster than HTML5 tag-based rendering for remote sources

## Related

- `rules/media/video.md` — OffthreadVideo and Html5Video reference
- `rules/integration/v5-prep.md` — other v5 breaking changes
