"use client";
// src/app/admin/laporan/page.js
// Daftar semua laporan — admin & agent

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";

const STATUS_BADGE = {
  new: "bg-amber-100 text-amber-700",
  in_review: "bg-blue-100 text-blue-700",
  in_progress: "bg-blue-100 text-blue-700",
  resolved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  closed: "bg-gray-100 text-gray-600",
};
const STATUS_LABEL = {
  new: "Baru",
  in_review: "Ditinjau",
  in_progress: "Diproses",
  resolved: "Selesai",
  rejected: "Ditolak",
  closed: "Ditutup",
};
const PRIORITY_BADGE = {
  low: "bg-gray-100 text-gray-500",
  medium: "bg-blue-100 text-blue-600",
  high: "bg-orange-100 text-orange-600",
  critical: "bg-red-100 text-red-600",
};

export default function LaporanPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [laporan, setLaporan] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [page, setPage] = useState(0);
  const LIMIT = 15;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (!["admin", "agent"].includes(payload.role)) {
        router.push("/pengaduan");
        return;
      }
      setUser(payload);
    } catch {
      router.push("/login");
      return;
    }
  }, []);

  useEffect(() => {
    if (user) fetchLaporan();
  }, [user, filterStatus, filterCategory, page]);

  async function fetchLaporan() {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams({
        limit: LIMIT,
        offset: page * LIMIT,
      });
      if (filterStatus) params.set("status", filterStatus);
      if (filterCategory) params.set("category", filterCategory);
      const res = await fetch(`/api/pengaduan?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setLaporan(data.data);
        setTotal(data.total);
      }
    } catch {}
    setLoading(false);
  }

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      <AdminSidebar active="laporan" user={user} />

      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-[20px] font-bold text-slate-800">
              Semua Laporan
            </h1>
            <p className="text-[13px] text-slate-400">
              {total} laporan ditemukan
            </p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-3 mb-5 flex-wrap">
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setPage(0);
            }}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-[13px] text-slate-700 outline-none focus:border-blue-400"
          >
            <option value="">Semua Status</option>
            <option value="new">Baru</option>
            <option value="in_review">Ditinjau</option>
            <option value="in_progress">Diproses</option>
            <option value="resolved">Selesai</option>
            <option value="rejected">Ditolak</option>
            <option value="closed">Ditutup</option>
          </select>
          <select
            value={filterCategory}
            onChange={(e) => {
              setFilterCategory(e.target.value);
              setPage(0);
            }}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-[13px] text-slate-700 outline-none focus:border-blue-400"
          >
            <option value="">Semua Kategori</option>
            <option value="public">Public Facility</option>
            <option value="edu">EduReport</option>
            <option value="safe">Safe City</option>
          </select>
        </div>

        {/* Tabel */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {[
                    "Tiket",
                    "Judul",
                    "Pelapor",
                    "Kategori",
                    "Prioritas",
                    "Status",
                    "Tanggal",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading
                  ? [...Array(5)].map((_, i) => (
                      <tr key={i}>
                        {[...Array(7)].map((_, j) => (
                          <td key={j} className="px-4 py-3">
                            <div className="h-4 bg-slate-100 rounded animate-pulse" />
                          </td>
                        ))}
                      </tr>
                    ))
                  : laporan.map((r) => (
                      <tr
                        key={r.id}
                        className="hover:bg-slate-50 cursor-pointer transition-colors"
                        onClick={() =>
                          router.push(`/admin/laporan/${r.ticket_number}`)
                        }
                      >
                        <td className="px-4 py-3 text-[12px] font-mono font-semibold text-blue-600">
                          {r.ticket_number}
                        </td>
                        <td className="px-4 py-3 text-[13px] text-slate-700 max-w-[200px] truncate">
                          {r.title}
                        </td>
                        <td className="px-4 py-3 text-[12px] text-slate-500">
                          {r.reporter_name}
                        </td>
                        <td className="px-4 py-3 text-[12px] text-slate-500">
                          {r.category_name}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                              PRIORITY_BADGE[r.priority]
                            }`}
                          >
                            {r.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${
                              STATUS_BADGE[r.status]
                            }`}
                          >
                            {STATUS_LABEL[r.status]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[12px] text-slate-400">
                          {new Date(r.created_at).toLocaleDateString("id-ID")}
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {total > LIMIT && (
            <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
              <p className="text-[12px] text-slate-400">
                Menampilkan {page * LIMIT + 1}–
                {Math.min((page + 1) * LIMIT, total)} dari {total}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 0}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-[12px] font-semibold text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-default"
                >
                  ← Prev
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={(page + 1) * LIMIT >= total}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-[12px] font-semibold text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-default"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
