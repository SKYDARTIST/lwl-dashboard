import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { validateReviewInput } from '@/lib/review-validation'
import { appendMutation, getDemoState } from '@/lib/demo/store'
import { isSameOrigin } from '@/lib/csrf'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const user = await getUser()
  if (!user || user.role !== 'mentor') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  let body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const result = validateReviewInput(body)
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status })
  }

  const state = await getDemoState()
  const submission = state.submissions.find(s => s.id === id)
  if (!submission) {
    return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
  }
  if (submission.status === 'reviewed') {
    return NextResponse.json({ error: 'Already reviewed' }, { status: 409 })
  }

  const isMentorOfStudent = state.mentor_students.some(
    link => link.mentor_id === user.id && link.student_id === submission.student_id,
  )
  if (!isMentorOfStudent) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const reviewed_at = new Date().toISOString()
  const updated = {
    ...submission,
    status: 'reviewed' as const,
    feedback: result.feedback,
    grade: result.grade ?? null,
    reviewed_at,
  }

  const res = NextResponse.json(updated)
  await appendMutation(
    { t: 'review', submission_id: id, feedback: result.feedback, grade: result.grade ?? null, reviewed_at },
    res,
  )
  return res
}
