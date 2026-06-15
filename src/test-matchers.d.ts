// Global matcher augmentations so jest-dom and axe assertions type-check everywhere.
import '@testing-library/jest-dom/vitest'

interface AxeMatchers<R = unknown> {
  toHaveNoViolations(): R
}

declare module 'vitest' {
  interface Assertion<T = any> extends AxeMatchers<T> {}
  interface AsymmetricMatchersContaining extends AxeMatchers {}
}
