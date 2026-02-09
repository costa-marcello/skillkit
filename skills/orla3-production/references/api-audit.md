# API Mapping & Frontend-Backend Sync Audit

## Dimension 1: API Endpoint Mapping

### Discovery

1. **Find all API route/handler files.** Adapt to the framework:
   - Next.js App Router: `app/api/**/route.ts` (exports `GET`, `POST`, etc.)
   - Express/Fastify: route files registered via `app.get()`, `router.post()`, etc.
   - Django/DRF: `urls.py` patterns, ViewSets, `@api_view` decorators
   - Go: handler registrations in main/router files
   - Rails: `config/routes.rb` and controller actions
2. **Find server actions or RPC calls.** Next.js `"use server"`, tRPC routers, gRPC service definitions.
3. **Check for legacy/coexisting route patterns.** Mixed routing systems (e.g., Pages Router + App Router, Flask blueprints + raw routes).

### Classification

| Status | Criteria |
| --- | --- |
| **Fully implemented** | Has request validation, business logic, database interaction, error handling, and returns meaningful responses for success and failure |
| **Stubbed** | Exists but returns hardcoded data, TODO comments, placeholder responses, or has empty function bodies |
| **Missing** | Referenced in client code (fetch calls, API client) but the route/handler does not exist |

### What to Check

- **Request validation**: Does the handler validate input with a schema library or manual checks? Or does it trust request body blindly?
- **Error responses**: Does it return proper HTTP status codes (400, 401, 403, 404, 500) or just 200/500?
- **HTTP methods**: Does the route expose only the methods it needs? Unused method exports are a risk.
- **Response shape consistency**: Do all endpoints follow the same response envelope or is each one ad-hoc?

### Patterns That Indicate Stubs

```
return { message: "TODO" }
return []                          // empty array with no DB query
return "ok"                        // placeholder
// TODO: implement this
raise NotImplementedError
throw new Error("Not implemented")
```

## Dimension 2: Frontend-Backend Sync

Skip this dimension if the project has no frontend (API-only, CLI, library).

### Discovery

1. **Find all API calls in frontend code.** Search for `fetch(`, `axios.`, `useSWR(`, `useQuery(`, `trpc.`, or custom API client calls.
2. **Extract the URL/path from each call.** Map each to its corresponding backend route.
3. **Find mock adapters.** Search for MSW handlers, hardcoded JSON fixtures, and conditional logic like `if (process.env.USE_MOCKS)`.

### Classification

| Status | Criteria |
| --- | --- |
| **Wired** | Frontend calls a real backend route that is fully implemented |
| **Mock** | Frontend calls a mock/fixture/hardcoded data source instead of a real route |
| **Broken** | Frontend calls a route that does not exist, returns 404, or has a path mismatch |
| **Mismatched** | Frontend expects a response shape different from what the backend returns |

### What to Check

- **Path mismatches**: Frontend calls `/api/user` but backend route is `/api/users` (plural)
- **Method mismatches**: Frontend sends POST but backend only handles GET
- **Auth token passing**: Frontend includes auth headers/cookies? Backend expects them?
- **Response type assumptions**: Frontend uses `response.json()` but backend might return text or redirect
- **Environment-conditional mocks**: Development-only blocks that bypass real API calls

### Output Format

Produce two tables:

**API Endpoint Map:**

| Route | Methods | Status | Validation | Auth | Notes |
| --- | --- | --- | --- | --- | --- |
| `/api/users` | GET, POST | Fully implemented | Schema validated | Middleware | -- |
| `/api/payments/webhook` | POST | Stubbed | None | None | Returns 200 with empty body |

**Frontend-Backend Sync Map** (if frontend exists):

| Frontend Location | API Call | Backend Route | Status | Notes |
| --- | --- | --- | --- | --- |
| `app/dashboard/page.tsx:45` | `GET /api/analytics` | `app/api/analytics/route.ts` | Wired | -- |
| `components/VideoPlayer.tsx:12` | `GET /api/videos/[id]` | None | Broken | Route file missing |
