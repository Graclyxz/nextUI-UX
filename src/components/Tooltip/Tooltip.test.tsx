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
