---
name: ai-captions
description: Generating AI-powered captions in Remotion using OpenAI Whisper, browser-side WASM, or local Whisper.cpp. Use when transcribing audio for caption overlays or subtitle tracks.
metadata:
  tags: captions, whisper, ai, transcription, openai, wasm, whisper-cpp, subtitles
---

Three paths exist for AI transcription. Choose based on where the render runs and whether audio data can leave the machine.

## Path 1 — OpenAI Whisper API

Use `@remotion/openai-whisper` when you have an OpenAI API key and want the fastest integration. Transcription runs server-side before rendering begins.

```bash title="Install"
npm install @remotion/openai-whisper
```

```ts title="Transcribe audio and convert to captions"
import { openAiWhisperApiToCaptions } from "@remotion/openai-whisper";
import OpenAI from "openai";
import { createReadStream } from "fs";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const transcription = await client.audio.transcriptions.create({
  file: createReadStream("public/voiceover/scene-01.mp3"),
  model: "whisper-1",
  response_format: "verbose_json",
  timestamp_granularities: ["word"],
});

const { captions } = openAiWhisperApiToCaptions({ transcription });
```

Each caption object has:

- `start` — start timestamp in seconds
- `end` — end timestamp in seconds
- `text` — caption string

Save the captions as JSON and load them as `inputProps` at render time. Run this script once per audio file, not during rendering.

```ts title="Save captions for later use"
import { writeFileSync } from "fs";

writeFileSync(
  "public/captions/scene-01.json",
  JSON.stringify(captions, null, 2),
);
```

## Path 2 — Browser-side WASM (whisper-web)

Use `@remotion/whisper-web` when rendering in the browser via the Remotion Player and audio must not leave the client. Transcription runs client-side using WebAssembly.

```bash title="Install"
npm install @remotion/whisper-web
```

```tsx title="Transcribe in the browser"
import {
  canUseWhisperWeb,
  downloadWhisperModel,
  resampleTo16Khz,
  transcribe,
} from "@remotion/whisper-web";

if (!canUseWhisperWeb()) {
  throw new Error("Browser does not support SharedArrayBuffer");
}

await downloadWhisperModel({ model: "tiny", onProgress: console.log });

const audioData = await resampleTo16Khz(audioBuffer);

const { transcription } = await transcribe({
  audioData,
  model: "tiny",
});

const text = transcription.map((t) => t.text).join(" ");
```

Requirements:

- `Cross-Origin-Embedder-Policy: require-corp`
- `Cross-Origin-Opener-Policy: same-origin`

These headers must be set on the page serving the Player. The API is experimental.

## Path 3 — Local Whisper.cpp

Use `@remotion/install-whisper-cpp` when audio is sensitive, internet access is unavailable, or you want no per-call API cost. Transcription runs locally.

```bash title="Install"
npm install @remotion/install-whisper-cpp
```

```ts title="Install binary and transcribe"
import {
  installWhisperCpp,
  downloadWhisperModel,
  transcribe,
  toCaptions,
} from "@remotion/install-whisper-cpp";

await installWhisperCpp({ version: "1.5.4", to: "/tmp/whisper" });
await downloadWhisperModel({ model: "medium", folder: "/tmp/whisper" });

const result = await transcribe({
  inputPath: "public/voiceover/scene-01.wav",
  whisperPath: "/tmp/whisper",
  model: "medium",
  tokenLevelTimestamps: true,
});

const { captions } = toCaptions({ transcription: result });
```

`toCaptions()` returns caption objects with the same `start`, `end`, `text` shape as path 1. Token-level timestamps let you animate individual words.

## Displaying captions

Once you have caption objects, pass them as `inputProps` and render with the display-captions rule:

```tsx title="Render captions at current frame"
import { useCurrentFrame, useVideoConfig } from "remotion";

type Caption = { start: number; end: number; text: string };

export const CaptionOverlay = ({ captions }: { captions: Caption[] }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  const active = captions.find(
    (c) => currentTime >= c.start && currentTime < c.end,
  );

  return (
    <div style={{ position: "absolute", bottom: 80, width: "100%", textAlign: "center" }}>
      {active?.text ?? ""}
    </div>
  );
};
```

## Choosing a path

- Public audio, fastest setup → Path 1 (OpenAI API)
- Browser-only, client privacy, no server → Path 2 (whisper-web)
- Private audio, offline, cost control → Path 3 (whisper-cpp)

## Related

- `rules/audio/display-captions.md` — rendering caption overlays
- `rules/audio/voiceover.md` — generating TTS audio
- `rules/audio/import-srt-captions.md` — loading pre-made SRT files
