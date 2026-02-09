# GitHub Actions Anti-Patterns

Common mistakes that compromise security, waste resources, or create maintenance headaches.

## Using @latest or @master for actions

**Supply chain risk: attackers can push malicious code to mutable tags.**

```yaml
# BAD
steps:
  - uses: actions/checkout@latest
  - uses: docker/build-push-action@master
```

```yaml
# GOOD
steps:
  - uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11 # v4.1.1
  - uses: docker/build-push-action@4a13e500e55cf31b7a5d59a38ab2040ab0f42f56 # v5.1.0
```

## Storing secrets in workflow files

**Credentials exposed in git history forever; rotation becomes expensive.**

```yaml
# BAD
env:
  DATABASE_URL: postgresql://user:mypassword123@db.example.com:5432/prod
  AWS_ACCESS_KEY_ID: AKIAIOSFODNN7EXAMPLE
```

```yaml
# GOOD
env:
  DATABASE_URL: ${{ secrets.DATABASE_URL }}
  AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
```

## Running all jobs on push to every branch

**Wastes CI minutes on feature branches that already trigger on PR.**

```yaml
# BAD
on:
  push:
  pull_request:
```

```yaml
# GOOD
on:
  push:
    branches: [main, staging]
  pull_request:
    branches: [main, staging]
```

## No dependency caching

**2-5x slower builds, wasted bandwidth, and higher costs.**

```yaml
# BAD
steps:
  - uses: actions/checkout@v6
  - uses: actions/setup-node@v6
    with:
      node-version: 20
  - run: npm ci
  - run: npm test
```

```yaml
# GOOD
steps:
  - uses: actions/checkout@v6
  - uses: actions/setup-node@v6
    with:
      node-version: 20
      cache: npm
  - run: npm ci
  - run: npm test
```

## Hardcoding cloud regions and cluster names

**Breaks portability between environments and makes multi-region impossible.**

```yaml
# BAD
env:
  AWS_REGION: us-east-1
  EKS_CLUSTER: production-cluster
steps:
  - run: aws eks update-kubeconfig --region us-east-1 --name production-cluster
```

```yaml
# GOOD
env:
  AWS_REGION: ${{ vars.AWS_REGION }}
  EKS_CLUSTER: ${{ vars.EKS_CLUSTER }}
steps:
  - run: aws eks update-kubeconfig --region ${{ env.AWS_REGION }} --name ${{ env.EKS_CLUSTER }}
```

## Using `if: always()` without understanding

**Runs the step even when the workflow is cancelled, not just on failure.**

```yaml
# BAD
- name: Cleanup
  if: always()
  run: ./cleanup.sh
```

```yaml
# GOOD
- name: Cleanup
  if: success() || failure()
  run: ./cleanup.sh
```

## No `permissions` block

**Default GITHUB_TOKEN has write-all access; violates principle of least privilege.**

```yaml
# BAD
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - run: npm test
```

```yaml
# GOOD
jobs:
  test:
    runs-on: ubuntu-latest
    permissions:
      contents: read
    steps:
      - uses: actions/checkout@v6
      - run: npm test
```

## Single monolithic workflow file

**Hard to maintain, test, or reuse individual jobs across repositories.**

```yaml
# BAD
# .github/workflows/main.yml (400+ lines)
jobs:
  lint:
    # 50 lines...
  test:
    # 100 lines...
  build:
    # 80 lines...
  deploy-staging:
    # 90 lines...
  deploy-production:
    # 80 lines...
```

```yaml
# GOOD
# .github/workflows/ci.yml
jobs:
  quality:
    uses: ./.github/workflows/quality-checks.yml
  build:
    uses: ./.github/workflows/build.yml

# .github/workflows/deploy.yml
jobs:
  deploy:
    uses: ./.github/workflows/deploy-reusable.yml
    with:
      environment: ${{ inputs.environment }}
```
