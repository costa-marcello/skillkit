# Domain: Design

**Sections:** Universal Lens Interpretation · Augmentation Lens: Aesthetic Harmony · Domain Evaluation Criteria · Examples

## Universal Lens Interpretation

How the 4 universal lenses apply to design:

### Human
- User goals and frustrations: what are they trying to accomplish? What blocks them?
- Emotional response to visual design: does it feel trustworthy, playful, professional?
- Cognitive load of interface: how many decisions does the user make per screen?
- Discoverability of key actions: can users find what they need without instruction?
- Mental model alignment: does the UI match how users think about this task?

### Structural
- Information architecture: hierarchy, navigation depth, content grouping
- Interaction patterns: clicks to complete task, gesture complexity, transition logic
- Responsive behavior: breakpoints, layout shifts, content reflow strategy
- Component hierarchy: atomic design levels, composition patterns
- Design system consistency: does this follow existing tokens and patterns?
- Technical feasibility: can developers implement this without heroic effort?

### Inclusivity
- Accessibility: WCAG AA minimum—keyboard navigation, screen readers, focus management
- Cultural appropriateness of icons, colors, and metaphors across target markets
- Readability across vision abilities: font sizes, contrast, zoom behavior
- Motor accessibility: touch target sizes (minimum 44px), Fitts's law compliance
- Neurodiversity considerations: reduced motion options, consistent navigation, clear feedback

### Sustainability
- Design system scalability: does this pattern work for 50 more screens?
- Token and component reuse across products
- Developer handoff clarity: specs, annotations, interaction documentation
- Documentation for future designers: why was this choice made?

## Augmentation Lens: Aesthetic Harmony

Evaluates whether the visual design creates a unified, intentional experience. The universal lenses ensure the design works; this lens ensures it has craft—that visual choices are deliberate, not default.

### Evaluation Criteria
- Does the visual hierarchy guide the eye to the primary action?
- Is there a unified aesthetic language (intentional choices, not framework defaults)?
- Do micro-interactions reinforce the brand personality?

### Guiding Questions
- Is whitespace used as active design element, not leftover space?
- Squint test: is there a clear focal point when you blur your vision?
- Would a user recognize this as your product from a screenshot alone?

## Domain Evaluation Criteria

Beyond the universal quality gate, verify for this domain:
- [ ] Visual hierarchy guides attention to primary action?
- [ ] Design tokens (color, spacing, type) are consistent with the system?
- [ ] Interactions feel intentional, not decorative?
- [ ] Accessible at WCAG AA minimum?

## Examples

<example>
**Prompt:** ULTRATHINK: Redesign our settings page — users can't find the options they need.

**Domain detected:** Design
**Lenses applied:** Human, Structural, Inclusivity, Sustainability + Aesthetic Harmony

### Deep Reasoning Chain

**Problem:** Settings page has poor findability. Users resort to support tickets for settings they should be able to find themselves. Must restructure without losing functionality. Constraints: 47 settings across 6 categories, enterprise users with complex configurations.

**Approaches:**
1. **Categorized sidebar with search** — Persistent navigation on the left, search bar at top, content on the right
2. **Progressive disclosure with smart defaults** — Show only commonly-changed settings; advanced settings behind expandable sections
3. **Wizard-style guided configuration** — Step-through flow that asks what the user wants to accomplish, then shows relevant settings

**Analysis through lenses:**

*Human:* Users fall into two groups: (a) "I know what I want to change" (needs search), (b) "I need to configure something but don't know the setting name" (needs guidance). Current flat list serves neither well. Power users want direct access; new users want guidance.

*Structural:* 47 settings across 6 categories. Analysis of support tickets shows 8 settings account for 70% of complaints. Current layout: single scrollable page with accordion sections. Problem: users must know which accordion to open. Search would solve "I know the name" users; progressive disclosure would solve "I don't know the name" users.

*Inclusivity:* Settings labels use internal jargon ("Enable SSO SAML Passthrough") that non-technical admins don't understand. Each setting needs a plain-language description. Screen reader users face a 47-item list with no landmarks. Keyboard users must tab through every setting to reach the one they need.

*Sustainability:* As the product grows, settings will increase. Sidebar + search scales indefinitely. Progressive disclosure requires ongoing curation of "common" vs. "advanced." Wizard requires updating flows when settings change.

*Aesthetic Harmony:* Current page is a dense wall of toggles and inputs—no visual breathing room. Settings should be grouped with generous whitespace between categories. Active/changed settings should have subtle visual distinction from defaults. The search bar should be the most prominent element (users' primary intent is finding a specific setting).

**Logical chain:** Two user types (search-first and guidance-first) need different entry points. Sidebar + search serves search-first users. Progressive disclosure serves guidance-first users. These compose well: sidebar for navigation, search for direct access, most-changed settings surfaced first within each category. Therefore → **Option 1 (sidebar + search) enhanced with Option 2 (progressive disclosure within categories)**.

### Edge Cases

- **Search returns no results:** User misspells or uses different terminology. *Mitigation:* Fuzzy search with synonym matching ("two-factor" matches "2FA", "MFA", "multi-factor"). Show "Did you mean...?" suggestions.
- **Enterprise customer has 200+ custom settings:** Sidebar becomes unmanageable. *Mitigation:* Collapsible sidebar categories with badge counts; custom settings get their own top-level category.
- **Mobile admin access:** Sidebar collapses on small screens. *Mitigation:* Bottom sheet navigation on mobile; search becomes the primary navigation method.

### The Deliverable

**Design Specification:**

**Layout:** Three-column on desktop (sidebar 240px | content 1fr | contextual help 280px). Two-column on tablet (sidebar collapses to hamburger). Single-column on mobile (search-first, category cards).

**Sidebar:** Fixed-position, scrollable independently. Categories listed with icons and setting counts. Active category highlighted with accent color + left border. Search bar pinned above categories with keyboard shortcut hint (Cmd+K).

**Content area:** Settings grouped within selected category. Each setting: label (16px semibold) + description (14px regular, muted) + control (right-aligned). Most-changed settings (based on analytics) appear first within each category. "Advanced" settings collapsed by default with count badge ("8 advanced settings").

**Search behavior:** Activates on keystroke (no submit required). Results show setting name + category + description snippet. Arrow keys navigate results. Enter jumps to setting and highlights it with a pulse animation (2s).

**Accessibility requirements:**
- All settings reachable via keyboard (Tab order: search → sidebar → content)
- `aria-current="page"` on active sidebar category
- Search results announced via `aria-live="polite"` region
- Settings descriptions linked via `aria-describedby`
- Focus visible on all interactive elements (3px offset outline)
</example>

<example>
**Prompt:** ULTRATHINK: Should we use a modal or inline expansion for editing user profiles?

**Domain detected:** Design
**Lenses applied:** Human, Structural, Inclusivity, Sustainability + Aesthetic Harmony

### Deep Reasoning Chain

**Problem:** Profile editing interaction pattern decision. Users need to edit profile fields (name, email, avatar, bio, preferences). Must balance ease of editing with data safety. Constraints: profile is viewed 10x more than edited; editing involves 8 fields across 3 groups.

**Approaches:**
1. **Modal overlay** — Click "Edit" → modal appears with all fields → save/cancel
2. **Inline expand-in-place** — Click field → field becomes editable → save per field
3. **Slide-out panel** — Click "Edit" → panel slides from right with form → save/cancel

**Analysis through lenses:**

*Human:* Users edit profiles rarely (monthly). Modals are familiar ("edit and save" mental model). Inline editing feels lightweight but users may miss that they can click to edit (discoverability problem). Slide-out preserves context (profile visible behind panel) while providing focused editing space.

*Structural:* Modal: blocks background interaction (intentional—prevents partial saves). Inline: requires per-field save logic and conflict resolution (what if two fields have dependencies?). Slide-out: requires animation, z-index management, and responsive collapse strategy. Implementation cost: inline > slide-out > modal.

*Inclusivity:* Modal: must trap focus and manage `aria-modal`. Inline: screen reader must announce editable state per field. Slide-out: must announce panel opening, manage focus, and provide clear close mechanism. Modal has the best-understood accessibility pattern. Inline editing is the hardest to make accessible (implicit state changes).

*Sustainability:* Modal pattern already exists in the design system (reusable). Inline editing requires new components. Slide-out may exist (check design system). Modal scales to any form; inline becomes unwieldy with grouped fields (address = street + city + state + zip should save together).

*Aesthetic Harmony:* Modal is utilitarian—it works but doesn't delight. Slide-out preserves the profile context visually (the user can see their current profile while editing), creating a before/after comparison that aids confidence. Inline editing looks modern but risks making the profile page feel "twitchy" (always one click from changing state).

**Logical chain:** Inline editing has the highest discoverability risk and accessibility complexity for a rarely-used action. Modal is safe but loses context. Slide-out balances context preservation with focused editing and has a clear interaction boundary. However, implementation cost and design system alignment matter. If the design system already has a modal form component → use it (consistency wins). If not → slide-out for the context preservation benefit. Therefore → **Modal if pattern exists in design system; slide-out if building new.**

### Edge Cases

- **Unsaved changes + close attempt:** User edits 3 fields, clicks outside modal/panel. *Mitigation:* "You have unsaved changes" confirmation dialog. Never silently discard edits.
- **Long form on mobile:** Modal becomes full-screen on small viewports, losing "modal" feel. *Mitigation:* Use full-page edit view on mobile (not a modal); slide-out collapses to full-screen.
- **Avatar upload in modal:** File upload + crop workflow inside a modal creates a modal-within-modal. *Mitigation:* Avatar upload replaces modal content (step 1: form, step 2: crop) rather than stacking modals.

### The Deliverable

**Interaction Pattern Recommendation:** Slide-out panel (preferred) or modal (if slide-out absent from design system).

**Slide-out specification:**
- **Trigger:** "Edit Profile" button (primary style, positioned top-right of profile card)
- **Panel width:** 400px on desktop, full-width on mobile
- **Animation:** 300ms ease-out slide from right; backdrop overlay at 40% opacity
- **Content:** Grouped form sections (Personal, Contact, Preferences) with clear section dividers
- **Actions:** "Save" (primary) and "Cancel" (ghost) pinned to panel bottom; "Save" disabled until a field changes
- **Close mechanisms:** Cancel button, backdrop click (with unsaved-changes guard), Escape key

**Accessibility specification:**
- Focus moves to panel heading on open
- `aria-modal="true"` with focus trap
- Tab order: heading → first field → ... → Save → Cancel
- Escape key closes (with unsaved-changes guard)
- On close, focus returns to the "Edit Profile" button
- All form fields have visible labels (no placeholder-only labels)
</example>
