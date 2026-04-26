'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

export function SubmitForm({ assignmentId }: { assignmentId: string }) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    setLoading(true)
    setError('')

    const res = await fetch('/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignment_id: assignmentId, content }),
    })

    setLoading(false)
    if (res.ok) {
      router.refresh()
    } else {
      const data = await res.json()
      setError(data.error || 'Failed to submit. Try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 h-full">
      <h4 className="text-base font-extrabold text-nexus-text">Your Response</h4>
      <div className="text-xs text-nexus-muted bg-nexus-bg-main border border-nexus-border rounded-xl px-3 py-2">
        Write clearly — your mentor will read this before giving feedback.
      </div>
      <div className="relative flex flex-col">
        <textarea
          value={content}
          onChange={e => {
            setContent(e.target.value)
            // auto-grow: reset then expand to content height
            e.target.style.height = 'auto'
            e.target.style.height = e.target.scrollHeight + 'px'
          }}
          placeholder="Write your response here…"
          required
          rows={5}
          className="w-full min-h-[120px] bg-nexus-card border border-nexus-border rounded-2xl p-4 text-sm text-nexus-text outline-none focus:border-indigo-500 transition resize-none overflow-hidden custom-scrollbar pb-7"
        />
        <span className="absolute bottom-2 right-3 text-[11px] text-nexus-muted pointer-events-none">
          {content.length} chars
        </span>
      </div>
      {error && (
        <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl px-3 py-2">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={loading || !content.trim()}
        className="mt-auto bg-indigo-600 text-white font-bold py-3.5 rounded-2xl hover:bg-indigo-700 transition disabled:opacity-50 cursor-pointer"
      >
        {loading ? 'Submitting…' : 'Submit Work'}
      </button>
    </form>
  )
}
