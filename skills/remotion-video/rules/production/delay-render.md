---
name: delay-render
description: Suspend rendering until async work completes using delayRender(), continueRender(), and cancelRender(). Use when fetching data, loading fonts, or doing any async work before a frame is captured.
metadata:
  tags: delay-render, continue-render, cancel-render, async, timeout, rendering
---

Use `delayRender()` to pause Remotion's renderer until an asynchronous task completes.
Without it, Remotion captures the frame immediately, before any async data has loaded.

This is the single most common source of render failures.

## The core pattern

```tsx title="src/MyComposition.tsx"
import { useEffect } from "react";
import { cancelRender, continueRender, delayRender } from "remotion";

export const MyComposition = () => {
  const [handle] = useState(() =>
    delayRender("Fetching data from API", {
      timeoutInMilliseconds: 10_000,
    })
  );

  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("https://api.example.com/data")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        continueRender(handle);
      })
      .catch((err) => {
        cancelRender(err);
      });
  }, [handle]);

  if (!data) {
    return null;
  }

  return <div>{data.title}</div>;
};
```

The key idea: `delayRender()` returns a handle. Pass that handle to `continueRender()` when the async work succeeds, or call `cancelRender()` with an error when it fails. You MUST call one or the other — failing to do so causes the render to hang until it times out.

## Function signatures

```ts title="API"
// Pause the renderer
delayRender(
  label?: string,
  options?: { timeoutInMilliseconds?: number; retries?: number }
): Handle

// Resume the renderer
continueRender(handle: Handle): void

// Abort the render with an error
cancelRender(error: Error | string): void
```

## The label parameter

Always pass a descriptive label as the first argument. When a render hangs, Remotion prints:

```
A delayRender() "Fetching data from API" was called but not completed after 30000ms.
```

Without a label the message reads `A delayRender() was called...` which gives no useful debugging context. Use labels that name the operation and ideally its input, for example `"Loading font: Inter"` or `"Fetching user ${userId}"`.

## Timeout options

The default timeout is **30 000 ms (30 seconds)**. You can override it per call:

```tsx title="src/MyComposition.tsx"
const [handle] = useState(() =>
  delayRender("Loading large video asset", {
    timeoutInMilliseconds: 60_000, // 60 seconds for large assets
  })
);
```

Or set the global default in `remotion.config.ts`:

```ts title="remotion.config.ts"
import { Config } from "@remotion/cli/config";

Config.setDelayRenderTimeoutInMilliseconds(60_000);
```

The per-call `timeoutInMilliseconds` overrides the global setting.

## Retries

Pass `retries` to automatically retry timed-out handles before failing:

```tsx title="src/MyComposition.tsx"
const [handle] = useState(() =>
  delayRender("Fetching with retry", {
    retries: 2,
    timeoutInMilliseconds: 10_000,
  })
);
```

With `retries: 2`, Remotion will attempt the frame up to 3 times before marking it as failed.

## Multiple handles

You can hold multiple handles simultaneously. The renderer waits until ALL handles have been released:

```tsx title="src/MyComposition.tsx"
const [fontHandle] = useState(() => delayRender("Loading font"));
const [dataHandle] = useState(() => delayRender("Fetching data"));

useEffect(() => {
  loadFont().then(() => continueRender(fontHandle));
  fetchData().then(() => continueRender(dataHandle));
}, [fontHandle, dataHandle]);
```

## useDelayRender hook

For most cases, use the `useDelayRender()` hook rather than the raw functions. It wraps the three functions and handles cleanup:

```tsx title="src/MyComposition.tsx"
import { useDelayRender } from "remotion";

const { delayRender, continueRender, cancelRender } = useDelayRender();
```

The hook ensures handles are tied to the component lifecycle and avoids stale closures.

## Common mistakes

Do NOT call `delayRender()` inside `useEffect`. Call it during component initialisation (in a `useState` initialiser) so the handle is registered before the first render:

```tsx title="src/MyComposition.tsx"
// WRONG — delayRender called too late
useEffect(() => {
  const handle = delayRender("Too late");
  fetch(url).then(() => continueRender(handle));
}, []);

// RIGHT — handle created during render
const [handle] = useState(() => delayRender("Correct timing"));
useEffect(() => {
  fetch(url).then(() => continueRender(handle));
}, [handle]);
```

Do NOT forget `cancelRender()` in error paths. A hanging render will eventually time out, but it wastes Lambda concurrency and CPU time during local rendering.

## Troubleshooting stuck renders

If a render hangs, check:

1. The label in the timeout message — it names which `delayRender()` never resolved.
2. Network errors silently swallowed without calling `cancelRender()`.
3. A proxy or firewall blocking requests made from the headless browser.
4. Missing `await` before an async call inside the effect.

The Remotion troubleshooting docs cover proxy-specific failures at `/docs/troubleshooting/delay-render-proxy` and general stuck renders at `/docs/troubleshooting/stuck-render`.

## Related

- [determinism.md](../production/determinism.md) - Keeping renders deterministic across parallel Chrome instances
- [rendering.md](../production/rendering.md) - Node.js SSR API for programmatic rendering
- [config.md](../production/config.md) - Setting global delayRender timeout via Config
