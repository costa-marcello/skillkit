---
name: skia
description: High-performance canvas rendering in Remotion using @remotion/skia with React Native Skia.
metadata:
  tags: skia, canvas, react-native-skia, performance
---

Use `@remotion/skia` when you need GPU-accelerated 2-D canvas operations — complex gradients, blur filters, custom blend modes, or large particle systems — that would be slow in SVG or DOM.

## React 18 constraint

`@remotion/skia` pins to **React 18**. It will not work with React 19 projects. Confirm the project's React major before adding this package.

## Installation

```bash title="install"
npx remotion add @remotion/skia
```

Then wrap your root composition with `<SkiaCanvas>` as shown below.

## Setup

```tsx title="Root.tsx"
import { SkiaCanvas } from "@remotion/skia";

export const MyComp = () => (
  <SkiaCanvas width={1920} height={1080}>
    {/* Skia components go here */}
  </SkiaCanvas>
);
```

## Drawing example

```tsx title="SkiaGradient.tsx"
import { SkiaCanvas } from "@remotion/skia";
import { Canvas, Rect, LinearGradient, vec } from "@shopify/react-native-skia";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";

export const GradientRect = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  const progress = interpolate(frame, [0, 2 * fps], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <Canvas style={{ width, height }}>
      <Rect x={0} y={0} width={width} height={height}>
        <LinearGradient
          start={vec(0, 0)}
          end={vec(width * progress, height)}
          colors={["#6366f1", "#ec4899"]}
        />
      </Rect>
    </Canvas>
  );
};
```

## When to use Skia vs SVG/DOM

Use Skia for: image filters (blur, shadow), blend modes, large particle counts, path stroking with dash patterns, or any effect that requires per-pixel operations.

Use SVG or DOM for: simple shapes, text, layout-based animations. The DOM render path is simpler and has no React version constraint.

## Related

- `@remotion/shapes` for simple SVG shapes without the Skia dependency
- `@remotion/paths` for SVG path operations
