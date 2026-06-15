import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs'

function Demo() {
  return (
    <Tabs defaultValue="one">
      <TabsList>
        <TabsTrigger value="one">One</TabsTrigger>
        <TabsTrigger value="two">Two</TabsTrigger>
      </TabsList>
      <TabsContent value="one">Panel one</TabsContent>
      <TabsContent value="two">Panel two</TabsContent>
    </Tabs>
  )
}

describe('Tabs', () => {
  it('shows the default panel', () => {
    render(<Demo />)
    expect(screen.getByText('Panel one')).toBeVisible()
  })

  it('switches panel on tab click', async () => {
    render(<Demo />)
    await userEvent.click(screen.getByRole('tab', { name: 'Two' }))
    expect(screen.getByText('Panel two')).toBeVisible()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<Demo />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
