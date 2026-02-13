# Engineering Best Practices Checklist

Prompts and anti-patterns for detecting violations of core engineering principles beyond SOLID.

---

## YAGNI (You Aren't Gonna Need It)

Build only what is needed now. Speculative code has a real cost: it must be read, tested, maintained, and debugged even if nobody uses it.

### What to look for

- **Unused abstractions**: interfaces, base classes, or factories with a single implementation and no extension plan.
- **Speculative configuration**: options, feature flags, or strategy patterns for behaviour nobody has asked for.
- **Premature generalisation**: a function takes five parameters to handle three hypothetical cases when it only serves one today.
- **Dead feature scaffolding**: route stubs, empty handlers, or TODO-marked code paths for unplanned features.
- **Over-parameterised APIs**: optional arguments that no caller uses yet.

### How to grade

| Severity | Signal |
|----------|--------|
| P1 | Speculative code that adds significant maintenance burden or complexity to a critical path |
| P2 | Unused abstraction layers, configuration for hypothetical cases, premature generalisation |
| P3 | Minor over-parameterisation, single unused optional argument |

---

## DRY (Don't Repeat Yourself)

Every piece of knowledge should have a single, authoritative representation. But small local repetition is acceptable when the alternative is a premature abstraction that couples unrelated modules.

### What to look for

- **Copy-pasted logic**: identical blocks across files, especially validation, transformation, or formatting code.
- **Parallel hierarchies**: two structures that must change in lockstep (e.g., a type definition and a validator that duplicates its fields).
- **Repeated literals**: magic strings or numbers that appear in multiple places and represent the same concept.
- **Shotgun surgery**: a single conceptual change that requires edits in many files because the logic is duplicated.

### When NOT to flag

- Two or three similar lines in the same file that serve different contexts. The Rule of Three applies: wait until the third occurrence before abstracting.
- Test setup code that looks similar across test files but tests different behaviour. Test clarity matters more than DRY.

### How to grade

| Severity | Signal |
|----------|--------|
| P1 | Duplicated business logic in a critical path (e.g., auth checks, price calculations) where a bug fix must be applied in multiple places |
| P2 | Copy-pasted utility logic across 3+ files, parallel structures that drift |
| P3 | Repeated magic values, minor duplication in non-critical code |

---

## KISS (Keep It Simple)

The simplest solution that meets the requirements is the best solution. Complexity must justify itself.

### What to look for

- **Unnecessary design patterns**: Strategy, Observer, Factory, or Builder patterns applied to problems with one variant.
- **Over-abstracted layers**: service → repository → data-access → adapter chains where a direct call would suffice.
- **Complex control flow**: deeply nested conditionals, long switch chains, or state machines for linear processes.
- **Clever code**: bitwise tricks, regex-heavy transformations, or compact one-liners that sacrifice readability.
- **Framework overuse**: pulling in a library or framework for a task that needs 10 lines of plain code.

### How to grade

| Severity | Signal |
|----------|--------|
| P1 | Complexity in a critical path that makes the code hard to debug during incidents |
| P2 | Unnecessary pattern or abstraction layer, over-engineered solution |
| P3 | Clever-but-unclear code, minor readability concern |

---

## Law of Demeter (Principle of Least Knowledge)

A method should only talk to its immediate collaborators. Long access chains create tight coupling and make refactoring painful.

### What to look for

- **Train wrecks**: `order.getCustomer().getAddress().getCity().toUpperCase()` — each dot is a coupling point.
- **Feature envy**: a method that uses more data from another object than from its own. The logic probably belongs on the other object.
- **Exposed internals**: returning mutable internal collections or nested objects that callers then reach into.

### How to grade

| Severity | Signal |
|----------|--------|
| P2 | Chain of 3+ accessors through different object types, exposed mutable internals |
| P3 | Chain of 2 accessors, minor feature envy |

---

## Composition over Inheritance

Favour composing behaviour from small, focused collaborators over inheriting from base classes. Deep inheritance trees are rigid, hard to test, and create implicit coupling.

### What to look for

- **Deep hierarchies**: 3+ levels of inheritance, especially in application code (not framework extensions).
- **Base class for code sharing only**: a parent class whose sole purpose is to provide utility methods, not to define a meaningful type relationship.
- **Fragile base class**: changes to a base class that break child classes in non-obvious ways.
- **Diamond problems**: multiple inheritance paths (in languages that allow it) or mixin conflicts.

### How to grade

| Severity | Signal |
|----------|--------|
| P2 | Deep hierarchy (3+ levels), fragile base class, inheritance used purely for code reuse |
| P3 | 2-level hierarchy that could be composition, base class with few shared methods |

---

## Premature Optimisation

Optimise only after profiling. Premature optimisation adds complexity, reduces readability, and often optimises the wrong thing.

### What to look for

- **Caching without evidence**: memoisation, object pooling, or precomputation where no profiling shows a bottleneck.
- **Micro-optimisations**: manual loop unrolling, avoiding allocations in cold paths, bit manipulation for readability cost.
- **Complexity for throughput**: custom data structures, lock-free algorithms, or batch processing for workloads that do not need them.
- **Premature scaling patterns**: event queues, sharding, or distributed caches for a system that serves 100 requests per minute.

### How to grade

| Severity | Signal |
|----------|--------|
| P2 | Caching or custom structure that adds significant complexity without profiling evidence |
| P3 | Minor micro-optimisation, over-engineered for current scale |

---

## Fail Fast

Detect and report errors at the earliest possible point. Silent failures, fallback defaults, and late validation mask bugs and make debugging harder.

### What to look for

- **Silent swallowing**: empty catch blocks, ignored promise rejections, errors logged but not propagated.
- **Fallback masking**: default values that hide invalid input (e.g., `parseInt(input) || 0` where 0 is a valid business value).
- **Late validation**: checking input deep in the call stack instead of at the boundary where it enters the system.
- **Optimistic assumptions**: code that assumes a value exists, a service is available, or a file is present without checking.

### How to grade

| Severity | Signal |
|----------|--------|
| P1 | Silent error swallowing in a critical path (payments, auth, data writes) |
| P2 | Fallback defaults that mask bugs, late validation, ignored rejections |
| P3 | Minor missing null check in non-critical code |

---

## Principle of Least Surprise

Code should behave as its name and signature suggest. Unexpected side effects, misleading names, and non-obvious return values erode trust and cause bugs.

### What to look for

- **Misleading names**: `getUser()` that also modifies state, `validate()` that silently fixes input, `isEmpty()` that has side effects.
- **Hidden side effects**: pure-looking functions that write to disk, send network requests, or mutate global state.
- **Inconsistent return types**: a function that returns a value on success but throws on some failures and returns null on others.
- **Non-obvious defaults**: parameters with default values that change behaviour in surprising ways.

### How to grade

| Severity | Signal |
|----------|--------|
| P1 | Misleading function name in a public API or critical path |
| P2 | Hidden side effects, inconsistent return types |
| P3 | Minor naming issue, non-obvious default in internal code |

---

## AI-Generated Code Patterns

AI coding agents produce code that passes tests and CI but often lacks the structural quality a human developer would apply on a second pass. Research shows AI-generated code has measurably higher redundancy and lower reuse than human-written code, yet reviewers rate it positively — a sentiment-quality disconnect.

### What to look for

- **Higher redundancy**: AI agents tend to duplicate logic rather than extract shared functions. Look for near-identical blocks across files that a human would have consolidated.
- **Missing refactoring**: AI typically produces "first version that passes tests" (Martin Fowler, Jan 2026). The code works but lacks structure. Functions may be too long, responsibilities may be mixed, and naming may be generic.
- **Code churn without improvement**: GitClear data (ThoughtWorks Radar, Nov 2025) shows duplicate code and code churn increased while refactoring activity declined in AI-heavy codebases. Flag code that adds complexity without improving the overall design.
- **Shallow error handling**: AI code often adds try-catch blocks that log and continue rather than handling errors meaningfully. Check for swallowed exceptions and generic fallbacks.
- **Over-generation**: AI agents create 25x more additions than deletions (QCon/CircleCI, Dec 2025). A large diff from an AI agent deserves extra YAGNI scrutiny — is all this code needed?
- **Prompt artefacts**: Comments or variable names that reference the prompt rather than the domain (e.g., `// as per the user's request`, placeholder names like `handleThing`).

### How to grade

| Severity | Signal |
|----------|--------|
| P1 | Duplicated critical-path logic (auth, payments) that must be fixed in multiple places when a bug is found |
| P2 | Missing refactoring in a module with 3+ similar blocks, generic naming in public APIs, over-generated code that adds maintenance burden |
| P3 | Minor redundancy in non-critical code, prompt artefact comments |

### Questions to ask

- "Was this code generated by an AI agent? If so, has it been refactored beyond the first passing version?"
- "Does this diff add code that duplicates existing functionality elsewhere in the codebase?"
- "Is the volume of new code proportional to the complexity of the feature?"
