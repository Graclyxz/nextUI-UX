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
