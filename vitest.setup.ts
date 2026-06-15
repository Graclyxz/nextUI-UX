import '@testing-library/jest-dom/vitest'
// Type augmentation only: vitest-axe 0.1.0 extend-expect.js is empty at runtime.
import type {} from 'vitest-axe/extend-expect'
import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => cleanup())

// vitest-axe 0.1.0 ships with an empty extend-expect.js; register the matcher lazily.
expect.extend({
  async toHaveNoViolations(received: import('axe-core').AxeResults) {
    const { toHaveNoViolations: matcher } = await import('vitest-axe/matchers')
    // @ts-ignore — call the matcher in the right context
    return matcher.call(this, received)
  },
})
