# LWL Student & Mentor Dashboard — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a working two-sided learning platform where students submit assignments and mentors review them with feedback, deployed on Vercel with Supabase as the database.

**Architecture:** Next.js 14 App Router with two protected route groups (`/student/*` and `/mentor/*`). Custom JWT auth stored in httpOnly cookies for session persistence — simple to explain, no third-party auth service. Supabase Postgres as the database (service role key server-side, no RLS for take-home simplicity). Role-based middleware blocks cross-role access at the edge. Server components fetch data directly — no client-side data fetching needed.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Supabase (Postgres only), jose (JWT signing/verifying), bcryptjs (password hashing), Sonner (toasts), Lucide React (icons)

**Session Persistence Decision:** httpOnly cookie containing a signed JWT (7-day expiry). Cookie persists across browser restarts. No localStorage. Middleware verifies JWT on every request edge-side.

---

## File Map

```
learn-with-leaders/
├── app/
│   ├── layout.tsx                          # Root layout + Sonner Toaster
│   ├── page.tsx                            # Redirect → /login
│   ├── login/
│   │   └── page.tsx                        # Login form + quick-fill buttons
│   ├── student/
│   │   ├── layout.tsx                      # Student shell with sidebar
│   │   ├── page.tsx                        # Redirect → /student/dashboard
│   │   ├── dashboard/
│   │   │   ├── page.tsx                    # Assignment cards + progress bar
│   │   │   └── loading.tsx                 # Skeleton loader
│   │   └── assignment/[id]/
│   │       ├── page.tsx                    # Detail + submit form + feedback
│   │       └── loading.tsx                 # Skeleton loader
│   ├── mentor/
│   │   ├── layout.tsx                      # Mentor shell with sidebar
│   │   ├── page.tsx                        # Redirect → /mentor/dashboard
│   │   ├── dashboard/
│   │   │   ├── page.tsx                    # Students list with pending badge
│   │   │   └── loading.tsx
│   │   ├── queue/
│   │   │   ├── page.tsx                    # Submissions awaiting review
│   │   │   └── loading.tsx
│   │   └── review/[id]/
│   │       ├── page.tsx                    # Feedback form
│   │       └── loading.tsx
│   └── api/
│       ├── auth/
│       │   ├── login/route.ts              # POST — verify credentials, set cookie
│       │   └── logout/route.ts             # POST — clear cookie
│       └── submissions/
│           ├── route.ts                    # POST — student submits assignment
│           └── [id]/
│               └── review/route.ts         # PATCH — mentor submits feedback
├── components/
│   ├── ui/                                 # shadcn auto-generated
│   ├── student-sidebar.tsx                 # Nav: Dashboard
│   ├── mentor-sidebar.tsx                  # Nav: Students, Review Queue
│   ├── status-badge.tsx                    # yellow/blue/green badge
│   ├── assignment-card.tsx                 # Student home card
│   └── empty-state.tsx                     # Reusable empty state
├── lib/
│   ├── types.ts                            # All shared TypeScript types
│   ├── auth.ts                             # getUser() server helper
│   └── supabase/
│       └── server.ts                       # Service-role Supabase client
├── scripts/
│   └── seed.ts                             # Seed DB with users + data
├── middleware.ts                            # Route protection + role guard
├── .env.local                              # Supabase + JWT keys (gitignored)
├── .env.example                            # Safe template to commit
└── README.md
```

---

## Task 1: Project Scaffold

**Files:**
- Create: `learn-with-leaders/` (entire Next.js project)

- [ ] **Step 1: Init Next.js project inside the assessment folder**

Run from `/Users/cryptobulla/Desktop/BATMAN/assessments/`:
```bash
npx create-next-app@latest learn-with-leaders \
  --typescript \
  --tailwind \
  --app \
  --no-src-dir \
  --import-alias "@/*" \
  --no-git
```
When prompted, accept all defaults.

- [ ] **Step 2: Install dependencies**

```bash
cd learn-with-leaders
npm install @supabase/supabase-js jose bcryptjs sonner lucide-react
npm install -D @types/bcryptjs tsx
```

- [ ] **Step 3: Init shadcn/ui**

```bash
npx shadcn@latest init
```
Choose: Default style, Zinc base color, yes to CSS variables.

- [ ] **Step 4: Add shadcn components**

```bash
npx shadcn@latest add card badge button textarea table skeleton input label separator
```

- [ ] **Step 5: Create .env.local**

```bash
cat > .env.local << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=https://heoevdzthsxheivgfemo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhlb2V2ZHp0aHN4aGVpdmdmZW1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxMjcyMTgsImV4cCI6MjA5MjcwMzIxOH0.xZ63YaTKBO80cFmQKbEnww_Yka38uSKpHqKsc1NMOlo
SUPABASE_SERVICE_ROLE_KEY=PASTE_SERVICE_ROLE_KEY_HERE
JWT_SECRET=lwl-dashboard-secret-change-in-production-2026
EOF
```

> **Get service role key:** Supabase dashboard → project `lwl-dashboard` → Settings → API → Service role key (secret). Copy and paste it above.

- [ ] **Step 6: Create .env.example**

```bash
cat > .env.example << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
JWT_SECRET=any_random_secret_string
EOF
```

- [ ] **Step 7: Add .env.local to .gitignore — verify it's already there**

```bash
grep ".env.local" .gitignore
```
Expected output: `.env.local` — it's already excluded by Next.js scaffold.

- [ ] **Step 8: Verify dev server starts**

```bash
npm run dev
```
Expected: server starts on http://localhost:3000 with no errors.

- [ ] **Step 9: Commit**

```bash
git init
git remote add origin https://github.com/SKYDARTIST/lwl-dashboard.git
git add -A
git commit -m "feat: scaffold Next.js project with shadcn, Supabase, auth deps"
git branch -M main
git push -u origin main
```

---

## Task 2: Database Schema

**Files:**
- Create: `supabase/schema.sql`

- [ ] **Step 1: Write the schema**

Create file `supabase/schema.sql`:
```sql
-- Users: students and mentors
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  password_hash text not null,
  role text not null check (role in ('student', 'mentor')),
  created_at timestamptz default now()
);

-- Which students belong to which mentor
create table if not exists mentor_students (
  mentor_id uuid references users(id) on delete cascade,
  student_id uuid references users(id) on delete cascade,
  primary key (mentor_id, student_id)
);

-- Assignments created by mentors and assigned to students
create table if not exists assignments (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  created_by uuid references users(id) on delete cascade,
  assigned_to uuid references users(id) on delete cascade,
  created_at timestamptz default now()
);

-- Submissions by students; status derived from this table
create table if not exists submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid references assignments(id) on delete cascade,
  student_id uuid references users(id) on delete cascade,
  content text not null,
  status text not null default 'submitted' check (status in ('submitted', 'reviewed')),
  feedback text,
  submitted_at timestamptz default now(),
  reviewed_at timestamptz,
  unique(assignment_id, student_id)
);
```

- [ ] **Step 2: Run schema in Supabase SQL editor**

Go to: Supabase dashboard → lwl-dashboard → SQL Editor → New query
Paste the full contents of `supabase/schema.sql` and click **Run**.
Expected: "Success. No rows returned."

- [ ] **Step 3: Commit**

```bash
git add supabase/schema.sql
git commit -m "feat: add database schema (users, mentor_students, assignments, submissions)"
```

---

## Task 3: Seed Script

**Files:**
- Create: `scripts/seed.ts`

- [ ] **Step 1: Write the seed script**

Create `scripts/seed.ts`:
```typescript
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function hash(password: string) {
  return bcrypt.hash(password, 10)
}

async function seed() {
  console.log('🌱 Seeding database...')

  // Clear existing data in order (respect FK constraints)
  await supabase.from('submissions').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('assignments').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('mentor_students').delete().neq('mentor_id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000')

  // Create users
  const mentorPass = await hash('mentor123')
  const studentPass = await hash('student123')

  const { data: users, error: usersError } = await supabase
    .from('users')
    .insert([
      { name: 'Priya Sharma',  email: 'priya@lwl.edu',   password_hash: mentorPass,  role: 'mentor' },
      { name: 'Ravi Kumar',    email: 'ravi@lwl.edu',    password_hash: mentorPass,  role: 'mentor' },
      { name: 'Aarav Singh',   email: 'aarav@lwl.edu',   password_hash: studentPass, role: 'student' },
      { name: 'Meera Patel',   email: 'meera@lwl.edu',   password_hash: studentPass, role: 'student' },
      { name: 'Kabir Nair',    email: 'kabir@lwl.edu',   password_hash: studentPass, role: 'student' },
      { name: 'Ananya Reddy',  email: 'ananya@lwl.edu',  password_hash: studentPass, role: 'student' },
      { name: 'Dev Joshi',     email: 'dev@lwl.edu',     password_hash: studentPass, role: 'student' },
      { name: 'Zara Khan',     email: 'zara@lwl.edu',    password_hash: studentPass, role: 'student' },
    ])
    .select()

  if (usersError) { console.error('Users error:', usersError); process.exit(1) }
  console.log('✅ Users created')

  const byEmail = (email: string) => users!.find(u => u.email === email)!
  const priya   = byEmail('priya@lwl.edu')
  const ravi    = byEmail('ravi@lwl.edu')
  const aarav   = byEmail('aarav@lwl.edu')
  const meera   = byEmail('meera@lwl.edu')
  const kabir   = byEmail('kabir@lwl.edu')
  const ananya  = byEmail('ananya@lwl.edu')
  const dev     = byEmail('dev@lwl.edu')
  const zara    = byEmail('zara@lwl.edu')

  // Mentor → student relationships
  await supabase.from('mentor_students').insert([
    { mentor_id: priya.id, student_id: aarav.id },
    { mentor_id: priya.id, student_id: meera.id },
    { mentor_id: priya.id, student_id: kabir.id },
    { mentor_id: ravi.id,  student_id: ananya.id },
    { mentor_id: ravi.id,  student_id: dev.id },
    { mentor_id: ravi.id,  student_id: zara.id },
  ])
  console.log('✅ Mentor-student links created')

  // Assignments (mixed statuses)
  const { data: assignments, error: aErr } = await supabase
    .from('assignments')
    .insert([
      // Aarav's assignments (Priya)
      { title: 'Introduction to React',    description: 'Read the React docs and summarise the key concepts of components, props, and state in your own words. Minimum 200 words.', created_by: priya.id, assigned_to: aarav.id },
      { title: 'Build a Counter App',      description: 'Create a simple counter application using React hooks. It should have increment, decrement, and reset buttons. Explain your useState usage.', created_by: priya.id, assigned_to: aarav.id },
      { title: 'Async JavaScript',         description: 'Explain the difference between callbacks, promises, and async/await. Write a code example for each that fetches data from a public API.', created_by: priya.id, assigned_to: aarav.id },
      // Meera's assignments (Priya)
      { title: 'CSS Flexbox Challenge',    description: 'Build a responsive card layout using only Flexbox. The layout should have 3 columns on desktop and 1 column on mobile. No CSS Grid allowed.', created_by: priya.id, assigned_to: meera.id },
      { title: 'REST API Integration',     description: 'Use the JSONPlaceholder API to build a simple user list. Show loading state while fetching and handle errors gracefully.', created_by: priya.id, assigned_to: meera.id },
      // Kabir's assignment (Priya)
      { title: 'TypeScript Basics',        description: 'Convert a given JavaScript file to TypeScript. Add proper type annotations to all variables, functions, and return types. Explain 3 benefits of TypeScript.', created_by: priya.id, assigned_to: kabir.id },
      // Ananya's assignments (Ravi)
      { title: 'Python Functions',         description: 'Write 5 Python functions demonstrating: default arguments, *args, **kwargs, lambda functions, and recursion. Include a docstring for each.', created_by: ravi.id,  assigned_to: ananya.id },
      { title: 'Data Structures in Python',description: 'Implement a stack and a queue in Python from scratch (no collections module). Write 3 test cases for each implementation.', created_by: ravi.id,  assigned_to: ananya.id },
      // Dev's assignment (Ravi)
      { title: 'Git Workflow',             description: 'Document your understanding of the Git feature branch workflow. Include: creating branches, committing, pushing, and opening a pull request. Use diagrams or pseudocode.', created_by: ravi.id,  assigned_to: dev.id },
      // Zara's assignment (Ravi)
      { title: 'Node.js Fundamentals',     description: 'Build a simple Express.js server with 3 routes: GET /users (returns list), GET /users/:id (returns one), POST /users (creates one). Use in-memory array as storage.', created_by: ravi.id,  assigned_to: zara.id },
    ])
    .select()

  if (aErr) { console.error('Assignments error:', aErr); process.exit(1) }
  console.log('✅ Assignments created')

  const byTitle = (title: string) => assignments!.find(a => a.title === title)!

  // Submissions (creates pending/submitted/reviewed statuses)
  const { error: sErr } = await supabase.from('submissions').insert([
    // Aarav: "Build a Counter App" → submitted (no feedback yet)
    {
      assignment_id: byTitle('Build a Counter App').id,
      student_id: aarav.id,
      content: 'I built the counter using useState. The increment adds 1, decrement subtracts 1 with a minimum of 0, and reset sets it back to 0. I learned that useState re-renders the component every time state changes, which is why the UI stays in sync automatically.',
      status: 'submitted',
    },
    // Aarav: "Async JavaScript" → reviewed (has feedback)
    {
      assignment_id: byTitle('Async JavaScript').id,
      student_id: aarav.id,
      content: 'Callbacks are functions passed into other functions. Promises are objects that represent future values with .then() and .catch(). Async/await is syntactic sugar over promises that makes async code read like sync code. Example: const data = await fetch(url).then(r => r.json()).',
      status: 'reviewed',
      feedback: 'Great explanation of the progression from callbacks to async/await. Your code example is correct. Next step: explore Promise.all() for running multiple async operations in parallel. Overall: solid understanding.',
      reviewed_at: new Date().toISOString(),
    },
    // Meera: "CSS Flexbox Challenge" → reviewed
    {
      assignment_id: byTitle('CSS Flexbox Challenge').id,
      student_id: meera.id,
      content: 'I used display: flex on the container, flex-wrap: wrap, and each card has flex: 1 1 calc(33% - 1rem). On mobile I used a media query to set flex-direction: column. The layout works well on all screen sizes I tested.',
      status: 'reviewed',
      feedback: 'Well done! The calc() approach for card widths is exactly right. One improvement: use gap instead of margin on cards for cleaner spacing. Your mobile media query is correct. Full marks.',
      reviewed_at: new Date().toISOString(),
    },
    // Meera: "REST API Integration" → submitted
    {
      assignment_id: byTitle('REST API Integration').id,
      student_id: meera.id,
      content: 'I used useEffect to fetch from JSONPlaceholder when the component mounts. I have a loading boolean state that shows a spinner while fetching. If fetch throws, I catch it and set an error message state. The user list renders as a simple ul with li items.',
      status: 'submitted',
    },
    // Ananya: "Python Functions" → submitted
    {
      assignment_id: byTitle('Python Functions').id,
      student_id: ananya.id,
      content: 'def greet(name="World"): return f"Hello, {name}"\ndef add(*args): return sum(args)\ndef describe(**kwargs): return str(kwargs)\nsquare = lambda x: x**2\ndef factorial(n): return 1 if n <= 1 else n * factorial(n-1)',
      status: 'submitted',
    },
    // Ananya: "Data Structures in Python" → reviewed
    {
      assignment_id: byTitle('Data Structures in Python').id,
      student_id: ananya.id,
      content: 'class Stack: def __init__(self): self.items = []\n  def push(self, item): self.items.append(item)\n  def pop(self): return self.items.pop()\n  def is_empty(self): return len(self.items) == 0\nQueue implemented similarly with append and pop(0).',
      status: 'reviewed',
      feedback: 'Stack implementation is correct. For Queue, pop(0) works but is O(n). In production use collections.deque for O(1) popleft(). Your test cases cover the happy path — add edge cases like popping from an empty stack. Good work overall.',
      reviewed_at: new Date().toISOString(),
    },
    // Zara: "Node.js Fundamentals" → submitted
    {
      assignment_id: byTitle('Node.js Fundamentals').id,
      student_id: zara.id,
      content: 'Built with Express. GET /users returns the full array. GET /users/:id finds by id with find(). POST /users pushes to the array and returns the new user with 201 status. I used express.json() middleware to parse request bodies.',
      status: 'submitted',
    },
  ])

  if (sErr) { console.error('Submissions error:', sErr); process.exit(1) }
  console.log('✅ Submissions created')
  console.log('\n🎉 Seed complete!')
  console.log('\nLogin credentials:')
  console.log('  Mentor → priya@lwl.edu / mentor123')
  console.log('  Mentor → ravi@lwl.edu  / mentor123')
  console.log('  Student → aarav@lwl.edu  / student123')
  console.log('  Student → meera@lwl.edu  / student123')
  console.log('  Student → kabir@lwl.edu  / student123')
}

seed().catch(console.error)
```

- [ ] **Step 2: Add seed script to package.json**

In `package.json`, add to the `"scripts"` block:
```json
"seed": "dotenv -e .env.local -- npx tsx scripts/seed.ts"
```

Install dotenv-cli:
```bash
npm install -D dotenv-cli
```

- [ ] **Step 3: Run the seed**

```bash
npm run seed
```
Expected output:
```
🌱 Seeding database...
✅ Users created
✅ Mentor-student links created
✅ Assignments created
✅ Submissions created
🎉 Seed complete!
Login credentials:
  Mentor → priya@lwl.edu / mentor123
  ...
```

- [ ] **Step 4: Verify in Supabase Table Editor**

Go to Supabase dashboard → Table Editor → `users`. Should see 8 rows (2 mentors, 6 students).
Check `assignments` → should see 10 rows.
Check `submissions` → should see 7 rows.

- [ ] **Step 5: Commit**

```bash
git add scripts/seed.ts package.json package-lock.json
git commit -m "feat: add seed script with 2 mentors, 6 students, 10 assignments, mixed statuses"
```

---

## Task 4: Core Library Files

**Files:**
- Create: `lib/types.ts`
- Create: `lib/supabase/server.ts`
- Create: `lib/auth.ts`

- [ ] **Step 1: Write lib/types.ts**

```typescript
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
```

- [ ] **Step 2: Write lib/supabase/server.ts**

```typescript
import { createClient } from '@supabase/supabase-js'

export function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
```

- [ ] **Step 3: Write lib/auth.ts**

```typescript
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { JWTUser } from './types'

const secret = new TextEncoder().encode(process.env.JWT_SECRET!)

export async function getUser(): Promise<JWTUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as unknown as JWTUser
  } catch {
    return null
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add lib/
git commit -m "feat: add types, Supabase server client, auth helper"
```

---

## Task 5: Auth API Routes

**Files:**
- Create: `app/api/auth/login/route.ts`
- Create: `app/api/auth/logout/route.ts`

- [ ] **Step 1: Write app/api/auth/login/route.ts**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'
import { getSupabase } from '@/lib/supabase/server'

const secret = new TextEncoder().encode(process.env.JWT_SECRET!)

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
  }

  const supabase = getSupabase()
  const { data: user, error } = await supabase
    .from('users')
    .select('id, name, email, role, password_hash')
    .eq('email', email.toLowerCase().trim())
    .single()

  if (error || !user) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const token = await new SignJWT({ id: user.id, role: user.role, name: user.name })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secret)

  const response = NextResponse.json({ role: user.role, name: user.name })
  response.cookies.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
  return response
}
```

- [ ] **Step 2: Write app/api/auth/logout/route.ts**

```typescript
import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ success: true })
  response.cookies.set('token', '', { maxAge: 0, path: '/' })
  return response
}
```

- [ ] **Step 3: Commit**

```bash
git add app/api/
git commit -m "feat: add login and logout API routes with JWT cookie auth"
```

---

## Task 6: Middleware

**Files:**
- Create: `middleware.ts`

- [ ] **Step 1: Write middleware.ts**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.JWT_SECRET!)

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get('token')?.value

  // Public paths — no auth required
  if (pathname.startsWith('/api/auth') || pathname === '/login') {
    // If already logged in, redirect to dashboard
    if (token && (pathname === '/login')) {
      try {
        const { payload } = await jwtVerify(token, secret)
        return NextResponse.redirect(new URL(`/${payload.role}/dashboard`, req.url))
      } catch {}
    }
    return NextResponse.next()
  }

  // Root redirect
  if (pathname === '/') {
    if (token) {
      try {
        const { payload } = await jwtVerify(token, secret)
        return NextResponse.redirect(new URL(`/${payload.role}/dashboard`, req.url))
      } catch {}
    }
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Protected paths
  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  try {
    const { payload } = await jwtVerify(token, secret)
    const role = payload.role as string

    // Block cross-role access
    if (pathname.startsWith('/student') && role !== 'student') {
      return NextResponse.redirect(new URL(`/${role}/dashboard`, req.url))
    }
    if (pathname.startsWith('/mentor') && role !== 'mentor') {
      return NextResponse.redirect(new URL(`/${role}/dashboard`, req.url))
    }

    return NextResponse.next()
  } catch {
    const res = NextResponse.redirect(new URL('/login', req.url))
    res.cookies.set('token', '', { maxAge: 0, path: '/' })
    return res
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

- [ ] **Step 2: Commit**

```bash
git add middleware.ts
git commit -m "feat: add route protection middleware with role-based access control"
```

---

## Task 7: Root Layout + Login Page

**Files:**
- Modify: `app/layout.tsx`
- Create: `app/page.tsx`
- Create: `app/login/page.tsx`

- [ ] **Step 1: Update app/layout.tsx**

```tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'LWL Dashboard',
  description: 'Student & Mentor Learning Platform',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Create app/page.tsx**

```tsx
import { redirect } from 'next/navigation'

export default function Home() {
  redirect('/login')
}
```

- [ ] **Step 3: Create app/login/page.tsx**

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { BookOpen } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Please enter email and password')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Login failed')
        return
      }
      toast.success(`Welcome back!`)
      router.push(`/${data.role}/dashboard`)
    } catch {
      toast.error('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  function fillAs(role: 'student' | 'mentor') {
    if (role === 'student') {
      setEmail('aarav@lwl.edu')
      setPassword('student123')
    } else {
      setEmail('priya@lwl.edu')
      setPassword('mentor123')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md px-4">
        <div className="flex items-center justify-center gap-2 mb-8">
          <BookOpen className="h-8 w-8 text-blue-600" />
          <span className="text-2xl font-bold text-gray-900">LWL Dashboard</span>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>Enter your credentials to access your dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Quick fill buttons for evaluators */}
            <div className="flex gap-2 mb-4">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => fillAs('student')}>
                Login as Aarav (Student)
              </Button>
              <Button variant="outline" size="sm" className="flex-1" onClick={() => fillAs('mentor')}>
                Login as Priya (Mentor)
              </Button>
            </div>
            <Separator className="mb-4" />

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@lwl.edu"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Test login manually**

Start dev server (`npm run dev`), go to http://localhost:3000/login.
Click "Login as Aarav (Student)" → credentials should fill → click Sign in.
Expected: redirects to `/student/dashboard` (404 is fine — page doesn't exist yet, but redirect happened).
Try direct URL `/mentor/dashboard` as student → should redirect back to `/student/dashboard`.

- [ ] **Step 5: Commit**

```bash
git add app/
git commit -m "feat: add root layout with Sonner toasts, login page with quick-fill buttons"
```

---

## Task 8: Shared Components

**Files:**
- Create: `components/status-badge.tsx`
- Create: `components/empty-state.tsx`

- [ ] **Step 1: Write components/status-badge.tsx**

```tsx
import { Badge } from '@/components/ui/badge'
import { AssignmentStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

const config: Record<AssignmentStatus, { label: string; className: string }> = {
  pending:   { label: 'Pending',   className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  submitted: { label: 'Submitted', className: 'bg-blue-100 text-blue-800 border-blue-200' },
  reviewed:  { label: 'Reviewed',  className: 'bg-green-100 text-green-800 border-green-200' },
}

export function StatusBadge({ status }: { status: AssignmentStatus }) {
  const { label, className } = config[status]
  return (
    <Badge variant="outline" className={cn(className)}>
      {label}
    </Badge>
  )
}
```

- [ ] **Step 2: Write components/empty-state.tsx**

```tsx
import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
}

export function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Icon className="h-12 w-12 text-gray-300 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 max-w-sm">{description}</p>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add components/status-badge.tsx components/empty-state.tsx
git commit -m "feat: add StatusBadge and EmptyState shared components"
```

---

## Task 9: Student Layout + Sidebar

**Files:**
- Create: `components/student-sidebar.tsx`
- Create: `app/student/layout.tsx`
- Create: `app/student/page.tsx`

- [ ] **Step 1: Write components/student-sidebar.tsx**

```tsx
'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { BookOpen, LogOut, LayoutDashboard } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

const navItems = [
  { href: '/student/dashboard', label: 'My Assignments', icon: LayoutDashboard },
]

export function StudentSidebar({ name }: { name: string }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    toast.success('Logged out')
    router.push('/login')
  }

  return (
    <aside className="w-64 min-h-screen bg-white border-r flex flex-col">
      <div className="p-6 border-b">
        <div className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-blue-600" />
          <span className="font-bold text-gray-900">LWL Dashboard</span>
        </div>
        <p className="text-sm text-gray-500 mt-1 truncate">{name}</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
              pathname.startsWith(href)
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t">
        <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-gray-600" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </aside>
  )
}
```

- [ ] **Step 2: Write app/student/layout.tsx**

```tsx
import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { StudentSidebar } from '@/components/student-sidebar'

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser()
  if (!user || user.role !== 'student') redirect('/login')

  return (
    <div className="flex min-h-screen bg-gray-50">
      <StudentSidebar name={user.name} />
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  )
}
```

- [ ] **Step 3: Write app/student/page.tsx**

```tsx
import { redirect } from 'next/navigation'

export default function StudentRoot() {
  redirect('/student/dashboard')
}
```

- [ ] **Step 4: Commit**

```bash
git add components/student-sidebar.tsx app/student/
git commit -m "feat: add student layout with sidebar and logout"
```

---

## Task 10: Student Dashboard (Home)

**Files:**
- Create: `app/student/dashboard/page.tsx`
- Create: `app/student/dashboard/loading.tsx`

- [ ] **Step 1: Write app/student/dashboard/page.tsx**

```tsx
import Link from 'next/link'
import { getUser } from '@/lib/auth'
import { getSupabase } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AssignmentWithStatus } from '@/lib/types'
import { StatusBadge } from '@/components/status-badge'
import { EmptyState } from '@/components/empty-state'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, ChevronRight } from 'lucide-react'

async function getAssignments(studentId: string): Promise<AssignmentWithStatus[]> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('assignments')
    .select(`
      *,
      submissions!left(id, content, status, feedback)
    `)
    .eq('assigned_to', studentId)
    .order('created_at', { ascending: false })

  if (error) throw error

  return data.map((a: any) => {
    const sub = a.submissions?.[0] ?? null
    return {
      ...a,
      status: sub ? sub.status : 'pending',
      submission_id: sub?.id ?? null,
      submitted_content: sub?.content ?? null,
      feedback: sub?.feedback ?? null,
      submissions: undefined,
    }
  })
}

export default async function StudentDashboard() {
  const user = await getUser()
  if (!user) redirect('/login')

  const assignments = await getAssignments(user.id)
  const reviewed = assignments.filter(a => a.status === 'reviewed').length
  const total = assignments.length

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user.name.split(' ')[0]} 👋</h1>
        <p className="text-gray-500 mt-1">Here are your assignments</p>
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div className="mb-8 p-4 bg-white rounded-lg border">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{reviewed} of {total} completed</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all"
              style={{ width: `${total > 0 ? (reviewed / total) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {assignments.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No assignments yet"
          description="Your mentor hasn't assigned anything yet. Check back soon."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {assignments.map(a => (
            <Card key={a.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base leading-snug">{a.title}</CardTitle>
                  <StatusBadge status={a.status} />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 line-clamp-2 mb-4">{a.description}</p>
                <Button asChild size="sm" variant="outline" className="w-full">
                  <Link href={`/student/assignment/${a.id}`}>
                    {a.status === 'pending' ? 'Start' : 'View'}
                    <ChevronRight className="h-3 w-3 ml-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Write app/student/dashboard/loading.tsx**

```tsx
import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div>
      <Skeleton className="h-8 w-64 mb-2" />
      <Skeleton className="h-4 w-48 mb-8" />
      <Skeleton className="h-12 w-full mb-8 rounded-lg" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-lg" />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Test student dashboard**

Login as Aarav → should see 3 assignment cards with correct statuses (pending, submitted, reviewed).
Progress bar should show 1 of 3 completed.

- [ ] **Step 4: Commit**

```bash
git add app/student/dashboard/
git commit -m "feat: student dashboard with assignment cards, status badges, progress bar"
```

---

## Task 11: Assignment Detail + Submit API

**Files:**
- Create: `app/student/assignment/[id]/page.tsx`
- Create: `app/student/assignment/[id]/loading.tsx`
- Create: `app/api/submissions/route.ts`

- [ ] **Step 1: Write app/api/submissions/route.ts**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { getSupabase } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const user = await getUser()
  if (!user || user.role !== 'student') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { assignment_id, content } = await req.json()

  if (!assignment_id || !content?.trim()) {
    return NextResponse.json({ error: 'Assignment ID and content are required' }, { status: 400 })
  }

  const supabase = getSupabase()

  // Verify this assignment belongs to this student
  const { data: assignment } = await supabase
    .from('assignments')
    .select('id')
    .eq('id', assignment_id)
    .eq('assigned_to', user.id)
    .single()

  if (!assignment) {
    return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
  }

  const { error } = await supabase.from('submissions').upsert({
    assignment_id,
    student_id: user.id,
    content: content.trim(),
    status: 'submitted',
    submitted_at: new Date().toISOString(),
  }, { onConflict: 'assignment_id,student_id' })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
```

- [ ] **Step 2: Write app/student/assignment/[id]/page.tsx**

```tsx
'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { StatusBadge } from '@/components/status-badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, MessageSquare, Send } from 'lucide-react'
import { AssignmentWithStatus } from '@/lib/types'
import Link from 'next/link'

export default function AssignmentDetail() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [assignment, setAssignment] = useState<AssignmentWithStatus | null>(null)
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchAssignment = useCallback(async () => {
    const res = await fetch(`/api/assignments/${id}`)
    if (!res.ok) { router.push('/student/dashboard'); return }
    const data = await res.json()
    setAssignment(data)
    setLoading(false)
  }, [id, router])

  useEffect(() => { fetchAssignment() }, [fetchAssignment])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) { toast.error('Please write something before submitting'); return }
    if (content.trim().length < 10) { toast.error('Submission is too short'); return }

    setSubmitting(true)
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignment_id: id, content }),
      })
      if (!res.ok) { toast.error('Submission failed. Try again.'); return }
      toast.success('Assignment submitted!')
      await fetchAssignment()
      setContent('')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/2"/><div className="h-32 bg-gray-200 rounded"/></div>
  if (!assignment) return null

  return (
    <div className="max-w-2xl">
      <Link href="/student/dashboard" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to assignments
      </Link>

      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-gray-900">{assignment.title}</h1>
        <StatusBadge status={assignment.status} />
      </div>

      <Card className="mb-6">
        <CardHeader><CardTitle className="text-base">Assignment</CardTitle></CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{assignment.description}</p>
        </CardContent>
      </Card>

      {assignment.status === 'pending' && (
        <Card>
          <CardHeader><CardTitle className="text-base">Your Response</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Textarea
                placeholder="Write your response here..."
                rows={8}
                value={content}
                onChange={e => setContent(e.target.value)}
                required
              />
              <Button type="submit" disabled={submitting} className="gap-2">
                <Send className="h-4 w-4" />
                {submitting ? 'Submitting...' : 'Submit'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {assignment.status === 'submitted' && (
        <Card>
          <CardHeader><CardTitle className="text-base">Your Submission</CardTitle></CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap mb-4">{assignment.submitted_content}</p>
            <p className="text-sm text-blue-600">Awaiting mentor review...</p>
          </CardContent>
        </Card>
      )}

      {assignment.status === 'reviewed' && (
        <>
          <Card className="mb-4">
            <CardHeader><CardTitle className="text-base">Your Submission</CardTitle></CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{assignment.submitted_content}</p>
            </CardContent>
          </Card>
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2 text-green-800">
                <MessageSquare className="h-4 w-4" />
                Mentor Feedback
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-green-900 whitespace-pre-wrap">{assignment.feedback}</p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Write app/api/assignments/[id]/route.ts**

Create the file at `app/api/assignments/[id]/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { getSupabase } from '@/lib/supabase/server'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('assignments')
    .select('*, submissions!left(id, content, status, feedback)')
    .eq('id', params.id)
    .eq('assigned_to', user.id)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const sub = data.submissions?.[0] ?? null
  return NextResponse.json({
    ...data,
    status: sub ? sub.status : 'pending',
    submission_id: sub?.id ?? null,
    submitted_content: sub?.content ?? null,
    feedback: sub?.feedback ?? null,
    submissions: undefined,
  })
}
```

- [ ] **Step 4: Write app/student/assignment/[id]/loading.tsx**

```tsx
import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="max-w-2xl space-y-4">
      <Skeleton className="h-4 w-32 mb-6" />
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-48 rounded-lg" />
      <Skeleton className="h-48 rounded-lg" />
    </div>
  )
}
```

- [ ] **Step 5: Test the student loop end-to-end**

Login as Aarav → click "Introduction to React" (pending) → should see description + textarea.
Type something (at least 10 chars) → click Submit → toast "Assignment submitted!" → status changes to Submitted.
Click "Async JavaScript" (reviewed) → should see submission + green feedback card.

- [ ] **Step 6: Commit**

```bash
git add app/student/assignment/ app/api/submissions/ app/api/assignments/
git commit -m "feat: student assignment detail with submit form and feedback view"
```

---

## Task 12: Mentor Layout + Sidebar

**Files:**
- Create: `components/mentor-sidebar.tsx`
- Create: `app/mentor/layout.tsx`
- Create: `app/mentor/page.tsx`

- [ ] **Step 1: Write components/mentor-sidebar.tsx**

```tsx
'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { BookOpen, LogOut, Users, ClipboardList } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

const navItems = [
  { href: '/mentor/dashboard', label: 'My Students',    icon: Users },
  { href: '/mentor/queue',     label: 'Review Queue',   icon: ClipboardList },
]

export function MentorSidebar({ name }: { name: string }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    toast.success('Logged out')
    router.push('/login')
  }

  return (
    <aside className="w-64 min-h-screen bg-white border-r flex flex-col">
      <div className="p-6 border-b">
        <div className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-purple-600" />
          <span className="font-bold text-gray-900">LWL Dashboard</span>
        </div>
        <p className="text-sm text-gray-500 mt-1 truncate">{name} · Mentor</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
              pathname.startsWith(href)
                ? 'bg-purple-50 text-purple-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t">
        <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-gray-600" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </aside>
  )
}
```

- [ ] **Step 2: Write app/mentor/layout.tsx**

```tsx
import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { MentorSidebar } from '@/components/mentor-sidebar'

export default async function MentorLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser()
  if (!user || user.role !== 'mentor') redirect('/login')

  return (
    <div className="flex min-h-screen bg-gray-50">
      <MentorSidebar name={user.name} />
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  )
}
```

- [ ] **Step 3: Write app/mentor/page.tsx**

```tsx
import { redirect } from 'next/navigation'
export default function MentorRoot() { redirect('/mentor/dashboard') }
```

- [ ] **Step 4: Commit**

```bash
git add components/mentor-sidebar.tsx app/mentor/layout.tsx app/mentor/page.tsx
git commit -m "feat: mentor layout with sidebar (Students, Review Queue nav)"
```

---

## Task 13: Mentor Students List

**Files:**
- Create: `app/mentor/dashboard/page.tsx`
- Create: `app/mentor/dashboard/loading.tsx`

- [ ] **Step 1: Write app/mentor/dashboard/page.tsx**

```tsx
import { getUser } from '@/lib/auth'
import { getSupabase } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { EmptyState } from '@/components/empty-state'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Users } from 'lucide-react'

async function getStudentsWithStats(mentorId: string) {
  const supabase = getSupabase()

  const { data: links } = await supabase
    .from('mentor_students')
    .select('student_id, users!mentor_students_student_id_fkey(id, name, email)')
    .eq('mentor_id', mentorId)

  if (!links || links.length === 0) return []

  const students = links.map((l: any) => l.users)

  const stats = await Promise.all(
    students.map(async (student: any) => {
      const { data: assignments } = await supabase
        .from('assignments')
        .select('id, submissions!left(status)')
        .eq('assigned_to', student.id)
        .eq('created_by', mentorId)

      let pending = 0, submitted = 0, reviewed = 0
      for (const a of assignments ?? []) {
        const sub = (a as any).submissions?.[0]
        if (!sub) pending++
        else if (sub.status === 'submitted') submitted++
        else if (sub.status === 'reviewed') reviewed++
      }

      return { ...student, pending, submitted, reviewed, total: (assignments ?? []).length }
    })
  )

  return stats
}

export default async function MentorDashboard() {
  const user = await getUser()
  if (!user) redirect('/login')

  const students = await getStudentsWithStats(user.id)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Students</h1>
        <p className="text-gray-500 mt-1">{students.length} student{students.length !== 1 ? 's' : ''} assigned to you</p>
      </div>

      {students.length === 0 ? (
        <EmptyState icon={Users} title="No students yet" description="No students have been assigned to you yet." />
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead className="text-center">Pending</TableHead>
                <TableHead className="text-center">Submitted</TableHead>
                <TableHead className="text-center">Reviewed</TableHead>
                <TableHead className="text-center">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((s: any) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900">{s.name}</p>
                      <p className="text-sm text-gray-500">{s.email}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {s.pending > 0
                      ? <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">{s.pending}</Badge>
                      : <span className="text-gray-400">—</span>
                    }
                  </TableCell>
                  <TableCell className="text-center">
                    {s.submitted > 0
                      ? <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">{s.submitted}</Badge>
                      : <span className="text-gray-400">—</span>
                    }
                  </TableCell>
                  <TableCell className="text-center">
                    {s.reviewed > 0
                      ? <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">{s.reviewed}</Badge>
                      : <span className="text-gray-400">—</span>
                    }
                  </TableCell>
                  <TableCell className="text-center text-gray-600">{s.total}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Write app/mentor/dashboard/loading.tsx**

```tsx
import { Skeleton } from '@/components/ui/skeleton'
export default function Loading() {
  return (
    <div>
      <Skeleton className="h-8 w-48 mb-2" />
      <Skeleton className="h-4 w-32 mb-8" />
      <Skeleton className="h-64 w-full rounded-lg" />
    </div>
  )
}
```

- [ ] **Step 3: Test mentor students list**

Login as Priya → should see 3 students (Aarav, Meera, Kabir) with correct pending/submitted/reviewed counts.

- [ ] **Step 4: Commit**

```bash
git add app/mentor/dashboard/
git commit -m "feat: mentor students list with pending/submitted/reviewed stats per student"
```

---

## Task 14: Mentor Submissions Queue

**Files:**
- Create: `app/mentor/queue/page.tsx`
- Create: `app/mentor/queue/loading.tsx`

- [ ] **Step 1: Write app/mentor/queue/page.tsx**

```tsx
import Link from 'next/link'
import { getUser } from '@/lib/auth'
import { getSupabase } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { EmptyState } from '@/components/empty-state'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ClipboardList, ChevronRight } from 'lucide-react'

async function getPendingSubmissions(mentorId: string) {
  const supabase = getSupabase()

  // Get all students assigned to this mentor
  const { data: links } = await supabase
    .from('mentor_students')
    .select('student_id')
    .eq('mentor_id', mentorId)

  if (!links || links.length === 0) return []
  const studentIds = links.map((l: any) => l.student_id)

  const { data, error } = await supabase
    .from('submissions')
    .select(`
      id, content, status, submitted_at,
      assignments!inner(id, title, description),
      users!submissions_student_id_fkey(id, name)
    `)
    .in('student_id', studentIds)
    .eq('status', 'submitted')
    .order('submitted_at', { ascending: true })

  if (error) throw error
  return data ?? []
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const h = Math.floor(diff / 3600000)
  if (h < 1) return 'just now'
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default async function MentorQueue() {
  const user = await getUser()
  if (!user) redirect('/login')

  const submissions = await getPendingSubmissions(user.id)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Review Queue</h1>
        <p className="text-gray-500 mt-1">
          {submissions.length === 0 ? "You're all caught up!" : `${submissions.length} submission${submissions.length !== 1 ? 's' : ''} awaiting review`}
        </p>
      </div>

      {submissions.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Queue is empty"
          description="No submissions waiting for review. Nice work!"
        />
      ) : (
        <div className="space-y-3">
          {submissions.map((s: any) => (
            <Card key={s.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">{s.assignments.title}</p>
                  <p className="text-sm text-gray-500">
                    {s.users.name} · submitted {timeAgo(s.submitted_at)}
                  </p>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-1">{s.content}</p>
                </div>
                <Button asChild size="sm" className="ml-4 shrink-0">
                  <Link href={`/mentor/review/${s.id}`}>
                    Review <ChevronRight className="h-3 w-3 ml-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Write app/mentor/queue/loading.tsx**

```tsx
import { Skeleton } from '@/components/ui/skeleton'
export default function Loading() {
  return (
    <div>
      <Skeleton className="h-8 w-48 mb-2" />
      <Skeleton className="h-4 w-64 mb-8" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Test queue**

Login as Priya → click "Review Queue" → should see submitted assignments from Aarav (Counter App) and Meera (REST API).

- [ ] **Step 4: Commit**

```bash
git add app/mentor/queue/
git commit -m "feat: mentor review queue showing pending submissions with time elapsed"
```

---

## Task 15: Mentor Review Flow + Review API

**Files:**
- Create: `app/mentor/review/[id]/page.tsx`
- Create: `app/mentor/review/[id]/loading.tsx`
- Create: `app/api/submissions/[id]/review/route.ts`

- [ ] **Step 1: Write app/api/submissions/[id]/review/route.ts**

Create the folder `app/api/submissions/[id]/review/` and the file `route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { getSupabase } from '@/lib/supabase/server'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getUser()
  if (!user || user.role !== 'mentor') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { feedback } = await req.json()
  if (!feedback?.trim()) {
    return NextResponse.json({ error: 'Feedback is required' }, { status: 400 })
  }

  const supabase = getSupabase()

  // Verify this submission belongs to one of this mentor's students
  const { data: submission } = await supabase
    .from('submissions')
    .select('id, student_id')
    .eq('id', params.id)
    .single()

  if (!submission) {
    return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
  }

  const { data: link } = await supabase
    .from('mentor_students')
    .select('mentor_id')
    .eq('mentor_id', user.id)
    .eq('student_id', submission.student_id)
    .single()

  if (!link) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { error } = await supabase
    .from('submissions')
    .update({
      feedback: feedback.trim(),
      status: 'reviewed',
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', params.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
```

- [ ] **Step 2: Write app/mentor/review/[id]/page.tsx**

```tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function ReviewPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [submission, setSubmission] = useState<any>(null)
  const [feedback, setFeedback] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/submissions/${id}`)
      .then(r => r.json())
      .then(data => { setSubmission(data); setLoading(false) })
      .catch(() => router.push('/mentor/queue'))
  }, [id, router])

  async function handleReview(e: React.FormEvent) {
    e.preventDefault()
    if (!feedback.trim()) { toast.error('Please write feedback before submitting'); return }
    if (feedback.trim().length < 10) { toast.error('Feedback is too short'); return }

    setSubmitting(true)
    try {
      const res = await fetch(`/api/submissions/${id}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback }),
      })
      if (!res.ok) { toast.error('Failed to submit feedback'); return }
      toast.success('Feedback sent! Student can now see it.')
      router.push('/mentor/queue')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/2"/><div className="h-48 bg-gray-200 rounded"/></div>
  if (!submission) return null

  return (
    <div className="max-w-2xl">
      <Link href="/mentor/queue" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to queue
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-1">{submission.assignments?.title}</h1>
      <p className="text-gray-500 mb-6">by {submission.users?.name}</p>

      <Card className="mb-4">
        <CardHeader><CardTitle className="text-base">Assignment</CardTitle></CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{submission.assignments?.description}</p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader><CardTitle className="text-base">Student's Submission</CardTitle></CardHeader>
        <CardContent>
          <p className="text-gray-700 whitespace-pre-wrap">{submission.content}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Your Feedback</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleReview} className="space-y-4">
            <Textarea
              placeholder="Write your feedback here..."
              rows={6}
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              required
            />
            <Button type="submit" disabled={submitting} className="gap-2">
              <CheckCircle className="h-4 w-4" />
              {submitting ? 'Submitting...' : 'Mark as Reviewed'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 3: Write app/api/submissions/[id]/route.ts** (GET single submission for the review page)

Create `app/api/submissions/[id]/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { getSupabase } from '@/lib/supabase/server'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('submissions')
    .select(`
      id, content, status, feedback, submitted_at,
      assignments!inner(id, title, description),
      users!submissions_student_id_fkey(id, name)
    `)
    .eq('id', params.id)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(data)
}
```

- [ ] **Step 4: Write app/mentor/review/[id]/loading.tsx**

```tsx
import { Skeleton } from '@/components/ui/skeleton'
export default function Loading() {
  return (
    <div className="max-w-2xl space-y-4">
      <Skeleton className="h-4 w-32 mb-6" />
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-48 rounded-lg" />
      <Skeleton className="h-48 rounded-lg" />
      <Skeleton className="h-48 rounded-lg" />
    </div>
  )
}
```

- [ ] **Step 5: Test the full core loop**

1. Login as Aarav → find "Introduction to React" (pending) → submit a response → status becomes "Submitted"
2. Logout → login as Priya → go to Review Queue → that submission appears
3. Click Review → write feedback → click "Mark as Reviewed" → toast fires, redirects to queue → submission gone from queue
4. Logout → login as Aarav → open that assignment → feedback visible in green card

This is the complete core loop. Verify every step works.

- [ ] **Step 6: Commit**

```bash
git add app/mentor/review/ app/api/submissions/
git commit -m "feat: mentor review flow with feedback submission, completes the core loop"
```

---

## Task 16: Deploy to Vercel

**Files:** No code changes — deployment config only

- [ ] **Step 1: Push all current code**

```bash
git push origin main
```

- [ ] **Step 2: Import repo to Vercel**

Go to vercel.com → Add New → Project → Import `SKYDARTIST/lwl-dashboard`

- [ ] **Step 3: Add environment variables in Vercel dashboard**

In the Vercel project settings → Environment Variables, add:
```
NEXT_PUBLIC_SUPABASE_URL     = https://heoevdzthsxheivgfemo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY    = (your service role key)
JWT_SECRET                   = lwl-dashboard-secret-change-in-production-2026
```

- [ ] **Step 4: Deploy**

Click Deploy. Wait ~2 min.
Expected: Build succeeds, live URL provided (e.g. `lwl-dashboard.vercel.app`).

- [ ] **Step 5: Test on live URL**

Open the live URL → login as Priya → check students list loads.
Login as Aarav → check assignments load.
Submit an assignment → check it appears in Priya's queue.

- [ ] **Step 6: Commit the deploy confirmation**

```bash
git commit --allow-empty -m "chore: deployed to Vercel"
```

---

## Task 17: README

**Files:**
- Create: `README.md`

- [ ] **Step 1: Write README.md**

```markdown
# LWL Student & Mentor Dashboard

A two-sided learning platform where students submit assignments and mentors review them with feedback.

**Live demo:** [lwl-dashboard.vercel.app](https://lwl-dashboard.vercel.app)

---

## Quick Start

Requires Node.js 18+.

```bash
git clone https://github.com/SKYDARTIST/lwl-dashboard.git
cd lwl-dashboard
npm install
cp .env.example .env.local
# Fill in .env.local with your Supabase credentials and JWT secret (see below)
npm run seed   # Populate the database
npm run dev    # Start at http://localhost:3000
```

### Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) |
| `JWT_SECRET` | Any random string for signing JWTs |

---

## Seed Credentials

| Role | Email | Password |
|---|---|---|
| Mentor | priya@lwl.edu | mentor123 |
| Mentor | ravi@lwl.edu | mentor123 |
| Student | aarav@lwl.edu | student123 |
| Student | meera@lwl.edu | student123 |
| Student | kabir@lwl.edu | student123 |
| Student | ananya@lwl.edu | student123 |
| Student | dev@lwl.edu | student123 |
| Student | zara@lwl.edu | student123 |

The login page has quick-fill buttons so you can switch roles without typing.

---

## What I Built

**Core loop (fully working):**
- Student submits a text response to an assignment
- Submission appears in mentor's review queue immediately
- Mentor writes feedback and marks it as reviewed
- Student sees feedback inline on their assignment page

**Student Dashboard:**
- Home view with assignment cards (pending / submitted / reviewed status)
- Progress bar showing completed vs total
- Assignment detail: read description, submit response, view feedback

**Mentor Dashboard:**
- Students list with pending/submitted/reviewed counts per student
- Review queue (all submissions awaiting feedback, oldest first)
- Review flow: read submission, write feedback, mark reviewed

**Auth:**
- Email + password login with httpOnly JWT cookie (7-day expiry)
- Role-based routing enforced in middleware — a student cannot access `/mentor/*` and vice versa
- Seeded users only — no sign-up flow (intentional, per spec)

---

## What I Intentionally Skipped

Per the brief's out-of-scope section:
- Sign-up, password reset, email verification
- File uploads (text-only submissions)
- Real-time notifications (feedback reflects on page refresh — server components refetch on navigation)
- Search, filters, pagination
- Profile editing, session scheduling, video calls
- Analytics beyond the progress bar

I also skipped Row Level Security in Supabase — using service role key server-side with manual authorization checks in API routes. Correct for a 48hr scope; in production I'd enable RLS per-user policies.

---

## What I'd Do Next

1. **RLS policies** — move authorization to the database layer
2. **Mentor assignment creation** — mentors create and assign new assignments from the dashboard
3. **Optimistic UI** — update submission status instantly on submit without waiting for API
4. **WebSockets / Supabase Realtime** — push feedback to student without refresh
5. **Pagination** — once there are 20+ assignments or students
6. **Tests** — E2E test for the core submit → review → feedback loop with Playwright

---

## AI Tool Disclosure

Built with **Claude Code** (Anthropic) as the primary coding assistant. Claude generated component code, API routes, and the seed script. I defined the architecture, made all product and stack decisions, reviewed every piece of code, and debugged issues. I can walk through any part of this codebase and explain the decisions.

Tech used: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Supabase (Postgres), jose, bcryptjs, Sonner.
```

- [ ] **Step 2: Commit and push README**

```bash
git add README.md
git commit -m "docs: add README with setup, credentials, scope decisions, AI disclosure"
git push
```

---

## Task 18: Pre-Submit Audit

**Files:** No new files — review and clean up

- [ ] **Step 1: Run the codebase-audit-pre-push skill (or do manually)**

Check for:
- `console.log` statements → remove all
- `TODO` comments → remove or resolve
- Hardcoded secrets in code (not .env) → none should exist
- Dead imports → remove
- `.env.local` is NOT committed (check `git status`)

```bash
grep -r "console.log" app/ lib/ components/ --include="*.ts" --include="*.tsx"
grep -r "console.error\|console.warn" app/ lib/ --include="*.ts" --include="*.tsx"
git status  # .env.local must NOT appear
```

- [ ] **Step 2: Final end-to-end test on live Vercel URL**

Run through the complete checklist:
- [ ] Login as Aarav → dashboard loads with 3 assignments, correct statuses
- [ ] Progress bar shows correct fraction
- [ ] Click pending assignment → submit response → status changes to Submitted
- [ ] Logout → login as Priya → Review Queue shows new submission
- [ ] Review it → write feedback → Mark as Reviewed → redirected to queue
- [ ] Logout → login as Aarav → feedback visible in green card on that assignment
- [ ] Try navigating to `/mentor/dashboard` as Aarav → redirected to student dashboard
- [ ] Try navigating to `/student/dashboard` as Priya → redirected to mentor dashboard
- [ ] Empty state: login as Kabir (no submissions) → assignments show as pending

- [ ] **Step 3: Final push**

```bash
git push origin main
```

- [ ] **Step 4: Send submission email**

Reply to ipsita@learnwithleaders.com with:
- GitHub repo: https://github.com/SKYDARTIST/lwl-dashboard
- Live URL: (Vercel URL)
- Seed credentials: priya@lwl.edu / mentor123 and aarav@lwl.edu / student123

---

## Summary

**Day 1 (today):** Tasks 1–11 → scaffold + DB + auth + student loop complete  
**Day 2 (tomorrow):** Tasks 12–18 → mentor loop + deploy + README + submit

**The core loop that must work perfectly:**
> Student submits → appears in mentor queue → mentor reviews → student sees feedback
