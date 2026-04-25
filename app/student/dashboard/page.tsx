import Link from 'next/link'
import { getUser } from '@/lib/auth'
import { getSupabase } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { AssignmentWithStatus } from '@/lib/types'
import { StatusBadge } from '@/components/status-badge'
import { EmptyState } from '@/components/empty-state'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { BookOpen, ChevronRight } from 'lucide-react'

async function getAssignments(studentId: string): Promise<AssignmentWithStatus[]> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('assignments')
    .select('*, submissions!left(id, content, status, feedback)')
    .eq('assigned_to', studentId)
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data as any[]).map(a => {
    const sub = a.submissions?.[0] ?? null
    return {
      ...a,
      status: sub ? sub.status : 'pending',
      submission_id: sub?.id ?? null,
      submitted_content: sub?.content ?? null,
      feedback: sub?.feedback ?? null,
      submissions: undefined,
    }
  })
}

export default async function StudentDashboard() {
  const user = await getUser()
  if (!user) redirect('/login')

  const assignments = await getAssignments(user.id)
  const reviewed = assignments.filter(a => a.status === 'reviewed').length
  const total = assignments.length

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user.name.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-500 mt-1">Here are your assignments</p>
      </div>

      {total > 0 && (
        <div className="mb-8 p-4 bg-white rounded-lg border">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{reviewed} of {total} completed</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all"
              style={{ width: `${total > 0 ? (reviewed / total) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {assignments.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No assignments yet"
          description="Your mentor hasn't assigned anything yet. Check back soon."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {assignments.map(a => (
            <Card key={a.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base leading-snug">{a.title}</CardTitle>
                  <StatusBadge status={a.status} />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 line-clamp-2 mb-4">{a.description}</p>
                <Link href={`/student/assignment/${a.id}`} className={cn(buttonVariants({ size: 'sm', variant: 'outline' }), 'w-full inline-flex items-center justify-center gap-1')}>
                  {a.status === 'pending' ? 'Start' : 'View'}
                  <ChevronRight className="h-3 w-3 ml-1" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
