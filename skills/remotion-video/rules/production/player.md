---
name: player
description: Embed Remotion compositions in React apps using @remotion/player. Covers Player and Thumbnail components, PlayerRef API, memoised inputProps, buffer-state events, and sibling-controls pattern.
metadata:
  tags: player, embed, react, thumbnail, ref, buffer, controls, memoize
---

Memoising `inputProps` is the most important rule when using the Player — an unmemoised object literal recreates on every parent render and causes the Player to remount the entire composition.

## Install

```bash title="Install Player package"
npx remotion add @remotion/player
```

## Basic Usage

Pass your component directly. Do not wrap it in a `<Composition>` — the Player handles sizing and timing through its own props.

```tsx title="src/VideoPlayer.tsx"
import { Player } from "@remotion/player";
import { useMemo } from "react";
import { MyComposition } from "./MyComposition";

type Props = {
  title: string;
  color: string;
};

export const VideoPlayer = ({ title, color }: Props) => {
  const inputProps = useMemo(
    () => ({ title, color }),
    [title, color],
  );

  return (
    <Player
      component={MyComposition}
      durationInFrames={150}
      fps={30}
      compositionWidth={1920}
      compositionHeight={1080}
      inputProps={inputProps}
      controls
      loop
      style={{ width: "100%" }}
    />
  );
};
```

NEVER write `inputProps={{ title, color }}` inline. That creates a new object on every render and triggers a full composition remount. Always wrap in `useMemo`.

## PlayerRef API

Use `useRef<PlayerRefObject>()` to control the Player imperatively from sibling components. Render controls outside the Player, not inside the composition.

```tsx title="src/PlayerWithControls.tsx"
import { Player, PlayerRef } from "@remotion/player";
import { useCallback, useMemo, useRef } from "react";
import { MyComposition } from "./MyComposition";

export const PlayerWithControls = () => {
  const playerRef = useRef<PlayerRef>(null);

  const inputProps = useMemo(() => ({ title: "Hello" }), []);

  const handlePlay = useCallback(() => {
    playerRef.current?.play();
  }, []);

  const handlePause = useCallback(() => {
    playerRef.current?.pause();
  }, []);

  const handleSeekToStart = useCallback(() => {
    playerRef.current?.seekTo(0);
  }, []);

  const handleGetFrame = useCallback(() => {
    const frame = playerRef.current?.getCurrentFrame();
    console.log("Current frame:", frame);
  }, []);

  return (
    <div>
      <Player
        ref={playerRef}
        component={MyComposition}
        durationInFrames={150}
        fps={30}
        compositionWidth={1920}
        compositionHeight={1080}
        inputProps={inputProps}
      />
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <button onClick={handlePlay}>Play</button>
        <button onClick={handlePause}>Pause</button>
        <button onClick={handleSeekToStart}>Restart</button>
        <button onClick={handleGetFrame}>Log Frame</button>
      </div>
    </div>
  );
};
```

Full `PlayerRef` method list:

- `play()` — start playback
- `pause()` — pause playback
- `toggle()` — toggle play/pause
- `seekTo(frame)` — jump to a frame
- `getCurrentFrame()` — returns current frame number
- `mute()` / `unmute()` / `isMuted()` / `getVolume()` / `setVolume(v)`
- `isPlaying()` — returns boolean
- `requestFullscreen()` / `exitFullscreen()` / `isFullscreen()`
- `getContainerNode()` — returns the DOM node
- `getScale()` — canvas scale relative to container

## Event Listeners

Attach listeners after the Player mounts. Clean them up on unmount.

```tsx title="src/PlayerEvents.tsx"
import { Player, PlayerRef } from "@remotion/player";
import { useEffect, useMemo, useRef } from "react";
import { MyComposition } from "./MyComposition";

export const PlayerWithEvents = () => {
  const playerRef = useRef<PlayerRef>(null);
  const inputProps = useMemo(() => ({ title: "Hello" }), []);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    const onPlay = () => console.log("playing");
    const onPause = () => console.log("paused");
    const onEnded = () => console.log("ended");
    const onSeeked = ({ detail }: { detail: { frame: number } }) =>
      console.log("seeked to", detail.frame);

    player.addEventListener("play", onPlay);
    player.addEventListener("pause", onPause);
    player.addEventListener("ended", onEnded);
    player.addEventListener("seeked", onSeeked);

    return () => {
      player.removeEventListener("play", onPlay);
      player.removeEventListener("pause", onPause);
      player.removeEventListener("ended", onEnded);
      player.removeEventListener("seeked", onSeeked);
    };
  }, []);

  return (
    <Player
      ref={playerRef}
      component={MyComposition}
      durationInFrames={150}
      fps={30}
      compositionWidth={1920}
      compositionHeight={1080}
      inputProps={inputProps}
    />
  );
};
```

Available event names: `play`, `pause`, `seeked`, `ended`, `error`, `timeupdate`, `fullscreenchange`, `scalechange`, `volumechange`, `mutechange`, `waiting`, `resume`.

## Buffer State and Spinner

The Player emits `waiting` when it enters a buffer state and `resume` when playback can continue. The default spinner delay is 300 ms — this prevents UI flicker from brief loading moments.

```tsx title="src/PlayerWithBuffering.tsx"
import { Player, PlayerRef } from "@remotion/player";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MyComposition } from "./MyComposition";

export const PlayerWithBuffering = () => {
  const playerRef = useRef<PlayerRef>(null);
  const inputProps = useMemo(() => ({ title: "Hello" }), []);
  const [isBuffering, setIsBuffering] = useState(false);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    const onWaiting = () => setIsBuffering(true);
    const onResume = () => setIsBuffering(false);

    player.addEventListener("waiting", onWaiting);
    player.addEventListener("resume", onResume);

    return () => {
      player.removeEventListener("waiting", onWaiting);
      player.removeEventListener("resume", onResume);
    };
  }, []);

  return (
    <div style={{ position: "relative" }}>
      <Player
        ref={playerRef}
        component={MyComposition}
        durationInFrames={150}
        fps={30}
        compositionWidth={1920}
        compositionHeight={1080}
        inputProps={inputProps}
        bufferStateDelayInMilliseconds={300}
      />
      {isBuffering && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.4)",
          }}
        >
          <span>Loading…</span>
        </div>
      )}
    </div>
  );
};
```

Set `pauseWhenBuffering` on `<OffthreadVideo>`, `<Video>`, or `<Img>` inside the composition to propagate the buffer state up to the Player automatically.

## Thumbnail

Use `<Thumbnail>` to render a single frame without playback controls.

```tsx title="src/VideoThumbnail.tsx"
import { Thumbnail } from "@remotion/player";
import { useMemo } from "react";
import { MyComposition } from "./MyComposition";

export const VideoThumbnail = ({ title }: { title: string }) => {
  const inputProps = useMemo(() => ({ title }), [title]);

  return (
    <Thumbnail
      component={MyComposition}
      durationInFrames={150}
      fps={30}
      compositionWidth={1920}
      compositionHeight={1080}
      frameToDisplay={0}
      inputProps={inputProps}
      style={{ width: 320, height: 180 }}
    />
  );
};
```

## Key Constraints

- The Player does not use `<Composition>`. Pass the component directly.
- iOS Safari does not support the Fullscreen API.
- Media cannot play in reverse (negative `playbackRate`).
- Only errors thrown in component render functions are caught. Handler errors (e.g. in `onClick`) are not reported via `errorFallback`.

## Related

- [video-tag-decision](./video-tag-decision.md) — which video component to use inside the Player
- [input-props](./input-props.md) — validating and passing props to compositions
- [compositions](../core/compositions.md) — how compositions are defined
- [caption-timing-safety](./caption-timing-safety.md) — fixing interpolate errors in Player compositions
