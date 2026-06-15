import type { Preview } from '@storybook/react'
import * as React from 'react'
import '../src/styles.css'

// Theme toolbar drives the same data-theme attribute the library reads at runtime.
const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'Active theme',
      defaultValue: 'classic-light',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        dynamicTitle: true,
        items: [
          { value: 'classic-light', title: 'Classic Light' },
          { value: 'classic-dark', title: 'Classic Dark' },
          { value: 'purple-night', title: 'Purple Night' },
        ],
      },
    },
  },
  decorators: [
    (Story, context) => {
      document.documentElement.setAttribute('data-theme', context.globals.theme)
      return (
        <div className="bg-background text-foreground min-h-40 p-8">
          <Story />
        </div>
      )
    },
  ],
  parameters: { backgrounds: { disable: true } },
}

export default preview
