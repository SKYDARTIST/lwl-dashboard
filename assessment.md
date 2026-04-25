T A K E - H O M E A S S I G N M E N T · V 1 . 2
Student & Mentor Dashboard
A two-sided learning platform — build the core loop, ship something working.

TYPE
Take-home

DURATION
2 days

LEVEL
Mid

DEADLINE
Mon, Apr 27 · 11:59 PM IST

01 — OVERVIEW
What you're building
Build a two-sided learning platform with a Student Dashboard and a Mentor
Dashboard. Students view and submit assignments. Mentors review submissions
and give feedback.
This is a 2-day scoped exercise. We are not expecting a production-ready product. We are
evaluating how you scope, prioritize, and ship a coherent end-to-end slice under realistic time
pressure.
Read the scope section carefully before writing any code. A small, polished, working app
will score significantly higher than a sprawling, half-finished one.

02 — OBJECTIVES
What we're evaluating

You can ship a working full-stack (or full frontend with a mocked backend) feature end-to-end.
You show clear product thinking — what you cut, what you kept, and why.
Your code is something we can read, run, and reason about within minutes.

Student & Mentor Dashboard — Take-Home Assignment Page 2 of 6

03 — PERSONAS
Who you're building for

Aarav
THE STUDENT
Wants to see his pending assignments,
submit work, and read mentor feedback in
one place.

Priya
THE MENTOR
Wants to see her assigned students, review
their submissions, and leave thoughtful
feedback efficiently.

04 — SCOPE
What's in, what's out

MUST HAVE · THE BAR

Authentication & Roles
Login as either a student or a mentor. Sign-up is not required — hardcoded or
seeded users are fine.
Role-based routing. A student should not see mentor screens and vice versa.
Basic session persistence (any approach is acceptable; document your choice).

Student Dashboard
1. Home view — student's name and a list of their assignments with status (pending,
submitted, reviewed).
2. Assignment detail view — read the assignment description and submit a text
response.
3. Feedback view — once a mentor has reviewed a submission, the student sees the
feedback inline on that assignment.

Mentor Dashboard
1. Students list — all students assigned to the mentor with a quick stat (e.g., pending
submissions count).
2. Submissions queue — all submissions awaiting review.
3. Submission review flow — open a submission, read it, write feedback, mark it as
reviewed. The student should immediately see this on their side.

Cross-cutting
Loading and empty states on every async view.
Basic form validation.

Student & Mentor Dashboard — Take-Home Assignment Page 3 of 6

Reasonably responsive layout (desktop priority; mobile can degrade).
Seed data so reviewers see populated dashboards immediately. At least 2 mentors,
4–6 students, and 5+ assignments with mixed statuses.

OUT OF SCOPE · DON'T BUILD
We will not credit these and they signal poor scoping:
Sign-up flow, password reset, email verification.
Session scheduling, calendars, video calls.
Real-time notifications or websockets.
File uploads (text-only submissions are fine).
Analytics dashboards or charts beyond a simple progress indicator.
Profile editing, avatar uploads, settings pages.
Search, filters, pagination — unless your seed data genuinely needs it.

BONUS · ONLY AFTER MUST-HAVES ARE SOLID
A simple progress indicator on the student home view (e.g., "3 of 7 assignments completed").
Mentor can create a new assignment and assign it to one or more students.
A "graded" status with a numeric or letter grade in addition to feedback.
Dark mode.
Basic tests for one critical flow (e.g., submission review).

Student & Mentor Dashboard — Take-Home Assignment Page 4 of 6

05 — DATA MODEL
Suggested entities
Adapt as needed. At minimum:
User           id, name, email, password_hash, role (student | mentor)
MentorAssignment   Links a student to a mentor.
Assignment     id, title, description, created_by (mentor_id), assigned_to (student_id)
Submission     id, assignment_id, student_id, content, status, feedback, submitted_at, reviewed_at

06 — TECH STACK
Use what you're fastest in
Frontend: React, Next.js, Vue, or Svelte. TypeScript is a plus, not required.
Styling: Tailwind, a component library, or vanilla CSS — all fine.
Backend: Any. Frontend-only with a mocked backend (MSW, json-server, in-memory store) is
fully acceptable given the 2-day window. Be explicit about it in the README.
Database: SQLite or in-memory store is encouraged for quick setup. Postgres is fine if you're
already comfortable with it.
Auth: Roll a minimal JWT/cookie/localStorage approach. Don't spend time integrating Auth0
or Clerk.

07 — DELIVERABLES
What to send us
1. A repository (GitHub/GitLab) with access shared.
2. A README containing:
   Setup steps that work in under 5 minutes on a fresh machine.
   Seed credentials for at least one student and one mentor account.
   What you completed, what you intentionally skipped, and what you'd do next with more
   time. This section is graded.
   Any AI tool usage disclosure.
3. Seed data loaded automatically on first run.
A deployed link is optional. Local run is fine. If you choose to deploy (Vercel, Netlify, Render), it's a
small bonus.

Student & Mentor Dashboard — Take-Home Assignment Page 5 of 6

08 — EVALUATION
How we score

AREA                    WEIGHT   WHAT WE LOOK FOR
Must-haves end-to-end   35%      The full submit → review → feedback loop works without errors.
Code Quality            25%      Readable, sensibly structured, meaningful commits. We will read the diff.
UI / UX                 20%      States handled, layout coherent, no broken interactions.
Scoping & README        15%      Did you make smart cuts? Is the README clear and honest?
Bonus / Polish          5%       Anything beyond the bar that shows extra care.

A smaller scope, fully working beats a larger scope with broken flows. Every time.

09 — TIMELINE
When it's due
Deadline: Monday, April 27, 2026 — 11:59 PM IST.
Submit by replying to the original assignment email with the repository link and seed
credentials.
If something genuinely blocks you (illness, emergency), tell us early — we'd rather extend
than receive a rushed submission.

10 — GROUND RULES
The fine print
You may use any open-source libraries, frameworks, and starter templates.
AI coding assistants (Copilot, Cursor, Claude, etc.) are allowed. Disclose usage in the
README and be ready to walk through any part of the code live — the follow-up interview will
include explaining your decisions and extending a feature on the spot.
Do not lift a public dashboard template wholesale. Inspiration is fine; attribution is required.

Student & Mentor Dashboard — Take-Home Assignment Page 6 of 6

11 — QUESTIONS
Before you start
If anything is unclear, reply to the assignment email before you start coding. A 5-minute
clarification beats 5 hours of rework.
