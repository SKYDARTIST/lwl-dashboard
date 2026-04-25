import { BookOpen, Sparkles, GraduationCap, Users } from "lucide-react";
import { ThemeToggle } from "./components/ThemeToggle";
import { DemoLoginButton } from "./components/DemoLoginButton";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-nexus-bg-main w-full">
      <nav className="flex justify-between items-center py-6 px-8 max-w-[1280px] mx-auto w-full">
        <div className="flex items-center gap-3 font-extrabold text-xl text-nexus-text">
          <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center">
            <BookOpen size={24} />
          </div>
          Nexus
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-12 max-w-[900px] mx-auto">
        <div className="anim-1 bg-nexus-card border border-nexus-border py-2 px-4 rounded-full text-sm font-bold text-nexus-muted mb-6 flex items-center gap-2 shadow-sm">
          <Sparkles size={14} className="text-nexus-submitted" /> A Two-Sided Learning Platform
        </div>

        <h1 className="anim-2 text-5xl md:text-7xl font-extrabold tracking-[-2px] leading-[1.05] mb-6 text-nexus-text">
          Where mentors shape<br />
          <span className="text-gradient-accent">the future.</span>
        </h1>

        <p className="anim-3 text-lg text-nexus-muted mb-14 max-w-xl leading-relaxed">
          Students submit their best work. Expert mentors give real, targeted feedback. One clean loop — from assignment to growth.
        </p>

        <div className="flex flex-col md:flex-row gap-6 w-full justify-center">
          {/* Student Card */}
          <div className="anim-4 spring-card group bg-nexus-card rounded-[28px] p-8 w-full max-w-[320px] border border-nexus-border flex flex-col text-left">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 bg-indigo-100 dark:bg-indigo-950 text-indigo-600">
              <GraduationCap size={28} />
            </div>
            <div className="text-xs font-extrabold uppercase tracking-widest text-indigo-500 mb-1">Student Portal</div>
            <div className="text-2xl font-extrabold mb-1 text-nexus-text">Learn & Grow</div>
            <div className="text-xs text-nexus-muted mb-3">Demo account: Aarav Singh</div>
            <div className="text-sm text-nexus-muted leading-relaxed mb-6 flex-1">
              View your pending assignments, submit responses, and track your progress — all in one place.
            </div>
            <DemoLoginButton
              email="aarav@lwl.edu"
              password="student123"
              label="Enter Student View"
              className="bg-nexus-bg-main text-nexus-text font-bold py-3 px-4 rounded-xl flex justify-center items-center gap-2 hover:bg-indigo-600 hover:text-white transition-colors duration-200 cursor-pointer disabled:opacity-60 group"
            />
          </div>

          {/* Mentor Card */}
          <div className="anim-5 spring-card group bg-nexus-card rounded-[28px] p-8 w-full max-w-[320px] border border-nexus-border flex flex-col text-left">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 bg-pink-100 dark:bg-pink-950 text-pink-600">
              <Users size={28} />
            </div>
            <div className="text-xs font-extrabold uppercase tracking-widest text-pink-500 mb-1">Mentor Portal</div>
            <div className="text-2xl font-extrabold mb-1 text-nexus-text">Guide & Review</div>
            <div className="text-xs text-nexus-muted mb-3">Demo account: Priya Sharma</div>
            <div className="text-sm text-nexus-muted leading-relaxed mb-6 flex-1">
              View your students, manage the review queue, and deliver targeted feedback that drives real growth.
            </div>
            <DemoLoginButton
              email="priya@lwl.edu"
              password="mentor123"
              label="Enter Mentor View"
              className="bg-nexus-bg-main text-nexus-text font-bold py-3 px-4 rounded-xl flex justify-center items-center gap-2 hover:bg-pink-600 hover:text-white transition-colors duration-200 cursor-pointer disabled:opacity-60 group"
            />
          </div>
        </div>
      </main>
    </div>
  );
}
