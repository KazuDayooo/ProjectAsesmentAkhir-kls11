# CLAUDE.md — Konekko Services

## Project
Konekko Services — Portal Pengaduan Masyarakat
Next.js 14 + Tailwind CSS + MySQL

## Commands
```bash
npm run dev      # dev server → http://localhost:3000
npm run build    # production build
npm run start    # production server
npm run lint     # eslint
```

## Database
- Name: `konekko_services`
- Setup: jalankan `database.sql` di MySQL Workbench
- Config: `.env.local` (copy dari `.env.local.example`)

## Path Alias
`@/*` → `./src/*`

## Notes
- Selalu gunakan `'use client'` di components yang pakai hooks
- API routes ada di `src/app/api/`
- DB connection pool di `src/lib/db.js`
