'use client';
// src/components/Sidebar.js
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Building2, BookOpen, Shield, PenLine, MessageSquare } from "lucide-react";

// Dynamic categories will be passed as props

const STATUS_MAP = {
  new:         { label: 'Baru',     cls: 'bg-amber-100 text-amber-700' },
  in_review:   { label: 'Ditinjau', cls: 'bg-blue-100 text-blue-700' },
  in_progress: { label: 'Diproses', cls: 'bg-blue-100 text-blue-700' },
  resolved:    { label: 'Selesai',  cls: 'bg-green-100 text-green-700' },
  rejected:    { label: 'Ditolak',  cls: 'bg-red-100 text-red-700' },
  closed:      { label: 'Ditutup',  cls: 'bg-gray-100 text-gray-600' },
};

export default function Sidebar({ currentTheme, onChangeTheme, recentReports, categories = [] }) {
  const pathname = usePathname();
  const isRiwayat = pathname?.startsWith('/riwayat');
  const isPengaduan = pathname?.startsWith('/pengaduan');

  return (
    <aside className="w-72 bg-white border-r border-slate-200 flex flex-col overflow-hidden flex-shrink-0">
      {/* Logo */}
      <div className="h-[60px] flex items-center gap-3 px-5 border-b border-slate-100">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white text-sm font-bold">
          K
        </div>
        <span className="font-bold text-slate-800 text-[15px]">
          Konekko<span className="text-blue-600"> Services</span>
        </span>
        <span className="ml-auto flex items-center gap-1.5 text-[11px] font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          Aktif
        </span>
      </div>

      {/* Nav Menu */}
      <div className="px-4 pt-4 pb-3 border-b border-slate-100">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">Menu</p>
        <div className="flex flex-col gap-1">
          <Link
            href="/pengaduan"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all text-left
              ${isPengaduan
                ? 'bg-blue-50 border-blue-500 border-[1.5px]'
                : 'border-slate-200 hover:bg-slate-50 hover:border-slate-300'
              }`}
          >
            <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <PenLine className="w-4 h-4" />
            </span>
            <span className="flex-1 min-w-0">
              <span className={`block text-[13px] font-semibold ${isPengaduan ? 'text-blue-600' : 'text-slate-700'}`}>
                Buat Laporan
              </span>
              <span className="block text-[11px] text-slate-400 truncate">Pengaduan baru</span>
            </span>
          </Link>

          <Link
            href="/riwayat"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all text-left
              ${isRiwayat
                ? 'bg-violet-50 border-violet-500 border-[1.5px]'
                : 'border-slate-200 hover:bg-slate-50 hover:border-slate-300'
              }`}
          >
            <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-violet-50 text-violet-600">
              <MessageSquare className="w-4 h-4" />
            </span>
            <span className="flex-1 min-w-0">
              <span className={`block text-[13px] font-semibold ${isRiwayat ? 'text-violet-600' : 'text-slate-700'}`}>
                Riwayat
              </span>
              <span className="block text-[11px] text-slate-400 truncate">Lanjutkan percakapan</span>
            </span>
          </Link>
        </div>
      </div>

      {/* Kategori — hanya di halaman pengaduan */}
      {isPengaduan && (
        <div className="p-4 border-b border-slate-100">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3">
            Kategori Pengaduan
          </p>
          {categories.map(cat => {
            let icon = <span className="text-sm leading-none">{cat.icon}</span>;
            if (cat.code === 'public') icon = <Building2 className="w-4 h-4" />;
            if (cat.code === 'edu') icon = <BookOpen className="w-4 h-4" />;
            if (cat.code === 'safe') icon = <Shield className="w-4 h-4" />;

            const isActive = currentTheme === cat.code;

            return (
              <button
                key={cat.code}
                onClick={() => onChangeTheme(cat.code)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all mb-1.5 text-left
                  ${isActive ? 'border-[1.5px]' : 'border-slate-200 hover:bg-slate-50 hover:border-slate-300'}`}
                style={isActive ? { borderColor: cat.color_hex, backgroundColor: `${cat.color_hex}11` } : {}}
              >
                <span 
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-base"
                  style={{ backgroundColor: `${cat.color_hex}1a`, color: cat.color_hex }}
                >
                  {icon}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-[13px] font-semibold" style={{ color: isActive ? cat.color_hex : undefined }}>
                    {cat.name}
                  </span>
                  <span className="block text-[11px] text-slate-400 truncate">{cat.description || cat.name}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Laporan terbaru — bisa diklik langsung ke riwayat chat */}
      <div className="flex-1 overflow-y-auto p-4">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3">
          Pengaduan Terbaru
        </p>
        {recentReports.length === 0 ? (
          <p className="text-[12px] text-slate-400 text-center py-6">Belum ada laporan.</p>
        ) : (
          recentReports.map(r => {
            const s = STATUS_MAP[r.status] || { label: r.status, cls: 'bg-gray-100 text-gray-600' };
            return (
              <Link
                key={r.id}
                href={`/riwayat/${r.ticket_number}`}
                className="block mb-2 p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-blue-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="text-[12px] font-semibold text-slate-700 flex-1 line-clamp-1">{r.title}</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${s.cls}`}>{s.label}</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  {r.ticket_number} · {new Date(r.created_at).toLocaleDateString('id-ID')}
                </div>
              </Link>
            );
          })
        )}
      </div>
    </aside>
  );
}
