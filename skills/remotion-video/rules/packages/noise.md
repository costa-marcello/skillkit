---
name: noise
description: Seeded Perlin noise for procedural motion using @remotion/noise.
metadata:
  tags: noise, perlin, procedural, motion
---

Use `@remotion/noise` for smooth, non-repetitive procedural motion — camera shake, organic floating, particle jitter — without keyframing every value.

## Installation

```bash title="install"
npx remotion add @remotion/noise
```

## Functions

`noise2D(seed, x, y)` — 2-D Perlin noise. Returns a value in `[-1, 1]`.

`noise3D(seed, x, y, z)` — 3-D Perlin noise. Adds a third axis for layered variation.

`noise4D(seed, x, y, z, w)` — 4-D Perlin noise. Use when you need two independently varying spatial dimensions alongside time.

`seed` is any string. Different seeds produce uncorrelated fields — use distinct seeds for x and y motion so they move independently.

## Procedural float example

```tsx title="FloatingBadge.tsx"
import { noise2D } from "@remotion/noise";
import { useCurrentFrame, useVideoConfig } from "remotion";

const SPEED = 0.004;

export const FloatingBadge = () => {
  const frame = useCurrentFrame();

  const x = noise2D("badge-x", frame * SPEED, 0) * 20;
  const y = noise2D("badge-y", 0, frame * SPEED) * 20;

  return (
    <div
      style={{
        transform: `translate(${x}px, ${y}px)`,
        width: 120,
        height: 40,
        background: "royalblue",
        borderRadius: 8,
      }}
    />
  );
};
```

## Camera shake example

```tsx title="shake.tsx"
import { noise2D } from "@remotion/noise";
import { useCurrentFrame } from "remotion";

export const Shake: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const dx = noise2D("shake-x", frame * 0.5, 0) * 8;
  const dy = noise2D("shake-y", 0, frame * 0.5) * 8;

  return (
    <div style={{ transform: `translate(${dx}px, ${dy}px)` }}>{children}</div>
  );
};
```

## Rules

Use a low multiplier on `frame` (0.001–0.01) for smooth motion. Large multipliers produce jitter.

Noise is deterministic: the same `seed + frame` always returns the same value, so renders are reproducible.

## Related

- `animations` rule for `interpolate`-based motion
- `motion-blur` rule for adding blur to fast-moving elements
