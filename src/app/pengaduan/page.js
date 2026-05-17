"use client";
// src/app/pengaduan/page.js

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import ChatHeader from "@/components/ChatHeader";
import MessageList from "@/components/MessageList";
import ReportForm from "@/components/ReportForm";
import InputBar from "@/components/InputBar";
import TicketDetailPage from "../riwayat/page";
import { Building2, BookOpen, Shield, ClipboardList } from "lucide-react";

// THEMES will be built dynamically

const STATUS_COLOR = {
  new: "#f59e0b",
  in_review: "#3b82f6",
  in_progress: "#6366f1",
  resolved: "#22c55e",
  rejected: "#ef4444",
  closed: "#64748b",
};
const STATUS_LABEL = {
  new: "Baru",
  in_review: "Ditinjau",
  in_progress: "Diproses",
  resolved: "Selesai",
  rejected: "Ditolak",
  closed: "Ditutup",
};
const CHAT_STATUS_LABEL = {
  new: "🟡 Baru",
  in_review: "🔵 Ditinjau",
  in_progress: "🔵 Diproses",
  resolved: "🟢 Selesai",
  rejected: "🔴 Ditolak",
  closed: "⚫ Ditutup",
};

export default function PengaduanPage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [themesMap, setThemesMap] = useState({});
  const [theme, setTheme] = useState("");
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [ticket, setTicket] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [recentReports, setRecentReports] = useState([]);
  const [showExitModal, setShowExitModal] = useState(false);
  const [user, setUser] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetch("/api/categories")
      .then(res => res.json())
      .then(d => {
        if (d.success && d.data.length > 0) {
          setCategories(d.data);
          
          const newThemesMap = {};
          d.data.forEach(c => {
            newThemesMap[c.code] = {
              code: c.code,
              agent: `Tim ${c.name}`,
              avatar: c.name.substring(0, 2).toUpperCase(),
              color: c.color_hex,
              gradient: `linear-gradient(135deg, ${c.color_hex}, #00000088)`,
              statusText: "Online · Respon cepat",
              welcome: `Selamat datang di <strong>Konekko Services</strong>! Saya dari <strong>Tim ${c.name}</strong>. Silakan laporkan masalah terkait <strong>${c.description || c.name}</strong> di sini.`,
              quickReplies: ["📝 Laporan Baru", "🔍 Cek Status"],
              themeColor: c.color_hex,
            };
          });
          
          if (newThemesMap.public) {
            newThemesMap.public.quickReplies = ["📝 Laporan Baru", "🔍 Cek Status", "🚨 Darurat"];
          }
          if (newThemesMap.safe) {
            newThemesMap.safe.statusText = "🔴 Darurat? Hubungi 110";
            newThemesMap.safe.quickReplies = ["📝 Laporan Baru", "🔍 Cek Status", "🚨 Darurat Polisi 110"];
          }
          
          setThemesMap(newThemesMap);
          setTheme(d.data.find(c => c.code === "public") ? "public" : d.data[0].code);
        }
        setCategoriesLoading(false);
      });
  }, []);

  const t = themesMap[theme];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        setUser(JSON.parse(atob(token.split(".")[1])));
      } catch {
        localStorage.removeItem("token");
      }
    }
  }, []);

  useEffect(() => {
    fetch("/api/pengaduan?limit=5")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setRecentReports(d.data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!t) return;
    setMessages([
      { id: Date.now(), type: "agent", html: t.welcome, time: now() },
    ]);
    setShowForm(false);
    setTicket(null);
  }, [theme, t]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    const fn = (e) => {
      if (e.key === "Escape") setShowExitModal(false);
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  const now = () =>
    new Date().toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });

  function addUserMsg(text) {
    setMessages((p) => [
      ...p,
      { id: Date.now(), type: "user", text, time: now() },
    ]);
  }

  function addAgentMsg(html, delay = 800) {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((p) => [
        ...p,
        { id: Date.now() + Math.random(), type: "agent", html, time: now() },
      ]);
    }, delay);
  }

  function handleQuickReply(label) {
    addUserMsg(label);
    if (label.includes("Laporan Baru")) {
      addAgentMsg("Baik! Silakan isi form pengaduan berikut.", 700);
      setTimeout(() => setShowForm(true), 800);
    } else if (label.includes("Cek Status")) {
      addAgentMsg(
        "Masukkan nomor tiket Anda (contoh: <strong>PF-2024-001</strong>) untuk mengecek status laporan.",
        700
      );
    } else if (label.includes("Darurat") || label.includes("110")) {
      addAgentMsg(
        "🚨 Untuk darurat:<br><br>📞 <strong>Polisi:</strong> 110<br>📞 <strong>Pemadam:</strong> 113<br>📞 <strong>Ambulans:</strong> 118<br>📞 <strong>Basarnas:</strong> 115",
        600
      );
    } else {
      addAgentMsg(
        "Pesan Anda telah diterima. Ada yang bisa saya bantu lebih lanjut?"
      );
    }
  }

  function handleSendMessage(text) {
    if (!text.trim()) return;
    addUserMsg(text);
    const m = text.match(/([A-Z]{2,3}-\d{4}-\d{3})/i);
    if (m) {
      fetchTicketStatus(m[1].toUpperCase());
      return;
    }
    if (ticket) {
      fetch(`/api/tickets/${ticket}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderType: "user",
          senderName: "Pengguna",
          message: text,
        }),
      });
      addAgentMsg(
        "Pesan Anda telah diterima dan akan segera direspons oleh tim kami.",
        900
      );
    } else {
      addAgentMsg(
        'Ketik <strong>"Laporan Baru"</strong> untuk membuat pengaduan resmi, atau masukkan nomor tiket untuk cek status.',
        900
      );
    }
  }

  async function fetchTicketStatus(ticketNum) {
    addAgentMsg(`Sedang mencari tiket <strong>${ticketNum}</strong>...`, 600);
    try {
      const res = await fetch(`/api/tickets/${ticketNum}`);
      const data = await res.json();
      if (data.success) {
        const { complaint: c } = data.data;
        addAgentMsg(
          `✅ <strong>Tiket ditemukan!</strong><br><br>📋 <strong>No:</strong> ${
            c.ticket_number
          }<br>🔧 <strong>Masalah:</strong> ${
            c.issue_type
          }<br>📍 <strong>Lokasi:</strong> ${
            c.location_address
          }<br>📊 <strong>Status:</strong> ${
            CHAT_STATUS_LABEL[c.status] || c.status
          }<br>🕐 <strong>Dibuat:</strong> ${new Date(
            c.created_at
          ).toLocaleString("id-ID")}${
            c.assigned_to
              ? `<br>👤 <strong>Petugas:</strong> ${c.assigned_to}`
              : ""
          }`,
          800
        );
      } else {
        addAgentMsg(
          `Tiket <strong>${ticketNum}</strong> tidak ditemukan.`,
          800
        );
      }
    } catch {
      addAgentMsg("Gagal terhubung ke server. Coba beberapa saat lagi.", 800);
    }
  }

  async function handleSubmitForm(formData) {
    try {
      const res = await fetch("/api/pengaduan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, categoryCode: theme }),
      });
      const data = await res.json();
      if (data.success) {
        setTicket(data.ticketNumber);
        setShowForm(false);
        addUserMsg(
          `Laporan dikirim: ${formData.title} di ${formData.locationAddress}`
        );
        addAgentMsg(
          `✅ <strong>Laporan berhasil dibuat!</strong><br><br>📋 <strong>No. Tiket:</strong> ${data.ticketNumber}<br>📍 <strong>Lokasi:</strong> ${formData.locationAddress}<br><br>Tim kami akan menindaklanjuti dalam <strong>1×24 jam</strong>.`,
          1000
        );
        fetch("/api/pengaduan?limit=5")
          .then((r) => r.json())
          .then((d) => {
            if (d.success) setRecentReports(d.data);
          });
      } else {
        addAgentMsg(`❌ Gagal membuat laporan: ${data.error}`, 600);
      }
    } catch {
      addAgentMsg("❌ Gagal terhubung ke server.", 600);
    }
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap');
        .pk-root * { font-family: 'Plus Jakarta Sans', sans-serif; box-sizing: border-box; }
        .pk-mono { font-family: 'JetBrains Mono', monospace !important; }
        .pk-sidebar { background: #0f172a; }
        .pk-chat-bg { background: #f8fafc; background-image: radial-gradient(#e2e8f0 1px, transparent 0); background-size: 24px 24px; }
        .pk-bubble-agent { background:#fff; border:1px solid #e2e8f0; box-shadow:0 1px 4px rgba(0,0,0,0.05); }
        .pk-topbar { background:rgba(255,255,255,0.95); backdrop-filter:blur(10px); border-bottom:1px solid #e2e8f0; }
        @keyframes pk-slide { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        .pk-msg { animation: pk-slide 0.18s ease forwards; }
        @keyframes pk-modal { from{opacity:0;transform:scale(0.95)} to{opacity:1;transform:scale(1)} }
        .pk-modal { animation: pk-modal 0.16s ease forwards; }
        @keyframes pk-bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-4px)} }
        .pk-dot { animation: pk-bounce 1.1s infinite; }
        .pk-dot:nth-child(2){animation-delay:.15s} .pk-dot:nth-child(3){animation-delay:.3s}
        @keyframes pk-pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .pk-online { display:inline-block; width:6px; height:6px; border-radius:50%; background:#22c55e; margin-right:5px; animation:pk-pulse 2s infinite; }
        .pk-scroll::-webkit-scrollbar{width:3px} .pk-scroll::-webkit-scrollbar-thumb{background:#e2e8f0;border-radius:4px} .pk-scroll::-webkit-scrollbar-track{background:transparent}
        .pk-report-item:hover { background:rgba(255,255,255,0.06); }
        .pk-theme-btn:hover { background:rgba(255,255,255,0.05); }
        .pk-topbtn:hover { background:#f1f5f9; }
        .pk-exit-btn:hover { background:#fef2f2; border-color:#fecaca; color:#dc2626; }
      `}} />

      <div
        className="pk-root flex h-screen overflow-hidden"
        style={{ background: "#f1f5f9" }}
      >
      {categoriesLoading || !t ? (
        <div className="flex-1 flex items-center justify-center min-h-screen">
          <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
        </div>
      ) : (
        <>
        {/* ════════════ SIDEBAR ════════════ */}
        <aside className="pk-sidebar w-64 flex flex-col overflow-hidden flex-shrink-0">
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

          {/* Theme pills */}
          <div
            className="px-4 py-4"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
          >
            <p
              className="text-[9px] font-bold uppercase tracking-widest mb-3"
              style={{ color: "rgba(255,255,255,0.25)" }}
            >
              Kategori
            </p>
            {categories.map((cat) => {
              let icon = <span className="text-[18px]">{cat.icon}</span>;
              if (cat.code === "public") icon = <Building2 className="w-5 h-5" />;
              if (cat.code === "edu") icon = <BookOpen className="w-5 h-5" />;
              if (cat.code === "safe") icon = <Shield className="w-5 h-5" />;

              return (
                <button
                  key={cat.code}
                  onClick={() => setTheme(cat.code)}
                  className="pk-theme-btn w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-left transition-all"
                  style={{
                    background:
                      theme === cat.code
                        ? "rgba(255,255,255,0.08)"
                        : "transparent",
                    border:
                      theme === cat.code
                        ? `1px solid ${cat.color_hex}30`
                        : "1px solid transparent",
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      background:
                        theme === cat.code
                          ? cat.color_hex + "22"
                          : "rgba(255,255,255,0.05)",
                      color: cat.color_hex
                    }}
                  >
                    {icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className="text-[12px] font-semibold leading-tight"
                      style={{
                        color:
                          theme === cat.code ? "#fff" : "rgba(255,255,255,0.5)",
                      }}
                    >
                      {cat.name}
                    </p>
                    <p
                      className="text-[9px] mt-0.5 truncate"
                      style={{ color: "rgba(255,255,255,0.25)" }}
                    >
                      {cat.description || cat.name}
                    </p>
                  </div>
                  {theme === cat.code && (
                    <div
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: cat.color_hex }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Recent reports */}
          <div className="flex-1 overflow-y-auto pk-scroll px-4 py-4">
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
              recentReports.map((r) => (
                <div
                  key={r.id}
                  onClick={() => router.push(`/riwayat/${r.ticket_number}`)}
                  className="pk-report-item mb-2 p-3 rounded-xl cursor-pointer transition-all"
                  style={{ border: "1px solid rgba(255,255,255,0.05)" }}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p
                      className="text-[11px] font-semibold line-clamp-1 flex-1"
                      style={{ color: "rgba(255,255,255,0.75)" }}
                    >
                      {r.title}
                    </p>
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded-md flex-shrink-0"
                      style={{
                        background:
                          (STATUS_COLOR[r.status] || "#64748b") + "22",
                        color: STATUS_COLOR[r.status] || "#64748b",
                      }}
                    >
                      {STATUS_LABEL[r.status] || r.status}
                    </span>
                  </div>
                  <p
                    className="pk-mono text-[9px]"
                    style={{ color: "rgba(255,255,255,0.22)" }}
                  >
                    {r.ticket_number}
                  </p>
                </div>
              ))
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
                <div className="min-w-0 flex-1">
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

        {/* ════════════ CHAT AREA ════════════ */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Top bar */}
          <div className="pk-topbar h-11 px-5 flex items-center justify-between flex-shrink-0 z-10">
            <div className="flex items-center gap-2 text-[11px]">
              <span style={{ color: "#94a3b8" }}>Portal</span>
              <span style={{ color: "#cbd5e1" }}>/</span>
              <span className="font-semibold" style={{ color: "#475569" }}>
                Pengaduan
              </span>
              {ticket && (
                <>
                  <span style={{ color: "#cbd5e1" }}>/</span>
                  <span
                    className="pk-mono font-bold"
                    style={{ color: "#2563eb" }}
                  >
                    {ticket}
                  </span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push("/?tab=laporan")}
                className="pk-topbtn flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors"
                style={{
                  background: "#f1f5f9",
                  color: "#475569",
                  border: "1px solid #e2e8f0",
                }}
              >
                <ClipboardList className="w-4 h-4" />
                <span className="hidden sm:block">Laporan Saya</span>
              </button>
              <button
                onClick={() => setShowExitModal(true)}
                className="pk-exit-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
                style={{
                  background: "#fff",
                  color: "#64748b",
                  border: "1px solid #e2e8f0",
                }}
              >
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span>Keluar</span>
              </button>
            </div>
          </div>

          {/* Agent header */}
          <div
            className="bg-white px-5 py-3 flex items-center gap-3 flex-shrink-0"
            style={{
              borderBottom: "1px solid #f1f5f9",
              boxShadow: "0 1px 0 #f1f5f9",
            }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-[11px] font-black flex-shrink-0"
              style={{ background: t.gradient }}
            >
              {t.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-slate-900">{t.agent}</p>
              <p
                className="text-[10px] flex items-center"
                style={{ color: "#16a34a" }}
              >
                <span className="pk-online" />
                {t.statusText}
              </p>
            </div>
            {ticket && (
              <div
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl"
                style={{ background: "#eff6ff", border: "1px solid #bfdbfe" }}
              >
                <span className="text-blue-400 text-[11px]">🎫</span>
                <span className="pk-mono text-[11px] font-bold text-blue-700">
                  {ticket}
                </span>
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="pk-chat-bg pk-scroll flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`pk-msg flex flex-col gap-1 ${
                  msg.type === "user" ? "items-end" : "items-start"
                }`}
              >
                {msg.type === "agent" && (
                  <div className="flex items-center gap-1.5 mb-0.5 pl-0.5">
                    <div
                      className="w-4 h-4 rounded-md flex items-center justify-center text-white text-[7px] font-black"
                      style={{ background: t.gradient }}
                    >
                      {t.avatar[0]}
                    </div>
                    <span
                      className="text-[10px] font-semibold"
                      style={{ color: "#94a3b8" }}
                    >
                      {t.agent}
                    </span>
                  </div>
                )}
                <div
                  className={`max-w-[72%] px-4 py-2.5 text-[13px] leading-relaxed ${
                    msg.type === "user"
                      ? "text-white rounded-2xl rounded-br-sm"
                      : "pk-bubble-agent text-slate-800 rounded-2xl rounded-bl-sm"
                  }`}
                  style={msg.type === "user" ? { background: t.gradient } : {}}
                  dangerouslySetInnerHTML={
                    msg.html ? { __html: msg.html } : undefined
                  }
                >
                  {msg.text || undefined}
                </div>
                <span className="text-[9px] px-1" style={{ color: "#cbd5e1" }}>
                  {msg.time}
                </span>
              </div>
            ))}

            {isTyping && (
              <div className="pk-msg flex flex-col items-start gap-1">
                <div className="flex items-center gap-1.5 mb-0.5 pl-0.5">
                  <div
                    className="w-4 h-4 rounded-md flex items-center justify-center text-white text-[7px] font-black"
                    style={{ background: t.gradient }}
                  >
                    {t.avatar[0]}
                  </div>
                  <span
                    className="text-[10px] font-semibold"
                    style={{ color: "#94a3b8" }}
                  >
                    {t.agent}
                  </span>
                </div>
                <div className="pk-bubble-agent px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1.5">
                  <div
                    className="pk-dot w-1.5 h-1.5 rounded-full"
                    style={{ background: "#cbd5e1" }}
                  />
                  <div
                    className="pk-dot w-1.5 h-1.5 rounded-full"
                    style={{ background: "#cbd5e1" }}
                  />
                  <div
                    className="pk-dot w-1.5 h-1.5 rounded-full"
                    style={{ background: "#cbd5e1" }}
                  />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick replies + input */}
          {showForm ? (
            <ReportForm
              theme={t}
              categoryCode={theme}
              onSubmit={handleSubmitForm}
              onCancel={() => {
                setShowForm(false);
                addAgentMsg(
                  "Form ditutup. Apa lagi yang bisa saya bantu?",
                  400
                );
              }}
            />
          ) : (
            <div
              className="bg-white"
              style={{ borderTop: "1px solid #f1f5f9" }}
            >
              {/* Quick replies */}
              <div className="px-5 pt-3 flex gap-2 flex-wrap">
                {t.quickReplies.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleQuickReply(q)}
                    className="px-3.5 py-1.5 rounded-full text-[11px] font-semibold transition-all"
                    style={{
                      border: `1.5px solid ${t.color}33`,
                      color: t.color,
                      background: `${t.color}08`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = t.color;
                      e.currentTarget.style.color = "#fff";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = `${t.color}08`;
                      e.currentTarget.style.color = t.color;
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
              {/* Input */}
              <div className="px-4 pb-4 pt-2.5">
                <InputBar
                  theme={t}
                  quickReplies={[]}
                  onQuickReply={() => {}}
                  onSend={handleSendMessage}
                  hideQuickReplies
                />
              </div>
            </div>
          )}
        </div>

        {/* ════════════ EXIT MODAL ════════════ */}
        {showExitModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{
              background: "rgba(15,23,42,0.65)",
              backdropFilter: "blur(6px)",
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowExitModal(false);
            }}
          >
            <div
              className="pk-modal bg-white rounded-2xl w-full max-w-sm mx-4 overflow-hidden"
              style={{ boxShadow: "0 25px 60px rgba(15,23,42,0.3)" }}
            >
              <div
                className="h-[3px]"
                style={{
                  background: "linear-gradient(90deg,#ef4444,#f97316,#fbbf24)",
                }}
              />
              <div className="px-6 pt-6 pb-5">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: "#fef2f2" }}
                >
                  <svg
                    className="w-6 h-6"
                    style={{ color: "#ef4444" }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                </div>
                <h2 className="text-[15px] font-bold text-slate-900 text-center mb-1.5">
                  Keluar dari Portal Pengaduan?
                </h2>
                <p
                  className="text-[12px] text-center leading-relaxed"
                  style={{ color: "#64748b" }}
                >
                  Laporan yang belum dikirim{" "}
                  <strong className="text-slate-800">
                    tidak akan tersimpan
                  </strong>
                  .
                </p>
              </div>

              {ticket && (
                <div
                  className="mx-6 mb-4 px-4 py-3 rounded-xl flex items-start gap-3"
                  style={{ background: "#fffbeb", border: "1px solid #fde68a" }}
                >
                  <span className="text-[18px] flex-shrink-0">⚠️</span>
                  <div>
                    <p className="text-[11px] font-bold text-amber-900 mb-0.5">
                      Tiket aktif terdeteksi
                    </p>
                    <p className="pk-mono text-[12px] font-bold text-amber-700 mb-0.5">
                      {ticket}
                    </p>
                    <p className="text-[10px] text-amber-600">
                      Bisa dilanjutkan dari halaman beranda.
                    </p>
                  </div>
                </div>
              )}

              <div className="px-6 pb-6 flex gap-2.5">
                <button
                  onClick={() => setShowExitModal(false)}
                  className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold transition-colors"
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    color: "#475569",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#f1f5f9")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "#f8fafc")
                  }
                >
                  Tetap di Sini
                </button>
                <button
                  onClick={() => {
                    setShowExitModal(false);
                    router.push("/");
                  }}
                  className="flex-1 py-2.5 rounded-xl text-[13px] font-bold text-white transition-all flex items-center justify-center gap-1.5"
                  style={{
                    background: "linear-gradient(135deg,#ef4444,#dc2626)",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
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
                      d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3m10-11v10a1 1 0 01-1 1h-3m-4 0v-6a1 1 0 00-1-1H9a1 1 0 00-1 1v6"
                    />
                  </svg>
                  Ke Beranda
                </button>
              </div>
            </div>
          </div>
        )}
        </>
      )}
      </div>
    </>
  );
}
