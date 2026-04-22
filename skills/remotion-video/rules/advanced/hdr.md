---
name: hdr
description: Colour space and HDR configuration in Remotion for SDR, wide-gamut, and HDR output.
metadata:
  tags: hdr, color-space, bt709, displayp3, rec2020, prores, lut
---

Configure `colorSpace` in `remotion.config.ts` or the render CLI to control whether output is SDR, wide-gamut, or full HDR. The wrong colour space causes washed-out or clipped colours on playback.

## Colour space options

`"bt709"` — default. Standard dynamic range (SDR). Safe for web, broadcast, and social platforms. Use this unless you have a specific wide-gamut or HDR requirement.

`"displayp3"` — wide-gamut SDR. Covers ~25% more colour than BT.709. Correct on P3-capable displays (modern Mac, iPhone, iPad). Clips on sRGB-only displays. Use for web video targeting modern hardware.

`"rec2020"` — HDR. Covers ~75% more colour than BT.709. Requires an HDR-capable display and an HDR-aware player. Use only when delivering to HDR-capable platforms (Apple TV+, YouTube HDR, Netflix).

## Configuration

```ts title="remotion.config.ts"
import { Config } from "@remotion/cli/config";

Config.setColorSpace("displayp3"); // or "bt709" | "rec2020"
```

Or pass it at render time:

```bash title="render"
npx remotion render MyComp out.mp4 --color-space=displayp3
```

## ProRes pixel formats for HDR

When exporting ProRes for post-production or HDR delivery, pair the colour space with the correct pixel format:

`yuv422p10le` — ProRes 422 HQ. SDR with 10-bit depth. Good for broadcast mastering.

`yuv444p10le` — ProRes 4444. Wide-gamut or HDR with 10-bit depth. Preserves alpha. Use for compositing.

```ts title="remotion.config.ts"
import { Config } from "@remotion/cli/config";

Config.setColorSpace("rec2020");
Config.setPixelFormat("yuv444p10le");
Config.setCodec("prores");
```

## LUT application

Remotion does not apply LUTs internally. Apply a LUT as a post-process step using FFmpeg after rendering:

```bash title="apply-lut"
ffmpeg \
  -i out.mp4 \
  -vf "lut3d=path/to/film.cube" \
  -c:v libx264 -crf 18 \
  out-graded.mp4
```

Render the base video in `"rec2020"` or `"displayp3"`, then apply the LUT in FFmpeg to avoid baking the grade into the Remotion source.

## Rules

Do NOT mix colour spaces across compositions in the same project — compositing a `"bt709"` element inside a `"rec2020"` composition shifts colours unpredictably.

Use `"bt709"` (the default) unless the delivery platform explicitly requires wide-gamut or HDR. Setting `"rec2020"` on an sRGB display pipeline washes out colours.

Always verify the output on the target display type before delivering. A correct-looking preview on a P3 monitor may look oversaturated on an sRGB monitor.

## Related

- `rendering` rule for codec and bitrate configuration
- `@remotion/skia` for GPU-accelerated colour operations at render time
