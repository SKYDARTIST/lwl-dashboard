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

  // Clear existing data (respect FK order)
  await supabase.from('submissions').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('assignments').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('mentor_students').delete().neq('mentor_id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000')

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

  const byEmail = (email: string) => users!.find((u: any) => u.email === email)!
  const priya   = byEmail('priya@lwl.edu')
  const ravi    = byEmail('ravi@lwl.edu')
  const aarav   = byEmail('aarav@lwl.edu')
  const meera   = byEmail('meera@lwl.edu')
  const kabir   = byEmail('kabir@lwl.edu')
  const ananya  = byEmail('ananya@lwl.edu')
  const dev     = byEmail('dev@lwl.edu')
  const zara    = byEmail('zara@lwl.edu')

  await supabase.from('mentor_students').insert([
    { mentor_id: priya.id, student_id: aarav.id },
    { mentor_id: priya.id, student_id: meera.id },
    { mentor_id: priya.id, student_id: kabir.id },
    { mentor_id: ravi.id,  student_id: ananya.id },
    { mentor_id: ravi.id,  student_id: dev.id },
    { mentor_id: ravi.id,  student_id: zara.id },
  ])
  console.log('✅ Mentor-student links created')

  const { data: assignments, error: aErr } = await supabase
    .from('assignments')
    .insert([
      { title: 'Introduction to React',     description: 'Read the React docs and summarise the key concepts of components, props, and state in your own words. Minimum 200 words.', created_by: priya.id, assigned_to: aarav.id },
      { title: 'Build a Counter App',       description: 'Create a simple counter application using React hooks. It should have increment, decrement, and reset buttons. Explain your useState usage.', created_by: priya.id, assigned_to: aarav.id },
      { title: 'Async JavaScript',          description: 'Explain the difference between callbacks, promises, and async/await. Write a code example for each that fetches data from a public API.', created_by: priya.id, assigned_to: aarav.id },
      { title: 'CSS Flexbox Challenge',     description: 'Build a responsive card layout using only Flexbox. The layout should have 3 columns on desktop and 1 column on mobile. No CSS Grid allowed.', created_by: priya.id, assigned_to: meera.id },
      { title: 'REST API Integration',      description: 'Use the JSONPlaceholder API to build a simple user list. Show loading state while fetching and handle errors gracefully.', created_by: priya.id, assigned_to: meera.id },
      { title: 'TypeScript Basics',         description: 'Convert a given JavaScript file to TypeScript. Add proper type annotations to all variables, functions, and return types. Explain 3 benefits of TypeScript.', created_by: priya.id, assigned_to: kabir.id },
      { title: 'Python Functions',          description: 'Write 5 Python functions demonstrating: default arguments, *args, **kwargs, lambda functions, and recursion. Include a docstring for each.', created_by: ravi.id,  assigned_to: ananya.id },
      { title: 'Data Structures in Python', description: 'Implement a stack and a queue in Python from scratch (no collections module). Write 3 test cases for each implementation.', created_by: ravi.id,  assigned_to: ananya.id },
      { title: 'Git Workflow',              description: 'Document your understanding of the Git feature branch workflow. Include: creating branches, committing, pushing, and opening a pull request. Use diagrams or pseudocode.', created_by: ravi.id,  assigned_to: dev.id },
      { title: 'Node.js Fundamentals',      description: 'Build a simple Express.js server with 3 routes: GET /users, GET /users/:id, POST /users. Use in-memory array as storage.', created_by: ravi.id,  assigned_to: zara.id },
    ])
    .select()

  if (aErr) { console.error('Assignments error:', aErr); process.exit(1) }
  console.log('✅ Assignments created')

  const byTitle = (title: string) => assignments!.find((a: any) => a.title === title)!

  const { error: sErr } = await supabase.from('submissions').insert([
    {
      assignment_id: byTitle('Build a Counter App').id,
      student_id: aarav.id,
      content: 'I built the counter using useState. The increment adds 1, decrement subtracts 1 with a minimum of 0, and reset sets it back to 0. I learned that useState re-renders the component every time state changes, which is why the UI stays in sync automatically.',
      status: 'submitted',
    },
    {
      assignment_id: byTitle('Async JavaScript').id,
      student_id: aarav.id,
      content: 'Callbacks are functions passed into other functions. Promises are objects that represent future values with .then() and .catch(). Async/await is syntactic sugar over promises that makes async code read like sync code. Example: const data = await fetch(url).then(r => r.json()).',
      status: 'reviewed',
      feedback: 'Great explanation of the progression from callbacks to async/await. Your code example is correct. Next step: explore Promise.all() for running multiple async operations in parallel. Overall: solid understanding.',
      reviewed_at: new Date().toISOString(),
    },
    {
      assignment_id: byTitle('CSS Flexbox Challenge').id,
      student_id: meera.id,
      content: 'I used display: flex on the container, flex-wrap: wrap, and each card has flex: 1 1 calc(33% - 1rem). On mobile I used a media query to set flex-direction: column. The layout works well on all screen sizes I tested.',
      status: 'reviewed',
      feedback: 'Well done! The calc() approach for card widths is exactly right. One improvement: use gap instead of margin on cards for cleaner spacing. Your mobile media query is correct. Full marks.',
      reviewed_at: new Date().toISOString(),
    },
    {
      assignment_id: byTitle('REST API Integration').id,
      student_id: meera.id,
      content: 'I used useEffect to fetch from JSONPlaceholder when the component mounts. I have a loading boolean state that shows a spinner while fetching. If fetch throws, I catch it and set an error message state. The user list renders as a simple ul with li items.',
      status: 'submitted',
    },
    {
      assignment_id: byTitle('Python Functions').id,
      student_id: ananya.id,
      content: 'def greet(name="World"): return f"Hello, {name}"\ndef add(*args): return sum(args)\ndef describe(**kwargs): return str(kwargs)\nsquare = lambda x: x**2\ndef factorial(n): return 1 if n <= 1 else n * factorial(n-1)',
      status: 'submitted',
    },
    {
      assignment_id: byTitle('Data Structures in Python').id,
      student_id: ananya.id,
      content: 'class Stack:\n  def __init__(self): self.items = []\n  def push(self, item): self.items.append(item)\n  def pop(self): return self.items.pop()\n  def is_empty(self): return len(self.items) == 0\nQueue implemented similarly with append and pop(0).',
      status: 'reviewed',
      feedback: 'Stack implementation is correct. For Queue, pop(0) works but is O(n). In production use collections.deque for O(1) popleft(). Your test cases cover the happy path — add edge cases like popping from an empty stack. Good work overall.',
      reviewed_at: new Date().toISOString(),
    },
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
  console.log('  Mentor  → priya@lwl.edu / mentor123')
  console.log('  Mentor  → ravi@lwl.edu  / mentor123')
  console.log('  Student → aarav@lwl.edu  / student123')
  console.log('  Student → meera@lwl.edu  / student123')
  console.log('  Student → kabir@lwl.edu  / student123')
}

seed().catch(console.error)
