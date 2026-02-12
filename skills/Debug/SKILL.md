---
name: debug
description: >-
  Guides systematic root-cause debugging through four phases.
  Use when encountering any bug, test failure, or unexpected behaviour, before proposing fixes.
---

# Debug

## Overview

Random fixes waste time and create new bugs. Quick patches mask underlying issues.

**Core principle:** Find root cause before attempting fixes. Symptom fixes are failure.

Violating the letter of this process is violating the spirit of debugging.

## The Iron Law

```
No fixes without root cause investigation first.
```

If you have not completed Phase 1, do not propose fixes.

## When to Use

Use for any technical issue:
- Test failures
- Bugs in production
- Unexpected behaviour
- Performance problems
- Build failures
- Integration issues

**Use this especially when:**
- Under time pressure (emergencies make guessing tempting)
- "Just one quick fix" seems obvious
- You have already tried multiple fixes
- Previous fix did not work
- You do not fully understand the issue

**Do not skip when:**
- Issue seems simple (simple bugs have root causes too)
- You are in a hurry (rushing guarantees rework)
- Manager wants it fixed now (systematic is faster than thrashing)

<instructions>

## The Four Phases

Complete each phase before proceeding to the next.

### Phase 1: Root Cause Investigation

Before attempting any fix:

1. **Read error messages carefully**
   - Do not skip past errors or warnings
   - They often contain the exact solution
   - Read stack traces completely
   - Note line numbers, file paths, error codes

2. **Reproduce consistently**
   - Can you trigger it reliably?
   - What are the exact steps?
   - Does it happen every time?
   - If not reproducible, gather more data -- do not guess

3. **Check recent changes**
   - What changed that could cause this?
   - Git diff, recent commits
   - New dependencies, config changes
   - Environmental differences

4. **Gather evidence in multi-component systems**

   When the system has multiple components (CI to build to signing, API to service to database):

   Before proposing fixes, add diagnostic instrumentation:
   ```
   For EACH component boundary:
     - Log what data enters the component
     - Log what data exits the component
     - Verify environment/config propagation
     - Check state at each layer

   Run once to gather evidence showing WHERE it breaks
   THEN analyse evidence to identify failing component
   THEN investigate that specific component
   ```

5. **Trace data flow**

   When the error is deep in the call stack, see `references/root-cause-tracing.md` for the complete backward tracing technique.

   Quick version:
   - Where does the bad value originate?
   - What called this with the bad value?
   - Keep tracing up until you find the source
   - Fix at source, not at symptom

### Phase 2: Pattern Analysis

Find the pattern before fixing:

1. **Find working examples**
   - Locate similar working code in the same codebase
   - What works that is similar to what is broken?

2. **Compare against references**
   - If implementing a pattern, read the reference implementation completely
   - Do not skim -- read every line
   - Understand the pattern fully before applying

3. **Identify differences**
   - What is different between working and broken?
   - List every difference, however small
   - Do not assume "that can't matter"

4. **Understand dependencies**
   - What other components does this need?
   - What settings, config, environment?
   - What assumptions does it make?

### Phase 3: Hypothesis and Testing

Apply the scientific method:

1. **Form single hypothesis**
   - State clearly: "I think X is the root cause because Y"
   - Write it down
   - Be specific, not vague

2. **Test minimally**
   - Make the smallest possible change to test the hypothesis
   - One variable at a time
   - Do not fix multiple things at once

3. **Verify before continuing**
   - Did it work? Yes -- go to Phase 4
   - Did not work? Form a new hypothesis
   - Do not add more fixes on top

4. **When you do not know**
   - Say "I don't understand X"
   - Do not pretend to know
   - Ask for help
   - Research more

### Phase 4: Implementation

Fix the root cause, not the symptom:

1. **Create failing test case**
   - Simplest possible reproduction
   - Automated test if possible
   - One-off test script if no framework
   - Have this before fixing

2. **Implement single fix**
   - Address the root cause identified
   - One change at a time
   - No "while I'm here" improvements
   - No bundled refactoring

3. **Verify fix**
   - Test passes now?
   - No other tests broken?
   - Issue actually resolved?

4. **If fix does not work**
   - Stop
   - Count: How many fixes have you tried?
   - If fewer than 3: Return to Phase 1, re-analyse with new information
   - If 3 or more: Stop and question the architecture (step 5 below)
   - Do not attempt fix #4 without architectural discussion

5. **If 3+ fixes failed: question architecture**

   Pattern indicating architectural problem:
   - Each fix reveals new shared state/coupling/problem in different place
   - Fixes require "massive refactoring" to implement
   - Each fix creates new symptoms elsewhere

   Stop and question fundamentals:
   - Is this pattern fundamentally sound?
   - Are we "sticking with it through sheer inertia"?
   - Should we refactor architecture vs. continue fixing symptoms?

   Discuss with your human partner before attempting more fixes.

   This is not a failed hypothesis -- this is a wrong architecture.

</instructions>

## Red Flags -- Stop and Follow Process

If you catch yourself thinking:
- "Quick fix for now, investigate later"
- "Just try changing X and see if it works"
- "Add multiple changes, run tests"
- "Skip the test, I'll manually verify"
- "It's probably X, let me fix that"
- "I don't fully understand but this might work"
- "Pattern says X but I'll adapt it differently"
- "Here are the main problems: [lists fixes without investigation]"
- Proposing solutions before tracing data flow
- **"One more fix attempt" (when already tried 2+)**
- **Each fix reveals new problem in different place**

All of these mean: stop. Return to Phase 1.

If 3+ fixes failed: question the architecture (see Phase 4, step 5).

## Your Human Partner's Signals You Are Doing It Wrong

Watch for these redirections:
- "Is that not happening?" -- You assumed without verifying
- "Will it show us...?" -- You should have added evidence gathering
- "Stop guessing" -- You are proposing fixes without understanding
- "Ultrathink this" -- Question fundamentals, not just symptoms
- "We're stuck?" (frustrated) -- Your approach is not working

When you see these: stop. Return to Phase 1.

## Common Rationalizations

| Excuse | Reality |
|--------|---------|
| "Issue is simple, don't need process" | Simple issues have root causes too. Process is fast for simple bugs. |
| "Emergency, no time for process" | Systematic debugging is faster than guess-and-check thrashing. |
| "Just try this first, then investigate" | First fix sets the pattern. Do it right from the start. |
| "I'll write test after confirming fix works" | Untested fixes don't stick. Test first proves it. |
| "Multiple fixes at once saves time" | Can't isolate what worked. Causes new bugs. |
| "Reference too long, I'll adapt the pattern" | Partial understanding guarantees bugs. Read it completely. |
| "I see the problem, let me fix it" | Seeing symptoms does not equal understanding root cause. |
| "One more fix attempt" (after 2+ failures) | 3+ failures = architectural problem. Question pattern, don't fix again. |

## Examples

<example>
**Multi-layer diagnostic instrumentation**

A CI build fails at the code signing step. Instead of guessing which secret is missing, add logging at each boundary:

```bash
# Layer 1: Workflow
echo "=== Secrets available in workflow: ==="
echo "IDENTITY: ${IDENTITY:+SET}${IDENTITY:-UNSET}"

# Layer 2: Build script
echo "=== Env vars in build script: ==="
env | grep IDENTITY || echo "IDENTITY not in environment"

# Layer 3: Signing script
echo "=== Keychain state: ==="
security list-keychains
security find-identity -v

# Layer 4: Actual signing
codesign --sign "$IDENTITY" --verbose=4 "$APP"
```

This reveals which layer fails (secrets to workflow passed, workflow to build failed). Fix at the failing boundary, not at the symptom.
</example>

<example>
**Flaky test with arbitrary timeouts**

A test fails intermittently:
```
Expected: { status: 'completed', amount: 100 }
Received: { status: 'pending', amount: 100 }
```

Bad approach (Phase 3 violation -- multiple untested fixes):
1. Add `await sleep(100)` -- fails
2. Increase to `await sleep(500)` -- still fails
3. Try `await sleep(2000)` -- works sometimes

Correct approach (follow Phase 1):
1. Read the error: status stays `pending` -- the update has not completed
2. Reproduce: fails under load, passes when system is idle -- timing issue
3. Trace data flow: payment processor fires async callback, test reads before callback arrives
4. Root cause: test polls before the async state transition completes

Fix: replace `sleep()` with condition-based waiting. See `references/condition-based-waiting.md`.
</example>

<example>
**Empty parameter traced through five levels**

Symptom: `.git` directory created inside source code instead of temp directory.

Phase 1 trace:
1. `git init` runs in `process.cwd()` -- empty cwd parameter
2. `WorktreeManager.createSessionWorktree(projectDir, sessionId)` -- `projectDir` is empty string
3. `Session.initializeWorkspace()` passed empty string
4. `Session.create()` used `context.tempDir` before `beforeEach` ran
5. `setupCoreTest()` returns `{ tempDir: '' }` initially

Root cause: top-level variable initialisation accessing a value before the test framework sets it.

Fix: made `tempDir` a getter that throws if accessed before `beforeEach`. Then added defence-in-depth at all four layers. See `references/defense-in-depth.md`.
</example>

## Quick Reference

| Phase | Key Activities | Success Criteria |
|-------|---------------|------------------|
| **1. Root Cause** | Read errors, reproduce, check changes, gather evidence | Understand WHAT and WHY |
| **2. Pattern** | Find working examples, compare | Identify differences |
| **3. Hypothesis** | Form theory, test minimally | Confirmed or new hypothesis |
| **4. Implementation** | Create test, fix, verify | Bug resolved, tests pass |

## When Process Reveals "No Root Cause"

If systematic investigation reveals the issue is truly environmental, timing-dependent, or external:

1. You have completed the process
2. Document what you investigated
3. Implement appropriate handling (retry, timeout, error message)
4. Add monitoring/logging for future investigation

But: 95% of "no root cause" cases are incomplete investigation.

## Supporting Techniques

These techniques are available in `references/`:

- **`references/root-cause-tracing.md`** -- Trace bugs backward through call stack to find original trigger
- **`references/defense-in-depth.md`** -- Add validation at multiple layers after finding root cause
- **`references/condition-based-waiting.md`** -- Replace arbitrary timeouts with condition polling

**Related skills:**
- **superpowers:test-driven-development** -- For creating failing test case (Phase 4, Step 1)
- **superpowers:verification-before-completion** -- Verify fix worked before claiming success

## Real-World Impact

From debugging sessions:
- Systematic approach: 15-30 minutes to fix
- Random fixes approach: 2-3 hours of thrashing
- First-time fix rate: 95% vs 40%
- New bugs introduced: Near zero vs common
