---
name: ci-cd
description: "Creates production-ready GitHub Actions workflows for CI/CD, Docker builds, security scanning, and monorepo orchestration. Triggers on requests for CI/CD setup, workflow creation, pipeline automation, GitHub Actions help, deployment workflows, matrix builds, reusable workflows, or security scanning configuration."
context: fork
allowed-tools: Read, Write, Edit, Grep, Glob, Bash(git *)
---

<instructions>

# GitHub Actions Templates

## When to Use
- CI/CD pipeline setup for any stack
- Automated testing with matrix builds
- Docker image builds and registry pushes
- Security vulnerability scanning
- Reusable workflow patterns for monorepos
- Deployment pipelines with approval gates

## When NOT to Use
- GitLab CI, CircleCI, or Jenkins pipelines (different syntax and runners)
- Simple scripts that run locally without CI benefit
- One-off manual deployments (use `gh` CLI instead)
- Infrastructure provisioning (use Terraform/Pulumi, not GHA)

## Quick Decision Tree

| Need | Pattern | Reference |
|------|---------|-----------|
| Run tests on push/PR | Test workflow | references/test-workflow.yml |
| Build and push Docker image | Docker build | references/deploy-workflow.yml |
| Test across OS/versions | Matrix build | references/matrix-build.yml |
| Scan for vulnerabilities | Security scan | references/security-scan.yml |
| Share logic across repos | Reusable workflows | references/common-workflows.md |
| Deploy with approval gates | Deployment pipeline | references/common-workflows.md |
| Notify team on success/failure | Slack notifications | references/common-workflows.md |
| Selective monorepo builds | Path filters + Turbo | references/common-workflows.md |
| Adapt templates to your stack | Stack-specific changes | references/adaptation-guide.md |
| Avoid common mistakes | Anti-patterns | references/anti-patterns.md |

Read the matching reference file, then adapt it using `references/adaptation-guide.md` for the user's stack.

## Core Patterns

### 1. Test Workflow
Runs lint, tests, and coverage on push and PR. Default: Node.js with npm.

<example>
```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [20.x, 22.x]
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v6
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - uses: codecov/codecov-action@v5
```
</example>

Full template with adaptation comments: `references/test-workflow.yml`

### 2. Docker Build and Push
Builds a Docker image, tags with semver metadata, pushes to GHCR. Uses layer caching.

<example>
```yaml
jobs:
  build-and-push:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v6
      - uses: docker/setup-buildx-action@v3
      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - uses: docker/build-push-action@v6
        with:
          push: true
          cache-from: type=gha
          cache-to: type=gha,mode=max
```
</example>

Full template with registry switching comments: `references/deploy-workflow.yml`

### 3. Matrix Build
Tests across multiple OS and language versions. Default: Python cross-platform.

<example>
```yaml
strategy:
  fail-fast: false
  matrix:
    os: [ubuntu-latest, macos-latest, windows-latest]
    python-version: ["3.11", "3.12", "3.13"]
```
</example>

Full template with Bun/Go/Rust/Node adaptation: `references/matrix-build.yml`

### 4. Security Scanning
Runs Trivy filesystem scan and Snyk dependency check. Uploads results to GitHub Security tab.

<example>
```yaml
- uses: aquasecurity/trivy-action@0.33.1
  with:
    scan-type: 'fs'
    format: 'sarif'
    output: 'trivy-results.sarif'
- uses: github/codeql-action/upload-sarif@v4
  with:
    sarif_file: 'trivy-results.sarif'
```
</example>

Full template with weekly schedule and Snyk: `references/security-scan.yml`

### 5. Reusable Workflows
Share workflow logic across repositories with `workflow_call` trigger.

<example>
```yaml
# Callee: .github/workflows/reusable-test.yml
on:
  workflow_call:
    inputs:
      node-version:
        required: true
        type: string

# Caller: .github/workflows/ci.yml
jobs:
  test:
    uses: ./.github/workflows/reusable-test.yml
    with:
      node-version: "22.x"
```
</example>

Full caller/callee examples: `references/common-workflows.md`

### 6. Monorepo Orchestration
Path filters trigger only affected packages. Turbo runs selective tasks.

<example>
```yaml
on:
  push:
    paths: ['packages/api/**', 'packages/shared/**']
jobs:
  test:
    steps:
      - uses: oven-sh/setup-bun@v2
      - run: bun install
      - run: bun turbo test --filter=...[origin/main]
```
</example>

Full monorepo patterns with Bun + Turbo: `references/common-workflows.md`

## Do / Don't / Why

| Do | Don't | Why |
|----|-------|-----|
| Pin actions to `@vN` | Use `@latest` or `@master` | Supply chain risk and random breakage |
| Set minimum `permissions` | Omit the permissions block | Default token has write-all access |
| Cache dependencies | Install fresh every run | 2-5x slower builds, wasted bandwidth |
| Use `secrets` for credentials | Hardcode tokens in YAML | Exposed in git history forever |
| Scope triggers to main + PR | Trigger on push to all branches | Wastes CI minutes on feature branches |
| Use reusable workflows | Copy-paste between repos | Drift, inconsistency, maintenance burden |
| Use `vars` for environment config | Hardcode regions and cluster names | Breaks portability between environments |
| Set `fail-fast: false` in matrix | Leave default `fail-fast: true` | One failure hides others in the matrix |

See `references/anti-patterns.md` for detailed before/after examples of each mistake.

## Feedback Loops

### Deployment Verification
1. Run health check after deploy: `curl -f $APP_URL/health`
2. On failure: roll back (`kubectl rollout undo` or SST rollback)
3. Notify team via Slack on success or failure
4. Block next deploy until current one passes

### Test Verification
1. Fail the workflow if coverage drops below threshold
2. Upload test artifacts on failure for debugging
3. Require all matrix combinations to pass (set `fail-fast: false`)

### Version Currency
Action versions in reference files are current as of February 2026. Check for updates:
```bash
gh api repos/OWNER/REPO/releases/latest --jq '.tag_name'
```

## Adaptation Workflow

When generating a workflow for the user:
1. Read the matching reference file from the decision tree above
2. Read `references/adaptation-guide.md` for the user's tech stack
3. Apply the adaptation changes (package manager, test runner, registry)
4. Remove unused `# ADAPT:` comments from the final output
5. Verify all action versions match the reference files

## References
- `references/test-workflow.yml` — Test workflow with CI steps
- `references/deploy-workflow.yml` — Docker build-and-push to GHCR
- `references/matrix-build.yml` — Cross-platform matrix build
- `references/security-scan.yml` — Trivy + Snyk security scanning
- `references/common-workflows.md` — Reusable workflows, approvals, Slack, monorepo
- `references/anti-patterns.md` — 8 common mistakes with fixes
- `references/adaptation-guide.md` — Per-stack customisation (Bun, Node, Python, Go, Docker registries)

</instructions>
