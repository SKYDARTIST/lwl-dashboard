export const VALID_GRADES = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F'] as const
export type Grade = typeof VALID_GRADES[number]

export type ReviewInput = {
  feedback?: string
  grade?: string
}

export type ValidationResult =
  | { ok: true; feedback: string; grade: Grade | null }
  | { ok: false; error: string; status: 400 }

export function validateReviewInput(input: ReviewInput): ValidationResult {
  if (!input.feedback?.trim()) {
    return { ok: false, error: 'Feedback is required', status: 400 }
  }

  if (input.grade && !(VALID_GRADES as readonly string[]).includes(input.grade)) {
    return { ok: false, error: 'Invalid grade', status: 400 }
  }

  return {
    ok: true,
    feedback: input.feedback.trim(),
    grade: (input.grade as Grade) ?? null,
  }
}
