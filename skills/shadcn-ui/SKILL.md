---
name: shadcn-ui
description: "Provides installation, configuration, and implementation guidance for shadcn/ui accessible React components. Use when setting up shadcn/ui, installing components, building forms with React Hook Form and Zod, customizing themes, or implementing UI patterns like buttons, dialogs, tables, and forms."
language: typescript,tsx
framework: react,nextjs,tailwindcss
license: MIT
allowed-tools: Read, Write, Bash, Edit, Glob
context: fork
---

# shadcn/ui Component Guide

Build accessible, customizable UI components with shadcn/ui, Radix UI, and Tailwind CSS.

## When to Use

- Setting up a new project with shadcn/ui
- Installing or configuring components
- Building forms with React Hook Form and Zod
- Creating accessible UI (buttons, dialogs, dropdowns, sheets)
- Customizing styling with Tailwind CSS
- Implementing design systems

## Quick Start

**New project:**
```bash
npx create-next-app@latest my-app --typescript --tailwind --eslint --app
cd my-app
npx shadcn@latest init
npx shadcn@latest add button input form card dialog select
```

**Existing project:**
```bash
npm install tailwindcss-animate class-variance-authority clsx tailwind-merge lucide-react
npx shadcn@latest init
```

## What is shadcn/ui?

- **Not an npm package** - components you copy into your project
- **You own the code** - full customization control
- Built with **Radix UI** primitives for accessibility
- Styled with **Tailwind CSS** utilities

## Component Quick Reference

| Component | Install | Usage |
|-----------|---------|-------|
| Button | `npx shadcn@latest add button` | `<Button variant="default">Click</Button>` |
| Input | `npx shadcn@latest add input` | `<Input type="email" placeholder="Email" />` |
| Form | `npx shadcn@latest add form` | React Hook Form + Zod integration |
| Card | `npx shadcn@latest add card` | `<Card><CardHeader>...</CardHeader></Card>` |
| Dialog | `npx shadcn@latest add dialog` | Modal with `<DialogTrigger>` and `<DialogContent>` |
| Select | `npx shadcn@latest add select` | Dropdown with `<SelectTrigger>` and `<SelectContent>` |
| Sheet | `npx shadcn@latest add sheet` | Slide-over panel (`side="left|right|top|bottom"`) |
| Toast | `npx shadcn@latest add toast` | Notifications via `useToast()` hook |
| Table | `npx shadcn@latest add table` | Data tables with header/body/row components |
| Menubar | `npx shadcn@latest add menubar` | Application menu bar |

**Install all:** `npx shadcn@latest add --all`

## Core Patterns

### Button Variants

```tsx
import { Button } from "@/components/ui/button"

<Button variant="default">Default</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Icon className="h-4 w-4" /></Button>

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
import { Button } from "@/components/ui/button"
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

### Select (Dropdown)

```tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

<Select>
  <SelectTrigger className="w-[180px]">
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="one">Option One</SelectItem>
    <SelectItem value="two">Option Two</SelectItem>
  </SelectContent>
</Select>
```

### Toast Notifications

Setup in root layout:
```tsx
import { Toaster } from "@/components/ui/toaster"

export default function RootLayout({ children }) {
  return (
    <html><body>{children}<Toaster /></body></html>
  )
}
```

Usage:
```tsx
import { useToast } from "@/components/ui/use-toast"

const { toast } = useToast()

toast({ title: "Success", description: "Changes saved." })
toast({ variant: "destructive", title: "Error", description: "Something went wrong." })
```

### Card with Form

```tsx
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

<Card className="w-[350px]">
  <CardHeader>
    <CardTitle>Create project</CardTitle>
    <CardDescription>Deploy in one click.</CardDescription>
  </CardHeader>
  <CardContent>
    <div className="grid gap-4">
      <div className="flex flex-col space-y-1.5">
        <Label htmlFor="name">Name</Label>
        <Input id="name" placeholder="Project name" />
      </div>
    </div>
  </CardContent>
  <CardFooter className="flex justify-between">
    <Button variant="outline">Cancel</Button>
    <Button>Deploy</Button>
  </CardFooter>
</Card>
```

### Table

```tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Status</TableHead>
      <TableHead className="text-right">Amount</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {data.map((row) => (
      <TableRow key={row.id}>
        <TableCell>{row.name}</TableCell>
        <TableCell>{row.status}</TableCell>
        <TableCell className="text-right">{row.amount}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

## Theming

Customize via CSS variables in `globals.css`:

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

See `references/configuration.md` for complete config files.

## Best Practices

1. **Accessibility**: Components use Radix UI primitives for ARIA compliance
2. **Type Safety**: Use TypeScript with Zod schemas for validation
3. **Customization**: Modify component files directly - you own the code
4. **Consistency**: Reuse patterns and variants across your app
5. **Dark Mode**: Use CSS variables with `.dark` class

## References

All detailed documentation is in `references/`:

| File | Content |
|------|---------|
| `configuration.md` | TSConfig, Tailwind config, CSS variables |
| `nextjs-integration.md` | App Router, Server Components, API routes |
| `advanced-patterns.md` | Complex forms, custom variants, dialogs |
| `cli-reference.md` | All CLI commands, installation, registries |
| `extended-components.md` | Terminal, Dock, Credit Card, QR Code, etc. |
| `learning-guide.md` | Learning path, exercises, best practices |

**External Links:**
- Official Docs: https://ui.shadcn.com
- Radix UI: https://www.radix-ui.com
- React Hook Form: https://react-hook-form.com
- Zod: https://zod.dev
