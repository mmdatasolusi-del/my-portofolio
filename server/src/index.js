import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import helmet from 'helmet';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import authRoutes from './routes/auth.js';
import adminApi from './routes/adminApi.js';
import projectsAdmin from './routes/projectsAdmin.js';
import manageAdmin from './routes/manageAdmin.js';
import { requireAuth } from './middleware/auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../..');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet({ contentSecurityPolicy: false })); // CSP diaktifkan setelah semua aset siap
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-only-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 8 // 8 jam
  }
}));

// Auth routes (login/logout)
app.use('/admin', authRoutes);

// Protected admin pages
const pages = ['projects', 'categories', 'skills', 'services', 'profile', 'settings'];
app.get('/admin', requireAuth, (req, res) => res.sendFile(path.join(root, 'admin', 'dashboard.html')));
for (const p of pages) {
  app.get(`/admin/${p}`, requireAuth, (req, res) => res.sendFile(path.join(root, 'admin', `${p}.html`)));
}
app.use('/api/admin', adminApi);
app.use('/api/admin/projects', projectsAdmin);
app.use('/api/admin', manageAdmin);
app.get('/admin/projects/new', requireAuth, (req, res) => res.sendFile(path.join(root, 'admin', 'project-form.html')));
app.get('/admin/projects/edit/:id', requireAuth, (req, res) => res.sendFile(path.join(root, 'admin', 'project-form.html')));

// Static files
app.use(express.static(path.join(root, 'public')));
app.use('/admin', express.static(path.join(root, 'admin'), { index: false, redirect: false }));
app.use('/uploads', express.static(path.join(root, 'uploads')));

// Placeholder routes — akan diisi di fase berikutnya
app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);
  res.status(500).json({ error: 'Terjadi kesalahan server. Coba lagi.' });
});

app.use((req, res) => res.status(404).send('Halaman tidak ditemukan.'));

app.listen(PORT, () => console.log(`Server berjalan di http://localhost:${PORT}`));
