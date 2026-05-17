'use client';
// src/app/admin/page.js
// Dashboard utama admin — statistik + laporan terbaru

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import StatsCard from '@/components/admin/StatsCard';
import ThemeToggle from '@/components/ThemeToggle';
import { 
  Building2, BookOpen, Shield, Inbox, User, Calendar, ArrowRight, 
  ClipboardList, Circle, CheckCircle, Clock 
} from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser]   = useState(null);
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (!['admin', 'agent'].includes(payload.role)) {
        router.push('/pengaduan'); return;
      }
      setUser(payload);
    } catch {
      router.push('/login'); return;
    }

    fetchStats();
    fetchRecent();
  }, []);

  async function fetchStats() {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setStats(data.data);
    } catch {}
    setLoading(false);
  }

  async function fetchRecent() {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/pengaduan?limit=5', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setRecent(data.data);
    } catch {}
  }

  const STATUS_BADGE = {
    new:         'bg-amber-100 text-amber-700',
    in_review:   'bg-blue-100 text-blue-700',
    in_progress: 'bg-blue-100 text-blue-700',
    resolved:    'bg-green-100 text-green-700',
    rejected:    'bg-red-100 text-red-700',
    closed:      'bg-gray-100 text-gray-600',
  };
  const STATUS_LABEL = {
    new: 'Baru', in_review: 'Ditinjau', in_progress: 'Diproses',
    resolved: 'Selesai', rejected: 'Ditolak', closed: 'Ditutup',
  };

  return (
    <div className="flex h-screen bg-cream-50 dark:bg-slate-950 transition-colors duration-300 overflow-hidden">
      <AdminSidebar active="dashboard" user={user} />

      <main className="flex-1 overflow-y-auto bg-cream-50 dark:bg-slate-950 p-6 sm:p-8 transition-colors duration-300">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">Dashboard Admin</h1>
            <p className="text-[14px] text-slate-500 dark:text-slate-400 mt-1">Selamat datang kembali, <span className="font-semibold text-blue-600 dark:text-blue-400">{user?.name}</span> 👋</p>
          </div>
          <ThemeToggle />
        </div>

        {/* Stats */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-white rounded-2xl border border-slate-200 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatsCard label="Total Laporan"  value={stats?.total || 0}       icon={<ClipboardList className="w-6 h-6" />} color="blue" />
            <StatsCard label="Baru"           value={stats?.new || 0}         icon={<Circle className="w-6 h-6" />} color="amber" />
            <StatsCard label="Diproses"       value={stats?.in_progress || 0} icon={<Clock className="w-6 h-6" />} color="blue" />
            <StatsCard label="Selesai"        value={stats?.resolved || 0}    icon={<CheckCircle className="w-6 h-6" />} color="green" />
          </div>
        )}

        {/* Stat per kategori */}
        {stats?.by_category && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            {stats.by_category.map(c => (
              <div key={c.code} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-lg mb-4">
                  {c.code === 'public' ? <Building2 className="w-5 h-5" /> : c.code === 'edu' ? <BookOpen className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
                </div>
                <p className="text-[13px] font-bold text-slate-500 dark:text-slate-400 mb-1">{c.name}</p>
                <div className="flex items-end gap-2">
                  <p className="text-[28px] font-extrabold text-slate-800 dark:text-white leading-none">{c.total}</p>
                  <p className="text-[12px] text-slate-400 dark:text-slate-500 mb-1">laporan masuk</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Laporan terbaru */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
          <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 sticky top-0 z-10 transition-colors">
            <h2 className="text-[16px] font-bold text-slate-800 dark:text-white">Laporan Terbaru</h2>
            <button
              onClick={() => router.push('/admin/laporan')}
              className="text-[13px] text-blue-600 dark:text-blue-400 font-bold hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 transition-colors"
            >
              Lihat semua <ArrowRight className="w-4 h-4 ml-0.5" />
            </button>
          </div>
          <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
            {recent.map(r => (
              <div
                key={r.id}
                className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                onClick={() => router.push(`/admin/laporan/${r.ticket_number}`)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[12px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">{r.ticket_number}</span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex-shrink-0 border ${STATUS_BADGE[r.status]}`}>
                      {STATUS_LABEL[r.status]}
                    </span>
                  </div>
                  <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors mb-0.5">{r.title}</p>
                  <p className="text-[12px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                    <User className="w-3.5 h-3.5" /> {r.reporter_name} 
                    <span className="mx-1 text-slate-300 dark:text-slate-600">•</span> 
                    <Calendar className="w-3.5 h-3.5" /> {new Date(r.created_at).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500 group-hover:border-blue-300 dark:group-hover:border-blue-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors shadow-sm">
                  <ArrowRight className="w-4 h-4 transform -rotate-45" />
                </div>
              </div>
            ))}
            {recent.length === 0 && (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                <Inbox className="w-10 h-10 mb-3" />
                <p className="text-[14px] font-medium">Belum ada laporan masuk.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}