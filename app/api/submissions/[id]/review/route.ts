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
  const body = await req.json()
  const result = validateReviewInput(body)

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status })
  }

  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('submissions')
    .update({
      status: 'reviewed',
      feedback: result.feedback,
      grade: result.grade,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
