# Architecture & Code Complexity Audit Checklist

## Architectural Quality

### How to Detect

1. **Circular dependencies**: Check import chains for cycles (A imports B imports A). Use tooling or trace imports manually for small projects.
2. **God classes/files**: Flag files exceeding 500 lines or classes/modules exporting more than 20 functions. These are hard to test and maintain.
3. **Tight coupling**: Modules importing more than 5 peer modules from the same layer suggest coupling that makes changes risky.
4. **Separation of concerns**: Look for business logic mixed with UI rendering, routing, or raw database queries in the same function or file.

### What to Report

For each architectural finding:
- File path and line count for oversized files
- Import chain for circular dependencies (e.g., `A -> B -> C -> A`)
- Count of cross-module imports for tightly coupled modules
- Location where business logic mixes with another concern

### Patterns That Indicate Architectural Issues

```
# Circular dependency
# handlers/user.ts imports services/user.ts imports handlers/user.ts

# God file
# utils/helpers.ts -- 800 lines, 35 exported functions

# Mixed concerns
async function createOrder(req, res) {
  // routing + validation + business logic + database + response all in one function
  const { items } = req.body
  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0)
  await db.order.create({ data: { items, total, userId: req.user.id } })
  await sendEmail(req.user.email, 'Order confirmed')
  res.json({ success: true })
}
```

## Code Complexity

### How to Detect

1. **Cyclomatic complexity >10**: Functions with many branches (if/else, switch, ternary chains, try/catch) that are hard to reason about and test.
2. **Deeply nested conditionals**: More than 3 levels of nesting (if inside if inside if) makes logic hard to follow.
3. **Long functions**: Functions exceeding 50 lines are candidates for extraction.
4. **Long files**: Files exceeding 500 lines are candidates for splitting.
5. **Magic numbers**: Unnamed numeric constants in logic (e.g., `if (retries > 3)`, `timeout: 30000`) that lack context.

### What to Report

For each complexity finding:
- File and line for each complex function with estimated complexity level (high/very high)
- Nesting depth for deeply nested blocks
- Suggestion: extract helper, refactor conditional chain, or introduce named constants

### Patterns That Indicate High Complexity

```
# Deeply nested conditionals (4 levels)
if (user) {
  if (user.role === 'admin') {
    if (user.verified) {
      if (user.subscription.active) {
        // actual logic buried here
      }
    }
  }
}

# Magic numbers
setTimeout(retry, 30000)          // what is 30000?
if (attempts > 3) throw error     // why 3?
const MAX_ITEMS = 50              // better: named constant
```

## Output Format

```markdown
## Architecture Findings

### Architectural Quality
[file path, line count, import chain for circular deps, coupling count]

### Code Complexity
[file:line, function name, complexity level, nesting depth]
```
