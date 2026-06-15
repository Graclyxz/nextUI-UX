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
