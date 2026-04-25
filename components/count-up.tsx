'use client'

import { useEffect, useState } from 'react'

export function CountUp({ value, duration = 700 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (value === 0) { setCount(0); return }
    const steps = 28
    const increment = value / steps
    const delay = duration / steps
    let current = 0
    let frame = 0
    const timer = setInterval(() => {
      frame++
      // ease-out curve: slow down near end
      const progress = frame / steps
      const eased = 1 - Math.pow(1 - progress, 3)
      current = Math.round(eased * value)
      setCount(current)
      if (frame >= steps) { setCount(value); clearInterval(timer) }
    }, delay)
    return () => clearInterval(timer)
  }, [value, duration])

  return <>{count}</>
}
