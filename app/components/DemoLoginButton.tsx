'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'

export function DemoLoginButton({
  email,
  password,
  label,
  className,
}: {
  email: string
  password: string
  label: string
  className?: string
}) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleClick() {
    setLoading(true)
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (res.ok) {
      const data = await res.json()
      router.push(data.role === 'student' ? '/student' : '/mentor')
    } else {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={className}
    >
      {loading ? 'Signing in…' : label}
      <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
    </button>
  )
}
