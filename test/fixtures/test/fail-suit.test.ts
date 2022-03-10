import { describe, it, expect } from 'vitest'

describe('fail suit', () => {
  throw new Error('suite error')

  it('dummy', () => {
    expect(true).toBe(true)
  })
})
