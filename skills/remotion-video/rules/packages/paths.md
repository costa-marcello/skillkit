---
name: paths
description: SVG path utilities from @remotion/paths for animating and transforming SVG paths.
metadata:
  tags: paths, svg, animation, morph
---

Use `@remotion/paths` to measure, sample, transform, and interpolate SVG path data at render time.

## Installation

```bash title="install"
npx remotion add @remotion/paths
```

## Core functions

`getLength(path)` — returns the total arc length of a path string. Use it to normalise progress values.

`getPointAtLength(path, length)` — returns `{ x, y, angle }` at a given arc distance. Use for placing objects along a track.

`interpolatePath(progress, pathA, pathB)` — blends two SVG path strings by interpolating each command. Both paths MUST have identical command structures.

`translatePath(path, x, y)` — shifts every point by a fixed offset without a `transform` attribute.

`reversePath(path)` — reverses winding order; useful for stroke-dashoffset tricks.

`warpPath(path, fn)` — applies a point-mapping function to every coordinate. Use for wave, bulge, or noise distortion effects.

## Path morph example

```tsx title="PathMorph.tsx"
import { interpolatePath } from "@remotion/paths";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";

const STAR =
  "M 100 10 L 120 80 L 190 80 L 130 120 L 150 190 L 100 150 L 50 190 L 70 120 L 10 80 L 80 80 Z";
const CIRCLE =
  "M 100 10 C 144 10 190 55 190 100 C 190 145 144 190 100 190 C 55 190 10 145 10 100 C 10 55 55 10 100 10 Z";

export const PathMorph = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const progress = interpolate(frame, [0, durationInFrames - 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const d = interpolatePath(progress, STAR, CIRCLE);

  return (
    <svg viewBox="0 0 200 200" width={200} height={200}>
      <path d={d} fill="cornflowerblue" />
    </svg>
  );
};
```

## Animate along a path

```tsx title="AlongPath.tsx"
import { getLength, getPointAtLength } from "@remotion/paths";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";

const TRACK = "M 0 100 Q 200 0 400 100 Q 600 200 800 100";
const totalLength = getLength(TRACK);

export const Ball = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const travelled = interpolate(frame, [0, 3 * fps], [0, totalLength], {
    extrapolateRight: "clamp",
  });

  const { x, y, angle } = getPointAtLength(TRACK, travelled);

  return (
    <svg viewBox="0 0 800 200" width={800} height={200}>
      <path d={TRACK} fill="none" stroke="#ccc" strokeWidth={2} />
      <circle cx={x} cy={y} r={10} fill="tomato" />
    </svg>
  );
};
```

## Rules

`interpolatePath` requires matching command counts — mismatched paths produce garbled output.

Compute `getLength` outside the component (module scope) so it runs once, not on every frame.

## Related

- `@remotion/shapes` for pre-built geometric SVG shapes
- `animations` rule for `interpolate` usage patterns
