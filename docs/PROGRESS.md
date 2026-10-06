# PROGRESS — Status Fase

Terakhir diupdate: 2026-10-06 (sesi audit + dokumentasi)

## Status ringkas
- ✅ Fase 1 — Audit project
- ✅ Fase 2 — Architecture (didokumentasikan di sesi audit)
- ✅ Fase 3 — Database schema + seed
- ✅ Fase 4 — Authentication
- ✅ Fase 5 — Admin Dashboard
- ✅ Fase 6 — Portfolio CRUD
- ✅ Fase 7 — Profile/Skills/Services/Categories/Settings management
- ⬜ Fase 8 — Public Website (UI)
- ⬜ Fase 9 — Hubungkan public website ke database (`/api/public/*`)
- ⬜ Fase 10 — Image upload (multer), preview project, testing, README, security audit

## Catatan keputusan
- Stack dipertahankan: Express + SQLite + HTML/CSS/JS murni.
- `docs/` akan dipakai untuk dokumentasi tambahan.
- Bug list dari audit ada di `AGENTS.md` — kerjakan fix-nya sebelum/bersamaan Fase 8.

## Todo sebelum/bersamaan Fase 8
- [ ] Fix `requireAuth` (pakai `req.originalUrl`)
- [ ] Ganti session store ke SQLite
- [ ] Cookie `secure` + `trust proxy` (conditional production)
- [ ] Mulai aktifkan CSP setelah aset publik jadi
- [ ] Upgrade multer ke 2.x saat Fase 10

## Cara melanjutkan di sesi baru
1. Buka opencode di folder project ini.
2. Ketik: "Baca AGENTS.md dan docs/PROGRESS.md, lalu lanjutkan fase berikutnya."
3. Atau jalankan `opencode --continue` untuk melanjutkan sesi terakhir.
