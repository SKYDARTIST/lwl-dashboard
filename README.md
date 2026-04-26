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
```

9 tests covering the submission review validation flow: feedback required, whitespace trimming, all valid grades accepted, invalid grades rejected, optional grade (null), and full happy-path.

---

## AI tool usage

This project was built with **Claude Code (claude-sonnet-4-6)** as the primary coding assistant — roughly 85–90% of the code was written or directly shaped by AI. My role was product decisions (what to build and cut), reviewing every diff before it was committed, directing fixes when something broke, and driving the session end-to-end.

I can walk through any part of the code, explain the decisions, and extend a feature live — the AI wrote it, but I understood and directed every step.
