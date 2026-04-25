"use client";

import { Home, User, MessageSquare, Calendar, Settings, LogOut, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "../components/ThemeToggle";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isStudent = pathname.includes("/student");

  return (
    <div className="w-full max-w-[1280px] h-[90vh] min-h-[700px] bg-nexus-bg-main rounded-[40px] shadow-2xl flex overflow-hidden">
      
      {/* Sidebar */}
      <nav className="w-[90px] bg-nexus-sidebar flex flex-col items-center py-8 gap-8 shrink-0 z-10 text-white">
        <div className="mb-5 cursor-pointer hover:opacity-80 transition"><Menu /></div>
        
        <Link href={isStudent ? "/student" : "/mentor"} className="opacity-100 bg-white text-black p-3 rounded-2xl transition">
          <Home size={24} />
        </Link>
        <div className="opacity-50 hover:opacity-100 hover:bg-white/10 p-3 rounded-2xl cursor-pointer transition"><User size={24} /></div>
        <div className="opacity-50 hover:opacity-100 hover:bg-white/10 p-3 rounded-2xl cursor-pointer transition"><MessageSquare size={24} /></div>
        <div className="opacity-50 hover:opacity-100 hover:bg-white/10 p-3 rounded-2xl cursor-pointer transition"><Calendar size={24} /></div>
        
        <div className="mt-auto flex flex-col gap-8 items-center">
          <ThemeToggle />
          <Link href="/" className="opacity-50 hover:opacity-100 hover:bg-white/10 p-3 rounded-2xl cursor-pointer transition">
            <LogOut size={24} />
          </Link>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden bg-nexus-bg-main rounded-l-[40px] -ml-5">
        {children}
      </div>
    </div>
  );
}
