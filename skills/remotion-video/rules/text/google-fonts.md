---
name: google-fonts
description: Loading Google Fonts in Remotion using per-font packages from @remotion/google-fonts. Use when adding web fonts to a composition or diagnosing missing text rendering.
metadata:
  tags: fonts, google-fonts, typography, loadFont, Inter
---

Import fonts from their per-font package — never from a CDN link inside a `<style>` tag, which Remotion cannot resolve during rendering.

## Install the per-font package

Each font is a separate package under `@remotion/google-fonts`. Install only the fonts you use:

```bash title="Install Inter"
npm install @remotion/google-fonts
```

The individual font entry points live at `@remotion/google-fonts/Inter`, `@remotion/google-fonts/Roboto`, and so on.

## Load a font

Call `loadFont()` at module level, outside any React component. The call registers the font with the browser as soon as the module loads.

```tsx title="Load Inter 700 Latin"
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily, waitUntilDone } = loadFont("normal", {
  weights: ["700"],
  subsets: ["latin"],
});
```

In v5, `weights` and `subsets` are REQUIRED. Omitting them throws at runtime. Loading all weights and subsets by default is no longer supported; be explicit.

Parameters:

- `style` — `"normal"` or `"italic"` (first positional argument)
- `weights` (required in v5) — array of weight strings, e.g. `["400", "700"]`
- `subsets` (required in v5) — array of subset strings, e.g. `["latin", "latin-ext"]`
- `document?` — custom `Document` object for iframe injection
- `ignoreTooManyRequestsWarning?` — suppress rate-limit warnings

Return value:

- `fontFamily` — the CSS font-family string to pass to `style={{ fontFamily }}`
- `waitUntilDone()` — async method that resolves when the font is fully loaded
- `fonts` — variant map (weights → subsets → URL)
- `unicodeRanges` — character range data per subset

## Wait for the font before rendering

Call `waitUntilDone()` inside `calculateMetadata` or a data-fetching hook so Remotion does not begin rendering before the font is available.

```tsx title="Await font in calculateMetadata"
import { CalculateMetadataFunction } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";

const { waitUntilDone } = loadFont("normal", {
  weights: ["700"],
  subsets: ["latin"],
});

export const calculateMetadata: CalculateMetadataFunction<Props> = async () => {
  await waitUntilDone();
  return { durationInFrames: 150 };
};
```

## Apply the font family

Pass the returned `fontFamily` directly to the `style` prop. Do not hard-code the string — the value Remotion registers may differ from the display name.

```tsx title="Apply loaded font"
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont("normal", {
  weights: ["700"],
  subsets: ["latin"],
});

export const Title = () => (
  <div style={{ fontFamily, fontSize: 64, fontWeight: 700 }}>
    Hello World
  </div>
);
```

## Discover available fonts

```tsx title="List all available fonts"
import { getAvailableFonts } from "@remotion/google-fonts";

const fonts = getAvailableFonts();
// Array of { importName, family, ... }
```

Use this at development time to find the exact import name. The `importName` is what you append to the package path, e.g. `@remotion/google-fonts/${font.importName}`.

## Inspect font metadata

```tsx title="Read font info"
import { getInfo } from "@remotion/google-fonts/Inter";

const info = getInfo();
// { family: "Inter", categories: ["sans-serif"], subsets: [...], weights: [...] }
```

Use `getInfo()` to validate which weights and subsets are actually available before passing them to `loadFont()`.

## Related

- `rules/text/fonts.md` — local font loading via `@remotion/fonts`
- `rules/text/measuring-text.md` — measuring text dimensions for layout
- `rules/core/compositions.md` — calculateMetadata for dynamic duration
