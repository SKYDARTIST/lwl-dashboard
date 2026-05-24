import { cookies } from 'next/headers'
import type { NextResponse } from 'next/server'
import {
  SEED_USERS,
  SEED_MENTOR_STUDENTS,
  SEED_ASSIGNMENTS,
  SEED_SUBMISSIONS,
  type SeedAssignment,
  type SeedSubmission,
  type SeedUser,
} from './seed'

// Per-visitor mutations are stored in a single HTTP-only cookie. Browsers
// silently drop cookies above ~4KB, so we trim the oldest entries until the
// URL-encoded payload fits well under that limit. The 3800-byte budget leaves
// headroom for the cookie's name + attributes.
const COOKIE_NAME = 'nexus_demo'
const COOKIE_MAX_BYTES = 3800
// Per-field soft cap so a single oversized payload (e.g. a 10KB submission)
// gets truncated rather than evicting all other mutations from the cookie.
const FIELD_MAX_CHARS = 1500
const TRUNCATION_SUFFIX = '… [truncated in demo]'

// Mutations are keyed so that re-submitting the same logical change overwrites
// the previous entry instead of stacking. Keys:
//   assign:<id>                            - one new assignment per id
//   submit:<assignment_id>:<student_id>    - one submission per (assignment, student)
//   review:<submission_id>                 - one review per submission
//
// Note: writes are read-modify-write against the request cookie, so two
// concurrent mutations from the same browser can still race (last write wins).
// In practice visitors click serially and router.refresh() runs after each POST
// resolves, so this race surfaces only in pathological multi-tab use.

type AssignMutation = { t: 'assign'; id: string; title: string; description: string; created_by: string; assigned_to: string; created_at: string }
type SubmitMutation = { t: 'submit'; id: string; assignment_id: string; student_id: string; content: string; submitted_at: string }
type ReviewMutation = { t: 'review'; submission_id: string; feedback: string; grade: string | null; reviewed_at: string }
type Mutation = AssignMutation | SubmitMutation | ReviewMutation

export interface DemoState {
  users: SeedUser[]
  mentor_students: typeof SEED_MENTOR_STUDENTS
  assignments: SeedAssignment[]
  submissions: SeedSubmission[]
}

function keyFor(m: Mutation): string {
  if (m.t === 'assign') return `assign:${m.id}`
  if (m.t === 'submit') return `submit:${m.assignment_id}:${m.student_id}`
  return `review:${m.submission_id}`
}

function readMutations(value: string | undefined): Record<string, Mutation> {
  if (!value) return {}
  try {
    const parsed = JSON.parse(value)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, Mutation>
    }
    return {}
  } catch {
    return {}
  }
}

function applyMutations(record: Record<string, Mutation>): DemoState {
  // Apply in insertion order so reviews land after their submissions
  const mutations = Object.values(record)
  const assignments: SeedAssignment[] = [...SEED_ASSIGNMENTS]
  let submissions: SeedSubmission[] = [...SEED_SUBMISSIONS]

  for (const m of mutations) {
    if (m.t === 'assign') {
      assignments.push({
        id: m.id,
        title: m.title,
        description: m.description,
        created_by: m.created_by,
        assigned_to: m.assigned_to,
        created_at: m.created_at,
      })
    } else if (m.t === 'submit') {
      const exists = submissions.some(
        s => s.assignment_id === m.assignment_id && s.student_id === m.student_id,
      )
      if (!exists) {
        submissions.push({
          id: m.id,
          assignment_id: m.assignment_id,
          student_id: m.student_id,
          content: m.content,
          status: 'submitted',
          feedback: null,
          grade: null,
          submitted_at: m.submitted_at,
          reviewed_at: null,
        })
      }
    } else if (m.t === 'review') {
      submissions = submissions.map(s =>
        s.id === m.submission_id
          ? { ...s, status: 'reviewed', feedback: m.feedback, grade: m.grade, reviewed_at: m.reviewed_at }
          : s,
      )
    }
  }

  return {
    users: SEED_USERS,
    mentor_students: SEED_MENTOR_STUDENTS,
    assignments,
    submissions,
  }
}

function truncate(text: string, maxChars = FIELD_MAX_CHARS): string {
  if (text.length <= maxChars) return text
  return text.slice(0, maxChars - TRUNCATION_SUFFIX.length) + TRUNCATION_SUFFIX
}

function encodedCookieBytes(record: Record<string, Mutation>): number {
  return encodeURIComponent(JSON.stringify(record)).length
}

// Mutations contain visitor-supplied text fields. The cookie has a hard 4KB
// browser limit, so first truncate large text fields, then drop oldest
// entries if the total payload still exceeds the budget. The newest mutation
// is always retained so the visitor sees the action they just took.
function shrinkMutation(m: Mutation, maxChars = FIELD_MAX_CHARS): Mutation {
  if (m.t === 'assign') return { ...m, title: truncate(m.title, maxChars), description: truncate(m.description, maxChars) }
  if (m.t === 'submit') return { ...m, content: truncate(m.content, maxChars) }
  return { ...m, feedback: truncate(m.feedback, maxChars) }
}

function trimToBudget(record: Record<string, Mutation>, latestKey: string): Record<string, Mutation> {
  let size = encodedCookieBytes(record)
  if (size <= COOKIE_MAX_BYTES) return record

  // Drop oldest entries (excluding the latest, which the user just produced)
  // until we fit. If the latest alone exceeds the budget, it has already been
  // truncated to FIELD_MAX_CHARS before this function runs.
  const keys = Object.keys(record).filter(k => k !== latestKey)
  while (keys.length > 0 && size > COOKIE_MAX_BYTES) {
    const oldest = keys.shift()!
    delete record[oldest]
    size = encodedCookieBytes(record)
  }

  // If the latest mutation alone is still too large after URL encoding
  // (common with emoji or non-Latin text), progressively compress its text.
  const latest = record[latestKey]
  for (const limit of [750, 500, 250, 120]) {
    if (size <= COOKIE_MAX_BYTES || !latest) break
    record[latestKey] = shrinkMutation(latest, limit)
    size = encodedCookieBytes(record)
  }

  return record
}

export async function getDemoState(): Promise<DemoState> {
  const cookieStore = await cookies()
  const raw = cookieStore.get(COOKIE_NAME)?.value
  return applyMutations(readMutations(raw))
}

export async function appendMutation(mutation: Mutation, res: NextResponse): Promise<void> {
  const cookieStore = await cookies()
  const raw = cookieStore.get(COOKIE_NAME)?.value
  const record = readMutations(raw)
  // Re-insert by deleting first so the key moves to the end of insertion order
  const key = keyFor(mutation)
  delete record[key]
  record[key] = shrinkMutation(mutation)

  const trimmed = trimToBudget(record, key)
  res.cookies.set(COOKIE_NAME, JSON.stringify(trimmed), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
}

export function newId(prefix: string): string {
  // Short, URL-safe, non-cryptographic — only used for client-visible demo records
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export const DEMO_COOKIE_NAME = COOKIE_NAME
