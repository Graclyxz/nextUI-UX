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
