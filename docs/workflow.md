# Workflow

This cleanup pass makes Nexus easier to evaluate as an assignment repo and closer to the AI Mail benchmark structure.

## Current Build State

- Next.js App Router app.
- Supabase-backed users, mentor-student mapping, assignments, and submissions.
- JWT auth with httpOnly cookie.
- Student and mentor dashboards.
- Assignment creation, submission, review feedback, and optional grades.
- Vitest coverage for review validation.
- Public README with setup, seed credentials, scope, stack decisions, and AI usage disclosure.

## Cleanup Pass

- Synced local `main` to the remote GitHub state shown in the screenshot.
- Installed dependencies so verification can run locally.
- Applied dependency audit fixes that do not require a major downgrade.
- Renamed the package from `lwl-temp` to `lwl-dashboard`.
- Added `.env.example` with placeholder variables.
- Added `SPEC.md` with product goals, non-goals, flows, and acceptance criteria.
- Added `docs/architecture.md` with runtime flow, module map, security posture, cost notes, and hardening backlog.

## Verification Commands

```bash
npm test
npm run build
npm audit --audit-level=high
```

`npm audit --audit-level=high` should pass. Moderate Next/PostCSS advisories may still appear because npm currently suggests a breaking downgrade path for the remaining advisory set.
