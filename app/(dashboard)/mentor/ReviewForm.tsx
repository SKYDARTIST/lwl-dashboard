'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

const GRADES = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F']

export function ReviewForm({ submissionId }: { submissionId: string }) {
  const [feedback, setFeedback] = useState('')
  const [grade, setGrade] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!feedback.trim()) return
    setLoading(true)
    setError('')

    const res = await fetch(`/api/submissions/${submissionId}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feedback, grade: grade || undefined }),
    })

    setLoading(false)
    if (res.ok) {
      router.refresh()
    } else {
      const data = await res.json()
      setError(data.error || 'Failed to submit review. Try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 h-full">
      <h4 className="text-base font-extrabold text-nexus-text">Write Feedback</h4>
      <div className="text-xs text-nexus-muted bg-nexus-bg-main border border-nexus-border rounded-xl px-3 py-2">
        Be specific and actionable — vague feedback doesn&apos;t help students improve.
      </div>

      {/* Grade select */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-extrabold uppercase tracking-widest text-nexus-muted">
          Grade <span className="normal-case font-normal">(optional)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {GRADES.map(g => (
            <button
              key={g}
              type="button"
              onClick={() => setGrade(grade === g ? '' : g)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                grade === g
                  ? 'bg-pink-600 text-white border-pink-600'
                  : 'bg-nexus-bg-main text-nexus-muted border-nexus-border hover:border-pink-400 hover:text-pink-500'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <div className="relative flex-1 flex flex-col">
        <textarea
          value={feedback}
          onChange={e => setFeedback(e.target.value)}
          placeholder="Give specific, actionable feedback…"
          required
          className="flex-1 min-h-[140px] bg-nexus-card border border-nexus-border rounded-2xl p-4 text-sm text-nexus-text outline-none focus:border-pink-500 transition resize-y custom-scrollbar pb-7"
        />
        <span className="absolute bottom-2 right-3 text-[11px] text-nexus-muted pointer-events-none">
          {feedback.length} chars
        </span>
      </div>
      {error && (
        <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl px-3 py-2">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={loading || !feedback.trim()}
        className="mt-auto bg-pink-600 text-white font-bold py-3.5 rounded-2xl hover:bg-pink-700 transition disabled:opacity-50 cursor-pointer"
      >
        {loading ? 'Submitting…' : 'Mark as Reviewed'}
      </button>
    </form>
  )
}
