---
name: transitions-package
description: Full reference for @remotion/transitions — all presentations, timing options, and custom presentation authoring. Use when selecting a specific transition effect or timing curve beyond the basics in transitions.md.
metadata:
  tags: transitions, fade, slide, wipe, flip, iris, clockWipe, cube, springTiming, linearTiming
---

Read `rules/advanced/transitions.md` first for the `<TransitionSeries>` structure, overlay pattern, and duration calculation. This file covers what presentations exist and how to configure them.

## Install

```bash title="Add the transitions package"
npx remotion add @remotion/transitions
```

## All presentations

Each presentation is a factory function that returns a `TransitionPresentation` object. Pass it to the `presentation` prop of `<TransitionSeries.Transition>`.

### fade

Crossfades between scenes. No configuration required.

```tsx title="Fade"
import { fade } from "@remotion/transitions/fade";

<TransitionSeries.Transition
  presentation={fade()}
  timing={linearTiming({ durationInFrames: 20 })}
/>
```

### slide

Outgoing scene slides out while the incoming scene slides in. Both move in the same direction.

```tsx title="Slide from left"
import { slide } from "@remotion/transitions/slide";

<TransitionSeries.Transition
  presentation={slide({ direction: "from-left" })}
  timing={linearTiming({ durationInFrames: 20 })}
/>
```

`direction` options: `"from-left"` | `"from-right"` | `"from-top"` | `"from-bottom"`

### wipe

A moving edge reveals the incoming scene over the outgoing one.

```tsx title="Wipe from left"
import { wipe } from "@remotion/transitions/wipe";

<TransitionSeries.Transition
  presentation={wipe({ direction: "from-left" })}
  timing={linearTiming({ durationInFrames: 20 })}
/>
```

`direction` options: `"from-left"` | `"from-right"` | `"from-top"` | `"from-bottom"`

### flip

Both scenes rotate on a 3-D axis, as if flipping a card.

```tsx title="Flip horizontally"
import { flip } from "@remotion/transitions/flip";

<TransitionSeries.Transition
  presentation={flip({ direction: "from-left" })}
  timing={springTiming({ config: { damping: 200 }, durationInFrames: 30 })}
/>
```

`direction` options: `"from-left"` | `"from-right"` | `"from-top"` | `"from-bottom"`

Use `springTiming` here for a more physical feel.

### iris

A circular reveal grows from the centre of the frame.

```tsx title="Iris open"
import { iris } from "@remotion/transitions/iris";

<TransitionSeries.Transition
  presentation={iris()}
  timing={linearTiming({ durationInFrames: 25 })}
/>
```

### clockWipe

The incoming scene is revealed by a sweeping arc, like a clock hand.

```tsx title="Clock wipe"
import { clockWipe } from "@remotion/transitions/clock-wipe";

<TransitionSeries.Transition
  presentation={clockWipe()}
  timing={linearTiming({ durationInFrames: 30 })}
/>
```

### none

A hard cut with no visual effect. Use it to get the `<TransitionSeries>` duration calculation benefit without any visible transition.

```tsx title="Hard cut"
import { none } from "@remotion/transitions/none";

<TransitionSeries.Transition
  presentation={none()}
  timing={linearTiming({ durationInFrames: 0 })}
/>
```

### cube

Both scenes appear on the faces of a rotating cube.

```tsx title="Cube rotate"
import { cube } from "@remotion/transitions/cube";

<TransitionSeries.Transition
  presentation={cube({ direction: "from-left" })}
  timing={springTiming({ config: { damping: 200 }, durationInFrames: 40 })}
/>
```

`direction` options: `"from-left"` | `"from-right"` | `"from-top"` | `"from-bottom"`

## Timing options

### linearTiming

Progresses at a constant rate.

```tsx
import { linearTiming } from "@remotion/transitions";

linearTiming({ durationInFrames: 20 });
```

Props:

- `durationInFrames` (required) — total length of the transition

### springTiming

Uses spring physics. The animation settles naturally rather than stopping at an exact frame.

```tsx
import { springTiming } from "@remotion/transitions";

springTiming({
  config: { damping: 200 },
  durationInFrames: 30,
  durationRestThreshold: 0.001,
});
```

Props:

- `config` — spring physics config. `damping` controls how quickly the spring settles; higher values stop faster.
- `durationInFrames?` — cap the transition at this length. Without it, duration is calculated from when the spring settles below `durationRestThreshold`.
- `durationRestThreshold?` — the value below which the spring is considered at rest. Defaults to `0.005`.

### getDurationInFrames

Both timing objects expose this method for precise duration calculation:

```tsx
const timing = springTiming({ config: { damping: 200 } });
const frames = timing.getDurationInFrames({ fps: 30 });
```

Use this when computing total composition duration — see `rules/advanced/transitions.md#calculating-total-composition-duration`.

## Custom presentations

Implement `TransitionPresentation` to build your own effect:

```tsx title="Custom dissolve presentation"
import { TransitionPresentation } from "@remotion/transitions";

const myPresentation: TransitionPresentation = {
  component: ({ progress, children }) => (
    <div style={{ opacity: 1 - progress }}>{children}</div>
  ),
  props: {},
};
```

The `component` receives:

- `progress` — `0` (transition starts) to `1` (transition ends)
- `presentationDirection` — `"entering"` or `"exiting"`
- `presentationProgress` — directional progress for the respective scene
- `passedProps` — any props you add to `props`

## Choosing a transition

- Motion-graphics, editorial cuts → `fade` or `wipe`
- Physical, tactile UI → `flip` or `cube` with `springTiming`
- Broadcast / retro → `clockWipe` or `iris`
- No effect, duration maths only → `none`
- Brand-specific → custom presentation

Avoid `flip` and `cube` on compositions with small `durationInFrames` — the perspective effect needs at least 25 frames to read clearly.

## Related

- `rules/advanced/transitions.md` — TransitionSeries structure, overlays, duration maths
- `rules/core/timing.md` — spring and interpolate timing fundamentals
