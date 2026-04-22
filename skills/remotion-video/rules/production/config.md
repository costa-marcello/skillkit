---
name: config
description: Configure Remotion project-wide defaults in remotion.config.ts using Config setters. Use when setting codec, image format, concurrency, timeouts, Webpack overrides, or any other project default that applies to all renders.
metadata:
  tags: config, remotion.config.ts, Config, codec, crf, concurrency, webpack, chromium, timeout
---

Use `remotion.config.ts` at the project root to set defaults that apply to every render and Studio session.
CLI flags and per-call API options override config values when provided.

## Minimal working config

```ts title="remotion.config.ts"
import { Config } from "@remotion/cli/config";

Config.setCodec("h264");
Config.setConcurrency(4);
Config.setDelayRenderTimeoutInMilliseconds(30_000);
```

Import `Config` from `@remotion/cli/config`, not from `remotion`. The wrong import path is the most common config mistake.

## Encoding

### setCodec(codec)

Sets the default output codec.

```ts title="remotion.config.ts"
Config.setCodec("h264");   // default — broadest compatibility
Config.setCodec("h265");   // smaller files, slower encoding
Config.setCodec("vp9");    // WebM, very small files, very slow
Config.setCodec("av1");    // smallest files, very slow, not on Lambda ARM
Config.setCodec("prores"); // broadcast-grade, macOS hardware acceleration
Config.setCodec("mp3");    // audio-only
Config.setCodec("wav");    // audio-only, lossless
Config.setCodec("aac");    // audio-only
```

### setImageFormat(format) / setVideoImageFormat(format)

Sets the intermediate frame format used during rendering. Does not affect the final encoded output format.

```ts title="remotion.config.ts"
Config.setVideoImageFormat("jpeg"); // default — faster, smaller temp files
Config.setVideoImageFormat("png");  // lossless, required for transparency
```

Use `png` when your composition has transparency and you are exporting to a codec that supports alpha (VP8, VP9 with `yuva420p`, ProRes 4444).

### setPixelFormat(format)

Sets the colour format for the encoded video.

```ts title="remotion.config.ts"
Config.setPixelFormat("yuv420p");  // broadest player compatibility (default for H.264)
Config.setPixelFormat("yuv444p");  // higher colour fidelity, less compatible
Config.setPixelFormat("yuva420p"); // with transparency for VP8/VP9
```

### setProResProfile(profile)

Sets the ProRes encoding profile when `codec` is `"prores"`.

```ts title="remotion.config.ts"
Config.setProResProfile("standard"); // ~147 Mbps, default
Config.setProResProfile("hq");       // ~220 Mbps
Config.setProResProfile("4444");     // ~330 Mbps, supports alpha
Config.setProResProfile("4444-xq");  // ~500 Mbps, supports alpha
Config.setProResProfile("light");    // ~102 Mbps
Config.setProResProfile("proxy");    // ~45 Mbps, offline editing proxy
```

### setCrf(value)

Sets the Constant Rate Factor. Lower values produce higher quality and larger files.

```ts title="remotion.config.ts"
Config.setCrf(18); // H.264 default — visually near-lossless
Config.setCrf(23); // H.265 default
Config.setCrf(28); // VP9 default
```

CRF ranges: H.264 1–51, H.265 0–51, VP8 4–63, VP9 0–63, AV1 0–63. Do NOT set `setCrf` and `setVideoBitrate` at the same time — they conflict.

### setHardwareAcceleration(mode)

Enables GPU-accelerated encoding where available.

```ts title="remotion.config.ts"
Config.setHardwareAcceleration("if-possible"); // use GPU, fall back to CPU
Config.setHardwareAcceleration("required");    // fail if GPU not available
Config.setHardwareAcceleration("disabled");    // CPU only
```

## Performance

### setConcurrency(value)

Sets the number of parallel Chrome instances used during rendering.

```ts title="remotion.config.ts"
import os from "os";

Config.setConcurrency(os.cpus().length / 2); // half CPU threads, good default
Config.setConcurrency(1);                     // single-threaded, lowest memory
```

More concurrency shortens render time but increases peak memory usage. On machines with less than 8 GB RAM, keep concurrency at 2 or below.

## Timeouts

### setDelayRenderTimeoutInMilliseconds(ms)

Sets the global timeout for `delayRender()` calls. Any per-call `timeoutInMilliseconds` option overrides this value.

```ts title="remotion.config.ts"
Config.setDelayRenderTimeoutInMilliseconds(30_000); // default: 30 seconds
Config.setDelayRenderTimeoutInMilliseconds(60_000); // extend for slow data fetches
```

Use `setPuppeteerTimeout(ms)` to set the Puppeteer navigation timeout separately from `delayRender()` (default: 30 000).

## Webpack

### overrideWebpackConfig(fn)

Passes the Webpack config through a customisation function before bundling.

```ts title="remotion.config.ts"
Config.overrideWebpackConfig((currentConfiguration) => {
  return {
    ...currentConfiguration,
    module: {
      ...currentConfiguration.module,
      rules: [
        ...(currentConfiguration.module?.rules ?? []),
        {
          test: /\.glsl$/,
          use: "raw-loader",
        },
      ],
    },
  };
});
```

Always spread the existing config rather than returning a fresh object. Replacing the full config removes Remotion's own Webpack rules and will break the build.

### setCachingEnabled(enabled)

Controls whether Webpack bundles are cached between runs.

```ts title="remotion.config.ts"
Config.setCachingEnabled(true);  // default — faster repeated renders
Config.setCachingEnabled(false); // disable if bundle output is stale
```

## Chromium

### setChromiumOpenGlRenderer(renderer)

Sets the OpenGL implementation Chrome uses for rendering. Change this when you see GL errors in headless environments.

```ts title="remotion.config.ts"
Config.setChromiumOpenGlRenderer("angle");   // default on most platforms
Config.setChromiumOpenGlRenderer("egl");     // Linux headless servers
Config.setChromiumOpenGlRenderer("swiftshader"); // software fallback, no GPU needed
Config.setChromiumOpenGlRenderer("swangle"); // SwANGLE, software ANGLE
```

### setBrowserExecutable(path)

Points to a custom Chrome or Chromium binary instead of the bundled one.

```ts title="remotion.config.ts"
Config.setBrowserExecutable("/usr/bin/google-chrome-stable");
```

## Paths

```ts title="remotion.config.ts"
Config.setEntryPoint("./src/index.ts");       // entry file; avoids repeating it on the CLI
Config.setPublicDir("./public");              // default; staticFile() resolves relative to this
Config.setDotEnvLocation("./.env.production"); // custom .env file at render time
```

## Complete annotated example

```ts title="remotion.config.ts"
import { Config } from "@remotion/cli/config";
import os from "os";

// Output
Config.setCodec("h264");
Config.setVideoImageFormat("jpeg");
Config.setPixelFormat("yuv420p");
Config.setCrf(18);

// Performance
Config.setConcurrency(Math.max(1, Math.floor(os.cpus().length / 2)));
Config.setCachingEnabled(true);

// Timeouts — extend if compositions fetch slow external data
Config.setDelayRenderTimeoutInMilliseconds(30_000);
Config.setPuppeteerTimeout(30_000);

// Paths
Config.setEntryPoint("./src/index.ts");
Config.setPublicDir("./public");

// Chromium — use egl on Linux CI, angle elsewhere
Config.setChromiumOpenGlRenderer(
  process.platform === "linux" ? "egl" : "angle"
);

// Webpack — example: add GLSL support
Config.overrideWebpackConfig((config) => ({
  ...config,
  module: {
    ...config.module,
    rules: [
      ...(config.module?.rules ?? []),
      { test: /\.glsl$/, use: "raw-loader" },
    ],
  },
}));
```

## Related

- [cli.md](../production/cli.md) - CLI flags that override config values
- [rendering.md](../production/rendering.md) - Node.js SSR API options that also override config
- [delay-render.md](../production/delay-render.md) - delayRender() timeout behaviour
