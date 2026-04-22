---
name: docker
description: Running Remotion renders in Docker — base image, shared memory, fonts, Chromium flags, output permissions, and a GitHub Actions CI example. Use when containerising a render pipeline or debugging headless rendering failures.
metadata:
  tags: docker, dockerfile, ci, github-actions, chromium, linux, headless, shm
---

Start from the official recommended base image and add only what Chromium and Remotion require.

## Base image

Use `node:22-bookworm-slim`. It is smaller than the full Debian image, updated for better performance, and avoids Alpine Linux which causes 10+ second per-frame slowdowns due to Rust/musl incompatibilities.

NEVER use an Alpine-based image for Remotion renders.

## Dockerfile

```dockerfile title="Dockerfile"
FROM node:22-bookworm-slim

# Install Chromium system dependencies and fonts
RUN apt-get update && apt-get install -y \
  libnss3 \
  libdbus-1-3 \
  libatk1.0-0 \
  libgbm-dev \
  libasound2 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2 \
  libxkbcommon0 \
  libpango-1.0-0 \
  libcairo2 \
  fonts-noto-color-emoji \
  --no-install-recommends \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

# Render runs as root inside the container; fix output permissions
RUN mkdir -p /app/out && chmod 777 /app/out

CMD ["node", "render.mjs"]
```

## Shared memory

Chromium uses `/dev/shm` for inter-process communication. The Docker default of 64 MB causes crashes on multi-threaded renders.

Pass `--shm-size` when running the container:

```bash title="Standard render"
docker run --shm-size=1g remotion-render
```

For heavy compositions with many concurrent threads or large frame buffers:

```bash title="Heavy composition"
docker run --shm-size=2g remotion-render
```

Rule of thumb: 1 GB handles most renders up to 8 threads. Use 2 GB for 1080p at 12+ threads or 4K at any concurrency.

## CJK fonts

If your composition renders Japanese, Chinese, or Korean text, install the CJK font package:

```dockerfile title="Add CJK fonts"
RUN apt-get install -y fonts-noto-cjk --no-install-recommends
```

## Remotion config for Linux

Configure Chromium options in `remotion.config.ts` or in the render script. Both flags are important for headless Linux environments:

```ts title="remotion.config.ts"
import { Config } from "@remotion/cli/config";

Config.setChromiumOpenGlRenderer("swangle"); // software renderer; no GPU required
Config.setChromiumDisableWebSecurity(false);  // keep security on unless you need cross-origin iframes
```

In the Node.js render API:

```ts title="render.mjs"
import { renderMedia, selectComposition } from "@remotion/renderer";

await renderMedia({
  composition,
  serveUrl,
  codec: "h264",
  outputLocation: "/app/out/video.mp4",
  imageFormat: "jpeg",
  chromiumOptions: {
    enableMultiProcessOnLinux: true,
    gl: "swangle",
  },
});
```

Switch `gl` to `"egl"` if the host has a real GPU driver available (e.g. NVIDIA with proper drivers installed).

## Output file permissions

The render process inside Docker runs as root by default. If the output directory is mounted from the host, the written files may be owned by root. Pre-create the directory with open permissions (as shown in the Dockerfile above) or run the container as a specific UID:

```bash title="Run as host user"
docker run --user $(id -u):$(id -g) --shm-size=1g remotion-render
```

## GitHub Actions CI example

```yaml title=".github/workflows/render.yml"
name: Render video

on:
  workflow_dispatch:
    inputs:
      composition:
        description: Composition ID
        required: true

jobs:
  render:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build image
        run: docker build -t remotion-render .

      - name: Render
        run: |
          docker run \
            --shm-size=1g \
            -e REMOTION_SERVE_URL=${{ secrets.REMOTION_SERVE_URL }} \
            -v ${{ github.workspace }}/out:/app/out \
            remotion-render \
            node render.mjs --composition=${{ github.event.inputs.composition }}

      - name: Upload artifact
        uses: actions/upload-artifact@v4
        with:
          name: video
          path: out/
```

## Related

- `rules/production/performance.md` — concurrency and OpenGL renderer selection
- `rules/production/env-vars.md` — passing environment variables to the container
- `rules/production/lambda.md` — serverless alternative to self-hosted Docker rendering
