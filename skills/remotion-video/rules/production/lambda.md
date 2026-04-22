---
name: lambda
description: Deploy and render Remotion videos on AWS Lambda using @remotion/lambda. Covers deployFunction, deploySite, renderMediaOnLambda, getRenderProgress, cost tuning, and IAM setup.
metadata:
  tags: lambda, aws, deploy, render, cloud, cost, iam, webhooks
---

Use `@remotion/lambda/client` (v5 import path) for all Lambda operations to keep the bundle small and avoid importing server-only code into browser contexts.

## Install

```bash title="Install Lambda package"
npx remotion add @remotion/lambda
```

## IAM Policy

The executing role needs the permissions listed in the [Lambda checklist](https://www.remotion.dev/docs/lambda/checklist). At minimum:

- `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject` on the render bucket
- `lambda:InvokeFunction` on the deployed function
- `logs:CreateLogGroup`, `logs:CreateLogStream`, `logs:PutLogEvents` for CloudWatch
- `iam:PassRole` if using a custom role

Use the `remotion-executionrole` policy from the official checklist rather than `AdministratorAccess`. Overly broad permissions will cause security audit failures.

## Deploy the Function

Deploy once per region. The call is idempotent — it returns the existing function when the configuration matches.

```ts title="scripts/deploy.ts"
import { deployFunction, deploySite, getOrCreateBucket } from "@remotion/lambda/client";
import path from "path";

const REGION = "eu-west-1";
const MEMORY_MB = 2048;
const DISK_MB = 10240;
const TIMEOUT_S = 240;

async function deploy() {
  const { bucketName } = await getOrCreateBucket({ region: REGION });

  const { functionName } = await deployFunction({
    region: REGION,
    timeoutInSeconds: TIMEOUT_S,
    memorySizeInMb: MEMORY_MB,
    diskSizeInMb: DISK_MB,
    createCloudWatchLogGroup: true,
    cloudWatchLogRetentionPeriodInDays: 14,
  });

  const { serveUrl } = await deploySite({
    entryPoint: path.join(process.cwd(), "src/index.ts"),
    bucketName,
    region: REGION,
    siteName: "my-video-site",
  });

  console.log({ functionName, serveUrl, bucketName });
}

deploy();
```

## Cost and Memory Tuning

Lambda cost is directly proportional to memory. Cutting memory by 25% cuts cost by ~25%.

Start at 2048 MB and lower in 256 MB increments while monitoring for `Out of memory` errors in CloudWatch. Do not go below 512 MB — Chrome will crash.

Disk cost is separate from compute. The output file must fit in roughly half the `diskSizeInMb` allocation because the render also writes chunk files. A 500 MB output needs at least 1024 MB of disk. For most videos under 10 minutes, 2048 MB disk is sufficient.

Timeout should stay at 120–240 seconds. Prefer higher concurrency (more Lambdas) over longer timeouts.

## Render Media on Lambda

```ts title="src/render.ts"
import {
  renderMediaOnLambda,
  getRenderProgress,
} from "@remotion/lambda/client";

const REGION = "eu-west-1";

export async function renderVideo(
  functionName: string,
  serveUrl: string,
  bucketName: string,
  inputProps: Record<string, unknown>,
) {
  const { renderId } = await renderMediaOnLambda({
    region: REGION,
    functionName,
    serveUrl,
    bucketName,
    composition: "MyComposition",
    codec: "h264",
    inputProps,
    privacy: "private",
    framesPerLambda: 20,
    timeoutInMilliseconds: 30000,
    webhook: {
      url: "https://my-api.example.com/webhooks/remotion",
      secret: process.env.REMOTION_WEBHOOK_SECRET!,
    },
  });

  return renderId;
}
```

`framesPerLambda` controls how many Lambda invocations are spawned. The total invocation count cannot exceed 200. For a 600-frame video with `framesPerLambda: 20`, Remotion spawns 30 chunk Lambdas plus one stitcher — well within the limit.

Lower `framesPerLambda` means faster renders at higher cost. A value of 20–40 is a good starting point for videos under 5 minutes.

## Poll Render Progress

Poll `getRenderProgress` on a fixed interval until `done` is true or `fatalErrorEncountered` is true.

```ts title="src/poll-progress.ts"
import { getRenderProgress } from "@remotion/lambda/client";

async function waitForRender(
  renderId: string,
  bucketName: string,
  functionName: string,
) {
  const REGION = "eu-west-1";
  const POLL_INTERVAL_MS = 3000;

  while (true) {
    const progress = await getRenderProgress({
      renderId,
      bucketName,
      functionName,
      region: REGION,
    });

    console.log(`Progress: ${Math.round(progress.overallProgress * 100)}%`);

    if (progress.fatalErrorEncountered) {
      throw new Error(progress.errors[0]?.message ?? "Render failed");
    }

    if (progress.done) {
      return progress.outputFile;
    }

    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
}
```

Key response fields:

- `overallProgress` — number 0–1
- `done` — render is complete and `outputFile` is available
- `fatalErrorEncountered` — render failed; check `errors[]` for details
- `outputFile` — S3 URL of the final artifact when `done` is true
- `costs.accruedSoFar` — live cost in USD

## Webhooks

Webhooks fire once on completion or failure. They are more efficient than polling for long renders.

```ts title="Webhook payload shape"
// POST body sent to your endpoint
type WebhookPayload =
  | { type: "success"; renderId: string; outputUrl: string; outputFile: string }
  | { type: "error"; renderId: string; errors: Array<{ message: string }> }
  | { type: "timeout"; renderId: string };
```

Verify the `X-Remotion-Signature` header against `HMAC-SHA512(secret, body)` before trusting the payload. Respond with HTTP 200 within 5 seconds to avoid retries.

## Render a Still on Lambda

```ts title="src/render-still.ts"
import { renderStillOnLambda } from "@remotion/lambda/client";

const { url } = await renderStillOnLambda({
  region: "eu-west-1",
  functionName,
  serveUrl,
  bucketName,
  composition: "Thumbnail",
  frame: 0,
  imageFormat: "png",
  inputProps: { title: "Hello World" },
  privacy: "public",
});
```

## Pre-signed URLs for Private Renders

When `privacy` is `"private"`, generate a time-limited URL for clients.

```ts title="src/presign.ts"
import { presignUrl } from "@remotion/lambda/client";

const signedUrl = await presignUrl({
  region: "eu-west-1",
  bucketName,
  objectKey: outKey,
  expiresInSeconds: 3600,
});
```

## Regions

AWS Lambda pricing varies by region. `us-east-1` and `eu-west-1` are typically among the cheapest. Check the [AWS Lambda pricing page](https://aws.amazon.com/lambda/pricing/) before choosing a region. Deploy the function to the same region as your S3 bucket to avoid cross-region data transfer charges.

## Full Deploy + Render Workflow

```ts title="scripts/full-workflow.ts"
import {
  deployFunction,
  deploySite,
  getOrCreateBucket,
  renderMediaOnLambda,
  getRenderProgress,
} from "@remotion/lambda/client";
import path from "path";

const REGION = "eu-west-1" as const;

async function main() {
  const { bucketName } = await getOrCreateBucket({ region: REGION });

  const { functionName } = await deployFunction({
    region: REGION,
    timeoutInSeconds: 240,
    memorySizeInMb: 2048,
    diskSizeInMb: 10240,
    createCloudWatchLogGroup: true,
  });

  const { serveUrl } = await deploySite({
    entryPoint: path.join(process.cwd(), "src/index.ts"),
    bucketName,
    region: REGION,
    siteName: "my-site",
  });

  const { renderId } = await renderMediaOnLambda({
    region: REGION,
    functionName,
    serveUrl,
    bucketName,
    composition: "MyComposition",
    codec: "h264",
    inputProps: { title: "Hello Lambda" },
    privacy: "private",
    framesPerLambda: 20,
  });

  while (true) {
    const progress = await getRenderProgress({
      renderId,
      bucketName,
      functionName,
      region: REGION,
    });

    if (progress.fatalErrorEncountered) throw new Error(progress.errors[0]?.message);
    if (progress.done) {
      console.log("Done:", progress.outputFile);
      break;
    }

    await new Promise((r) => setTimeout(r, 3000));
  }
}

main();
```

## Related

- [input-props](./input-props.md) — passing props to the composition before render
- [video-tag-decision](./video-tag-decision.md) — choosing the right video component for Lambda renders
- [caption-timing-safety](./caption-timing-safety.md) — avoiding interpolate errors in Lambda renders
- [compositions](../core/compositions.md) — registering compositions and calculateMetadata
