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

  const merged = (assignments ?? []).map(a => {
    const sub = (submissions ?? []).find(s => s.assignment_id === a.id)
    return {
      ...a,
      status: sub ? (sub.status as 'submitted' | 'reviewed') : ('pending' as const),
      submission_id: sub?.id ?? null,
      submitted_content: sub?.content ?? null,
      feedback: sub?.feedback ?? null,
      grade: sub?.grade ?? null,
      reviewed_at: sub?.reviewed_at ?? null,
    }
  })

  const total = merged.length
  const pending = merged.filter(a => a.status === 'pending').length
  const submitted = merged.filter(a => a.status === 'submitted').length
  const reviewed = merged.filter(a => a.status === 'reviewed').length
  const done = submitted + reviewed
  const progressPct = total > 0 ? Math.round((done / total) * 100) : 0

  const defaultId = merged.find(a => a.status === 'pending')?.id ?? merged[0]?.id
  const selectedId = params.a ?? defaultId
  const selected = merged.find(a => a.id === selectedId) ?? null

  return (
    <>
      {/* Center column — list only */}
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

        {/* Compact progress strip */}
        <div className="flex items-center gap-6 px-5 py-3.5 bg-nexus-bg-main border border-nexus-border rounded-2xl">
          {[
            { label: 'Pending',   count: pending,   dot: 'bg-amber-500'   },
            { label: 'Submitted', count: submitted, dot: 'bg-blue-500'    },
            { label: 'Reviewed',  count: reviewed,  dot: 'bg-emerald-500' },
          ].map(({ label, count, dot }) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${dot}`} />
              <span className="text-xs text-nexus-muted font-medium">{label}</span>
              <span className="text-xs font-extrabold text-nexus-text">{count}</span>
            </div>
          ))}
          <div className="flex-1 flex items-center gap-3 ml-2">
            <div className="flex-1 h-1.5 bg-nexus-border rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full transition-all duration-700" style={{ width: `${progressPct}%` }} />
            </div>
            <span className="text-xs font-bold text-nexus-text shrink-0">{progressPct}%</span>
          </div>
        </div>

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
                    href={`/student?a=${a.id}`}
                    className={`flex items-center p-4 px-5 rounded-xl border transition-all cursor-pointer hover:-translate-y-0.5 hover:shadow-md ${
                      isSelected ? statusStyles.row : 'border-nexus-border bg-nexus-card'
                    }`}
                  >
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center mr-4 shrink-0 ${statusStyles.icon}`}>
                      <FileText size={18} />
                    </div>
                    <div className="font-bold text-[15px] flex-[2] text-nexus-text">{a.title}</div>
                    <div className="text-nexus-muted text-[13px] flex-[2.5] line-clamp-1 min-w-0 hidden md:block">{a.description}</div>
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
      </main>

      {/* Right panel — assignment detail */}
      <aside className="flex-[3.5] bg-nexus-bg-panel rounded-[40px] m-4 mr-0 p-8 flex flex-col gap-5 overflow-y-auto custom-scrollbar">
        {selected ? (
          <>
            {/* Detail header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
                  <FileText size={18} />
                </div>
                <div className="min-w-0">
                  <div className="font-extrabold text-nexus-text text-[15px] leading-snug">{selected.title}</div>
                  <div className="text-xs text-nexus-muted mt-0.5 capitalize">{selected.status}</div>
                </div>
              </div>
              {selected.grade && (
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-extrabold text-sm shrink-0">
                  {selected.grade}
                </div>
              )}
            </div>

            {/* Assignment description */}
            <div className="bg-nexus-card border border-nexus-border rounded-2xl p-4">
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-nexus-muted mb-2">Assignment</div>
              <p className="text-sm leading-relaxed text-nexus-text">{selected.description}</p>
            </div>

            {/* Submitted content */}
            {selected.submitted_content && (
              <div className="bg-nexus-card border border-nexus-border rounded-2xl p-4">
                <div className="text-[10px] font-extrabold uppercase tracking-widest text-nexus-muted mb-2">Your Answer</div>
                <p className="text-sm leading-relaxed text-nexus-text whitespace-pre-wrap">{selected.submitted_content}</p>
              </div>
            )}

            {/* Action area */}
            {selected.status === 'pending' && (
              <SubmitForm assignmentId={selected.id} />
            )}

            {selected.status === 'submitted' && (
              <div className="flex flex-col items-center justify-center py-8 gap-4 text-center">
                <div className="w-14 h-14 bg-blue-100 dark:bg-blue-950 text-blue-500 rounded-full flex items-center justify-center">
                  <Clock size={24} />
                </div>
                <div>
                  <div className="font-extrabold text-nexus-text mb-1">Work Submitted</div>
                  <div className="text-sm text-nexus-muted">Waiting for mentor feedback.</div>
                </div>
              </div>
            )}

            {selected.status === 'reviewed' && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-emerald-500 text-white rounded-lg flex items-center justify-center shrink-0">
                    <CheckCircle size={14} />
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
                <div className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                  Mentor Feedback
                </div>
                <div className="rounded-2xl border-l-4 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 px-4 py-3">
                  <p className="text-sm leading-relaxed text-nexus-text whitespace-pre-wrap">{selected.feedback}</p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-nexus-muted">
            <BookOpen size={32} className="opacity-30" />
            <p className="text-sm">No assignments yet.</p>
          </div>
        )}
      </aside>
    </>
  )
}
