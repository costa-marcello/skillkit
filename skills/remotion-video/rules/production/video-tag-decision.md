---
name: video-tag-decision
description: Choose the right video component for render vs Player contexts. Covers OffthreadVideo, Html5Video, Video from @remotion/media, trimBefore/trimAfter, loop, HLS, and ProRes support.
metadata:
  tags: video, offthreadvideo, html5video, media, render, player, loop, hls, prores
---

Use `<OffthreadVideo>` for server-side renders and `<Html5Video>` (from `@remotion/player`) for the Player until the Mediabunny path stabilises.

## Decision Summary

```
Rendering (Lambda / renderMedia)?     → <OffthreadVideo>
Player / browser preview?             → <Html5Video>
Need HLS or adaptive streaming?       → <Html5Video> only (OffthreadVideo cannot decode HLS)
Need frame-accurate ProRes output?    → <OffthreadVideo> with transparent={true} for alpha
Need loop inside a <Loop> wrapper?    → either — OffthreadVideo has no native loop prop
```

## OffthreadVideo

`<OffthreadVideo>` extracts frames via FFmpeg during rendering. It gives pixel-accurate results but is not available in the web renderer or browser-only contexts.

```tsx title="src/MyScene.tsx"
import { OffthreadVideo } from "remotion";
import { staticFile } from "remotion";

export const MyScene = () => (
  <OffthreadVideo
    src={staticFile("clip.mp4")}
    volume={0.8}
    playbackRate={1}
    trimBefore={30}
    trimAfter={120}
    pauseWhenBuffering
  />
);
```

`trimBefore` and `trimAfter` replace the deprecated `startFrom` and `endAt` props. Use the new names — do not mix them with the old ones on the same element.

`pauseWhenBuffering` propagates the buffer state to `@remotion/player` when previewing. It defaults to `false` in v4 and will default to `true` in v5.

## Html5Video

`<Html5Video>` is the browser-native `<video>` element managed by Remotion. Use it inside the Player when you need real-time preview with full browser codec support.

```tsx title="src/MyScene.tsx"
import { Html5Video } from "@remotion/player";
import { staticFile } from "remotion";

export const MyScene = () => (
  <Html5Video
    src={staticFile("clip.mp4")}
    volume={0.8}
    playbackRate={1}
    trimBefore={30}
    trimAfter={120}
    pauseWhenBuffering
  />
);
```

`<Html5Video>` supports HLS via browser-native decoding and works on Safari without additional configuration.

## Video from @remotion/media (Mediabunny)

The new `<Video>` from `@remotion/media` targets a unified component that works in both render and Player contexts. It is still stabilising as of early 2026. Use `<OffthreadVideo>` for renders and `<Html5Video>` for the Player until this path is marked stable in the official changelog.

## Prop Parity Reference

All three components share these common props:

- `src` — video URL or `staticFile()` path
- `volume` — static number or per-frame callback `(frame) => number`
- `playbackRate` — speed multiplier, minimum 0.1, no reverse
- `muted` — boolean to silence audio
- `trimBefore` — skip this many frames from the start of the source
- `trimAfter` — stop at this frame of the source
- `pauseWhenBuffering` — propagate buffer state to the Player

Props specific to `<OffthreadVideo>`:

- `transparent` — extract PNG frames with alpha (slower; use for overlays)
- `toneMapped` — adjust HDR colours for sRGB display (default `true`)
- `toneFrequency` — pitch shift during rendering (0.01–2)
- `audioStreamIndex` — select a specific audio track by index

## Loop Support

None of the components have a `loop` prop on their own. Wrap with `<Loop>` from `remotion`:

```tsx
import { Loop } from "remotion";
import { OffthreadVideo } from "remotion";

<Loop durationInFrames={60}>
  <OffthreadVideo src={staticFile("loop-clip.mp4")} />
</Loop>
```

Pass `loopVolumeCurveBehavior="repeat"` to `<OffthreadVideo>` to reset the volume envelope on each iteration.

## ProRes Output

Set `codec: "prores"` in `renderMedia` or `renderMediaOnLambda`. Use `<OffthreadVideo transparent={true}>` when the source has an alpha channel and you need to preserve it in the output.

## Related

- [lambda](./lambda.md) — rendering with OffthreadVideo on Lambda
- [player](./player.md) — embedding Html5Video in the Player
- [timing](../core/timing.md) — trimBefore/trimAfter in frame arithmetic
- [compositions](../core/compositions.md) — composition setup
