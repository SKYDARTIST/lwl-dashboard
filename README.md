# Nexus — Student & Mentor Dashboard

A two-sided learning platform. Students submit work; mentors review it and give feedback.

**Live demo:** https://lwl-dashboard.vercel.app

---

## Demo mode (May 2026 update)

The live site now runs without a database. Here's why and what changed.

**Why:** Supabase's free tier allows only 2 active projects per account. Both slots are taken by my live apps that earn revenue (Anti-Gravity on the Play Store, MindMint). Inactive projects auto-pause after 7 days, which had made this portfolio demo return 401 on every login.

**The fix:** I rebuilt the data layer to run entirely from a static seed file plus per-visitor browser cookies — no database calls anywhere. The app behaves identically: you log in, submit assignments, give reviews, create new ones, everything works end-to-end. Mutations persist in your browser via an HTTP-only cookie until you reset.

**What this means for a visitor:**
- Any email + any password works as a login.
- Recognized seed emails (e.g. `aarav@lwl.edu`) put you in that user's account with their existing assignments and history.
- Unrecognized emails put you in a fresh **Guest Student** account with 4 clean pending assignments — so you can test the submit flow without bumping into Aarav's already-submitted work.
- A small **"Demo mode"** pill bottom-right of the dashboard opens a popover with a **Reset demo state** button.

**What this means for the code:** [`lib/demo/`](lib/demo/) replaces the Supabase data layer. The original Supabase setup (schema, seed script, server client) is left in the repo for reference but is unused.

---

## Deliverables

- **Live demo:** https://lwl-dashboard.vercel.app
- [`SPEC.md`](SPEC.md) — product goals, non-goals, user flows, and acceptance criteria
- [`docs/architecture.md`](docs/architecture.md) — runtime flow, module map, security posture, cost notes, and hardening backlog
- [`docs/workflow.md`](docs/workflow.md) — cleanup notes and verification commands
- [`__tests__/review-validation.test.ts`](__tests__/review-validation.test.ts) — validation coverage for the review flow

---

## Setup (under 2 minutes)

### Prerequisites
- Node.js 18+

### 1. Clone and install

```bash
git clone https://github.com/SKYDARTIST/lwl-dashboard.git
cd lwl-dashboard
npm install
```

### 2. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3005](http://localhost:3005). No database, no env vars, no seed step — everything runs from `lib/demo/`.

> **Want a real backend?** The original Supabase setup is preserved in [`supabase/schema.sql`](supabase/schema.sql) and [`scripts/seed.ts`](scripts/seed.ts). Set the original env vars (`.env.example`) and swap `getDemoState()` back to `getSupabase()` in the dashboard pages and API routes. See the git history before the May 2026 demo-mode commit.

---

## Seed credentials

| Role    | Name          | Email              | Password    |
|---------|---------------|--------------------|-------------|
| Mentor  | Priya Sharma  | priya@lwl.edu      | mentor123   |
| Mentor  | Ravi Kumar    | ravi@lwl.edu       | mentor123   |
| Student | Aarav Singh   | aarav@lwl.edu      | student123  |
| Student | Meera Patel   | meera@lwl.edu      | student123  |
| Student | Kabir Nair    | kabir@lwl.edu      | student123  |
| Student | Ananya Reddy  | ananya@lwl.edu     | student123  |
| Student | Dev Joshi     | dev@lwl.edu        | student123  |
| Student | Zara Khan     | zara@lwl.edu       | student123  |

Aarav (assigned to Priya) has the richest seed data: 2 reviewed assignments with grades, 1 submitted awaiting review, and 2 pending — good for demoing all states in one login.

---

## What I built

I wanted the app to feel simple and easy to use — not something that looks impressive but confuses people. The whole point is that a student should open it and immediately know what they need to do, and a mentor should open it and immediately know what needs their attention.

The landing page does one job: tells you what the app is and lets you pick who you are. Student or mentor. From there each person gets their own sign-in flow and their own dashboard. A student literally cannot get into the mentor dashboard and vice versa — the routes are protected both at the middleware level and in the API.

**Student side** — you see all your assignments with colour-coded status (amber = pending, blue = submitted, green = reviewed). Click any row and the detail opens right in the sidebar — no scrolling, no page jump. The submit form has a character counter so you know how much you've written. When a mentor reviews your work you can see their feedback and your grade right there.

**Mentor side** — you see all your students with live stats (how many pending, how many waiting for review, how many done). Click a student to expand their assignments. There's a floating modal when you click an assignment so you can read everything without leaving the page. The review form has an optional grade selector and a feedback textarea. There's also a "New Assignment" button in the header so mentors can assign work directly from the dashboard.

Both sides have light and dark mode.

**All must-haves done.** All 5 bonuses done (progress indicator, dark mode, create assignment, letter grades, Vitest tests).

---

## What I kept out

Everything in the brief is built. The items I left out were the ones the brief itself flagged as out of scope — sign-up flow, real-time updates, file uploads, search and pagination. Those weren't judgment calls, they were already ruled out.

The one thing I considered adding beyond the brief was per-assignment due dates. Decided against it — it would've needed a schema change, timezone handling, and server-side submission blocking. Not worth the risk of breaking something that was already working cleanly.

---

## What I'd build next

Right now it works for 6 students and 2 mentors. What I'd actually want to turn this into is a full personalised growth dashboard for a whole class.

Each student could track not just assignments but exams, projects, and general progress over time. Mentors could see a student's full trajectory — not just "did they submit this assignment" but how they're improving. The feedback loop would become a proper coaching tool.

The other thing I'd add immediately is notifications. Right now you have to log in to know if something happened. A student should get notified the moment a new assignment is assigned or feedback lands. A mentor should get notified when a submission comes in. That would make the review loop actually fast instead of relying on people to check in.

On the technical side: mobile layout needs work (the sidebar breaks below ~768px), and I'd generate TypeScript types from Supabase instead of using `any` for DB rows.

---

## Why this stack

I've used Next.js, Supabase, and JWT across several personal projects before this. I don't come from a CS background so I made a deliberate call — use the tools I know well and focus on building something solid, rather than experiment with something new and end up with something half-done. The stack fit the brief well anyway: Supabase gives a live database with a public URL so the demo actually works, Next.js handles both the UI and the API in one project, and JWT in an httpOnly cookie is simple auth that doesn't need a third-party service.

Other choices worth noting:
- **Tailwind v4 CSS-first config** — `@theme` directive with CSS custom properties for the full light/dark token system
- **Vitest** — extracted the review validation logic into `lib/review-validation.ts` so it could be tested without mocking any Next.js internals
- **Server Components by default** — client components only where state is needed (forms, modal, theme toggle)

---

## Running tests

```bash
npm test
npm run build
npm audit --audit-level=high
```

9 tests covering the submission review validation flow: feedback required, whitespace trimming, all valid grades accepted, invalid grades rejected, optional grade (null), and full happy-path.

## Security posture

The app was originally hardened for a real backend (JWT + bcrypt + Supabase RLS + rate-limiting + ownership checks at every API). Demo mode keeps most of that and relaxes what makes sense for a public, no-backend demo:

**Still enforced**
- JWT in an httpOnly cookie; role and ownership checks on every mutation route (mentors can only review their own students' work; students can only submit to their own assignments).
- Route protection at both the `proxy.ts` middleware layer and the page-level `getUser()` check.
- CSRF protection: every mutation route (`/api/auth/login`, `/api/auth/logout`, `/api/assignments`, `/api/submissions`, `/api/submissions/[id]/review`, `/api/demo/reset`) verifies the `Origin` header matches the request origin.
- Cookie size is capped at ~3.8KB with per-field truncation, so a single oversized payload can't silently break a visitor's session.

**Relaxed for demo mode (intentional)**
- Login accepts any email + any non-empty password. No bcrypt comparison, no rate-limit. The goal is to let any visitor try the app instantly; there's no real account to protect.
- `JWT_SECRET` falls back to a hardcoded string when unset. Anyone could forge a mentor token, but since you can also self-promote via the login endpoint, this isn't a privilege boundary worth defending in a public demo.
- All visitor data lives in their own browser cookie. There is no cross-visitor state to leak.

---

## AI tool usage

This project was built with **Claude Code (claude-sonnet-4-6)** as the primary coding assistant — roughly 85–90% of the code was written or directly shaped by AI. My role was product decisions (what to build and cut), reviewing every diff before it was committed, directing fixes when something broke, and driving the session end-to-end.

I can walk through any part of the code, explain the decisions, and extend a feature live — the AI wrote it, but I understood and directed every step.
