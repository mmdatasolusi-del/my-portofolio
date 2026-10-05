import { Router } from 'express';
import bcrypt from 'bcryptjs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import db from '../db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = Router();

// Rate limit sederhana per IP: maks 10 percobaan gagal, kunci 5 menit
const attempts = new Map();
function isLocked(ip) {
  const a = attempts.get(ip);
  if (!a) return false;
  if (a.count >= 10 && Date.now() - a.last < 5 * 60 * 1000) return true;
  if (Date.now() - a.last >= 5 * 60 * 1000) attempts.delete(ip);
  return false;
}
function recordFail(ip) {
  const a = attempts.get(ip) || { count: 0, last: 0 };
  a.count += 1; a.last = Date.now();
  attempts.set(ip, a);
}

router.get('/login', (req, res) => {
  if (req.session?.userId) return res.redirect('/admin');
  res.sendFile(path.resolve(__dirname, '../../../admin/login.html'));
});

router.post('/login', (req, res) => {
  const ip = req.ip;
  if (isLocked(ip)) {
    return res.status(429).send('Terlalu banyak percobaan login. Coba lagi dalam 5 menit.');
  }
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).send('Username dan password wajib diisi.');
  }
  const user = db.prepare(`SELECT * FROM users WHERE username = ? AND status = 'active'`).get(String(username).trim());
  if (!user || !bcrypt.compareSync(String(password), user.password_hash)) {
    recordFail(ip);
    return res.status(401).send('Username atau password salah.');
  }
  attempts.delete(ip);
  req.session.regenerate((err) => {
    if (err) return res.status(500).send('Terjadi kesalahan. Coba lagi.');
    req.session.userId = user.id;
    req.session.role = user.role;
    db.prepare(`UPDATE users SET last_login = datetime('now') WHERE id = ?`).run(user.id);
    res.redirect('/admin');
  });
});

function logout(req, res) {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.redirect('/admin/login');
  });
}
router.get('/logout', logout);
router.post('/logout', logout);

export default router;
