import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { Button } from './Button'

describe('Button', () => {
  it('renders its label', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('fires onClick when pressed', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Go</Button>)
    await userEvent.click(screen.getByRole('button', { name: 'Go' }))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('applies variant and size utility classes', () => {
    render(
      <Button variant="destructive" size="lg">
        Delete
      </Button>,
    )
    const button = screen.getByRole('button', { name: 'Delete' })
    expect(button).toHaveClass('bg-destructive')
    expect(button).toHaveClass('h-12')
  })

  it('ignores clicks when disabled', async () => {
    const onClick = vi.fn()
    render(
      <Button disabled onClick={onClick}>
        Go
      </Button>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Go' }))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<Button>Accessible</Button>)
    expect(await axe(container)).toHaveNoViolations()
  })
})
