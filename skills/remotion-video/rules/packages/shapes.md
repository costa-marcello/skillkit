---
name: shapes
description: Pre-built SVG shape components from @remotion/shapes.
metadata:
  tags: shapes, svg, triangle, circle, star, pie, heart, polygon
---

Use `@remotion/shapes` for ready-made geometric SVGs that accept size, fill, and stroke props without writing path data by hand.

## Installation

```bash title="install"
npx remotion add @remotion/shapes
```

## Available components

Each component renders an `<svg>` element sized to its `width` and `height` props.

`<Triangle>` — equilateral or custom-angle triangle. Props: `length`, `direction` (`"up" | "right" | "down" | "left"`).

`<Circle>` — perfect circle. Props: `radius`.

`<Rect>` — rectangle with optional rounded corners. Props: `width`, `height`, `cornerRadius`.

`<Star>` — n-pointed star. Props: `outerRadius`, `innerRadius`, `points`.

`<Pie>` — filled arc / pie slice. Props: `radius`, `progress` (0–1).

`<Heart>` — heart shape. Props: `height`.

`<Polygon>` — regular polygon (triangle, pentagon, hexagon…). Props: `radius`, `points`.

All components accept `fill`, `stroke`, `strokeWidth`, and `style` props.

## Example

```tsx title="Shapes.tsx"
import { Triangle, Star, Pie } from "@remotion/shapes";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";

export const ShapesDemo = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = interpolate(frame, [0, 2 * fps], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <div style={{ display: "flex", gap: 40, alignItems: "center" }}>
      <Triangle length={100} direction="up" fill="tomato" />
      <Star outerRadius={60} innerRadius={25} points={5} fill="gold" />
      <Pie radius={60} progress={progress} fill="cornflowerblue" />
    </div>
  );
};
```

## Related

- `@remotion/paths` for custom SVG path utilities
- `animations` rule for driving shape props with `useCurrentFrame`
