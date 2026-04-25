'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

export function ThemeToggle() {
  const [dark, setDark] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('nexus-theme')
    const isDark = saved ? saved === 'dark' : true
    setDark(isDark)
    document.documentElement.classList.toggle('dark', isDark)
  }, [])

  function toggle() {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('nexus-theme', next ? 'dark' : 'light')
  }

  return (
    <button
      onClick={toggle}
      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer active:scale-95"
      style={dark
        ? { color: 'rgba(255,255,255,0.3)', background: 'transparent' }
        : { color: '#475569', background: 'transparent' }
      }
      onMouseEnter={e => { (e.currentTarget).style.background = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }}
      onMouseLeave={e => { (e.currentTarget).style.background = 'transparent' }}
      aria-label="Toggle theme"
    >
      {dark
        ? <><Sun className="h-3.5 w-3.5 text-amber-400" /> Light mode</>
        : <><Moon className="h-3.5 w-3.5 text-indigo-500" /> Dark mode</>
      }
    </button>
  )
}
