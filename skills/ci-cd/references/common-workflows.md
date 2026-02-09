# Common GitHub Actions Workflow Patterns

## 1. Reusable Workflows

Reusable workflows allow you to define a workflow once and call it from multiple other workflows. The caller passes inputs and secrets, whilst the callee can return outputs. This reduces duplication and centralises maintenance.

### Caller Workflow

```yaml
name: Call Reusable Workflow

on:
  push:
    branches: [main]

jobs:
  call-workflow:
    uses: ./.github/workflows/reusable-build.yml
    with:
      node-version: '20'
      run-tests: true
    secrets:
      npm-token: ${{ secrets.NPM_TOKEN }}
```

### Callee Workflow (reusable-build.yml)

```yaml
name: Reusable Build Workflow

on:
  workflow_call:
    inputs:
      node-version:
        required: true
        type: string
      run-tests:
        required: false
        type: boolean
        default: false
    secrets:
      npm-token:
        required: true
    outputs:
      build-status:
        description: "Build completion status"
        value: ${{ jobs.build.outputs.status }}

jobs:
  build:
    runs-on: ubuntu-latest
    outputs:
      status: ${{ steps.build-step.outputs.status }}
    steps:
      - uses: actions/checkout@v6

      - uses: actions/setup-node@v6
        with:
          node-version: ${{ inputs.node-version }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci
        env:
          NPM_TOKEN: ${{ secrets.npm-token }}

      - name: Build
        id: build-step
        run: |
          npm run build
          echo "status=success" >> $GITHUB_OUTPUT

      - name: Test
        if: ${{ inputs.run-tests }}
        run: npm test
```

## 2. Deployment with Approval Gates

GitHub Environments provide approval gates for deployments. Production deployments require manual approval from designated reviewers before proceeding. The environment URL appears in the deployment dashboard, and failed deployments trigger automatic rollback.

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://example.com
    steps:
      - uses: actions/checkout@v6

      - name: Deploy to Production
        id: deploy
        run: |
          echo "Deploying application..."
          # Your deployment command here
          # Example: kubectl apply -f k8s/ or vercel deploy --prod

      - name: Verify Deployment
        run: |
          echo "Running health checks..."
          curl -f https://example.com/health || exit 1

      - name: Rollback on Failure
        if: failure() && steps.deploy.outcome == 'failure'
        run: |
          echo "Deployment failed, initiating rollback..."
          # Your rollback command here
          # Example: kubectl rollout undo deployment/app

      - name: Notify Team
        if: always()
        run: |
          STATUS="${{ job.status }}"
          echo "Deployment status: $STATUS"
```

## 3. Slack Notifications

Slack notifications keep your team informed about workflow outcomes. The slack-github-action uses a webhook URL stored in repository secrets. You can send different messages for success and failure states, including rich formatting with context and metadata.

```yaml
name: Build and Notify

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6

      - name: Run Build
        id: build
        run: |
          echo "Building application..."
          npm ci && npm run build

      - name: Notify Success
        if: success()
        uses: slackapi/slack-github-action@v2
        with:
          webhook: ${{ secrets.SLACK_WEBHOOK_URL }}
          webhook-type: incoming-webhook
          payload: |
            {
              "text": "Build succeeded for ${{ github.repository }}",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": ":white_check_mark: *Build Successful*\n*Repository:* ${{ github.repository }}\n*Branch:* ${{ github.ref_name }}\n*Commit:* <${{ github.event.head_commit.url }}|${{ github.sha }}>\n*Author:* ${{ github.actor }}"
                  }
                }
              ]
            }

      - name: Notify Failure
        if: failure()
        uses: slackapi/slack-github-action@v2
        with:
          webhook: ${{ secrets.SLACK_WEBHOOK_URL }}
          webhook-type: incoming-webhook
          payload: |
            {
              "text": "Build failed for ${{ github.repository }}",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": ":x: *Build Failed*\n*Repository:* ${{ github.repository }}\n*Branch:* ${{ github.ref_name }}\n*Commit:* <${{ github.event.head_commit.url }}|${{ github.sha }}>\n*Author:* ${{ github.actor }}\n*Workflow:* <${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}|View logs>"
                  }
                }
              ]
            }
```

## 4. Scheduled Workflows

Scheduled workflows run automatically using cron expressions. They're ideal for nightly builds, weekly security scans, and maintenance tasks. Adding workflow_dispatch allows manual triggering when needed, whilst conditions can skip execution on weekends or holidays.

```yaml
name: Scheduled Maintenance

on:
  schedule:
    # Nightly build at 2:00 AM UTC
    - cron: '0 2 * * *'
    # Weekly security scan every Monday at 9:00 AM UTC
    - cron: '0 9 * * 1'
  workflow_dispatch:
    inputs:
      task:
        description: 'Task to run'
        required: true
        type: choice
        options:
          - nightly-build
          - security-scan
          - full-maintenance

jobs:
  nightly-build:
    runs-on: ubuntu-latest
    if: |
      (github.event.schedule == '0 2 * * *' ||
       github.event.inputs.task == 'nightly-build' ||
       github.event.inputs.task == 'full-maintenance') &&
      github.event.schedule != '0 2 * * 0' &&
      github.event.schedule != '0 2 * * 6'
    steps:
      - uses: actions/checkout@v6

      - name: Skip Weekends Check
        run: |
          DAY=$(date +%u)
          if [ $DAY -eq 6 ] || [ $DAY -eq 7 ]; then
            echo "Skipping nightly build on weekend"
            exit 0
          fi

      - name: Run Nightly Build
        run: |
          echo "Running nightly build..."
          npm ci && npm run build

  security-scan:
    runs-on: ubuntu-latest
    if: |
      github.event.schedule == '0 9 * * 1' ||
      github.event.inputs.task == 'security-scan' ||
      github.event.inputs.task == 'full-maintenance'
    steps:
      - uses: actions/checkout@v6

      - name: Run Security Audit
        run: |
          echo "Running security scan..."
          npm audit --audit-level=moderate

      - name: Dependency Review
        run: |
          echo "Checking for outdated dependencies..."
          npm outdated || true
```

## 5. Monorepo Workflow Orchestration

Monorepo workflows use path filters to trigger only affected packages. Turbo optimises task execution by running only changed packages since the base branch. Combining Bun with Turbo provides fast TypeScript builds and efficient caching for large codebases.

```yaml
name: Monorepo CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
    paths:
      - 'packages/**'
      - 'apps/**'
      - 'turbo.json'
      - 'package.json'
      - 'bun.lockb'

jobs:
  changes:
    runs-on: ubuntu-latest
    outputs:
      api: ${{ steps.filter.outputs.api }}
      web: ${{ steps.filter.outputs.web }}
      shared: ${{ steps.filter.outputs.shared }}
    steps:
      - uses: actions/checkout@v6

      - uses: dorny/paths-filter@v3
        id: filter
        with:
          filters: |
            api:
              - 'packages/api/**'
              - 'packages/shared/**'
            web:
              - 'apps/web/**'
              - 'packages/shared/**'
            shared:
              - 'packages/shared/**'

  build-and-test:
    needs: changes
    if: |
      needs.changes.outputs.api == 'true' ||
      needs.changes.outputs.web == 'true' ||
      needs.changes.outputs.shared == 'true'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
        with:
          fetch-depth: 0

      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest

      - name: Install Dependencies
        run: bun install --frozen-lockfile

      - name: Build Changed Packages
        run: |
          if [ "${{ github.event_name }}" == "pull_request" ]; then
            bunx turbo run build --filter=...[origin/${{ github.base_ref }}]
          else
            bunx turbo run build
          fi

      - name: Test Changed Packages
        run: |
          if [ "${{ github.event_name }}" == "pull_request" ]; then
            bunx turbo run test --filter=...[origin/${{ github.base_ref }}]
          else
            bunx turbo run test
          fi

      - name: Lint Changed Packages
        run: |
          if [ "${{ github.event_name }}" == "pull_request" ]; then
            bunx turbo run lint --filter=...[origin/${{ github.base_ref }}]
          else
            bunx turbo run lint
          fi

  api-specific:
    needs: changes
    if: needs.changes.outputs.api == 'true'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6

      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest

      - name: Install Dependencies
        run: bun install --frozen-lockfile

      - name: Build API Package
        run: bunx turbo run build --filter=@repo/api

      - name: Run API Tests
        run: bunx turbo run test --filter=@repo/api

  web-specific:
    needs: changes
    if: needs.changes.outputs.web == 'true'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6

      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest

      - name: Install Dependencies
        run: bun install --frozen-lockfile

      - name: Build Web App
        run: bunx turbo run build --filter=web

      - name: Run Web Tests
        run: bunx turbo run test --filter=web
