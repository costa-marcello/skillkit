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
5. **File upload size limits**: Is a maximum file size enforced (suggest 5 MB default)? Check middleware config and cloud storage limits.
6. **File type allowlist**: Is validation based on a content-type allowlist, not just file extension? Check MIME type validation.
7. **File content verification**: Are magic bytes (file signatures) checked to prevent renamed malicious files?
8. **Raw queries**: Search for raw SQL or ORM bypass methods where user input may be interpolated unsafely.

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

## CSRF Protection

### What to Check

1. **CSRF middleware**: Is CSRF token middleware installed and active on state-changing routes?
2. **SameSite cookie attributes**: Verify auth/session cookies use `SameSite=Strict` or `SameSite=Lax` (not `None`).
3. **Token enforcement on mutations**: Confirm POST, PUT, PATCH, and DELETE routes require a valid CSRF token.
4. **Double-submit cookie pattern**: If using a custom CSRF solution, verify the token in the cookie matches the token in the header/body.

### Patterns That Indicate Missing CSRF Protection

```
# No CSRF middleware on Express/Django/Rails
# Express: missing csurf or csrf-csrf package
# Django: CsrfViewMiddleware removed or @csrf_exempt on sensitive views
# Rails: skip_before_action :verify_authenticity_token

# SameSite=None on auth cookies (allows cross-site requests)
res.cookie('session', token, { sameSite: 'none' })
```

## Content Security Policy (CSP)

### What to Check

1. **CSP header presence**: Check for `Content-Security-Policy` in middleware, server config, or HTML meta tags.
2. **Unsafe directives**: Flag `unsafe-inline` and `unsafe-eval` in `script-src` or `default-src`.
3. **Nonce or hash-based CSP**: If inline scripts are required, verify they use nonce or hash rather than `unsafe-inline`.
4. **Overly permissive sources**: Flag `default-src *` or `script-src *` as they defeat the purpose of CSP.

### Patterns That Indicate Missing or Weak CSP

```
# No CSP header at all (check response headers)
# Overly permissive
Content-Security-Policy: default-src *
Content-Security-Policy: script-src 'self' 'unsafe-inline' 'unsafe-eval'

# Missing CSP in meta tag fallback
<meta http-equiv="Content-Security-Policy" content="...">  # check if present
```

## Dependency Vulnerabilities

### What to Check

1. **Audit command**: Run or check for `npm audit`, `pip-audit`, `bundle audit`, or equivalent for the project's ecosystem.
2. **Lock file**: Verify a lock file (`package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`, `Pipfile.lock`, `Gemfile.lock`) exists and is committed to the repository.
3. **Automated dependency updates**: Check for Dependabot, Renovate, or Snyk configuration (`.github/dependabot.yml`, `renovate.json`).
4. **Known CVEs**: Check for outdated dependencies with known security vulnerabilities.

### Patterns That Indicate Risk

```
# No lock file in repository
.gitignore contains "package-lock.json" or "yarn.lock"

# No automated update config
ls .github/dependabot.yml  # does not exist
ls renovate.json            # does not exist

# Audit reports high/critical vulnerabilities
npm audit --audit-level=high
```

## Password & Hashing Security

### What to Check

1. **Weak hashing algorithms**: Search for MD5, SHA1, or SHA256 used for password storage. These are too fast for password hashing and vulnerable to brute-force.
2. **Proper password hashing**: Verify bcrypt, argon2, or scrypt is used for password storage.
3. **Missing salt**: Check for custom hashing implementations that do not use a salt.
4. **Plaintext storage**: Search for passwords stored directly in database columns without hashing.

### Patterns That Indicate Weak Password Hashing

```
# Weak hashing for passwords
hashlib.md5(password.encode())
crypto.createHash('sha1').update(password)
crypto.createHash('sha256').update(password)
MessageDigest.getInstance("MD5").digest(password.getBytes())

# Missing salt
bcrypt.hash(password)  # correct libraries handle salt automatically
# but custom implementations may skip it:
sha256(password)  # no salt
```

## Cookie Security

### What to Check

1. **httpOnly flag**: Session and auth cookies must have `httpOnly: true` to prevent JavaScript access (XSS theft).
2. **Secure flag**: Cookies must have `Secure: true` so they are only sent over HTTPS.
3. **SameSite attribute**: Cookies should use `SameSite=Strict` or `SameSite=Lax` (see CSRF section).
4. **Row Level Security (RLS)**: For Postgres/Supabase projects with user data, check that RLS policies are enabled and configured on tables containing user-specific data.

### Patterns That Indicate Weak Cookie Security

```
# Missing httpOnly
res.cookie('session', token, { httpOnly: false })
# or httpOnly not set at all (defaults vary by framework)

# Missing Secure flag
res.cookie('session', token, { secure: false })
SESSION_COOKIE_SECURE = False  # Django

# No RLS on Supabase/Postgres user tables
# Check for: ALTER TABLE ... ENABLE ROW LEVEL SECURITY
# Check for: CREATE POLICY ... ON table_name
```

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

### CSRF Protection
[findings...]

### Content Security Policy
[findings...]

### Dependency Vulnerabilities
[findings...]

### Password & Hashing Security
[findings...]

### Cookie Security
[findings...]
```
