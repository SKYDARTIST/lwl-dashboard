'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { BookOpen, LogOut, LayoutDashboard } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { ThemeToggle } from '@/components/theme-toggle'

const navItems = [
  { href: '/student/dashboard', label: 'My Assignments', icon: LayoutDashboard },
]

function Initials({ name }: { name: string }) {
  const parts = name.trim().split(' ')
  const letters = parts.length >= 2 ? parts[0][0] + parts[parts.length - 1][0] : parts[0].slice(0, 2)
  return (
    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
      style={{ background: 'linear-gradient(135deg, #6366f1, #3b82f6)', boxShadow: '0 0 12px rgba(99,102,241,0.4)' }}>
      {letters.toUpperCase()}
    </div>
  )
}

export function StudentSidebar({ name }: { name: string }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    toast.success('Logged out')
    router.push('/login')
  }

  return (
    <aside className="w-64 min-h-screen flex flex-col shrink-0"
      style={{ background: 'var(--nexus-sidebar-bg)', borderRight: '1px solid var(--nexus-sidebar-border)', backdropFilter: 'blur(20px)' }}>

      {/* Logo */}
      <div className="p-5" style={{ borderBottom: '1px solid var(--nexus-sidebar-border)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #6366f1, #3b82f6)', boxShadow: '0 0 16px rgba(99,102,241,0.4)' }}>
            <BookOpen className="h-4 w-4 text-white" />
          </div>
          <span className="font-black text-white text-sm tracking-tight">Nexus</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 relative">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300',
                active ? 'text-white' : 'text-white/40 hover:text-white/80 hover:bg-white/5'
              )}
              style={active ? {
                background: 'rgba(99,102,241,0.15)',
                border: '1px solid rgba(99,102,241,0.25)',
                boxShadow: '0 0 20px rgba(99,102,241,0.1)',
              } : {}}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-indigo-400"
                  style={{ boxShadow: '0 0 8px rgba(99,102,241,0.8)' }} />
              )}
              <Icon className={cn('h-4 w-4 transition-colors duration-200', active ? 'text-indigo-400' : '')} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User card */}
      <div className="p-4" style={{ borderTop: '1px solid var(--nexus-sidebar-border)' }}>
        <div className="flex items-center gap-3 px-1 mb-3">
          <Initials name={name} />
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: 'var(--nexus-text-primary)' }}>{name}</p>
            <p className="text-xs" style={{ color: 'var(--nexus-text-faint)' }}>Student</p>
          </div>
        </div>
        <ThemeToggle />
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer hover:text-red-500 hover:bg-red-500/10 active:scale-95"
          style={{ color: 'var(--nexus-text-faint)' }}
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </button>
      </div>
    </aside>
  )
}
