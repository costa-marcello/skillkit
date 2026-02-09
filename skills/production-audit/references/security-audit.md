# Security Audit Checklist

## Auth Middleware Coverage

### What to Check

1. **Middleware/guard file**: Does auth middleware exist? What paths does it match or exclude?
2. **Auth verification**: Does the middleware verify tokens or sessions on protected routes?
3. **Route exclusions**: Which routes are excluded from auth? Are any sensitive routes accidentally excluded?
4. **Admin routes**: Are admin/management routes protected with role-based checks, not just basic auth?
5. **API route protection**: Do individual handlers verify auth independently, or rely solely on middleware?

### Patterns That Indicate Missing Auth

```
# Middleware matcher excludes sensitive routes
matcher: ['/((?!api|_next|static).*)']  # api routes UNPROTECTED

# Route handler with no auth check
def update_user(request):
    user_id = request.params["id"]
    db.user.update(user_id, request.body)  # no ownership verification
```

### Ownership Checks

Beyond "is the user logged in", check: "is this user allowed to access THIS resource?"

- GET resource by ID -- does it verify the requesting user owns that resource (or is admin)?
- PUT/PATCH resource -- does it verify authorship/ownership before allowing edits?
- DELETE resource -- does it verify ownership before deletion?

## Input Validation

### What to Check

1. **Request body validation**: Are POST/PUT/PATCH handlers validating input with a schema library?
2. **Query parameter validation**: Are GET handlers validating and sanitising query params?
3. **Path parameter validation**: Are dynamic route params (`[id]`, `<pk>`) validated as expected types?
4. **File upload validation**: Are uploaded files checked for type, size, and content?
5. **Raw queries**: Search for raw SQL or ORM bypass methods where user input may be interpolated unsafely.

### Patterns That Indicate Missing Validation

```
# No validation -- role escalation possible
data = request.json()
db.user.create(email=data["email"], role=data["role"])

# No format check on path param
user = db.user.find(id=params["id"])  # might throw on malformed id
```

## CORS Configuration

### What to Check

1. **CORS headers**: Check framework config and middleware for `Access-Control-Allow-Origin` settings.
2. **Wildcard origins**: `Access-Control-Allow-Origin: *` on authenticated routes is a vulnerability.
3. **Credentials mode**: If using cookies/tokens, `Allow-Credentials: true` must pair with specific origins (not `*`).

## Secrets Exposure

### What to Check

1. **Committed env files**: Check git history and working tree for `.env` files with real values.
2. **Client-side exposure**: Verify private keys (database URL, payment secrets, admin SDK keys) are not exposed to client bundles.
3. **Hardcoded secrets**: Search for API keys, tokens, passwords in source code.
4. **Git history**: If secrets were committed and later removed, they remain in history.

### Search Patterns

```
# Hardcoded secrets (adapt patterns to the project's services)
grep -r "sk_live_" "sk_test_" "DATABASE_URL=" "SECRET_KEY="
grep -r "Bearer [a-zA-Z0-9]" --include="*.ts" --include="*.py"

# .env in git
git log --all --diff-filter=A -- "*.env*"
```

## Injection Vulnerabilities

### What to Check

1. **SQL injection**: Search for raw SQL queries. Verify user input is parameterised, not string-concatenated.
2. **XSS**: Search for raw HTML insertion (`dangerouslySetInnerHTML`, `|safe`, `mark_safe`). Check if HTML is sanitised.
3. **Command injection**: Search for `exec(`, `spawn(`, `os.system(`, `subprocess.run(` with user-provided arguments.
4. **Path traversal**: Search for file operations where the path includes user input.
5. **Open redirects**: Search for redirect logic that uses user-provided URLs without validation.

### Payment-Specific Security

1. **Webhook signature verification**: Does the payment webhook handler verify the request signature?
2. **Idempotency**: Does the webhook handler check for duplicate event processing?
3. **Price validation**: Does the checkout flow validate prices server-side, or trust client-submitted amounts?

### Auth-Provider-Specific Security

1. **Token verification**: Are auth tokens verified server-side, or does the backend trust client-sent user IDs?
2. **Role claims**: If using role-based access, are claims verified server-side?
3. **Direct database rules**: If using a BaaS with client-side access, are security rules configured?

## Output Format

Group findings by sub-dimension:

```markdown
## Security Findings

### Auth Middleware
[findings...]

### Input Validation
[findings...]

### CORS
[findings...]

### Secrets Exposure
[findings...]

### Injection Vulnerabilities
[findings...]

### Payment Security
[findings...]

### Auth Provider Security
[findings...]
```
