import { describe, it, expect } from 'vitest'
import { focusRing, controlSize, intentColors, disabledControl, disabledField, invalidField } from './variants'

describe('variants contract', () => {
  it('exposes the 5 canonical intents in order', () => {
    expect(Object.keys(intentColors)).toEqual([
      'default',
      'secondary',
      'outline',
      'ghost',
      'destructive',
    ])
  })

  it('exposes the 3 canonical control sizes', () => {
    expect(Object.keys(controlSize)).toEqual(['sm', 'md', 'lg'])
  })

  it('uses semantic tokens, not raw hex', () => {
    const all = [focusRing, ...Object.values(controlSize), ...Object.values(intentColors)].join(' ')
    expect(all).not.toMatch(/#[0-9a-fA-F]{3,8}/)
  })

  it('ties the focus ring to the ring token', () => {
    expect(focusRing).toContain('focus-visible:ring-ring')
  })

  it('disabled and invalid fragments are semantic, not raw hex', () => {
    const all = [disabledControl, disabledField, invalidField].join(' ')
    expect(all).not.toMatch(/#[0-9a-fA-F]{3,8}/)
  })
})
