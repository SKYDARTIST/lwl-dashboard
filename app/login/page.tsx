'use client'

import { useState, FormEvent, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, ArrowLeft } from 'lucide-react'

const ALL_DEMOS = [
  { name: 'Aarav Singh',  role: 'student', email: 'aarav@lwl.edu',  password: 'student123', hover: 'hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:border-indigo-300', arrow: 'group-hover:text-indigo-500' },
  { name: 'Priya Sharma', role: 'mentor',  email: 'priya@lwl.edu',  password: 'mentor123',  hover: 'hover:bg-pink-50 dark:hover:bg-pink-950/30 hover:border-pink-300',   arrow: 'group-hover:text-pink-500'   },
  { name: 'Ravi Kumar',   role: 'mentor',  email: 'ravi@lwl.edu',   password: 'mentor123',  hover: 'hover:bg-violet-50 dark:hover:bg-violet-950/30 hover:border-violet-300', arrow: 'group-hover:text-violet-500' },
]

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const role = searchParams.get('role') // 'student' | 'mentor' | null

  const demos = role ? ALL_DEMOS.filter(d => d.role === role) : ALL_DEMOS

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
      <p className="text-sm text-nexus-muted mb-8">
        {role === 'student' ? 'Sign in as a student.' : role === 'mentor' ? 'Sign in as a mentor.' : 'Sign in to your account to continue.'}
      </p>

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
          {demos.map(d => (
            <button
              key={d.email}
              onClick={e => fillDemo(e, d.email, d.password)}
              className={`flex items-center justify-between text-xs bg-nexus-bg-main border border-nexus-border rounded-xl px-4 py-2.5 transition cursor-pointer group ${d.hover}`}
            >
              <span className="font-semibold text-nexus-text">{d.name} — {d.role.charAt(0).toUpperCase() + d.role.slice(1)}</span>
              <span className={`text-nexus-muted transition ${d.arrow}`}>Use →</span>
            </button>
          ))}
        </div>
      </div>

      <Link href="/" className="flex items-center gap-1.5 text-xs text-nexus-muted hover:text-nexus-text transition mt-6">
        <ArrowLeft size={12} /> Back to home
      </Link>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
