# Nexus Spec

Nexus is a two-sided student and mentor dashboard for assignment submission, review, and feedback. The assignment goal is to show a practical learning workflow with clear role separation, usable dashboards, and enough production hardening to make the public demo credible.

The hosted version is intentionally in demo mode: static seed data plus per-visitor cookie persistence. The original Supabase-backed schema, seed script, and server client remain in the repo so the project can be restored to a database-backed version when needed.

## Product Goals

- Let students see assigned work, submit responses, and review feedback or grades.
- Let mentors see their students, inspect submission status, create assignments, and review submitted work.
- Keep student and mentor experiences separate at the route and API level.
- Make the demo easy to evaluate with seed users and documented credentials.
- Keep the public deployment reliable even when no Supabase project is active.
- Preserve a clear restoration path for Supabase-backed auth and persistence.
- Show a focused learning product rather than a broad LMS clone.

## Non-Goals

- No sign-up flow.
- No file uploads.
- No realtime notifications.
- No search, pagination, or class-wide analytics in this version.
- No production multi-tenant account management.

## User Flows

### Student

1. Student signs in with a seeded account, or any email/password for the guest demo account.
2. Student views pending, submitted, and reviewed assignments.
3. Student opens an assignment and submits text work.
4. Student sees mentor feedback and optional grade after review.

### Mentor

1. Mentor signs in with a seeded mentor account.
2. Mentor views assigned students and submission counts.
3. Mentor creates a new assignment for one of their students.
4. Mentor reviews a submitted assignment with feedback and optional grade.

## Acceptance Criteria

- Students cannot access mentor pages or mentor-only API actions.
- Mentors cannot review or assign work for students outside their roster.
- Duplicate submissions are rejected.
- Review feedback is required and grades are constrained to the supported grade list.
- Long assignment, submission, and feedback payloads are rejected.
- JWT auth uses an HTTP-only cookie. Demo mode may use a documented fallback secret; a real backend deployment must configure `JWT_SECRET`.
- Demo mutations persist per visitor and can be reset without affecting other visitors.
- Mutation routes enforce same-origin CSRF checks.
- Demo credentials are clearly marked as demo data.
- Tests and production build pass before submission.
