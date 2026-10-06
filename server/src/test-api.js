// Smoke test API — jalankan: npm test
process.env.PORT = '0';
const { default: app } = await import('./index.js');

const server = app.listen(0);
await new Promise(r => server.once('listening', r));
const base = `http://localhost:${server.address().port}`;

let fail = 0;
async function check(name, path, expectStatus, isJson = true) {
  try {
    const r = await fetch(base + path);
    const ok = r.status === expectStatus;
    console.log(`${ok ? '✓' : '✗'} ${name}: ${r.status} (harap ${expectStatus})`);
    if (!ok) fail++;
    if (ok && isJson) await r.json().catch(() => { console.log(`  ✗ ${name}: bukan JSON valid`); fail++; });
  } catch (e) { console.log(`✗ ${name}: ${e.message}`); fail++; }
}

await check('health', '/api/health', 200);
await check('public settings', '/api/public/settings', 200);
await check('public projects', '/api/public/projects', 200);
await check('admin API tanpa login → 401', '/api/admin/stats', 401);
await check('public page', '/', 200, false);
await check('project.html', '/project.html?slug=x', 200, false);

await new Promise((r) => server.close(r));
console.log(fail === 0 ? '\nSemua test lolos ✓' : `\n${fail} test gagal`);
// Pastikan semua test selesai & server sudah tertutup sebelum exit.
// Jika ada test gagal, exit code tetap 1 (tidak menutupi kegagalan).
process.exit(fail === 0 ? 0 : 1);
