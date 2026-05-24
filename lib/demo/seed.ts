// Static demo seed. Replaces the Supabase-backed data layer so the app runs
// with no backend. IDs are deterministic strings so cookie-encoded mutations
// can reliably reference them across requests.

export type Role = 'student' | 'mentor'
export type SubmissionStatus = 'submitted' | 'reviewed'

export interface SeedUser {
  id: string
  name: string
  email: string
  role: Role
}

export interface SeedMentorStudent {
  mentor_id: string
  student_id: string
}

export interface SeedAssignment {
  id: string
  title: string
  description: string
  created_by: string
  assigned_to: string
  created_at: string
}

export interface SeedSubmission {
  id: string
  assignment_id: string
  student_id: string
  content: string
  status: SubmissionStatus
  feedback: string | null
  grade: string | null
  submitted_at: string
  reviewed_at: string | null
}

const baseDate = '2026-05-01T10:00:00.000Z'
const reviewedAt = '2026-05-10T12:00:00.000Z'

export const SEED_USERS: SeedUser[] = [
  { id: 'u-priya',  name: 'Priya Sharma', email: 'priya@lwl.edu',  role: 'mentor'  },
  { id: 'u-ravi',   name: 'Ravi Kumar',   email: 'ravi@lwl.edu',   role: 'mentor'  },
  { id: 'u-aarav',  name: 'Aarav Singh',  email: 'aarav@lwl.edu',  role: 'student' },
  { id: 'u-meera',  name: 'Meera Patel',  email: 'meera@lwl.edu',  role: 'student' },
  { id: 'u-kabir',  name: 'Kabir Nair',   email: 'kabir@lwl.edu',  role: 'student' },
  { id: 'u-ananya', name: 'Ananya Reddy', email: 'ananya@lwl.edu', role: 'student' },
  { id: 'u-dev',    name: 'Dev Joshi',    email: 'dev@lwl.edu',    role: 'student' },
  { id: 'u-zara',   name: 'Zara Khan',    email: 'zara@lwl.edu',   role: 'student' },
  // u-guest is the fallback identity for visitors who type random credentials.
  // Not linked to any mentor (so mentor dashboards stay unchanged) and has its
  // own clean set of pending assignments so submit/review flows work without
  // hitting 409 conflicts on Aarav's already-submitted work.
  { id: 'u-guest',  name: 'Guest Student', email: 'guest@lwl.edu', role: 'student' },
]

export const SEED_MENTOR_STUDENTS: SeedMentorStudent[] = [
  { mentor_id: 'u-priya', student_id: 'u-aarav'  },
  { mentor_id: 'u-priya', student_id: 'u-meera'  },
  { mentor_id: 'u-priya', student_id: 'u-kabir'  },
  { mentor_id: 'u-ravi',  student_id: 'u-ananya' },
  { mentor_id: 'u-ravi',  student_id: 'u-dev'    },
  { mentor_id: 'u-ravi',  student_id: 'u-zara'   },
]

export const SEED_ASSIGNMENTS: SeedAssignment[] = [
  { id: 'a-react-intro',   title: 'Introduction to React',     description: 'Read the React docs and summarise the key concepts of components, props, and state in your own words. Minimum 200 words.', created_by: 'u-priya', assigned_to: 'u-aarav',  created_at: baseDate },
  { id: 'a-counter',       title: 'Build a Counter App',       description: 'Create a simple counter application using React hooks. It should have increment, decrement, and reset buttons. Explain your useState usage.', created_by: 'u-priya', assigned_to: 'u-aarav',  created_at: baseDate },
  { id: 'a-async',         title: 'Async JavaScript',          description: 'Explain the difference between callbacks, promises, and async/await. Write a code example for each that fetches data from a public API.', created_by: 'u-priya', assigned_to: 'u-aarav',  created_at: baseDate },
  { id: 'a-router',        title: 'React Router Basics',       description: 'Set up React Router v6 in a small app with at least 3 routes. Demonstrate useNavigate, useParams, and a 404 fallback route. Document why client-side routing matters.', created_by: 'u-priya', assigned_to: 'u-aarav',  created_at: baseDate },
  { id: 'a-patterns',      title: 'Component Design Patterns', description: 'Research and implement two React design patterns: compound components and render props. Show a working example of each and explain when you would choose one over the other.', created_by: 'u-priya', assigned_to: 'u-aarav',  created_at: baseDate },
  { id: 'a-flexbox',       title: 'CSS Flexbox Challenge',     description: 'Build a responsive card layout using only Flexbox. The layout should have 3 columns on desktop and 1 column on mobile. No CSS Grid allowed.', created_by: 'u-priya', assigned_to: 'u-meera',  created_at: baseDate },
  { id: 'a-rest',          title: 'REST API Integration',      description: 'Use the JSONPlaceholder API to build a simple user list. Show loading state while fetching and handle errors gracefully.', created_by: 'u-priya', assigned_to: 'u-meera',  created_at: baseDate },
  { id: 'a-ts',            title: 'TypeScript Basics',         description: 'Convert a given JavaScript file to TypeScript. Add proper type annotations to all variables, functions, and return types. Explain 3 benefits of TypeScript.', created_by: 'u-priya', assigned_to: 'u-kabir',  created_at: baseDate },
  { id: 'a-py-fns',        title: 'Python Functions',          description: 'Write 5 Python functions demonstrating: default arguments, *args, **kwargs, lambda functions, and recursion. Include a docstring for each.', created_by: 'u-ravi',  assigned_to: 'u-ananya', created_at: baseDate },
  { id: 'a-py-ds',         title: 'Data Structures in Python', description: 'Implement a stack and a queue in Python from scratch (no collections module). Write 3 test cases for each implementation.', created_by: 'u-ravi',  assigned_to: 'u-ananya', created_at: baseDate },
  { id: 'a-git',           title: 'Git Workflow',              description: 'Document your understanding of the Git feature branch workflow. Include: creating branches, committing, pushing, and opening a pull request. Use diagrams or pseudocode.', created_by: 'u-ravi',  assigned_to: 'u-dev',    created_at: baseDate },
  { id: 'a-node',          title: 'Node.js Fundamentals',      description: 'Build a simple Express.js server with 3 routes: GET /users, GET /users/:id, POST /users. Use in-memory array as storage.', created_by: 'u-ravi',  assigned_to: 'u-zara',   created_at: baseDate },
  // Guest assignments — assigned by the imaginary "Demo Mentor". No mentor link
  // exists for u-guest, so these only surface in the guest's student view.
  { id: 'a-guest-1',       title: 'Hello, Nexus',              description: 'Welcome to the demo. Write a 2-line introduction of yourself and what you want to learn next. This assignment exists so you can test the submit flow.', created_by: 'u-priya', assigned_to: 'u-guest',  created_at: baseDate },
  { id: 'a-guest-2',       title: 'Pick a Project',            description: 'Describe a small side project you could build in a weekend. What problem does it solve? What stack would you use? Keep it under 150 words.', created_by: 'u-priya', assigned_to: 'u-guest',  created_at: baseDate },
  { id: 'a-guest-3',       title: 'One Hard Thing',            description: 'Describe one technical concept you find hard. Be specific about which part confuses you. Mentors use this to tailor their first feedback to you.', created_by: 'u-priya', assigned_to: 'u-guest',  created_at: baseDate },
  { id: 'a-guest-4',       title: 'Goal in 90 Days',           description: 'What do you want to be able to build, deploy, or explain 90 days from today? Be concrete — vague goals are hard to mentor against.', created_by: 'u-priya', assigned_to: 'u-guest',  created_at: baseDate },
]

export const SEED_SUBMISSIONS: SeedSubmission[] = [
  {
    id: 's-counter',
    assignment_id: 'a-counter',
    student_id: 'u-aarav',
    content: 'I built the counter using useState. The increment adds 1, decrement subtracts 1 with a minimum of 0, and reset sets it back to 0. I learned that useState re-renders the component every time state changes, which is why the UI stays in sync automatically.',
    status: 'reviewed',
    feedback: 'Good work implementing all three controls. One thing to note: consider adding a minimum bound to prevent negative counts — real-world counters rarely go below zero. Your explanation of re-renders is accurate. Keep it up.',
    grade: 'B+',
    submitted_at: baseDate,
    reviewed_at: reviewedAt,
  },
  {
    id: 's-router',
    assignment_id: 'a-router',
    student_id: 'u-aarav',
    content: 'I set up React Router v6 with createBrowserRouter. My three routes are /, /about, and /users/:id. I used useNavigate in a button to redirect programmatically and useParams to extract the user ID from the URL. For 404 I added a catch-all route with path="*". Client-side routing avoids full page reloads which makes the app feel instant.',
    status: 'submitted',
    feedback: null,
    grade: null,
    submitted_at: baseDate,
    reviewed_at: null,
  },
  {
    id: 's-async',
    assignment_id: 'a-async',
    student_id: 'u-aarav',
    content: 'Callbacks are functions passed into other functions. Promises are objects that represent future values with .then() and .catch(). Async/await is syntactic sugar over promises that makes async code read like sync code. Example: const data = await fetch(url).then(r => r.json()).',
    status: 'reviewed',
    feedback: 'Great explanation of the progression from callbacks to async/await. Your code example is correct. Next step: explore Promise.all() for running multiple async operations in parallel. Overall: solid understanding.',
    grade: 'A',
    submitted_at: baseDate,
    reviewed_at: reviewedAt,
  },
  {
    id: 's-flexbox',
    assignment_id: 'a-flexbox',
    student_id: 'u-meera',
    content: 'I used display: flex on the container, flex-wrap: wrap, and each card has flex: 1 1 calc(33% - 1rem). On mobile I used a media query to set flex-direction: column. The layout works well on all screen sizes I tested.',
    status: 'reviewed',
    feedback: 'Well done! The calc() approach for card widths is exactly right. One improvement: use gap instead of margin on cards for cleaner spacing. Your mobile media query is correct. Full marks.',
    grade: 'A',
    submitted_at: baseDate,
    reviewed_at: reviewedAt,
  },
  {
    id: 's-rest',
    assignment_id: 'a-rest',
    student_id: 'u-meera',
    content: 'I used useEffect to fetch from JSONPlaceholder when the component mounts. I have a loading boolean state that shows a spinner while fetching. If fetch throws, I catch it and set an error message state. The user list renders as a simple ul with li items.',
    status: 'submitted',
    feedback: null,
    grade: null,
    submitted_at: baseDate,
    reviewed_at: null,
  },
  {
    id: 's-py-fns',
    assignment_id: 'a-py-fns',
    student_id: 'u-ananya',
    content: 'def greet(name="World"): return f"Hello, {name}"\ndef add(*args): return sum(args)\ndef describe(**kwargs): return str(kwargs)\nsquare = lambda x: x**2\ndef factorial(n): return 1 if n <= 1 else n * factorial(n-1)',
    status: 'submitted',
    feedback: null,
    grade: null,
    submitted_at: baseDate,
    reviewed_at: null,
  },
  {
    id: 's-py-ds',
    assignment_id: 'a-py-ds',
    student_id: 'u-ananya',
    content: 'class Stack:\n  def __init__(self): self.items = []\n  def push(self, item): self.items.append(item)\n  def pop(self): return self.items.pop()\n  def is_empty(self): return len(self.items) == 0\nQueue implemented similarly with append and pop(0).',
    status: 'reviewed',
    feedback: 'Stack implementation is correct. For Queue, pop(0) works but is O(n). In production use collections.deque for O(1) popleft(). Your test cases cover the happy path — add edge cases like popping from an empty stack. Good work overall.',
    grade: 'B',
    submitted_at: baseDate,
    reviewed_at: reviewedAt,
  },
  {
    id: 's-node',
    assignment_id: 'a-node',
    student_id: 'u-zara',
    content: 'Built with Express. GET /users returns the full array. GET /users/:id finds by id with find(). POST /users pushes to the array and returns the new user with 201 status. I used express.json() middleware to parse request bodies.',
    status: 'submitted',
    feedback: null,
    grade: null,
    submitted_at: baseDate,
    reviewed_at: null,
  },
]
