import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { appendMutation, getDemoState, newId } from '@/lib/demo/store'
import { isSameOrigin } from '@/lib/csrf'

const MAX_TITLE_LENGTH = 160
const MAX_DESCRIPTION_LENGTH = 5000

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const user = await getUser()
  if (!user || user.role !== 'mentor') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { title?: unknown; description?: unknown; assigned_to?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { title, description, assigned_to } = body

  if (typeof title !== 'string' || typeof description !== 'string' || typeof assigned_to !== 'string' || !title.trim() || !description.trim() || !assigned_to) {
    return NextResponse.json({ error: 'title, description, and assigned_to are required' }, { status: 400 })
  }

  if (title.trim().length > MAX_TITLE_LENGTH) {
    return NextResponse.json({ error: `Title too long (max ${MAX_TITLE_LENGTH} chars)` }, { status: 400 })
  }

  if (description.trim().length > MAX_DESCRIPTION_LENGTH) {
    return NextResponse.json({ error: `Description too long (max ${MAX_DESCRIPTION_LENGTH} chars)` }, { status: 400 })
  }

  const state = await getDemoState()
  const isLinked = state.mentor_students.some(
    link => link.mentor_id === user.id && link.student_id === assigned_to,
  )
  if (!isLinked) {
    return NextResponse.json({ error: 'Student not assigned to you' }, { status: 403 })
  }

  const created = {
    id: newId('a'),
    title: title.trim(),
    description: description.trim(),
    created_by: user.id,
    assigned_to,
    created_at: new Date().toISOString(),
  }

  const res = NextResponse.json(created, { status: 201 })
  await appendMutation(
    { t: 'assign', ...created },
    res,
  )
  return res
}
