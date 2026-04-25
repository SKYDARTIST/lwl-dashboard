import Link from 'next/link'
import { getUser } from '@/lib/auth'
import { getSupabase } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { EmptyState } from '@/components/empty-state'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ClipboardList, ChevronRight } from 'lucide-react'

async function getPendingSubmissions(mentorId: string) {
  const supabase = getSupabase()

  const { data: links } = await supabase
    .from('mentor_students')
    .select('student_id')
    .eq('mentor_id', mentorId)

  if (!links || links.length === 0) return []
  const studentIds = links.map((l: any) => l.student_id)

  const { data, error } = await supabase
    .from('submissions')
    .select(`
      id, content, status, submitted_at,
      assignments!inner(id, title, description),
      users!submissions_student_id_fkey(id, name)
    `)
    .in('student_id', studentIds)
    .eq('status', 'submitted')
    .order('submitted_at', { ascending: true })

  if (error) throw error
  return data ?? []
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const h = Math.floor(diff / 3600000)
  if (h < 1) return 'just now'
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default async function MentorQueue() {
  const user = await getUser()
  if (!user) redirect('/login')

  const submissions = await getPendingSubmissions(user.id)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Review Queue</h1>
        <p className="text-gray-500 mt-1">
          {submissions.length === 0
            ? "You're all caught up!"
            : `${submissions.length} submission${submissions.length !== 1 ? 's' : ''} awaiting review`}
        </p>
      </div>

      {submissions.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Queue is empty"
          description="No submissions waiting for review. Nice work!"
        />
      ) : (
        <div className="space-y-3">
          {(submissions as any[]).map(s => (
            <Card key={s.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">{s.assignments.title}</p>
                  <p className="text-sm text-gray-500">
                    {s.users.name} · submitted {timeAgo(s.submitted_at)}
                  </p>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-1">{s.content}</p>
                </div>
                <Button asChild size="sm" className="ml-4 shrink-0">
                  <Link href={`/mentor/review/${s.id}`}>
                    Review <ChevronRight className="h-3 w-3 ml-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
