import { getUser } from '@/lib/auth'
import { getSupabase } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { EmptyState } from '@/components/empty-state'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Users } from 'lucide-react'

async function getStudentsWithStats(mentorId: string) {
  const supabase = getSupabase()

  const { data: links } = await supabase
    .from('mentor_students')
    .select('student_id, users!mentor_students_student_id_fkey(id, name, email)')
    .eq('mentor_id', mentorId)

  if (!links || links.length === 0) return []

  const students = links.map((l: any) => l.users)

  const stats = await Promise.all(
    students.map(async (student: any) => {
      const { data: assignments } = await supabase
        .from('assignments')
        .select('id, submissions!left(status)')
        .eq('assigned_to', student.id)
        .eq('created_by', mentorId)

      let pending = 0, submitted = 0, reviewed = 0
      for (const a of assignments ?? []) {
        const sub = (a as any).submissions?.[0]
        if (!sub) pending++
        else if (sub.status === 'submitted') submitted++
        else reviewed++
      }

      return { ...student, pending, submitted, reviewed, total: (assignments ?? []).length }
    })
  )

  return stats
}

export default async function MentorDashboard() {
  const user = await getUser()
  if (!user) redirect('/login')

  const students = await getStudentsWithStats(user.id)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Students</h1>
        <p className="text-gray-500 mt-1">
          {students.length} student{students.length !== 1 ? 's' : ''} assigned to you
        </p>
      </div>

      {students.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No students yet"
          description="No students have been assigned to you yet."
        />
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead className="text-center">Pending</TableHead>
                <TableHead className="text-center">Submitted</TableHead>
                <TableHead className="text-center">Reviewed</TableHead>
                <TableHead className="text-center">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((s: any) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900">{s.name}</p>
                      <p className="text-sm text-gray-500">{s.email}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {s.pending > 0
                      ? <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">{s.pending}</Badge>
                      : <span className="text-gray-400">—</span>}
                  </TableCell>
                  <TableCell className="text-center">
                    {s.submitted > 0
                      ? <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">{s.submitted}</Badge>
                      : <span className="text-gray-400">—</span>}
                  </TableCell>
                  <TableCell className="text-center">
                    {s.reviewed > 0
                      ? <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">{s.reviewed}</Badge>
                      : <span className="text-gray-400">—</span>}
                  </TableCell>
                  <TableCell className="text-center text-gray-600">{s.total}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
