# Animation Patterns

## Priority Hierarchy

Not every element needs animation. Prioritise by impact:

| Priority | Area | Purpose |
|----------|------|---------|
| 1 | Hero intro | First impression, brand personality |
| 2 | Hover interactions | Feedback, discoverability |
| 3 | Content reveal | Guide attention, reduce cognitive load |
| 4 | Background effects | Atmosphere, depth |
| 5 | Navigation transitions | Spatial awareness, continuity |

## Performance Rules

Only animate properties that run on the compositor. Layout-triggering properties cause jank.

```css
/* DO: compositor-only properties */
transform: translateY(20px);
opacity: 0.5;
filter: blur(4px);

/* DON'T: layout-triggering properties */
margin-top: 20px;
height: 100px;
width: 200px;
```

**Why:** `transform` and `opacity` skip layout and paint. Animating `margin`, `height`, or `width` forces the browser to recalculate layout every frame, causing dropped frames on lower-end devices.

## Animation Triggers

| Trigger | Implementation |
|---------|---------------|
| Page load | CSS `animation` with `animation-delay` for stagger |
| Scroll into view | `IntersectionObserver` or `react-intersection-observer` |
| Hover | Tailwind `hover:` utilities or CSS `:hover` |
| Click / Tap | State-driven with `useState` |

## Tech Stack Ladder

Choose the lightest tool that meets the requirement. Escalate only when needed.

| Level | Tool | When to use |
|-------|------|-------------|
| 1 | CSS animations + keyframes | Simple fades, slides, stagger delays |
| 2 | Tailwind utilities | Hover states, basic transitions, rapid prototyping |
| 3 | Motion (Framer Motion) | Complex orchestration, gestures, layout animations, exit animations |
| 4 | GSAP | Timeline-based sequences, scroll-driven narratives (only if already installed) |

**Default to Level 1.** Most animations need nothing more than CSS. Reach for libraries only when CSS cannot express the interaction (e.g., exit animations, drag gestures, coordinated timelines).
