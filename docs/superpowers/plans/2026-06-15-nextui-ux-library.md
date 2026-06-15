# @nextui-ux/react Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the v1 Foundation Set of `@nextui-ux/react`: a themeable, accessible React component library (9 components) with a semantic-token multi-theme system, ready to publish to npm.

**Architecture:** Single npm package. Components are styled with Tailwind v4 utilities that map to semantic CSS-variable tokens; theming is `[data-theme]`-based with zero component changes. Complex behavior sits on Radix UI primitives. RSC-aware: interactive components carry a preserved `'use client'` directive; static ones (Badge, Card, Input) are server-safe. Built with tsup (JS) + Tailwind CLI (CSS), developed/documented in Storybook, tested with Vitest + Testing Library + axe.

**Tech Stack:** React 19, TypeScript (strict), Tailwind CSS v4, Radix UI (unified `radix-ui` package), class-variance-authority, clsx, tailwind-merge, next-themes, tsup, Vitest, @testing-library/react, vitest-axe, Storybook 9, Changesets. Package manager: **pnpm** (substitute `npm run`/`npm` if preferred).

**Conventions (from spec §10.1):**
- All code identifiers in **English** (variables, files, `data-theme` values, tokens). User-facing labels are the consumer app's concern.
- Comments are **short and precise**, describing the current state of the code (what it IS), never the change made.

---

## File Structure

```
nextUI-UX/
├── package.json                         # package manifest, scripts, exports
├── tsconfig.json                        # strict TS config
├── tsup.config.ts                       # JS build (esm+cjs, dts, preserves 'use client')
├── vitest.config.ts                     # test runner config
├── vitest.setup.ts                      # jest-dom + axe matchers, cleanup
├── .gitignore
├── .storybook/
│   ├── main.ts                          # Storybook + Vite + Tailwind v4
│   └── preview.tsx                      # global CSS, theme toolbar/decorator
├── src/
│   ├── index.ts                         # public barrel export
│   ├── styles.css                       # Tailwind entry + token/theme imports
│   ├── lib/
│   │   └── cn.ts                        # clsx + tailwind-merge helper
│   ├── styles/
│   │   ├── tokens.css                   # semantic token contract + @theme inline
│   │   └── themes/
│   │       ├── classic-light.css
│   │       ├── classic-dark.css
│   │       └── purple-night.css
│   ├── theme/
│   │   └── ThemeProvider.tsx            # next-themes wrapper
│   └── components/
│       ├── Button/   {Button.tsx, Button.test.tsx, Button.stories.tsx, index.ts}
│       ├── Badge/    {Badge.tsx, Badge.test.tsx, Badge.stories.tsx, index.ts}
│       ├── Input/    {Input.tsx, Input.test.tsx, Input.stories.tsx, index.ts}
│       ├── Card/     {Card.tsx, Card.test.tsx, Card.stories.tsx, index.ts}
│       ├── Checkbox/ {Checkbox.tsx, Checkbox.test.tsx, Checkbox.stories.tsx, index.ts}
│       ├── Switch/   {Switch.tsx, Switch.test.tsx, Switch.stories.tsx, index.ts}
│       ├── Tooltip/  {Tooltip.tsx, Tooltip.test.tsx, Tooltip.stories.tsx, index.ts}
│       ├── Dialog/   {Dialog.tsx, Dialog.test.tsx, Dialog.stories.tsx, index.ts}
│       └── Tabs/     {Tabs.tsx, Tabs.test.tsx, Tabs.stories.tsx, index.ts}
└── docs/superpowers/...
```

---

## Task 1: Initialize package, structure, and dependencies

**Files:**
- Create: `package.json`, `.gitignore`

- [ ] **Step 1: Initialize the manifest and folders**

Run:
```bash
pnpm init
mkdir -p src/lib src/styles/themes src/theme \
  src/components/Button src/components/Badge src/components/Input \
  src/components/Card src/components/Checkbox src/components/Switch \
  src/components/Tooltip src/components/Dialog src/components/Tabs \
  .storybook
```

- [ ] **Step 2: Write `package.json`**

Replace the generated `package.json` with:
```json
{
  "name": "@nextui-ux/react",
  "version": "0.0.0",
  "description": "Themeable, accessible React component library.",
  "license": "MIT",
  "type": "module",
  "sideEffects": ["**/*.css"],
  "files": ["dist"],
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    },
    "./styles.css": "./dist/styles.css"
  },
  "scripts": {
    "build": "pnpm build:js && pnpm build:css",
    "build:js": "tsup",
    "build:css": "tailwindcss -i src/styles.css -o dist/styles.css --minify",
    "test": "vitest run",
    "test:watch": "vitest",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build",
    "lint": "eslint .",
    "format": "prettier --write .",
    "changeset": "changeset",
    "release": "pnpm build && changeset publish"
  },
  "peerDependencies": {
    "react": ">=18",
    "react-dom": ">=18"
  },
  "dependencies": {
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "next-themes": "^0.4.6",
    "radix-ui": "^1.4.3",
    "tailwind-merge": "^3.3.1"
  }
}
```

- [ ] **Step 3: Install dev dependencies**

Run:
```bash
pnpm add -D typescript tsup esbuild-plugin-preserve-directives \
  tailwindcss @tailwindcss/cli @tailwindcss/vite \
  vitest @vitejs/plugin-react jsdom \
  @testing-library/react @testing-library/user-event @testing-library/jest-dom vitest-axe \
  storybook @storybook/react-vite @storybook/addon-a11y @storybook/addon-docs \
  @changesets/cli eslint prettier \
  react react-dom @types/react @types/react-dom
```

> Note: `react`/`react-dom` are installed as dev deps so Storybook and tests run; they stay `peerDependencies` for consumers.

- [ ] **Step 4: Write `.gitignore`**

```
node_modules
dist
storybook-static
*.log
.DS_Store
```

- [ ] **Step 5: Commit**

```bash
git add package.json .gitignore pnpm-lock.yaml
git commit -m "chore: scaffold @nextui-ux/react package and dependencies"
```

---

## Task 2: TypeScript configuration

**Files:**
- Create: `tsconfig.json`

- [ ] **Step 1: Write `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "declaration": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "forceConsistentCasingInFileNames": true,
    "verbatimModuleSyntax": true
  },
  "include": ["src", ".storybook"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 2: Verify TypeScript resolves**

Run: `pnpm exec tsc --noEmit`
Expected: PASS (no files yet to type-check beyond config; exits 0).

- [ ] **Step 3: Commit**

```bash
git add tsconfig.json
git commit -m "chore: strict typescript configuration"
```

---

## Task 3: Build configuration (tsup, preserves 'use client')

**Files:**
- Create: `tsup.config.ts`

- [ ] **Step 1: Write `tsup.config.ts`**

```ts
import { defineConfig } from 'tsup'
import preserveDirectives from 'esbuild-plugin-preserve-directives'

// Emits ESM + CJS with type declarations. preserveDirectives keeps per-file
// 'use client' banners so server components can import the static pieces.
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  external: ['react', 'react-dom'],
  esbuildPlugins: [preserveDirectives()],
})
```

> If `esbuild-plugin-preserve-directives` exports under a different name, check its README; the function is the plugin factory. This is the only externally-versioned detail in the build.

- [ ] **Step 2: Commit**

```bash
git add tsup.config.ts
git commit -m "chore: tsup build emitting esm, cjs, and types"
```

---

## Task 4: Test runner configuration

**Files:**
- Create: `vitest.config.ts`, `vitest.setup.ts`

- [ ] **Step 1: Write `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    css: false,
  },
})
```

- [ ] **Step 2: Write `vitest.setup.ts`**

```ts
import '@testing-library/jest-dom/vitest'
import 'vitest-axe/extend-expect'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => cleanup())
```

- [ ] **Step 3: Verify the runner starts with no tests**

Run: `pnpm test`
Expected: Vitest reports "No test files found" and exits 0 (or run after Task 7 which adds the first test).

- [ ] **Step 4: Commit**

```bash
git add vitest.config.ts vitest.setup.ts
git commit -m "chore: vitest with jsdom, testing-library, and axe matchers"
```

---

## Task 5: Storybook configuration with theme toolbar

**Files:**
- Create: `.storybook/main.ts`, `.storybook/preview.tsx`

- [ ] **Step 1: Write `.storybook/main.ts`**

```ts
import type { StorybookConfig } from '@storybook/react-vite'
import tailwindcss from '@tailwindcss/vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-a11y', '@storybook/addon-docs'],
  framework: { name: '@storybook/react-vite', options: {} },
  async viteFinal(config) {
    config.plugins = config.plugins ?? []
    config.plugins.push(tailwindcss())
    return config
  },
}

export default config
```

- [ ] **Step 2: Write `.storybook/preview.tsx`**

```tsx
import type { Preview } from '@storybook/react'
import * as React from 'react'
import '../src/styles.css'

// Theme toolbar drives the same data-theme attribute the library reads at runtime.
const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'Active theme',
      defaultValue: 'classic-light',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        dynamicTitle: true,
        items: [
          { value: 'classic-light', title: 'Classic Light' },
          { value: 'classic-dark', title: 'Classic Dark' },
          { value: 'purple-night', title: 'Purple Night' },
        ],
      },
    },
  },
  decorators: [
    (Story, context) => {
      document.documentElement.setAttribute('data-theme', context.globals.theme)
      return (
        <div className="bg-background text-foreground min-h-40 p-8">
          <Story />
        </div>
      )
    },
  ],
  parameters: { backgrounds: { disable: true } },
}

export default preview
```

- [ ] **Step 3: Commit** (Storybook will be runnable after Task 6 provides `src/styles.css`)

```bash
git add .storybook/main.ts .storybook/preview.tsx
git commit -m "chore: storybook with tailwind v4 and theme switcher toolbar"
```

---

## Task 6: Design tokens and themes

**Files:**
- Create: `src/styles/tokens.css`, `src/styles/themes/classic-light.css`, `src/styles/themes/classic-dark.css`, `src/styles/themes/purple-night.css`, `src/styles.css`

- [ ] **Step 1: Write `src/styles/tokens.css`**

```css
/* Semantic token contract. Components reference roles, never raw colors. */
:root {
  --background: #ffffff;
  --foreground: #0a0a0a;
  --card: #ffffff;
  --card-foreground: #0a0a0a;
  --muted: #f4f4f5;
  --muted-foreground: #71717a;
  --primary: #7c5cff;
  --primary-foreground: #ffffff;
  --secondary: #f4f4f5;
  --secondary-foreground: #18181b;
  --accent: #f4f4f5;
  --accent-foreground: #18181b;
  --destructive: #ef4444;
  --destructive-foreground: #ffffff;
  --border: #e4e4e7;
  --input: #e4e4e7;
  --ring: #7c5cff;
  --radius: 0.5rem;
}

/* Exposes tokens as Tailwind color utilities (bg-primary, text-foreground, ...). */
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
}
```

- [ ] **Step 2: Write `src/styles/themes/classic-light.css`**

```css
[data-theme='classic-light'] {
  color-scheme: light;
  --background: #ffffff;
  --foreground: #0a0a0a;
  --card: #ffffff;
  --card-foreground: #0a0a0a;
  --muted: #f4f4f5;
  --muted-foreground: #71717a;
  --primary: #7c5cff;
  --primary-foreground: #ffffff;
  --secondary: #f4f4f5;
  --secondary-foreground: #18181b;
  --accent: #f4f4f5;
  --accent-foreground: #18181b;
  --destructive: #ef4444;
  --destructive-foreground: #ffffff;
  --border: #e4e4e7;
  --input: #e4e4e7;
  --ring: #7c5cff;
}
```

- [ ] **Step 3: Write `src/styles/themes/classic-dark.css`**

```css
[data-theme='classic-dark'] {
  color-scheme: dark;
  --background: #0a0a0a;
  --foreground: #fafafa;
  --card: #141414;
  --card-foreground: #fafafa;
  --muted: #1f1f22;
  --muted-foreground: #a1a1aa;
  --primary: #7c5cff;
  --primary-foreground: #ffffff;
  --secondary: #1f1f22;
  --secondary-foreground: #fafafa;
  --accent: #27272a;
  --accent-foreground: #fafafa;
  --destructive: #ef4444;
  --destructive-foreground: #ffffff;
  --border: #27272a;
  --input: #27272a;
  --ring: #7c5cff;
}
```

- [ ] **Step 4: Write `src/styles/themes/purple-night.css`**

```css
[data-theme='purple-night'] {
  color-scheme: dark;
  --background: #120d1f;
  --foreground: #f5f3ff;
  --card: #1b1430;
  --card-foreground: #f5f3ff;
  --muted: #241a3d;
  --muted-foreground: #b9a8e0;
  --primary: #a855f7;
  --primary-foreground: #ffffff;
  --secondary: #241a3d;
  --secondary-foreground: #f5f3ff;
  --accent: #2e2150;
  --accent-foreground: #f5f3ff;
  --destructive: #f43f5e;
  --destructive-foreground: #ffffff;
  --border: #2e2150;
  --input: #2e2150;
  --ring: #a855f7;
}
```

- [ ] **Step 5: Write `src/styles.css` (Tailwind entry)**

```css
@import 'tailwindcss';
@source './components';

@import './styles/tokens.css';
@import './styles/themes/classic-light.css';
@import './styles/themes/classic-dark.css';
@import './styles/themes/purple-night.css';
```

- [ ] **Step 6: Verify the CSS compiles**

Run: `pnpm exec tailwindcss -i src/styles.css -o /tmp/nextui-styles-check.css`
Expected: Exits 0; `/tmp/nextui-styles-check.css` contains `[data-theme='purple-night']` and `--color-primary`.

- [ ] **Step 7: Commit**

```bash
git add src/styles.css src/styles/
git commit -m "feat: semantic token contract and classic-light, classic-dark, purple-night themes"
```

---

## Task 7: `cn` class-merge helper (TDD)

**Files:**
- Create: `src/lib/cn.ts`
- Test: `src/lib/cn.test.ts`

- [ ] **Step 1: Write the failing test — `src/lib/cn.test.ts`**

```ts
import { describe, it, expect } from 'vitest'
import { cn } from './cn'

describe('cn', () => {
  it('joins class names', () => {
    expect(cn('a', 'b')).toBe('a b')
  })

  it('drops falsy values', () => {
    expect(cn('a', false && 'b', undefined, 'c')).toBe('a c')
  })

  it('resolves tailwind conflicts keeping the last', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run src/lib/cn.test.ts`
Expected: FAIL — cannot resolve `./cn`.

- [ ] **Step 3: Write `src/lib/cn.ts`**

```ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Merges conditional class lists and resolves conflicting Tailwind utilities.
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm exec vitest run src/lib/cn.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/cn.ts src/lib/cn.test.ts
git commit -m "feat: cn helper merging clsx output through tailwind-merge"
```

---

## Task 8: ThemeProvider

**Files:**
- Create: `src/theme/ThemeProvider.tsx`

- [ ] **Step 1: Write `src/theme/ThemeProvider.tsx`**

```tsx
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
```

- [ ] **Step 2: Verify it type-checks**

Run: `pnpm exec tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/theme/ThemeProvider.tsx
git commit -m "feat: ThemeProvider wrapping next-themes with data-theme and built-in themes"
```

---

## Task 9: Button (TDD + story)

**Files:**
- Create: `src/components/Button/Button.tsx`, `Button.test.tsx`, `Button.stories.tsx`, `index.ts`

- [ ] **Step 1: Write the failing test — `src/components/Button/Button.test.tsx`**

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { Button } from './Button'

describe('Button', () => {
  it('renders its label', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('fires onClick when pressed', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Go</Button>)
    await userEvent.click(screen.getByRole('button', { name: 'Go' }))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('ignores clicks when disabled', async () => {
    const onClick = vi.fn()
    render(
      <Button disabled onClick={onClick}>
        Go
      </Button>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Go' }))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<Button>Accessible</Button>)
    expect(await axe(container)).toHaveNoViolations()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run src/components/Button/Button.test.tsx`
Expected: FAIL — cannot resolve `./Button`.

- [ ] **Step 3: Write `src/components/Button/Button.tsx`**

```tsx
'use client'
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/cn'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius)] text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4',
        lg: 'h-12 px-6 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'default', size: 'md' },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  ),
)
Button.displayName = 'Button'

export { buttonVariants }
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm exec vitest run src/components/Button/Button.test.tsx`
Expected: PASS (4 tests).

- [ ] **Step 5: Write `src/components/Button/Button.stories.tsx`**

```tsx
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './Button'

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  args: { children: 'Button' },
  argTypes: {
    variant: { control: 'select', options: ['default', 'destructive', 'outline', 'ghost'] },
    size: { control: 'select', options: ['sm', 'md', 'lg', 'icon'] },
  },
}
export default meta
type Story = StoryObj<typeof Button>

export const Default: Story = {}
export const Destructive: Story = { args: { variant: 'destructive' } }
export const Outline: Story = { args: { variant: 'outline' } }
export const Ghost: Story = { args: { variant: 'ghost' } }
```

- [ ] **Step 6: Write `src/components/Button/index.ts`**

```ts
export * from './Button'
```

- [ ] **Step 7: Commit**

```bash
git add src/components/Button/
git commit -m "feat: Button with variant and size styles via cva"
```

---

## Task 10: Badge (TDD + story)

**Files:**
- Create: `src/components/Badge/Badge.tsx`, `Badge.test.tsx`, `Badge.stories.tsx`, `index.ts`

- [ ] **Step 1: Write the failing test — `src/components/Badge/Badge.test.tsx`**

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { Badge } from './Badge'

describe('Badge', () => {
  it('renders its content', () => {
    render(<Badge>New</Badge>)
    expect(screen.getByText('New')).toBeInTheDocument()
  })

  it('merges a consumer className', () => {
    render(<Badge className="custom-x">Tag</Badge>)
    expect(screen.getByText('Tag')).toHaveClass('custom-x')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<Badge>Status</Badge>)
    expect(await axe(container)).toHaveNoViolations()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run src/components/Badge/Badge.test.tsx`
Expected: FAIL — cannot resolve `./Badge`.

- [ ] **Step 3: Write `src/components/Badge/Badge.tsx`**

```tsx
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/cn'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        destructive: 'border-transparent bg-destructive text-destructive-foreground',
        outline: 'border-border text-foreground',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { badgeVariants }
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm exec vitest run src/components/Badge/Badge.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Write `src/components/Badge/Badge.stories.tsx`**

```tsx
import type { Meta, StoryObj } from '@storybook/react'
import { Badge } from './Badge'

const meta: Meta<typeof Badge> = {
  title: 'Components/Badge',
  component: Badge,
  args: { children: 'Badge' },
  argTypes: {
    variant: { control: 'select', options: ['default', 'secondary', 'destructive', 'outline'] },
  },
}
export default meta
type Story = StoryObj<typeof Badge>

export const Default: Story = {}
export const Secondary: Story = { args: { variant: 'secondary' } }
export const Destructive: Story = { args: { variant: 'destructive' } }
export const Outline: Story = { args: { variant: 'outline' } }
```

- [ ] **Step 6: Write `src/components/Badge/index.ts`**

```ts
export * from './Badge'
```

- [ ] **Step 7: Commit**

```bash
git add src/components/Badge/
git commit -m "feat: Badge with variant styles, server-safe"
```

---

## Task 11: Input (TDD + story)

**Files:**
- Create: `src/components/Input/Input.tsx`, `Input.test.tsx`, `Input.stories.tsx`, `index.ts`

- [ ] **Step 1: Write the failing test — `src/components/Input/Input.test.tsx`**

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { Input } from './Input'

describe('Input', () => {
  it('accepts typed text', async () => {
    render(<Input aria-label="Name" />)
    const field = screen.getByRole('textbox', { name: 'Name' })
    await userEvent.type(field, 'Ada')
    expect(field).toHaveValue('Ada')
  })

  it('blocks typing when disabled', async () => {
    render(<Input aria-label="Name" disabled />)
    const field = screen.getByRole('textbox', { name: 'Name' })
    await userEvent.type(field, 'Ada')
    expect(field).toHaveValue('')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<Input aria-label="Email" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run src/components/Input/Input.test.tsx`
Expected: FAIL — cannot resolve `./Input`.

- [ ] **Step 3: Write `src/components/Input/Input.tsx`**

```tsx
import * as React from 'react'
import { cn } from '../../lib/cn'

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        'flex h-10 w-full rounded-[var(--radius)] border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  ),
)
Input.displayName = 'Input'
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm exec vitest run src/components/Input/Input.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Write `src/components/Input/Input.stories.tsx`**

```tsx
import type { Meta, StoryObj } from '@storybook/react'
import { Input } from './Input'

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  args: { placeholder: 'Type here...', 'aria-label': 'Demo input' },
}
export default meta
type Story = StoryObj<typeof Input>

export const Default: Story = {}
export const Disabled: Story = { args: { disabled: true } }
export const Email: Story = { args: { type: 'email', placeholder: 'you@example.com' } }
```

- [ ] **Step 6: Write `src/components/Input/index.ts`**

```ts
export * from './Input'
```

- [ ] **Step 7: Commit**

```bash
git add src/components/Input/
git commit -m "feat: Input with focus ring and disabled states, server-safe"
```

---

## Task 12: Card (TDD + story)

**Files:**
- Create: `src/components/Card/Card.tsx`, `Card.test.tsx`, `Card.stories.tsx`, `index.ts`

- [ ] **Step 1: Write the failing test — `src/components/Card/Card.test.tsx`**

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './Card'

describe('Card', () => {
  it('composes its sections', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Description</CardDescription>
        </CardHeader>
        <CardContent>Body</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>,
    )
    expect(screen.getByText('Title')).toBeInTheDocument()
    expect(screen.getByText('Description')).toBeInTheDocument()
    expect(screen.getByText('Body')).toBeInTheDocument()
    expect(screen.getByText('Footer')).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
        </CardHeader>
        <CardContent>Body</CardContent>
      </Card>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run src/components/Card/Card.test.tsx`
Expected: FAIL — cannot resolve `./Card`.

- [ ] **Step 3: Write `src/components/Card/Card.tsx`**

```tsx
import * as React from 'react'
import { cn } from '../../lib/cn'

export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-[var(--radius)] border border-border bg-card text-card-foreground shadow-sm',
        className,
      )}
      {...props}
    />
  ),
)
Card.displayName = 'Card'

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col gap-1.5 p-6', className)} {...props} />
  ),
)
CardHeader.displayName = 'CardHeader'

export const CardTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('text-lg font-semibold leading-none', className)} {...props} />
  ),
)
CardTitle.displayName = 'CardTitle'

export const CardDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
  ),
)
CardDescription.displayName = 'CardDescription'

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  ),
)
CardContent.displayName = 'CardContent'

export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center p-6 pt-0', className)} {...props} />
  ),
)
CardFooter.displayName = 'CardFooter'
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm exec vitest run src/components/Card/Card.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Write `src/components/Card/Card.stories.tsx`**

```tsx
import type { Meta, StoryObj } from '@storybook/react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './Card'
import { Button } from '../Button/Button'

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
}
export default meta
type Story = StoryObj<typeof Card>

export const Default: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Account</CardTitle>
        <CardDescription>Manage your preferences.</CardDescription>
      </CardHeader>
      <CardContent>Card body content goes here.</CardContent>
      <CardFooter>
        <Button>Save</Button>
      </CardFooter>
    </Card>
  ),
}
```

- [ ] **Step 6: Write `src/components/Card/index.ts`**

```ts
export * from './Card'
```

- [ ] **Step 7: Commit**

```bash
git add src/components/Card/
git commit -m "feat: Card with header, title, description, content, footer slots"
```

---

## Task 13: Checkbox (TDD + story)

**Files:**
- Create: `src/components/Checkbox/Checkbox.tsx`, `Checkbox.test.tsx`, `Checkbox.stories.tsx`, `index.ts`

- [ ] **Step 1: Write the failing test — `src/components/Checkbox/Checkbox.test.tsx`**

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { Checkbox } from './Checkbox'

describe('Checkbox', () => {
  it('toggles checked state on click', async () => {
    render(<Checkbox aria-label="Accept terms" />)
    const box = screen.getByRole('checkbox', { name: 'Accept terms' })
    expect(box).toHaveAttribute('data-state', 'unchecked')
    await userEvent.click(box)
    expect(box).toHaveAttribute('data-state', 'checked')
  })

  it('does not toggle when disabled', async () => {
    render(<Checkbox aria-label="Accept terms" disabled />)
    const box = screen.getByRole('checkbox', { name: 'Accept terms' })
    await userEvent.click(box)
    expect(box).toHaveAttribute('data-state', 'unchecked')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<Checkbox aria-label="Accept terms" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run src/components/Checkbox/Checkbox.test.tsx`
Expected: FAIL — cannot resolve `./Checkbox`.

- [ ] **Step 3: Write `src/components/Checkbox/Checkbox.tsx`**

```tsx
'use client'
import * as React from 'react'
import { Checkbox as CheckboxPrimitive } from 'radix-ui'
import { cn } from '../../lib/cn'

export const Checkbox = React.forwardRef<
  React.ComponentRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      'peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-3.5 w-3.5"
        aria-hidden="true"
      >
        <path d="M20 6 9 17l-5-5" />
      </svg>
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = 'Checkbox'
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm exec vitest run src/components/Checkbox/Checkbox.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Write `src/components/Checkbox/Checkbox.stories.tsx`**

```tsx
import type { Meta, StoryObj } from '@storybook/react'
import { Checkbox } from './Checkbox'

const meta: Meta<typeof Checkbox> = {
  title: 'Components/Checkbox',
  component: Checkbox,
  args: { 'aria-label': 'Accept terms' },
}
export default meta
type Story = StoryObj<typeof Checkbox>

export const Default: Story = {}
export const Checked: Story = { args: { defaultChecked: true } }
export const Disabled: Story = { args: { disabled: true } }
```

- [ ] **Step 6: Write `src/components/Checkbox/index.ts`**

```ts
export * from './Checkbox'
```

- [ ] **Step 7: Commit**

```bash
git add src/components/Checkbox/
git commit -m "feat: Checkbox on radix primitive with inline check indicator"
```

---

## Task 14: Switch (TDD + story)

**Files:**
- Create: `src/components/Switch/Switch.tsx`, `Switch.test.tsx`, `Switch.stories.tsx`, `index.ts`

- [ ] **Step 1: Write the failing test — `src/components/Switch/Switch.test.tsx`**

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { Switch } from './Switch'

describe('Switch', () => {
  it('toggles on click', async () => {
    render(<Switch aria-label="Notifications" />)
    const toggle = screen.getByRole('switch', { name: 'Notifications' })
    expect(toggle).toHaveAttribute('data-state', 'unchecked')
    await userEvent.click(toggle)
    expect(toggle).toHaveAttribute('data-state', 'checked')
  })

  it('does not toggle when disabled', async () => {
    render(<Switch aria-label="Notifications" disabled />)
    const toggle = screen.getByRole('switch', { name: 'Notifications' })
    await userEvent.click(toggle)
    expect(toggle).toHaveAttribute('data-state', 'unchecked')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<Switch aria-label="Notifications" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run src/components/Switch/Switch.test.tsx`
Expected: FAIL — cannot resolve `./Switch`.

- [ ] **Step 3: Write `src/components/Switch/Switch.tsx`**

```tsx
'use client'
import * as React from 'react'
import { Switch as SwitchPrimitive } from 'radix-ui'
import { cn } from '../../lib/cn'

export const Switch = React.forwardRef<
  React.ComponentRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    className={cn(
      'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input',
      className,
    )}
    {...props}
  >
    <SwitchPrimitive.Thumb className="pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0" />
  </SwitchPrimitive.Root>
))
Switch.displayName = 'Switch'
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm exec vitest run src/components/Switch/Switch.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Write `src/components/Switch/Switch.stories.tsx`**

```tsx
import type { Meta, StoryObj } from '@storybook/react'
import { Switch } from './Switch'

const meta: Meta<typeof Switch> = {
  title: 'Components/Switch',
  component: Switch,
  args: { 'aria-label': 'Notifications' },
}
export default meta
type Story = StoryObj<typeof Switch>

export const Default: Story = {}
export const Checked: Story = { args: { defaultChecked: true } }
export const Disabled: Story = { args: { disabled: true } }
```

- [ ] **Step 6: Write `src/components/Switch/index.ts`**

```ts
export * from './Switch'
```

- [ ] **Step 7: Commit**

```bash
git add src/components/Switch/
git commit -m "feat: Switch on radix primitive with animated thumb"
```

---

## Task 15: Tooltip (TDD + story)

**Files:**
- Create: `src/components/Tooltip/Tooltip.tsx`, `Tooltip.test.tsx`, `Tooltip.stories.tsx`, `index.ts`

- [ ] **Step 1: Write the failing test — `src/components/Tooltip/Tooltip.test.tsx`**

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from './Tooltip'

function Demo() {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger>Hover me</TooltipTrigger>
        <TooltipContent>Tooltip text</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

describe('Tooltip', () => {
  it('reveals content on hover', async () => {
    render(<Demo />)
    await userEvent.hover(screen.getByRole('button', { name: 'Hover me' }))
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Tooltip text')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<Demo />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run src/components/Tooltip/Tooltip.test.tsx`
Expected: FAIL — cannot resolve `./Tooltip`.

- [ ] **Step 3: Write `src/components/Tooltip/Tooltip.tsx`**

```tsx
'use client'
import * as React from 'react'
import { Tooltip as TooltipPrimitive } from 'radix-ui'
import { cn } from '../../lib/cn'

export const TooltipProvider = TooltipPrimitive.Provider
export const Tooltip = TooltipPrimitive.Root
export const TooltipTrigger = TooltipPrimitive.Trigger

export const TooltipContent = React.forwardRef<
  React.ComponentRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        'z-50 overflow-hidden rounded-md bg-foreground px-3 py-1.5 text-xs text-background shadow-md',
        className,
      )}
      {...props}
    />
  </TooltipPrimitive.Portal>
))
TooltipContent.displayName = 'TooltipContent'
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm exec vitest run src/components/Tooltip/Tooltip.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Write `src/components/Tooltip/Tooltip.stories.tsx`**

```tsx
import type { Meta, StoryObj } from '@storybook/react'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from './Tooltip'
import { Button } from '../Button/Button'

const meta: Meta<typeof Tooltip> = {
  title: 'Components/Tooltip',
  component: Tooltip,
}
export default meta
type Story = StoryObj<typeof Tooltip>

export const Default: Story = {
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Hover me</Button>
        </TooltipTrigger>
        <TooltipContent>Helpful hint</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
}
```

- [ ] **Step 6: Write `src/components/Tooltip/index.ts`**

```ts
export * from './Tooltip'
```

- [ ] **Step 7: Commit**

```bash
git add src/components/Tooltip/
git commit -m "feat: Tooltip on radix primitive with portal content"
```

---

## Task 16: Dialog (TDD + story)

**Files:**
- Create: `src/components/Dialog/Dialog.tsx`, `Dialog.test.tsx`, `Dialog.stories.tsx`, `index.ts`

- [ ] **Step 1: Write the failing test — `src/components/Dialog/Dialog.test.tsx`**

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from './Dialog'

function Demo() {
  return (
    <Dialog>
      <DialogTrigger>Open</DialogTrigger>
      <DialogContent>
        <DialogTitle>Title here</DialogTitle>
        <DialogDescription>Description here</DialogDescription>
      </DialogContent>
    </Dialog>
  )
}

describe('Dialog', () => {
  it('opens on trigger click', async () => {
    render(<Demo />)
    await userEvent.click(screen.getByRole('button', { name: 'Open' }))
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Title here')).toBeInTheDocument()
  })

  it('closes on Escape', async () => {
    render(<Demo />)
    await userEvent.click(screen.getByRole('button', { name: 'Open' }))
    await screen.findByRole('dialog')
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('has no accessibility violations when open', async () => {
    const { container } = render(<Demo />)
    await userEvent.click(screen.getByRole('button', { name: 'Open' }))
    await screen.findByRole('dialog')
    expect(await axe(container)).toHaveNoViolations()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run src/components/Dialog/Dialog.test.tsx`
Expected: FAIL — cannot resolve `./Dialog`.

- [ ] **Step 3: Write `src/components/Dialog/Dialog.tsx`**

```tsx
'use client'
import * as React from 'react'
import { Dialog as DialogPrimitive } from 'radix-ui'
import { cn } from '../../lib/cn'

export const Dialog = DialogPrimitive.Root
export const DialogTrigger = DialogPrimitive.Trigger
export const DialogClose = DialogPrimitive.Close

export const DialogContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50" />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 rounded-[var(--radius)] border border-border bg-card p-6 text-card-foreground shadow-lg focus:outline-none',
        className,
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
))
DialogContent.displayName = 'DialogContent'

export const DialogTitle = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('text-lg font-semibold leading-none', className)}
    {...props}
  />
))
DialogTitle.displayName = 'DialogTitle'

export const DialogDescription = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
))
DialogDescription.displayName = 'DialogDescription'
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm exec vitest run src/components/Dialog/Dialog.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Write `src/components/Dialog/Dialog.stories.tsx`**

```tsx
import type { Meta, StoryObj } from '@storybook/react'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from './Dialog'
import { Button } from '../Button/Button'

const meta: Meta<typeof Dialog> = {
  title: 'Components/Dialog',
  component: Dialog,
}
export default meta
type Story = StoryObj<typeof Dialog>

export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Confirm action</DialogTitle>
        <DialogDescription>This cannot be undone.</DialogDescription>
        <DialogClose asChild>
          <Button variant="outline">Close</Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  ),
}
```

- [ ] **Step 6: Write `src/components/Dialog/index.ts`**

```ts
export * from './Dialog'
```

- [ ] **Step 7: Commit**

```bash
git add src/components/Dialog/
git commit -m "feat: Dialog on radix primitive with overlay, title, description, close"
```

---

## Task 17: Tabs (TDD + story)

**Files:**
- Create: `src/components/Tabs/Tabs.tsx`, `Tabs.test.tsx`, `Tabs.stories.tsx`, `index.ts`

- [ ] **Step 1: Write the failing test — `src/components/Tabs/Tabs.test.tsx`**

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs'

function Demo() {
  return (
    <Tabs defaultValue="one">
      <TabsList>
        <TabsTrigger value="one">One</TabsTrigger>
        <TabsTrigger value="two">Two</TabsTrigger>
      </TabsList>
      <TabsContent value="one">Panel one</TabsContent>
      <TabsContent value="two">Panel two</TabsContent>
    </Tabs>
  )
}

describe('Tabs', () => {
  it('shows the default panel', () => {
    render(<Demo />)
    expect(screen.getByText('Panel one')).toBeVisible()
  })

  it('switches panel on tab click', async () => {
    render(<Demo />)
    await userEvent.click(screen.getByRole('tab', { name: 'Two' }))
    expect(screen.getByText('Panel two')).toBeVisible()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<Demo />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run src/components/Tabs/Tabs.test.tsx`
Expected: FAIL — cannot resolve `./Tabs`.

- [ ] **Step 3: Write `src/components/Tabs/Tabs.tsx`**

```tsx
'use client'
import * as React from 'react'
import { Tabs as TabsPrimitive } from 'radix-ui'
import { cn } from '../../lib/cn'

export const Tabs = TabsPrimitive.Root

export const TabsList = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      'inline-flex h-10 items-center justify-center gap-1 rounded-[var(--radius)] bg-muted p-1 text-muted-foreground',
      className,
    )}
    {...props}
  />
))
TabsList.displayName = 'TabsList'

export const TabsTrigger = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm',
      className,
    )}
    {...props}
  />
))
TabsTrigger.displayName = 'TabsTrigger'

export const TabsContent = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      className,
    )}
    {...props}
  />
))
TabsContent.displayName = 'TabsContent'
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm exec vitest run src/components/Tabs/Tabs.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Write `src/components/Tabs/Tabs.stories.tsx`**

```tsx
import type { Meta, StoryObj } from '@storybook/react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs'

const meta: Meta<typeof Tabs> = {
  title: 'Components/Tabs',
  component: Tabs,
}
export default meta
type Story = StoryObj<typeof Tabs>

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="account" className="w-80">
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
      </TabsList>
      <TabsContent value="account">Account settings panel.</TabsContent>
      <TabsContent value="password">Password settings panel.</TabsContent>
    </Tabs>
  ),
}
```

- [ ] **Step 6: Write `src/components/Tabs/index.ts`**

```ts
export * from './Tabs'
```

- [ ] **Step 7: Commit**

```bash
git add src/components/Tabs/
git commit -m "feat: Tabs on radix primitive with list, trigger, content"
```

---

## Task 18: Public barrel export, build verification, and release setup

**Files:**
- Create: `src/index.ts`, `README.md` (overwrite), Changesets config

- [ ] **Step 1: Write `src/index.ts`**

```ts
export * from './lib/cn'
export * from './theme/ThemeProvider'
export * from './components/Button'
export * from './components/Badge'
export * from './components/Input'
export * from './components/Card'
export * from './components/Checkbox'
export * from './components/Switch'
export * from './components/Tooltip'
export * from './components/Dialog'
export * from './components/Tabs'
```

- [ ] **Step 2: Run the full test suite**

Run: `pnpm test`
Expected: All component + helper suites PASS.

- [ ] **Step 3: Build the package**

Run: `pnpm build`
Expected: `dist/index.js`, `dist/index.cjs`, `dist/index.d.ts`, and `dist/styles.css` are created. Confirm interactive component chunks retain a leading `"use client"` directive:

Run: `grep -l "use client" dist/*.js`
Expected: at least one output file lists `use client` (interactive components preserved).

- [ ] **Step 4: Initialize Changesets**

Run: `pnpm exec changeset init`

Then edit `.changeset/config.json` so `access` is `public`:
```json
{
  "$schema": "https://unpkg.com/@changesets/config@3.0.0/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "fixed": [],
  "linked": [],
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": []
}
```

- [ ] **Step 5: Write `README.md`** (overwrite the placeholder)

````markdown
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
````

- [ ] **Step 6: Add a changeset for the first release**

Run: `pnpm changeset`
Select a `minor` bump for `@nextui-ux/react`, summary: "Foundation Set: Button, Badge, Input, Card, Checkbox, Switch, Tooltip, Dialog, Tabs, theming."

- [ ] **Step 7: Commit**

```bash
git add src/index.ts README.md .changeset/
git commit -m "feat: public barrel export, release config, and usage docs"
```

---

## Self-Review Notes

- **Spec coverage:** §2 decisions → Tasks 1–5 (tooling) + 18 (release). §3 structure → File Structure + per-task paths. §4 theming → Task 6 + ThemeProvider (Task 8) + Storybook toolbar (Task 5). §5 variants → Button (Task 9) + Badge (Task 10). §6 nine components → Tasks 9–17. §7 API (forwardRef, className, `'use client'` only on interactive) → every component task. §8 testing → axe + interaction tests in every component task. §9 build/publish → Tasks 3 + 18. §10/§10.1 conventions → English identifiers and concise comments applied throughout.
- **Icons:** Check/X are inline SVGs, so `lucide-react` stays a consumer-only recommendation and is not a runtime dependency (consistent with spec §10, "no se empaqueta").
- **Type consistency:** `cn` signature stable across all components; Radix wrappers consistently use `React.ComponentRef` + `React.ComponentPropsWithoutRef`; CVA `variant`/`size` names match between Button impl, story, and tests.
- **Known external detail:** the `esbuild-plugin-preserve-directives` export name (Task 3) is the one version-sensitive line; verify against its README during execution. Everything else is self-contained.
