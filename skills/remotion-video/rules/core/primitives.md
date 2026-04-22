---
name: primitives
description: Core layout and timing primitives in Remotion — Loop, Freeze, Series, Null, IFrame, AnimatedImage, and premount controls. Use when choosing between primitives or configuring their behaviour.
metadata:
  tags: loop, freeze, series, null, iframe, animated-image, premount, layout
---

Know which primitive to reach for before writing JSX. The wrong choice adds complexity without benefit.

## Loop

`<Loop>` repeats its children for a given number of frames. Use it for animated backgrounds, repeating icons, or any pattern that tiles in time.

```tsx title="Continuous background loop"
import { Loop } from "remotion";

export const Background = () => (
  <Loop durationInFrames={90}>
    <AnimatedPattern />
  </Loop>
);
```

Props:

- `durationInFrames` (required) — length of one iteration in frames
- `times?` — number of repetitions; defaults to `Infinity`
- `layout?` — `"absolute-fill"` (default) or `"none"`
- `style?` — CSS applied to the container when layout is `"absolute-fill"`

### Loop.useLoop()

Call inside a `<Loop>` child to read loop metadata. Returns `null` outside a loop.

```tsx title="Reading loop iteration"
import { Loop } from "remotion";

const Dot = () => {
  const loop = Loop.useLoop();
  const isEven = loop ? loop.iteration % 2 === 0 : false;
  return <div style={{ background: isEven ? "red" : "blue" }} />;
};
```

Return shape:

- `durationInFrames` — the loop's configured duration
- `iteration` — current repetition index, starting at `0`

Decision rule: use `Loop.useLoop()` when child appearance differs between iterations. Skip it when children are stateless.

## Freeze

`<Freeze>` locks all children to a specific frame. Use it to hold a frame as a thumbnail, pause an animation at a key pose, or conditionally pause during a loading state.

```tsx title="Hold frame 30 as a thumbnail"
import { Freeze } from "remotion";

<Freeze frame={30}>
  <MyScene />
</Freeze>
```

Props:

- `frame` (required) — the frame number to freeze to
- `active?` — boolean or `(currentFrame: number) => boolean`; defaults to `true`

Use the `active` callback to freeze only during a window:

```tsx title="Freeze until frame 60"
<Freeze frame={0} active={(f) => f < 60}>
  <IntroAnimation />
</Freeze>
```

Media behaviour when frozen: `<Video>` and `<OffthreadVideo>` pause at the frozen frame. `<Audio>` renders muted.

## Series

`<Series>` sequences children one after another without manual `from` offsets. Prefer it over stacking `<Sequence from={...}>` when scenes are strictly sequential.

```tsx title="Three scenes in sequence"
import { Series } from "remotion";

<Series>
  <Series.Sequence durationInFrames={60}>
    <Intro />
  </Series.Sequence>
  <Series.Sequence durationInFrames={90}>
    <Main />
  </Series.Sequence>
  <Series.Sequence durationInFrames={45}>
    <Outro />
  </Series.Sequence>
</Series>
```

`<Series.Sequence>` props:

- `durationInFrames?` — required for every child except the last, which may use `Infinity`
- `offset?` — positive delays the start (blank gap), negative overlaps the previous scene
- `layout?` — `"absolute-fill"` (default) or `"none"`
- `style?` — CSS when layout is `"absolute-fill"`
- `className?` — CSS class when layout is `"absolute-fill"`
- `premountFor?` — frames before the sequence's start to premount (see Premount section)

Offset example — 10-frame overlap between two scenes:

```tsx title="Overlapping scenes"
<Series>
  <Series.Sequence durationInFrames={60}>
    <SceneA />
  </Series.Sequence>
  <Series.Sequence durationInFrames={60} offset={-10}>
    <SceneB />
  </Series.Sequence>
</Series>
```

## Null

`<Null>` renders nothing. Use it as a placeholder in `<Series>` to create a blank pause without an empty `<AbsoluteFill>`.

```tsx title="Pause between scenes"
import { Null } from "remotion";

<Series>
  <Series.Sequence durationInFrames={60}>
    <SceneA />
  </Series.Sequence>
  <Series.Sequence durationInFrames={30}>
    <Null />
  </Series.Sequence>
  <Series.Sequence durationInFrames={60}>
    <SceneB />
  </Series.Sequence>
</Series>
```

## IFrame

`<IFrame>` embeds an external web page inside the composition. Use it to capture a live URL as part of a video frame. Requires the Chromium `--disable-web-security` flag to load cross-origin frames.

```tsx title="Embed a webpage"
import { IFrame } from "remotion";

<IFrame src="https://example.com" style={{ width: "100%", height: "100%" }} />;
```

Important: `<IFrame>` is non-deterministic unless the page content is static. Avoid it for pages that change between renders.

## AnimatedImage

`<AnimatedImage>` renders animated GIFs or WebP files frame-accurately. Use it instead of a plain `<img>` tag when the image is animated, so Remotion can control its playback position.

```tsx title="Frame-accurate GIF"
import { AnimatedImage } from "remotion";

<AnimatedImage src={staticFile("confetti.gif")} />;
```

Props match `<img>` attributes. Wrap in `<AbsoluteFill>` or position with CSS as needed.

## Premounting and postmounting

Premounting lets a sequence begin loading (fonts, assets, JS) before it becomes visible. This avoids a flash of unstyled or unprepared content.

Set `premountFor` on `<Series.Sequence>` or pass `premountFor` to `<Sequence>`:

```tsx title="Premount 30 frames early"
<Series.Sequence durationInFrames={90} premountFor={30}>
  <HeavyScene />
</Series.Sequence>
```

In v5, all sequences premount for 1 second (fps frames) by default. Set `premountFor={0}` to opt out.

`postmountFor` (on `<Sequence>`) keeps the component mounted for a number of frames after its visible window ends. Use it when an exit animation depends on state computed inside the component.

Decision rules:

- Use `premountFor` when a sequence has heavy asset loads (fonts, large images, complex React subtrees).
- Use `postmountFor` when an exit animation reads internal state.
- Set both to `0` when the component is lightweight and flash-free.

## Related

- `rules/core/timing.md` — interpolate and spring timing
- `rules/core/compositions.md` — Composition, calculateMetadata
- `rules/advanced/transitions-package.md` — TransitionSeries for crossfade-style cuts
