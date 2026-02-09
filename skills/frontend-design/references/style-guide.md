# Style Guide Quick Reference

Quick lookups for styles, colors, typography, and layouts by product type and industry.

## Style Recommendations by Product Type

| Product Type | Recommended Styles | Why |
|--------------|-------------------|-----|
| SaaS/Dashboard | Minimal, Flat Design, Dark Mode | Clean data presentation, reduces eye strain |
| E-commerce | Clean, Card-based, Soft Shadows | Product focus, easy scanning |
| Portfolio | Bento Grid, Brutalism, Editorial | Creative expression, memorable |
| Healthcare | Soft, Rounded, Light Mode | Trust, calm, accessibility |
| Fintech | Minimal, Professional, Dark/Light | Trust, precision, data clarity |
| Beauty/Spa | Elegant, Glassmorphism, Soft Gradients | Luxury feel, sophistication |
| Gaming | Neon, Cyberpunk, High Contrast | Energy, excitement |
| Education | Friendly, Colorful, Rounded | Approachable, engaging |

## Color Palette by Industry

| Industry | Primary Colors | Accent | Mood |
|----------|---------------|--------|------|
| SaaS | Blue (#3B82F6), Indigo (#6366F1) | Emerald | Trust, Professional |
| E-commerce | Orange (#F97316), Rose (#FB7185) | Amber | Energy, Urgency |
| Healthcare | Teal (#14B8A6), Cyan (#06B6D4) | Green | Calm, Trust |
| Fintech | Navy (#1E3A5F), Emerald (#059669) | Gold | Security, Growth |
| Beauty | Rose (#FDA4AF), Lavender (#C4B5FD) | Gold | Luxury, Softness |
| Gaming | Purple (#A855F7), Cyan (#22D3EE) | Neon Pink | Energy, Tech |

## Typography Pairing Guide

| Style | Heading Font | Body Font | Use Case |
|-------|--------------|-----------|----------|
| Modern Professional | Inter | Inter | SaaS, Dashboard (when neutral/data-focused aesthetic is intentional) |
| Elegant Luxury | Playfair Display | Lato | Beauty, Fashion |
| Friendly Approachable | Nunito | Open Sans | Education, Consumer |
| Technical Precision | JetBrains Mono | Inter | Developer Tools |
| Editorial Sophisticated | Fraunces | Source Sans Pro | Magazines, Blogs |
| Playful Creative | Pacifico | Quicksand | Kids, Gaming |

**Default if uncertain:** Serif display (Playfair Display, Fraunces) + humanist sans body (Source Sans 3, Work Sans).

## Layout Patterns

| Pattern | Structure | Best For |
|---------|-----------|----------|
| Hero-Centric | Large hero + stacked sections | Landing pages |
| Dashboard Grid | Sidebar + main content grid | Admin panels |
| Bento Grid | Asymmetric card grid | Portfolios, Features |
| Card Gallery | Uniform card grid | E-commerce, Listings |
| Single Column | Centered narrow content | Blogs, Documentation |
| Split Screen | 50/50 content sections | Comparisons, Sign-up |

## Tone Selection Framework

| Audience / Context | Recommended Tones | When to Use |
|--------------------|-------------------|-------------|
| Luxury/high-end product | Refined, editorial, art deco | Premium pricing, exclusivity |
| Developer tools/SaaS | Industrial, brutalist, minimal | Technical users, clarity matters |
| Consumer app/social | Playful, organic, soft/pastel | Broad appeal, approachability |
| Portfolio/creative | Maximalist, retro-futuristic | Standing out, showcasing range |
| E-commerce/retail | Editorial, luxury, organic | Trust, aspiration, conversion |
| Dashboard/admin | Industrial, utilitarian, minimal | Information density, efficiency |

## Edge Case Adaptations

| Context | Adaptation |
|---------|------------|
| Mobile-first | Replace hover effects with tap feedback and focus states |
| Performance-critical | Limit animations to opacity/transform only (GPU-accelerated) |
| Existing design systems | Adapt patterns to their tokens rather than inventing new |
| RTL languages | Use logical CSS properties (inline-start/end vs left/right) |
