"use client";
// src/app/login/page.js

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/home";

  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem("token", data.token);
        const role = data.user.role;
        if (role === "superadmin") {
          router.push("/superadmin");
        } else if (role === "admin") {
          router.push("/admin");
        } else {
          router.push(redirect);
        }
      }
    } catch {
      setError("Gagal terhubung ke server.");
    } finally {
      setLoading(false);
    }

  
  }

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-slate-950 flex items-center justify-center px-4 transition-colors duration-300 relative">
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
          <h1 className="text-[18px] font-bold text-slate-800 dark:text-white mb-1">Masuk</h1>
          <p className="text-[13px] text-slate-400 mb-6">
            Portal Pengaduan Masyarakat
          </p>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-[13px] text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
                  setForm((p) => ({ ...p, username: e.target.value }))
                }
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-[13px] text-slate-800 dark:text-slate-200 outline-none focus:border-blue-400 dark:focus:border-blue-500 transition-colors bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900"
                placeholder="Masukkan username"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={form.password}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, password: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 pr-10 rounded-xl border border-slate-200 dark:border-slate-700 text-[13px] text-slate-800 dark:text-slate-200 outline-none focus:border-blue-400 dark:focus:border-blue-500 transition-colors bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900"
                  placeholder="Masukkan password"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold transition-colors disabled:opacity-50 disabled:cursor-default mt-2"
            >
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </form>

          {/* Link ke register */}
          <p className="text-center text-[12px] text-slate-400 mt-5">
            Belum punya akun?{" "}
            <a
              href="/register"
              className="text-blue-600 font-semibold hover:underline"
            >
              Daftar di sini
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
