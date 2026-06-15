'use client'
import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'

// Wraps next-themes, defaulting to the library's data-theme attribute and theme list.
export function ThemeProvider({
  children,
  attribute = 'data-theme',
  themes = ['classic-light', 'classic-dark', 'purple-night'],
  defaultTheme = 'classic-light',
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute={attribute}
      themes={themes}
      defaultTheme={defaultTheme}
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}
