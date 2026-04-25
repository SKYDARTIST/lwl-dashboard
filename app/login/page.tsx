'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, ArrowLeft } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error || 'Invalid credentials')
      return
    }

    router.push(data.role === 'student' ? '/student' : '/mentor')
  }

  function fillDemo(e: React.MouseEvent, demoEmail: string, demoPass: string) {
    e.preventDefault()
    setEmail(demoEmail)
    setPassword(demoPass)
    setError('')
  }

  return (
    <div className="w-full max-w-[420px] bg-nexus-card rounded-[28px] border border-nexus-border p-10 shadow-2xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 bg-indigo-600 text-white rounded-xl flex items-center justify-center">
          <BookOpen size={18} />
        </div>
        <span className="font-extrabold text-lg text-nexus-text">Nexus</span>
      </div>

      <h1 className="text-2xl font-extrabold text-nexus-text mb-1">Welcome back</h1>
      <p className="text-sm text-nexus-muted mb-8">Sign in to your account to continue.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-nexus-text">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="aarav@lwl.edu"
            required
            className="bg-nexus-bg-main border border-nexus-border rounded-xl px-4 py-3 text-sm text-nexus-text outline-none focus:border-indigo-500 transition"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-nexus-text">Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="bg-nexus-bg-main border border-nexus-border rounded-xl px-4 py-3 text-sm text-nexus-text outline-none focus:border-indigo-500 transition"
          />
        </div>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl px-4 py-2.5">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 text-white font-bold py-3 rounded-xl mt-1 hover:bg-indigo-700 transition disabled:opacity-60 cursor-pointer"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-nexus-border">
        <p className="text-xs font-extrabold uppercase tracking-widest text-nexus-muted mb-3">Demo accounts</p>
        <div className="flex flex-col gap-2">
          <button
            onClick={e => fillDemo(e, 'aarav@lwl.edu', 'student123')}
            className="flex items-center justify-between text-xs bg-nexus-bg-main hover:bg-indigo-50 dark:hover:bg-indigo-950/30 border border-nexus-border hover:border-indigo-300 rounded-xl px-4 py-2.5 transition cursor-pointer group"
          >
            <span className="font-semibold text-nexus-text">Aarav Singh — Student</span>
            <span className="text-nexus-muted group-hover:text-indigo-500 transition">Use →</span>
          </button>
          <button
            onClick={e => fillDemo(e, 'priya@lwl.edu', 'mentor123')}
            className="flex items-center justify-between text-xs bg-nexus-bg-main hover:bg-pink-50 dark:hover:bg-pink-950/30 border border-nexus-border hover:border-pink-300 rounded-xl px-4 py-2.5 transition cursor-pointer group"
          >
            <span className="font-semibold text-nexus-text">Priya Sharma — Mentor</span>
            <span className="text-nexus-muted group-hover:text-pink-500 transition">Use →</span>
          </button>
        </div>
      </div>

      <Link href="/" className="flex items-center gap-1.5 text-xs text-nexus-muted hover:text-nexus-text transition mt-6">
        <ArrowLeft size={12} /> Back to home
      </Link>
    </div>
  )
}
