import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { Badge } from './Badge'

describe('Badge', () => {
  it('renders its content', () => {
    render(<Badge>New</Badge>)
    expect(screen.getByText('New')).toBeInTheDocument()
  })

  it('merges a consumer className', () => {
    render(<Badge className="custom-x">Tag</Badge>)
    expect(screen.getByText('Tag')).toHaveClass('custom-x')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<Badge>Status</Badge>)
    expect(await axe(container)).toHaveNoViolations()
  })
})
