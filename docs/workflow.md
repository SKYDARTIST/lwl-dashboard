# Workflow

This cleanup pass makes Nexus easier to evaluate as an assignment repo while keeping the live demo reliable.

## Current Build State

- Next.js App Router app.
- Hosted demo runs from static seed data plus per-visitor HTTP-only cookie persistence.
- Supabase schema, seed script, and server client are preserved as the restorable real-backend path.
- JWT auth with httpOnly cookie.
- Student and mentor dashboards.
- Assignment creation, submission, review feedback, and optional grades.
- Same-origin CSRF checks on mutation routes.
- Vitest coverage for review validation.
- Public README with setup, seed credentials, demo-mode rationale, Supabase restoration notes, scope, stack decisions, and AI usage disclosure.

## Cleanup Pass

- Synced local `main` to the remote GitHub state shown in the screenshot.
- Installed dependencies so verification can run locally.
- Applied dependency audit fixes that do not require a major downgrade.
- Renamed the package from `lwl-temp` to `lwl-dashboard`.
- Added `.env.example` with placeholder variables.
- Added `SPEC.md` with product goals, non-goals, flows, and acceptance criteria.
- Added `docs/architecture.md` with runtime flow, module map, security posture, cost notes, and hardening backlog.
- Converted the hosted deployment to demo mode after Supabase free-tier inactivity made the public login unreliable.
- Updated docs to distinguish the current cookie-backed demo from the preserved Supabase implementation path.

## Verification Commands

```bash
npm test
npm run build
npm audit --audit-level=high
```

`npm audit --audit-level=high` should pass. Moderate Next/PostCSS advisories may still appear because npm currently suggests a breaking downgrade path for the remaining advisory set.
