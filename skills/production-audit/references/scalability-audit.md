# Scalability Audit Checklist

## N+1 Queries

### What to Check

1. **List query followed by loop queries.** Fetch a list, then query related data inside a loop.
2. **Missing eager loading.** ORM queries that fetch a list but do not include relations accessed later (Prisma `include`, Django `select_related`/`prefetch_related`, Rails `includes`).
3. **Sequential queries in request handlers.** Multiple `await` calls that could run in parallel.
4. **Queries inside iteration.** Route handlers or services that iterate over IDs and query each one individually.

### What to Report

For each N+1 pattern found:
- File and line where the list query happens
- File and line where the loop query happens
- Estimated query count: `1 + N` where N is the expected row count

## Missing Database Indexes

### What to Check

1. **Read the schema.** Look for index definitions (ORM-specific: `@@index` in Prisma, `db_index=True` in Django, `add_index` in Rails).
2. **Check foreign keys.** Every relation's foreign key column should have an index.
3. **Check common query patterns.** Columns frequently used in `WHERE` clauses (`status`, `created_at`, `user_id`, `email`) need indexes.
4. **Check composite queries.** Queries filtering on multiple columns benefit from composite indexes.

### What to Report

List each table and its indexed vs un-indexed columns that appear in `WHERE` clauses.

## Connection Pooling

### What to Check

1. **Database client instantiation.** Is the client created once (singleton) or on every request? Check for the standard singleton pattern used by the framework.
2. **Connection URL parameters.** Check database URL for connection limit and pool timeout parameters.
3. **Serverless considerations.** Serverless/edge functions create new connections per cold start. Check for a connection pooler (PgBouncer, Prisma Accelerate, Supabase pooler, etc.).
4. **Pool size vs expected load.** If the user specifies a target user count, calculate: expected concurrent requests / average query time = required pool size.

## Rate Limiting

### What to Check

1. **Does any rate limiting exist?** Search for rate-limiting middleware or libraries.
2. **Which routes are rate-limited?** Auth routes (login, signup, password reset) are highest priority. Payment routes second.
3. **What are the limits?** Are they reasonable for the expected traffic?
4. **Bypass vectors.** Can rate limits be bypassed by switching headers, omitting tokens, or using different paths to the same handler?

### Priority Routes for Rate Limiting

| Route pattern | Why | Suggested limit |
| --- | --- | --- |
| Auth routes (`/auth/*`, `/login`) | Brute-force prevention | 5-10 req/min per IP |
| Payment routes | Abuse prevention | 10-20 req/min per user |
| Upload routes | Resource exhaustion | 5-10 req/min per user |
| Webhook routes | Verify signatures instead | N/A if signature-verified |

## Caching

### What to Check

1. **Static data with no caching.** Endpoints returning rarely-changing data (categories, settings, pricing) without cache headers or in-memory cache.
2. **Framework caching features.** Check if the framework's built-in caching is used (Next.js `revalidate`, Django cache framework, Rails fragment caching).
3. **Database query caching.** Is there a caching layer (Redis, Memcached, in-memory) between the application and the database?
4. **CDN/Edge caching.** Are static assets and public API responses configured for CDN caching? Check `Cache-Control` headers.

### What to Report

For each uncached resource:
- The endpoint or component
- How frequently the data changes
- Estimated request volume
- Suggested caching strategy (revalidate interval, CDN, key-value store)

## Output Format

```markdown
## Scalability Findings

### N+1 Queries
[findings with file:line, query count estimates]

### Missing Indexes
[table/column list with query patterns]

### Connection Pooling
[singleton check, pool size, serverless considerations]

### Rate Limiting
[coverage map, missing routes, limit values]

### Caching Gaps
[uncached resources with change frequency and volume estimates]
```
