"use client";
// src/app/register/page.js

import { useState } from "react";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import { Eye, EyeOff, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    username: "",
    fullName: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPass, setShowPass] = useState(false);

  function set(field, val) {
    setForm((p) => ({ ...p, [field]: val }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.password !== form.confirmPassword) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          fullName: form.fullName,
          password: form.password,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setSuccess("Akun berhasil dibuat! Mengalihkan ke halaman login...");
        setTimeout(() => router.push("/login"), 2000);
      } else {
        setError(data.error || "Registrasi gagal.");
      }
    } catch {
      setError("Gagal terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-slate-950 flex items-center justify-center px-4 py-10 transition-colors duration-300 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white font-bold">
            K
          </div>
          <span className="font-bold text-slate-800 dark:text-white text-lg">
            Konekko<span className="text-blue-600"> Services</span>
          </span>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 transition-colors duration-300">
          <h1 className="text-[18px] font-bold text-slate-800 dark:text-white mb-1">
            Daftar Akun
          </h1>
          <p className="text-[13px] text-slate-400 mb-6">
            Portal Pengaduan Masyarakat
          </p>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-[13px] text-red-600">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-[13px] text-green-600 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nama Lengkap */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                Nama Lengkap
              </label>
              <input
                type="text"
                required
                autoComplete="name"
                value={form.fullName}
                onChange={(e) => set("fullName", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-[13px] text-slate-800 dark:text-slate-200 outline-none focus:border-blue-400 dark:focus:border-blue-500 transition-colors bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900"
                placeholder="Nama lengkap Anda"
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                Username
              </label>
              <input
                type="text"
                required
                autoComplete="username"
                value={form.username}
                onChange={(e) =>
                  set(
                    "username",
                    e.target.value.toLowerCase().replace(/\s/g, "")
                  )
                }
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-[13px] text-slate-800 dark:text-slate-200 outline-none focus:border-blue-400 dark:focus:border-blue-500 transition-colors bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900"
                placeholder="Buat username unik"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  className="w-full px-4 py-2.5 pr-10 rounded-xl border border-slate-200 dark:border-slate-700 text-[13px] text-slate-800 dark:text-slate-200 outline-none focus:border-blue-400 dark:focus:border-blue-500 transition-colors bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900"
                  placeholder="Minimal 8 karakter"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Konfirmasi Password */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                Konfirmasi Password
              </label>
              <input
                type={showPass ? "text" : "password"}
                required
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={(e) => set("confirmPassword", e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl border text-[13px] text-slate-800 dark:text-slate-200 outline-none transition-colors bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 ${
                  form.confirmPassword && form.password !== form.confirmPassword
                    ? "border-red-300 dark:border-red-500 focus:border-red-400 dark:focus:border-red-400"
                    : "border-slate-200 dark:border-slate-700 focus:border-blue-400 dark:focus:border-blue-500"
                }`}
                placeholder="Ulangi password"
              />
              {form.confirmPassword &&
                form.password !== form.confirmPassword && (
                  <p className="text-[11px] text-red-500 mt-1">
                    Password tidak cocok.
                  </p>
                )}
            </div>

            <button
              type="submit"
              disabled={loading || !!success}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold transition-colors disabled:opacity-50 disabled:cursor-default mt-2"
            >
              {loading ? "Memproses..." : "Daftar Sekarang"}
            </button>
          </form>

          {/* Link ke login */}
          <p className="text-center text-[12px] text-slate-400 mt-5">
            Sudah punya akun?{" "}
            <a
              href="/login"
              className="text-blue-600 font-semibold hover:underline"
            >
              Masuk di sini
            </a>
          </p>
        </div>

        <p className="text-center text-[11px] text-slate-400 mt-4">
          Konekko Services © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
