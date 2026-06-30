import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './Button'

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  args: { children: 'Button' },
  argTypes: {
    intent: {
      control: 'select',
      options: ['default', 'secondary', 'outline', 'ghost', 'destructive'],
    },
    size: { control: 'select', options: ['sm', 'md', 'lg', 'icon'] },
  },
}
export default meta
type Story = StoryObj<typeof Button>

export const Default: Story = {}
export const Secondary: Story = { args: { intent: 'secondary' } }
export const Outline: Story = { args: { intent: 'outline' } }
export const Ghost: Story = { args: { intent: 'ghost' } }
export const Destructive: Story = { args: { intent: 'destructive' } }
