import type { Meta, StoryObj } from '@storybook/react-vite'
import { Badge } from './Badge'

const meta: Meta<typeof Badge> = {
  title: 'Components/Badge',
  component: Badge,
  args: { children: 'Badge' },
  argTypes: {
    intent: {
      control: 'select',
      options: ['default', 'secondary', 'outline', 'ghost', 'destructive'],
    },
  },
}
export default meta
type Story = StoryObj<typeof Badge>

export const Default: Story = {}
export const Secondary: Story = { args: { intent: 'secondary' } }
export const Outline: Story = { args: { intent: 'outline' } }
export const Ghost: Story = { args: { intent: 'ghost' } }
export const Destructive: Story = { args: { intent: 'destructive' } }
