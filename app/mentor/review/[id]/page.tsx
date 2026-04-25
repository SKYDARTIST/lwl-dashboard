'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function ReviewPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [submission, setSubmission] = useState<any>(null)
  const [feedback, setFeedback] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/submissions/${id}`)
      .then(r => r.json())
      .then(data => { setSubmission(data); setLoading(false) })
      .catch(() => router.push('/mentor/queue'))
  }, [id, router])

  async function handleReview(e: React.FormEvent) {
    e.preventDefault()
    if (!feedback.trim()) { toast.error('Please write feedback before submitting'); return }
    if (feedback.trim().length < 10) { toast.error('Feedback is too short (minimum 10 characters)'); return }

    setSubmitting(true)
    try {
      const res = await fetch(`/api/submissions/${id}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback }),
      })
      if (!res.ok) { toast.error('Failed to submit feedback'); return }
      toast.success('Feedback sent! Student can now see it.')
      router.push('/mentor/queue')
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
        <Skeleton className="h-48 rounded-lg" />
      </div>
    )
  }

  if (!submission) return null

  return (
    <div className="max-w-2xl">
      <Link
        href="/mentor/queue"
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Back to queue
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-1">
        {submission.assignments?.title}
      </h1>
      <p className="text-gray-500 mb-6">Submitted by {submission.users?.name}</p>

      <Card className="mb-4">
        <CardHeader><CardTitle className="text-base">Assignment</CardTitle></CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {submission.assignments?.description}
          </p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader><CardTitle className="text-base">Student&apos;s Submission</CardTitle></CardHeader>
        <CardContent>
          <p className="text-gray-700 whitespace-pre-wrap">{submission.content}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Your Feedback</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleReview} className="space-y-4">
            <Textarea
              placeholder="Write your feedback here..."
              rows={6}
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              required
            />
            <Button type="submit" disabled={submitting} className="gap-2">
              <CheckCircle className="h-4 w-4" />
              {submitting ? 'Submitting...' : 'Mark as Reviewed'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
