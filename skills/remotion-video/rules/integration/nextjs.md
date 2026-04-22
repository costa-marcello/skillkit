---
name: nextjs
description: Integrating Remotion with Next.js App Router — Player SSR guard, next.config.js setup, API routes for Lambda rendering, and bundle caching. Use when embedding the Remotion Player in a Next.js app or triggering server-side renders from an API route.
metadata:
  tags: nextjs, player, ssr, app-router, lambda, api-route, transpilePackages
---

Remotion's browser runtime depends on browser APIs that do not exist on the server. Guard every Player import against SSR.

## Player in App Router

`<Player>` must never render on the server. Use `dynamic` with `ssr: false`:

```tsx title="app/video/page.tsx"
"use client";
import dynamic from "next/dynamic";

const RemotionPlayer = dynamic(
  () => import("../components/RemotionPlayer"),
  { ssr: false }
);

export default function VideoPage() {
  return <RemotionPlayer />;
}
```

```tsx title="components/RemotionPlayer.tsx"
"use client";
import { Player } from "@remotion/player";
import { MyComposition } from "../remotion/MyComposition";

export default function RemotionPlayer() {
  return (
    <Player
      component={MyComposition}
      durationInFrames={150}
      compositionWidth={1280}
      compositionHeight={720}
      fps={30}
    />
  );
}
```

The dynamic import wrapper must be in a Client Component (`"use client"`). The `RemotionPlayer` file it imports is also a Client Component.

## next.config.js

Remotion packages use ESM and optional native modules that Next.js does not transpile by default. Add them to `transpilePackages`:

```js title="next.config.js"
/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["remotion", "@remotion/player", "@remotion/media"],
  serverExternalPackages: ["@remotion/renderer"],
};

module.exports = nextConfig;
```

`transpilePackages` handles client-side Remotion imports. `serverExternalPackages` tells Next.js not to bundle the renderer (which includes native binaries) — the renderer runs as an external Node.js module.

Extend `transpilePackages` for every `@remotion/*` package your project imports on the client side. Common additions: `"@remotion/transitions"`, `"@remotion/google-fonts"`, `"@remotion/captions"`.

## API route for Lambda rendering

Do not import `@remotion/bundler` inside an API route — it includes Webpack and cannot be bundled by Webpack. Create the bundle in a separate build step and pass the serve URL at runtime.

```ts title="app/api/render/route.ts"
import { NextResponse } from "next/server";
import { renderMediaOnLambda, getRenderProgress } from "@remotion/lambda/client";

export async function POST(request: Request) {
  const { compositionId, inputProps } = await request.json();

  const { renderId, bucketName } = await renderMediaOnLambda({
    region: "us-east-1",
    functionName: process.env.REMOTION_LAMBDA_FUNCTION_NAME!,
    serveUrl: process.env.REMOTION_SERVE_URL!,
    composition: compositionId,
    inputProps,
    codec: "h264",
    framesPerLambda: 20,
  });

  return NextResponse.json({ renderId, bucketName });
}
```

Note the import path: `@remotion/lambda/client`. In v5 this is the only correct path for Lambda render APIs (the top-level `@remotion/lambda` no longer exports them).

## Bundle cache

Building the Remotion bundle (`bundle()`) is slow — avoid doing it on every request. Cache the serve URL:

```ts title="lib/remotion-bundle.ts"
import { bundle } from "@remotion/bundler";

let cachedServeUrl: string | null = null;

export async function getServeUrl(): Promise<string> {
  if (cachedServeUrl) return cachedServeUrl;
  cachedServeUrl = await bundle({ entryPoint: "./src/remotion/index.ts" });
  return cachedServeUrl;
}
```

Call `getServeUrl()` once on server start or lazily on the first request. In Lambda workflows, build the bundle in CI and store the result in S3 — pass the S3 URL as `REMOTION_SERVE_URL`.

## Render progress polling

After calling `renderMediaOnLambda`, poll progress with `getRenderProgress`:

```ts title="app/api/render-progress/route.ts"
import { getRenderProgress } from "@remotion/lambda/client";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const renderId = searchParams.get("renderId")!;
  const bucketName = searchParams.get("bucketName")!;

  const progress = await getRenderProgress({
    renderId,
    bucketName,
    functionName: process.env.REMOTION_LAMBDA_FUNCTION_NAME!,
    region: "us-east-1",
  });

  return NextResponse.json(progress);
}
```

## Related

- `rules/production/lambda.md` — Lambda setup and configuration
- `rules/production/env-vars.md` — passing secrets to the renderer
- `rules/integration/v5-prep.md` — Lambda import path change in v5
