import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { getSupabase } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const user = await getUser()
  if (!user || user.role !== 'mentor') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { title, description, assigned_to } = await req.json()

  if (!title?.trim() || !description?.trim() || !assigned_to) {
    return NextResponse.json({ error: 'title, description, and assigned_to are required' }, { status: 400 })
  }

  const supabase = getSupabase()

  // Verify the student is actually assigned to this mentor
  const { data: link } = await supabase
    .from('mentor_students')
    .select('student_id')
    .eq('mentor_id', user.id)
    .eq('student_id', assigned_to)
    .single()

  if (!link) {
    return NextResponse.json({ error: 'Student not assigned to you' }, { status: 403 })
  }

  const { data, error } = await supabase
    .from('assignments')
    .insert({
      title: title.trim(),
      description: description.trim(),
      created_by: user.id,
      assigned_to,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
