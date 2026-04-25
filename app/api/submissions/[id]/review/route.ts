import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { getSupabase } from '@/lib/supabase/server'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser()
  if (!user || user.role !== 'mentor') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { feedback } = await req.json()
  if (!feedback?.trim()) {
    return NextResponse.json({ error: 'Feedback is required' }, { status: 400 })
  }

  const { id } = await params
  const supabase = getSupabase()

  const { data: submission } = await supabase
    .from('submissions')
    .select('id, student_id')
    .eq('id', id)
    .single()

  if (!submission) {
    return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
  }

  const { data: link } = await supabase
    .from('mentor_students')
    .select('mentor_id')
    .eq('mentor_id', user.id)
    .eq('student_id', submission.student_id)
    .single()

  if (!link) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { error } = await supabase
    .from('submissions')
    .update({
      feedback: feedback.trim(),
      status: 'reviewed',
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
