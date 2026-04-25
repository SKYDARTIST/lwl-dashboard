import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { StudentSidebar } from '@/components/student-sidebar'

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser()
  if (!user || user.role !== 'student') redirect('/login')

  return (
    <div className="flex min-h-screen bg-gray-50">
      <StudentSidebar name={user.name} />
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  )
}
