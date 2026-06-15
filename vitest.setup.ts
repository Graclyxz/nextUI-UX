import '@testing-library/jest-dom/vitest'
import 'vitest-axe/extend-expect'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => cleanup())
