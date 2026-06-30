# @nextui-ux/react

Themeable, accessible React component library. v1 Foundation Set.

## Install

```bash
pnpm add @nextui-ux/react
```

`react` and `react-dom` are peer dependencies.

## Setup

Import the stylesheet once at your app root and wrap your tree with the provider:

```tsx
import '@nextui-ux/react/styles.css'
import { ThemeProvider } from '@nextui-ux/react'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <body>
        <ThemeProvider defaultTheme="classic-light">{children}</ThemeProvider>
      </body>
    </html>
  )
}
```

## Themes

Built-in: `classic-light`, `classic-dark`, `purple-night`. Switch by setting
`data-theme` on `<html>` (handled by `ThemeProvider`). Add your own theme with a
CSS block overriding the semantic tokens:

```css
[data-theme='ocean'] {
  color-scheme: dark;
  --background: #04141f;
  --primary: #38bdf8;
  /* ...remaining tokens */
}
```

## Components

Button, Badge, Input, Card, Checkbox, Switch, Tooltip, Dialog, Tabs.

Interactive components ship with a `'use client'` directive; Badge, Input, and
Card are server-safe and render in React Server Components without a client
boundary.