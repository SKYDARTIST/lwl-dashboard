'use client'

import { useState, FormEvent, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, ArrowLeft, GraduationCap, Users } from 'lucide-react'

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
    <div className="grid w-full max-w-5xl overflow-hidden rounded-[36px] border border-nexus-border bg-nexus-card shadow-2xl nexus-shell lg:grid-cols-[1fr_0.95fr]">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-nexus-sidebar p-10 text-white lg:flex">
        <div className="absolute inset-0 opacity-70">
          <div className="absolute -left-20 top-20 h-64 w-64 rounded-full bg-indigo-500/30 blur-3xl" />
          <div className="absolute bottom-0 right-[-5rem] h-72 w-72 rounded-full bg-pink-500/25 blur-3xl" />
        </div>
        <div className="relative flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-black">
            <BookOpen size={20} />
          </div>
          <span className="text-xl font-extrabold">Nexus</span>
        </div>
        <div className="relative">
          <div className="mb-4 inline-flex rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-extrabold uppercase tracking-widest text-white/70">
            Demo accounts
          </div>
          <h2 className="max-w-md text-5xl font-black leading-tight tracking-[-1.5px]">
            Submit work. Get feedback. Grow.
          </h2>
        </div>
        <div className="relative grid grid-cols-2 gap-3">
          <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur">
            <GraduationCap className="mb-4 text-indigo-300" size={24} />
            <div className="text-sm font-extrabold">Student Portal</div>
            <div className="mt-1 text-xs text-white/55">Learn & Grow</div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur">
            <Users className="mb-4 text-pink-300" size={24} />
            <div className="text-sm font-extrabold">Mentor Portal</div>
            <div className="mt-1 text-xs text-white/55">Guide & Review</div>
          </div>
        </div>
      </div>

      <div className="p-7 sm:p-10">
        <div className="flex items-center gap-3 mb-8 lg:hidden">
          <div className="w-9 h-9 bg-indigo-600 text-white rounded-xl flex items-center justify-center">
            <BookOpen size={18} />
          </div>
          <span className="font-extrabold text-lg text-nexus-text">Nexus</span>
        </div>

        <h1 className="text-3xl font-extrabold text-nexus-text mb-1">Welcome back</h1>
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
              className="bg-nexus-bg-main border border-nexus-border rounded-2xl px-4 py-3.5 text-sm text-nexus-text outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition"
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
              className="bg-nexus-bg-main border border-nexus-border rounded-2xl px-4 py-3.5 text-sm text-nexus-text outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition"
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
            className="bg-nexus-sidebar text-white font-bold py-3.5 rounded-2xl mt-1 hover:bg-indigo-700 transition disabled:opacity-60 cursor-pointer shadow-lg shadow-indigo-500/10"
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
                className={`flex items-center justify-between text-xs bg-nexus-bg-main border border-nexus-border rounded-2xl px-4 py-3 transition cursor-pointer group hover:-translate-y-0.5 hover:shadow-md ${d.hover}`}
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
