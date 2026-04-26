'use client'

import dynamic from 'next/dynamic'

// ssr:false is only valid inside a Client Component — this wrapper exists for that reason
export const StudentDetailSection = dynamic(
  () => import('./StudentDetailSection').then(m => m.StudentDetailSection),
  { ssr: false }
)
