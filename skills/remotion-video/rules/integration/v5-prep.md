---
name: v5-prep
description: Breaking changes in Remotion v5 and how to future-proof v4 code today. Use when upgrading to v5 or auditing a codebase before the upgrade.
metadata:
  tags: v5, migration, breaking-changes, future-proof, lambda, google-fonts, colorspace
---

Apply these changes in v4 now. Each one either throws in v5 or silently changes behaviour. Addressing them early means the v5 upgrade is a version bump, not a debug session.

## 1. inputProps required on selectComposition and getCompositions

In v5, both `selectComposition()` and `getCompositions()` require an explicit `inputProps` parameter. Omitting it throws a type error.

```ts title="v4 — works but will break in v5"
const composition = await selectComposition({
  serveUrl,
  id: "MyComp",
});
```

```ts title="v4 + v5 safe"
const composition = await selectComposition({
  serveUrl,
  id: "MyComp",
  inputProps: {},
});
```

Do the same for `getCompositions({ serveUrl, inputProps: {} })`.

## 2. Google Fonts loadFont weights and subsets required

In v5, `loadFont()` from `@remotion/google-fonts/*` requires explicit `weights` and `subsets`. Calling it without them throws.

```ts title="v4 — loads all weights and subsets (broken in v5)"
const { fontFamily } = loadFont("normal");
```

```ts title="v4 + v5 safe"
const { fontFamily } = loadFont("normal", {
  weights: ["400", "700"],
  subsets: ["latin"],
});
```

Only load the weights and subsets you actually use. Loading all variants increases bundle size and causes rate-limit warnings.

## 3. Lambda import path change

Lambda render APIs moved from `@remotion/lambda` to `@remotion/lambda/client`. The top-level package no longer exports them.

```ts title="v4 — broken in v5"
import { renderMediaOnLambda, getRenderProgress } from "@remotion/lambda";
```

```ts title="v4 + v5 safe"
import { renderMediaOnLambda, getRenderProgress } from "@remotion/lambda/client";
```

Affected exports: `renderMediaOnLambda`, `renderStillOnLambda`, `getRenderProgress`, `presignUrl`, `getSites`, and related client-side APIs.

## 4. colorSpace default changed to bt709

In v5, the default `colorSpace` changes from `"default"` (which mapped to bt601) to `"bt709"`. This affects colour reproduction — bt709 is the standard for HD video but looks different from bt601 on some content.

To keep v4 colour behaviour after upgrading:

```ts title="Preserve bt601 colour after upgrade"
await renderMedia({
  composition,
  serveUrl,
  codec: "h264",
  outputLocation: "out/video.mp4",
  colorSpace: "bt601",
});
```

If you are not sure which to use: bt709 is correct for most modern displays. Audit your colour-critical compositions before upgrading.

## 5. Sequence premount default is now 1 second

In v5, every `<Sequence>` premounts for 1 second (fps frames) before it becomes visible. This improves load readiness but can cause unexpected side effects in components that perform work on mount.

To opt out on a per-sequence basis:

```tsx title="Disable premount"
<Sequence premountFor={0} from={90} durationInFrames={60}>
  <MyScene />
</Sequence>
```

Check compositions that use side-effectful lifecycle hooks — they may now run earlier than expected.

## 6. renderMediaOnLambda overwrite defaults to true

In v5, Lambda renders overwrite existing output by default. In v4, the default was `false` — a re-render to the same key would fail unless `overwrite: true` was set.

To keep v4 behaviour (fail if output exists):

```ts title="Preserve fail-on-existing behaviour"
await renderMediaOnLambda({
  // ...
  overwrite: false,
});
```

## 7. Lambda diskSizeInMb defaults to 10240

The Lambda function's `/tmp` disk allocation increased from 2048 MB to 10240 MB. This reduces out-of-disk errors on long renders but raises Lambda costs slightly.

To keep the smaller allocation:

```ts title="Restore 2 GB disk"
await renderMediaOnLambda({
  // ...
  diskSizeInMb: 2048,
});
```

## 8. Minimum runtime versions

- Node.js: 18.0.0 minimum (was 16)
- Bun: 1.1.3 minimum

Update your CI images and Lambda function runtime before upgrading.

## Related

- `rules/integration/mediabunny-migration.md` — deprecated package migration
- `rules/production/lambda.md` — Lambda configuration reference
- `rules/text/google-fonts.md` — loadFont weights and subsets
