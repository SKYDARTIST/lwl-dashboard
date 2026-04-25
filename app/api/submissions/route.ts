import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { getSupabase } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const user = await getUser()
  if (!user || user.role !== 'student') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { assignment_id, content } = await req.json()

  if (!assignment_id || !content?.trim()) {
    return NextResponse.json({ error: 'Assignment ID and content are required' }, { status: 400 })
  }

  const supabase = getSupabase()

  const { data: assignment } = await supabase
    .from('assignments')
    .select('id')
    .eq('id', assignment_id)
    .eq('assigned_to', user.id)
    .single()

  if (!assignment) {
    return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
  }

  const { error } = await supabase.from('submissions').upsert({
    assignment_id,
    student_id: user.id,
    content: content.trim(),
    status: 'submitted',
    submitted_at: new Date().toISOString(),
  }, { onConflict: 'assignment_id,student_id' })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
