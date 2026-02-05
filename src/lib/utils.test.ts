import { describe, expect, it } from 'vitest'
import { cn } from './utils'

describe('utils', () => {
  describe('cn', () => {
    it('should merge class names correctly', () => {
      expect(cn('px-4', 'py-2')).toBe('px-4 py-2')
    })

    it('should handle conditional classes', () => {
      const condition = Math.random() > 1 // Always false but TS can't tell
      expect(cn('px-4', condition && 'py-2', 'bg-blue')).toBe('px-4 bg-blue')
    })

    it('should merge conflicting tailwind classes', () => {
      const result = cn('px-2', 'px-4')
      expect(result).toBe('px-4')
    })

    it('should handle empty input', () => {
      expect(cn()).toBe('')
    })

    it('should handle undefined and null values', () => {
      expect(cn('px-4', undefined, null, 'py-2')).toBe('px-4 py-2')
    })
  })
})
