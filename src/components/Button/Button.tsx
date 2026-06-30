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
      size: { ...controlSize, icon: 'h-10 w-10 text-sm' },
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
