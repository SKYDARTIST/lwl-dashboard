import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { getSupabase } from '@/lib/supabase/server'

const MAX_CONTENT_LENGTH = 10000

export async function POST(req: NextRequest) {
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

  const supabase = getSupabase()

  // Verify assignment belongs to this student
  const { data: assignment } = await supabase
    .from('assignments')
    .select('id')
    .eq('id', assignment_id)
    .eq('assigned_to', user.id)
    .single()

  if (!assignment) {
    return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
  }

  // Prevent duplicate submissions
  const { data: existing } = await supabase
    .from('submissions')
    .select('id')
    .eq('assignment_id', assignment_id)
    .eq('student_id', user.id)
    .single()

  if (existing) {
    return NextResponse.json({ error: 'Already submitted' }, { status: 409 })
  }

  const { data, error } = await supabase
    .from('submissions')
    .insert({ assignment_id, student_id: user.id, content: content.trim(), status: 'submitted' })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
