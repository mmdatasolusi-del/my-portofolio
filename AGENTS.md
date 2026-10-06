# AGENTS.md — Instruksi untuk AI Assistant

Baca file ini di awal setiap sesi baru, lalu lanjutkan pekerjaan dari fase yang belum selesai (lihat `docs/PROGRESS.md`).

## Project
Personal Portfolio Management Website (CMS sederhana) — public site + admin panel.

## Stack (JANGAN diganti tanpa alasan kuat)
- Backend: Node.js + Express 4, ES modules (`"type": "module"`)
- Database: SQLite via `node:sqlite` (`server/src/db.js`, WAL, FK ON)
- Auth: express-session + bcryptjs
- Frontend: HTML/CSS/JS statis (public/ dan admin/), tanpa framework
- Upload: multer (belum diimplementasikan)

## Struktur
```text
server/src/index.js      entry point
server/src/db.js         koneksi DB
server/src/schema.js     schema SQL
server/src/seed.js       seed data
server/src/reset-db.js   reset DB
server/src/middleware/   auth middleware
server/src/routes/       auth, adminApi, projectsAdmin, manageAdmin
admin/                   halaman admin statis
public/                  website publik
data/portfolio.db        database (gitignored)
uploads/                 file upload (gitignored)
```

## Aturan
- Semua konten website berasal dari database, bukan hard-code HTML.
- Public hanya menampilkan `status='published' AND deleted_at IS NULL`.
- Semua query pakai parameterized statements.
- Output ke HTML harus di-escape (ada helper `esc()`).
- Jangan over-engineer: tanpa microservices, Docker, Redis, GraphQL, dsb.
- Tanpa klaim berlebihan pada konten (bukan "Senior Dev"/"Data Scientist").
- Jangan mengubah stack/teknologi tanpa persetujuan user.
- Setelah tiap tahap besar, laporkan: apa yang dikerjakan, file berubah, cara menjalankan, cara testing, dan cara kirim error.

## Cara menjalankan
```bash
npm install
npm run seed   # pertama kali
npm run dev    # http://localhost:3000
```

## Bug/issue yang sudah diketahui (dari audit)
1. `middleware/auth.js` — cek `req.path.startsWith('/api/')` tidak efektif di router; pakai `req.originalUrl`.
2. Session store masih MemoryStore — ganti ke SQLite/tabel sessions.
3. Cookie belum `secure`; belum `trust proxy`.
4. CSP dinonaktifkan di helmet.
5. multer 1.x (CVE) — upgrade ke 2.x saat upload dibuat.
6. DELETE pada skills/services/categories selalu `{ok:true}` walau row tidak ada.
7. Fallback password `admin123` di seed.js — hanya untuk dev.
