import Link from "next/link";
import { BookOpen, Sparkles, GraduationCap, Users, ArrowRight, CheckCircle, Clock, FileText } from "lucide-react";
import { ThemeToggle } from "./components/ThemeToggle";

export default function LandingPage() {
  return (
    <div className="relative flex flex-col min-h-screen w-full overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute left-[-8rem] top-24 h-80 w-80 rounded-full bg-indigo-400/20 blur-3xl" />
        <div className="absolute right-[-10rem] top-32 h-96 w-96 rounded-full bg-pink-400/20 blur-3xl" />
      </div>

      <nav className="relative z-10 flex justify-between items-center py-6 px-6 sm:px-8 max-w-[1280px] mx-auto w-full">
        <div className="flex items-center gap-3 font-extrabold text-xl text-nexus-text">
          <div className="w-11 h-11 bg-nexus-sidebar text-white rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/10">
            <BookOpen size={24} />
          </div>
          Nexus
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
        </div>
      </nav>

      <main className="relative z-10 flex-1 flex flex-col items-center text-center px-6 py-10 sm:py-16 max-w-[1180px] mx-auto w-full">
        <div className="anim-1 bg-nexus-card/90 border border-nexus-border py-2 px-4 rounded-full text-sm font-bold text-nexus-muted mb-6 flex items-center gap-2 shadow-sm backdrop-blur">
          <Sparkles size={14} className="text-nexus-submitted" /> A Two-Sided Learning Platform
        </div>

        <h1 className="anim-2 text-5xl md:text-7xl lg:text-8xl font-black tracking-[-2px] leading-[1.02] mb-6 text-nexus-text max-w-5xl">
          Submit work.<br />
          <span className="text-gradient-accent">Get feedback. Grow.</span>
        </h1>

        <p className="anim-3 text-lg text-nexus-muted mb-14 max-w-xl leading-relaxed">
          Students submit their best work. Expert mentors give real, targeted feedback. One clean loop — from assignment to growth.
        </p>

        <div className="anim-4 nexus-glass mb-10 w-full max-w-4xl rounded-[32px] p-4 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
            {[
              { icon: <FileText size={18} />, title: 'Assigned', tone: 'text-amber-600 bg-amber-100 dark:bg-amber-950/60' },
              { icon: <Clock size={18} />, title: 'Submitted', tone: 'text-blue-600 bg-blue-100 dark:bg-blue-950/60' },
              { icon: <CheckCircle size={18} />, title: 'Reviewed', tone: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-950/60' },
            ].map((item) => (
              <div key={item.title} className="rounded-3xl bg-nexus-card border border-nexus-border p-4 shadow-sm">
                <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-2xl ${item.tone}`}>
                  {item.icon}
                </div>
                <div className="text-sm font-extrabold text-nexus-text">{item.title}</div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-nexus-bg-panel">
                  <div className={`h-full rounded-full ${item.title === 'Assigned' ? 'w-1/2 bg-amber-500' : item.title === 'Submitted' ? 'w-2/3 bg-blue-500' : 'w-full bg-emerald-500'}`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 w-full justify-center">
          {/* Student Card */}
          <div className="anim-4 spring-card group nexus-glass rounded-[32px] p-8 w-full max-w-[360px] flex flex-col text-left">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 shadow-sm">
              <GraduationCap size={28} />
            </div>
            <div className="text-xs font-extrabold uppercase tracking-widest text-indigo-500 mb-1">Student Portal</div>
            <div className="text-2xl font-extrabold mb-1 text-nexus-text">Learn & Grow</div>
            <div className="text-xs text-nexus-muted mb-3">Demo accounts: Aarav Singh + 5 others</div>
            <div className="text-sm text-nexus-muted leading-relaxed mb-6 flex-1">
              View your pending assignments, submit responses, and track your progress — all in one place.
            </div>
            <Link
              href="/login?role=student"
              className="bg-nexus-sidebar text-white font-bold py-3 px-4 rounded-2xl flex justify-center items-center gap-2 hover:bg-indigo-600 transition-colors duration-200 cursor-pointer"
            >
              Enter Student View <ArrowRight size={16} />
            </Link>
          </div>

          {/* Mentor Card */}
          <div className="anim-5 spring-card group nexus-glass rounded-[32px] p-8 w-full max-w-[360px] flex flex-col text-left">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 bg-pink-100 dark:bg-pink-950 text-pink-600 shadow-sm">
              <Users size={28} />
            </div>
            <div className="text-xs font-extrabold uppercase tracking-widest text-pink-500 mb-1">Mentor Portal</div>
            <div className="text-2xl font-extrabold mb-1 text-nexus-text">Guide & Review</div>
            <div className="text-xs text-nexus-muted mb-3">Demo accounts: Priya Sharma · Ravi Kumar</div>
            <div className="text-sm text-nexus-muted leading-relaxed mb-6 flex-1">
              View your students, manage the review queue, and deliver targeted feedback that drives real growth.
            </div>
            <Link
              href="/login?role=mentor"
              className="bg-nexus-sidebar text-white font-bold py-3 px-4 rounded-2xl flex justify-center items-center gap-2 hover:bg-pink-600 transition-colors duration-200 cursor-pointer"
            >
              Enter Mentor View <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
