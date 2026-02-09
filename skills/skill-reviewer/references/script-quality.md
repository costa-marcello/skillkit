# Script Quality Guide

Scripts should solve problems, not punt to Claude.

Cross-reference: Part of `content-quality-checklist.md` Section 5.

---

## Assessment Questions

- [ ] **Explicit error handling** (no bare `except:`)
- [ ] **All constants documented** (no "voodoo constants")
- [ ] **Recovery actions, not just failures**
- [ ] **No hardcoded secrets or user-specific paths**

---

## Error Handling Test

Does the script:
1. Catch specific exceptions?
2. Provide actionable error messages?
3. Attempt recovery before failing?

**Punting to Claude** (bad):
```python
# BAD
def process_file(path):
    return open(path).read()  # Just fails, Claude figures it out
```

**Solving the problem** (good):
```python
# GOOD
def process_file(path):
    try:
        with open(path) as f:
            return f.read()
    except FileNotFoundError:
        print(f"File {path} not found, creating default")
        with open(path, 'w') as f:
            f.write('')
        return ''
```

---

## Magic Number Test

Every constant must answer: "Why this value?"

**Voodoo constants** (bad):
```python
# BAD
TIMEOUT = 47  # Why 47?
RETRIES = 5   # Why 5?
```

**Documented constants** (good):
```python
# GOOD
# HTTP requests typically complete within 30 seconds
# Longer timeout accounts for slow connections
REQUEST_TIMEOUT = 30

# Three retries balances reliability vs speed
# Most intermittent failures resolve by second retry
MAX_RETRIES = 3
```

---

## Script Checklist

- [ ] No bare `except:` clauses?
- [ ] All timeouts/retries have comments?
- [ ] Paths use environment variables or arguments?
- [ ] Error messages specify what went wrong AND suggest fix?
