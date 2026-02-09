# Domain: Software Engineering

**Sections:** Universal Lens Interpretation · Augmentation Lens: Adversarial/Security · Domain Evaluation Criteria · Examples

## Universal Lens Interpretation

How the 4 universal lenses apply to software engineering:

### Human
- Developer experience (DX): Is the API intuitive? Do error messages guide toward solutions?
- Cognitive load: Can a developer hold the mental model in working memory?
- Onboarding friction: How long until a new team member is productive with this code?
- User sentiment detection: Is the developer frustrated (debugging), curious (exploring), or maintaining (routine)?

### Structural
- Rendering performance: measure repaints, reflows, paint complexity
- State complexity: count state sources, track data flow paths
- Resource impact: memory allocation patterns, CPU-bound operations, network request count, payload sizes, caching opportunities
- Bundle size: tree-shaking potential, lazy loading boundaries, dependency weight

### Inclusivity
- WCAG AAA compliance: contrast ratios, focus indicators, skip links
- Screen reader compatibility: ARIA labels, live regions, heading hierarchy
- Keyboard navigation: focus order, trapped focus, keyboard shortcuts
- Sensory considerations: motion sensitivity, color-only information
- Cognitive accessibility: clear labels, predictable behavior, error recovery
- Internationalization: RTL support, string externalization, locale-aware formatting

### Sustainability
- Maintenance burden: lines of code, abstraction layers, documentation needs
- Modularity: can components be extracted and reused?
- Extensibility: what changes require rewrites vs. configuration?

## Augmentation Lens: Adversarial/Security

Evaluates what happens when inputs are hostile, systems are compromised, or trust boundaries are violated. This lens adds a dimension the universal four cannot cover: intentional misuse.

### Evaluation Criteria
- What happens if input is malicious? (injection, XSS, CSRF, path traversal)
- What data is exposed if this component is compromised?
- Where are the trust boundaries and where is validation enforced?

### Guiding Questions
- Does this fail closed (secure) or fail open (insecure)?
- What is the blast radius if this single component is breached?
- Are secrets, tokens, or PII handled with defense-in-depth?

## Domain Evaluation Criteria

Beyond the universal quality gate, verify for this domain:
- [ ] Security implications explicitly assessed?
- [ ] Error handling covers adversarial inputs?
- [ ] Performance measured, not assumed?
- [ ] Backward compatibility addressed?

## Examples

<example>
**Prompt:** ULTRATHINK: Should we use Redux or Zustand for our Next.js e-commerce app?

**Domain detected:** Software Engineering
**Lenses applied:** Human, Structural, Inclusivity, Sustainability + Adversarial/Security

### Deep Reasoning Chain

**Problem:** State management for e-commerce with cart, user auth, product filters, and checkout flow. Constraints: team of 3, Next.js 14 with App Router, must support SSR.

**Approaches:**
1. **Redux Toolkit** — Industry standard, excellent devtools, middleware ecosystem
2. **Zustand** — Minimal API, no boilerplate, hooks-native
3. **React Context + useReducer** — No dependency, built-in

**Analysis through lenses:**

*Human:* Team has Redux experience (low learning curve for Redux). However, Zustand's 5-minute onboarding means faster productivity for new hires. User sentiment: team expressed "Redux fatigue" in retro.

*Structural:* Redux bundle ~12KB, Zustand ~1.5KB. Both support SSR hydration. Redux middleware enables request deduplication; Zustand requires manual implementation. State complexity: ~8 slices predicted—Redux's structure helps at this scale.

*Inclusivity:* Neither impacts a11y directly. State management is invisible to users.

*Sustainability:* Redux's enforced patterns aid maintenance; Zustand's flexibility becomes liability at 15+ slices. However, current scope is 8 slices.

**Logical chain:** Team has Redux fatigue → productivity suffers with reluctant tooling. Current scope (8 slices) is within Zustand's sweet spot. Bundle savings (10KB) meaningful for e-commerce conversion. Therefore → **Zustand**, with architectural rule: if slices exceed 12, revisit.

### Edge Case Analysis

- **Slice explosion:** If features grow beyond 12 slices, Zustand stores become unwieldy. *Mitigation:* Document slice-count threshold in ADR; quarterly review.
- **SSR hydration mismatch:** Store initialized differently server/client. *Mitigation:* Use Zustand's `persist` middleware with `skipHydration`, hydrate in useEffect.
- **Devtools debugging:** Zustand devtools less mature. *Mitigation:* Enable Redux DevTools adapter via `devtools` middleware.

### The Deliverable

```typescript
// stores/cart.ts
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface CartItem { id: string; quantity: number; price: number }

interface CartStore {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  // Why computed here: avoids recalculating in every component
  total: () => number
}

export const useCartStore = create<CartStore>()(
  devtools(
    persist(
      (set, get) => ({
        items: [],
        addItem: (item) => set((state) => ({
          items: [...state.items, item]
        })),
        removeItem: (id) => set((state) => ({
          items: state.items.filter((i) => i.id !== id)
        })),
        total: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      }),
      { name: 'cart-storage' }
    )
  )
)
```
</example>

<example>
**Prompt:** ULTRATHINK: We're seeing 400ms layout shifts on our dashboard. How do we fix this?

**Domain detected:** Software Engineering
**Lenses applied:** Human, Structural, Inclusivity, Sustainability + Adversarial/Security

### Deep Reasoning Chain

**Problem:** 400ms Cumulative Layout Shift (CLS) on dashboard, impacting Core Web Vitals score. Constraint: dashboard has 6 widgets loading async data.

**Approaches:**
1. **Skeleton screens** — Reserve space before content loads
2. **Fixed dimensions** — Hardcode widget heights
3. **CSS contain** — Isolate layout calculations
4. **SSR/prerender** — Eliminate client-side layout entirely

**Analysis through lenses:**

*Human:* Users perceive skeleton screens as faster (progress indication). Fixed dimensions feel "jumpy" when content doesn't match. SSR shows content immediately but delays interactivity—dashboard users expect instant interaction.

*Structural:* Skeletons add ~2KB (trivial). Fixed dimensions require knowing content height (widgets have variable data). CSS `contain: layout` prevents reflow propagation but doesn't solve initial shift. SSR moves shift to hydration.

*Inclusivity:* Skeletons need `aria-busy="true"` and announcements. Fixed dimensions may truncate content for zoom users. SSR preserves reading order.

*Sustainability:* Skeletons scale with any widget. Fixed dimensions break when content changes. SSR requires server infrastructure changes.

**Logical chain:** Variable content → fixed dimensions fail. SSR adds infrastructure complexity for marginal gain. Skeletons solve the core problem (space reservation) while providing UX benefit (perceived performance). CSS `contain` compounds the fix. Therefore → **Skeletons + CSS contain**.

### Edge Case Analysis

- **Widget fails to load:** Skeleton shows indefinitely. *Mitigation:* 5s timeout → error state with retry button.
- **Content exceeds skeleton:** Layout still shifts. *Mitigation:* Skeleton height = max observed content height + 10% buffer.
- **Screen reader stuck on "loading":** *Mitigation:* `aria-live="polite"` announces completion; remove `aria-busy` on load.

### The Deliverable

```tsx
// components/WidgetSkeleton.tsx
export function WidgetSkeleton({ minHeight = 200 }: { minHeight?: number }) {
  return (
    <div
      className="animate-pulse bg-gray-200 rounded-lg"
      style={{
        minHeight,
        contain: 'layout', // Isolates reflow calculations
      }}
      aria-busy="true"
      aria-label="Loading widget"
    />
  )
}

// components/DashboardWidget.tsx
export function DashboardWidget({ id }: { id: string }) {
  const { data, isLoading, error } = useWidgetData(id)

  if (error) return <WidgetError onRetry={() => refetch()} />
  if (isLoading) return <WidgetSkeleton minHeight={WIDGET_HEIGHTS[id]} />

  return (
    <div style={{ contain: 'layout', minHeight: WIDGET_HEIGHTS[id] }}>
      <WidgetContent data={data} />
    </div>
  )
}
```
</example>

<example>
**Prompt:** ULTRATHINK: Review this auth middleware for security issues.

```typescript
export async function authMiddleware(req: Request) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) return new Response('Unauthorized', { status: 401 })

  const user = await db.users.findFirst({ where: { token } })
  if (!user) return new Response('Unauthorized', { status: 401 })

  return { user }
}
```

**Domain detected:** Software Engineering
**Lenses applied:** Human, Structural, Inclusivity, Sustainability + Adversarial/Security

### Deep Reasoning Chain

**Problem:** Auth middleware stores tokens in database, retrieves user by token lookup. Must assess security posture.

**Identified Issues (by severity):**

1. **CRITICAL: Token stored in plaintext** — If DB is compromised, all tokens are exposed. Attacker impersonates any user.
2. **HIGH: No token expiration** — Tokens valid forever. Stolen token = permanent access.
3. **HIGH: Timing attack on token comparison** — `findFirst` comparison may leak token validity through response time.
4. **MEDIUM: No rate limiting** — Brute force attacks on token space possible.
5. **LOW: Generic error message** — "Unauthorized" for both missing and invalid tokens aids attacker enumeration (though standard practice).

**Analysis through lenses:**

*Human:* Developers assume "it works" = "it's secure". This code functions correctly but fails security requirements users implicitly expect.

*Structural:* DB query per request adds latency. Token in memory during request (acceptable). No caching strategy visible—every request hits DB.

*Inclusivity:* N/A—middleware doesn't affect UI.

*Sustainability:* DB lookup per request doesn't scale. At 10K RPM, this becomes a bottleneck. Token validation should be stateless (JWT) or cached (Redis).

**Logical chain:** Plaintext tokens = critical vulnerability requiring immediate fix. Expiration absence = high risk requiring fix before production. Timing attacks = theoretical but real. Therefore → **Rewrite with hashed tokens, expiration, constant-time comparison**.

### Edge Case Analysis

- **Token collision:** Two users get same token. *Mitigation:* Use cryptographically random 256-bit tokens (collision probability negligible).
- **Hash timing leak:** Even hashed comparison can leak via timing. *Mitigation:* `crypto.timingSafeEqual` for comparison.
- **Refresh during request:** Token expires mid-request. *Mitigation:* 5-minute grace period on expiration check.
- **Clock skew:** Server times differ. *Mitigation:* Use UTC everywhere, allow 30s skew tolerance.

### The Deliverable

```typescript
import { timingSafeEqual } from 'crypto'
import { hash, verify } from '@node-rs/argon2' // Or bcrypt—why argon2: memory-hard, resists GPU attacks

interface StoredToken {
  hashedToken: string
  userId: string
  expiresAt: Date
  createdAt: Date
}

export async function authMiddleware(req: Request) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '')

  // Early return—no timing leak here, just missing header
  if (!token || token.length !== 64) { // Expect 64-char hex token
    return new Response('Unauthorized', { status: 401 })
  }

  // Hash the incoming token to compare against stored hash
  const tokenHash = await hashToken(token)

  const storedToken = await db.tokens.findFirst({
    where: {
      hashedToken: tokenHash,
      expiresAt: { gt: new Date(Date.now() - 5 * 60 * 1000) } // 5min grace
    },
    include: { user: true }
  })

  if (!storedToken) {
    // Constant-time delay to prevent timing attacks on token existence
    await new Promise(r => setTimeout(r, 100 + Math.random() * 50))
    return new Response('Unauthorized', { status: 401 })
  }

  return { user: storedToken.user }
}

// Token generation (for reference)
export async function generateToken(userId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex') // 256 bits
  const hashedToken = await hashToken(token)

  await db.tokens.create({
    data: {
      hashedToken,
      userId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      createdAt: new Date()
    }
  })

  return token // Return plaintext to client ONCE
}

async function hashToken(token: string): Promise<string> {
  // SHA-256 sufficient for tokens (already high entropy)
  // Argon2/bcrypt unnecessary—those protect LOW entropy passwords
  return crypto.createHash('sha256').update(token).digest('hex')
}
```
</example>
