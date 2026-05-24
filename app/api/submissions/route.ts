import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { appendMutation, getDemoState, newId } from '@/lib/demo/store'
import { isSameOrigin } from '@/lib/csrf'

const MAX_CONTENT_LENGTH = 10000

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const user = await getUser()
  if (!user || user.role !== 'student') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { assignment_id?: unknown; content?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { assignment_id, content } = body
  if (typeof assignment_id !== 'string' || typeof content !== 'string' || !assignment_id || !content.trim()) {
    return NextResponse.json({ error: 'assignment_id and content are required' }, { status: 400 })
  }

  if (content.trim().length > MAX_CONTENT_LENGTH) {
    return NextResponse.json({ error: 'Content too long (max 10,000 chars)' }, { status: 400 })
  }

  const state = await getDemoState()
  const assignment = state.assignments.find(a => a.id === assignment_id && a.assigned_to === user.id)
  if (!assignment) {
    return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
  }

  const existing = state.submissions.find(
    s => s.assignment_id === assignment_id && s.student_id === user.id,
  )
  if (existing) {
    return NextResponse.json({ error: 'Already submitted' }, { status: 409 })
  }

  const created = {
    id: newId('s'),
    assignment_id,
    student_id: user.id,
    content: content.trim(),
    submitted_at: new Date().toISOString(),
  }

  const res = NextResponse.json({ ...created, status: 'submitted' }, { status: 201 })
  await appendMutation({ t: 'submit', ...created }, res)
  return res
}
