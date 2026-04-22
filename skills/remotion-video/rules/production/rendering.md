---
name: rendering
description: Render Remotion compositions programmatically from Node.js using @remotion/renderer. Use when building a render pipeline, CI integration, server-side rendering, or any non-CLI rendering workflow.
metadata:
  tags: rendering, ssr, node, bundle, renderMedia, renderStill, renderFrames, selectComposition, getCompositions
---

Use `@remotion/renderer` to render compositions from Node.js without the CLI.
This is the right approach for server-side pipelines, CI jobs, and any workflow that needs to trigger renders from application code.

## Installation

```bash title="Terminal"
npm install @remotion/renderer @remotion/bundler
```

`@remotion/bundler` compiles your Remotion project into a bundle. `@remotion/renderer` takes that bundle and produces output files.

## Complete working example

This script is the skeleton most render pipelines start from:

```ts title="scripts/render.ts"
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import path from "path";

const compositionId = "MyComposition";

const bundleLocation = await bundle({
  entryPoint: path.resolve("./src/index.ts"),
  webpackOverride: (config) => config,
});

const composition = await selectComposition({
  serveUrl: bundleLocation,
  id: compositionId,
  inputProps: {
    titleText: "Hello from Node",
  },
});

await renderMedia({
  composition,
  serveUrl: bundleLocation,
  codec: "h264",
  outputLocation: path.resolve(`out/${compositionId}.mp4`),
  inputProps: {
    titleText: "Hello from Node",
  },
  onProgress: ({ progress }) => {
    process.stdout.write(`\rRendering: ${Math.round(progress * 100)}%`);
  },
});

console.log("\nDone.");
```

Run it with:

```bash title="Terminal"
node --strip-types scripts/render.ts
```

## bundle()

`bundle()` compiles your Remotion project into a self-contained directory that the renderer can use.

```ts title="API"
bundle(options: BundleOptions): Promise<string>
```

Key parameters:

- `entryPoint` (string, required) — absolute path to your Remotion entry file (the file that calls `registerRoot`)
- `webpackOverride` (function, optional) — customise the Webpack config
- `outDir` (string, optional) — where to write the bundle; defaults to a temp directory
- `onProgress` (function, optional) — called with a 0–100 progress number
- `ignoreRegisterRootWarning` (boolean, optional) — suppress the warning when testing

```ts title="scripts/render.ts"
import { bundle } from "@remotion/bundler";
import path from "path";

const bundleLocation = await bundle({
  entryPoint: path.resolve("./src/index.ts"),
  onProgress: (progress) => {
    process.stdout.write(`\rBundling: ${progress}%`);
  },
});
```

## selectComposition()

`selectComposition()` evaluates a single composition and returns its resolved metadata. Use it instead of `getCompositions()` when you already know the composition ID.

```ts title="API"
selectComposition(options: SelectCompositionOptions): Promise<Composition>
```

Key parameters:

- `serveUrl` (string, required) — path returned by `bundle()` or a hosted URL
- `id` (string, required) — the composition ID
- `inputProps` (object, optional) — props passed to `calculateMetadata` and the root component
- `timeoutInMilliseconds` (number, optional) — timeout for `delayRender()` calls; default 30 000

```ts title="scripts/render.ts"
import { selectComposition } from "@remotion/renderer";

const composition = await selectComposition({
  serveUrl: bundleLocation,
  id: "MyComposition",
  inputProps: { titleText: "Hello" },
});

console.log(composition.durationInFrames); // resolved value from calculateMetadata
```

## getCompositions()

`getCompositions()` returns all registered compositions. Use it to enumerate what is available in a bundle.

```ts title="scripts/render.ts"
import { getCompositions } from "@remotion/renderer";

const comps = await getCompositions(bundleLocation, {
  inputProps: {},
});

comps.forEach((c) => console.log(c.id, c.width, c.height, c.fps));
```

## renderMedia()

`renderMedia()` is the main render function. It produces a video or audio file.

```ts title="API"
renderMedia(options: RenderMediaOptions): Promise<{
  buffer: Buffer | null;
  slowestFrames: Array<{ frame: number; time: number }>;
  contentType: string;
}>
```

Key parameters:

- `composition` (VideoConfig, required) — the object returned by `selectComposition()`
- `serveUrl` (string, required) — bundle location
- `codec` (string, required) — `"h264"`, `"h265"`, `"vp8"`, `"vp9"`, `"av1"`, `"prores"`, `"mp3"`, `"wav"`, `"aac"`
- `outputLocation` (string, optional) — if omitted, the rendered file is returned as a `Buffer`
- `inputProps` (object, optional) — props passed to the composition
- `crf` (number, optional) — constant rate factor; lower = higher quality
- `concurrency` (number | string, optional) — parallel Chrome instances; defaults to half the CPU count
- `scale` (number, optional) — output scale factor; default `1`
- `frameRange` (number | [number, number], optional) — render a subset of frames
- `muted` (boolean, optional) — omit audio track
- `imageFormat` (string, optional) — `"jpeg"` (default) or `"png"` for intermediate frames
- `onProgress` (function, optional) — called with `{ progress: number }` (0–1)
- `onStart` (function, optional) — called when rendering begins
- `onBrowserLog` (function, optional) — called with browser console output
- `makeCancelSignal` (function, optional) — returns a signal to cancel mid-render

```ts title="scripts/render.ts"
import { renderMedia, makeCancelSignal } from "@remotion/renderer";

const { cancel, cancelSignal } = makeCancelSignal();

setTimeout(cancel, 60_000); // cancel if render takes longer than 60 seconds

await renderMedia({
  composition,
  serveUrl: bundleLocation,
  codec: "h264",
  outputLocation: "out/video.mp4",
  inputProps: { titleText: "Hello" },
  crf: 18,
  concurrency: 4,
  onProgress: ({ progress }) => {
    process.stdout.write(`\rRendering: ${Math.round(progress * 100)}%`);
  },
  makeCancelSignal: () => cancelSignal,
});
```

## renderStill()

`renderStill()` renders a single frame to an image file.

```ts title="API"
renderStill(options: RenderStillOptions): Promise<{
  buffer: Buffer | null;
  contentType: string;
}>
```

Key parameters:

- `composition` (VideoConfig, required)
- `serveUrl` (string, required)
- `output` (string, required) — absolute path for the output image
- `frame` (number, optional) — which frame to render; default `0`
- `imageFormat` (string, optional) — `"png"` (default), `"jpeg"`, `"webp"`, `"pdf"`
- `inputProps` (object, optional)

```ts title="scripts/render-still.ts"
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "path";

const bundleLocation = await bundle({
  entryPoint: path.resolve("./src/index.ts"),
});

const composition = await selectComposition({
  serveUrl: bundleLocation,
  id: "Thumbnail",
  inputProps: {},
});

await renderStill({
  composition,
  serveUrl: bundleLocation,
  output: path.resolve("out/thumbnail.png"),
  frame: 0,
  imageFormat: "png",
  inputProps: {},
});
```

## renderFrames()

`renderFrames()` renders individual frames as image files without encoding a video. Use it with `stitchFramesToVideo()` when you need custom encoding steps between frame capture and final output.

```ts title="API"
renderFrames(options: RenderFramesOptions): Promise<{
  renderedFrames: number;
  assetsInfo: TRenderAsset[];
}>
```

Key parameters:

- `composition` (VideoConfig, required)
- `serveUrl` (string, required)
- `outputDir` (string, required) — directory to write frame images into
- `imageFormat` (string, optional) — `"jpeg"` or `"png"`
- `onFrameUpdate` (function, optional) — called after each frame with `{ renderedFrames: number }`

## stitchFramesToVideo()

`stitchFramesToVideo()` encodes frames from a directory into a video file.

```ts title="scripts/stitch.ts"
import { stitchFramesToVideo } from "@remotion/renderer";

await stitchFramesToVideo({
  dir: "/tmp/frames",
  outputLocation: "out/video.mp4",
  codec: "h264",
  fps: 30,
  width: 1920,
  height: 1080,
});
```

## makeCancelSignal()

`makeCancelSignal()` returns a `{ cancel, cancelSignal }` pair. Pass `cancelSignal` to `renderMedia()` or `renderFrames()` and call `cancel()` to abort the render cleanly.

```ts title="scripts/render.ts"
import { makeCancelSignal, renderMedia } from "@remotion/renderer";

const { cancel, cancelSignal } = makeCancelSignal();

process.on("SIGINT", cancel);

await renderMedia({
  // ...
  makeCancelSignal: () => cancelSignal,
});
```

## Related

- [cli.md](../production/cli.md) - CLI commands for quick renders without Node scripts
- [config.md](../production/config.md) - remotion.config.ts for project-wide defaults
- [delay-render.md](../production/delay-render.md) - Handling async work in components
