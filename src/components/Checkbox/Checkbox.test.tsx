import { describe, it, expect, vi } from 'vitest'
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

  it('respects a controlled checked state', async () => {
    const onCheckedChange = vi.fn()
    render(<Checkbox checked aria-label="Accept terms" onCheckedChange={onCheckedChange} />)
    const box = screen.getByRole('checkbox', { name: 'Accept terms' })
    expect(box).toHaveAttribute('data-state', 'checked')
    await userEvent.click(box)
    expect(onCheckedChange).toHaveBeenCalledWith(false)
    expect(box).toHaveAttribute('data-state', 'checked')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<Checkbox aria-label="Accept terms" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
