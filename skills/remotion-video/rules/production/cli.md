---
name: cli
description: Run Remotion tasks from the terminal using npx remotion subcommands. Use when rendering videos, stills, or bundles without a Node script, or when inspecting compositions and benchmarking.
metadata:
  tags: cli, render, still, studio, bundle, benchmark, compositions, npx, flags
---

Use `npx remotion <subcommand>` to drive the full Remotion workflow from the terminal.
All subcommands pick up settings from `remotion.config.ts` automatically.

## Subcommands at a glance

- `studio` — start the interactive preview UI
- `render` — render a video or audio file
- `still` — render a single frame as an image
- `compositions` — list registered compositions
- `bundle` — compile the project without rendering
- `benchmark` — measure render performance
- `upgrade` — update all Remotion packages to the same version
- `gpu` — print GPU/WebGL capabilities detected by Chrome
- `ffmpeg` — run the bundled FFmpeg binary
- `ffprobe` — run the bundled FFprobe binary

## studio

Starts the Studio development server with hot reload.

```bash title="Terminal"
npx remotion studio
npx remotion studio src/index.ts       # explicit entry point
npx remotion studio --port 3001        # custom port
```

Flags:

- `--port <n>` — HTTP port for the dev server (default: 3000 or next free port)
- `--log <level>` — verbosity: `error`, `warn`, `info` (default), `verbose`

## render

Renders a composition to a video, audio, or image-sequence file.

```bash title="Terminal"
npx remotion render <entry-point> <composition-id> <output-location>
npx remotion render src/index.ts MyComposition out/video.mp4
```

All three positional arguments are optional if set in `remotion.config.ts`.

### Top flags

`--codec <value>`
Choose the output codec. Options: `h264` (default), `h265`, `vp8`, `vp9`, `av1`, `prores`, `mp3`, `wav`, `aac`.

```bash title="Terminal"
npx remotion render src/index.ts MyComp out/video.mp4 --codec h265
```

`--crf <n>`
Constant Rate Factor. Lower = better quality, larger file. Ranges: H.264: 1–51 (default 18), H.265: 0–51 (default 23), VP8: 4–63 (default 9), VP9: 0–63 (default 28), AV1: 0–63 (default 30).

```bash title="Terminal"
npx remotion render src/index.ts MyComp out/video.mp4 --crf 23
```

`--image-format <value>`
Intermediate frame format: `jpeg` (default, faster) or `png` (lossless, needed for transparency).

`--pixel-format <value>`
Colour format for the encoded video. Common values: `yuv420p` (broadest compatibility), `yuv444p` (higher quality), `yuva420p` (transparency with VP8/VP9).

`--concurrency <n>`
Number of parallel Chrome instances. Default: half the CPU thread count. Increase for faster renders on powerful machines; decrease to reduce memory use.

```bash title="Terminal"
npx remotion render src/index.ts MyComp out/video.mp4 --concurrency 8
```

`--frames <start>-<end>` or `--frames <n>`
Render a subset of frames.

```bash title="Terminal"
npx remotion render src/index.ts MyComp out/partial.mp4 --frames 0-89
```

`--every-nth-frame <n>`
Render every Nth frame. Used for GIF output to reduce file size.

```bash title="Terminal"
npx remotion render src/index.ts MyComp out/anim.gif --every-nth-frame 2
```

`--scale <factor>`
Scale the output dimensions. `--scale 0.5` halves width and height. Range: 0 to 16.

`--props <json>`
Pass input props as a JSON string or a path to a JSON file.

```bash title="Terminal"
npx remotion render src/index.ts MyComp out/video.mp4 --props '{"title":"Hello"}'
npx remotion render src/index.ts MyComp out/video.mp4 --props ./data.json
```

`--log <level>`
Log verbosity: `error`, `warn`, `info` (default), `verbose`.

`--bundle-cache`
Whether to cache the Webpack bundle between runs. Speeds up repeated renders. Enabled by default.

`--timeout <ms>`
How long a single frame may wait for `delayRender()` calls before the render fails. Default: 30 000 ms.

`--prores-profile <profile>`
ProRes encoding profile when `--codec prores`. Options: `proxy`, `light`, `standard` (default), `hq`, `4444`, `4444-xq`.

`--overwrite`
Overwrite the output file if it already exists. Enabled by default.

`--muted`
Render without audio.

`--sequence`
Export an image sequence (one file per frame) instead of a video.

`--output <path>`
Alternative to the positional output-location argument.

Full example:

```bash title="Terminal"
npx remotion render src/index.ts MyComposition out/video.mp4 \
  --codec h264 \
  --crf 20 \
  --concurrency 6 \
  --props '{"title":"Launch"}' \
  --log verbose
```

## still

Renders a single frame to an image file.

```bash title="Terminal"
npx remotion still src/index.ts Thumbnail out/thumb.png
npx remotion still src/index.ts Thumbnail out/thumb.jpg --image-format jpeg --frame 30
```

Flags:

- `--frame <n>` — which frame to capture; default 0
- `--image-format <value>` — `png` (default), `jpeg`, `webp`, `pdf`
- `--jpeg-quality <n>` — 0–100; applies when `--image-format jpeg`
- `--scale <factor>` — output scale
- `--props <json>` — input props
- `--timeout <ms>` — `delayRender()` timeout; default 30 000
- `--log <level>` — verbosity
- `--bundle-cache` — reuse cached bundle
- `--output <path>` — output path alternative to positional argument

## compositions

Lists all compositions registered in the project.

```bash title="Terminal"
npx remotion compositions src/index.ts
```

Output shows each composition ID, its dimensions, fps, and duration in frames. Useful for scripting to discover available composition IDs before rendering.

Flags:

- `--props <json>` — pass input props so `calculateMetadata` can resolve dynamic values
- `--log <level>` — verbosity

## bundle

Compiles the project into a static bundle without rendering. Useful for deploying to a CDN or for Lambda pre-bundling.

```bash title="Terminal"
npx remotion bundle src/index.ts
npx remotion bundle src/index.ts --out-dir dist/remotion-bundle
```

Flags:

- `--out-dir <path>` — bundle output directory
- `--log <level>` — verbosity

## benchmark

Measures render performance across different concurrency levels.

```bash title="Terminal"
npx remotion benchmark src/index.ts MyComposition
```

Flags:

- `--concurrencies <csv>` — comma-separated concurrency values to test (e.g. `1,2,4,8`)
- `--runs <n>` — number of render passes per concurrency level; default 3
- `--frames <range>` — frame range to benchmark

## upgrade

Updates all `@remotion/*` packages to the same version to avoid version drift.

```bash title="Terminal"
npx remotion upgrade
```

Always run this after any `npm install` that touches Remotion packages.

## gpu

Prints GPU and WebGL renderer information from the headless Chrome instance. Run this to diagnose `--gl` option issues.

```bash title="Terminal"
npx remotion gpu
```

## ffmpeg and ffprobe

Run the FFmpeg or FFprobe binary that Remotion has installed, with the same flags as the standalone tools.

```bash title="Terminal"
npx remotion ffmpeg -i out/video.mp4 -c:v copy out/copy.mp4
npx remotion ffprobe out/video.mp4
```

## Related

- [rendering.md](../production/rendering.md) - Node.js SSR API for programmatic rendering
- [config.md](../production/config.md) - remotion.config.ts for project-wide CLI defaults
- [delay-render.md](../production/delay-render.md) - Controlling the --timeout flag behaviour
