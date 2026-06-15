import { describe, it, expect, vi } from 'vitest'
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

  it('respects a controlled checked state', async () => {
    const onCheckedChange = vi.fn()
    render(<Switch checked aria-label="Notifications" onCheckedChange={onCheckedChange} />)
    const toggle = screen.getByRole('switch', { name: 'Notifications' })
    expect(toggle).toHaveAttribute('data-state', 'checked')
    await userEvent.click(toggle)
    expect(onCheckedChange).toHaveBeenCalledWith(false)
    expect(toggle).toHaveAttribute('data-state', 'checked')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<Switch aria-label="Notifications" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
