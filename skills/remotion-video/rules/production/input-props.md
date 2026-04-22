---
name: input-props
description: Pass and validate input props in Remotion via CLI flags, renderMedia, and getInputProps. Covers prop resolution order, Zod schema validation with @remotion/zod-types, and render-boundary security.
metadata:
  tags: props, inputProps, getInputProps, zod, validation, cli, schema, defaultProps
---

Always validate input props at the render boundary with a Zod schema. Never trust incoming JSON from an API caller or CLI invocation without parsing it first.

## Prop Resolution Order

Props resolve in three layers, each overriding the one before:

1. `defaultProps` defined on `<Composition>` — baseline values, always present
2. `inputProps` passed at render time — overrides defaults when provided
3. Props returned from `calculateMetadata` — final override, can reshape any field

A field in `inputProps` with value `undefined` does not override the `defaultProps` value for that field. Pass an explicit value or omit the key entirely.

## Accessing Props in the Root

Use `getInputProps()` inside your root component or `calculateMetadata` to read props that were passed from the CLI or the render API.

```ts title="src/Root.tsx"
import { getInputProps } from "remotion";

const inputProps = getInputProps();
// Returns the object from --props or renderMediaOnLambda's inputProps
```

Inside a composition component, props arrive as regular React props — no need to call `getInputProps()` there.

## CLI: Inline JSON

```bash title="Inline props flag"
npx remotion render MyComposition out/video.mp4 --props='{"title":"Hello","color":"#ff0000"}'
```

## CLI: Props File

```bash title="Props from a JSON file"
npx remotion render MyComposition out/video.mp4 --props=./props.json
```

The file must be valid JSON. The top-level value must be an object.

## Server-Side: renderMedia and renderMediaOnLambda

```ts title="src/render.ts"
import { renderMedia, selectComposition } from "@remotion/renderer";
import { MyCompositionSchema } from "./schema";

const props = MyCompositionSchema.parse({
  title: "Hello",
  color: "#ff0000",
});

const composition = await selectComposition({
  serveUrl,
  id: "MyComposition",
  inputProps: props,
});

await renderMedia({
  composition,
  serveUrl,
  codec: "h264",
  outputLocation: "out/video.mp4",
  inputProps: props,
});
```

Pass `inputProps` to both `selectComposition` and `renderMedia`. The first call uses it to run `calculateMetadata`; the second passes it to the render workers.

## Defining a Zod Schema

```ts title="src/schema.ts"
import { z } from "zod";
import { zColor } from "@remotion/zod-types";

export const MyCompositionSchema = z.object({
  title: z.string().min(1).max(200),
  color: zColor(),
  durationInSeconds: z.number().min(1).max(300),
  backgroundFile: z.string().optional(),
});

export type MyCompositionProps = z.infer<typeof MyCompositionSchema>;
```

Attach the schema to the composition:

```tsx title="src/Root.tsx"
import { Composition } from "remotion";
import { MyComposition } from "./MyComposition";
import { MyCompositionSchema } from "./schema";

export const RemotionRoot = () => (
  <Composition
    id="MyComposition"
    component={MyComposition}
    schema={MyCompositionSchema}
    durationInFrames={150}
    fps={30}
    width={1920}
    height={1080}
    defaultProps={{
      title: "Default Title",
      color: "#0b84f3",
      durationInSeconds: 5,
    }}
  />
);
```

The schema enables visual editing in Remotion Studio and validates props in the GUI.

## @remotion/zod-types Helpers

Install with:

```bash
npx remotion add @remotion/zod-types zod
```

Available helpers:

- `zColor()` — validates hex colour strings; renders a colour picker in Studio
- `zTextarea()` — validates strings; renders a multiline text input in Studio
- `zMatrix()` — validates CSS matrix strings

Use `z.string()` for file paths. Remotion does not ship a `zFile()` helper — validate that the string is non-empty and ends with an expected extension.

## Security at the Render Boundary

ALWAYS parse and validate `inputProps` before passing them to `renderMedia` or `renderMediaOnLambda`. An API endpoint that accepts arbitrary JSON and forwards it directly to a render function is a remote code execution risk if the composition uses those props in shell commands, file paths, or `<Img>` `src` attributes without sanitisation.

```ts title="src/api/render.ts"
import { MyCompositionSchema } from "../schema";

export async function handleRenderRequest(body: unknown) {
  // Parse throws a ZodError if validation fails — let it bubble to your error handler
  const props = MyCompositionSchema.parse(body);

  // Safe to use props here
  await startRender(props);
}
```

Never use `z.any()` or skip validation for "internal" callers. The render boundary is the right place to enforce the contract regardless of source.

## Related

- [compositions](../core/compositions.md) — defaultProps and calculateMetadata
- [lambda](./lambda.md) — passing inputProps to renderMediaOnLambda
- [player](./player.md) — passing memoised inputProps to the Player component
- [caption-timing-safety](./caption-timing-safety.md) — validating duration props before interpolation
