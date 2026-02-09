# Infrastructure Audit Checklist

## CI/CD Pipeline

### What to Check

1. **Does a CI/CD pipeline exist?** Look for `.github/workflows/`, `.gitlab-ci.yml`, `Jenkinsfile`, `vercel.json`, `netlify.toml`, `fly.toml`, `render.yaml`.
2. **What does it run?** Check for lint, type-check, test, build stages. Are all four present?
3. **Branch protection.** Does the pipeline block merges on failure?
4. **Environment separation.** Are there distinct pipelines/configs for staging and production?
5. **Deployment strategy.** Is it auto-deploy on merge, manual trigger, or not configured?

### Missing Pipeline

If no CI/CD exists, flag as BLOCKER and list what is needed:
- Lint
- Type check (if applicable to language)
- Unit/integration tests
- Build
- Database migration check
- Deploy to staging (on PR merge)
- Deploy to production (on release/merge to main)

## Monitoring & Observability

### What to Check

1. **Error tracking.** Is an error tracking service configured (Sentry, Bugsnag, Datadog, etc.)? Search for initialisation calls.
2. **Application monitoring.** Is there APM or at minimum structured logging?
3. **Logging quality.** Are errors logged with context (user ID, request ID, stack trace)? Or just raw `console.log`/`print`?
4. **Uptime monitoring.** Is there an external health check (Pingdom, UptimeRobot, custom cron)?

### Patterns That Indicate Missing Monitoring

```
# Errors silently swallowed
except Exception:
    print("Something went wrong")
    return error_response(500)

# No request context in logs
print("User updated")  # which user? what changed?
```

## Health Checks

### What to Check

1. **Health endpoint.** Does `/health`, `/healthz`, or `/api/health` exist?
2. **What does it check?** A good health check verifies database connectivity and optionally external service reachability.
3. **Load balancer integration.** If deploying behind a load balancer or container orchestrator, the health endpoint must return 200 within the configured timeout.

If no health endpoint exists, flag as BLOCKER for any deployment behind a load balancer or container orchestrator.

## Error Handling

### What to Check

1. **Global error boundary/handler.** Does the application have a top-level error handler (React `error.tsx`, Django `handler500`, Express error middleware)?
2. **API error responses.** Do all API routes return structured error responses with appropriate HTTP status codes?
3. **Unhandled exceptions.** Are there `async` functions without error handling?
4. **Third-party error handling.** Are external API calls wrapped with error handling that distinguishes network errors from business logic errors?

## Environment Configuration

### What to Check

1. **Environment template.** Does `.env.example` (or `.env.template`) exist listing all required variables?
2. **Variable validation.** Does the app validate environment variables at startup?
3. **Missing variables.** Compare `.env.example` against actual usage in code. Are there variables used in code but not listed?
4. **Environment-specific config.** Are there separate configs for development, staging, production?

### Patterns That Indicate Fragile Config

```
# No validation -- app crashes at runtime when variable is missing
api_key = os.environ["STRIPE_SECRET_KEY"]  # KeyError if missing

# Scattered access -- same variable read in many files with no central config
process.env.DATABASE_URL  # used directly instead of through a config module
```

## Database Migrations

### What to Check

1. **Migration state.** Are schema and migrations in sync? Check for pending migrations.
2. **Destructive migrations.** Do any migrations drop columns, rename tables, or delete data? These need careful rollout.
3. **Seed data.** Is there a seed script for initial data (roles, categories, settings)? Is it idempotent?

## Output Format

```markdown
## Infrastructure Findings

### CI/CD Pipeline
[findings...]

### Monitoring & Observability
[findings...]

### Health Checks
[findings...]

### Error Handling
[findings...]

### Environment Configuration
[findings...]

### Database Migrations
[findings...]
```
