# Dead Code, Patchwork & Multi-Agent Artifact Detection Checklist

## Unused Files

### How to Detect

1. **Find all source files** in the project (excluding dependency directories, build output, and caches).
2. **For each file, check if it is imported anywhere.** A file imported nowhere is a candidate for removal.
3. **Exceptions.** These files are entry points and will not have importers:
   - Framework convention files (Next.js `page.tsx`/`layout.tsx`/`route.ts`, Django `views.py`/`models.py`, Rails controllers)
   - Middleware and config files
   - Test files (`*.test.*`, `*.spec.*`, `*_test.*`)
   - Scripts referenced in `package.json`, `Makefile`, or CI config

### Patterns That Indicate Orphaned Files

```
# Files with AI-session artifacts in names
component-v2.tsx, page-old.tsx, backup-*.ts, handler_copy.py

# Files in directories that look abandoned
__old__/, _archived/, tmp/, scratch/

# Files with only default exports that nothing imports
```

## Orphaned Components

### How to Detect

1. **List all UI component files** (files exporting JSX, template functions, or partials).
2. **Search for each component name** across the codebase. If never referenced, it is orphaned.
3. **Check for indirect usage.** Some components are loaded dynamically. Search for the file path in dynamic imports.

## Duplicate Utilities

### How to Detect

1. **Find utility/helper directories.** Common locations: `lib/`, `utils/`, `helpers/`, `shared/`, `common/`.
2. **Look for functions with similar names.** E.g., `format_date` in two different files.
3. **Look for similar implementations.** Functions that do the same thing with different names.
4. **Check for multiple HTTP clients.** Is there both a custom wrapper and a library client? Are both used?

### Common Duplicates in AI-Built Codebases

```
# Multiple auth helpers
lib/auth.ts, utils/auth.ts, helpers/firebase-auth.ts

# Multiple API client wrappers
lib/api.ts, utils/fetch.ts, services/api-client.ts

# Multiple formatting utilities
lib/format.ts, utils/formatters.ts, helpers/string-utils.ts
```

## Abandoned Mock Data

### How to Detect

1. **Search for mock/fixture files.** Look in `__mocks__/`, `fixtures/`, `mocks/`, `test-data/`, and `public/api/`.
2. **Search for mock constants.** Look for `MOCK_`, `DUMMY_`, `FAKE_`, `SAMPLE_`, `TEST_` prefixed variables in non-test files.
3. **Search for conditional mocking.** Code that checks environment variables to toggle mock data.
4. **Check mock interceptors.** If a mock service (MSW, VCR, responses) is installed, check if handlers are still active in production builds.

### Patterns That Indicate Abandoned Mocks

```
# Mock data in production code (not test files)
MOCK_USERS = [{"id": "1", "name": "Test User"}]

# Conditional that should have been removed
if settings.USE_MOCKS:
    return MOCK_RESPONSE

# Fixture files not referenced by any test
public/api/users.json  # was used for frontend development, now stale
```

## Stale Configuration

### How to Detect

1. **Unused dependencies.** Check for packages that are installed but never imported in source code.
2. **Unused scripts.** Check build/run scripts that reference tools not in use.
3. **Stale config files.** Config files for tools that are not installed (e.g., `.babelrc` when using SWC, `jest.config.js` when using Vitest).
4. **Leftover deployment files.** Config for platforms not being used.

## Patchwork Detection (Multi-Agent Artifacts)

### How to Detect

1. **Conflicting implementations.** Two or more files that solve the same problem differently. This happens when separate AI sessions do not share context.
2. **Inconsistent patterns.** One module uses structured error handling while another uses bare catches with logging. Look for style drift across directories.
3. **Partial refactors.** A file was updated to use a new pattern, but callers still use the old pattern.
4. **Orphaned migration steps.** A feature was half-migrated: new table exists, but old table is still queried by some routes.

### Patterns That Indicate Patchwork

```
# Two implementations of the same utility
lib/auth.ts          -> uses Admin SDK
utils/auth-helper.ts -> uses Client SDK for same server-side check

# Inconsistent error handling across routes
app/api/users/route.ts     -> returns { error: { code, message } }
app/api/payments/route.ts  -> returns { message: "error text" }

# Partial migration: old and new patterns coexist
import { db } from '@/lib/prisma'     # new pattern (5 files)
import { prisma } from '@/lib/db'     # old pattern (3 files)
```

### What to Report

For each patchwork finding:
- The two (or more) conflicting files/patterns
- Which pattern is dominant (used in more places)
- Recommended consolidation direction

## Commented-Out Code

### How to Detect

1. **Search for large comment blocks.** Multi-line comments or consecutive single-line comments that contain code syntax (function declarations, import statements).
2. **Search for common markers.** `TODO`, `FIXME`, `HACK`, `TEMP`, `DEPRECATED`, `OLD`.
3. **Threshold.** Flag blocks of 5+ consecutive commented-out lines. Single-line explanatory comments are normal.

## Broken Imports

### How to Detect

1. **Run the compiler/type checker.** This catches imports that resolve to nothing.
2. **Check path aliases.** Verify alias targets in config (tsconfig, webpack, pyproject) actually exist.
3. **Check relative imports** that reference files that have been moved or deleted.

## Output Format

```markdown
## Dead Code Findings

### Unused Files
| File | Last Modified | Evidence |
| --- | --- | --- |
| `components/OldHeader.tsx` | 30 days ago | Not imported anywhere |

### Orphaned Components
[component name, file path, evidence]

### Duplicate Utilities
| Function | Location 1 | Location 2 | Similarity |
| --- | --- | --- | --- |
| `formatDate` | `lib/utils.ts:45` | `helpers/date.ts:12` | Identical implementation |

### Abandoned Mocks
[file/variable, location, evidence]

### Patchwork (Multi-Agent Artifacts)
[conflicting files, dominant pattern, consolidation direction]

### Stale Configuration
[config file or dependency, evidence]

### Commented-Out Code
[file:line range, content summary]

### Broken Imports
[file:line, import path, error]

### Architectural Quality
[file path, line count, import chain for circular deps, coupling count]

### Code Complexity
[file:line, function name, complexity level, nesting depth]
```
