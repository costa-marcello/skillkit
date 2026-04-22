#!/usr/bin/env python3
"""
Quick validation script for skills - minimal version
"""

import sys
import os
import re
from pathlib import Path


def find_invalid_frontmatter_indentation(frontmatter: str) -> list[tuple[int, str]]:
    """
    Detect non-space indentation characters in YAML frontmatter.

    YAML indentation must use ASCII spaces. Tabs or non-ASCII whitespace
    (e.g., NBSP) can cause YAML parse errors.
    """
    issues = []
    for line_no, line in enumerate(frontmatter.splitlines(), start=1):
        # Scan leading whitespace only.
        for ch in line:
            if not ch.isspace():
                break
            if ch != ' ':
                issues.append((line_no, ch))
                break
    return issues


def describe_whitespace(ch: str) -> str:
    if ch == '\t':
        return "TAB"
    return f"U+{ord(ch):04X}"


def find_path_references(content: str) -> list[str]:
    """
    Extract path references from SKILL.md content.
    Looks for patterns like scripts/xxx, references/xxx, assets/xxx

    Filters out:
    - Placeholder paths (xxx, example, etc.)
    - Paths in example contexts (lines containing "Example:", "e.g.", etc.)
    - Generic documentation examples
    - Paths prefixed with file:// (e.g., file://scripts/xxx) - these are external tool references, not skill-internal paths
    - Paths inside <example> blocks (illustrative, not real references)
    """
    # Pattern to match bundled resource paths (scripts/, references/, assets/)
    # Use negative lookbehind to exclude file:// prefixed paths
    pattern = r'(?<!file://)(?:scripts|references|assets)/[\w./-]+'

    # Strip content inside <example> blocks before scanning
    # These blocks contain illustrative paths, not real file references
    stripped_content = re.sub(r'<example>.*?</example>', '', content, flags=re.DOTALL)

    # Find all matches with their line context
    unique_paths = set()
    for line in stripped_content.split('\n'):
        # Skip lines that are clearly examples or documentation
        line_lower = line.lower()
        if any(x in line_lower for x in [
            'example:', 'examples:', 'e.g.', 'for example',
            '- **example', '- example:', 'such as',
            'pattern:', 'usage:', '❌', '✅',
            '- **allowed', '- **best practice', 'would be helpful',
            'like `scripts/', 'like `references/', 'like `assets/',
            'include `scripts/', 'include `references/', 'include `assets/',
            '**skill response**:', '**analysis**:', '**user request**:',
            'skill response:', 'from other skills:',
            # Skip lines with env var prefixed paths (external references)
            '$create_skill', '$skill_creator',
            # Skip merge/rename examples
            '\u2192',  # → arrow
        ]):
            continue

        # Find paths in this line
        matches = re.findall(pattern, line)
        for path in matches:
            # Skip obvious placeholders and example paths
            if any(x in path.lower() for x in [
                'example', 'xxx', '<', '>', 'my-', 'my_',
                'schema.md', 'hello-world', 'rotate_pdf', 'template',
                'api_reference', 'guide.md', 'logo', 'font',
                'learning-guide',
            ]):
                continue
            unique_paths.add(path)

    return list(unique_paths)


def validate_path_references(skill_path: Path, content: str) -> tuple[bool, list[str]]:
    """
    Verify all path references in SKILL.md actually exist.

    Returns:
        (all_exist, missing_paths)
    """
    referenced_paths = find_path_references(content)
    missing = []

    for ref_path in referenced_paths:
        full_path = skill_path / ref_path
        if not full_path.exists():
            missing.append(ref_path)

    return len(missing) == 0, missing


ORCHESTRATOR_TOOLS = ('Task', 'TeamCreate', 'TaskCreate', 'SendMessage')


def detect_orchestrator_skill(frontmatter: str, body: str) -> tuple[bool, list[str]]:
    """Detect orchestrator skills (dispatch sub-agents). These must NOT have context: fork."""
    reasons = []

    allowed_tools_match = re.search(r'allowed-tools:\s*(.+)', frontmatter)
    if allowed_tools_match:
        tools_field = allowed_tools_match.group(1)
        hits = [t for t in ORCHESTRATOR_TOOLS if re.search(rf'\b{t}\b', tools_field)]
        if hits:
            reasons.append(f"allowed-tools contains {', '.join(hits)} (sub-agent dispatch)")

    body_signals = [
        (r'\bspawn(?:s|ing)?\s+(?:sub-?)?agents?\b', "body mentions spawning sub-agents"),
        (r'\bdispatch(?:es|ing)?\s+(?:sub-?)?agents?\b', "body mentions dispatching sub-agents"),
        (r'\bparallel\s+(?:sub-?)?agents?\b', "body mentions parallel sub-agents"),
        (r'\bTaskOutput\b', "body references TaskOutput collection"),
    ]
    for pattern, reason in body_signals:
        if re.search(pattern, body, re.IGNORECASE):
            reasons.append(reason)

    return len(reasons) > 0, reasons


def detect_interactive_skill(body: str) -> tuple[bool, list[str]]:
    """
    Detect interactive skills (present a report/plan/prompt to the user, then resume
    on the user's response). These must NOT have context: fork because a forked
    subagent returns only a final summary, collapsing the two-stage flow.
    """
    reasons = []

    pause_patterns = [
        r'\bpresent(?:s|ing)?\s+(?:the\s+)?(?:report|plan|findings|summary)\s+to\s+the\s+user\b',
        r'\bshow(?:s|ing)?\s+(?:the\s+)?(?:report|plan|findings)\s+to\s+the\s+user\b',
        r'\bask\s+the\s+user\s+(?:to|for|whether|if)\b',
        r'\bwait\s+for\s+(?:user|the\s+user\'s)\s+(?:confirmation|approval|response)\b',
    ]
    resume_patterns = [
        r'\b(?:after|once|when)\s+the\s+user\s+(?:confirms|approves|responds|replies)\b',
        r'\bif\s+the\s+user\s+(?:confirms|approves|agrees)\b',
        r'\bupon\s+(?:user\s+)?(?:confirmation|approval)\b',
        r'\bthen\s+(?:apply|proceed|continue|resume)\b',
    ]

    has_pause = any(re.search(p, body, re.IGNORECASE) for p in pause_patterns)
    has_resume = any(re.search(p, body, re.IGNORECASE) for p in resume_patterns)

    if has_pause and has_resume:
        reasons.append("body defines a user-visible pause AND a later step that resumes on the user's response")

    if re.search(r'Review\s*[-\+]?\s*then\s*[-\+]?\s*Fix', body, re.IGNORECASE):
        reasons.append("'Review-then-Fix' pattern (interactive by construction)")
    if re.search(r'Plan\s*[-\+]?\s*then\s*[-\+]?\s*Apply', body, re.IGNORECASE):
        reasons.append("'Plan-then-Apply' pattern (interactive by construction)")

    return len(reasons) > 0, reasons


MODE_STYLE_VERB_PATTERN = re.compile(
    r'\b(?:thinks?|analyses?|analyzes?|reasons?|considers?|reflects?|ponders?)\b',
    re.IGNORECASE,
)
ACTIVE_VERB_PATTERN = re.compile(
    r'\b(?:extracts?|generates?|runs?|creates?|builds?|writes?|edits?|reads?|parses?|transforms?|executes?|processes?)\b',
    re.IGNORECASE,
)
IO_TOOL_PATTERN = re.compile(r'\b(?:Bash|Write|Edit|NotebookEdit|Task|WebFetch)\b')


def detect_mode_style_skill(frontmatter: str, body: str, skill_path) -> tuple[bool, list[str]]:
    """
    Detect mode-style reasoning skills (Class D). These must NOT have context: fork.

    A skill is Class D when its value comes from Claude's reasoning in the lead
    context, not from tool use or external I/O. Signals are heuristic; callers should
    treat this as a warning-worthy signal rather than a hard error unless the
    combination is strong.
    """
    reasons = []

    allowed_tools_match = re.search(r'allowed-tools:\s*(.+)', frontmatter)
    if allowed_tools_match:
        tools_field = allowed_tools_match.group(1)
        if not IO_TOOL_PATTERN.search(tools_field):
            reasons.append("allowed-tools is restricted to passive/read-only tools")
    else:
        reasons.append("no allowed-tools field (no tool-using work)")

    scripts_dir = skill_path / 'scripts'
    if not scripts_dir.exists():
        reasons.append("no scripts/ directory")

    if not IO_TOOL_PATTERN.search(body):
        reasons.append("body has no Bash/Write/Edit steps")

    desc_match = re.search(r'description:\s*["\']?(.+?)["\']?\s*$', frontmatter, re.MULTILINE)
    if desc_match:
        description = desc_match.group(1)
        mode_verb_hit = MODE_STYLE_VERB_PATTERN.search(description)
        active_verb_hit = ACTIVE_VERB_PATTERN.search(description)
        if mode_verb_hit and not active_verb_hit:
            reasons.append(f"description uses stance verb '{mode_verb_hit.group(0)}' without manipulation verb")

    trigger_keyword_match = re.search(
        r'when the user says\s+["\']([A-Z_][A-Z_0-9]{2,})["\']', frontmatter, re.IGNORECASE,
    )
    if trigger_keyword_match:
        reasons.append(f"invoked by keyword trigger '{trigger_keyword_match.group(1)}' (reasoning modifier pattern)")

    is_mode_style = len(reasons) >= 3
    return is_mode_style, reasons


def detect_task_based_skill(frontmatter: str, body: str) -> tuple[bool, list[str]]:
    """
    Detect whether a skill is task-based (candidate for context: fork).

    Only truly autonomous task-based skills (Class A) should get fork. Callers MUST
    also run detect_orchestrator_skill, detect_interactive_skill, and
    detect_mode_style_skill and exclude fork if any returns True.
    """
    reasons = []

    if 'agent:' in frontmatter:
        reasons.append("'agent' field in frontmatter (implies forked execution)")
    if 'allowed-tools:' in frontmatter:
        reasons.append("'allowed-tools' field in frontmatter (implies autonomous tool use)")

    if '<instructions>' in body:
        reasons.append("<instructions> tags found (multi-step workflow)")
    if re.search(r'scripts/[\w./-]+\.py', body):
        reasons.append("Python script references found (executable tasks)")
    if re.search(r'scripts/[\w./-]+\.sh', body):
        reasons.append("Shell script references found (executable tasks)")

    step_count = len(re.findall(r'(?:^|\n)#{1,4}\s*Step\s+\d', body))
    if step_count >= 3:
        reasons.append(f"{step_count} numbered steps found (multi-step workflow)")

    if re.search(r'\|\s*\*\*.*?\*\*\s*\|.*?\|\s*\*\*.*?\*\*\s*\|', body):
        mode_rows = len(re.findall(r'\|\s*\*\*\w+.*?\*\*', body))
        if mode_rows >= 3:
            reasons.append(f"Mode selection table found ({mode_rows} modes)")

    return len(reasons) > 0, reasons


def validate_skill(skill_path):
    """
    Validate a skill against review-skill requirements.

    Returns:
        (valid, message, warnings) - valid is bool, message is str, warnings is list of str
    """
    skill_path = Path(skill_path)
    warnings = []

    # Check SKILL.md exists
    skill_md = skill_path / 'SKILL.md'
    if not skill_md.exists():
        return False, "SKILL.md not found", warnings

    # Read and validate frontmatter
    content = skill_md.read_text(encoding="utf-8")
    if not content.startswith('---'):
        return False, "No YAML frontmatter found", warnings

    # Extract frontmatter
    match = re.match(r'^---\n(.*?)\n---', content, re.DOTALL)
    if not match:
        return False, "Invalid frontmatter format", warnings

    frontmatter = match.group(1)
    body = content[match.end():]

    # Check for invalid indentation characters in frontmatter
    invalid_indent = find_invalid_frontmatter_indentation(frontmatter)
    if invalid_indent:
        samples = ", ".join(
            f"line {line_no} ({describe_whitespace(ch)})"
            for line_no, ch in invalid_indent[:3]
        )
        more = "" if len(invalid_indent) <= 3 else f" (+{len(invalid_indent) - 3} more)"
        return False, (
            "Invalid whitespace in frontmatter indentation; use ASCII spaces only. "
            f"Found: {samples}{more}"
        ), warnings

    # Check required fields
    if 'name:' not in frontmatter:
        return False, "Missing 'name' in frontmatter", warnings
    if 'description:' not in frontmatter:
        return False, "Missing 'description' in frontmatter", warnings

    # Extract name for validation
    name_match = re.search(r'name:\s*(.+)', frontmatter)
    if name_match:
        name = name_match.group(1).strip()
        # Check naming convention (hyphen-case: lowercase with hyphens)
        if not re.match(r'^[a-z0-9-]+$', name):
            return False, f"Name '{name}' should be hyphen-case (lowercase letters, digits, and hyphens only)", warnings
        if name.startswith('-') or name.endswith('-') or '--' in name:
            return False, f"Name '{name}' cannot start/end with hyphen or contain consecutive hyphens", warnings
        # Max 64 characters
        if len(name) > 64:
            return False, f"Name '{name}' exceeds 64 characters ({len(name)})", warnings
        # No reserved words
        reserved_words = ['anthropic', 'claude']
        for word in reserved_words:
            if word in name:
                return False, f"Name '{name}' contains reserved word '{word}'", warnings

    # === REVIEW-SKILL CHECKS ===

    # Check context: fork against the four-class taxonomy
    # (A autonomous / B orchestrator / C interactive / D mode-style reasoning).
    # Review-skill raises M2 if fork is present on Class B, C, or D, OR absent on Class A.
    has_context_fork = 'context: fork' in frontmatter
    is_orchestrator, orch_reasons = detect_orchestrator_skill(frontmatter, body)
    is_interactive, inter_reasons = detect_interactive_skill(body)
    is_mode_style, mode_reasons = detect_mode_style_skill(frontmatter, body, skill_path)

    if has_context_fork and is_orchestrator:
        reasons_str = "; ".join(orch_reasons[:3])
        return False, (
            f"'context: fork' set on an orchestrator skill (Class B): {reasons_str}. "
            f"A forked subagent cannot spawn further subagents, so fork breaks the dispatch chain. "
            f"Remove 'context: fork' and 'agent' from frontmatter."
        ), warnings

    if has_context_fork and is_interactive:
        reasons_str = "; ".join(inter_reasons[:3])
        return False, (
            f"'context: fork' set on an interactive skill (Class C): {reasons_str}. "
            f"A forked subagent returns only a final summary, collapsing the user-visible pause. "
            f"Remove 'context: fork' and 'agent' from frontmatter."
        ), warnings

    if has_context_fork and is_mode_style:
        reasons_str = "; ".join(mode_reasons[:3])
        return False, (
            f"'context: fork' set on a mode-style reasoning skill (Class D): {reasons_str}. "
            f"A fork spawns a fresh subagent context, losing the lead's thinking tokens and "
            f"cross-turn persistence. Remove 'context: fork' and 'agent' from frontmatter."
        ), warnings

    if not has_context_fork and not is_orchestrator and not is_interactive and not is_mode_style:
        is_task_based, task_reasons = detect_task_based_skill(frontmatter, body)
        if is_task_based:
            reasons_str = "; ".join(task_reasons[:3])
            return False, f"Autonomous task-based skill (Class A) missing 'context: fork' ({reasons_str})", warnings

    # Extract and validate description
    desc_match = re.search(r'description:\s*["\']?(.+?)["\']?\s*$', frontmatter, re.MULTILINE)
    if desc_match:
        description = desc_match.group(1).strip()
        # Check for angle brackets
        if '<' in description or '>' in description:
            return False, "Description cannot contain angle brackets (< or >)", warnings
        # Max 1024 characters
        if len(description) > 1024:
            return False, f"Description exceeds 1024 characters ({len(description)})", warnings

        # Check third-person voice (review-skill requirement)
        # Bad: starts with imperative verb or second person
        imperative_patterns = [
            r'^(Extract|Process|Create|Build|Generate|Handle|Manage|Run|Execute|Use|Get|Set|Add|Remove|Delete|Update|Search|Find|Load|Save|Read|Write|Check|Validate|Format|Parse|Convert|Transform|Browse|Complete|Help|Assist)\s',
            r'^(You can|You should|You may|I can|I will|This will)',
            r'^(A |An |The |Complete |Full |Comprehensive |Simple |Easy |Quick )',
        ]
        for pattern in imperative_patterns:
            if re.match(pattern, description, re.IGNORECASE):
                return False, (
                    "Description must use a third-person verb "
                    "(e.g., 'Processes...', 'Extracts...', 'Reviews...'), not imperative, "
                    "second-person, or noun-phrase form. Review-skill flags this as M8 (major)."
                ), warnings

        # Check trigger conditions (review-skill requirement)
        trigger_patterns = ['use when', 'use this when', 'should be used when', 'invoke when', 'triggers when']
        has_trigger = any(p in description.lower() for p in trigger_patterns)
        if not has_trigger:
            warnings.append("⚠️  Description should include trigger conditions (e.g., 'Use when...')")

    # Check SKILL.md total line count (review-skill rubric: under 400 for Grade A, under 500 for Grade B)
    total_lines = len(content.splitlines())
    if total_lines > 500:
        warnings.append(f"⚠️  SKILL.md is {total_lines} lines (must be under 500 for Grade B)")
    elif total_lines > 400:
        warnings.append(f"ℹ️  SKILL.md is {total_lines} lines (under 400 for Grade A, under 500 for Grade B)")

    # Check <example> block count (review-skill deep-review criterion 2: 3-5 diverse examples)
    example_count = len(re.findall(r'<example>', body))
    if example_count < 3:
        warnings.append(
            f"⚠️  SKILL.md has {example_count} <example> block(s); review-skill expects 3-5 (m6 minor)"
        )
    elif example_count > 10:
        warnings.append(
            f"⚠️  SKILL.md has {example_count} <example> blocks; review-skill caps at 10 (m6 minor)"
        )

    # Check for loose .md files in root (only SKILL.md allowed)
    loose_md = [
        f.name for f in skill_path.iterdir()
        if f.is_file() and f.suffix == '.md' and f.name != 'SKILL.md'
    ]
    if loose_md:
        return False, f"Only SKILL.md allowed in root. Move to references/: {', '.join(loose_md)}", warnings

    # Check for nested references (one level deep only)
    refs_dir = skill_path / 'references'
    if refs_dir.exists():
        nested_dirs = [
            str(d.relative_to(refs_dir))
            for d in refs_dir.iterdir()
            if d.is_dir()
        ]
        if nested_dirs:
            return False, f"References must be one level deep. Nested directories found: {', '.join(nested_dirs)}", warnings

    # Validate path references exist
    paths_valid, missing_paths = validate_path_references(skill_path, content)
    if not paths_valid:
        return False, f"Missing referenced files: {', '.join(missing_paths)}", warnings

    if warnings:
        return True, "Skill is valid with warnings", warnings
    return True, "Skill is valid!", warnings

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python quick_validate.py <skill_directory>")
        sys.exit(1)

    valid, message, warnings = validate_skill(sys.argv[1])
    print(message)
    for warning in warnings:
        print(f"  {warning}")

    if not valid:
        sys.exit(1)
    elif warnings:
        sys.exit(2)  # Valid but with warnings
    else:
        sys.exit(0)
