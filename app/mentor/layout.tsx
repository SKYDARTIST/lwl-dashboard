import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { MentorSidebar } from '@/components/mentor-sidebar'

export default async function MentorLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser()
  if (!user || user.role !== 'mentor') redirect('/login')

  return (
    <div className="flex min-h-screen bg-gray-50">
      <MentorSidebar name={user.name} />
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  )
}
