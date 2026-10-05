// Tandai nav aktif + helper fetch
document.querySelectorAll('.sidebar a').forEach(a => {
  if (a.getAttribute('href') === location.pathname) a.classList.add('active');
});
async function api(url) {
  const r = await fetch(url, { headers: { Accept: 'application/json' } });
  if (r.status === 401) { location.href = '/admin/login'; return null; }
  if (!r.ok) throw new Error('Gagal memuat data');
  return r.json();
}
