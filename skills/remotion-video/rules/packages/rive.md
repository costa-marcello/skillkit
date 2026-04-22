---
name: rive
description: Embedding Rive animations and state machines in Remotion using @remotion/rive.
metadata:
  tags: rive, animation, state-machine, lottie-alternative
---

Use `@remotion/rive` to embed Rive animations in Remotion compositions. Rive files are smaller than Lottie and support interactive state machines, making them a good choice for character rigs and branching motion.

## Installation

```bash title="install"
npx remotion add @remotion/rive
```

## Basic usage

```tsx title="RiveDemo.tsx"
import { RiveCanvas } from "@remotion/rive";

export const RiveDemo = () => (
  <RiveCanvas
    src={staticFile("animation.riv")}
    artboard="Main"
    animations={["idle"]}
    fit="contain"
    alignment="center"
    style={{ width: 500, height: 500 }}
  />
);
```

Place `.riv` files in the `public/` folder and reference them with `staticFile()` from `remotion`.

## State machine

```tsx title="RiveStateMachine.tsx"
import { RiveCanvas } from "@remotion/rive";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";

export const StateMachineDemo = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = interpolate(frame, [0, 3 * fps], [0, 100], {
    extrapolateRight: "clamp",
  });

  return (
    <RiveCanvas
      src={staticFile("progress-bar.riv")}
      stateMachines={["ProgressMachine"]}
      inputs={{ progress }}
      style={{ width: 800, height: 200 }}
    />
  );
};
```

Pass numeric, boolean, or trigger inputs via the `inputs` prop. Remotion drives them from `useCurrentFrame()` values so playback stays deterministic.

## Rive vs Lottie

| | Rive | Lottie |
|---|---|---|
| File size | Smaller | Larger |
| State machines | Yes | No |
| After Effects export | No | Yes |
| Remotion package | `@remotion/rive` | `@remotion/lottie` |

Prefer Rive for new character or UI animations. Use Lottie when the source file was exported from After Effects.

## Rules

Rive animations MUST be deterministic. Avoid using Rive's built-in timeline playback (`play()`) — drive all state via `inputs` from `useCurrentFrame()` so each frame renders identically across render workers.

## Related

- `lottie` rule for After Effects–sourced animations
- `animations` rule for frame-driven motion patterns
