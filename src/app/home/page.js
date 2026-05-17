"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import { 
  Building2, BookOpen, Shield, 
  Circle, CheckCircle, XCircle, Search, 
  Inbox, MapPin, Calendar, Clock 
} from "lucide-react";

const STATUS_CONFIG = {
  new: {
    label: "Baru",
    dot: "bg-amber-400",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    icon: <Circle className="w-3.5 h-3.5" />,
  },
  in_review: {
    label: "Ditinjau",
    dot: "bg-blue-400",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    icon: <Search className="w-3.5 h-3.5" />,
  },
  in_progress: {
    label: "Diproses",
    dot: "bg-indigo-400",
    badge: "bg-indigo-50 text-indigo-700 border-indigo-200",
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  resolved: {
    label: "Selesai",
    dot: "bg-green-400",
    badge: "bg-green-50 text-green-700 border-green-200",
    icon: <CheckCircle className="w-3.5 h-3.5" />,
  },
  rejected: {
    label: "Ditolak",
    dot: "bg-red-400",
    badge: "bg-red-50 text-red-700 border-red-200",
    icon: <XCircle className="w-3.5 h-3.5" />,
  },
  closed: {
    label: "Ditutup",
    dot: "bg-slate-400",
    badge: "bg-slate-50 text-slate-600 border-slate-200",
    icon: <XCircle className="w-3.5 h-3.5" />,
  },
};

// CAT_CONFIG will be built dynamically

const PROGRESS_STEPS = ["new", "in_review", "in_progress", "resolved"];

function ProgressBar({ status }) {
  if (status === "rejected") {
    return (
      <div className="flex items-center gap-2 mt-1">
        <div className="flex-1 h-1.5 bg-red-100 rounded-full overflow-hidden">
          <div className="h-full bg-red-500 rounded-full w-full" />
        </div>
        <span className="text-[10px] font-semibold text-red-500 flex-shrink-0">Ditolak</span>
      </div>
    );
  }
  const currentIdx = PROGRESS_STEPS.indexOf(status);
  const pct = status === "closed" ? 100 : Math.max(0, ((currentIdx + 1) / PROGRESS_STEPS.length) * 100);
  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all duration-1000" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] font-medium text-slate-400 flex-shrink-0">{Math.round(pct)}%</span>
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [searchTicket, setSearchTicket] = useState("");
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch("/api/categories")
      .then(res => res.json())
      .then(d => {
        if (d.success) setCategories(d.data);
      });
  }, []);

  const getCatConfig = useCallback((code) => {
    const cat = categories.find(c => c.code === code);
    if (!cat) return { label: code, colorHex: "#64748b", icon: <Circle className="w-3.5 h-3.5" /> };
    
    let icon = <span className="text-sm leading-none">{cat.icon}</span>;
    if (code === 'public') icon = <Building2 className="w-3.5 h-3.5" />;
    if (code === 'edu') icon = <BookOpen className="w-3.5 h-3.5" />;
    if (code === 'safe') icon = <Shield className="w-3.5 h-3.5" />;

    return { 
      label: cat.name, 
      colorHex: cat.color_hex, 
      icon 
    };
  }, [categories]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUser(payload);
    } catch {
      localStorage.removeItem("token");
      router.push("/login");
    }
    setLoading(false);
  }, [router]);

  const loadReports = useCallback(async () => {
    if (!user) return;
    setReportsLoading(true);
    try {
      const params = new URLSearchParams({ limit: "20" });
      if (filterStatus) params.set("status", filterStatus);
      const res = await fetch(`/api/pengaduan?${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await res.json();
      if (data.success) setReports(data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setReportsLoading(false);
    }
  }, [user, filterStatus]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    localStorage.removeItem("token");
    router.push("/");
  }

  const filteredReports = reports.filter(
    (r) => !searchTicket || r.ticket_number.toLowerCase().includes(searchTicket.toLowerCase()) || r.title.toLowerCase().includes(searchTicket.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50/50 dark:bg-slate-950 pb-20 transition-colors duration-300">
      {/* Navbar */}
      <nav className="glass sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-5 h-[70px] flex items-center justify-between gap-3">
          <Link href="/home" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 shadow-md shadow-blue-500/20 flex items-center justify-center text-white font-bold text-lg">
              K
            </div>
            <span className="font-bold text-slate-800 dark:text-white text-[17px] tracking-tight">
              Konekko<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600"> Services</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/pengaduan" className="hidden sm:flex px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold transition-all shadow-sm shadow-blue-600/20 hover:shadow-md hover:shadow-blue-600/40 items-center gap-2">
              <span className="text-lg leading-none">+</span> Buat Laporan
            </Link>
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold border border-slate-300 dark:border-slate-600">
                {user?.name?.[0] || "U"}
              </div>
              <button onClick={handleLogout} className="text-[13px] font-semibold text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                Keluar
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-5 pt-8">
        {/* Welcome Card */}
        <div className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm mb-8 transition-colors duration-300">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-100 to-violet-50 dark:from-blue-900/30 dark:to-violet-900/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-60 pointer-events-none"></div>
          <div className="relative p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white mb-2">
                Halo, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">{user?.name}</span>
              </h1>
              <p className="text-[14px] text-slate-500 dark:text-slate-400 max-w-lg leading-relaxed">
                Selamat datang di dashboard pelapor. Pantau terus status pengaduan Anda dan berkontribusi untuk lingkungan yang lebih baik.
              </p>
            </div>
            <Link href="/pengaduan" className="sm:hidden w-full text-center px-4 py-3 rounded-xl bg-blue-600 text-white text-[14px] font-bold shadow-md shadow-blue-600/20">
              Buat Laporan Baru
            </Link>
          </div>
        </div>

        {/* Laporan Section */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Laporan Saya</h2>
            <p className="text-[13px] text-slate-400 dark:text-slate-500 mt-1">Daftar semua tiket pengaduan yang Anda buat</p>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1 sm:w-64">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                className="w-full pl-9 pr-4 py-2.5 text-[13px] rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 dark:focus:ring-blue-900/30 transition-all"
                placeholder="Cari tiket..."
                value={searchTicket}
                onChange={(e) => setSearchTicket(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-2">
          {[
            { val: "", label: "Semua" },
            { val: "new", label: "Baru", icon: <Circle className="w-3.5 h-3.5 inline-block mr-1" /> },
            { val: "in_progress", label: "Diproses", icon: <Clock className="w-3.5 h-3.5 inline-block mr-1" /> },
            { val: "resolved", label: "Selesai", icon: <CheckCircle className="w-3.5 h-3.5 inline-block mr-1" /> },
            { val: "rejected", label: "Ditolak", icon: <XCircle className="w-3.5 h-3.5 inline-block mr-1" /> },
          ].map((f) => (
            <button
              key={f.val}
              onClick={() => setFilterStatus(f.val)}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-[12px] font-semibold border transition-all ${
                filterStatus === f.val
                  ? "bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 border-slate-800 dark:border-slate-200 shadow-md"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              {f.icon} {f.label}
            </button>
          ))}
        </div>

        {/* Laporan List */}
        {reportsLoading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin mx-auto mb-4" />
            <p className="text-[14px] text-slate-400 font-medium">Memuat data laporan...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-16 text-center shadow-sm">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 mx-auto mb-5 border border-slate-100 dark:border-slate-700">
              <Inbox className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Belum Ada Laporan</h3>
            <p className="text-[14px] text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">
              {searchTicket || filterStatus ? "Tidak ada laporan yang sesuai dengan filter pencarian Anda." : "Anda belum pernah membuat laporan. Mulai dengan membuat laporan pertama Anda."}
            </p>
            {!searchTicket && !filterStatus && (
              <Link href="/pengaduan" className="inline-flex px-6 py-3 bg-slate-800 hover:bg-slate-900 text-white text-[13px] font-bold rounded-xl transition-all shadow-md">
                Buat Laporan Sekarang
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredReports.map((r) => {
              const st = STATUS_CONFIG[r.status] || STATUS_CONFIG.new;
              const cat = getCatConfig(r.category_code);
              return (
                <Link href={`/riwayat/${r.ticket_number}`} key={r.id} className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-lg hover:shadow-blue-900/5 transition-all block">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${st.dot} shadow-sm`} />
                      <span className="font-mono text-[13px] font-bold text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {r.ticket_number}
                      </span>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${st.badge}`}>
                      {st.label}
                    </span>
                  </div>
                  
                  <h3 className="text-[15px] font-bold text-slate-800 dark:text-slate-100 mb-1.5 line-clamp-1 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                    {r.title}
                  </h3>
                  
                  <p className="text-[12px] text-slate-500 dark:text-slate-400 mb-4 line-clamp-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 opacity-70" /> {r.location_address}
                  </p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                    <span 
                      className="text-[10px] font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1.5"
                      style={{ color: cat.colorHex, backgroundColor: `${cat.colorHex}1a` }}
                    >
                      {cat.icon} {cat.label}
                    </span>
                    <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                      {new Date(r.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                  <div className="mt-4">
                    <ProgressBar status={r.status} />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
