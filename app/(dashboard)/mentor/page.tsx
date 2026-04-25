"use client";

import { Search, Plus, Bell, ChevronDown, ChevronRight, Inbox, User } from "lucide-react";

export default function MentorDashboard() {
  return (
    <>
      {/* Center Column */}
      <main className="flex-[6] p-10 md:p-12 overflow-y-auto flex flex-col gap-8 bg-nexus-card">
        <header className="flex items-center justify-between">
          <h1 className="text-[28px] font-extrabold tracking-tight">Dashboard</h1>
          <div className="flex items-center bg-nexus-bg-main px-5 py-2.5 rounded-full w-[300px] gap-3 border border-nexus-border">
            <Search className="text-nexus-muted" size={18} />
            <input type="text" placeholder="Search..." className="bg-transparent border-none outline-none font-inherit text-sm w-full" />
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-nexus-accent text-white flex items-center justify-center cursor-pointer"><Plus size={20} /></div>
            <div className="w-10 h-10 rounded-full bg-transparent border border-nexus-border text-nexus-text flex items-center justify-center cursor-pointer"><Bell size={20} /></div>
            <div className="flex items-center gap-3 font-bold text-[15px]">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-white">P</div>
              <span>Priya</span>
            </div>
          </div>
        </header>

        <div>
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-[22px] font-extrabold tracking-tight">Find your student</h2>
            <div className="px-4 py-2 rounded-full border border-nexus-border bg-nexus-card text-[13px] font-semibold flex items-center gap-2 cursor-pointer">
              Status <ChevronDown size={16} />
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            {/* List Item Mock */}
            <div className="flex items-center p-4 px-5 bg-nexus-card rounded-xl transition cursor-pointer border border-nexus-border hover:-translate-y-0.5 hover:shadow-md">
              <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-4 font-bold text-lg">A</div>
              <div className="font-bold text-[15px] flex-[1.5]">Aarav</div>
              <div className="text-nexus-muted text-[13px] flex-[2] line-clamp-1">1 pending review</div>
              <div className="font-medium text-[13px] flex-1 flex items-center gap-1.5 text-nexus-text">
                View <ChevronRight size={16} />
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-[22px] font-extrabold tracking-tight">Action Panel</h2>
          </div>
          <div className="flex gap-6 mt-2">
            <div className="bg-nexus-card border border-nexus-border rounded-[32px] p-8 flex-1 flex flex-col gap-4 shadow-sm">
              <div className="flex flex-col items-center text-center gap-2 mb-2">
                <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-2xl">A</div>
                <h3 className="text-lg font-extrabold">Aarav</h3>
                <p className="text-nexus-muted text-[13px]">English Writing</p>
              </div>
              <div className="text-sm leading-relaxed text-nexus-text bg-nexus-bg-main p-4 rounded-xl">
                <strong className="block mb-2">Student's Submission:</strong>
                Leadership is the art of motivating a group of people to act toward achieving a common goal.
              </div>
            </div>
            <div className="bg-nexus-bg-panel rounded-[32px] p-8 flex-1 flex flex-col gap-4">
              <h4 className="text-base font-bold mb-1">Write Feedback</h4>
              <textarea className="w-full bg-nexus-card border border-nexus-border rounded-2xl p-4 text-sm min-h-[120px] resize-y outline-none focus:border-nexus-accent transition" placeholder="Write here..."></textarea>
              <button className="mt-auto bg-nexus-accent text-white border-none py-3.5 px-6 rounded-full font-semibold text-sm cursor-pointer hover:opacity-80 transition">Mark Reviewed</button>
            </div>
          </div>
        </div>
      </main>

      {/* Right Column */}
      <aside className="flex-[3.5] bg-nexus-bg-panel rounded-[40px] m-4 mr-0 p-8 flex flex-col overflow-y-auto">
        <h3 className="text-lg font-extrabold mb-5">Recent Submissions</h3>
        <div className="flex flex-col gap-4 mb-10">
          <div className="flex items-center gap-4 cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-nexus-submitted text-white flex items-center justify-center shrink-0"><Inbox size={18} /></div>
            <div className="flex-1">
              <div className="font-bold text-sm">English Writing</div>
              <div className="text-xs text-nexus-muted font-medium mt-0.5">Aarav</div>
            </div>
            <ChevronRight size={16} className="text-nexus-muted" />
          </div>
        </div>

        <div className="flex flex-col items-center bg-nexus-bg-main rounded-[32px] p-8 mt-auto">
          <h3 className="mb-6 font-extrabold self-start text-lg">Account Progress</h3>
          <div className="w-full flex justify-between text-[13px] font-bold mt-6">
            <span>Progress</span>
            <span>0%</span>
          </div>
          <div className="w-full h-1.5 bg-gray-200 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-nexus-accent rounded-full transition-all duration-1000 w-0"></div>
          </div>
        </div>
      </aside>
    </>
  );
}
