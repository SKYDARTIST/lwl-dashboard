import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { getSupabase } from '@/lib/supabase/server'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('submissions')
    .select(`
      id, content, status, feedback, submitted_at,
      assignments!inner(id, title, description),
      users!submissions_student_id_fkey(id, name)
    `)
    .eq('id', id)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(data)
}
