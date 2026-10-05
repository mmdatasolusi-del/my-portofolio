// Proteksi route: halaman admin redirect ke login, API mengembalikan 401
export function requireAuth(req, res, next) {
  if (req.session && req.session.userId) return next();
  if (req.path.startsWith('/api/') || req.xhr || req.headers.accept?.includes('application/json')) {
    return res.status(401).json({ error: 'Sesi berakhir. Silakan login kembali.' });
  }
  return res.redirect('/admin/login');
}
