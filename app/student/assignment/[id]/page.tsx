'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { StatusBadge } from '@/components/status-badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, MessageSquare, Send } from 'lucide-react'
import type { AssignmentWithStatus } from '@/lib/types'
import Link from 'next/link'

export default function AssignmentDetail() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [assignment, setAssignment] = useState<AssignmentWithStatus | null>(null)
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchAssignment = useCallback(async () => {
    const res = await fetch(`/api/assignments/${id}`)
    if (!res.ok) { router.push('/student/dashboard'); return }
    const data = await res.json()
    setAssignment(data)
    setLoading(false)
  }, [id, router])

  useEffect(() => { fetchAssignment() }, [fetchAssignment])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) { toast.error('Please write something before submitting'); return }
    if (content.trim().length < 10) { toast.error('Submission is too short (minimum 10 characters)'); return }

    setSubmitting(true)
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignment_id: id, content }),
      })
      if (!res.ok) { toast.error('Submission failed. Try again.'); return }
      toast.success('Assignment submitted!')
      setContent('')
      await fetchAssignment()
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl space-y-4">
        <Skeleton className="h-4 w-32 mb-6" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-48 rounded-lg" />
        <Skeleton className="h-48 rounded-lg" />
      </div>
    )
  }

  if (!assignment) return null

  return (
    <div className="max-w-2xl">
      <Link
        href="/student/dashboard"
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Back to assignments
      </Link>

      <div className="flex items-start justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{assignment.title}</h1>
        <StatusBadge status={assignment.status} />
      </div>

      <Card className="mb-6">
        <CardHeader><CardTitle className="text-base">Assignment</CardTitle></CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{assignment.description}</p>
        </CardContent>
      </Card>

      {assignment.status === 'pending' && (
        <Card>
          <CardHeader><CardTitle className="text-base">Your Response</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Textarea
                placeholder="Write your response here..."
                rows={8}
                value={content}
                onChange={e => setContent(e.target.value)}
                required
              />
              <Button type="submit" disabled={submitting} className="gap-2">
                <Send className="h-4 w-4" />
                {submitting ? 'Submitting...' : 'Submit'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {assignment.status === 'submitted' && (
        <Card>
          <CardHeader><CardTitle className="text-base">Your Submission</CardTitle></CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap mb-4">{assignment.submitted_content}</p>
            <p className="text-sm text-blue-600 font-medium">⏳ Awaiting mentor review...</p>
          </CardContent>
        </Card>
      )}

      {assignment.status === 'reviewed' && (
        <>
          <Card className="mb-4">
            <CardHeader><CardTitle className="text-base">Your Submission</CardTitle></CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{assignment.submitted_content}</p>
            </CardContent>
          </Card>
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2 text-green-800">
                <MessageSquare className="h-4 w-4" />
                Mentor Feedback
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-green-900 whitespace-pre-wrap">{assignment.feedback}</p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
