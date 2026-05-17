"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import { Building2, BookOpen, Shield } from "lucide-react";

const FEATURES = [
  {
    icon: <Building2 className="w-7 h-7" strokeWidth={1.5} />,
    title: "Fasilitas Publik",
    desc: "Laporkan kerusakan jalan, fasilitas umum, dan infrastruktur kota secara langsung.",
    color: "from-blue-500/10 to-blue-600/5 border-blue-200",
    iconBg: "bg-gradient-to-br from-blue-500 to-blue-600",
    textColor: "text-blue-600",
  },
  {
    icon: <BookOpen className="w-7 h-7" strokeWidth={1.5} />,
    title: "EduReport",
    desc: "Sampaikan masalah pendidikan, fasilitas sekolah, dan lingkungan belajar di sekitar Anda.",
    color: "from-amber-500/10 to-amber-600/5 border-amber-200",
    iconBg: "bg-gradient-to-br from-amber-500 to-amber-600",
    textColor: "text-amber-600",
  },
  {
    icon: <Shield className="w-7 h-7" strokeWidth={1.5} />,
    title: "Safe City",
    desc: "Laporkan gangguan keamanan, ketertiban umum, dan ciptakan lingkungan yang aman.",
    color: "from-emerald-500/10 to-emerald-600/5 border-emerald-200",
    iconBg: "bg-gradient-to-br from-emerald-500 to-emerald-600",
    textColor: "text-emerald-600",
  },
];

const STEPS = [
  {
    num: "1",
    title: "Pilih Kategori",
    desc: "Tentukan jenis pengaduan sesuai masalah yang Anda hadapi.",
  },
  {
    num: "2",
    title: "Isi Laporan",
    desc: "Lengkapi detail kejadian, lokasi, dan lampirkan bukti foto.",
  },
  {
    num: "3",
    title: "Pantau Status",
    desc: "Terima nomor tiket dan pantau progres penanganan secara transparan.",
  },
];

export default function LandingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
      router.replace("/home");
    } else {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 selection:bg-blue-200 overflow-x-hidden transition-colors duration-300">
      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-full h-[600px] overflow-hidden -z-10">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-blue-400/20 rounded-full blur-[100px]" />
        <div className="absolute top-40 -left-20 w-[400px] h-[400px] bg-violet-400/20 rounded-full blur-[100px]" />
      </div>

      {/* Navbar */}
      <nav className="glass sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-5 h-[70px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/30">
              K
            </div>
            <span className="font-bold text-slate-800 dark:text-white text-[17px] tracking-tight">
              Konekko<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600"> Services</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/login" className="px-5 py-2.5 rounded-xl text-[14px] font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50 dark:text-slate-300 dark:hover:text-blue-400 dark:hover:bg-blue-900/30 transition-all">
              Masuk
            </Link>
            <Link href="/register" className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[14px] font-bold shadow-md dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 transition-all hidden sm:block">
              Daftar Sekarang
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative max-w-6xl mx-auto px-5 pt-24 pb-32 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 border border-white shadow-sm backdrop-blur-md mb-8">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
          </span>
          <span className="text-[12px] font-bold tracking-wide text-slate-600">PORTAL PENGADUAN MASYARAKAT 2.0</span>
        </div>
        
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-slate-900 dark:text-white leading-tight mb-6 tracking-tight">
          Suara Anda,<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-violet-600 to-blue-600 bg-300% animate-gradient">Perubahan Nyata.</span>
        </h1>
        
        <p className="text-[16px] sm:text-[18px] text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          Konekko Services adalah platform modern yang menghubungkan warga dengan instansi terkait secara cepat, transparan, dan terukur.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/register" className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-[15px] font-bold shadow-xl shadow-blue-600/20 hover:shadow-blue-600/40 transition-all hover:-translate-y-0.5">
            Mulai Buat Laporan
          </Link>
          <Link href="/login" className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 text-[15px] font-bold shadow-sm border border-slate-200 transition-all">
            Lihat Status Laporan
          </Link>
        </div>
      </section>

      {/* Stats Mini */}
      <section className="max-w-5xl mx-auto px-5 mb-24">
        <div className="glass rounded-3xl p-8 grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-slate-200/50 dark:divide-slate-700/50">
          <div className="text-center">
            <p className="text-3xl font-extrabold text-slate-800 dark:text-white">10k+</p>
            <p className="text-[12px] font-medium text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wide">Pengguna Aktif</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-extrabold text-slate-800 dark:text-white">95%</p>
            <p className="text-[12px] font-medium text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wide">Tingkat Resolusi</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-extrabold text-slate-800 dark:text-white">24/7</p>
            <p className="text-[12px] font-medium text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wide">Layanan Aktif</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-extrabold text-slate-800 dark:text-white">3</p>
            <p className="text-[12px] font-medium text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wide">Kategori Utama</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-white dark:bg-slate-900 relative transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">Solusi Untuk Setiap Masalah</h2>
            <p className="text-[15px] text-slate-500 dark:text-slate-400">Pilih kategori yang sesuai agar laporan Anda dapat ditangani oleh instansi yang tepat dengan cepat.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <div key={i} className={`group p-8 rounded-3xl bg-gradient-to-br ${f.color} border hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
                <div className={`w-14 h-14 rounded-2xl ${f.iconBg} flex items-center justify-center text-2xl text-white mb-6 shadow-md`}>
                  {f.icon}
                </div>
                <h3 className={`text-[18px] font-bold mb-3 ${f.textColor}`}>{f.title}</h3>
                <p className="text-[14px] text-slate-600 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-5 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">Proses Transparan & Mudah</h2>
            <p className="text-[15px] text-slate-500">Dari pelaporan hingga penyelesaian, semuanya dapat Anda pantau langsung dari genggaman.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-blue-200 via-violet-200 to-blue-200 z-0"></div>
            
            {STEPS.map((s, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-white rounded-full border-4 border-slate-50 shadow-xl flex items-center justify-center mb-6 relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 text-white font-black text-xl flex items-center justify-center">
                    {s.num}
                  </div>
                </div>
                <h3 className="text-[18px] font-bold text-slate-900 mb-2">{s.title}</h3>
                <p className="text-[14px] text-slate-500 max-w-xs">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-5">
        <div className="max-w-5xl mx-auto bg-slate-900 rounded-[2.5rem] p-10 md:p-16 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/30 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-violet-600/30 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3"></div>
          
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6">Siap Membuat Perubahan?</h2>
            <p className="text-[16px] text-slate-300 max-w-xl mx-auto mb-10">
              Bergabunglah dengan ribuan warga lainnya yang telah menggunakan Konekko Services untuk membangun lingkungan yang lebih baik.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/register" className="px-8 py-4 rounded-xl bg-white text-slate-900 text-[15px] font-bold shadow-lg hover:bg-slate-100 transition-all hover:scale-105">
                Buat Akun Gratis
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white pt-16 pb-8">
        <div className="max-w-6xl mx-auto px-5 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white font-bold text-sm">
              K
            </div>
            <span className="text-[15px] font-bold text-slate-800">Konekko Services</span>
          </div>
          <p className="text-[13px] text-slate-400 font-medium">
            © {new Date().getFullYear()} Konekko Services. Hak Cipta Dilindungi.
          </p>
        </div>
      </footer>
    </div>
  );
}
