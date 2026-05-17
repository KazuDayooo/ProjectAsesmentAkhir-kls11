"use client";
// src/components/admin/AdminSidebar.js

import { useRouter } from "next/navigation";
import { LayoutDashboard, ClipboardList, Users } from "lucide-react";

const NAV_ADMIN = [
  { key: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" />, href: "/admin" },
  {
    key: "laporan",
    label: "Semua Laporan",
    icon: <ClipboardList className="w-5 h-5" />,
    href: "/admin/laporan",
  },
  { key: "users", label: "Kelola User", icon: <Users className="w-5 h-5" />, href: "/admin/users" },
];

const NAV_AGENT = [
  { key: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" />, href: "/admin" },
  {
    key: "laporan",
    label: "Laporan Masuk",
    icon: <ClipboardList className="w-5 h-5" />,
    href: "/admin/laporan",
  },
];

export default function AdminSidebar({ active, user }) {
  const router = useRouter();
  const nav = user?.role === "admin" ? NAV_ADMIN : NAV_AGENT;

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    localStorage.removeItem("token");
    router.push("/login");
  }

  return (
    <aside className="w-64 bg-slate-900 flex flex-col overflow-hidden flex-shrink-0 relative shadow-2xl z-20">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
      
      {/* Logo */}
      <div className="h-20 flex items-center gap-3 px-6 border-b border-white/10 relative z-10">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-lg font-bold shadow-lg">
          K
        </div>
        <div>
          <p className="text-[15px] font-bold text-white leading-tight">
            Konekko<span className="text-blue-400"> Admin</span>
          </p>
          <p className="text-[11px] text-slate-400 font-medium">
            {user?.role === "admin" ? "Admin Panel" : "Agent Panel"}
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 overflow-y-auto relative z-10 custom-scrollbar">
        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest px-3 mb-3 mt-2">
          Menu Utama
        </p>
        {nav.map((item) => (
          <button
            key={item.key}
            onClick={() => router.push(item.href)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left mb-1 text-[13px] font-semibold transition-all duration-300
              ${
                active === item.key
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
          >
            <span className="flex items-center justify-center">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* User info + logout */}
      <div className="p-5 border-t border-white/10 relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 flex items-center justify-center text-white text-[13px] font-bold">
            {user?.name?.[0] || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold text-white truncate">
              {user?.name}
            </p>
            <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20 inline-block mt-0.5 uppercase">
              {user?.role}
            </span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-[13px] font-bold text-slate-300 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-all text-center"
        >
          Keluar Sistem
        </button>
      </div>
    </aside>
  );
}
