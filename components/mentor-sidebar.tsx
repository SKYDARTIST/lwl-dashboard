'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { BookOpen, LogOut, Users, ClipboardList } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

const navItems = [
  { href: '/mentor/dashboard', label: 'My Students',  icon: Users },
  { href: '/mentor/queue',     label: 'Review Queue', icon: ClipboardList },
]

export function MentorSidebar({ name }: { name: string }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    toast.success('Logged out')
    router.push('/login')
  }

  return (
    <aside className="w-64 min-h-screen bg-white border-r flex flex-col shrink-0">
      <div className="p-6 border-b">
        <div className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-purple-600" />
          <span className="font-bold text-gray-900">LWL Dashboard</span>
        </div>
        <p className="text-sm text-gray-500 mt-1 truncate">{name} · Mentor</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
              pathname.startsWith(href)
                ? 'bg-purple-50 text-purple-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-gray-600"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </aside>
  )
}
