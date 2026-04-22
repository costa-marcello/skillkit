---
name: determinism
description: Keep Remotion compositions deterministic so parallel renders produce identical frames. Use when generating random values, reading time, or loading static assets inside components.
metadata:
  tags: determinism, random, Math.random, seed, staticFile, parallel rendering
---

Use `random(seed)` from `remotion` whenever you need a pseudorandom number inside a composition.
Remotion spins up multiple Chrome instances to render frames in parallel.
Non-deterministic calls produce a different value in each instance, which causes frames to flicker or differ from the preview.

## Why non-determinism breaks rendering

Each parallel Chrome instance runs your component code independently. If `Math.random()` returns `0.42` in instance A and `0.91` in instance B for the same frame, the output frames will differ. Remotion then stitches together frames from different instances, resulting in flickering or visual glitches that are hard to reproduce.

The same problem applies to any value that changes between calls:

- `Math.random()` — different value every call
- `Date.now()` — different timestamp on every instance
- `new Date()` — same issue as `Date.now()`
- `performance.now()` — different elapsed time on each instance

## The solution: random(seed)

```ts title="src/MyComposition.tsx"
import { random } from "remotion";

// FORBIDDEN
const x = Math.random();

// CORRECT — same value every time for seed "particle-x-0"
const x = random("particle-x-0");
```

`random(seed)` returns a number between 0 and 1. Given the same seed, it always returns the same value, across all parallel instances and across rerenders.

## Using seeds in loops

Combine a stable identifier with an index to generate a unique seed per element:

```ts title="src/Particles.tsx"
import { random } from "remotion";

const particles = new Array(50).fill(0).map((_, i) => ({
  x: random(`particle-x-${i}`) * compositionWidth,
  y: random(`particle-y-${i}`) * compositionHeight,
  size: random(`particle-size-${i}`) * 20 + 5,
  opacity: random(`particle-opacity-${i}`),
}));
```

The string seed acts as a namespace. Use descriptive names so seeds do not accidentally collide across different uses.

## Using seeds with frame-based animation

To animate a random value over time while keeping it deterministic, seed on both the element identity and the frame:

```ts title="src/Confetti.tsx"
import { random, useCurrentFrame } from "remotion";

const frame = useCurrentFrame();

const flickers = new Array(20).fill(0).map((_, i) => ({
  opacity: random(`flicker-${i}-${frame}`),
}));
```

## True randomness when needed

If you genuinely need a different value on every call and do not care about determinism, pass `null`:

```ts title="src/MyComposition.tsx"
import { random } from "remotion";

const trueRandom = random(null); // different every call
```

It is also safe to use `Math.random()` or `Date.now()` inside `calculateMetadata()`, because that function runs once before rendering begins, not once per parallel instance.

## Static assets: use staticFile()

Do NOT hardcode file paths as bare strings. Use `staticFile()` to reference assets in your `public/` directory:

```ts title="src/MyComposition.tsx"
import { staticFile } from "remotion";

// FORBIDDEN
const src = "/public/background.mp4";

// CORRECT
const src = staticFile("background.mp4");
```

`staticFile()` resolves the correct URL for both the Studio development server and the production renderer, regardless of where the bundle is hosted.

## Related

- [delay-render.md](../production/delay-render.md) - Handling async work without hanging renders
- [rendering.md](../production/rendering.md) - Node.js SSR API for programmatic rendering
- [config.md](../production/config.md) - remotion.config.ts configuration reference
