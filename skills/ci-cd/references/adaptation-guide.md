# GitHub Actions Template Adaptation Guide

This guide shows how to customise workflow templates for different tech stacks and deployment targets. Each section maps template defaults to stack-specific configurations.

## TypeScript + Bun Monorepo

Primary target stack with full Turbo and Playwright support.

### Package Manager Setup

| What to Change | From (Default) | To (Bun) |
|----------------|----------------|----------|
| Package manager setup | `actions/setup-node@v6` | `oven-sh/setup-bun@v2` |
| Install command | `npm ci` | `bun install` |
| Run tests | `npm test` | `bun test` or `bun turbo test` |
| Run lint | `npm run lint` | `bun turbo lint` |
| Run typecheck | `npm run typecheck` | `bun turbo typecheck` |
| Run build | `npm run build` | `bun turbo build` |
| Cache configuration | `cache: "npm"` in setup-node | `cache: true` in setup-bun (built-in) |

### Turbo Cache Configuration

Enable remote caching for faster CI builds.

**Option 1: Vercel Remote Cache**
```yaml
env:
  TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
  TURBO_TEAM: ${{ secrets.TURBO_TEAM }}
```

**Option 2: Local Cache**
```yaml
- name: Cache Turbo
  uses: actions/cache@v5
  with:
    path: .turbo
    key: ${{ runner.os }}-turbo-${{ github.sha }}
    restore-keys: |
      ${{ runner.os }}-turbo-
```

### Playwright Setup for Bun

Replace npm-based Playwright installation with Bun variant.

```yaml
- name: Install Playwright Browsers
  run: bunx playwright install --with-deps chromium
```

For full browser support:
```yaml
- name: Install Playwright Browsers
  run: bunx playwright install --with-deps
```

### Cross-Platform Matrix with Bun

Bun has experimental Windows support. Use this matrix for cross-platform testing.

```yaml
strategy:
  matrix:
    os: [ubuntu-latest, macos-latest]
    # Windows support is experimental - uncomment when stable
    # os: [ubuntu-latest, macos-latest, windows-latest]
```

### Monorepo Selective Testing

Run tests only for packages affected since base branch.

```yaml
- name: Run affected tests
  run: bun turbo test --filter=...[origin/main]
```

For specific package:
```yaml
- name: Test specific package
  run: bun turbo test --filter=@my-org/package-name
```

### Complete Bun Workflow Example

```yaml
- name: Setup Bun
  uses: oven-sh/setup-bun@v2
  with:
    bun-version: latest
    cache: true

- name: Install dependencies
  run: bun install

- name: Lint
  run: bun turbo lint

- name: Type check
  run: bun turbo typecheck

- name: Test
  run: bun turbo test --filter=...[origin/main]

- name: Build
  run: bun turbo build
```

## Node.js Package Managers

Adaptations for npm, yarn, and pnpm.

### npm (Default)

| Step | Configuration |
|------|--------------|
| Setup | `actions/setup-node@v6` with `cache: "npm"` |
| Install | `npm ci` |
| Test | `npm test` |
| Build | `npm run build` |
| Lint | `npm run lint` |

### yarn

| Step | Configuration |
|------|--------------|
| Setup | `actions/setup-node@v6` with `cache: "yarn"` |
| Install | `yarn install --frozen-lockfile` |
| Test | `yarn test` |
| Build | `yarn build` |
| Lint | `yarn lint` |

### pnpm

Requires separate setup action before setup-node.

```yaml
- name: Setup pnpm
  uses: pnpm/action-setup@v4
  with:
    version: 8

- name: Setup Node.js
  uses: actions/setup-node@v6
  with:
    node-version: '20'
    cache: 'pnpm'

- name: Install dependencies
  run: pnpm install --frozen-lockfile

- name: Test
  run: pnpm test

- name: Build
  run: pnpm build
```

## Python

Replace Node.js setup with Python environment.

### Basic Python Setup

| Step | Configuration |
|------|--------------|
| Setup | `actions/setup-python@v6` |
| Install (pip) | `pip install -r requirements.txt` |
| Install (editable) | `pip install -e ".[dev]"` |
| Test | `pytest` or `python -m pytest` |
| Lint | `ruff check .` or `flake8 .` |
| Format check | `ruff format --check .` or `black --check .` |
| Type check | `mypy .` |

### Poetry

Recommended for dependency management and packaging.

```yaml
- name: Setup Python
  uses: actions/setup-python@v6
  with:
    python-version: '3.12'

- name: Install Poetry
  run: pip install poetry

- name: Install dependencies
  run: poetry install

- name: Run tests
  run: poetry run pytest

- name: Lint
  run: poetry run ruff check .
```

### uv (Fast Python Package Manager)

Modern alternative to pip with faster installs.

```yaml
- name: Setup uv
  uses: astral-sh/setup-uv@v7

- name: Setup Python
  uses: actions/setup-python@v6
  with:
    python-version: '3.12'

- name: Install dependencies
  run: uv pip install -r requirements.txt

- name: Run tests
  run: pytest
```

## Go

Replace Node.js setup with Go toolchain.

### Basic Go Setup

| Step | Configuration |
|------|--------------|
| Setup | `actions/setup-go@v5` |
| Install | `go mod download` |
| Test | `go test ./...` |
| Lint | `go vet ./...` or `golangci-lint run` |
| Build | `go build ./...` |

### Complete Go Workflow

```yaml
- name: Setup Go
  uses: actions/setup-go@v5
  with:
    go-version: '1.22'
    cache: true

- name: Download dependencies
  run: go mod download

- name: Verify dependencies
  run: go mod verify

- name: Vet
  run: go vet ./...

- name: Test
  run: go test -v -race -coverprofile=coverage.out ./...

- name: Build
  run: go build -v ./...
```

### golangci-lint Integration

```yaml
- name: golangci-lint
  uses: golangci/golangci-lint-action@v8
  with:
    version: latest
    args: --timeout=5m
```

## Docker Registry Switching

Adapt container image push steps for different registries.

### Registry Configuration Matrix

| Registry | Login Action | Registry URL | Image Tag Format | Credentials |
|----------|-------------|--------------|------------------|-------------|
| GitHub Container Registry | `docker/login-action@v3` | `ghcr.io` | `ghcr.io/${{ github.repository }}` | `GITHUB_TOKEN` |
| Amazon ECR | `aws-actions/amazon-ecr-login@v2` | `*.dkr.ecr.*.amazonaws.com` | `${{ steps.login-ecr.outputs.registry }}/repo` | AWS credentials |
| Docker Hub | `docker/login-action@v3` | (default) | `username/repo` | `DOCKERHUB_USERNAME` + `DOCKERHUB_TOKEN` |
| Google Artifact Registry | `google-github-actions/auth@v3` | `*.pkg.dev` | `REGION-docker.pkg.dev/PROJECT/REPO/IMAGE` | GCP service account |

### GitHub Container Registry (GHCR)

```yaml
- name: Log in to GHCR
  uses: docker/login-action@v3
  with:
    registry: ghcr.io
    username: ${{ github.actor }}
    password: ${{ secrets.GITHUB_TOKEN }}

- name: Build and push
  uses: docker/build-push-action@v6
  with:
    push: true
    tags: ghcr.io/${{ github.repository }}:${{ github.sha }}
```

### Amazon ECR

```yaml
- name: Configure AWS credentials
  uses: aws-actions/configure-aws-credentials@v5
  with:
    aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
    aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    aws-region: ${{ vars.AWS_REGION }}

- name: Log in to Amazon ECR
  id: login-ecr
  uses: aws-actions/amazon-ecr-login@v2

- name: Build and push
  uses: docker/build-push-action@v6
  with:
    push: true
    tags: ${{ steps.login-ecr.outputs.registry }}/my-repo:${{ github.sha }}
```

### Docker Hub

```yaml
- name: Log in to Docker Hub
  uses: docker/login-action@v3
  with:
    username: ${{ secrets.DOCKERHUB_USERNAME }}
    password: ${{ secrets.DOCKERHUB_TOKEN }}

- name: Build and push
  uses: docker/build-push-action@v6
  with:
    push: true
    tags: ${{ secrets.DOCKERHUB_USERNAME }}/my-app:${{ github.sha }}
```

### Google Artifact Registry

```yaml
- name: Authenticate to Google Cloud
  uses: google-github-actions/auth@v3
  with:
    credentials_json: ${{ secrets.GCP_SA_KEY }}

- name: Set up Cloud SDK
  uses: google-github-actions/setup-gcloud@v3

- name: Configure Docker for Artifact Registry
  run: gcloud auth configure-docker ${{ vars.GCP_REGION }}-docker.pkg.dev

- name: Build and push
  uses: docker/build-push-action@v6
  with:
    push: true
    tags: ${{ vars.GCP_REGION }}-docker.pkg.dev/${{ vars.GCP_PROJECT }}/${{ vars.REPO_NAME }}/my-app:${{ github.sha }}
```

## Kubernetes De-hardcoding

Replace hardcoded values with repository variables and secrets for reusability.

### Variable Replacement Map

| Hardcoded Value | Variable Replacement | Type |
|----------------|---------------------|------|
| `us-west-2` | `${{ vars.AWS_REGION }}` | Repository variable |
| `production-cluster` | `${{ vars.CLUSTER_NAME }}` | Repository variable |
| `my-app` | `${{ vars.APP_NAME }}` | Repository variable |
| `production` (namespace) | `${{ vars.K8S_NAMESPACE }}` | Repository variable |
| `my-image:latest` | `${{ vars.IMAGE_REGISTRY }}/${{ vars.APP_NAME }}:${{ github.sha }}` | Repository variable |

### EKS Configuration

Replace hardcoded cluster and region.

**Before:**
```yaml
- name: Configure kubectl
  run: |
    aws eks update-kubeconfig --region us-west-2 --name production-cluster
```

**After:**
```yaml
- name: Configure kubectl
  run: |
    aws eks update-kubeconfig --region ${{ vars.AWS_REGION }} --name ${{ vars.CLUSTER_NAME }}
```

### Deployment Configuration

Replace hardcoded app name and namespace.

**Before:**
```yaml
- name: Deploy
  run: |
    kubectl set image deployment/my-app my-app=my-image:${{ github.sha }} -n production
```

**After:**
```yaml
- name: Deploy
  run: |
    kubectl set image deployment/${{ vars.APP_NAME }} \
      ${{ vars.APP_NAME }}=${{ vars.IMAGE_REGISTRY }}/${{ vars.APP_NAME }}:${{ github.sha }} \
      -n ${{ vars.K8S_NAMESPACE }}
```

### Rollback Step

Add automatic rollback on deployment failure.

```yaml
- name: Deploy
  id: deploy
  run: |
    kubectl set image deployment/${{ vars.APP_NAME }} \
      ${{ vars.APP_NAME }}=${{ vars.IMAGE_REGISTRY }}/${{ vars.APP_NAME }}:${{ github.sha }} \
      -n ${{ vars.K8S_NAMESPACE }}
    kubectl rollout status deployment/${{ vars.APP_NAME }} -n ${{ vars.K8S_NAMESPACE }} --timeout=5m

- name: Rollback on failure
  if: failure() && steps.deploy.outcome == 'failure'
  run: |
    kubectl rollout undo deployment/${{ vars.APP_NAME }} -n ${{ vars.K8S_NAMESPACE }}
    echo "Deployment failed and was rolled back"
```

### Complete Variable-Driven Deployment

```yaml
- name: Configure AWS credentials
  uses: aws-actions/configure-aws-credentials@v5
  with:
    aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
    aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    aws-region: ${{ vars.AWS_REGION }}

- name: Configure kubectl for EKS
  run: |
    aws eks update-kubeconfig --region ${{ vars.AWS_REGION }} --name ${{ vars.CLUSTER_NAME }}

- name: Deploy to Kubernetes
  run: |
    kubectl set image deployment/${{ vars.APP_NAME }} \
      ${{ vars.APP_NAME }}=${{ vars.IMAGE_REGISTRY }}/${{ vars.APP_NAME }}:${{ github.sha }} \
      -n ${{ vars.K8S_NAMESPACE }}
    kubectl rollout status deployment/${{ vars.APP_NAME }} -n ${{ vars.K8S_NAMESPACE }} --timeout=10m

- name: Verify deployment
  run: |
    kubectl get deployment ${{ vars.APP_NAME }} -n ${{ vars.K8S_NAMESPACE }}
    kubectl get pods -l app=${{ vars.APP_NAME }} -n ${{ vars.K8S_NAMESPACE }}
```

### GKE Configuration

Replace hardcoded project, zone, and cluster.

```yaml
- name: Authenticate to Google Cloud
  uses: google-github-actions/auth@v3
  with:
    credentials_json: ${{ secrets.GCP_SA_KEY }}

- name: Get GKE credentials
  uses: google-github-actions/get-gke-credentials@v3
  with:
    cluster_name: ${{ vars.CLUSTER_NAME }}
    location: ${{ vars.GCP_ZONE }}
    project_id: ${{ vars.GCP_PROJECT }}

- name: Deploy to GKE
  run: |
    kubectl set image deployment/${{ vars.APP_NAME }} \
      ${{ vars.APP_NAME }}=${{ vars.IMAGE_REGISTRY }}/${{ vars.APP_NAME }}:${{ github.sha }} \
      -n ${{ vars.K8S_NAMESPACE }}
    kubectl rollout status deployment/${{ vars.APP_NAME }} -n ${{ vars.K8S_NAMESPACE }} --timeout=10m
```

## Security Scanning Adaptations

### Language-Specific Vulnerability Scanners

| Language | Scanner | Action | Configuration |
|----------|---------|--------|--------------|
| JavaScript/TypeScript | npm audit | Built-in | `npm audit --production` |
| Python | Safety | pip install | `safety check` |
| Go | govulncheck | go install | `govulncheck ./...` |
| Rust | cargo-audit | cargo install | `cargo audit` |

### Container Image Scanning

Replace or supplement Trivy with registry-native scanners.

**Trivy (universal):**
```yaml
- name: Run Trivy vulnerability scanner
  uses: aquasecurity/trivy-action@0.33.1
  with:
    image-ref: ${{ vars.IMAGE_REGISTRY }}/${{ vars.APP_NAME }}:${{ github.sha }}
    format: 'sarif'
    output: 'trivy-results.sarif'
```

**AWS ECR native scanning:**
```yaml
- name: Start ECR image scan
  run: |
    aws ecr start-image-scan \
      --repository-name ${{ vars.ECR_REPOSITORY }} \
      --image-id imageTag=${{ github.sha }} \
      --region ${{ vars.AWS_REGION }}
```

**Google Artifact Analysis:**
```yaml
- name: Wait for vulnerability scan
  run: |
    gcloud artifacts docker images scan \
      ${{ vars.GCP_REGION }}-docker.pkg.dev/${{ vars.GCP_PROJECT }}/${{ vars.REPO_NAME }}/${{ vars.APP_NAME }}:${{ github.sha }}
```

## Matrix Build Adaptations

### Node.js Version Matrix

Test across multiple Node.js versions.

```yaml
strategy:
  matrix:
    node-version: [18, 20, 22]
    os: [ubuntu-latest, macos-latest, windows-latest]
```

### Python Version Matrix

```yaml
strategy:
  matrix:
    python-version: ['3.10', '3.11', '3.12']
    os: [ubuntu-latest, macos-latest, windows-latest]
```

### Go Version Matrix

```yaml
strategy:
  matrix:
    go-version: ['1.21', '1.22', '1.23']
    os: [ubuntu-latest, macos-latest, windows-latest]
```

### Database Service Matrix

Test against multiple database versions.

```yaml
strategy:
  matrix:
    db:
      - name: postgres
        version: '14'
      - name: postgres
        version: '15'
      - name: postgres
        version: '16'
      - name: mysql
        version: '8.0'

services:
  database:
    image: ${{ matrix.db.name }}:${{ matrix.db.version }}
```
