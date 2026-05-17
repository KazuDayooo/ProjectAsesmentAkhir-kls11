"use client";
// src/app/admin/users/page.js
// Kelola user — khusus admin

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";

const ROLE_BADGE = {
  admin: "bg-violet-100 text-violet-700",
  agent: "bg-blue-100 text-blue-700",
  public: "bg-slate-100 text-slate-600",
};

export default function UsersPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    username: "",
    fullName: "",
    password: "",
    role: "agent",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.role !== "admin") {
        router.push("/admin");
        return;
      }
      setUser(payload);
    } catch {
      router.push("/login");
      return;
    }
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setUsers(data.data);
    } catch {}
    setLoading(false);
  }

  async function handleAddUser() {
    setError("");
    if (!form.username || !form.fullName || !form.password) {
      setError("Semua field wajib diisi.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        setForm({ username: "", fullName: "", password: "", role: "agent" });
        fetchUsers();
      } else {
        setError(data.error || "Gagal menambah user.");
      }
    } catch {
      setError("Gagal terhubung ke server.");
    }
    setSaving(false);
  }

  async function handleToggleActive(userId, isActive) {
    try {
      const token = localStorage.getItem("token");
      await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !isActive }),
      });
      fetchUsers();
    } catch {}
  }

  function set(field, val) {
    setForm((p) => ({ ...p, [field]: val }));
  }

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      <AdminSidebar active="users" user={user} />

      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-[20px] font-bold text-slate-800">
              Kelola User
            </h1>
            <p className="text-[13px] text-slate-400">
              {users.length} user terdaftar
            </p>
          </div>
          <button
            onClick={() => {
              setShowModal(true);
              setError("");
            }}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold transition flex items-center gap-2"
          >
            ＋ Tambah User
          </button>
        </div>

        {/* Tabel user */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {[
                  "Username",
                  "Nama Lengkap",
                  "Role",
                  "Status",
                  "Bergabung",
                  "Aksi",
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
                ? [...Array(4)].map((_, i) => (
                    <tr key={i}>
                      {[...Array(6)].map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 bg-slate-100 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                : users.map((u) => (
                    <tr
                      key={u.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-[13px] font-mono font-semibold text-slate-700">
                        {u.username}
                      </td>
                      <td className="px-4 py-3 text-[13px] text-slate-700">
                        {u.full_name}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize ${
                            ROLE_BADGE[u.role]
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                            u.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {u.is_active ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[12px] text-slate-400">
                        {new Date(u.created_at).toLocaleDateString("id-ID")}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleActive(u.id, u.is_active)}
                          disabled={String(u.id) === user?.sub}
                          className={`text-[11px] font-semibold px-3 py-1.5 rounded-lg border transition disabled:opacity-30 disabled:cursor-default
                        ${
                          u.is_active
                            ? "border-red-200 text-red-600 hover:bg-red-50"
                            : "border-green-200 text-green-600 hover:bg-green-50"
                        }`}
                        >
                          {u.is_active ? "Nonaktifkan" : "Aktifkan"}
                        </button>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal Tambah User */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[16px] font-bold text-slate-800">
                Tambah User Baru
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="mb-4 px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-[12px] text-red-600">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Nama Lengkap
                </label>
                <input
                  value={form.fullName}
                  onChange={(e) => set("fullName", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-[13px] outline-none focus:border-blue-400"
                  placeholder="Nama lengkap"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Username
                </label>
                <input
                  value={form.username}
                  onChange={(e) =>
                    set(
                      "username",
                      e.target.value.toLowerCase().replace(/\s/g, "")
                    )
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-[13px] outline-none focus:border-blue-400"
                  placeholder="username"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-[13px] outline-none focus:border-blue-400"
                  placeholder="Minimal 8 karakter"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Role
                </label>
                <select
                  value={form.role}
                  onChange={(e) => set("role", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-[13px] outline-none focus:border-blue-400"
                >
                  <option value="agent">Agent (Petugas)</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-[13px] font-semibold text-slate-500 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                onClick={handleAddUser}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold transition disabled:opacity-50"
              >
                {saving ? "Menyimpan..." : "Tambah User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
