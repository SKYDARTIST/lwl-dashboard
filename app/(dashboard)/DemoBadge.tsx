'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, RotateCcw, X } from 'lucide-react'

export function DemoBadge() {
  const [open, setOpen] = useState(false)
  const [resetting, setResetting] = useState(false)
  const router = useRouter()
  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onClick(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  async function handleReset() {
    setResetting(true)
    await fetch('/api/demo/reset', { method: 'POST' })
    router.refresh()
    setTimeout(() => {
      setResetting(false)
      setOpen(false)
    }, 200)
  }

  return (
    <div className="fixed bottom-5 right-5 z-40" ref={popoverRef}>
      {open && (
        <div className="mb-2 w-[300px] bg-nexus-card border border-nexus-border rounded-2xl shadow-2xl p-5 text-left">
          <div className="flex items-start justify-between mb-2">
            <div className="text-sm font-extrabold text-nexus-text">Live demo</div>
            <button
              onClick={() => setOpen(false)}
              className="w-6 h-6 rounded-lg text-nexus-muted hover:text-nexus-text hover:bg-nexus-bg-main flex items-center justify-center cursor-pointer"
              aria-label="Close"
            >
              <X size={12} />
            </button>
          </div>
          <p className="text-xs text-nexus-muted leading-relaxed mb-4">
            No live database — seeded data only. Your submissions, reviews, and new assignments
            persist in your browser via cookies until you reset or clear them.
          </p>
          <button
            onClick={handleReset}
            disabled={resetting}
            className="w-full flex items-center justify-center gap-2 bg-nexus-bg-main hover:bg-indigo-600 hover:text-white border border-nexus-border rounded-xl py-2 text-xs font-bold text-nexus-text transition cursor-pointer disabled:opacity-60"
          >
            <RotateCcw size={12} />
            {resetting ? 'Resetting…' : 'Reset demo state'}
          </button>
        </div>
      )}
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 bg-nexus-card border border-nexus-border rounded-full pl-2.5 pr-3.5 py-1.5 text-[11px] font-bold text-nexus-muted hover:text-nexus-text hover:border-indigo-400 shadow-lg transition cursor-pointer"
      >
        <Sparkles size={11} className="text-indigo-500" />
        Demo mode
      </button>
    </div>
  )
}
