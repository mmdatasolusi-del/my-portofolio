import { Router } from 'express';
import db from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

const slugify = (s) => String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

function uniqueSlug(base, excludeId = null) {
  const query = excludeId
    ? db.prepare(`SELECT id FROM projects WHERE slug=? AND id<>?`)
    : db.prepare(`SELECT id FROM projects WHERE slug=?`);
  let slug = base || 'project';
  let i = 2;
  while (excludeId ? query.get(slug, excludeId) : query.get(slug)) slug = `${base}-${i++}`;
  return slug;
}

function setTechnologies(projectId, techs) {
  db.prepare(`DELETE FROM project_technologies WHERE project_id=?`).run(projectId);
  for (const name of techs) {
    const n = String(name).trim();
    if (!n) continue;
    db.prepare(`INSERT OR IGNORE INTO technologies (name) VALUES (?)`).run(n);
    const t = db.prepare(`SELECT id FROM technologies WHERE name=?`).get(n);
    db.prepare(`INSERT OR IGNORE INTO project_technologies (project_id, technology_id) VALUES (?, ?)`).run(projectId, t.id);
  }
}

function technologiesOf(projectId) {
  return db.prepare(`SELECT t.name FROM technologies t JOIN project_technologies pt ON pt.technology_id=t.id WHERE pt.project_id=? ORDER BY t.name`).all(projectId).map(r => r.name);
}

function readBody(req) {
  const b = req.body || {};
  return {
    title: String(b.title || '').trim(),
    slug: b.slug ? slugify(b.slug) : slugify(b.title || ''),
    short_description: b.short_description || '',
    full_description: b.full_description || '',
    problem: b.problem || '',
    solution: b.solution || '',
    features: b.features || '',
    result: b.result || '',
    category_id: b.category_id ? Number(b.category_id) : null,
    client_type: b.client_type || '',
    project_date: b.project_date || '',
    demo_url: b.demo_url || '',
    source_url: b.source_url || '',
    featured: b.featured === 'on' || b.featured === true || b.featured === '1' ? 1 : 0,
    status: ['draft', 'published', 'archived'].includes(b.status) ? b.status : 'draft',
    sort_order: Number(b.sort_order) || 0,
    technologies: String(b.technologies || '').split(',').map(s => s.trim()).filter(Boolean)
  };
}

// LIST
router.get('/', (req, res) => {
  const rows = db.prepare(`
    SELECT p.id, p.title, p.slug, p.status, p.featured, p.updated_at, c.name AS category
    FROM projects p LEFT JOIN categories c ON c.id = p.category_id
    WHERE p.deleted_at IS NULL ORDER BY p.sort_order, p.updated_at DESC`).all();
  res.json(rows);
});

// DETAIL
router.get('/:id', (req, res) => {
  const p = db.prepare(`SELECT * FROM projects WHERE id=? AND deleted_at IS NULL`).get(req.params.id);
  if (!p) return res.status(404).json({ error: 'Project tidak ditemukan' });
  p.technologies = technologiesOf(p.id);
  res.json(p);
});

// CREATE
router.post('/', (req, res) => {
  const b = readBody(req);
  if (!b.title) return res.status(400).json({ error: 'Judul project wajib diisi' });
  b.slug = uniqueSlug(b.slug);
  const r = db.prepare(`INSERT INTO projects (title, slug, short_description, full_description, problem, solution, features, result, category_id, client_type, project_date, demo_url, source_url, featured, status, sort_order)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(b.title, b.slug, b.short_description, b.full_description, b.problem, b.solution, b.features, b.result, b.category_id, b.client_type, b.project_date, b.demo_url, b.source_url, b.featured, b.status, b.sort_order);
  setTechnologies(r.lastInsertRowid, b.technologies);
  res.status(201).json({ id: r.lastInsertRowid, slug: b.slug });
});

// UPDATE
router.put('/:id', (req, res) => {
  const p = db.prepare(`SELECT id FROM projects WHERE id=? AND deleted_at IS NULL`).get(req.params.id);
  if (!p) return res.status(404).json({ error: 'Project tidak ditemukan' });
  const b = readBody(req);
  if (!b.title) return res.status(400).json({ error: 'Judul project wajib diisi' });
  b.slug = uniqueSlug(b.slug, Number(req.params.id));
  db.prepare(`UPDATE projects SET title=?, slug=?, short_description=?, full_description=?, problem=?, solution=?, features=?, result=?, category_id=?, client_type=?, project_date=?, demo_url=?, source_url=?, featured=?, status=?, sort_order=?, updated_at=datetime('now') WHERE id=?`)
    .run(b.title, b.slug, b.short_description, b.full_description, b.problem, b.solution, b.features, b.result, b.category_id, b.client_type, b.project_date, b.demo_url, b.source_url, b.featured, b.status, b.sort_order, req.params.id);
  setTechnologies(Number(req.params.id), b.technologies);
  res.json({ ok: true, slug: b.slug });
});

// DELETE (soft delete)
router.delete('/:id', (req, res) => {
  const r = db.prepare(`UPDATE projects SET deleted_at=datetime('now') WHERE id=? AND deleted_at IS NULL`).run(req.params.id);
  if (!r.changes) return res.status(404).json({ error: 'Project tidak ditemukan' });
  res.json({ ok: true });
});

// STATUS + FEATURED toggles
router.post('/:id/publish', (req, res) => { db.prepare(`UPDATE projects SET status='published', updated_at=datetime('now') WHERE id=?`).run(req.params.id); res.json({ ok: true }); });
router.post('/:id/unpublish', (req, res) => { db.prepare(`UPDATE projects SET status='draft', updated_at=datetime('now') WHERE id=?`).run(req.params.id); res.json({ ok: true }); });
router.post('/:id/featured', (req, res) => { db.prepare(`UPDATE projects SET featured = 1 - featured, updated_at=datetime('now') WHERE id=?`).run(req.params.id); res.json({ ok: true }); });

export default router;
