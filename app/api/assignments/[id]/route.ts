import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { getSupabase } from '@/lib/supabase/server'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('assignments')
    .select('*, submissions!left(id, content, status, feedback)')
    .eq('id', id)
    .eq('assigned_to', user.id)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const sub = (data as any).submissions?.[0] ?? null
  return NextResponse.json({
    ...data,
    status: sub ? sub.status : 'pending',
    submission_id: sub?.id ?? null,
    submitted_content: sub?.content ?? null,
    feedback: sub?.feedback ?? null,
    submissions: undefined,
  })
}
