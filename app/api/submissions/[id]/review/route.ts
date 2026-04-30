import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { getSupabase } from '@/lib/supabase/server'
import { validateReviewInput } from '@/lib/review-validation'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

  const supabase = getSupabase()

  // Fetch submission and verify it belongs to one of this mentor's students
  const { data: submission } = await supabase
    .from('submissions')
    .select('student_id, status')
    .eq('id', id)
    .single()

  if (!submission) {
    return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
  }

  if (submission.status === 'reviewed') {
    return NextResponse.json({ error: 'Already reviewed' }, { status: 409 })
  }

  const { data: link } = await supabase
    .from('mentor_students')
    .select('student_id')
    .eq('mentor_id', user.id)
    .eq('student_id', submission.student_id)
    .single()

  if (!link) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data, error } = await supabase
    .from('submissions')
    .update({
      status: 'reviewed',
      feedback: result.feedback,
      grade: result.grade,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('status', 'submitted')
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
