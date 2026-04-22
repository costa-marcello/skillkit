---
name: motion-blur
description: Motion blur effects in Remotion using @remotion/motion-blur Trail and CameraMotionBlur.
metadata:
  tags: motion-blur, trail, camera, performance
---

Use `@remotion/motion-blur` to add temporal blur to fast-moving elements or simulate camera movement. Motion blur is expensive — apply it only where it visibly improves perceived motion quality.

## Installation

```bash title="install"
npx remotion add @remotion/motion-blur
```

## Components

### Trail

Renders multiple copies of its children at sub-frame offsets and blends them together to simulate object motion blur.

Props: `layers` (number of ghost frames, default 10), `lagInFrames` (spread of the trail), `trailOpacity` (opacity per layer).

```tsx title="TrailingBall.tsx"
import { Trail } from "@remotion/motion-blur";
import { useCurrentFrame, interpolate } from "remotion";

export const TrailingBall = () => {
  const frame = useCurrentFrame();
  const x = interpolate(frame, [0, 60], [0, 500], { extrapolateRight: "clamp" });

  return (
    <Trail layers={8} lagInFrames={0.5} trailOpacity={0.17}>
      <div
        style={{
          width: 60,
          height: 60,
          borderRadius: "50%",
          background: "tomato",
          transform: `translateX(${x}px)`,
        }}
      />
    </Trail>
  );
};
```

### CameraMotionBlur

Wraps the entire scene and blurs based on a `shutterAngle` (default 180°). Higher angles mean more blur per frame. Use this when animating the whole composition frame — titles flying in, scene transitions.

```tsx title="BlurredScene.tsx"
import { CameraMotionBlur } from "@remotion/motion-blur";

export const Scene = () => (
  <CameraMotionBlur shutterAngle={180} samples={10}>
    {/* scene contents */}
  </CameraMotionBlur>
);
```

## Cost warning

Each additional `layer` or `sample` multiplies the number of React renders per frame. Start with `layers={5}` or `samples={5}` and raise only if the blur looks insufficient. Avoid applying `Trail` or `CameraMotionBlur` to static or slow-moving elements — the cost is paid regardless of visible movement.

Do NOT nest `Trail` inside `CameraMotionBlur` on the same element — double-blurring compounds the render cost and rarely improves the result.

## Related

- `noise` rule for procedural shake motion
- `animations` rule for driving position with `interpolate`
