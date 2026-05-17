# AGENTS.md — Konekko Services

## Project Overview
Konekko Services adalah portal pengaduan masyarakat berbasis chat yang dibangun dengan Next.js 14 (App Router) dan MySQL.

## Architecture
- **Frontend**: React (Next.js App Router, client components)
- **Backend**: Next.js API Routes (`src/app/api/`)
- **Database**: MySQL via `mysql2` connection pool (`src/lib/db.js`)
- **Styling**: Tailwind CSS

## Key Files
- `src/app/pengaduan/page.js` — main chat UI, state management
- `src/components/Sidebar.js` — kategori & laporan terbaru
- `src/components/ChatHeader.js` — header dengan info agen
- `src/components/MessageList.js` — render pesan chat
- `src/components/InputBar.js` — input & quick replies
- `src/components/ReportForm.js` — form pengaduan
- `src/lib/db.js` — MySQL pool singleton
- `src/app/api/pengaduan/route.js` — CRUD laporan
- `src/app/api/tickets/[ticket]/route.js` — tiket & pesan

## Naming Conventions
- Database: `konekko_services`
- Components: PascalCase
- API routes: kebab-case path
- DB columns: snake_case
