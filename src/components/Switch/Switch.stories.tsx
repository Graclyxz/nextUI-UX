import type { Meta, StoryObj } from '@storybook/react-vite'
import { Switch } from './Switch'

const meta: Meta<typeof Switch> = {
  title: 'Components/Switch',
  component: Switch,
  args: { 'aria-label': 'Notifications' },
}
export default meta
type Story = StoryObj<typeof Switch>

export const Default: Story = {}
export const Checked: Story = { args: { defaultChecked: true } }
export const Disabled: Story = { args: { disabled: true } }
