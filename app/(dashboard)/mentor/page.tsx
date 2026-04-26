import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FileText, Users, Inbox, CheckCircle } from 'lucide-react'
import { getUser } from '@/lib/auth'
import { getSupabase } from '@/lib/supabase/server'
import dynamic from 'next/dynamic'
import { ReviewForm } from './ReviewForm'

const StudentDetailSection = dynamic(
  () => import('./StudentDetailSection').then(m => m.StudentDetailSection),
  { ssr: false }
)

export default async function MentorDashboard({
  searchParams,
}: {
  searchParams: Promise<{ s?: string; st?: string; filter?: string }>
}) {
  const user = await getUser()
  if (!user) redirect('/login')
  if (user.role !== 'mentor') redirect('/student')

  const supabase = getSupabase()
  const params = await searchParams

  // Step 1: mentor's student IDs
  const { data: links } = await supabase
    .from('mentor_students')
    .select('student_id')
    .eq('mentor_id', user.id)
  const studentIds = (links ?? []).map(l => l.student_id)

  // Steps 2-4: students, assignments, submissions in parallel
  const [{ data: students }, { data: assignments }, { data: submissions }] = await Promise.all([
    studentIds.length > 0
      ? supabase.from('users').select('id, name, email').in('id', studentIds)
      : Promise.resolve({ data: [] }),
    studentIds.length > 0
      ? supabase.from('assignments').select('id, title, description, assigned_to, created_at').in('assigned_to', studentIds)
      : Promise.resolve({ data: [] }),
    studentIds.length > 0
      ? supabase.from('submissions').select('id, assignment_id, student_id, content, status, feedback, submitted_at, reviewed_at').in('student_id', studentIds).order('submitted_at', { ascending: false })
      : Promise.resolve({ data: [] }),
  ])

  // Student stats
  const studentStats = (students ?? []).map(s => {
    const sAssignments = (assignments ?? []).filter(a => a.assigned_to === s.id)
    const sSubs = (submissions ?? []).filter(sub => sub.student_id === s.id)
    return {
      ...s,
      total: sAssignments.length,
      pending: sAssignments.length - sSubs.length,
      submitted: sSubs.filter(sub => sub.status === 'submitted').length,
      reviewed: sSubs.filter(sub => sub.status === 'reviewed').length,
    }
  })

  // Queue: submissions awaiting review, enriched
  const queue = (submissions ?? [])
    .filter(sub => sub.status === 'submitted')
    .map(sub => ({
      ...sub,
      assignment: (assignments ?? []).find(a => a.id === sub.assignment_id) ?? null,
      student: (students ?? []).find(s => s.id === sub.student_id) ?? null,
    }))

  // Selected student filter
  const selectedStudentId = params.st ?? null
  const selectedFilter = (params.filter ?? null) as 'pending' | 'submitted' | 'reviewed' | null

  // Full assignment breakdown for selected student
  const studentDetail = selectedStudentId
    ? {
        student: studentStats.find(s => s.id === selectedStudentId) ?? null,
        assignments: (assignments ?? [])
          .filter(a => a.assigned_to === selectedStudentId)
          .map(a => {
            const sub = (submissions ?? []).find(s => s.assignment_id === a.id) ?? null
            return { ...a, status: (sub?.status ?? 'pending') as 'pending' | 'submitted' | 'reviewed', submission: sub }
          })
          .filter(a => !selectedFilter || a.status === selectedFilter),
      }
    : null

  // Queue filtered by selected student if ?st= is set
  const visibleQueue = selectedStudentId
    ? queue.filter(sub => sub.student_id === selectedStudentId)
    : queue

  // Selected submission (can be any submission, not just queued)
  const selectedId = params.s
  const selected = selectedId
    ? (submissions ?? [])
        .map(sub => ({
          ...sub,
          assignment: (assignments ?? []).find(a => a.id === sub.assignment_id) ?? null,
          student: (students ?? []).find(s => s.id === sub.student_id) ?? null,
        }))
        .find(sub => sub.id === selectedId) ?? null
    : null

  // Summary stats
  const totalStudents = studentStats.length
  const totalQueue = queue.length
  const totalReviewed = (submissions ?? []).filter(s => s.status === 'reviewed').length

  return (
    <>
      {/* Center column */}
      <main className="flex-[6] p-10 overflow-y-auto flex flex-col gap-8 bg-nexus-card custom-scrollbar">

        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-[28px] font-extrabold tracking-tight text-nexus-text">Dashboard</h1>
            <p className="text-sm text-nexus-muted mt-0.5">Welcome back, {user.name.split(' ')[0]}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-pink-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
              {user.name.charAt(0)}
            </div>
            <span className="font-bold text-[15px] text-nexus-text">{user.name.split(' ')[0]}</span>
          </div>
        </header>

        {/* Students list */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[22px] font-extrabold tracking-tight text-nexus-text">Your Students</h2>
            <span className="text-xs text-nexus-muted font-semibold">{totalStudents} assigned</span>
          </div>

          {studentStats.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-nexus-muted gap-3">
              <Users size={32} className="opacity-30" />
              <p className="text-sm">No students assigned yet.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {studentStats.map(s => {
                const isActive = selectedStudentId === s.id
                return (
                  <div
                    key={s.id}
                    className={`flex items-center p-4 px-5 rounded-xl border transition-all ${
                      isActive
                        ? 'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-300 dark:border-indigo-700'
                        : 'bg-nexus-card border-nexus-border'
                    }`}
                  >
                    <Link
                      href={isActive ? '/mentor' : `/mentor?st=${s.id}`}
                      className="flex items-center mr-4 shrink-0"
                    >
                      <div className="w-11 h-11 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center font-bold text-sm">
                        {s.name.charAt(0)}
                      </div>
                    </Link>
                    <Link
                      href={isActive ? '/mentor' : `/mentor?st=${s.id}`}
                      className="font-bold text-[15px] flex-[2] text-nexus-text hover:text-indigo-500 transition-colors"
                    >
                      {s.name}
                    </Link>
                    <div className="flex gap-2 text-[12px] font-semibold flex-[2]">
                      {([
                        { label: `${s.pending} pending`,     filter: 'pending',   cls: 'text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-950/40' },
                        { label: `${s.submitted} to review`, filter: 'submitted', cls: 'text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-950/40'   },
                        { label: `${s.reviewed} reviewed`,   filter: 'reviewed',  cls: 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/40' },
                      ] as const).map(({ label, filter, cls }) => {
                        const chipActive = selectedStudentId === s.id && selectedFilter === filter
                        return (
                          <Link
                            key={filter}
                            href={chipActive ? `/mentor?st=${s.id}` : `/mentor?st=${s.id}&filter=${filter}`}
                            className={`px-2 py-0.5 rounded-lg transition-colors whitespace-nowrap ${cls} ${chipActive ? 'ring-1 ring-current' : ''}`}
                          >
                            {label}
                          </Link>
                        )
                      })}
                    </div>
                    <div className="text-xs text-nexus-muted">{s.total} assignments</div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* Student detail — shown when a student row is selected */}
        {studentDetail && studentDetail.student && (
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[22px] font-extrabold tracking-tight text-nexus-text">
                {studentDetail.student.name}&apos;s Assignments
                {selectedFilter && (
                  <span className="ml-2 text-sm font-semibold text-nexus-muted capitalize">— {selectedFilter === 'submitted' ? 'to review' : selectedFilter}</span>
                )}
              </h2>
              {selectedFilter && (
                <Link href={`/mentor?st=${studentDetail.student.id}`} className="text-xs text-indigo-500 hover:text-indigo-400 font-semibold transition">
                  Show all
                </Link>
              )}
            </div>
            <StudentDetailSection
              student={studentDetail.student}
              assignments={studentDetail.assignments}
              selectedFilter={selectedFilter}
            />
          </section>
        )}

        {/* Submissions queue */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <h2 className="text-[22px] font-extrabold tracking-tight text-nexus-text">Review Queue</h2>
              {selectedStudentId && (
                <Link href="/mentor" className="text-xs text-indigo-500 hover:text-indigo-400 font-semibold transition">
                  ✕ Clear filter
                </Link>
              )}
            </div>
            {queue.length > 0 && (
              <span className="text-xs font-extrabold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full">
                {visibleQueue.length} awaiting
              </span>
            )}
          </div>

          {visibleQueue.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-nexus-muted gap-3">
              <CheckCircle size={32} className="opacity-30" />
              <p className="text-sm">{selectedStudentId ? 'No pending submissions for this student.' : 'All caught up — no submissions awaiting review.'}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {visibleQueue.map(sub => {
                const isSelected = sub.id === selectedId
                return (
                  <Link
                    key={sub.id}
                    href={`/mentor?s=${sub.id}#review`}
                    className={`flex items-center p-4 px-5 rounded-xl border transition-all cursor-pointer hover:-translate-y-0.5 hover:shadow-md ${
                      isSelected
                        ? 'bg-pink-50 dark:bg-pink-950/20 border-pink-300 dark:border-pink-900'
                        : 'bg-nexus-card border-nexus-border'
                    }`}
                  >
                    <div className="w-11 h-11 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center mr-4 shrink-0">
                      <Inbox size={18} />
                    </div>
                    <div className="flex-[2]">
                      <div className="font-bold text-[15px] text-nexus-text">{sub.assignment?.title ?? '—'}</div>
                      <div className="text-xs text-nexus-muted mt-0.5">by {sub.student?.name ?? '—'}</div>
                    </div>
                    <div className="text-[13px] line-clamp-1 flex-[2] text-nexus-muted hidden md:block">{sub.content}</div>
                    <div className="text-xs font-semibold text-pink-600 dark:text-pink-400 ml-4 shrink-0">Review →</div>
                  </Link>
                )
              })}
            </div>
          )}
        </section>

        {/* Review panel */}
        {selected && (
          <section id="review">
            <h2 className="text-[22px] font-extrabold tracking-tight text-nexus-text mb-5">
              Reviewing: {selected.assignment?.title ?? '—'}
            </h2>

            <div className="flex gap-6">
              {/* Left: assignment + student submission */}
              <div className="bg-nexus-bg-main border border-nexus-border rounded-[28px] p-7 flex-1 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center font-bold shrink-0">
                    {selected.student?.name.charAt(0) ?? '?'}
                  </div>
                  <div>
                    <div className="font-extrabold text-nexus-text">{selected.student?.name ?? '—'}</div>
                    <div className="text-xs text-nexus-muted mt-0.5">{selected.assignment?.title ?? '—'}</div>
                  </div>
                </div>

                {selected.assignment?.description && (
                  <div>
                    <div className="text-xs font-extrabold uppercase tracking-widest text-nexus-muted mb-2">Assignment</div>
                    <div className="text-sm text-nexus-muted leading-relaxed">{selected.assignment.description}</div>
                  </div>
                )}

                <div>
                  <div className="text-xs font-extrabold uppercase tracking-widest text-nexus-muted mb-2">Student&apos;s Submission</div>
                  <div className="text-sm leading-relaxed text-nexus-text bg-nexus-card border border-nexus-border rounded-xl p-4 whitespace-pre-wrap">
                    {selected.content}
                  </div>
                </div>
              </div>

              {/* Right: feedback form or existing feedback */}
              <div className="bg-nexus-bg-panel rounded-[28px] p-7 flex-1 flex flex-col gap-4">
                {selected.status === 'submitted' ? (
                  <ReviewForm submissionId={selected.id} />
                ) : (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-xl flex items-center justify-center">
                        <CheckCircle size={16} />
                      </div>
                      <span className="font-extrabold text-nexus-text">Already Reviewed</span>
                    </div>
                    <div className="text-sm leading-relaxed text-nexus-text bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-xl p-4 whitespace-pre-wrap">
                      {selected.feedback}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Right panel */}
      <aside className="flex-[3.5] bg-nexus-bg-panel rounded-[40px] m-4 mr-0 p-8 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
        <div>
          <h3 className="text-lg font-extrabold mb-5 text-nexus-text">Overview</h3>

          {[
            { label: 'Students',    count: totalStudents,  icon: <Users size={16} />,      bg: 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600' },
            { label: 'To Review',   count: totalQueue,     icon: <Inbox size={16} />,      bg: 'bg-blue-100 dark:bg-blue-950 text-blue-600'       },
            { label: 'Reviewed',    count: totalReviewed,  icon: <CheckCircle size={16} />, bg: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600' },
          ].map(({ label, count, icon, bg }) => (
            <div key={label} className="flex items-center gap-3 mb-4">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>
                {icon}
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-nexus-text">{count}</div>
                <div className="text-xs text-nexus-muted">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Queue shortcuts */}
        {queue.length > 0 && (
          <div className="mt-4">
            <h3 className="text-base font-extrabold mb-4 text-nexus-text">Pending Reviews</h3>
            <div className="flex flex-col gap-3">
              {queue.map(sub => (
                <Link key={sub.id} href={`/mentor?s=${sub.id}#review`} className="flex items-center gap-3 group cursor-pointer">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center shrink-0">
                    <FileText size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-nexus-text truncate group-hover:text-pink-500 transition">{sub.assignment?.title ?? '—'}</div>
                    <div className="text-xs text-nexus-muted">{sub.student?.name ?? '—'}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recent reviewed */}
        {totalReviewed > 0 && (
          <div className="mt-2">
            <h3 className="text-base font-extrabold mb-4 text-nexus-text">Recently Reviewed</h3>
            <div className="flex flex-col gap-3">
              {(submissions ?? [])
                .filter(s => s.status === 'reviewed')
                .slice(0, 4)
                .map(sub => {
                  const a = (assignments ?? []).find(a => a.id === sub.assignment_id)
                  const st = (students ?? []).find(s => s.id === sub.student_id)
                  return (
                    <div key={sub.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center shrink-0">
                        <CheckCircle size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-nexus-text truncate">{a?.title ?? '—'}</div>
                        <div className="text-xs text-nexus-muted">{st?.name ?? '—'}</div>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        )}
      </aside>
    </>
  )
}
