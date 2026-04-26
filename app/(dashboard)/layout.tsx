"use client";

import { Home, LogOut, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function ThemeToggleInline() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);
  function toggle() {
    document.documentElement.classList.toggle("dark");
    setDark(d => !d);
  }
  return (
    <button onClick={toggle} className="opacity-50 hover:opacity-100 hover:bg-white/10 p-3 rounded-2xl cursor-pointer transition text-white">
      {dark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isStudent = pathname.includes("/student");

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  return (
    <div className="w-full max-w-[1520px] h-[90vh] min-h-[700px] bg-nexus-bg-main rounded-[40px] shadow-2xl flex overflow-hidden">

      {/* Sidebar */}
      <nav className="w-[90px] bg-nexus-sidebar flex flex-col items-center py-8 gap-8 shrink-0 z-10 text-white">
        <Link href={isStudent ? "/student" : "/mentor"} className="opacity-100 bg-white text-black p-3 rounded-2xl transition">
          <Home size={24} />
        </Link>

        <div className="mt-auto flex flex-col gap-6 items-center">
          <ThemeToggleInline />
          <button
            onClick={handleLogout}
            className="opacity-50 hover:opacity-100 hover:bg-white/10 p-3 rounded-2xl cursor-pointer transition text-white"
          >
            <LogOut size={24} />
          </button>
        </div>
      </nav>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden bg-nexus-bg-main rounded-l-[40px] -ml-5">
        {children}
      </div>
    </div>
  );
}
