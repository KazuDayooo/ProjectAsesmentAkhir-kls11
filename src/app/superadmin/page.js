"use client";
// src/app/superadmin/page.js — Super Admin Dashboard

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import { LayoutDashboard, ClipboardList, Users, FolderOpen, Tags, PlusCircle, Clock, Building2, BookOpen, Shield } from "lucide-react";

// ── Helpers ───────────────────────────────────────────────────────────────────
function getToken() {
  return typeof window !== "undefined" ? localStorage.getItem("token") : null;
}
function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}
async function api(path, options = {}) {
  const res = await fetch(path, { headers: authHeaders(), ...options });
  return res.json();
}

// ── Constants ─────────────────────────────────────────────────────────────────
const ROLE_COLORS = {
  superadmin: "bg-violet-100 text-violet-700 border-violet-200",
  admin: "bg-blue-100 text-blue-700 border-blue-200",
  public: "bg-gray-100 text-gray-600 border-gray-200",
};
const STATUS_COLORS = {
  new: "bg-amber-100 text-amber-700",
  in_review: "bg-blue-100 text-blue-700",
  in_progress: "bg-violet-100 text-violet-700",
  resolved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  closed: "bg-gray-100 text-gray-500",
};
const STATUS_LABELS = {
  new: "Baru",
  in_review: "Ditinjau",
  in_progress: "Diproses",
  resolved: "Selesai",
  rejected: "Ditolak",
  closed: "Ditutup",
};
const PRIORITY_COLORS = {
  low: "bg-slate-100 text-slate-600",
  medium: "bg-blue-100 text-blue-600",
  high: "bg-orange-100 text-orange-600",
  critical: "bg-red-100 text-red-700",
};
const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
  { id: "laporan", label: "Laporan", icon: <ClipboardList className="w-5 h-5" /> },
  { id: "users", label: "Users", icon: <Users className="w-5 h-5" /> },
  { id: "categories", label: "Kategori", icon: <FolderOpen className="w-5 h-5" /> },
  { id: "issue-types", label: "Issue Types", icon: <Tags className="w-5 h-5" /> },
];

// ── Shared UI ─────────────────────────────────────────────────────────────────
function Modal({ title, onClose, wide, children }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 transition-all duration-300 animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full border border-slate-100 dark:border-slate-800 ${
          wide ? "max-w-4xl" : "max-w-lg"
        } max-h-[90vh] overflow-y-auto transform transition-all duration-300 animate-in zoom-in-95`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-10">
          <h2 className="text-[16px] font-bold text-slate-800 dark:text-white">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 transition-all hover:scale-105"
          >
            ✕
          </button>
        </div>
        <div className="px-6 py-5 text-slate-800 dark:text-slate-200">{children}</div>
      </div>
    </div>
  );
}
function Field({ label, required, children }) {
  return (
    <div className="mb-4">
      <label className="block text-[11px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
const inputCls =
  "w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-[13px] text-slate-800 dark:text-slate-200 outline-none focus:border-blue-400 dark:focus:border-blue-500 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 transition-colors";
function SectionHeader({ title, sub, children }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div>
        <h1 className="text-[18px] font-bold text-slate-800 dark:text-white">{title}</h1>
        {sub && <p className="text-[12px] text-slate-400 mt-0.5">{sub}</p>}
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        {children}
      </div>
    </div>
  );
}
function SectionLoader() {
  return (
    <div className="flex-1 flex items-center justify-center gap-3 text-slate-400">
      <div className="w-5 h-5 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
      <span className="text-[13px]">Memuat...</span>
    </div>
  );
}
function TableLoader() {
  return (
    <div className="flex items-center justify-center h-32 gap-3 text-slate-400">
      <div className="w-5 h-5 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
      <span className="text-[13px]">Memuat data...</span>
    </div>
  );
}
function StatCard({ label, value, icon, color = "blue", sub }) {
  const colors = {
    blue: "from-blue-500 to-blue-600 shadow-blue-500/20",
    violet: "from-violet-500 to-violet-600 shadow-violet-500/20",
    green: "from-emerald-500 to-emerald-600 shadow-emerald-500/20",
    amber: "from-amber-500 to-amber-600 shadow-amber-500/20",
  };
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 flex items-center gap-5 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 transition-all duration-300 hover:-translate-y-1">
      <div
        className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colors[color]} shadow-lg flex items-center justify-center text-2xl flex-shrink-0 text-white`}
      >
        {icon}
      </div>
      <div>
        <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium mb-1">{label}</p>
        <p className="text-[28px] font-extrabold text-slate-800 dark:text-white leading-none">
          {value ?? "—"}
        </p>
        {sub && <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ════════════════════════════════════════════════════════════════════════════
export default function SuperAdminPage() {
  const router = useRouter();
  const [activeNav, setActiveNav] = useState("dashboard");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.role !== "superadmin") {
        router.push("/pengaduan");
        return;
      }
      setCurrentUser(payload);
    } catch {
      router.push("/login");
    }
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    localStorage.removeItem("token");
    router.push("/login");
  }

  if (!currentUser)
    return (
      <div className="flex h-screen items-center justify-center bg-cream-50 dark:bg-slate-950">
        <div className="w-6 h-6 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="flex h-screen bg-cream-50 dark:bg-slate-950 transition-colors duration-300 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 flex flex-col overflow-hidden flex-shrink-0 relative shadow-2xl z-20">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="px-6 h-20 flex items-center gap-3 border-b border-white/10 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
            K
          </div>
          <div>
            <p className="text-[15px] font-bold text-white leading-tight">
              Konekko<span className="text-blue-400"> Admin</span>
            </p>
            <p className="text-[11px] text-slate-400 font-medium">
              Super Dashboard
            </p>
          </div>
        </div>
        <nav className="flex-1 p-4 overflow-y-auto relative z-10 custom-scrollbar">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest px-3 mb-3 mt-2">
            Menu Utama
          </p>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left mb-1 text-[13px] font-semibold transition-all duration-300
                ${
                  activeNav === item.id
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
            >
              <span className="flex items-center justify-center">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-5 border-t border-white/10 relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 flex items-center justify-center text-white text-[13px] font-bold">
              {currentUser.name?.[0] || "S"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-white truncate">
                {currentUser.name}
              </p>
              <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20 inline-block mt-0.5">
                SUPERADMIN
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-[13px] font-bold text-slate-300 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-all"
          >
            Keluar Sistem
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {activeNav === "dashboard" && <DashboardSection />}
        {activeNav === "laporan" && (
          <ComplaintsSection currentUser={currentUser} />
        )}
        {activeNav === "users" && <UsersSection currentUser={currentUser} />}
        {activeNav === "categories" && <CategoriesSection />}
        {activeNav === "issue-types" && <IssueTypesSection />}
      </main>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ════════════════════════════════════════════════════════════════════════════
function DashboardSection() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api("/api/superadmin/stats").then((d) => {
      if (d.success) setStats(d.data);
      setLoading(false);
    });
  }, []);
  if (loading) return <SectionLoader />;
  const s = stats?.summary || {};
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <SectionHeader
        title="Dashboard"
        sub="Ringkasan statistik Konekko Services"
      />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Laporan"
          value={s.totalComplaints}
          icon={<ClipboardList className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          label="Laporan Hari Ini"
          value={s.newToday}
          icon={<PlusCircle className="w-6 h-6" />}
          color="amber"
        />
        <StatCard
          label="Total User"
          value={s.totalUsers}
          icon={<Users className="w-6 h-6" />}
          color="violet"
        />
        <StatCard
          label="Rata-rata Selesai"
          value={s.avgResolutionHours ? `${s.avgResolutionHours}j` : "—"}
          icon={<Clock className="w-6 h-6" />}
          color="green"
          sub="jam per laporan"
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="text-[13px] font-bold text-slate-700 mb-4">
            Status Laporan
          </h3>
          <div className="space-y-2.5">
            {(stats?.statusStats || []).map((s) => (
              <div key={s.status} className="flex items-center gap-3">
                <span
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-full w-24 text-center ${
                    STATUS_COLORS[s.status] || "bg-gray-100 text-gray-600"
                  }`}
                >
                  {STATUS_LABELS[s.status] || s.status}
                </span>
                <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        (s.total / (stats?.summary?.totalComplaints || 1)) * 100
                      )}%`,
                    }}
                  />
                </div>
                <span className="text-[12px] font-bold text-slate-700 w-8 text-right">
                  {s.total}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="text-[13px] font-bold text-slate-700 mb-4">
            Laporan per Kategori
          </h3>
          <div className="space-y-3">
            {(stats?.categoryStats || []).map((c) => (
              <div key={c.code} className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ background: c.color_hex }}
                />
                <span className="text-[12px] text-slate-600 flex-1">
                  {c.name}
                </span>
                <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        (c.total / (stats?.summary?.totalComplaints || 1)) * 100
                      )}%`,
                      background: c.color_hex,
                    }}
                  />
                </div>
                <span className="text-[12px] font-bold text-slate-700 w-8 text-right">
                  {c.total}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h3 className="text-[13px] font-bold text-slate-700 mb-4">
          Distribusi User per Role
        </h3>
        <div className="flex gap-4 flex-wrap">
          {(stats?.userStats || []).map((u) => (
            <div
              key={u.role}
              className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3 border border-slate-200"
            >
              <span
                className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                  ROLE_COLORS[u.role] ||
                  "bg-gray-100 text-gray-600 border-gray-200"
                }`}
              >
                {u.role}
              </span>
              <div>
                <p className="text-[18px] font-bold text-slate-800 leading-tight">
                  {u.total}
                </p>
                <p className="text-[10px] text-slate-400">{u.active} aktif</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// LAPORAN — dengan fitur balas chat
// ════════════════════════════════════════════════════════════════════════════
function ComplaintsSection({ currentUser }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatus] = useState("");
  const [catFilter, setCat] = useState("");
  const [modal, setModal] = useState(null); // edit modal
  const [chatModal, setChatModal] = useState(null); // chat modal
  const [editForm, setEditForm] = useState({
    status: "",
    priority: "",
    assigned_to: "",
    note: "",
  });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const p = new URLSearchParams({ limit: "30" });
    if (statusFilter) p.set("status", statusFilter);
    if (catFilter) p.set("category", catFilter);
    if (search) p.set("search", search);
    const d = await api(`/api/superadmin/complaints?${p}`);
    if (d.success) {
      setComplaints(d.data);
      setTotal(d.total);
    }
    setLoading(false);
  }, [search, statusFilter, catFilter]);

  useEffect(() => {
    load();
  }, [load]);

  function openEdit(c) {
    setEditForm({
      status: c.status,
      priority: c.priority,
      assigned_to: c.assigned_to || "",
      note: "",
    });
    setModal(c);
  }

  async function handleSave() {
    setSaving(true);
    const res = await api(`/api/superadmin/complaints/${modal.id}`, {
      method: "PATCH",
      body: JSON.stringify(editForm),
    });
    if (res.success) {
      setModal(null);
      load();
    } else alert(res.error);
    setSaving(false);
  }

  async function handleDelete(c) {
    if (!confirm(`Hapus laporan "${c.ticket_number}"?`)) return;
    const res = await api(`/api/superadmin/complaints/${c.id}`, {
      method: "DELETE",
    });
    if (res.success) load();
    else alert(res.error);
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <SectionHeader title="Manajemen Laporan" sub={`${total} laporan`} />

      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 flex-1 min-w-48 focus-within:border-violet-400 transition-colors">
          <span className="text-slate-400 text-sm">🔍</span>
          <input
            className="flex-1 bg-transparent outline-none text-[12px] text-slate-700 placeholder:text-slate-400"
            placeholder="Cari tiket, judul, pelapor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-[12px] text-slate-700 outline-none focus:border-violet-400"
          value={statusFilter}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">Semua Status</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <select
          className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-[12px] text-slate-700 outline-none focus:border-violet-400"
          value={catFilter}
          onChange={(e) => setCat(e.target.value)}
        >
          <option value="">Semua Kategori</option>
          <option value="public">Fasilitas Publik</option>
          <option value="edu">EduReport</option>
          <option value="safe">Safe City</option>
        </select>
      </div>

      {loading ? (
        <TableLoader />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {[
                  "Tiket",
                  "Judul",
                  "Pelapor",
                  "Status",
                  "Prioritas",
                  "Aksi",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 font-semibold text-slate-500 text-[11px] uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {complaints.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
                >
                  <td className="px-4 py-3 font-mono font-semibold text-slate-600 text-[11px]">
                    {c.ticket_number}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-800 max-w-[200px] truncate">
                      {c.title}
                    </p>
                    <p className="text-slate-400 text-[11px] truncate max-w-[200px]">
                      📍 {c.location_address}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-700">
                      {c.reporter_name}
                    </p>
                    <p className="text-slate-400 text-[11px]">
                      {c.reporter_phone}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${
                        STATUS_COLORS[c.status]
                      }`}
                    >
                      {STATUS_LABELS[c.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${
                        PRIORITY_COLORS[c.priority]
                      }`}
                    >
                      {c.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setChatModal(c)}
                        className="px-3 py-1.5 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 text-[11px] font-semibold transition-colors"
                      >
                        💬 Balas
                      </button>
                      <button
                        onClick={() => openEdit(c)}
                        className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-semibold transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(c)}
                        className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-[11px] font-semibold transition-colors"
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {complaints.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-slate-400"
                  >
                    Tidak ada laporan ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Edit */}
      {modal && (
        <Modal
          title={`Edit Laporan: ${modal.ticket_number}`}
          onClose={() => setModal(null)}
        >
          <div className="mb-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-[12px] text-slate-600">
            <p className="font-semibold text-slate-800 mb-1">{modal.title}</p>
            <p>📍 {modal.location_address}</p>
            <p>
              👤 {modal.reporter_name} · {modal.reporter_phone}
            </p>
          </div>
          <Field label="Status" required>
            <select
              className={inputCls}
              value={editForm.status}
              onChange={(e) =>
                setEditForm((p) => ({ ...p, status: e.target.value }))
              }
            >
              {Object.entries(STATUS_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Prioritas">
            <select
              className={inputCls}
              value={editForm.priority}
              onChange={(e) =>
                setEditForm((p) => ({ ...p, priority: e.target.value }))
              }
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </Field>
          <Field label="Assign ke Petugas">
            <input
              className={inputCls}
              placeholder="Nama petugas"
              value={editForm.assigned_to}
              onChange={(e) =>
                setEditForm((p) => ({ ...p, assigned_to: e.target.value }))
              }
            />
          </Field>
          <Field label="Catatan Perubahan">
            <input
              className={inputCls}
              placeholder="Alasan perubahan status (opsional)"
              value={editForm.note}
              onChange={(e) =>
                setEditForm((p) => ({ ...p, note: e.target.value }))
              }
            />
          </Field>
          <div className="flex gap-3 mt-2">
            <button
              onClick={() => setModal(null)}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-[13px] font-semibold text-slate-600 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-[13px] font-semibold disabled:opacity-50"
            >
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </Modal>
      )}

      {/* Modal Chat */}
      {chatModal && (
        <ChatModal
          complaint={chatModal}
          currentUser={currentUser}
          onClose={() => {
            setChatModal(null);
            load();
          }}
        />
      )}
    </div>
  );
}

// ── Chat Modal ────────────────────────────────────────────────────────────────
function ChatModal({ complaint, currentUser, onClose }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    loadMessages();
  }, []);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  async function loadMessages() {
    setLoading(true);
    const d = await api(`/api/tickets/${complaint.ticket_number}`);
    if (d.success) setMessages(d.data.messages || []);
    setLoading(false);
  }

  async function handleSend() {
    if (!input.trim() || sending) return;
    const text = input.trim();
    setInput("");
    setSending(true);

    // Optimistic UI
    const tempMsg = {
      id: `temp-${Date.now()}`,
      sender_type: "agent",
      sender_name: currentUser.name,
      message: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      await api(`/api/tickets/${complaint.ticket_number}`, {
        method: "POST",
        body: JSON.stringify({
          senderType: "agent",
          senderName: currentUser.name,
          message: text,
        }),
      });
      // Reload untuk dapat ID yang benar dari DB
      await loadMessages();
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== tempMsg.id));
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const SENDER_STYLE = {
    user: {
      cls: "items-end",
      bubble: "bg-blue-600 text-white rounded-br-sm",
      label: "",
    },
    agent: {
      cls: "items-start",
      bubble: "bg-white border border-slate-200 text-slate-800 rounded-bl-sm",
      label: "",
    },
    system: {
      cls: "items-center",
      bubble: "bg-slate-100 text-slate-500 text-[11px] italic rounded-xl",
      label: "",
    },
  };

  const isClosed = ["resolved", "rejected", "closed"].includes(
    complaint.status
  );

  return (
    <Modal
      title={`💬 Chat — ${complaint.ticket_number}`}
      onClose={onClose}
      wide
    >
      {/* Info tiket */}
      <div className="mb-4 p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3 text-[12px]">
        <div className="flex-1">
          <p className="font-semibold text-slate-800">{complaint.title}</p>
          <p className="text-slate-500 mt-0.5">
            📍 {complaint.location_address} · 👤 {complaint.reporter_name} ·{" "}
            {complaint.reporter_phone}
          </p>
        </div>
        <span
          className={`text-[10px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${
            STATUS_COLORS[complaint.status]
          }`}
        >
          {STATUS_LABELS[complaint.status]}
        </span>
      </div>

      {/* Messages */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 h-80 overflow-y-auto p-4 flex flex-col gap-3 mb-4">
        {loading ? (
          <div className="flex-1 flex items-center justify-center text-slate-400 gap-2">
            <div className="w-4 h-4 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-[12px]">Memuat percakapan...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-slate-400 text-[12px]">
            Belum ada pesan.
          </div>
        ) : (
          messages.map((m) => {
            const s = SENDER_STYLE[m.sender_type] || SENDER_STYLE.agent;
            return (
              <div key={m.id} className={`flex flex-col gap-0.5 ${s.cls}`}>
                {m.sender_type !== "system" && (
                  <span className="text-[10px] text-slate-400 px-1">
                    {m.sender_name}
                  </span>
                )}
                <div
                  className={`max-w-[75%] px-3 py-2 rounded-2xl text-[12px] leading-relaxed ${s.bubble}`}
                >
                  {m.message}
                </div>
                <span className="text-[10px] text-slate-400 px-1">
                  {new Date(m.created_at).toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      {isClosed ? (
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3">
          <span className="text-slate-400">🔒</span>
          <p className="text-[12px] text-slate-500">
            Laporan ini sudah{" "}
            <strong>{STATUS_LABELS[complaint.status].toLowerCase()}</strong> —
            tidak dapat mengirim pesan baru.
          </p>
        </div>
      ) : (
        <div className="flex gap-2">
          <textarea
            className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-[13px] text-slate-800 outline-none focus:border-violet-400 transition-colors resize-none"
            placeholder="Ketik balasan sebagai Super Admin..."
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="px-5 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white text-[13px] font-semibold transition-colors disabled:opacity-40 disabled:cursor-default flex-shrink-0"
          >
            {sending ? "⏳" : "Kirim"}
          </button>
        </div>
      )}
      <p className="text-[10px] text-slate-400 mt-2">
        Enter untuk kirim · Shift+Enter baris baru
      </p>
    </Modal>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// USERS
// ════════════════════════════════════════════════════════════════════════════
function UsersSection({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [form, setForm] = useState({
    username: "",
    password: "",
    full_name: "",
    email: "",
    role: "admin",
    is_active: true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (roleFilter) params.set("role", roleFilter);
    const d = await api(`/api/superadmin/users?${params}`);
    if (d.success) setUsers(d.data);
    setLoading(false);
  }, [search, roleFilter]);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setForm({
      username: "",
      password: "",
      full_name: "",
      email: "",
      role: "admin",
      is_active: true,
    });
    setError("");
    setModal("create");
  }
  function openEdit(u) {
    setForm({
      full_name: u.full_name,
      email: u.email || "",
      role: u.role,
      is_active: !!u.is_active,
      password: "",
    });
    setError("");
    setModal(u);
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const res =
        modal === "create"
          ? await api("/api/superadmin/users", {
              method: "POST",
              body: JSON.stringify(form),
            })
          : await api(`/api/superadmin/users/${modal.id}`, {
              method: "PUT",
              body: JSON.stringify(form),
            });
      if (res.success) {
        setModal(null);
        load();
      } else setError(res.error || "Gagal menyimpan.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(u) {
    if (!confirm(`Hapus user "${u.username}"?`)) return;
    const res = await api(`/api/superadmin/users/${u.id}`, {
      method: "DELETE",
    });
    if (res.success) load();
    else alert(res.error);
  }

  async function toggleActive(u) {
    await api(`/api/superadmin/users/${u.id}`, {
      method: "PUT",
      body: JSON.stringify({ ...u, is_active: !u.is_active, password: "" }),
    });
    load();
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <SectionHeader
        title="Manajemen User"
        sub={`${users.length} user terdaftar`}
      >
        <button
          onClick={openCreate}
          className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-[12px] font-semibold transition-colors"
        >
          + Tambah User
        </button>
      </SectionHeader>

      <div className="flex gap-3 mb-4">
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 flex-1 max-w-xs focus-within:border-violet-400 transition-colors">
          <span className="text-slate-400 text-sm">🔍</span>
          <input
            className="flex-1 bg-transparent outline-none text-[12px] text-slate-700 placeholder:text-slate-400"
            placeholder="Cari username, nama, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-[12px] text-slate-700 outline-none focus:border-violet-400"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="">Semua Role</option>
          <option value="superadmin">Superadmin</option>
          <option value="admin">Admin</option>
          <option value="public">Public</option>
        </select>
      </div>

      {loading ? (
        <TableLoader />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {["User", "Email", "Role", "Status", "Dibuat", "Aksi"].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 font-semibold text-slate-500 text-[11px] uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                        {u.full_name?.[0] || "U"}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">
                          {u.full_name}
                        </p>
                        <p className="text-slate-400">@{u.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{u.email || "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${
                        ROLE_COLORS[u.role] ||
                        "bg-gray-100 text-gray-600 border-gray-200"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(u)}
                      className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border transition-colors
                        ${
                          u.is_active
                            ? "bg-green-50 text-green-700 border-green-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                            : "bg-red-50 text-red-600 border-red-200 hover:bg-green-50 hover:text-green-700 hover:border-green-200"
                        }`}
                    >
                      {u.is_active ? "Aktif" : "Nonaktif"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {new Date(u.created_at).toLocaleDateString("id-ID")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => openEdit(u)}
                        className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-semibold transition-colors"
                      >
                        Edit
                      </button>
                      {String(u.id) !== String(currentUser?.sub) && (
                        <button
                          onClick={() => handleDelete(u)}
                          className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-[11px] font-semibold transition-colors"
                        >
                          Hapus
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-slate-400"
                  >
                    Tidak ada user ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <Modal
          title={
            modal === "create"
              ? "Tambah User Baru"
              : `Edit User: ${modal.username}`
          }
          onClose={() => setModal(null)}
        >
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-[12px] text-red-600">
              {error}
            </div>
          )}
          {modal === "create" && (
            <Field label="Username" required>
              <input
                className={inputCls}
                placeholder="username"
                value={form.username}
                onChange={(e) =>
                  setForm((p) => ({ ...p, username: e.target.value }))
                }
              />
            </Field>
          )}
          <Field label="Nama Lengkap" required>
            <input
              className={inputCls}
              placeholder="Nama lengkap"
              value={form.full_name}
              onChange={(e) =>
                setForm((p) => ({ ...p, full_name: e.target.value }))
              }
            />
          </Field>
          <Field label="Email">
            <input
              className={inputCls}
              type="email"
              placeholder="email@konekko.id"
              value={form.email}
              onChange={(e) =>
                setForm((p) => ({ ...p, email: e.target.value }))
              }
            />
          </Field>
          <Field label="Role" required>
            <select
              className={inputCls}
              value={form.role}
              onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
            >
              <option value="superadmin">Superadmin</option>
              <option value="admin">Admin</option>
              <option value="public">Public</option>
            </select>
          </Field>
          <Field
            label={
              modal === "create"
                ? "Password"
                : "Password Baru (kosongkan jika tidak diubah)"
            }
            required={modal === "create"}
          >
            <input
              className={inputCls}
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) =>
                setForm((p) => ({ ...p, password: e.target.value }))
              }
            />
          </Field>
          {modal !== "create" && (
            <Field label="Status">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, is_active: e.target.checked }))
                  }
                  className="w-4 h-4 accent-violet-600"
                />
                <span className="text-[13px] text-slate-700">Akun aktif</span>
              </label>
            </Field>
          )}
          <div className="flex gap-3 mt-2">
            <button
              onClick={() => setModal(null)}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-[13px] font-semibold text-slate-600 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-[13px] font-semibold disabled:opacity-50"
            >
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// CATEGORIES
// ════════════════════════════════════════════════════════════════════════════
function CategoriesSection() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({
    code: "",
    name: "",
    description: "",
    icon: "",
    color_hex: "#2563eb",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    const d = await api("/api/superadmin/categories");
    if (d.success) setCategories(d.data);
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setForm({
      code: "",
      name: "",
      description: "",
      icon: "",
      color_hex: "#2563eb",
    });
    setError("");
    setModal("create");
  }
  function openEdit(cat) {
    setForm({
      name: cat.name,
      description: cat.description,
      icon: cat.icon,
      color_hex: cat.color_hex,
    });
    setError("");
    setModal(cat);
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const res =
        modal === "create"
          ? await api("/api/superadmin/categories", {
              method: "POST",
              body: JSON.stringify(form),
            })
          : await api(`/api/superadmin/categories/${modal.id}`, {
              method: "PUT",
              body: JSON.stringify(form),
            });
      if (res.success) {
        setModal(null);
        load();
      } else setError(res.error);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(cat) {
    if (!confirm(`Hapus kategori "${cat.name}"?`)) return;
    const res = await api(`/api/superadmin/categories/${cat.id}`, {
      method: "DELETE",
    });
    if (res.success) load();
    else alert(res.error);
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <SectionHeader
        title="Manajemen Kategori"
        sub={`${categories.length} kategori`}
      >
        <button
          onClick={openCreate}
          className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-[12px] font-semibold transition-colors"
        >
          + Tambah Kategori
        </button>
      </SectionHeader>

      {loading ? (
        <TableLoader />
      ) : (
        <div className="grid gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-slate-700 flex-shrink-0"
                style={{ background: cat.color_hex + "20", color: cat.color_hex }}
              >
                {cat.code === 'public' ? <Building2 className="w-6 h-6" /> :
                 cat.code === 'edu' ? <BookOpen className="w-6 h-6" /> :
                 cat.code === 'safe' ? <Shield className="w-6 h-6" /> :
                 <span className="text-2xl">{cat.icon}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[14px] font-bold text-slate-800">
                    {cat.name}
                  </span>
                  <span className="text-[10px] font-mono font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    {cat.code}
                  </span>
                  <div
                    className="w-4 h-4 rounded-full border border-slate-200"
                    style={{ background: cat.color_hex }}
                  />
                </div>
                <p className="text-[12px] text-slate-500 mb-1">
                  {cat.description}
                </p>
                <div className="flex gap-3 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1.5"><Tags className="w-3.5 h-3.5" /> {cat.issue_type_count} jenis masalah</span>
                  <span className="flex items-center gap-1.5"><ClipboardList className="w-3.5 h-3.5" /> {cat.complaint_count} laporan</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openEdit(cat)}
                  className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-semibold transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(cat)}
                  className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-[11px] font-semibold transition-colors"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <Modal
          title={modal === "create" ? "Tambah Kategori" : `Edit: ${modal.name}`}
          onClose={() => setModal(null)}
        >
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-[12px] text-red-600">
              {error}
            </div>
          )}
          {modal === "create" && (
            <Field label="Kode" required>
              <input
                className={inputCls}
                placeholder="public / edu / safe"
                value={form.code}
                onChange={(e) =>
                  setForm((p) => ({ ...p, code: e.target.value }))
                }
              />
            </Field>
          )}
          <Field label="Nama" required>
            <input
              className={inputCls}
              placeholder="Nama kategori"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            />
          </Field>
          <Field label="Deskripsi" required>
            <input
              className={inputCls}
              placeholder="Deskripsi singkat"
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
            />
          </Field>
          <Field label="Icon (emoji)" required>
            <input
              className={inputCls}
              placeholder="🏛️"
              value={form.icon}
              onChange={(e) => setForm((p) => ({ ...p, icon: e.target.value }))}
            />
          </Field>
          <Field label="Warna (hex)" required>
            <div className="flex gap-2">
              <input
                className={inputCls}
                placeholder="#2563eb"
                value={form.color_hex}
                onChange={(e) =>
                  setForm((p) => ({ ...p, color_hex: e.target.value }))
                }
              />
              <input
                type="color"
                value={form.color_hex}
                onChange={(e) =>
                  setForm((p) => ({ ...p, color_hex: e.target.value }))
                }
                className="w-12 h-10 rounded-xl border border-slate-200 cursor-pointer flex-shrink-0"
              />
            </div>
          </Field>
          <div className="flex gap-3 mt-2">
            <button
              onClick={() => setModal(null)}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-[13px] font-semibold text-slate-600 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-[13px] font-semibold disabled:opacity-50"
            >
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ISSUE TYPES
// ════════════════════════════════════════════════════════════════════════════
function IssueTypesSection() {
  const [types, setTypes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [catFilter, setCatFilter] = useState("");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({
    category_id: "",
    label: "",
    sort_order: 0,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const params = catFilter ? `?category_id=${catFilter}` : "";
    const [d, cats] = await Promise.all([
      api(`/api/superadmin/issue-types${params}`),
      api("/api/superadmin/categories"),
    ]);
    if (d.success) setTypes(d.data);
    if (cats.success) setCategories(cats.data);
    setLoading(false);
  }, [catFilter]);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setForm({ category_id: catFilter || "", label: "", sort_order: 0 });
    setError("");
    setModal("create");
  }
  function openEdit(t) {
    setForm({ label: t.label, sort_order: t.sort_order });
    setError("");
    setModal(t);
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const res =
        modal === "create"
          ? await api("/api/superadmin/issue-types", {
              method: "POST",
              body: JSON.stringify(form),
            })
          : await api(`/api/superadmin/issue-types/${modal.id}`, {
              method: "PUT",
              body: JSON.stringify(form),
            });
      if (res.success) {
        setModal(null);
        load();
      } else setError(res.error);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(t) {
    if (!confirm(`Hapus "${t.label}"?`)) return;
    const res = await api(`/api/superadmin/issue-types/${t.id}`, {
      method: "DELETE",
    });
    if (res.success) load();
    else alert(res.error);
  }

  const grouped = types.reduce((acc, t) => {
    if (!acc[t.category_id])
      acc[t.category_id] = {
        name: t.category_name,
        color: t.color_hex,
        items: [],
      };
    acc[t.category_id].items.push(t);
    return acc;
  }, {});

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <SectionHeader
        title="Manajemen Issue Types"
        sub={`${types.length} jenis masalah`}
      >
        <button
          onClick={openCreate}
          className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-[12px] font-semibold transition-colors"
        >
          + Tambah Issue Type
        </button>
      </SectionHeader>

      <div className="mb-4">
        <select
          className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-[12px] text-slate-700 outline-none focus:border-violet-400"
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
        >
          <option value="">Semua Kategori</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <TableLoader />
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([catId, group]) => (
            <div
              key={catId}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
            >
              <div
                className="px-5 py-3 border-b border-slate-100 flex items-center gap-2"
                style={{ borderLeftWidth: 4, borderLeftColor: group.color }}
              >
                <span className="text-[13px] font-bold text-slate-700">
                  {group.name}
                </span>
                <span className="text-[11px] text-slate-400">
                  {group.items.length} jenis
                </span>
              </div>
              <div className="divide-y divide-slate-50">
                {group.items.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors"
                  >
                    <span className="text-[11px] text-slate-400 w-6 text-right font-mono">
                      {t.sort_order}
                    </span>
                    <span className="flex-1 text-[13px] text-slate-700">
                      {t.label}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {t.complaint_count} laporan
                    </span>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => openEdit(t)}
                        className="px-3 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-semibold transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(t)}
                        className="px-3 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-[11px] font-semibold transition-colors"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <Modal
          title={
            modal === "create" ? "Tambah Issue Type" : `Edit: ${modal.label}`
          }
          onClose={() => setModal(null)}
        >
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-[12px] text-red-600">
              {error}
            </div>
          )}
          {modal === "create" && (
            <Field label="Kategori" required>
              <select
                className={inputCls}
                value={form.category_id}
                onChange={(e) =>
                  setForm((p) => ({ ...p, category_id: e.target.value }))
                }
              >
                <option value="">Pilih kategori...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
          )}
          <Field label="Label" required>
            <input
              className={inputCls}
              placeholder="Nama jenis masalah"
              value={form.label}
              onChange={(e) =>
                setForm((p) => ({ ...p, label: e.target.value }))
              }
            />
          </Field>
          <Field label="Urutan">
            <input
              className={inputCls}
              type="number"
              min="0"
              value={form.sort_order}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  sort_order: parseInt(e.target.value) || 0,
                }))
              }
            />
          </Field>
          <div className="flex gap-3 mt-2">
            <button
              onClick={() => setModal(null)}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-[13px] font-semibold text-slate-600 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-[13px] font-semibold disabled:opacity-50"
            >
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
