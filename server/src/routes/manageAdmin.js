import { Router } from 'express';
import db from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

const slugify = (s) => String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

// ---------- generic CRUD untuk tabel sederhana ----------
function crud(path, table, fields) {
  router.get(path, (req, res) => res.json(db.prepare(`SELECT * FROM ${table} ORDER BY sort_order, id`).all()));
  router.post(path, (req, res) => {
    const b = req.body || {};
    if (!String(b[fields[0]] || '').trim()) return res.status(400).json({ error: `${fields[0]} wajib diisi` });
    const data = fields.map(f => {
      if (b[f] !== undefined) return b[f];
      if (f === 'status') return 'active';
      if (f === 'sort_order') return 0;
      return null;
    });
    const cols = fields.join(',');
    const r = db.prepare(`INSERT INTO ${table} (${cols}) VALUES (${fields.map(() => '?').join(',')})`).run(...data);
    res.status(201).json({ id: r.lastInsertRowid });
  });
  router.put(`${path}/:id`, (req, res) => {
    const b = req.body || {};
    const row = db.prepare(`SELECT * FROM ${table} WHERE id=?`).get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Tidak ditemukan' });
    const data = fields.map(f => b[f] !== undefined ? b[f] : row[f]);
    db.prepare(`UPDATE ${table} SET ${fields.map(f => `${f}=?`).join(',')}, updated_at=datetime('now') WHERE id=?`).run(...data, req.params.id);
    res.json({ ok: true });
  });
  router.delete(`${path}/:id`, (req, res) => {
    db.prepare(`DELETE FROM ${table} WHERE id=?`).run(req.params.id);
    res.json({ ok: true });
  });
}

crud('/skills', 'skills', ['name', 'category', 'level', 'sort_order', 'status']);
crud('/services', 'services', ['title', 'description', 'sort_order', 'status']);

// categories butuh slug unik
router.get('/categories', (req, res) => res.json(db.prepare(`SELECT * FROM categories ORDER BY sort_order, id`).all()));
router.post('/categories', (req, res) => {
  const name = String(req.body?.name || '').trim();
  if (!name) return res.status(400).json({ error: 'Nama wajib diisi' });
  try {
    const r = db.prepare(`INSERT INTO categories (name, slug, sort_order) VALUES (?, ?, ?)`).run(name, slugify(name), Number(req.body?.sort_order) || 0);
    res.status(201).json({ id: r.lastInsertRowid });
  } catch { res.status(409).json({ error: 'Kategori sudah ada' }); }
});
router.put('/categories/:id', (req, res) => {
  const row = db.prepare(`SELECT * FROM categories WHERE id=?`).get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Tidak ditemukan' });
  const name = String(req.body?.name ?? row.name).trim();
  if (!name) return res.status(400).json({ error: 'Nama wajib diisi' });
  db.prepare(`UPDATE categories SET name=?, slug=?, sort_order=?, updated_at=datetime('now') WHERE id=?`).run(name, slugify(name), req.body?.sort_order !== undefined ? Number(req.body.sort_order) : row.sort_order, req.params.id);
  res.json({ ok: true });
});
router.delete('/categories/:id', (req, res) => {
  db.prepare(`DELETE FROM categories WHERE id=?`).run(req.params.id);
  res.json({ ok: true });
});

// profile (satu baris)
router.get('/profile', (req, res) => res.json(db.prepare(`SELECT * FROM profile LIMIT 1`).get()));
router.put('/profile', (req, res) => {
  const b = req.body || {};
  const row = db.prepare(`SELECT * FROM profile LIMIT 1`).get();
  const fields = ['name','headline','bio','short_bio','experience','email','whatsapp','linkedin','github','website','location','availability'];
  db.prepare(`UPDATE profile SET ${fields.map(f => `${f}=?`).join(',')}, updated_at=datetime('now') WHERE id=1`).run(...fields.map(f => b[f] !== undefined ? b[f] : row[f]));
  res.json({ ok: true });
});

// site settings (satu baris)
router.get('/settings', (req, res) => res.json(db.prepare(`SELECT * FROM site_settings LIMIT 1`).get()));
router.put('/settings', (req, res) => {
  const b = req.body || {};
  const row = db.prepare(`SELECT * FROM site_settings LIMIT 1`).get();
  const fields = ['site_title','site_description','primary_color','accent_color','theme','hero_headline','hero_subheadline','hero_cta_primary','hero_cta_secondary','social_links','contact_info'];
  db.prepare(`UPDATE site_settings SET ${fields.map(f => `${f}=?`).join(',')}, updated_at=datetime('now') WHERE id=1`).run(...fields.map(f => b[f] !== undefined ? b[f] : row[f]));
  res.json({ ok: true });
});

export default router;
