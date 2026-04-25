import { Badge } from '@/components/ui/badge'
import type { AssignmentStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

const config: Record<AssignmentStatus, { label: string; className: string }> = {
  pending:   { label: 'Pending',   className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  submitted: { label: 'Submitted', className: 'bg-blue-100 text-blue-800 border-blue-200' },
  reviewed:  { label: 'Reviewed',  className: 'bg-green-100 text-green-800 border-green-200' },
}

export function StatusBadge({ status }: { status: AssignmentStatus }) {
  const { label, className } = config[status]
  return (
    <Badge variant="outline" className={cn(className)}>
      {label}
    </Badge>
  )
}
