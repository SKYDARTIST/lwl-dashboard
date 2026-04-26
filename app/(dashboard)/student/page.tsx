import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FileText, CheckCircle, Clock, BookOpen } from 'lucide-react'
import { getUser } from '@/lib/auth'
import { getSupabase } from '@/lib/supabase/server'
import { SubmitForm } from './SubmitForm'

export default async function StudentDashboard({
  searchParams,
}: {
  searchParams: Promise<{ a?: string }>
}) {
  const user = await getUser()
  if (!user) redirect('/login')
  if (user.role !== 'student') redirect('/mentor')

  const supabase = getSupabase()
  const params = await searchParams

  const [{ data: assignments }, { data: submissions }] = await Promise.all([
    supabase.from('assignments').select('*').eq('assigned_to', user.id).order('created_at', { ascending: true }),
    supabase.from('submissions').select('*').eq('student_id', user.id),
  ])

  // Compute status for each assignment
  const merged = (assignments ?? []).map(a => {
    const sub = (submissions ?? []).find(s => s.assignment_id === a.id)
    return {
      ...a,
      status: sub ? (sub.status as 'submitted' | 'reviewed') : ('pending' as const),
      submission_id: sub?.id ?? null,
      submitted_content: sub?.content ?? null,
      feedback: sub?.feedback ?? null,
      reviewed_at: sub?.reviewed_at ?? null,
    }
  })

  const total = merged.length
  const pending = merged.filter(a => a.status === 'pending').length
  const submitted = merged.filter(a => a.status === 'submitted').length
  const reviewed = merged.filter(a => a.status === 'reviewed').length
  const done = submitted + reviewed
  const progressPct = total > 0 ? Math.round((done / total) * 100) : 0

  // Selected assignment — default to first pending, else first
  const defaultId = merged.find(a => a.status === 'pending')?.id ?? merged[0]?.id
  const selectedId = params.a ?? defaultId
  const selected = merged.find(a => a.id === selectedId) ?? null

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
            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
              {user.name.charAt(0)}
            </div>
            <span className="font-bold text-[15px] text-nexus-text">{user.name.split(' ')[0]}</span>
          </div>
        </header>

        {/* Assignments list */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[22px] font-extrabold tracking-tight text-nexus-text">Your Assignments</h2>
            <span className="text-xs text-nexus-muted font-semibold">{done} of {total} completed</span>
          </div>

          {merged.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-nexus-muted gap-3">
              <BookOpen size={32} className="opacity-30" />
              <p className="text-sm">No assignments yet.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {merged.map(a => {
                const isSelected = a.id === selectedId
                const statusStylesMap: Record<'pending' | 'submitted' | 'reviewed', { row: string; icon: string; badge: string; dot: string }> = {
                  pending:   { row: 'bg-amber-50  dark:bg-amber-950/20  border-amber-200  dark:border-amber-900',  icon: 'bg-amber-100  dark:bg-amber-950  text-amber-600',  badge: 'bg-amber-100  dark:bg-amber-950  text-amber-700  dark:text-amber-400',  dot: 'bg-amber-500'  },
                  submitted: { row: 'bg-blue-50   dark:bg-blue-950/20   border-blue-200   dark:border-blue-900',   icon: 'bg-blue-100   dark:bg-blue-950   text-blue-600',   badge: 'bg-blue-100   dark:bg-blue-950   text-blue-700   dark:text-blue-400',   dot: 'bg-blue-500'   },
                  reviewed:  { row: 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900', icon: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600', badge: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
                }
                const statusStyles = statusStylesMap[a.status as 'pending' | 'submitted' | 'reviewed']

                return (
                  <Link
                    key={a.id}
                    href={`/student?a=${a.id}#detail`}
                    className={`flex items-center p-4 px-5 rounded-xl border transition-all cursor-pointer hover:-translate-y-0.5 hover:shadow-md ${
                      isSelected ? statusStyles.row : 'border-nexus-border bg-nexus-card'
                    }`}
                  >
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center mr-4 shrink-0 ${statusStyles.icon}`}>
                      <FileText size={18} />
                    </div>
                    <div className="font-bold text-[15px] flex-[2] text-nexus-text">{a.title}</div>
                    <div className="text-nexus-muted text-[13px] flex-[2.5] line-clamp-1 hidden md:block">{a.description}</div>
                    <div className={`font-semibold text-[12px] flex-none flex items-center gap-1.5 px-3 py-1.5 rounded-full ml-4 ${statusStyles.badge}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${statusStyles.dot}`} />
                      {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </section>

        {/* Assignment detail */}
        {selected && (
          <section id="detail">
            <h2 className="text-[22px] font-extrabold tracking-tight text-nexus-text mb-5">
              {selected.status === 'pending' ? 'Submit Your Work' :
               selected.status === 'submitted' ? 'Awaiting Review' : 'Mentor Feedback'}
            </h2>

            <div className="flex gap-6">
              {/* Left: assignment info + submitted answer */}
              <div className="bg-nexus-bg-main border border-nexus-border rounded-[28px] p-7 flex-1 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
                    <FileText size={22} />
                  </div>
                  <div>
                    <div className="font-extrabold text-nexus-text">{selected.title}</div>
                    <div className="text-xs text-nexus-muted mt-0.5 capitalize">{selected.status}</div>
                  </div>
                </div>

                <div className="text-sm leading-relaxed text-nexus-text">{selected.description}</div>

                {selected.submitted_content && (
                  <div className="mt-1">
                    <div className="text-xs font-extrabold uppercase tracking-widest text-nexus-muted mb-2">Your Answer</div>
                    <div className="text-sm leading-relaxed text-nexus-text bg-nexus-card border border-nexus-border rounded-xl p-4 whitespace-pre-wrap">
                      {selected.submitted_content}
                    </div>
                  </div>
                )}
              </div>

              {/* Right: action area */}
              <div className="bg-nexus-bg-panel rounded-[28px] p-7 flex-1 flex flex-col gap-4">
                {selected.status === 'pending' && (
                  <SubmitForm assignmentId={selected.id} />
                )}

                {selected.status === 'submitted' && (
                  <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-8">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-950 text-blue-500 rounded-full flex items-center justify-center">
                      <Clock size={28} />
                    </div>
                    <div>
                      <div className="font-extrabold text-nexus-text mb-1">Work Submitted</div>
                      <div className="text-sm text-nexus-muted max-w-[200px]">
                        Your work has been submitted and is waiting for mentor feedback.
                      </div>
                    </div>
                  </div>
                )}

                {selected.status === 'reviewed' && selected.feedback && (
                  <div className="flex flex-col gap-4 h-full">
                    {/* Reviewed badge */}
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-emerald-500 text-white rounded-xl flex items-center justify-center shrink-0">
                        <CheckCircle size={16} />
                      </div>
                      <div>
                        <div className="font-extrabold text-nexus-text text-sm">Reviewed</div>
                        {selected.reviewed_at && (
                          <div className="text-xs text-nexus-muted">
                            {new Date(selected.reviewed_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Feedback label */}
                    <div className="text-xs font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                      Mentor Feedback
                    </div>

                    {/* Feedback text — distinct card, not a box */}
                    <div className="flex-1 rounded-2xl border-l-4 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 px-5 py-4">
                      <p className="text-sm leading-relaxed text-nexus-text whitespace-pre-wrap">{selected.feedback}</p>
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
          <h3 className="text-lg font-extrabold mb-5 text-nexus-text">My Progress</h3>

          {[
            { label: 'Pending',   count: pending,   dot: 'bg-amber-500'   },
            { label: 'Submitted', count: submitted, dot: 'bg-blue-500'    },
            { label: 'Reviewed',  count: reviewed,  dot: 'bg-emerald-500' },
          ].map(({ label, count, dot }) => (
            <div key={label} className="flex items-center justify-between text-sm mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${dot}`} />
                <span className="text-nexus-muted font-medium">{label}</span>
              </div>
              <span className="font-extrabold text-nexus-text">{count}</span>
            </div>
          ))}

          <div className="flex justify-between text-[13px] font-bold mb-2 mt-5">
            <span className="text-nexus-muted">Overall</span>
            <span className="text-nexus-text">{progressPct}%</span>
          </div>
          <div className="w-full h-2 bg-nexus-border rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full transition-all duration-700" style={{ width: `${progressPct}%` }} />
          </div>
        </div>

        <div className="mt-4">
          <h3 className="text-base font-extrabold mb-4 text-nexus-text">All Assignments</h3>
          <div className="flex flex-col gap-3">
            {merged.map(a => (
              <Link key={a.id} href={`/student?a=${a.id}#detail`} className="flex items-center gap-3 group cursor-pointer">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  a.status === 'pending'   ? 'bg-amber-100   dark:bg-amber-950   text-amber-600'   :
                  a.status === 'submitted' ? 'bg-blue-100    dark:bg-blue-950    text-blue-600'    :
                                             'bg-emerald-100 dark:bg-emerald-950 text-emerald-600'
                }`}>
                  <FileText size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-nexus-text truncate group-hover:text-indigo-500 transition">{a.title}</div>
                  <div className="text-xs text-nexus-muted capitalize">{a.status}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </aside>
    </>
  )
}
