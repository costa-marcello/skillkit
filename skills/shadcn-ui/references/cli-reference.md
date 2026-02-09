# shadcn/ui CLI Reference

Complete reference for shadcn/ui CLI commands and installation patterns.

## All Commands

| Command | Purpose | Key Flags |
|---------|---------|-----------|
| `init` | Initialise project | `-t` template, `-b` base-color, `-y` skip prompts |
| `add <component>` | Add a component | `-y` skip prompts, `-o` overwrite, `-a` all, `-p` path |
| `search <query>` | Search registries | Fuzzy match by name/description |
| `list` | List available components | Shows all registry items |
| `view <component>` | Preview before installing | Shows source code and dependencies |
| `build` | Generate registry JSON | For custom registry authors |
| `migrate` | Run project migrations | Updates to latest patterns |

## Quick Commands

```bash
# Initialise shadcn/ui
npx shadcn@latest init

# Add single component
npx shadcn@latest add button

# Add multiple components
npx shadcn@latest add button input form card

# Add all components
npx shadcn@latest add --all

# Search for a component
npx shadcn@latest search "date picker"

# Preview a component before installing
npx shadcn@latest view button

# List all available components
npx shadcn@latest list
```

## Framework-Specific Installation

### Next.js (Recommended)
```bash
npx create-next-app@latest my-app --typescript --tailwind --eslint --app
cd my-app
npx shadcn@latest init
```

### TanStack Start
```bash
pnpm create @tanstack/start@latest --tailwind --add-ons shadcn
pnpm dlx shadcn@latest add --all
```

### Laravel with React
```bash
laravel new my-app --react
cd my-app
npx shadcn@latest init
```

### Vite
```bash
npm create vite@latest my-app -- --template react-ts
cd my-app
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npx shadcn@latest init
```

## Component Installation

### Core Components
```bash
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add form        # Includes react-hook-form + zod
npx shadcn@latest add card
npx shadcn@latest add dialog
npx shadcn@latest add select
npx shadcn@latest add sheet
npx shadcn@latest add toast
npx shadcn@latest add table
npx shadcn@latest add menubar
```

### Data Display
```bash
npx shadcn@latest add avatar
npx shadcn@latest add badge
npx shadcn@latest add calendar
npx shadcn@latest add progress
npx shadcn@latest add skeleton
```

### Navigation
```bash
npx shadcn@latest add navigation-menu
npx shadcn@latest add tabs
npx shadcn@latest add breadcrumb
npx shadcn@latest add pagination
```

### Overlays
```bash
npx shadcn@latest add alert-dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add popover
npx shadcn@latest add tooltip
npx shadcn@latest add hover-card
```

### Form Components
```bash
npx shadcn@latest add checkbox
npx shadcn@latest add radio-group
npx shadcn@latest add switch
npx shadcn@latest add slider
npx shadcn@latest add textarea
npx shadcn@latest add input-otp
```

## Manual Radix Installation

If you prefer manual installation without CLI:

```bash
# Core primitives
npm install @radix-ui/react-slot
npm install @radix-ui/react-dialog
npm install @radix-ui/react-select
npm install @radix-ui/react-dropdown-menu
npm install @radix-ui/react-toast
npm install @radix-ui/react-progress
npm install @radix-ui/react-accordion

# Utilities
npm install class-variance-authority
npm install clsx
npm install tailwind-merge
npm install lucide-react
npm install tailwindcss-animate
```

## Registry Configuration

### Multiple Registries (components.json)
```json
{
  "registries": {
    "@shadcn": "https://ui.shadcn.com/r/{name}.json",
    "@company-ui": {
      "url": "https://registry.company.com/ui/{name}.json",
      "headers": {
        "Authorization": "Bearer ${COMPANY_TOKEN}"
      }
    },
    "@team": {
      "url": "https://team.company.com/{name}.json",
      "params": {
        "team": "frontend",
        "version": "${REGISTRY_VERSION}"
      }
    }
  }
}
```

### Custom Registry Item
```json
{
  "$schema": "https://ui.shadcn.com/schema/registry-item.json",
  "name": "my-custom-component",
  "type": "registry:item",
  "dependencies": ["some-package"],
  "files": [
    {
      "path": "/path/to/component.tsx",
      "type": "registry:file",
      "target": "~/components/ui/component.tsx",
      "content": "..."
    }
  ]
}
```

## Serve Custom Registry

```bash
# Start development server (Next.js)
npm run dev

# Registry items accessible at /r/{name}.json
```

## Troubleshooting

### Common Issues

**Component not found:**
```bash
# Update CLI
npm install shadcn@latest

# Check available components
npx shadcn@latest add --help
```

**Path alias issues:**
Ensure `tsconfig.json` has proper paths:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**Tailwind not working:**
Check `tailwind.config.js` content paths:
```js
content: [
  './src/**/*.{ts,tsx}',
  './components/**/*.{ts,tsx}',
]
```
