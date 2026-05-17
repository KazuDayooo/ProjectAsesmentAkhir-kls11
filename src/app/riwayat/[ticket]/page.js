"use client";
// src/app/riwayat/[ticket]/page.js

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";

/* ─── Config ───────────────────────────────────────────────── */
// THEMES will be built dynamically

const STATUS_MAP = {
  new: {
    label: "Baru",
    cls: "bg-amber-100 text-amber-700",
    dot: "bg-amber-400",
    color: "#f59e0b",
  },
  in_review: {
    label: "Ditinjau",
    cls: "bg-blue-100 text-blue-700",
    dot: "bg-blue-400",
    color: "#3b82f6",
  },
  in_progress: {
    label: "Diproses",
    cls: "bg-violet-100 text-violet-700",
    dot: "bg-violet-400",
    color: "#6366f1",
  },
  resolved: {
    label: "Selesai",
    cls: "bg-green-100 text-green-700",
    dot: "bg-green-400",
    color: "#22c55e",
  },
  rejected: {
    label: "Ditolak",
    cls: "bg-red-100 text-red-700",
    dot: "bg-red-400",
    color: "#ef4444",
  },
  closed: {
    label: "Ditutup",
    cls: "bg-gray-100 text-gray-500",
    dot: "bg-gray-400",
    color: "#94a3b8",
  },
};

const PROGRESS_STEPS = [
  { key: "new", label: "Diterima" },
  { key: "in_review", label: "Ditinjau" },
  { key: "in_progress", label: "Diproses" },
  { key: "resolved", label: "Selesai" },
];

/* ─── Helpers ──────────────────────────────────────────────── */
const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("token") : null;
const authH = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

function fmt(d, opts) {
  return d ? new Date(d).toLocaleString("id-ID", opts) : "-";
}

function dbMsgToLocal(m) {
  return {
    id: `db-${m.id}`,
    type: m.sender_type === "user" ? "user" : "agent",
    text: m.sender_type === "user" ? m.message : undefined,
    html:
      m.sender_type !== "user"
        ? m.sender_type === "system"
          ? `<em class="text-slate-400 text-[11px]">${m.message}</em>`
          : m.message
        : undefined,
    time: new Date(m.created_at).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    senderName: m.sender_name,
  };
}

/* ─── Progress Tab ─────────────────────────────────────────── */
function ProgressTab({ status, logs }) {
  const currentIdx = PROGRESS_STEPS.findIndex((s) => s.key === status);
  const fmtFull = (d) =>
    fmt(d, {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (status === "rejected")
    return (
      <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center text-[18px]">
          🔴
        </div>
        <div>
          <p className="text-[13px] font-bold text-red-800">Laporan Ditolak</p>
          <p className="text-[11px] text-red-500 mt-0.5">
            Laporan ini tidak dapat diproses lebih lanjut.
          </p>
        </div>
      </div>
    );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Timeline */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200">
        <h3 className="text-[13px] font-bold text-slate-800 mb-5">
          🗺️ Alur Penanganan
        </h3>
        {PROGRESS_STEPS.map((step, idx) => {
          const isDone = idx <= currentIdx || status === "closed";
          const isCurrent = idx === currentIdx && status !== "closed";
          const log = logs?.find((l) => l.new_status === step.key);
          return (
            <div key={step.key} className="flex items-start gap-4">
              <div
                className="flex flex-col items-center flex-shrink-0"
                style={{ width: 28 }}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold z-10"
                  style={{
                    background: isCurrent
                      ? "linear-gradient(135deg,#2563eb,#1d4ed8)"
                      : isDone
                      ? "#e2e8f0"
                      : "#f1f5f9",
                    color: isCurrent ? "#fff" : isDone ? "#64748b" : "#cbd5e1",
                    border: `2px solid ${isCurrent ? "#3b82f6" : "#e2e8f0"}`,
                    boxShadow: isCurrent ? "0 0 0 3px #bfdbfe" : "none",
                  }}
                >
                  {isDone && !isCurrent ? "✓" : idx + 1}
                </div>
                {idx < PROGRESS_STEPS.length - 1 && (
                  <div
                    className="w-0.5 my-1"
                    style={{
                      background:
                        isDone && idx < currentIdx ? "#bfdbfe" : "#e2e8f0",
                      minHeight: 24,
                    }}
                  />
                )}
              </div>
              <div className="flex-1 pb-5">
                <div className="flex items-center gap-2 mb-0.5">
                  <p
                    className="text-[13px] font-bold"
                    style={{ color: isDone ? "#0f172a" : "#94a3b8" }}
                  >
                    {step.label}
                  </p>
                  {isCurrent && (
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
                      SEKARANG
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">
                  {log
                    ? fmtFull(log.created_at)
                    : isDone
                    ? "Selesai"
                    : "Menunggu"}
                  {log?.changed_by && log.changed_by !== "System" && (
                    <span className="ml-1">
                      · oleh <strong>{log.changed_by}</strong>
                    </span>
                  )}
                  {log?.note && (
                    <span className="block mt-0.5 italic text-slate-400">
                      "{log.note}"
                    </span>
                  )}
                </p>
              </div>
            </div>
          );
        })}
        {status === "closed" && (
          <div className="flex items-center gap-3 mt-1 p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span>⚫</span>
            <p className="text-[12px] font-semibold text-slate-500">
              Laporan telah ditutup.
            </p>
          </div>
        )}
      </div>

      {/* Log */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200">
        <h3 className="text-[13px] font-bold text-slate-800 mb-4">
          📜 Riwayat Perubahan
        </h3>
        {!logs?.length ? (
          <p className="text-[12px] text-center py-8 text-slate-400">
            Belum ada perubahan status.
          </p>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {logs.map((l, i) => {
              const ns = STATUS_MAP[l.new_status];
              return (
                <div
                  key={i}
                  className="flex items-start gap-3 pb-3"
                  style={{
                    borderBottom:
                      i < logs.length - 1 ? "1px solid #f1f5f9" : "none",
                  }}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                      ns?.dot || "bg-slate-400"
                    }`}
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span
                        className="text-[11px] font-bold"
                        style={{ color: ns?.color || "#64748b" }}
                      >
                        {ns?.label || l.new_status}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        oleh {l.changed_by}
                      </span>
                    </div>
                    {l.note && (
                      <p className="text-[11px] italic text-slate-500 mb-0.5">
                        "{l.note}"
                      </p>
                    )}
                    <p className="text-[10px] text-slate-300">
                      {fmtFull(l.created_at)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {status === "resolved" && (
        <div className="sm:col-span-2 flex items-center gap-4 p-5 rounded-2xl bg-green-50 border border-green-200">
          <span className="text-3xl">🎉</span>
          <div>
            <p className="text-[14px] font-bold text-green-800 mb-0.5">
              Laporan Berhasil Diselesaikan!
            </p>
            <p className="text-[12px] text-green-600">
              Masalah yang Anda laporkan telah berhasil ditangani. Terima kasih
              atas kontribusi Anda untuk kota yang lebih baik.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Info Tab ─────────────────────────────────────────────── */
function InfoTab({ c, s, themeObj }) {
  const fmtFull = (d) =>
    fmt(d, {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  const Row = ({ label, value }) =>
    value ? (
      <div
        className="flex items-start justify-between gap-4 py-2"
        style={{ borderBottom: "1px solid #f8fafc" }}
      >
        <span className="text-[11px] font-semibold text-slate-400 flex-shrink-0">
          {label}
        </span>
        <span className="text-[12px] font-semibold text-slate-700 text-right">
          {value}
        </span>
      </div>
    ) : null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="bg-white rounded-2xl p-5 border border-slate-200">
        <h3 className="text-[13px] font-bold text-slate-800 mb-3">
          📋 Informasi Laporan
        </h3>
        <Row label="No. Tiket" value={c.ticket_number} />
        <Row label="Jenis Masalah" value={c.issue_type} />
        <Row label="Kategori" value={c.category_name} />
        <Row label="Prioritas" value={c.priority?.toUpperCase()} />
        <Row label="Status" value={s.label} />
        <Row label="Petugas" value={c.assigned_to || "Belum ditugaskan"} />
      </div>
      <div className="bg-white rounded-2xl p-5 border border-slate-200">
        <h3 className="text-[13px] font-bold text-slate-800 mb-3">
          📍 Lokasi & Deskripsi
        </h3>
        {[
          { label: "Lokasi", value: c.location_address },
          { label: "Deskripsi", value: c.description },
        ].map((f) => (
          <div
            key={f.label}
            className="mb-3 p-3 rounded-xl bg-slate-50 border border-slate-100"
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              {f.label}
            </p>
            <p className="text-[12px] text-slate-700">{f.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl p-5 border border-slate-200">
        <h3 className="text-[13px] font-bold text-slate-800 mb-3">
          👤 Data Pelapor
        </h3>
        <Row label="Nama" value={c.reporter_name} />
        <Row label="Telepon" value={c.reporter_phone} />
        <Row label="Email" value={c.reporter_email} />
      </div>
      <div className="bg-white rounded-2xl p-5 border border-slate-200">
        <h3 className="text-[13px] font-bold text-slate-800 mb-3">🕐 Waktu</h3>
        <Row label="Dibuat" value={fmtFull(c.created_at)} />
        <Row label="Diperbarui" value={fmtFull(c.updated_at)} />
        <Row
          label="Diselesaikan"
          value={c.resolved_at ? fmtFull(c.resolved_at) : null}
        />
        {c.resolved_at && (
          <div className="pt-2 mt-1 border-t border-slate-100">
            <p className="text-[11px] text-slate-400">Durasi Penanganan</p>
            <p className="text-[13px] font-bold text-slate-800 mt-0.5">
              {c.hours_open} jam
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Main Page ────────────────────────────────────────────── */
export default function RiwayatChatPage() {
  const { ticket } = useParams();
  const router = useRouter();
  const endRef = useRef(null);
  const pollingRef = useRef(null);

  const [complaint, setComplaint] = useState(null);
  const [messages, setMessages] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [pollingActive, setPollingActive] = useState(false);
  const [user, setUser] = useState(null);
  const [recentReports, setRecentReports] = useState([]);
  const [activeTab, setActiveTab] = useState("chat");
  const [themesMap, setThemesMap] = useState({});

  useEffect(() => {
    fetch("/api/categories")
      .then(res => res.json())
      .then(d => {
        if (d.success && d.data.length > 0) {
          const newThemesMap = {};
          d.data.forEach(c => {
            newThemesMap[c.code] = {
              agent: `Tim ${c.name}`,
              avatar: c.name.substring(0, 2).toUpperCase(),
              color: c.color_hex,
              gradient: `linear-gradient(135deg, ${c.color_hex}, #00000088)`,
            };
          });
          setThemesMap(newThemesMap);
        }
      });
  }, []);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    try {
      setUser(JSON.parse(atob(token.split(".")[1])));
    } catch {
      localStorage.removeItem("token");
    }
  }, []);

  useEffect(() => {
    if (ticket) {
      loadTicket();
      fetchRecentReports();
    }
    return () => stopPolling();
  }, [ticket]);

  useEffect(() => {
    if (activeTab === "chat")
      endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, activeTab]);

  async function fetchRecentReports() {
    try {
      const res = await fetch("/api/pengaduan?limit=5", { headers: authH() });
      const data = await res.json();
      if (data.success) setRecentReports(data.data);
    } catch {}
  }

  async function loadTicket() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/tickets/${ticket}`, { headers: authH() });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Tiket tidak ditemukan.");
        return;
      }
      setComplaint(data.data.complaint);
      setMessages((data.data.messages || []).map(dbMsgToLocal));
      setLogs(data.data.logs || []);
      startPolling(ticket);
    } catch {
      setError("Gagal memuat data. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  function startPolling(ticketNum) {
    stopPolling();
    setPollingActive(true);
    pollingRef.current = setInterval(() => syncMessages(ticketNum), 5000);
  }
  function stopPolling() {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    setPollingActive(false);
  }

  async function syncMessages(ticketNum) {
    try {
      const res = await fetch(`/api/tickets/${ticketNum}`, {
        headers: authH(),
      });
      const data = await res.json();
      if (!data.success) return;
      const converted = (data.data.messages || []).map(dbMsgToLocal);
      setMessages((prev) => {
        const ids = new Set(prev.map((m) => m.id));
        const newMsgs = converted.filter((m) => !ids.has(m.id));
        return newMsgs.length ? [...prev, ...newMsgs] : prev;
      });
    } catch {}
  }

  async function handleSend() {
    if (!input.trim() || sending) return;
    const text = input.trim();
    setInput("");
    setSending(true);
    try {
      await fetch(`/api/tickets/${ticket}`, {
        method: "POST",
        headers: authH(),
        body: JSON.stringify({
          senderType: "user",
          senderName: user?.name || "Pengguna",
          message: text,
        }),
      });
      await syncMessages(ticket);
    } catch {}
    setSending(false);
  }

  const categoryCode = complaint?.category_code || "public";
  const themeObj = themesMap[categoryCode] || {
    agent: "Tim Dukungan",
    avatar: "CS",
    color: "#1d4ed8",
    gradient: "linear-gradient(135deg,#2563eb,#1d4ed8)"
  };
  const statusObj = STATUS_MAP[complaint?.status] || STATUS_MAP.new;
  const isClosed = ["resolved", "rejected", "closed"].includes(
    complaint?.status
  );

  const TABS = [
    { key: "chat", label: "💬 Chat", count: messages.length },
    { key: "progress", label: "📊 Progress" },
    { key: "info", label: "📋 Detail" },
  ];

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-slate-100 gap-3">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-[13px] text-slate-400">Memuat percakapan...</span>
      </div>
    );

  if (error)
    return (
      <div className="flex h-screen items-center justify-center bg-slate-100">
        <div className="text-center">
          <p className="text-4xl mb-3">😕</p>
          <p className="text-[14px] font-semibold text-slate-700 mb-2">
            {error}
          </p>
          <button
            onClick={() => router.back()}
            className="text-[12px] text-blue-600 hover:underline"
          >
            ← Kembali
          </button>
        </div>
      </div>
    );

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .rw-root * { font-family: 'Plus Jakarta Sans', sans-serif; box-sizing: border-box; }
        .rw-sidebar { background: #0f172a; }
        .rw-chat-bg { background: #f8fafc; background-image: radial-gradient(#e2e8f0 1px, transparent 0); background-size: 24px 24px; }
        .rw-bubble-agent { background:#fff; border:1px solid #e2e8f0; box-shadow:0 1px 4px rgba(0,0,0,0.05); }
        .rw-topbar { background:rgba(255,255,255,0.95); backdrop-filter:blur(10px); border-bottom:1px solid #e2e8f0; }
        @keyframes rw-slide { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        .rw-msg { animation: rw-slide 0.18s ease forwards; }
        @keyframes rw-bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-4px)} }
        .rw-dot { animation: rw-bounce 1.1s infinite; }
        .rw-dot:nth-child(2){animation-delay:.15s} .rw-dot:nth-child(3){animation-delay:.3s}
        @keyframes rw-pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .rw-online { display:inline-block; width:6px; height:6px; border-radius:50%; background:#22c55e; margin-right:5px; animation:rw-pulse 2s infinite; }
        .rw-scr::-webkit-scrollbar{width:3px} .rw-scr::-webkit-scrollbar-thumb{background:#e2e8f0;border-radius:4px}
        .rw-report-item:hover { background:rgba(255,255,255,0.06); }
        .rw-theme-btn:hover { background:rgba(255,255,255,0.05); }
      `}} />

      <div
        className="rw-root flex h-screen overflow-hidden"
        style={{ background: "#f1f5f9" }}
      >
        {/* ── SIDEBAR (sama persis dengan pengaduan) ─────────────────── */}
        <aside className="rw-sidebar w-64 flex flex-col overflow-hidden flex-shrink-0">
          {/* Brand */}
          <div
            className="px-5 pt-5 pb-4"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-[13px] text-white flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg,#3b82f6,#7c3aed)",
                }}
              >
                K
              </div>
              <div>
                <p className="text-white font-bold text-[13px] leading-tight">
                  Konekko Services
                </p>
                <p
                  className="text-[9px] font-medium mt-0.5"
                  style={{ color: "rgba(255,255,255,0.3)" }}
                >
                  Portal Pengaduan Masyarakat
                </p>
              </div>
            </div>
          </div>

          {/* Nav links */}
          <div
            className="px-4 py-4"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
          >
            <p
              className="text-[9px] font-bold uppercase tracking-widest mb-3"
              style={{ color: "rgba(255,255,255,0.25)" }}
            >
              Navigasi
            </p>
            {[
              {
                href: "/pengaduan",
                icon: "💬",
                label: "Buat Laporan",
                sub: "Pengaduan baru",
              },
              {
                href: "/Riwayat",
                icon: "📋",
                label: "Riwayat Laporan",
                sub: "Semua tiket saya",
              },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rw-theme-btn flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-all"
                style={{ border: "1px solid transparent" }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[15px] flex-shrink-0"
                  style={{ background: "rgba(255,255,255,0.05)" }}
                >
                  {item.icon}
                </div>
                <div className="min-w-0">
                  <p
                    className="text-[12px] font-semibold"
                    style={{ color: "rgba(255,255,255,0.6)" }}
                  >
                    {item.label}
                  </p>
                  <p
                    className="text-[9px]"
                    style={{ color: "rgba(255,255,255,0.25)" }}
                  >
                    {item.sub}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* Recent reports */}
          <div className="flex-1 overflow-y-auto rw-scr px-4 py-4">
            <p
              className="text-[9px] font-bold uppercase tracking-widest mb-3"
              style={{ color: "rgba(255,255,255,0.25)" }}
            >
              Laporan Terbaru
            </p>
            {recentReports.length === 0 ? (
              <p
                className="text-[11px] text-center py-6"
                style={{ color: "rgba(255,255,255,0.18)" }}
              >
                Belum ada laporan
              </p>
            ) : (
              recentReports.map((r) => {
                const s = STATUS_MAP[r.status] || STATUS_MAP.new;
                return (
                  <Link
                    key={r.id}
                    href={`/riwayat/${r.ticket_number}`}
                    className="rw-report-item block mb-2 p-3 rounded-xl transition-all"
                    style={{
                      border: "1px solid rgba(255,255,255,0.05)",
                      background:
                        r.ticket_number === ticket
                          ? "rgba(255,255,255,0.08)"
                          : "transparent",
                    }}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p
                        className="text-[11px] font-semibold line-clamp-1 flex-1"
                        style={{ color: "rgba(255,255,255,0.75)" }}
                      >
                        {r.title}
                      </p>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md flex-shrink-0 ${s.cls}`}
                      >
                        {s.label}
                      </span>
                    </div>
                    <p
                      className="text-[9px] font-mono"
                      style={{ color: "rgba(255,255,255,0.22)" }}
                    >
                      {r.ticket_number}
                    </p>
                  </Link>
                );
              })
            )}
          </div>

          {/* User footer */}
          {user && (
            <div
              className="px-4 py-3.5"
              style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
                  style={{
                    background: "linear-gradient(135deg,#6366f1,#7c3aed)",
                  }}
                >
                  {user.name?.[0]?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p
                    className="text-[11px] font-semibold truncate"
                    style={{ color: "rgba(255,255,255,0.75)" }}
                  >
                    {user.name}
                  </p>
                  <p
                    className="text-[9px]"
                    style={{ color: "rgba(255,255,255,0.25)" }}
                  >
                    Akun terverifikasi
                  </p>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* ── MAIN AREA ──────────────────────────────────────────────── */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Top bar */}
          <div className="rw-topbar h-11 px-5 flex items-center justify-between flex-shrink-0 z-10">
            <div className="flex items-center gap-2 text-[11px]">
              <span className="text-slate-400">Riwayat</span>
              <span className="text-slate-300">/</span>
              <span className="font-mono font-bold text-blue-600">
                {ticket}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {pollingActive && (
                <span className="flex items-center gap-1 text-[10px] text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  Live
                </span>
              )}
              <button
                onClick={() => router.push("/")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors"
                style={{
                  background: "#f1f5f9",
                  color: "#475569",
                  border: "1px solid #e2e8f0",
                }}
              >
                ← Riwayat
              </button>
              <Link
                href="/pengaduan"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white"
                style={{
                  background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
                }}
              >
                ✏️ Laporan Baru
              </Link>
            </div>
          </div>

          {/* Agent header */}
          <div
            className="bg-white px-5 py-3 flex items-center gap-3 flex-shrink-0"
            style={{ borderBottom: "1px solid #f1f5f9" }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-[11px] font-black flex-shrink-0"
              style={{ background: themeObj.gradient }}
            >
              {themeObj.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-slate-900">
                {themeObj.agent}
              </p>
              <p
                className="text-[10px] flex items-center"
                style={{ color: "#16a34a" }}
              >
                <span className="rw-online" />
                {complaint?.issue_type} · {complaint?.location_address}
              </p>
            </div>
            <span
              className={`flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1 rounded-full flex-shrink-0 ${statusObj.cls}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${statusObj.dot}`} />
              {statusObj.label}
            </span>
          </div>

          {/* Tabs */}
          <div
            className="bg-white flex flex-shrink-0"
            style={{ borderBottom: "1px solid #e2e8f0" }}
          >
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="flex items-center gap-1.5 px-5 py-3 text-[12px] font-semibold border-b-2 transition-all"
                style={{
                  borderColor:
                    activeTab === tab.key ? themeObj.color : "transparent",
                  color: activeTab === tab.key ? themeObj.color : "#94a3b8",
                }}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center"
                    style={{
                      background:
                        activeTab === tab.key
                          ? themeObj.color + "15"
                          : "#f1f5f9",
                      color: activeTab === tab.key ? themeObj.color : "#94a3b8",
                    }}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* TAB: CHAT */}
          {activeTab === "chat" && (
            <>
              <div className="rw-chat-bg rw-scr flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`rw-msg flex flex-col gap-0.5 ${
                      msg.type === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    {msg.type === "agent" && (
                      <div className="flex items-center gap-1.5 mb-0.5 pl-0.5">
                        <div
                          className="w-4 h-4 rounded-md flex items-center justify-center text-white text-[7px] font-black"
                          style={{ background: themeObj.gradient }}
                        >
                          {themeObj.avatar[0]}
                        </div>
                        <span className="text-[10px] font-semibold text-slate-400">
                          {msg.senderName || themeObj.agent}
                        </span>
                      </div>
                    )}
                    <div
                      className={`max-w-[72%] px-4 py-2.5 text-[13px] leading-relaxed rounded-2xl
                        ${
                          msg.type === "user"
                            ? "text-white rounded-br-sm"
                            : "rw-bubble-agent text-slate-800 rounded-bl-sm"
                        }`}
                      style={
                        msg.type === "user"
                          ? { background: themeObj.gradient }
                          : {}
                      }
                      dangerouslySetInnerHTML={
                        msg.html ? { __html: msg.html } : undefined
                      }
                    >
                      {msg.text || undefined}
                    </div>
                    <span className="text-[9px] text-slate-300 px-1">
                      {msg.time}
                    </span>
                  </div>
                ))}

                {isTyping && (
                  <div className="rw-msg flex flex-col items-start gap-1">
                    <div className="rw-bubble-agent px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1.5">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="rw-dot w-1.5 h-1.5 rounded-full bg-slate-300"
                        />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={endRef} />
              </div>

              {/* Input */}
              {isClosed ? (
                <div className="bg-white border-t border-slate-200 px-5 py-4 flex-shrink-0">
                  <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3">
                    <span className="text-slate-400 text-lg">🔒</span>
                    <div>
                      <p className="text-[12px] font-semibold text-slate-600">
                        Percakapan ini telah {statusObj.label.toLowerCase()}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Tidak dapat mengirim pesan baru.{" "}
                        <Link
                          href="/pengaduan"
                          className="text-blue-600 hover:underline"
                        >
                          Buat laporan baru?
                        </Link>
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white border-t border-slate-200 px-4 pb-4 pt-2 flex-shrink-0">
                  <div className="flex items-end gap-2 bg-slate-50 border-[1.5px] border-slate-200 rounded-2xl px-4 py-2.5 focus-within:border-blue-400 transition-colors">
                    <textarea
                      className="flex-1 bg-transparent resize-none outline-none text-[13px] text-slate-800 placeholder:text-slate-400 max-h-28 leading-relaxed"
                      placeholder="Kirim pesan lanjutan ke tim..."
                      rows={1}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                    />
                    <button
                      onClick={handleSend}
                      disabled={!input.trim() || sending}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-40 flex-shrink-0"
                      style={{ background: themeObj.gradient }}
                    >
                      {sending ? (
                        <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      ) : (
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 px-1">
                    Enter untuk kirim · Shift+Enter baris baru
                  </p>
                </div>
              )}
            </>
          )}

          {/* TAB: PROGRESS */}
          {activeTab === "progress" && (
            <div className="flex-1 overflow-y-auto rw-scr p-5">
              <ProgressTab status={complaint?.status} logs={logs} />
            </div>
          )}

          {/* TAB: INFO */}
          {activeTab === "info" && (
            <div className="flex-1 overflow-y-auto rw-scr p-5">
              <InfoTab c={complaint} s={statusObj} themeObj={themeObj} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
