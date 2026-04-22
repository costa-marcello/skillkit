---
name: remotion-video
description: Guides Remotion video development in React, including compositions, animations, timing, audio, captions, and rendering. Use when the user works with Remotion, writes <Composition>/<Sequence>/interpolate/spring, edits remotion.config.ts, renders or deploys Lambda videos, or asks about video creation in React.
license: MIT
metadata:
  tags: remotion, video, react, animation, composition, lambda, render, player
---

## When to use

Load this skill whenever you read or write Remotion code, from scaffolding a project to rendering the final video.

## Common AI mistakes to avoid

Check every Remotion code change against these recurring failure modes before committing:

- **Non-deterministic randomness** — use `random(seed)` from `remotion`, never `Math.random()`, `Date.now()`, or `new Date()`. Parallel renders produce flickering noise otherwise.
- **Unmemoised `<Player>` `inputProps`** — always pass memoised props; unmemoised props cause re-render storms through the whole tree.
- **Missing `delayRender()` / `continueRender()`** around async work (fetch, font load, measurement). Without them the render hangs at 30 000 ms.
- **Non-monotonic `inputRange` on captions** — `interpolate`'s `inputRange` must strictly increase. For short clips use `Math.min(10, Math.floor(duration / 3))` for the fade window.
- **Linear easing everywhere** — prefer `spring()` for natural motion; use linear only for explicit technical needs.
- **Forgotten `@remotion/google-fonts` imports** — every font needs an explicit `loadFont({ weights, subsets })` call.
- **Monolithic single-composition output** — break scenes into small focused compositions and compose with `<Sequence>` or `<TransitionSeries>`.
- **Deprecated `startFrom` / `endAt`** — use `trimBefore` / `trimAfter` instead.

## New project setup

When in an empty folder or workspace with no existing Remotion project, scaffold one using:

```bash
npx create-video@latest --yes --blank --no-tailwind my-video
```

Replace `my-video` with a suitable project name.

## Starting preview

Start the Remotion Studio to preview a video:

```bash
npx remotion studio
```

## Optional: one-frame render check

You can render a single frame with the CLI to sanity-check layout, colours, or timing.
Skip it for trivial edits, pure refactors, or when you already have enough confidence from Studio or prior renders.

```bash
npx remotion still [composition-id] --scale=0.25 --frame=30
```

At 30 fps, `--frame=30` is the one-second mark (`--frame` is zero-based).

## Rule index

Read individual rule files for detailed explanations and code examples.

### Core

- [core/compositions.md](rules/core/compositions.md) - Defining compositions, stills, folders, default props and dynamic metadata
- [core/sequencing.md](rules/core/sequencing.md) - Sequencing patterns - delay, trim, limit duration of items
- [core/timing.md](rules/core/timing.md) - Timing with interpolate, Bezier easing, and springs
- [core/animations.md](rules/core/animations.md) - Fundamental animation skills
- [core/trimming.md](rules/core/trimming.md) - Trim the beginning or end of animations
- [core/parameters.md](rules/core/parameters.md) - Make a video parametrisable with a Zod schema
- [core/calculate-metadata.md](rules/core/calculate-metadata.md) - Dynamically set composition duration, dimensions, and props
- [core/primitives.md](rules/core/primitives.md) - Layout and timing primitives: Loop, Freeze, Series, Null, IFrame, AnimatedImage, premount

### Media

- [media/images.md](rules/media/images.md) - Embedding images using the Img component
- [media/videos.md](rules/media/videos.md) - Embedding videos - trimming, volume, speed, looping
- [media/gifs.md](rules/media/gifs.md) - Displaying GIFs synchronised with Remotion's timeline
- [media/lottie.md](rules/media/lottie.md) - Embedding Lottie animations
- [media/transparent-videos.md](rules/media/transparent-videos.md) - Rendering a video with transparency
- [media/assets.md](rules/media/assets.md) - Importing images, videos, audio, and fonts
- [media/light-leaks.md](rules/media/light-leaks.md) - Light leak overlay effects
- [media/3d.md](rules/media/3d.md) - 3D content using Three.js and React Three Fiber

### Audio

- [audio/audio.md](rules/audio/audio.md) - Using audio and sound - importing, trimming, volume, speed, pitch
- [audio/voiceover.md](rules/audio/voiceover.md) - AI-generated voiceover using ElevenLabs TTS
- [audio/audio-visualization.md](rules/audio/audio-visualization.md) - Visualising audio (spectrum bars, waveforms, bass-reactive)
- [audio/silence-detection.md](rules/audio/silence-detection.md) - Adaptive silence detection using FFmpeg
- [audio/sfx.md](rules/audio/sfx.md) - Using sound effects
- [audio/subtitles.md](rules/audio/subtitles.md) - Captions and subtitles overview
- [audio/get-audio-duration.md](rules/audio/get-audio-duration.md) - Getting the duration of an audio file with Mediabunny
- [audio/ai-captions.md](rules/audio/ai-captions.md) - AI transcription: @remotion/openai-whisper, whisper-web, install-whisper-cpp

### Text

- [text/text-animations.md](rules/text/text-animations.md) - Typography and text animation patterns
- [text/measuring-text.md](rules/text/measuring-text.md) - Measuring text dimensions, fitting text to containers
- [text/fonts.md](rules/text/fonts.md) - Loading Google Fonts and local fonts
- [text/google-fonts.md](rules/text/google-fonts.md) - @remotion/google-fonts per-font packages with required weights/subsets
- [text/display-captions.md](rules/text/display-captions.md) - Rendering captions on screen
- [text/import-srt-captions.md](rules/text/import-srt-captions.md) - Importing SRT caption files

### Advanced

- [advanced/maps.md](rules/advanced/maps.md) - Adding a map using Mapbox and animating it
- [advanced/charts.md](rules/advanced/charts.md) - Chart and data visualisation (bar, pie, line, stock)
- [advanced/transitions.md](rules/advanced/transitions.md) - Scene transition patterns (basics)
- [advanced/transitions-package.md](rules/advanced/transitions-package.md) - @remotion/transitions full reference - presentations, timing, custom
- [advanced/tailwind.md](rules/advanced/tailwind.md) - Using TailwindCSS in Remotion
- [advanced/measuring-dom-nodes.md](rules/advanced/measuring-dom-nodes.md) - Measuring DOM element dimensions
- [advanced/hdr.md](rules/advanced/hdr.md) - Colour space and HDR output: bt709, displayp3, rec2020, ProRes

### Utilities

- [utilities/ffmpeg.md](rules/utilities/ffmpeg.md) - Using FFmpeg for video operations
- [utilities/can-decode.md](rules/utilities/can-decode.md) - Check if a video can be decoded using Mediabunny
- [utilities/extract-frames.md](rules/utilities/extract-frames.md) - Extract frames at specific timestamps
- [utilities/get-video-dimensions.md](rules/utilities/get-video-dimensions.md) - Getting width and height of a video file
- [utilities/get-video-duration.md](rules/utilities/get-video-duration.md) - Getting the duration of a video file in seconds
- [utilities/transcribe-captions.md](rules/utilities/transcribe-captions.md) - Transcribing captions

### Production

- [production/delay-render.md](rules/production/delay-render.md) - Suspend rendering during async work: delayRender, continueRender, cancelRender
- [production/determinism.md](rules/production/determinism.md) - Deterministic renders with random(seed); never Math.random / Date.now
- [production/rendering.md](rules/production/rendering.md) - @remotion/renderer Node SSR: bundle, selectComposition, renderMedia
- [production/cli.md](rules/production/cli.md) - npx remotion subcommands and flags (render, still, bundle, studio, benchmark)
- [production/config.md](rules/production/config.md) - remotion.config.ts Config setters (codec, CRF, concurrency, Webpack)
- [production/lambda.md](rules/production/lambda.md) - AWS Lambda: deployFunction, deploySite, renderMediaOnLambda, cost tuning
- [production/player.md](rules/production/player.md) - @remotion/player embedding, PlayerRef, memoised inputProps, buffer events
- [production/video-tag-decision.md](rules/production/video-tag-decision.md) - Choose between Video / OffthreadVideo / Html5Video / @remotion/media
- [production/input-props.md](rules/production/input-props.md) - Prop resolution order, Zod validation, --props CLI flags, render-boundary security
- [production/caption-timing-safety.md](rules/production/caption-timing-safety.md) - Monotonic inputRange and adaptive fade window for captions
- [production/performance.md](rules/production/performance.md) - Hardware acceleration, concurrency, image format, GPU precompute, benchmarking
- [production/env-vars.md](rules/production/env-vars.md) - REMOTION_ prefix, .env loading, secrets via inputProps / envVariables

### Integration

- [integration/nextjs.md](rules/integration/nextjs.md) - Next.js App Router: Player SSR guard, transpilePackages, API route for Lambda
- [integration/docker.md](rules/integration/docker.md) - Docker: base image, --shm-size, fonts, Chromium flags, CI example
- [integration/mediabunny-migration.md](rules/integration/mediabunny-migration.md) - Migrate from deprecated media-parser/webcodecs to Mediabunny Video/Audio
- [integration/v5-prep.md](rules/integration/v5-prep.md) - Future-proof v4 code against v5 breaking changes

### Packages

- [packages/paths.md](rules/packages/paths.md) - @remotion/paths SVG path utilities (interpolatePath, warpPath, getLength)
- [packages/shapes.md](rules/packages/shapes.md) - @remotion/shapes pre-built SVG primitives (Triangle, Circle, Star, Pie, Heart)
- [packages/noise.md](rules/packages/noise.md) - @remotion/noise seeded Perlin noise (noise2D, noise3D, noise4D)
- [packages/motion-blur.md](rules/packages/motion-blur.md) - @remotion/motion-blur Trail and CameraMotionBlur (use sparingly)
- [packages/skia.md](rules/packages/skia.md) - @remotion/skia high-performance canvas (React Native Skia)
- [packages/rive.md](rules/packages/rive.md) - @remotion/rive animations with state machines (Lottie alternative)
