import { describe, it, expect } from 'vitest'
import { validateReviewInput, VALID_GRADES } from '../lib/review-validation'

describe('validateReviewInput', () => {
  // --- feedback validation ---

  it('rejects empty feedback', () => {
    const result = validateReviewInput({ feedback: '' })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toBe('Feedback is required')
      expect(result.status).toBe(400)
    }
  })

  it('rejects whitespace-only feedback', () => {
    const result = validateReviewInput({ feedback: '   ' })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBe('Feedback is required')
  })

  it('rejects missing feedback', () => {
    const result = validateReviewInput({})
    expect(result.ok).toBe(false)
  })

  it('accepts valid feedback and trims whitespace', () => {
    const result = validateReviewInput({ feedback: '  Great work!  ' })
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.feedback).toBe('Great work!')
  })

  // --- grade validation ---

  it('accepts no grade (optional)', () => {
    const result = validateReviewInput({ feedback: 'Good job' })
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.grade).toBeNull()
  })

  it('accepts every valid grade', () => {
    for (const grade of VALID_GRADES) {
      const result = validateReviewInput({ feedback: 'Good job', grade })
      expect(result.ok).toBe(true)
      if (result.ok) expect(result.grade).toBe(grade)
    }
  })

  it('rejects an invalid grade string', () => {
    const result = validateReviewInput({ feedback: 'Good job', grade: 'Z' })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toBe('Invalid grade')
      expect(result.status).toBe(400)
    }
  })

  it('rejects a numeric-string grade', () => {
    const result = validateReviewInput({ feedback: 'Good job', grade: '95' })
    expect(result.ok).toBe(false)
  })

  // --- combined happy path ---

  it('returns trimmed feedback and grade on full valid input', () => {
    const result = validateReviewInput({ feedback: ' Solid submission. ', grade: 'A+' })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.feedback).toBe('Solid submission.')
      expect(result.grade).toBe('A+')
    }
  })
})
