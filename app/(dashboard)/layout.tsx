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
    const next = !dark;
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("nexus-theme", next ? "dark" : "light");
    setDark(next);
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
    <div className="nexus-shell w-full max-w-[1540px] min-h-[calc(100vh-2.5rem)] bg-nexus-bg-main rounded-[32px] lg:rounded-[40px] flex flex-col lg:flex-row overflow-hidden">

      {/* Sidebar */}
      <nav className="w-full lg:w-[90px] bg-nexus-sidebar flex lg:flex-col items-center justify-between lg:justify-start px-5 py-4 lg:px-0 lg:py-8 gap-4 lg:gap-8 shrink-0 z-10 text-white">
        <Link
          href={isStudent ? "/student" : "/mentor"}
          title="Back to Dashboard"
          className="opacity-100 bg-white text-black p-3 rounded-2xl transition hover:scale-110 hover:shadow-lg active:scale-95"
        >
          <Home size={24} />
        </Link>

        <div className="lg:mt-auto flex lg:flex-col gap-3 lg:gap-6 items-center">
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
      <div className="flex-1 flex flex-col xl:flex-row overflow-hidden bg-nexus-bg-main lg:rounded-l-[40px] lg:-ml-5">
        {children}
      </div>
    </div>
  );
}
