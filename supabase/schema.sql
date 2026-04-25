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

-- Submissions by students
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
