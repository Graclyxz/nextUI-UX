import type { Meta, StoryObj } from '@storybook/react-vite'
import { Badge } from './Badge'

const meta: Meta<typeof Badge> = {
  title: 'Components/Badge',
  component: Badge,
  args: { children: 'Badge' },
  argTypes: {
    variant: { control: 'select', options: ['default', 'secondary', 'destructive', 'outline'] },
  },
}
export default meta
type Story = StoryObj<typeof Badge>

export const Default: Story = {}
export const Secondary: Story = { args: { variant: 'secondary' } }
export const Destructive: Story = { args: { variant: 'destructive' } }
export const Outline: Story = { args: { variant: 'outline' } }
