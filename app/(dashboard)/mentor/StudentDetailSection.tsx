'use client'

import { useState } from 'react'
import Link from 'next/link'
import { X, CheckCircle } from 'lucide-react'

type Submission = {
  id: string
  content: string
  feedback: string | null
}

type Assignment = {
  id: string
  title: string
  description: string
  status: 'pending' | 'submitted' | 'reviewed'
  submission: Submission | null
}

type Props = {
  student: { id: string; name: string }
  assignments: Assignment[]
  selectedFilter: string | null
}

const styleMap = {
  pending:   { badge: 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400',   dot: 'bg-amber-500'   },
  submitted: { badge: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400',       dot: 'bg-blue-500'    },
  reviewed:  { badge: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
}

export function StudentDetailSection({ student, assignments, selectedFilter }: Props) {
  const [modal, setModal] = useState<Assignment | null>(null)

  return (
    <>
      <div className="flex flex-col gap-2">
        {assignments.map(a => {
          const style = styleMap[a.status]
          return (
            <button
              key={a.id}
              onClick={() => setModal(a)}
              className="bg-nexus-card border border-nexus-border rounded-xl p-4 px-5 flex flex-col gap-2 text-left cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="font-bold text-[15px] text-nexus-text">{a.title}</div>
                <span className={`text-[11px] font-bold flex items-center gap-1.5 px-3 py-1 rounded-full ${style.badge}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                  {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                </span>
              </div>
              <div className="text-xs text-nexus-muted leading-relaxed line-clamp-2">{a.description}</div>
              {a.submission?.content && (
                <div className="mt-1">
                  <div className="text-[10px] font-extrabold uppercase tracking-widest text-nexus-muted mb-1">Submission</div>
                  <div className="text-xs text-nexus-text bg-nexus-bg-main border border-nexus-border rounded-lg px-3 py-2 line-clamp-2">
                    {a.submission.content}
                  </div>
                </div>
              )}
              {a.submission?.feedback && (
                <div className="mt-1">
                  <div className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-1">Your Feedback</div>
                  <div className="text-xs text-nexus-text bg-emerald-50 dark:bg-emerald-950/30 border-l-2 border-emerald-500 rounded-lg px-3 py-2 line-clamp-2">
                    {a.submission.feedback}
                  </div>
                </div>
              )}
              <div className="text-[11px] text-indigo-500 font-semibold mt-1">Click to expand →</div>
            </button>
          )
        })}
      </div>

      {/* Modal */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setModal(null)}
        >
          <div
            className="bg-nexus-card border border-nexus-border rounded-[28px] w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-start justify-between p-7 pb-4 border-b border-nexus-border">
              <div className="flex-1 pr-4">
                <div className="font-extrabold text-[18px] text-nexus-text leading-snug">{modal.title}</div>
                <div className="text-xs text-nexus-muted mt-1">{student.name}</div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className={`text-[11px] font-bold flex items-center gap-1.5 px-3 py-1 rounded-full ${styleMap[modal.status].badge}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${styleMap[modal.status].dot}`} />
                  {modal.status.charAt(0).toUpperCase() + modal.status.slice(1)}
                </span>
                <button
                  onClick={() => setModal(null)}
                  className="w-8 h-8 rounded-xl bg-nexus-bg-main hover:bg-nexus-border flex items-center justify-center transition cursor-pointer text-nexus-muted hover:text-nexus-text"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Modal body — scrollable */}
            <div className="flex flex-col gap-5 p-7 overflow-y-auto custom-scrollbar">
              {/* Assignment description */}
              <div>
                <div className="text-[10px] font-extrabold uppercase tracking-widest text-nexus-muted mb-2">Assignment</div>
                <div className="text-sm text-nexus-muted leading-relaxed">{modal.description}</div>
              </div>

              {/* Submission */}
              {modal.submission?.content ? (
                <div>
                  <div className="text-[10px] font-extrabold uppercase tracking-widest text-nexus-muted mb-2">Student&apos;s Submission</div>
                  <div className="text-sm text-nexus-text bg-nexus-bg-main border border-nexus-border rounded-xl p-4 leading-relaxed whitespace-pre-wrap">
                    {modal.submission.content}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-nexus-muted italic">No submission yet.</div>
              )}

              {/* Feedback */}
              {modal.submission?.feedback && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <CheckCircle size={12} className="text-emerald-500" />
                    <div className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Your Feedback</div>
                  </div>
                  <div className="text-sm text-nexus-text bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-xl p-4 leading-relaxed whitespace-pre-wrap">
                    {modal.submission.feedback}
                  </div>
                </div>
              )}
            </div>

            {/* Modal footer */}
            {modal.status === 'submitted' && (
              <div className="p-7 pt-4 border-t border-nexus-border">
                <Link
                  href={`/mentor?st=${student.id}&s=${modal.submission!.id}#review`}
                  onClick={() => setModal(null)}
                  className="inline-flex items-center gap-2 bg-pink-600 text-white text-sm font-bold px-5 py-3 rounded-xl hover:bg-pink-700 transition cursor-pointer"
                >
                  Open Review Form →
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
