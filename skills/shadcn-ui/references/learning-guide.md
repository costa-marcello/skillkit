# shadcn/ui Learning Guide

## Core Patterns

### CVA Variant Pattern

Every shadcn/ui component uses CVA for variant management:

```tsx
const buttonVariants = cva("base-classes", {
  variants: {
    variant: { default: "...", destructive: "..." },
    size: { default: "...", sm: "..." },
  },
  defaultVariants: { variant: "default", size: "default" },
})
```

### Form Pattern

Every form follows this sequence:

1. Define Zod schema
2. Create form with `useForm({ resolver: zodResolver(schema) })`
3. Wrap with `<Form>` component
4. Add `<FormField>` for each input
5. Handle submission in `form.handleSubmit(onSubmit)`

### Component Customisation

1. Open the component file in `@/components/ui/`
2. Modify the CVA variants or add new ones
3. Add new props to the component interface
4. Export updated types

## Practice Exercises

### Exercise 1: Basic Setup
1. Create a new Next.js project
2. Set up shadcn/ui
3. Install and customize a Button component
4. Add a new variant "gradient"

### Exercise 2: Form Building
1. Create a contact form with:
   - Name input (required)
   - Email input (email validation)
   - Message textarea (min length)
   - Submit button with loading state

### Exercise 3: Component Combination
1. Build a settings page using:
   - Card for layout
   - Sheet for mobile menu
   - Select for dropdowns
   - Switch for toggles
   - Toast for notifications

### Exercise 4: Custom Component
1. Create a custom Badge component
2. Support variants: default, secondary, destructive, outline
3. Support sizes: sm, default, lg
4. Add icon support

## Resources

See external links in SKILL.md.