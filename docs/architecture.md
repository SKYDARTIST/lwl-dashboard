# Architecture

Nexus is a Next.js App Router application with two supported data-layer shapes:

- **Active hosted demo:** static seed data plus per-visitor HTTP-only cookie persistence.
- **Archived real-backend path:** Supabase Postgres schema, seed script, and server client preserved for restoring database-backed auth/data when needed.

The public deployment currently uses demo mode so portfolio reviewers can exercise the full product without depending on a paused free-tier Supabase project.

## Runtime Flow

1. Users land on `app/page.tsx` and choose the student or mentor path.
2. `app/login/page.tsx` posts credentials to `app/api/auth/login/route.ts`.
3. In demo mode, the login route accepts any non-empty email/password. Recognized seed emails become that seeded user; unknown emails become `Guest Student`.
4. `lib/auth.ts` signs a JWT into an HTTP-only cookie. `proxy.ts` protects `/student` and `/mentor` routes and redirects users to the correct role area.
5. Dashboard server components read role-scoped data through `lib/demo/store.ts`, which merges static seed data with the visitor's cookie-backed mutations.
6. Student and mentor forms call API routes for submissions, assignment creation, reviews, logout, and demo reset.

## Key Modules

- `lib/demo/seed.ts` - deterministic users, mentor-student links, assignments, and submissions for the hosted demo.
- `lib/demo/store.ts` - active demo data layer; reads/writes the `nexus_demo` cookie, caps payload size, and applies mutations over the seed state.
- `lib/auth.ts` - JWT parsing and signing, with a fixed demo fallback secret when `JWT_SECRET` is unset.
- `proxy.ts` - route-level role guard for `/student` and `/mentor`.
- `lib/csrf.ts` - same-origin check used by every mutation route.
- `app/api/auth/login/route.ts` - demo login, seeded-user matching, guest fallback, and token cookie creation.
- `app/api/assignments/route.ts` - mentor-only assignment creation with roster ownership check.
- `app/api/submissions/route.ts` - student-only submission creation with assignment ownership and duplicate guard.
- `app/api/submissions/[id]/review/route.ts` - mentor-only review with student ownership check.
- `lib/review-validation.ts` - testable review feedback and grade validation.
- `supabase/schema.sql`, `scripts/seed.ts`, `lib/supabase/server.ts` - preserved Supabase implementation path, not used by the hosted demo.

## Security Posture

**Still enforced in demo mode**

- Session token is stored in an HTTP-only cookie.
- API routes enforce role checks server-side, not only through the UI.
- Mentor actions verify the target student belongs to the signed-in mentor.
- Student submissions verify the assignment belongs to the signed-in student.
- Duplicate submissions are rejected.
- Mutation routes verify `Origin` against the request origin to block CSRF.
- Demo mutations are size-capped against the encoded cookie payload and stored per visitor.

**Intentionally relaxed in demo mode**

- Login accepts any non-empty email/password so reviewers are not blocked by credentials.
- `JWT_SECRET` falls back to a fixed demo secret when unset. This is acceptable for the hosted demo because there are no real accounts, private records, billing flows, or shared database state.
- Rate limiting is not active in the demo path because no paid API, database write, or auth provider is being protected.

## Supabase Restoration Path

The repo keeps the original Supabase assets so the app can be moved back to a real backend:

1. Provision a Supabase project.
2. Apply `supabase/schema.sql`.
3. Configure the env vars from `.env.example`.
4. Run `scripts/seed.ts`.
5. Restore the Supabase-backed route/page logic from the commit history before the May 2026 demo-mode conversion.

That path should also restore real password verification, durable rate limiting, and database-specific ownership checks before being used for production data.

## Cost and Performance

- Hosted demo mode has no database, auth provider, AI API, or usage-based infrastructure cost.
- Cookie-backed mutations are intentionally small and per-browser. This is appropriate for portfolio review traffic, not for real class-wide usage.
- Production class-wide use should use Supabase or another durable database with pagination, indexes, backups, and operational monitoring.

## Production Hardening Backlog

- Restore durable auth and persistence before storing real student data.
- Generate Supabase TypeScript types if the database runtime is re-enabled.
- Add row-level security policies if client-side Supabase access is introduced.
- Move rate limiting to durable storage for multi-instance deployments.
- Add pagination/search before using with large cohorts.
- Add notification delivery for new assignments and reviewed submissions.
- Improve mobile layout below tablet widths.
- Add Playwright smoke tests for role redirects and core dashboard flows.
