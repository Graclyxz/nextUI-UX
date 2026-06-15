import type { Meta, StoryObj } from '@storybook/react-vite'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './Card'
import { Button } from '../Button/Button'

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
}
export default meta
type Story = StoryObj<typeof Card>

export const Default: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Account</CardTitle>
        <CardDescription>Manage your preferences.</CardDescription>
      </CardHeader>
      <CardContent>Card body content goes here.</CardContent>
      <CardFooter>
        <Button>Save</Button>
      </CardFooter>
    </Card>
  ),
}
