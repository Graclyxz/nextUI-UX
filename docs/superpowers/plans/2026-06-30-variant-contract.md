# Variant Contract Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish the canonical variant/size/state contract as a shared code module and migrate Button and Badge to consume it (renaming `variant` → `intent`, adding the missing shared variants).

**Architecture:** A single internal module `src/lib/variants.ts` owns cross-component class fragments (focus ring, disabled, invalid, control sizes, intent→color mapping). Components compose those fragments inside their own `cva` base, keeping only their own geometry (padding/radius/shape) local. The module is NOT exported from the public barrel — it is an internal building block.

**Tech Stack:** TypeScript (strict, `verbatimModuleSyntax`), `class-variance-authority`, `tailwind-merge`/`clsx` via `cn`, Tailwind v4 semantic tokens, vitest + jsdom + `@testing-library/react` + `vitest-axe`, Storybook.

## Global Constraints

- Code identifiers always English; reference semantic tokens only — zero raw hex.
- Type-only imports must use `import type` (`verbatimModuleSyntax`).
- Barrel/internal imports use `.js` extensions.
- Every component test keeps its `axe` accessibility assertion.
- Never run `pnpm build` to check work — use `pnpm vitest run` and `pnpm exec tsc --noEmit`.
- 5 canonical intents (order): `default`, `secondary`, `outline`, `ghost`, `destructive`.
- 3 canonical sizes: `sm`=h-8, `md`=h-10 (default), `lg`=h-12. `icon` is Button-only.
- Conventional commits, no AI attribution.

---

### Task 1: Shared variants module

**Files:**
- Create: `src/lib/variants.ts`
- Test: `src/lib/variants.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `focusRing: string`
  - `disabledControl: string`
  - `disabledField: string`
  - `invalidField: string`
  - `controlSize: { sm: string; md: string; lg: string }` (height + horizontal padding + text size)
  - `intentColors: { default: string; secondary: string; outline: string; ghost: string; destructive: string }`

- [ ] **Step 1: Write the failing test**

`src/lib/variants.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { focusRing, controlSize, intentColors } from './variants'

describe('variants contract', () => {
  it('exposes the 5 canonical intents in order', () => {
    expect(Object.keys(intentColors)).toEqual([
      'default',
      'secondary',
      'outline',
      'ghost',
      'destructive',
    ])
  })

  it('exposes the 3 canonical control sizes', () => {
    expect(Object.keys(controlSize)).toEqual(['sm', 'md', 'lg'])
  })

  it('uses semantic tokens, not raw hex', () => {
    const all = [focusRing, ...Object.values(controlSize), ...Object.values(intentColors)].join(' ')
    expect(all).not.toMatch(/#[0-9a-fA-F]{3,6}/)
  })

  it('ties the focus ring to the ring token', () => {
    expect(focusRing).toContain('focus-visible:ring-ring')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/lib/variants.test.ts`
Expected: FAIL — cannot resolve `./variants`.

- [ ] **Step 3: Write minimal implementation**

`src/lib/variants.ts`:
```ts
// Single source of truth for cross-component style fragments. Components
// compose these inside their own cva base and keep only their own geometry
// (padding/radius/shape) local. Not exported from the public barrel.

// Interactive state fragments.
export const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
export const disabledControl = 'disabled:pointer-events-none disabled:opacity-50'
export const disabledField = 'disabled:cursor-not-allowed disabled:opacity-50'
export const invalidField =
  'aria-invalid:border-destructive aria-invalid:ring-destructive'

// Canonical control heights + horizontal padding (shared vertical rhythm so a
// field and a button at the same size align). Icon-only controls override.
export const controlSize = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
} as const

// Canonical intent -> token color mapping for emphasis components. Geometry
// (radius/padding) is supplied by each component's own base.
export const intentColors = {
  default: 'bg-primary text-primary-foreground hover:bg-primary/90',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  outline:
    'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
  ghost: 'hover:bg-accent hover:text-accent-foreground',
  destructive:
    'bg-destructive text-destructive-foreground hover:bg-destructive/90',
} as const
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/lib/variants.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Typecheck**

Run: `pnpm exec tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/lib/variants.ts src/lib/variants.test.ts
git commit -m "feat: add shared variant contract module"
```

---

### Task 2: Migrate Button to the contract (`variant` → `intent`, add `secondary`)

**Files:**
- Modify: `src/components/Button/Button.tsx`
- Modify: `src/components/Button/Button.test.tsx`
- Modify: `src/components/Button/Button.stories.tsx`

**Interfaces:**
- Consumes: `focusRing`, `disabledControl`, `controlSize`, `intentColors` from `../../lib/variants.js`.
- Produces: `Button` with prop `intent?: 'default'|'secondary'|'outline'|'ghost'|'destructive'` and `size?: 'sm'|'md'|'lg'|'icon'`. Exports `buttonVariants` (name unchanged). `variant` prop no longer exists (BREAKING).

- [ ] **Step 1: Update the test to the new API (failing)**

In `src/components/Button/Button.test.tsx`, replace the `variant`-based test and add a `secondary` test. Replace this block:
```tsx
  it('applies variant and size utility classes', () => {
    render(
      <Button variant="destructive" size="lg">
        Delete
      </Button>,
    )
    const button = screen.getByRole('button', { name: 'Delete' })
    expect(button).toHaveClass('bg-destructive')
    expect(button).toHaveClass('h-12')
  })
```
with:
```tsx
  it('applies intent and size utility classes', () => {
    render(
      <Button intent="destructive" size="lg">
        Delete
      </Button>,
    )
    const button = screen.getByRole('button', { name: 'Delete' })
    expect(button).toHaveClass('bg-destructive')
    expect(button).toHaveClass('h-12')
  })

  it('applies the secondary intent', () => {
    render(<Button intent="secondary">Cancel</Button>)
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveClass('bg-secondary')
  })
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/components/Button/Button.test.tsx`
Expected: FAIL — `intent` is not a valid prop / type error or missing `bg-secondary`.

- [ ] **Step 3: Rewrite the component**

Replace the full contents of `src/components/Button/Button.tsx`:
```tsx
'use client'
import * as React from 'react'
import { Slot } from 'radix-ui'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/cn.js'
import { focusRing, disabledControl, controlSize, intentColors } from '../../lib/variants.js'

const buttonVariants = cva(
  cn(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-colors',
    focusRing,
    disabledControl,
  ),
  {
    variants: {
      intent: intentColors,
      size: { ...controlSize, icon: 'h-10 w-10' },
    },
    defaultVariants: { intent: 'default', size: 'md' },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Render the styles onto the single child element instead of a <button>. */
  asChild?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, intent, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot.Root : 'button'
    return (
      <Comp ref={ref} className={cn(buttonVariants({ intent, size }), className)} {...props} />
    )
  },
)
Button.displayName = 'Button'

export { buttonVariants }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/components/Button/Button.test.tsx`
Expected: PASS (all Button tests, including the a11y assertion).

- [ ] **Step 5: Update stories to the new API**

Replace the full contents of `src/components/Button/Button.stories.tsx`:
```tsx
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './Button'

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  args: { children: 'Button' },
  argTypes: {
    intent: {
      control: 'select',
      options: ['default', 'secondary', 'outline', 'ghost', 'destructive'],
    },
    size: { control: 'select', options: ['sm', 'md', 'lg', 'icon'] },
  },
}
export default meta
type Story = StoryObj<typeof Button>

export const Default: Story = {}
export const Secondary: Story = { args: { intent: 'secondary' } }
export const Outline: Story = { args: { intent: 'outline' } }
export const Ghost: Story = { args: { intent: 'ghost' } }
export const Destructive: Story = { args: { intent: 'destructive' } }
```

- [ ] **Step 6: Typecheck**

Run: `pnpm exec tsc --noEmit`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add src/components/Button
git commit -m "feat!: migrate Button to intent contract, add secondary intent"
```

---

### Task 3: Migrate Badge to the contract (`variant` → `intent`, add `ghost`)

**Files:**
- Modify: `src/components/Badge/Badge.tsx`
- Modify: `src/components/Badge/Badge.test.tsx`
- Modify: `src/components/Badge/Badge.stories.tsx`

**Interfaces:**
- Consumes: `intentColors` from `../../lib/variants.js`.
- Produces: `Badge` with prop `intent?: 'default'|'secondary'|'outline'|'ghost'|'destructive'`. Exports `badgeVariants` (name unchanged). `variant` prop no longer exists (BREAKING).

> Note: Badge keeps `border border-transparent` in its base so all intents share the same 1px box; `intentColors.outline` overrides the border color to make it visible. Badge is a non-interactive label, so it reuses `intentColors` (including its `hover:` classes) for vocabulary consistency — the hover states are a harmless no-op on a label. No focus ring or disabled fragment is added.

- [ ] **Step 1: Add the failing tests**

In `src/components/Badge/Badge.test.tsx`, add these two tests inside the `describe('Badge', ...)` block (after the existing `merges a consumer className` test):
```tsx
  it('applies the secondary intent', () => {
    render(<Badge intent="secondary">Tag</Badge>)
    expect(screen.getByText('Tag')).toHaveClass('bg-secondary')
  })

  it('supports the ghost intent', () => {
    render(<Badge intent="ghost">Tag</Badge>)
    expect(screen.getByText('Tag')).toHaveClass('hover:bg-accent')
  })
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/components/Badge/Badge.test.tsx`
Expected: FAIL — `intent` not a valid prop / missing classes.

- [ ] **Step 3: Rewrite the component**

Replace the full contents of `src/components/Badge/Badge.tsx`:
```tsx
import * as React from 'react'
import { Slot } from 'radix-ui'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/cn.js'
import { intentColors } from '../../lib/variants.js'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border border-transparent px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      intent: intentColors,
    },
    defaultVariants: { intent: 'default' },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  /** Render the styles onto the single child element instead of a <span>. */
  asChild?: boolean
}

export function Badge({ className, intent, asChild = false, ...props }: BadgeProps) {
  const Comp = asChild ? Slot.Root : 'span'
  return <Comp className={cn(badgeVariants({ intent }), className)} {...props} />
}

export { badgeVariants }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/components/Badge/Badge.test.tsx`
Expected: PASS (all Badge tests, including the a11y assertion).

- [ ] **Step 5: Update stories to the new API**

Replace the full contents of `src/components/Badge/Badge.stories.tsx`:
```tsx
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Badge } from './Badge'

const meta: Meta<typeof Badge> = {
  title: 'Components/Badge',
  component: Badge,
  args: { children: 'Badge' },
  argTypes: {
    intent: {
      control: 'select',
      options: ['default', 'secondary', 'outline', 'ghost', 'destructive'],
    },
  },
}
export default meta
type Story = StoryObj<typeof Badge>

export const Default: Story = {}
export const Secondary: Story = { args: { intent: 'secondary' } }
export const Outline: Story = { args: { intent: 'outline' } }
export const Ghost: Story = { args: { intent: 'ghost' } }
export const Destructive: Story = { args: { intent: 'destructive' } }
```

- [ ] **Step 6: Typecheck and run the full suite**

Run: `pnpm exec tsc --noEmit && pnpm test`
Expected: no type errors; all tests pass.

- [ ] **Step 7: Commit**

```bash
git add src/components/Badge
git commit -m "feat!: migrate Badge to intent contract, add ghost intent"
```

---

### Task 4: Document the contract and record the changeset

**Files:**
- Modify: `CLAUDE.md`
- Create: `.changeset/variant-contract.md`

**Interfaces:**
- Consumes: the spec at `docs/superpowers/specs/2026-06-30-variant-contract-design.md`.
- Produces: documentation only. No code.

- [ ] **Step 1: Add a "Variant contract" subsection to CLAUDE.md**

In `CLAUDE.md`, immediately after the `### Component pattern (every component follows it)` block, insert:
```markdown
### Variant contract (`src/lib/variants.ts`)
The canonical style vocabulary lives in one internal module — the single source of truth, not exported from the public barrel. Full spec: `docs/superpowers/specs/2026-06-30-variant-contract-design.md`.

- **`intent`** (emphasis): `default`, `secondary`, `outline`, `ghost`, `destructive` — for action/label components (Button, Badge). Never put `intent` on a form field.
- **`size`** (controls): `sm`/`md`/`lg` with shared heights (h-8/h-10/h-12); `icon` is Button-only.
- **State** (form fields): validation is `invalid` via `aria-invalid`, not an intent.
- Components import the fragments (`focusRing`, `disabledControl`, `disabledField`, `invalidField`, `controlSize`, `intentColors`) and compose them in their own `cva` base. They own only their geometry (padding/radius/shape).

When adding or refactoring a component: use only canonical axes/values (never invent variant names), pull state/size/intent strings from `variants.ts` (don't retype them), and add a test asserting variant/size classes plus a story per variant and size.
```

- [ ] **Step 2: Create the changeset**

`.changeset/variant-contract.md`:
```markdown
---
"@nextui-ux/react": minor
---

Establish the canonical variant contract: shared `intent` (default/secondary/outline/ghost/destructive) and `size` (sm/md/lg) vocabulary in an internal `variants` module. **BREAKING (pre-1.0):** the `variant` prop on `Button` and `Badge` is renamed to `intent`. Button gains the `secondary` intent; Badge gains the `ghost` intent.
```

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md .changeset/variant-contract.md
git commit -m "docs: document variant contract and add changeset"
```

---

### Task 5: Update the playground to the renamed prop

The playground consumes the library via tarball; it will not type-check against the new API until re-synced, but its source must not keep the dead `variant` prop. This task changes source only — verifying it requires `../nextUI-UX-playground/sync-lib.sh` (which builds), so do NOT run that here; leave verification to a deliberate sync.

**Files:**
- Modify: `../nextUI-UX-playground/app/page.tsx`
- Modify: `../nextUI-UX-playground/app/theme-switcher.tsx`

**Interfaces:**
- Consumes: `Button`/`Badge` with the `intent` prop (from Tasks 2–3).
- Produces: nothing downstream.

- [ ] **Step 1: Rename the props in `page.tsx`**

In `../nextUI-UX-playground/app/page.tsx`, change these lines:
- `<Button variant="destructive">Destructive</Button>` → `<Button intent="destructive">Destructive</Button>`
- `<Button variant="outline">Outline</Button>` → `<Button intent="outline">Outline</Button>`
- `<Button variant="ghost">Ghost</Button>` → `<Button intent="ghost">Ghost</Button>`
- `<Badge variant="secondary">v0.1.0</Badge>` → `<Badge intent="secondary">v0.1.0</Badge>`
- `<Badge variant="outline">Outline</Badge>` → `<Badge intent="outline">Outline</Badge>`
- `<Button variant="outline">Cerrar</Button>` → `<Button intent="outline">Cerrar</Button>`
- `<Button variant="outline">Hover me</Button>` → `<Button intent="outline">Hover me</Button>`

- [ ] **Step 2: Rename the prop in `theme-switcher.tsx`**

In `../nextUI-UX-playground/app/theme-switcher.tsx`, change:
```tsx
          variant={mounted && theme === t.id ? 'default' : 'outline'}
```
to:
```tsx
          intent={mounted && theme === t.id ? 'default' : 'outline'}
```

- [ ] **Step 3: Verify no stray `variant=` remains**

Run: `rg 'variant=' ../nextUI-UX-playground/app`
Expected: no matches.

- [ ] **Step 4: Commit**

```bash
git -C ../nextUI-UX-playground add app/page.tsx app/theme-switcher.tsx
git -C ../nextUI-UX-playground commit -m "chore: rename Button/Badge variant prop to intent"
```

> Note: the playground is a separate git repo. If it is not under version control, skip the commit and leave the edited files for the next `sync-lib.sh`.

---

## Self-Review

**Spec coverage:**
- Shared module (`src/lib/variants.ts`) → Task 1. ✅
- Two-axis model / intent set / size scale → encoded in Task 1 exports + Global Constraints. ✅
- Button migration (consume module, gain `secondary`) → Task 2. ✅
- Badge migration (consume module, gain `ghost`, reconcile `outline` to `border-input`) → Task 3. ✅
- Rename `variant` → `intent` (locked decision) → Tasks 2, 3, 5. ✅
- Development checklist documented where future work sees it → Task 4 (CLAUDE.md). ✅
- States contract (focus/disabled/invalid) → exported in Task 1; `invalidField`/`disabledField` are seeded now for the Field components built in a later pass (out of scope here, per spec YAGNI). ✅
- Card/Dialog `surface`, Checkbox/Switch `size`, Input `invalid`+`size` → explicitly out of scope this pass (spec YAGNI); module is seeded to absorb them. ✅
- Changeset → Task 4. ✅

**Placeholder scan:** No TBD/TODO; every code step shows full code; every command shows expected output. ✅

**Type consistency:** `intent`/`size` prop names, `intentColors`/`controlSize`/`focusRing`/`disabledControl` identifiers, and exported `buttonVariants`/`badgeVariants` names are consistent across Tasks 1–3 and 5. ✅

**Note on `invalidField`/`disabledField`:** exported in Task 1 but not consumed until the Field components (Input et al.) are built in a follow-up. The contract test in Task 1 does not assert them, so no unused-symbol failure occurs (they are exported module members, allowed under `noUnusedLocals`).
