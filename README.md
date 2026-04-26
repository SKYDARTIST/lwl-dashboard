# Nexus — Student & Mentor Dashboard

A two-sided learning platform. Students submit work; mentors review it and give feedback.

**Live demo:** https://lwl-dashboard.vercel.app

---

## Setup (under 5 minutes)

### Prerequisites
- Node.js 18+
- A Supabase project (free tier is fine)

### 1. Clone and install

```bash
git clone https://github.com/SKYDARTIST/lwl-dashboard.git
cd lwl-dashboard
npm install
```

### 2. Environment variables

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
JWT_SECRET=any_random_string_at_least_32_chars
```

### 3. Create the database schema

Run this SQL in your Supabase SQL Editor (Dashboard → SQL Editor):

```sql
create table users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  password_hash text not null,
  role text not null check (role in ('student', 'mentor')),
  created_at timestamptz default now()
);

create table mentor_students (
  mentor_id uuid references users(id) on delete cascade,
  student_id uuid references users(id) on delete cascade,
  primary key (mentor_id, student_id)
);

create table assignments (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  created_by uuid references users(id) on delete cascade,
  assigned_to uuid references users(id) on delete cascade,
  created_at timestamptz default now()
);

create table submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid references assignments(id) on delete cascade,
  student_id uuid references users(id) on delete cascade,
  content text not null,
  status text not null default 'submitted' check (status in ('submitted', 'reviewed')),
  feedback text,
  grade text,
  submitted_at timestamptz default now(),
  reviewed_at timestamptz
);
```

### 4. Seed the database

```bash
npm run seed
```

This populates 2 mentors, 6 students, 12 assignments, and 8 submissions with mixed statuses.

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3005](http://localhost:3005).

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

## What I completed

**All must-haves:**
- Login with role-based routing (students can't access mentor routes and vice versa)
- JWT in an httpOnly cookie — 7-day expiry, verified on every request via middleware
- Student dashboard: assignment list with status badges, detail + submit view, feedback view
- Mentor dashboard: students list with per-student stats, submissions queue, full review flow
- Loading/empty states on every view; form validation with inline error messages; desktop-first responsive layout
- Seed data: 2 mentors, 6 students, 12 assignments, mixed statuses across all students

**All 5 bonuses:**
- Progress indicator — "X of Y completed" + indigo progress bar in the student sidebar
- Dark mode — full light/dark with persistent toggle, CSS custom properties
- Mentor can create assignments — "New Assignment" modal in the dashboard header, assigns to any of the mentor's students
- Letter grade — optional A+/A/A−…F grade selector in the review form; shown as a badge to both mentor and student
- Tests — 9 Vitest unit tests for the submission review validation flow (`npm test`)

---

## What I intentionally skipped

- **Sign-up / password reset** — seeded users only, as specified
- **Real-time updates** — `router.refresh()` after mutations is enough for the review loop; no websockets needed
- **File uploads** — text-only as specified
- **Search / pagination** — seed data is small enough that it's not needed; the stat-chip filter on the mentor dashboard exists because a mentor genuinely needs to slice "what needs review" from a multi-student view
- **Profile editing, settings** — out of scope

---

## What I'd do next with more time

1. **Multi-student assignment** — the create-assignment form currently assigns to one student at a time; a checkbox list would let mentors batch-assign
2. **Optimistic UI** — the submit and review forms do a full server refresh today; React transitions + optimistic state would make them feel instant
3. **Email on review** — one Resend call when a mentor marks reviewed so the student gets notified without polling
4. **Generated TypeScript types from Supabase** — currently using `any` for DB rows; `supabase gen types` would tighten this
5. **Mobile layout** — the sidebar collapses awkwardly below ~768px; a bottom-nav pattern would fix this properly

---

## Tech decisions worth noting

- **Next.js 16 App Router + Server Components** — all data fetching is server-side; client components are used only where state is needed (forms, modal, theme toggle)
- **Supabase (Postgres)** — chosen over SQLite because the free tier has a public URL, making the live demo possible without any extra hosting
- **JWT in httpOnly cookie** — simple, no third-party auth service, survives page refreshes; `jose` for signing/verification
- **Tailwind v4 CSS-first config** — `@theme` directive with CSS custom properties for the full light/dark token system
- **Vitest** — zero config for pure TS logic; the review validation logic was extracted into `lib/review-validation.ts` so it's testable without mocking Next.js internals

---

## Running tests

```bash
npm test
```

9 tests covering the submission review validation flow: feedback required, whitespace trimming, all valid grades accepted, invalid grades rejected, optional grade (null), and full happy-path.

---

## AI tool usage

This project was built with **Claude Code (claude-sonnet-4-6)** as the primary coding assistant — roughly 85–90% of the code was written or directly shaped by AI. My role was product decisions (what to build and cut), reviewing every diff before it was committed, directing fixes when something broke, and driving the session end-to-end.

I can walk through any part of the code, explain the decisions, and extend a feature live — the AI wrote it, but I understood and directed every step.
