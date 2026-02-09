# Next.js Integration

Patterns for using shadcn/ui with Next.js App Router.

## App Router Setup

Components using client-side features need the `"use client"` directive:

```tsx
// src/components/ui/button.tsx
"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
// ... rest of component
```

## Layout Integration

Add Toaster to root layout:

```tsx
// app/layout.tsx
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"
import { cn } from "@/lib/utils"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", inter.className)}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
```

## Server Components

Wrap interactive components in Client Components when needed:

```tsx
// app/dashboard/page.tsx (Server Component)
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ButtonClient } from "@/components/ui/button-client"

export default function DashboardPage() {
  return (
    <Card>
      <CardHeader><CardTitle>Dashboard</CardTitle></CardHeader>
      <CardContent>
        <ButtonClient>Interactive Button</ButtonClient>
      </CardContent>
    </Card>
  )
}
```

```tsx
// src/components/ui/button-client.tsx
"use client"
import { Button } from "./button"

export function ButtonClient(props: React.ComponentProps<typeof Button>) {
  return <Button {...props} />
}
```

## Route Handlers with Forms

```tsx
// app/api/contact/route.ts
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  message: z.string().min(10),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = contactSchema.parse(body)
    // Process form data
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
```

## Form with API Submission

```tsx
// app/contact/page.tsx
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"

const formSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  message: z.string().min(10),
})

export default function ContactPage() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      if (!response.ok) throw new Error("Failed to submit")
      toast({ title: "Success!", description: "Your message has been sent." })
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to send message." })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl><Input placeholder="Your name" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="email" render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl><Input type="email" placeholder="your@email.com" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="message" render={({ field }) => (
          <FormItem>
            <FormLabel>Message</FormLabel>
            <FormControl><Textarea placeholder="Your message..." {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <Button type="submit" className="w-full">Send Message</Button>
      </form>
    </Form>
  )
}
```

## Metadata

```tsx
// app/layout.tsx
import { Metadata } from "next"

export const metadata: Metadata = {
  title: { default: "My App", template: "%s | My App" },
  description: "Built with shadcn/ui and Next.js",
}

// app/about/page.tsx
export const metadata: Metadata = {
  title: "About Us",
  description: "Learn more about our company",
}
```
