---
name: shadcn-ui
description: "Installs, configures, and implements shadcn/ui accessible React components. Use when setting up shadcn/ui, adding components, building forms with React Hook Form and Zod, customising themes, or implementing UI patterns like buttons, dialogs, tables, and data displays."
license: MIT
allowed-tools: Read, Write, Bash, Edit, Glob, mcp__shadcn__search_items_in_registries, mcp__shadcn__view_items_in_registries, mcp__shadcn__get_add_command_for_items, mcp__shadcn__list_items_in_registries, mcp__shadcn__get_item_examples_from_registries, mcp__shadcn__get_project_registries, mcp__shadcn__get_audit_checklist
context: fork
agent: general-purpose
---

# shadcn/ui Component Guide

Build accessible, customisable UI components with shadcn/ui, Radix UI, and Tailwind CSS.

## When to Use

- Setting up a new project with shadcn/ui
- Installing or configuring components
- Building forms with React Hook Form and Zod
- Creating accessible UI (buttons, dialogs, dropdowns, sheets)
- Customising themes with Tailwind CSS variables
- Implementing design systems

<instructions>

## MCP Tools (Preferred Workflow)

Use the shadcn MCP tools as the **primary method** for component discovery and installation. Fall back to CLI commands only when MCP tools are unavailable.

### Discovery Workflow

1. **Check project registries**: Call `mcp__shadcn__get_project_registries` to verify `components.json` exists
2. **Search for components**: Call `mcp__shadcn__search_items_in_registries` with the registry and query
3. **View component details**: Call `mcp__shadcn__view_items_in_registries` to see source code and dependencies
4. **Get usage examples**: Call `mcp__shadcn__get_item_examples_from_registries` for implementation patterns
5. **Get install command**: Call `mcp__shadcn__get_add_command_for_items` for the exact CLI command

### MCP Tool Reference

| Tool | Purpose |
|------|---------|
| `get_project_registries` | Check configured registries from `components.json` |
| `search_items_in_registries` | Fuzzy search for components by name/description |
| `list_items_in_registries` | List all available components in a registry |
| `view_items_in_registries` | View source code, types, and dependencies |
| `get_item_examples_from_registries` | Get usage examples for components |
| `get_add_command_for_items` | Get the CLI install command for components |
| `get_audit_checklist` | Get accessibility and quality audit checklist |

<example>
**Finding and installing a component via MCP**

1. Search: `search_items_in_registries(registries: ["@shadcn"], query: "date picker")`
2. View: `view_items_in_registries(items: ["@shadcn/date-picker"])`
3. Examples: `get_item_examples_from_registries(items: ["@shadcn/date-picker"])`
4. Install: `get_add_command_for_items(items: ["@shadcn/date-picker"])`
</example>

## CLI Commands

### Quick Start

**New project:**
```bash
npx create-next-app@latest my-app --typescript --tailwind --eslint --app
cd my-app
npx shadcn@latest init
npx shadcn@latest add button input form card dialog select
```

**Existing project:**
```bash
npx shadcn@latest init
```

### CLI Reference

| Command | Purpose |
|---------|---------|
| `npx shadcn@latest init` | Initialise shadcn/ui in a project |
| `npx shadcn@latest add <component>` | Add a component |
| `npx shadcn@latest add --all` | Add all components |
| `npx shadcn@latest search <query>` | Search registries |
| `npx shadcn@latest list` | List available components |
| `npx shadcn@latest view <component>` | View a component before installing |
| `npx shadcn@latest build` | Generate registry JSON files |
| `npx shadcn@latest migrate` | Run project migrations |

See `references/cli-reference.md` for framework-specific installation and registry configuration.

### Setup Verification Checklist

After initialisation, verify the setup works:

```
Setup Verification:
- [ ] `components.json` exists in project root
- [ ] `@/components/ui/` directory created
- [ ] `@/lib/utils.ts` contains the `cn` function
- [ ] `globals.css` has CSS variables for theming
- [ ] `tailwind.config` includes shadcn colour tokens
- [ ] Test: `npx shadcn@latest add button` installs without errors
- [ ] Test: Import and render `<Button>` compiles without errors
```

## Component Quick Reference

| Component | Install | Key Props |
|-----------|---------|-----------|
| Button | `add button` | `variant`, `size`, `asChild` |
| Input | `add input` | `type`, `placeholder`, `disabled` |
| Form | `add form` | React Hook Form + Zod integration |
| Card | `add card` | `CardHeader`, `CardContent`, `CardFooter` |
| Dialog | `add dialog` | `DialogTrigger`, `DialogContent` |
| Select | `add select` | `SelectTrigger`, `SelectContent`, `SelectItem` |
| Sheet | `add sheet` | `side="left\|right\|top\|bottom"` |
| Toast | `add toast` | `useToast()` hook, `variant` |
| Table | `add table` | `TableHeader`, `TableBody`, `TableRow` |

**Install all:** `npx shadcn@latest add --all`

## Core Patterns

### Button Variants

```tsx
import { Button } from "@/components/ui/button"

// Variants: default, destructive, outline, secondary, ghost, link
<Button variant="destructive">Delete</Button>

// Sizes: default, sm, lg, icon
<Button size="icon"><Trash className="h-4 w-4" /></Button>

// Loading state
<Button disabled>
  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  Loading
</Button>
```

### Form with Validation

```tsx
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export function LoginForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(console.log)} className="space-y-4">
        <FormField control={form.control} name="email" render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl><Input type="email" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="password" render={({ field }) => (
          <FormItem>
            <FormLabel>Password</FormLabel>
            <FormControl><Input type="password" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <Button type="submit">Login</Button>
      </form>
    </Form>
  )
}
```

### Dialog (Modal)

```tsx
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

<Dialog>
  <DialogTrigger asChild>
    <Button variant="outline">Open</Button>
  </DialogTrigger>
  <DialogContent className="sm:max-w-[425px]">
    <DialogHeader>
      <DialogTitle>Edit profile</DialogTitle>
      <DialogDescription>Make changes here.</DialogDescription>
    </DialogHeader>
    <div className="py-4">{/* Content */}</div>
    <DialogFooter>
      <Button type="submit">Save</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Toast Notifications

Add `<Toaster />` to the root layout once (see `references/nextjs-integration.md`), then call `useToast` anywhere:

```tsx
import { useToast } from "@/components/ui/use-toast"

const { toast } = useToast()
toast({ title: "Success", description: "Changes saved." })
toast({ variant: "destructive", title: "Error", description: "Something went wrong." })
```

## Theming

Customise via CSS variables in `globals.css`:

```css
:root {
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  --radius: 0.5rem;
}
.dark {
  --primary: 210 40% 98%;
  --primary-foreground: 222.2 47.4% 11.2%;
}
```

See `references/configuration.md` for complete config files (TSConfig, Tailwind, CSS variables, dependencies).

## Best Practices

1. **Verify accessibility**: Run `get_audit_checklist` after adding components. Check keyboard navigation and screen reader output.
2. **Validate with Zod**: Define a Zod schema for every form. Pass it to `zodResolver` in `useForm`.
3. **Use `cn()` for all class merging**: Never concatenate class strings manually. `cn()` resolves Tailwind conflicts.
4. **Keep server components default**: Only add `"use client"` when the component uses hooks, event handlers, or browser APIs. See `references/nextjs-integration.md`.
5. **Theme with CSS variables**: Change colours in `globals.css` `:root` and `.dark` blocks. Do not hardcode colour values in components.

<example>
**Error handling in form submission**

```tsx
async function onSubmit(values: z.infer<typeof formSchema>) {
  try {
    const res = await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    })
    if (!res.ok) {
      const data = await res.json()
      toast({ variant: "destructive", title: "Submission failed", description: data.message ?? "Check your input and try again." })
      return
    }
    toast({ title: "Saved", description: "Your changes have been saved." })
    form.reset()
  } catch {
    toast({ variant: "destructive", title: "Network error", description: "Could not reach the server. Try again later." })
  }
}
```
</example>

<example>
**Theming with CSS variables (brand recolour)**

To change the primary brand colour across every component, edit only `globals.css`. Components pick up the change automatically because they reference `hsl(var(--primary))`.

```css
/* globals.css */
:root {
  --primary: 262 83% 58%;          /* Violet brand */
  --primary-foreground: 210 40% 98%;
  --ring: 262 83% 58%;             /* Focus ring matches brand */
  --radius: 0.75rem;
}

.dark {
  --primary: 263 70% 65%;          /* Lighter violet for dark mode */
  --primary-foreground: 222 47% 11%;
  --ring: 263 70% 65%;
}
```

Do not hardcode `bg-violet-600` in components -- it breaks dark mode and theme switches.
</example>

<example>
**Post-install accessibility audit via MCP**

After adding an interactive component, run the audit checklist before shipping.

1. Install: `mcp__shadcn__get_add_command_for_items(items: ["@shadcn/dialog"])` then run the returned command
2. Audit: `mcp__shadcn__get_audit_checklist()` returns the keyboard and ARIA checks
3. Verify each item: focus trap works, `Escape` closes, `DialogTitle` is announced, trigger returns focus on close
4. If any check fails, inspect the installed file in `@/components/ui/dialog.tsx` and compare against the registry source via `view_items_in_registries`
</example>

</instructions>

## References

All detailed documentation is in `references/`:

| File | Content |
|------|---------|
| `configuration.md` | TSConfig, Tailwind config, CSS variables, dependencies |
| `nextjs-integration.md` | App Router, Server Components, API routes |
| `advanced-patterns.md` | Complex forms, custom variants, dialog with forms, sheet nav |
| `cli-reference.md` | All CLI commands, framework installs, registries |
| `extended-components.md` | Terminal, Dock, Credit Card, QR Code, charts, animations, hooks |
| `learning-guide.md` | Learning path, exercises, CVA and cn patterns |

**External Links:**
- Official Docs: https://ui.shadcn.com
- Radix UI: https://www.radix-ui.com
- React Hook Form: https://react-hook-form.com
- Zod: https://zod.dev
