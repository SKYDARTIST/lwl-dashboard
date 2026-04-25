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
    return NextResponse.json({ error: 'assignment_id and content are required' }, { status: 400 })
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
