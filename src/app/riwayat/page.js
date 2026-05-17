"use client";
// src/app/riwayat/[ticket]/page.js

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

/* ─── Config ───────────────────────────────────────────────── */
const STATUS_MAP = {
  new: {
    label: "Baru",
    color: "#f59e0b",
    bg: "#fffbeb",
    border: "#fde68a",
    dot: "#f59e0b",
  },
  in_review: {
    label: "Ditinjau",
    color: "#3b82f6",
    bg: "#eff6ff",
    border: "#bfdbfe",
    dot: "#3b82f6",
  },
  in_progress: {
    label: "Diproses",
    color: "#6366f1",
    bg: "#eef2ff",
    border: "#c7d2fe",
    dot: "#6366f1",
  },
  resolved: {
    label: "Selesai",
    color: "#16a34a",
    bg: "#f0fdf4",
    border: "#bbf7d0",
    dot: "#22c55e",
  },
  rejected: {
    label: "Ditolak",
    color: "#dc2626",
    bg: "#fef2f2",
    border: "#fecaca",
    dot: "#ef4444",
  },
  closed: {
    label: "Ditutup",
    color: "#64748b",
    bg: "#f8fafc",
    border: "#e2e8f0",
    dot: "#94a3b8",
  },
};

const CAT_MAP = {
  public: {
    label: "Public Facility",
    icon: "🏛️",
    color: "#2563eb",
    bg: "#eff6ff",
    grad: "linear-gradient(135deg,#2563eb,#1d4ed8)",
  },
  edu: {
    label: "EduReport",
    icon: "📚",
    color: "#b45309",
    bg: "#fffbeb",
    grad: "linear-gradient(135deg,#d97706,#92400e)",
  },
  safe: {
    label: "Safe City",
    icon: "🛡️",
    color: "#15803d",
    bg: "#f0fdf4",
    grad: "linear-gradient(135deg,#16a34a,#14532d)",
  },
};

const PROGRESS_STEPS = [
  { key: "new", label: "Diterima" },
  { key: "in_review", label: "Ditinjau" },
  { key: "in_progress", label: "Diproses" },
  { key: "resolved", label: "Selesai" },
];

/* ─── Helpers ──────────────────────────────────────────────── */
const getToken = () => localStorage.getItem("token");
const authH = () => ({ Authorization: `Bearer ${getToken()}` });

function timeAgo(d) {
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60) return "Baru saja";
  if (s < 3600) return `${Math.floor(s / 60)} mnt lalu`;
  if (s < 86400) return `${Math.floor(s / 3600)} jam lalu`;
  if (s < 2592000) return `${Math.floor(s / 86400)} hari lalu`;
  return new Date(d).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function fmt(d, opts) {
  return d ? new Date(d).toLocaleString("id-ID", opts) : "-";
}

/* ─── Sub-components ───────────────────────────────────────── */
function InfoRow({ label, value, mono, color }) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between gap-4">
      <span
        className="text-[11px] font-semibold flex-shrink-0"
        style={{ color: "#94a3b8" }}
      >
        {label}
      </span>
      <span
        className={`text-[12px] font-bold text-right ${
          mono ? "font-mono" : ""
        }`}
        style={{ color: color || "#1e293b" }}
      >
        {value}
      </span>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div
      className="bg-white rounded-2xl p-5"
      style={{ border: "1px solid #e2e8f0" }}
    >
      <h3 className="text-[13px] font-bold text-slate-900 mb-4">{title}</h3>
      {children}
    </div>
  );
}

function ProgressTimeline({ status, logs }) {
  if (status === "rejected")
    return (
      <div
        className="flex items-center gap-3 p-4 rounded-2xl"
        style={{ background: "#fef2f2", border: "1px solid #fecaca" }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-[18px]"
          style={{ background: "#fee2e2" }}
        >
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

  const currentIdx = PROGRESS_STEPS.findIndex((s) => s.key === status);

  return (
    <div>
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
                    ? "linear-gradient(135deg,#3b82f6,#6366f1)"
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
                      isDone && idx < currentIdx ? "#c7d2fe" : "#e2e8f0",
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
                  <span
                    className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                    style={{
                      background: "#eff6ff",
                      color: "#2563eb",
                      border: "1px solid #bfdbfe",
                    }}
                  >
                    SEKARANG
                  </span>
                )}
              </div>
              <p
                className="text-[11px]"
                style={{ color: isDone ? "#64748b" : "#cbd5e1" }}
              >
                {log
                  ? fmt(log.created_at, {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : isDone
                  ? "Selesai"
                  : "Menunggu"}
                {log?.changed_by && log.changed_by !== "System" && (
                  <span className="ml-1">
                    · oleh <strong>{log.changed_by}</strong>
                  </span>
                )}
                {log?.note && (
                  <span
                    className="block mt-0.5 italic"
                    style={{ color: "#94a3b8" }}
                  >
                    "{log.note}"
                  </span>
                )}
              </p>
            </div>
          </div>
        );
      })}
      {status === "closed" && (
        <div
          className="flex items-center gap-3 mt-2 p-3 rounded-xl"
          style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}
        >
          <span className="text-[18px]">⚫</span>
          <p className="text-[12px] font-semibold text-slate-500">
            Laporan telah ditutup.
          </p>
        </div>
      )}
    </div>
  );
}

/* ─── Main page ────────────────────────────────────────────── */
export default function TicketDetailPage() {
  const { ticket } = useParams();
  const router = useRouter();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newMsg, setNewMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const msgEndRef = useRef(null);

  useEffect(() => {
    load();
  }, [ticket]);
  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data?.messages]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/tickets/${ticket}`, { headers: authH() });
      const json = await res.json();
      if (json.success) setData(json.data);
      else setError("Tiket tidak ditemukan.");
    } catch {
      setError("Gagal terhubung ke server.");
    }
    setLoading(false);
  }

  async function sendMsg() {
    if (!newMsg.trim() || sending) return;
    setSending(true);
    try {
      await fetch(`/api/tickets/${ticket}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authH() },
        body: JSON.stringify({
          senderType: "user",
          senderName: "Pengguna",
          message: newMsg.trim(),
        }),
      });
      setNewMsg("");
      await load();
    } catch {}
    setSending(false);
  }

  /* ── Loading / Error states ── */
  if (loading || error || !data)
    return (
      <>
        <style>{`* { font-family: 'Plus Jakarta Sans', sans-serif; }`}</style>
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ background: "#f8fafc" }}
        >
          {loading ? (
            <div className="flex flex-col items-center gap-3">
              <div
                className="w-10 h-10 rounded-full border-[3px] border-t-transparent animate-spin"
                style={{ borderColor: "#e2e8f0", borderTopColor: "#3b82f6" }}
              />
              <p
                className="text-[13px] font-medium"
                style={{ color: "#94a3b8" }}
              >
                Memuat detail tiket...
              </p>
            </div>
          ) : (
            <div className="text-center">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4"
                style={{ background: "#fef2f2" }}
              >
                🔍
              </div>
              <p className="text-[16px] font-bold text-slate-800 mb-1">
                Tiket tidak ditemukan
              </p>
              <p className="text-[13px] mb-5" style={{ color: "#94a3b8" }}>
                {error}
              </p>
              <Link
                href="/riwayat"
                className="px-5 py-2.5 rounded-xl text-[13px] font-bold text-white"
                style={{
                  background: "linear-gradient(135deg,#3b82f6,#6366f1)",
                }}
              >
                ← Kembali
              </Link>
            </div>
          )}
        </div>
      </>
    );

  const { complaint: c, messages, logs } = data;
  const s = STATUS_MAP[c.status] || STATUS_MAP.new;
  const cat = CAT_MAP[c.category_code] || {
    label: c.category_name,
    icon: "📋",
    color: "#64748b",
    bg: "#f8fafc",
    grad: "#64748b",
  };

  const TABS = [
    { key: "chat", label: "💬 Chat", count: messages?.length },
    { key: "progress", label: "📊 Progress" },
    { key: "info", label: "📋 Detail" },
  ];

  const fmtFull = (d) =>
    fmt(d, {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap');
        * { font-family: 'Plus Jakarta Sans', sans-serif; box-sizing: border-box; }
        .mono { font-family: 'JetBrains Mono', monospace !important; }
        .scr::-webkit-scrollbar { width: 3px; }
        .scr::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }
        @keyframes up { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        .msg { animation: up 0.18s ease forwards; }
        @keyframes pulse2 { 0%,100%{opacity:1} 50%{opacity:0.35} }
        .live { animation: pulse2 2s infinite; }
      `}</style>

      <div
        className="min-h-screen flex flex-col"
        style={{ background: "#f1f5f9" }}
      >
        {/* NAV */}
        <nav
          className="flex-shrink-0"
          style={{
            background: "#0f172a",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div className="max-w-4xl mx-auto px-5 h-14 flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all"
              style={{
                color: "rgba(255,255,255,0.5)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span className="text-[11px] font-semibold">Kembali</span>
            </button>

            <div
              className="flex items-center gap-1.5 text-[11px] flex-1"
              style={{ color: "rgba(255,255,255,0.3)" }}
            >
              <Link href="/">Beranda</Link>
              <span style={{ color: "rgba(255,255,255,0.15)" }}>/</span>
              <Link href="/riwayat">Riwayat</Link>
              <span style={{ color: "rgba(255,255,255,0.15)" }}>/</span>
              <span className="mono font-bold" style={{ color: s.color }}>
                {ticket}
              </span>
            </div>

            <Link
              href="/pengaduan"
              className="px-3.5 py-2 rounded-xl text-[11px] font-bold text-white flex-shrink-0"
              style={{ background: "linear-gradient(135deg,#3b82f6,#6366f1)" }}
            >
              ✏️ Laporan Baru
            </Link>
          </div>
        </nav>

        {/* HERO */}
        <div
          className="flex-shrink-0"
          style={{
            background: "#0f172a",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <div className="max-w-4xl mx-auto px-5 py-6">
            <div className="flex items-start gap-4">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 mt-0.5"
                style={{ background: cat.bg }}
              >
                {cat.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 mb-2 flex-wrap">
                  <span
                    className="mono text-[13px] font-bold"
                    style={{ color: s.color }}
                  >
                    {c.ticket_number}
                  </span>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: cat.bg, color: cat.color }}
                  >
                    {cat.label}
                  </span>
                  <span
                    className="text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5"
                    style={{
                      background: s.bg,
                      color: s.color,
                      border: `1px solid ${s.border}`,
                    }}
                  >
                    <span
                      className="live w-1.5 h-1.5 rounded-full"
                      style={{ background: s.dot }}
                    />
                    {s.label}
                  </span>
                </div>
                <h1 className="text-[20px] font-black text-white leading-snug mb-1.5">
                  {c.title}
                </h1>
                <div
                  className="flex items-center gap-3 text-[11px] flex-wrap"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  <span>📍 {c.location_address}</span>
                  <span style={{ color: "rgba(255,255,255,0.15)" }}>·</span>
                  <span>🕐 {timeAgo(c.created_at)}</span>
                  {c.assigned_to && (
                    <>
                      <span style={{ color: "rgba(255,255,255,0.15)" }}>·</span>
                      <span>🛠️ {c.assigned_to}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div
          className="flex-shrink-0 bg-white"
          style={{
            borderBottom: "1px solid #e2e8f0",
            position: "sticky",
            top: 0,
            zIndex: 20,
          }}
        >
          <div className="max-w-4xl mx-auto px-5 flex">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="flex items-center gap-1.5 px-4 py-3.5 text-[12px] font-semibold border-b-2 transition-all"
                style={{
                  borderColor:
                    activeTab === tab.key ? "#3b82f6" : "transparent",
                  color: activeTab === tab.key ? "#2563eb" : "#94a3b8",
                }}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center"
                    style={{
                      background: activeTab === tab.key ? "#eff6ff" : "#f1f5f9",
                      color: activeTab === tab.key ? "#2563eb" : "#94a3b8",
                    }}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-hidden">
          <div className="max-w-4xl mx-auto px-5 py-5 h-full">
            {/* TAB: CHAT */}
            {activeTab === "chat" && (
              <div
                className="bg-white rounded-2xl overflow-hidden flex flex-col"
                style={{
                  border: "1px solid #e2e8f0",
                  height: "calc(100vh - 280px)",
                  minHeight: 400,
                }}
              >
                {/* Chat header */}
                <div
                  className="px-5 py-3 flex items-center gap-3 flex-shrink-0"
                  style={{ borderBottom: "1px solid #f1f5f9" }}
                >
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-[10px] font-black"
                    style={{ background: cat.grad }}
                  >
                    {cat.icon}
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-slate-900">
                      Tim {cat.label}
                    </p>
                    <p
                      className="text-[10px] flex items-center gap-1.5"
                      style={{ color: "#22c55e" }}
                    >
                      <span
                        className="live w-1.5 h-1.5 rounded-full inline-block"
                        style={{ background: "#22c55e" }}
                      />
                      Online · Membalas pesan
                    </p>
                  </div>
                  <span
                    className="mono text-[10px] font-bold ml-auto px-2.5 py-1 rounded-lg"
                    style={{
                      background: "#f8fafc",
                      color: "#94a3b8",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    {c.ticket_number}
                  </span>
                </div>

                {/* Messages */}
                <div
                  className="scr flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3"
                  style={{
                    background: "#f8fafc",
                    backgroundImage:
                      "radial-gradient(#e2e8f0 1px, transparent 0)",
                    backgroundSize: "24px 24px",
                  }}
                >
                  {messages?.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
                      <span className="text-3xl">💬</span>
                      <p className="text-[13px] font-semibold text-slate-600">
                        Belum ada pesan
                      </p>
                      <p className="text-[11px]" style={{ color: "#94a3b8" }}>
                        Mulai percakapan dengan tim kami di bawah.
                      </p>
                    </div>
                  )}
                  {messages?.map((m, i) => {
                    const isUser = m.sender_type === "user";
                    if (m.sender_type === "system")
                      return (
                        <div key={m.id || i} className="flex justify-center">
                          <span
                            className="text-[10px] px-3 py-1 rounded-full"
                            style={{ background: "#f1f5f9", color: "#94a3b8" }}
                          >
                            {m.message}
                          </span>
                        </div>
                      );
                    return (
                      <div
                        key={m.id || i}
                        className={`msg flex flex-col gap-1 ${
                          isUser ? "items-end" : "items-start"
                        }`}
                      >
                        {!isUser && (
                          <div className="flex items-center gap-1.5 mb-0.5 pl-1">
                            <div
                              className="w-4 h-4 rounded-md flex items-center justify-center text-white text-[7px] font-black"
                              style={{ background: cat.grad }}
                            >
                              {cat.icon}
                            </div>
                            <span
                              className="text-[10px] font-semibold"
                              style={{ color: "#94a3b8" }}
                            >
                              {m.sender_name}
                            </span>
                          </div>
                        )}
                        <div
                          className={`max-w-[72%] px-4 py-2.5 text-[12px] leading-relaxed rounded-2xl ${
                            isUser
                              ? "text-white rounded-br-sm"
                              : "rounded-bl-sm"
                          }`}
                          style={
                            isUser
                              ? {
                                  background:
                                    "linear-gradient(135deg,#2563eb,#1d4ed8)",
                                }
                              : {
                                  background: "#fff",
                                  border: "1px solid #e2e8f0",
                                  color: "#1e293b",
                                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                                }
                          }
                        >
                          {m.message}
                        </div>
                        <span
                          className="text-[9px] px-1"
                          style={{ color: "#cbd5e1" }}
                        >
                          {fmt(m.created_at, {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    );
                  })}
                  <div ref={msgEndRef} />
                </div>

                {/* Input */}
                {c.status !== "closed" && c.status !== "rejected" ? (
                  <div
                    className="px-4 py-3 flex-shrink-0"
                    style={{ borderTop: "1px solid #f1f5f9" }}
                  >
                    <div
                      className="flex items-end gap-2 px-4 py-2.5 rounded-xl"
                      style={{
                        background: "#f8fafc",
                        border: "1.5px solid #e2e8f0",
                      }}
                    >
                      <textarea
                        className="scr flex-1 bg-transparent resize-none outline-none text-[12px] text-slate-800 max-h-24 leading-relaxed placeholder-slate-400"
                        placeholder="Tulis pesan Anda..."
                        rows={1}
                        value={newMsg}
                        onChange={(e) => setNewMsg(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            sendMsg();
                          }
                        }}
                      />
                      <button
                        onClick={sendMsg}
                        disabled={!newMsg.trim() || sending}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white flex-shrink-0 transition-all disabled:opacity-40"
                        style={{
                          background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
                        }}
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
                  </div>
                ) : (
                  <div
                    className="px-4 py-3 flex-shrink-0 text-center"
                    style={{
                      borderTop: "1px solid #f1f5f9",
                      background: "#f8fafc",
                    }}
                  >
                    <p className="text-[11px]" style={{ color: "#94a3b8" }}>
                      Chat tidak tersedia — laporan sudah{" "}
                      {s.label.toLowerCase()}.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB: PROGRESS */}
            {activeTab === "progress" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card title="🗺️ Alur Penanganan">
                  <ProgressTimeline status={c.status} logs={logs} />
                </Card>

                <Card title="📜 Riwayat Perubahan">
                  {!logs?.length ? (
                    <p
                      className="text-[12px] text-center py-8"
                      style={{ color: "#94a3b8" }}
                    >
                      Belum ada perubahan status.
                    </p>
                  ) : (
                    <div className="scr space-y-3 max-h-80 overflow-y-auto">
                      {logs.map((l, i) => {
                        const ns = STATUS_MAP[l.new_status];
                        return (
                          <div
                            key={i}
                            className="flex items-start gap-3 pb-3"
                            style={{
                              borderBottom:
                                i < logs.length - 1
                                  ? "1px solid #f1f5f9"
                                  : "none",
                            }}
                          >
                            <div
                              className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                              style={{ background: ns?.dot || "#94a3b8" }}
                            />
                            <div>
                              <div className="flex items-center gap-2 mb-0.5">
                                <span
                                  className="text-[11px] font-bold"
                                  style={{ color: ns?.color || "#64748b" }}
                                >
                                  {ns?.label || l.new_status}
                                </span>
                                <span
                                  className="text-[10px]"
                                  style={{ color: "#94a3b8" }}
                                >
                                  oleh {l.changed_by}
                                </span>
                              </div>
                              {l.note && (
                                <p
                                  className="text-[11px] italic mb-0.5"
                                  style={{ color: "#64748b" }}
                                >
                                  "{l.note}"
                                </p>
                              )}
                              <p
                                className="text-[10px]"
                                style={{ color: "#cbd5e1" }}
                              >
                                {fmtFull(l.created_at)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Card>

                {c.status === "resolved" && (
                  <div
                    className="md:col-span-2 flex items-center gap-4 p-5 rounded-2xl"
                    style={{
                      background: "#f0fdf4",
                      border: "1px solid #bbf7d0",
                    }}
                  >
                    <span className="text-3xl">🎉</span>
                    <div>
                      <p className="text-[14px] font-bold text-green-800 mb-0.5">
                        Laporan Berhasil Diselesaikan!
                      </p>
                      <p className="text-[12px] text-green-600">
                        Masalah yang Anda laporkan telah berhasil ditangani.
                        Terima kasih atas kontribusi Anda.
                      </p>
                      {c.resolved_at && (
                        <p className="text-[11px] text-green-500 mt-1">
                          Diselesaikan pada{" "}
                          {fmt(c.resolved_at, {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                {c.status === "rejected" && (
                  <div
                    className="md:col-span-2 flex items-center gap-4 p-5 rounded-2xl"
                    style={{
                      background: "#fef2f2",
                      border: "1px solid #fecaca",
                    }}
                  >
                    <span className="text-3xl">⚠️</span>
                    <div className="flex-1">
                      <p className="text-[14px] font-bold text-red-800 mb-0.5">
                        Laporan Tidak Dapat Diproses
                      </p>
                      <p className="text-[12px] text-red-600">
                        Silakan buat laporan baru dengan informasi yang lebih
                        lengkap.
                      </p>
                    </div>
                    <Link
                      href="/pengaduan"
                      className="px-4 py-2 rounded-xl text-[12px] font-bold text-white"
                      style={{ background: "#dc2626" }}
                    >
                      Buat Ulang
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* TAB: INFO */}
            {activeTab === "info" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card title="📋 Informasi Laporan">
                  <div className="space-y-4">
                    <InfoRow
                      label="No. Tiket"
                      value={c.ticket_number}
                      mono
                      color={s.color}
                    />
                    <InfoRow label="Jenis Masalah" value={c.issue_type} />
                    <InfoRow label="Kategori" value={cat.label} />
                    <InfoRow
                      label="Prioritas"
                      value={c.priority?.toUpperCase()}
                    />
                    <InfoRow label="Status" value={s.label} />
                    <InfoRow
                      label="Petugas"
                      value={c.assigned_to || "Belum ditugaskan"}
                    />
                  </div>
                </Card>

                <Card title="📍 Lokasi & Deskripsi">
                  {[
                    { label: "Lokasi", value: c.location_address },
                    { label: "Deskripsi", value: c.description },
                  ].map((f) => (
                    <div
                      key={f.label}
                      className="mb-3 p-3 rounded-xl"
                      style={{
                        background: "#f8fafc",
                        border: "1px solid #f1f5f9",
                      }}
                    >
                      <p
                        className="text-[10px] font-bold uppercase tracking-wider mb-1"
                        style={{ color: "#94a3b8" }}
                      >
                        {f.label}
                      </p>
                      <p className="text-[12px] font-semibold text-slate-800">
                        {f.value}
                      </p>
                    </div>
                  ))}
                </Card>

                <Card title="👤 Data Pelapor">
                  <div className="space-y-3">
                    <InfoRow label="Nama" value={c.reporter_name} />
                    <InfoRow label="Telepon" value={c.reporter_phone} />
                    <InfoRow label="Email" value={c.reporter_email} />
                  </div>
                </Card>

                <Card title="🕐 Waktu">
                  <div className="space-y-3">
                    <InfoRow label="Dibuat" value={fmtFull(c.created_at)} />
                    <InfoRow label="Diperbarui" value={fmtFull(c.updated_at)} />
                    <InfoRow
                      label="Diselesaikan"
                      value={c.resolved_at ? fmtFull(c.resolved_at) : null}
                    />
                    {c.resolved_at && (
                      <div
                        className="pt-2"
                        style={{ borderTop: "1px solid #f1f5f9" }}
                      >
                        <p
                          className="text-[11px] font-semibold"
                          style={{ color: "#94a3b8" }}
                        >
                          Durasi Penanganan
                        </p>
                        <p className="text-[13px] font-bold text-slate-800 mt-0.5">
                          {c.hours_open} jam
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
