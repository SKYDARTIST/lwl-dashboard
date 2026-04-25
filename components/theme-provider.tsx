'use client'

import { useEffect } from 'react'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const saved = localStorage.getItem('nexus-theme')
    const isDark = saved ? saved === 'dark' : true
    document.documentElement.classList.toggle('dark', isDark)
  }, [])

  return <>{children}</>
}
