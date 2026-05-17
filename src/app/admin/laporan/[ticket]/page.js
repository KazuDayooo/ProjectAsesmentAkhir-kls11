"use client";
// src/app/admin/laporan/[ticket]/page.js
// Detail tiket — admin & agent bisa balas chat, ubah status, kirim bantuan

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";

const STATUS_OPTIONS = [
  { value: "new", label: "🟡 Baru" },
  { value: "in_review", label: "🔵 Ditinjau" },
  { value: "in_progress", label: "🔵 Diproses" },
  { value: "resolved", label: "🟢 Selesai" },
  { value: "rejected", label: "🔴 Ditolak" },
  { value: "closed", label: "⚫ Ditutup" },
];

const PRIORITY_OPTIONS = [
  { value: "low", label: "Rendah" },
  { value: "medium", label: "Sedang" },
  { value: "high", label: "Tinggi" },
  { value: "critical", label: "Kritis" },
];

export default function DetailLaporanPage() {
  const router = useRouter();
  const params = useParams();
  const ticket = params.ticket;
  const endRef = useRef(null);

  const [user, setUser] = useState(null);
  const [data, setData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form balas pesan
  const [reply, setReply] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  // Form ubah status
  const [newStatus, setNewStatus] = useState("");
  const [newAssigned, setNewAssigned] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Modal kirim bantuan
  const [showBantuan, setShowBantuan] = useState(false);
  const [bantuan, setBantuan] = useState({
    personil: "",
    keterangan: "",
    estimasi: "",
  });
  const [sendingBantuan, setSendingBantuan] = useState(false);

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
    fetchDetail();
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function fetchDetail() {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/tickets/${ticket}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await res.json();
      if (d.success) {
        setData(d.data.complaint);
        setMessages(d.data.messages);
        setNewStatus(d.data.complaint.status);
        setNewAssigned(d.data.complaint.assigned_to || "");
      }
    } catch {}
    setLoading(false);
  }

  async function handleReply() {
    if (!reply.trim()) return;
    setSendingReply(true);
    try {
      const token = localStorage.getItem("token");
      await fetch(`/api/tickets/${ticket}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          senderType: "agent",
          senderName: user.name,
          message: reply,
        }),
      });
      setReply("");
      fetchDetail();
    } catch {}
    setSendingReply(false);
  }

  async function handleUpdateStatus() {
    setUpdatingStatus(true);
    try {
      const token = localStorage.getItem("token");
      await fetch(`/api/tickets/${ticket}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus,
          assignedTo: newAssigned,
          note: statusNote,
          changedBy: user.name,
        }),
      });
      setStatusNote("");
      fetchDetail();
    } catch {}
    setUpdatingStatus(false);
  }

  async function handleKirimBantuan() {
    if (!bantuan.personil || !bantuan.keterangan) return;
    setSendingBantuan(true);
    try {
      const token = localStorage.getItem("token");
      const msg =
        `🚨 BANTUAN DIKIRIM\n\n` +
        `👥 Personil: ${bantuan.personil} orang\n` +
        `📝 Keterangan: ${bantuan.keterangan}\n` +
        `⏱️ Estimasi tiba: ${bantuan.estimasi || "Belum ditentukan"}`;

      await fetch(`/api/tickets/${ticket}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          senderType: "agent",
          senderName: user.name,
          message: msg,
        }),
      });

      // Auto update status ke in_progress
      await fetch(`/api/tickets/${ticket}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: "in_progress",
          assignedTo: user.name,
          note: `Bantuan dikirim: ${bantuan.personil} personil`,
          changedBy: user.name,
        }),
      });

      setBantuan({ personil: "", keterangan: "", estimasi: "" });
      setShowBantuan(false);
      fetchDetail();
    } catch {}
    setSendingBantuan(false);
  }

  const SENDER_STYLE = {
    user: "bg-blue-600 text-white self-end rounded-br-sm",
    agent:
      "bg-white border border-slate-200 text-slate-800 self-start rounded-bl-sm",
    system:
      "bg-slate-100 text-slate-500 self-center text-center text-[11px] italic",
  };

  if (loading)
    return (
      <div className="flex h-screen bg-slate-100">
        <div className="w-64 bg-white border-r border-slate-200" />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-slate-400 text-[13px]">Memuat data...</p>
        </div>
      </div>
    );

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      <AdminSidebar active="laporan" user={user} />

      <main className="flex-1 flex overflow-hidden">
        {/* Chat area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-white border-b border-slate-200 px-5 py-3 flex items-center gap-3">
            <button
              onClick={() => router.push("/admin/laporan")}
              className="text-slate-400 hover:text-slate-600 text-sm"
            >
              ← Kembali
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-bold text-slate-800 truncate">
                {data?.title}
              </p>
              <p className="text-[11px] text-slate-400">
                {data?.ticket_number} · {data?.reporter_name} ·{" "}
                {data?.location_address}
              </p>
            </div>
            <button
              onClick={() => setShowBantuan(true)}
              className="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-[12px] font-semibold transition flex items-center gap-1.5 flex-shrink-0"
            >
              🚨 Kirim Bantuan
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto bg-slate-100 px-5 py-5 flex flex-col gap-3">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col gap-0.5 ${
                  m.sender_type === "user"
                    ? "items-end"
                    : m.sender_type === "system"
                    ? "items-center"
                    : "items-start"
                }`}
              >
                {m.sender_type !== "system" && (
                  <p className="text-[11px] text-slate-400 font-medium px-1">
                    {m.sender_name}
                  </p>
                )}
                <div
                  className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed whitespace-pre-line ${
                    SENDER_STYLE[m.sender_type]
                  }`}
                >
                  {m.message}
                </div>
                <p className="text-[10px] text-slate-400 px-1">
                  {new Date(m.created_at).toLocaleString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                    day: "2-digit",
                    month: "short",
                  })}
                </p>
              </div>
            ))}
            <div ref={endRef} />
          </div>

          {/* Reply input */}
          <div className="bg-white border-t border-slate-200 px-4 py-3">
            <div className="flex gap-2 items-end">
              <textarea
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] text-slate-800 outline-none focus:border-blue-400 resize-none max-h-28 leading-relaxed"
                placeholder="Tulis balasan..."
                rows={1}
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleReply();
                  }
                }}
              />
              <button
                onClick={handleReply}
                disabled={!reply.trim() || sendingReply}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold transition disabled:opacity-40 flex-shrink-0"
              >
                {sendingReply ? "..." : "Kirim"}
              </button>
            </div>
          </div>
        </div>

        {/* Panel kanan — info & ubah status */}
        <div className="w-72 bg-white border-l border-slate-200 flex flex-col overflow-y-auto flex-shrink-0">
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-[13px] font-bold text-slate-700 mb-4">
              Info Laporan
            </h3>
            <div className="space-y-2 text-[12px]">
              <div>
                <span className="text-slate-400">Tiket</span>
                <p className="font-semibold text-blue-600 font-mono">
                  {data?.ticket_number}
                </p>
              </div>
              <div>
                <span className="text-slate-400">Kategori</span>
                <p className="font-semibold text-slate-700">
                  {data?.category_name}
                </p>
              </div>
              <div>
                <span className="text-slate-400">Jenis Masalah</span>
                <p className="font-semibold text-slate-700">
                  {data?.issue_type}
                </p>
              </div>
              <div>
                <span className="text-slate-400">Pelapor</span>
                <p className="font-semibold text-slate-700">
                  {data?.reporter_name}
                </p>
              </div>
              <div>
                <span className="text-slate-400">Telepon</span>
                <p className="font-semibold text-slate-700">
                  {data?.reporter_phone}
                </p>
              </div>
              <div>
                <span className="text-slate-400">Lokasi</span>
                <p className="font-semibold text-slate-700">
                  {data?.location_address}
                </p>
              </div>
              <div>
                <span className="text-slate-400">Masuk</span>
                <p className="font-semibold text-slate-700">
                  {new Date(data?.created_at).toLocaleString("id-ID")}
                </p>
              </div>
            </div>
          </div>

          {/* Update status */}
          <div className="p-5">
            <h3 className="text-[13px] font-bold text-slate-700 mb-4">
              Update Status
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-[12px] text-slate-700 outline-none focus:border-blue-400"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Assign ke Petugas
                </label>
                <input
                  value={newAssigned}
                  onChange={(e) => setNewAssigned(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-[12px] text-slate-700 outline-none focus:border-blue-400"
                  placeholder="Nama petugas"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Catatan
                </label>
                <textarea
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-[12px] text-slate-700 outline-none focus:border-blue-400 resize-none"
                  rows={2}
                  placeholder="Catatan perubahan status..."
                />
              </div>
              <button
                onClick={handleUpdateStatus}
                disabled={updatingStatus}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-semibold transition disabled:opacity-50"
              >
                {updatingStatus ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Modal Kirim Bantuan */}
      {showBantuan && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[16px] font-bold text-slate-800">
                🚨 Kirim Bantuan
              </h2>
              <button
                onClick={() => setShowBantuan(false)}
                className="text-slate-400 hover:text-slate-600 text-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">
                  Jumlah Personil *
                </label>
                <input
                  type="number"
                  min="1"
                  value={bantuan.personil}
                  onChange={(e) =>
                    setBantuan((p) => ({ ...p, personil: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-[13px] text-slate-800 outline-none focus:border-blue-400"
                  placeholder="Contoh: 5"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">
                  Keterangan Bantuan *
                </label>
                <textarea
                  value={bantuan.keterangan}
                  onChange={(e) =>
                    setBantuan((p) => ({ ...p, keterangan: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-[13px] text-slate-800 outline-none focus:border-blue-400 resize-none"
                  rows={3}
                  placeholder="Contoh: Tim lapangan dengan alat berat akan menangani perbaikan jalan..."
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">
                  Estimasi Tiba (opsional)
                </label>
                <input
                  value={bantuan.estimasi}
                  onChange={(e) =>
                    setBantuan((p) => ({ ...p, estimasi: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-[13px] text-slate-800 outline-none focus:border-blue-400"
                  placeholder="Contoh: 30 menit, Besok pagi, dll"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowBantuan(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-[13px] font-semibold text-slate-500 hover:bg-slate-50 transition"
              >
                Batal
              </button>
              <button
                onClick={handleKirimBantuan}
                disabled={
                  sendingBantuan || !bantuan.personil || !bantuan.keterangan
                }
                className="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-[13px] font-semibold transition disabled:opacity-50"
              >
                {sendingBantuan ? "Mengirim..." : "🚨 Kirim Bantuan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
