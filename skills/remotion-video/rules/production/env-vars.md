---
name: env-vars
description: Managing environment variables in Remotion — prefix convention, .env loading, secrets via inputProps or envVariables, and studio-vs-renderer differences. Use when configuring runtime values or passing secrets safely.
metadata:
  tags: env, environment-variables, secrets, inputProps, dotenv, security
---

Expose only what Remotion needs, using the right channel for each context.

## REMOTION_ prefix

CLI variables must be prefixed with `REMOTION_` to reach the Webpack bundle. Variables without this prefix are filtered out as a safety measure — they do not appear in `process.env` inside React components.

```bash title="Expose a variable to the bundle"
REMOTION_API_BASE=https://api.example.com npx remotion studio
```

Inside a component:

```tsx
const base = process.env.REMOTION_API_BASE;
```

## .env file location

Remotion reads `.env` and `.env.local` from the Remotion root directory. Override the location with `Config.setDotEnvLocation()` in `remotion.config.ts`:

```ts title="remotion.config.ts"
import { Config } from "@remotion/cli/config";

Config.setDotEnvLocation(".env.production");
```

This setting applies when running the Studio and CLI renders. It does not affect the Node.js render APIs.

## Studio vs renderer

The Studio and CLI load `.env` automatically. The Node.js render APIs do NOT load dotenv files — they run in a plain Node context.

When calling `renderMedia()`, `renderMediaOnLambda()`, or `renderMediaOnVercel()` you must pass variables explicitly via the `envVariables` option:

```ts title="Pass env vars to renderMedia"
import { renderMedia, selectComposition } from "@remotion/renderer";

const composition = await selectComposition({
  serveUrl: bundleLocation,
  id: "MyComp",
  inputProps: {},
});

await renderMedia({
  composition,
  serveUrl: bundleLocation,
  codec: "h264",
  outputLocation: "out/video.mp4",
  envVariables: {
    REMOTION_API_BASE: process.env.API_BASE ?? "",
  },
});
```

Variables in `envVariables` become available as `process.env.REMOTION_*` inside React components during rendering.

## Secrets — NEVER hard-code

NEVER put API keys, tokens, or passwords directly in component code or in a committed `.env` file.

Pass secrets through one of two safe channels:

**Option 1 — inputProps:** serialize the secret as a prop at render time. The value stays in the render call and never touches the bundle.

```ts title="Secret via inputProps"
await renderMedia({
  composition,
  serveUrl: bundleLocation,
  codec: "h264",
  outputLocation: "out/video.mp4",
  inputProps: { apiKey: process.env.MY_API_KEY },
});
```

**Option 2 — envVariables:** pass the secret as a named variable that maps to `process.env` inside the composition.

```ts title="Secret via envVariables"
await renderMedia({
  composition,
  serveUrl: bundleLocation,
  codec: "h264",
  outputLocation: "out/video.mp4",
  envVariables: { REMOTION_API_KEY: process.env.MY_API_KEY ?? "" },
});
```

Note: `envVariables` is for component-level configuration. Do not pass AWS credentials or cloud provider tokens here — those belong in the server environment where the render process runs.

## Related

- `rules/production/rendering.md` — renderMedia and renderMediaOnLambda options
- `rules/production/lambda.md` — Lambda-specific configuration
