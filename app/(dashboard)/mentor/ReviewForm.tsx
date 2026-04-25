'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

export function ReviewForm({ submissionId }: { submissionId: string }) {
  const [feedback, setFeedback] = useState('')
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
      body: JSON.stringify({ feedback }),
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
      <textarea
        value={feedback}
        onChange={e => setFeedback(e.target.value)}
        placeholder="Give specific, actionable feedback…"
        required
        className="flex-1 min-h-[140px] bg-nexus-card border border-nexus-border rounded-2xl p-4 text-sm text-nexus-text outline-none focus:border-pink-500 transition resize-y custom-scrollbar"
      />
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
