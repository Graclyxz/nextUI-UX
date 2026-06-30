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
