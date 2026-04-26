'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X } from 'lucide-react'

type Student = { id: string; name: string }

export function CreateAssignmentForm({ students }: { students: Student[] }) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [assignedTo, setAssignedTo] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  function reset() {
    setTitle('')
    setDescription('')
    setAssignedTo('')
    setError('')
  }

  function handleClose() {
    setOpen(false)
    reset()
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim() || !description.trim() || !assignedTo) return
    setLoading(true)
    setError('')

    const res = await fetch('/api/assignments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, assigned_to: assignedTo }),
    })

    setLoading(false)
    if (res.ok) {
      handleClose()
      router.refresh()
    } else {
      const data = await res.json()
      setError(data.error || 'Failed to create assignment. Try again.')
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-pink-600 text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-pink-700 transition cursor-pointer shrink-0"
      >
        <Plus size={16} /> New Assignment
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        >
          <div
            className="bg-nexus-card border border-nexus-border rounded-[28px] w-full max-w-lg shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-7 pb-5 border-b border-nexus-border">
              <h3 className="font-extrabold text-[18px] text-nexus-text">Create Assignment</h3>
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-xl bg-nexus-bg-main hover:bg-nexus-border flex items-center justify-center transition cursor-pointer text-nexus-muted hover:text-nexus-text"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-7">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-extrabold uppercase tracking-widest text-nexus-muted">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Build a Todo App"
                  required
                  className="bg-nexus-bg-main border border-nexus-border rounded-xl px-4 py-3 text-sm text-nexus-text outline-none focus:border-pink-500 transition"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-extrabold uppercase tracking-widest text-nexus-muted">Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Describe what the student should build or research…"
                  required
                  rows={4}
                  className="bg-nexus-bg-main border border-nexus-border rounded-xl px-4 py-3 text-sm text-nexus-text outline-none focus:border-pink-500 transition resize-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-extrabold uppercase tracking-widest text-nexus-muted">Assign to</label>
                <select
                  value={assignedTo}
                  onChange={e => setAssignedTo(e.target.value)}
                  required
                  className="bg-nexus-bg-main border border-nexus-border rounded-xl px-4 py-3 text-sm text-nexus-text outline-none focus:border-pink-500 transition cursor-pointer"
                >
                  <option value="">Select a student…</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {error && (
                <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || !title.trim() || !description.trim() || !assignedTo}
                className="bg-pink-600 text-white font-bold py-3.5 rounded-2xl hover:bg-pink-700 transition disabled:opacity-50 cursor-pointer mt-2"
              >
                {loading ? 'Creating…' : 'Create Assignment'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
