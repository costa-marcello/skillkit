---
name: performance
description: Remotion render performance — OpenGL renderer selection, concurrency tuning, image format, GPU precompute, and benchmarking. Use when a render is slower than expected or when optimising for CI throughput.
metadata:
  tags: performance, hardware-acceleration, opengl, concurrency, jpeg, png, benchmark, gpu
---

Measure before optimising. Run `npx remotion benchmark` first; the output tells you whether the bottleneck is concurrency, encoding, or per-frame computation.

## Benchmark first

```bash title="Find optimal concurrency"
npx remotion benchmark
```

This renders the composition at several concurrency levels and reports frames-per-second for each. Use the result, not a guess, to set `--concurrency`.

## Concurrency

The default concurrency is one thread per logical CPU core. On cloud instances with many cores but limited GPU or memory, the default is often too high.

Rule of thumb:

- Local workstation with GPU: use the benchmark result
- Cloud (no GPU, 8+ cores): start at 4, benchmark up
- Lambda: concurrency is fixed per function; tune `framesPerLambda` instead

```bash title="Override concurrency at render time"
npx remotion render MyComp out/video.mp4 --concurrency=4
```

In the Node.js API:

```ts title="Set concurrency in renderMedia"
await renderMedia({
  composition,
  serveUrl,
  codec: "h264",
  outputLocation: "out/video.mp4",
  concurrency: 4,
});
```

## OpenGL renderer

Remotion uses Chromium to render frames. The OpenGL backend affects GPU usage and speed.

Set the renderer in `remotion.config.ts`:

```ts title="remotion.config.ts"
import { Config } from "@remotion/cli/config";

Config.setChromiumOpenGlRenderer("angle");
```

Available values:

- `"angle"` — use the ANGLE abstraction layer; works on macOS and Windows; best default for local development
- `"egl"` — use EGL directly; preferred on Linux with a real GPU (CI with NVIDIA, for example)
- `"swangle"` — software renderer via ANGLE; no GPU required; slowest but most compatible; use on headless Linux without GPU drivers
- `"swiftshader"` — pure software renderer; similar to swangle; kept for compatibility

For Docker on Linux without a GPU, use `"swangle"`. For Docker with a GPU driver, try `"egl"` first.

## Multi-process on Linux

Enable multi-process rendering on Linux to allow Chromium to spawn sub-processes:

```ts title="remotion.config.ts"
Config.setChromiumOptions({
  enableMultiProcessOnLinux: true,
});
```

Or pass it at render time:

```ts
await renderMedia({
  composition,
  serveUrl,
  codec: "h264",
  outputLocation: "out/video.mp4",
  chromiumOptions: {
    enableMultiProcessOnLinux: true,
  },
});
```

Disable this only if you are running inside a strict sandboxed environment that does not allow process forks.

## Image format: JPEG vs PNG

Remotion captures each frame as an image before encoding. PNG is lossless but slow to encode. JPEG is lossy but significantly faster.

Use JPEG unless:

- The composition has transparency (alpha channel)
- The content is a still image that must be pixel-perfect

```ts title="Prefer JPEG in renderMedia"
await renderMedia({
  composition,
  serveUrl,
  codec: "h264",
  outputLocation: "out/video.mp4",
  imageFormat: "jpeg",
  jpegQuality: 90,
});
```

CLI equivalent:

```bash
npx remotion render MyComp out/video.mp4 --image-format=jpeg --jpeg-quality=90
```

## Precompute heavy frames

GPU-intensive effects (WebGL, particle systems, complex filters) are expensive per frame. If the effect is static or pre-calculable:

- Pre-render it as an image sequence and load frames with `<Img src={staticFile(...)} />`
- Cache computed values with `useMemo` so they are not recalculated every frame

```tsx title="Cache a heavy computation"
import { useMemo } from "react";
import { useCurrentFrame } from "remotion";

const { frame } = { frame: useCurrentFrame() };
const vertices = useMemo(() => computeHeavyMesh(frame), [frame]);
```

## every-nth-frame for draft previews

During development, skip frames to iterate faster:

```bash title="Render every 5th frame"
npx remotion render MyComp out/draft.mp4 --every-nth-frame=5
```

The output is a lower-frame-rate preview. Do not use this for final renders.

## Identify slow frames

Run with verbose logging to surface the slowest frames:

```bash title="Verbose render log"
npx remotion render MyComp out/video.mp4 --log=verbose
```

The log shows per-frame timing. Frames above 200 ms usually contain unbounded computation or synchronous data fetching.

## Resolution scaling

Higher resolution multiplies per-frame work. Halving the resolution quarters the pixel count.

```bash title="Half-resolution render"
npx remotion render MyComp out/video.mp4 --scale=0.5
```

Use `--scale` for preview builds, not production.

## Related

- `rules/production/rendering.md` — full renderMedia option reference
- `rules/production/lambda.md` — Lambda concurrency and framesPerLambda
- `rules/integration/docker.md` — Docker setup for headless Linux rendering
