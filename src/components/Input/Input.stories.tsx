import type { Meta, StoryObj } from '@storybook/react-vite'
import { Input } from './Input'

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  args: { placeholder: 'Type here...', 'aria-label': 'Demo input' },
}
export default meta
type Story = StoryObj<typeof Input>

export const Default: Story = {}
export const Disabled: Story = { args: { disabled: true } }
export const Email: Story = { args: { type: 'email', placeholder: 'you@example.com' } }
