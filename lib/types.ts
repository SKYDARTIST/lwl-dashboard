export type Role = 'student' | 'mentor'
export type SubmissionStatus = 'submitted' | 'reviewed'
export type AssignmentStatus = 'pending' | 'submitted' | 'reviewed'

export interface JWTUser {
  id: string
  role: Role
  name: string
}

export interface AssignmentWithStatus {
  id: string
  title: string
  description: string
  created_by: string
  assigned_to: string
  created_at: string
  status: AssignmentStatus
  submission_id: string | null
  submitted_content: string | null
  feedback: string | null
}

export interface StudentWithStats {
  id: string
  name: string
  email: string
  pending: number
  submitted: number
  reviewed: number
  total: number
}

export interface SubmissionWithDetails {
  id: string
  content: string
  status: SubmissionStatus
  submitted_at: string
  feedback: string | null
  assignments: {
    id: string
    title: string
    description: string
  }
  users: {
    id: string
    name: string
    email: string
  }
}
