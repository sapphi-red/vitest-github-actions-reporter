import { it, expect } from 'vitest'

throw new Error('error in file')

it('dummy', () => {
  expect(true).toBe(true)
})
