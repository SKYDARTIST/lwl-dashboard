# Architecture

Nexus is a Next.js App Router application backed by Supabase Postgres and a small JWT auth layer.

## Runtime Flow

1. Users land on `app/page.tsx` and choose student or mentor login.
2. `app/login/page.tsx` posts credentials to `app/api/auth/login/route.ts`.
3. The login route verifies the password hash in Supabase and sets an httpOnly JWT cookie.
4. `proxy.ts` protects `/student` and `/mentor` routes and redirects users to the correct role area.
5. Dashboard server components fetch role-scoped data from Supabase.
6. Student and mentor forms call API routes for submissions, assignment creation, and reviews.

## Key Modules

- `lib/auth.ts` - JWT parsing and signing.
- `proxy.ts` - route-level role guard.
- `lib/supabase/server.ts` - server-side Supabase client using service role credentials.
- `app/api/auth/login/route.ts` - login validation, password check, rate limit, and cookie creation.
- `app/api/assignments/route.ts` - mentor-only assignment creation with roster ownership check.
- `app/api/submissions/route.ts` - student-only submission creation with assignment ownership and duplicate guard.
- `app/api/submissions/[id]/review/route.ts` - mentor-only review with student ownership check.
- `lib/review-validation.ts` - testable review feedback and grade validation.
- `scripts/seed.ts` - deterministic demo data.

## Security Posture

- `JWT_SECRET` is required at runtime; there is no fallback secret.
- Session token is stored in an httpOnly cookie.
- API routes enforce role checks server-side, not only through the UI.
- Mentor actions verify the target student belongs to the signed-in mentor.
- Student submissions verify the assignment belongs to the signed-in student.
- Login has an in-memory per-IP/email rate limit for demo protection.
- `.env*` files are ignored; `.env.example` contains placeholders only.

## Cost and Performance

- Supabase is the only hosted backend dependency.
- There are no AI API calls or usage-based model costs.
- The demo can run on Supabase free tier for small review traffic.
- Current data fetching is simple and suitable for seed-scale data; production class-wide use would need pagination and indexed query review.

## Production Hardening Backlog

- Move rate limiting to durable storage for multi-instance deployments.
- Generate Supabase TypeScript types instead of relying on loose row shapes.
- Add row-level security policies if client-side Supabase access is introduced.
- Add pagination/search before using with large cohorts.
- Add notification delivery for new assignments and reviewed submissions.
- Improve mobile layout below tablet widths.
- Add Playwright smoke tests for role redirects and core dashboard flows.
