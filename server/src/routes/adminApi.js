import { Router } from 'express';
import db from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/stats', (req, res) => {
  res.json({
    total: db.prepare(`SELECT COUNT(*) c FROM projects WHERE deleted_at IS NULL`).get().c,
    published: db.prepare(`SELECT COUNT(*) c FROM projects WHERE status='published' AND deleted_at IS NULL`).get().c,
    draft: db.prepare(`SELECT COUNT(*) c FROM projects WHERE status='draft' AND deleted_at IS NULL`).get().c,
    featured: db.prepare(`SELECT COUNT(*) c FROM projects WHERE featured=1 AND deleted_at IS NULL`).get().c,
    categories: db.prepare(`SELECT COUNT(*) c FROM categories`).get().c,
    services: db.prepare(`SELECT COUNT(*) c FROM services`).get().c
  });
});

router.get('/projects/recent', (req, res) => {
  res.json(db.prepare(`SELECT title, status, updated_at FROM projects WHERE deleted_at IS NULL ORDER BY updated_at DESC LIMIT 5`).all());
});

export default router;
