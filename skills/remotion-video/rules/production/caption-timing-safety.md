---
name: caption-timing-safety
description: Write safe caption timing in Remotion. Fixes the #1 AI-written bug — non-monotonic inputRange in interpolate — with an adaptive fade window and @remotion/captions integration.
metadata:
  tags: captions, timing, interpolate, monotonic, fade, inputRange, subtitles
---

`interpolate` requires a **strictly monotonically increasing** `inputRange`. Passing two identical values (e.g. `[0, 0]` for a one-frame caption) throws a runtime error that crashes the render.

## The Bug

```ts title="BROKEN — crashes when durationInFrames is 1"
const opacity = interpolate(
  frame,
  [startFrame, startFrame + durationInFrames],
  [0, 1],
);
// If durationInFrames === 0, inputRange is [5, 5] — illegal
```

## The Fix: Adaptive Fade Window

Compute a fade window that is always shorter than the caption duration and always at least 1 frame.

```ts title="src/Caption.tsx"
import { interpolate, useCurrentFrame } from "remotion";

type CaptionProps = {
  text: string;
  startFrame: number;
  durationInFrames: number;
};

export const Caption = ({ text, startFrame, durationInFrames }: CaptionProps) => {
  const frame = useCurrentFrame();

  // Adaptive window: at most 10 frames, at most ⅓ of duration, at least 1
  const fadeWindow = Math.max(1, Math.min(10, Math.floor(durationInFrames / 3)));

  const opacity = interpolate(
    frame,
    [
      startFrame,
      startFrame + fadeWindow,
      startFrame + durationInFrames - fadeWindow,
      startFrame + durationInFrames,
    ],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <div
      style={{
        opacity,
        position: "absolute",
        bottom: 80,
        left: 0,
        right: 0,
        textAlign: "center",
        fontSize: 48,
        color: "white",
        textShadow: "0 2px 8px rgba(0,0,0,0.8)",
      }}
    >
      {text}
    </div>
  );
};
```

The four-stop inputRange `[start, start+fade, end-fade, end]` stays strictly monotonic as long as `fadeWindow >= 1` and `durationInFrames >= 3`. For very short captions (1–2 frames) the formula collapses cleanly because `Math.min` keeps the window at 1.

## Per-Word vs Per-Line Timing

Per-word captions require a separate `durationInFrames` per word. Compute it from the word's time range in the transcript.

```ts title="src/word-captions.ts"
type Word = { text: string; startMs: number; endMs: number };

function wordToFrames(word: Word, fps: number) {
  const startFrame = Math.round((word.startMs / 1000) * fps);
  const endFrame = Math.round((word.endMs / 1000) * fps);
  return {
    startFrame,
    durationInFrames: Math.max(1, endFrame - startFrame),
  };
}
```

Always enforce `Math.max(1, ...)` on `durationInFrames`. A transcript that has `startMs === endMs` for a word (common in whisper output for punctuation) produces a zero-duration caption without this guard.

## @remotion/captions Integration

`@remotion/captions` provides the `Caption` shape and transcript parsing utilities.

```ts title="src/use-captions.ts"
import { Caption } from "@remotion/captions";

// Caption shape from @remotion/captions
type CaptionShape = {
  text: string;
  startMs: number;
  endMs: number;
  confidence: number | null;
};

function captionToProps(caption: CaptionShape, fps: number) {
  const startFrame = Math.round((caption.startMs / 1000) * fps);
  const rawDuration = Math.round(((caption.endMs - caption.startMs) / 1000) * fps);
  return {
    text: caption.text,
    startFrame,
    durationInFrames: Math.max(1, rawDuration),
  };
}
```

Pass the result directly to the `<Caption>` component above. The adaptive fade window handles any duration automatically.

## Related

- [timing](../core/timing.md) — interpolate and Bézier easing fundamentals
- [input-props](./input-props.md) — validating caption data at the render boundary
- [player](./player.md) — previewing captions in the Player
