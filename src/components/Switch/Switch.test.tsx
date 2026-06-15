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
