# Extended Components, Charts, Animations, and Hooks

Additional shadcn.io components beyond the core library. These follow the same copy-paste pattern and integrate with the standard shadcn/ui setup.

## Core Components

### Terminal Component

Interactive terminal emulator with typing animations.

```tsx
import { Terminal } from "@/components/ui/terminal"

export default function DemoTerminal() {
  return (
    <Terminal>
      <Terminal.Line command="npm install @repo/terminal" />
      <Terminal.Line output="Installing dependencies..." />
      <Terminal.Line command="npm start" />
    </Terminal>
  )
}
```

### Dock Component

macOS-style application dock with magnification on hover.

```tsx
import { Dock, DockIcon } from "@/components/ui/dock"
import { Home, Settings, User, Mail } from "lucide-react"

export default function AppDock() {
  return (
    <Dock>
      <DockIcon><Home className="h-6 w-6" /></DockIcon>
      <DockIcon><Settings className="h-6 w-6" /></DockIcon>
      <DockIcon><User className="h-6 w-6" /></DockIcon>
      <DockIcon><Mail className="h-6 w-6" /></DockIcon>
    </Dock>
  )
}
```

### Credit Card Component

Interactive 3D credit card with flip animation for payment forms.

```tsx
import { CreditCard } from "@/components/ui/credit-card"
import { useState } from "react"

export default function PaymentForm() {
  const [cardData, setCardData] = useState({
    number: "4532 1234 5678 9010",
    holder: "JOHN DOE",
    expiry: "12/28",
    cvv: "123"
  })

  return (
    <CreditCard
      number={cardData.number}
      holder={cardData.holder}
      expiry={cardData.expiry}
      cvv={cardData.cvv}
      onFlip={(flipped) => console.log("Card flipped:", flipped)}
    />
  )
}
```

### Image Zoom Component

Zoomable image with smooth modal transitions for galleries.

```tsx
import { ImageZoom } from "@/components/ui/image-zoom"

export default function ProductGallery() {
  return (
    <ImageZoom
      src="/product.jpg"
      alt="Product image"
      width={400}
      height={300}
    />
  )
}
```

### QR Code Component

Customisable QR codes for links, contact info, and authentication.

```tsx
import { QRCode } from "@/components/ui/qr-code"

export default function ShareDialog() {
  return (
    <div className="flex flex-col items-center gap-4">
      <QRCode
        value="https://shadcn.io"
        size={200}
        bgColor="#ffffff"
        fgColor="#000000"
      />
      <p className="text-sm text-muted-foreground">Scan to visit shadcn.io</p>
    </div>
  )
}
```

### Colour Picker Component

Advanced colour selection supporting HEX, RGB, and HSL formats.

```tsx
import { ColorPicker } from "@/components/ui/color-picker"
import { useState } from "react"

export default function ThemeCustomiser() {
  const [color, setColor] = useState("#3b82f6")

  return (
    <div className="space-y-2">
      <ColorPicker value={color} onChange={setColor} format="hex" />
      <p className="text-sm">Selected: {color}</p>
    </div>
  )
}
```

## Chart Components

Built with Recharts. Install: `npx shadcn@latest add chart`

### Bar Chart

```tsx
import { BarChart } from "@/components/ui/bar-chart"

const data = [
  { month: "Jan", sales: 4000, revenue: 2400 },
  { month: "Feb", sales: 3000, revenue: 1398 },
  { month: "Mar", sales: 2000, revenue: 9800 },
]

<BarChart
  data={data}
  index="month"
  categories={["sales", "revenue"]}
  valueFormatter={(value) => `$${value.toLocaleString()}`}
  yAxisWidth={60}
/>
```

### Line Chart

```tsx
import { LineChart } from "@/components/ui/line-chart"

const data = [
  { date: "2024-01", users: 1200, sessions: 3400 },
  { date: "2024-02", users: 1800, sessions: 4200 },
  { date: "2024-03", users: 2400, sessions: 5800 },
]

<LineChart
  data={data}
  index="date"
  categories={["users", "sessions"]}
  colors={["blue", "green"]}
/>
```

### Pie Chart

```tsx
import { PieChart } from "@/components/ui/pie-chart"

const data = [
  { name: "Product A", value: 400, fill: "#3b82f6" },
  { name: "Product B", value: 300, fill: "#10b981" },
  { name: "Product C", value: 200, fill: "#ef4444" },
]

<PieChart
  data={data}
  category="value"
  index="name"
  label={(entry) => `${entry.name}: ${entry.value}`}
/>
```

### Area Chart

```tsx
import { AreaChart } from "@/components/ui/area-chart"

const data = [
  { month: "Jan", mobile: 2000, desktop: 3000, tablet: 1000 },
  { month: "Feb", mobile: 2200, desktop: 3200, tablet: 1100 },
]

<AreaChart
  data={data}
  index="month"
  categories={["mobile", "desktop", "tablet"]}
  stacked={true}
/>
```

### Radar Chart

```tsx
import { RadarChart } from "@/components/ui/radar-chart"

const data = [
  { skill: "JavaScript", score: 85, industry: 75 },
  { skill: "TypeScript", score: 80, industry: 70 },
  { skill: "React", score: 90, industry: 80 },
]

<RadarChart
  data={data}
  index="skill"
  categories={["score", "industry"]}
/>
```

## Animation Components

### Magnetic Effect

Follows cursor movement for interactive buttons and cards.

```tsx
import { Magnetic } from "@/components/ui/magnetic"

<Magnetic>
  <Button>Hover me</Button>
</Magnetic>
```

### Animated Cursor

Custom cursor with interactive effects. Add to root layout.

```tsx
import { AnimatedCursor } from "@/components/ui/animated-cursor"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AnimatedCursor color="#3b82f6" />
      {children}
    </>
  )
}
```

### Apple Hello Effect

Recreation of Apple's "hello" animation with multi-language transitions.

```tsx
import { AppleHello } from "@/components/ui/apple-hello"

const greetings = [
  { text: "Hello", lang: "en" },
  { text: "Bonjour", lang: "fr" },
  { text: "Hola", lang: "es" },
]

<AppleHello greetings={greetings} speed={2000} fontSize="6rem" />
```

### Liquid Button

Fluid animation effect on hover for call-to-action elements.

```tsx
import { LiquidButton } from "@/components/ui/liquid-button"

<LiquidButton color="#3b82f6" onClick={() => console.log("clicked")}>
  Get Started
</LiquidButton>
```

### Rolling Text

Character-by-character rolling animation.

```tsx
import { RollingText } from "@/components/ui/rolling-text"

<RollingText text="Welcome to our site" speed={50} />
```

### Shimmering Text

Animated shimmer effect for headings.

```tsx
import { ShimmeringText } from "@/components/ui/shimmering-text"

<ShimmeringText text="Premium Feature" color="#f59e0b" speed={1500} />
```

## React Hooks

### useBoolean

Enhanced boolean state with `toggle`, `setTrue`, `setFalse` methods.

```tsx
import { useBoolean } from "@/hooks/use-boolean"

const modal = useBoolean(false)
// modal.value, modal.toggle(), modal.setTrue(), modal.setFalse()
```

### useCounter

Numeric state with min/max bounds.

```tsx
import { useCounter } from "@/hooks/use-counter"

const quantity = useCounter(0, { min: 0, max: 99 })
// quantity.value, quantity.increment(), quantity.decrement(), quantity.reset()
```

### useLocalStorage

Persist state in localStorage with automatic serialisation.

```tsx
import { useLocalStorage } from "@/hooks/use-local-storage"

const [theme, setTheme] = useLocalStorage("theme", "light")
const [settings, setSettings] = useLocalStorage("settings", { notifications: true })
```

### useDebounceValue

Debounce values to prevent excessive API calls.

```tsx
import { useDebounceValue } from "@/hooks/use-debounce-value"
import { useState, useEffect } from "react"

const [search, setSearch] = useState("")
const debouncedSearch = useDebounceValue(search, 500)

useEffect(() => {
  if (debouncedSearch) {
    fetch(`/api/search?q=${debouncedSearch}`).then(/* ... */)
  }
}, [debouncedSearch])
```

### useHover

Track hover state with configurable enter/leave delays.

```tsx
import { useHover } from "@/hooks/use-hover"
import { useRef } from "react"

const hoverRef = useRef<HTMLDivElement>(null)
const isHovering = useHover(hoverRef, { enterDelay: 200, leaveDelay: 100 })
```

### useCountdown

Countdown timer with play, pause, reset, and completion callback.

```tsx
import { useCountdown } from "@/hooks/use-countdown"

const countdown = useCountdown({
  initialSeconds: 60,
  onComplete: () => alert("Timer expired!")
})
// countdown.seconds, countdown.isRunning, countdown.isComplete
// countdown.start(), countdown.pause(), countdown.reset()
```

## Installation

```bash
# Initialise shadcn in your project
npx shadcn@latest init

# Add individual components
npx shadcn@latest add terminal dock credit-card

# Add chart components
npx shadcn@latest add bar-chart line-chart pie-chart

# Add hooks
npx shadcn@latest add use-boolean use-counter use-local-storage
```
