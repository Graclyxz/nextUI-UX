import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './Button'

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  args: { children: 'Button' },
  argTypes: {
    variant: { control: 'select', options: ['default', 'destructive', 'outline', 'ghost'] },
    size: { control: 'select', options: ['sm', 'md', 'lg', 'icon'] },
  },
}
export default meta
type Story = StoryObj<typeof Button>

export const Default: Story = {}
export const Destructive: Story = { args: { variant: 'destructive' } }
export const Outline: Story = { args: { variant: 'outline' } }
export const Ghost: Story = { args: { variant: 'ghost' } }
