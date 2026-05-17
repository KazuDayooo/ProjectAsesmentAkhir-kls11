# Konekko Services — Portal Pengaduan Masyarakat
> Next.js + MySQL (konekko_services)

## Stack
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Database**: MySQL via `mysql2`
- **DB Name**: `konekko_services`

---

## Struktur Proyek

```
konekko-services/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── pengaduan/
│   │   │   │   └── route.js          # GET & POST laporan
│   │   │   └── tickets/
│   │   │       └── [ticket]/
│   │   │           └── route.js      # GET, POST, PATCH tiket
│   │   ├── pengaduan/
│   │   │   └── page.js               # Halaman utama chat
│   │   ├── globals.css
│   │   ├── layout.js
│   │   └── page.js                   # Redirect ke /pengaduan
│   ├── components/
│   │   ├── ChatHeader.js
│   │   ├── InputBar.js
│   │   ├── MessageList.js
│   │   ├── ReportForm.js
│   │   └── Sidebar.js
│   └── lib/
│       └── db.js                     # MySQL connection pool
├── public/
├── database.sql                      # Schema + sample data
├── .env.local.example
├── .gitignore
├── jsconfig.json
├── next.config.mjs
├── package.json
├── postcss.config.mjs
└── tailwind.config.mjs
```

---

## Setup Cepat

### 1. Install dependencies
```bash
npm install
# Termasuk: next, react, mysql2, jose, bcryptjs, tailwindcss
```

### 2. Buat database di MySQL Workbench
Buka MySQL Workbench → buka file `database.sql` → jalankan semua query.
```
File > Open SQL Script > database.sql > Run (⚡)
```

### 3. Konfigurasi environment
```bash
cp .env.local.example .env.local
# Edit .env.local → isi DB_PASSWORD sesuai MySQL kamu
```

### 4. Jalankan dev server
```bash
npm run dev
```
Buka http://localhost:3000/pengaduan

---

## API Endpoints

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| POST | `/api/auth/login` | ❌ | Login, dapat JWT token |
| POST | `/api/auth/logout` | ❌ | Logout, hapus cookie |
| GET | `/api/auth/me` | ✅ | Info user yang login |
| GET | `/api/pengaduan` | ✅ | Daftar laporan |
| POST | `/api/pengaduan` | ✅ | Buat laporan baru |
| GET | `/api/tickets/:ticket` | ✅ | Detail tiket + chat |
| POST | `/api/tickets/:ticket` | ✅ | Kirim pesan ke tiket |
| PATCH | `/api/tickets/:ticket` | ✅ admin/agent | Update status tiket |

---

## Kategori Pengaduan

| Kode | Nama | Prefix Tiket |
|------|------|-------------|
| `public` | Public Facility Report | `PF-` |
| `edu` | EduReport | `EDU-` |
| `safe` | Safe City | `SC-` |
