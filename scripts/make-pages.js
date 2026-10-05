import fs from 'node:fs';
const pages = { projects: 6, categories: 7, skills: 7, services: 7, profile: 7, settings: 7 };
const titles = { projects: 'Portfolio Projects', categories: 'Categories', skills: 'Skills', services: 'Services', profile: 'Profile', settings: 'Settings' };
for (const [p, f] of Object.entries(pages)) {
  fs.writeFileSync(`admin/${p}.html`, `<!doctype html>
<html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${titles[p]} — Admin</title><link rel="stylesheet" href="/admin/css/admin.css"></head>
<body>
  <nav class="sidebar"><h2>Portfolio Management</h2>
    <a href="/admin">Dashboard</a>
    <a href="/admin/projects">Portfolio</a>
    <a href="/admin/categories">Categories</a>
    <a href="/admin/skills">Skills</a>
    <a href="/admin/services">Services</a>
    <a href="/admin/profile">Profile</a>
    <a href="/admin/settings">Settings</a>
    <a href="/" target="_blank">View Website</a>
    <a href="/admin/logout">Logout</a>
  </nav>
  <main class="main"><div class="topbar"><h1>${titles[p]}</h1></div>
  <p>Halaman ini akan dibuat pada Fase ${f}.</p></main>
  <script src="/admin/js/admin.js"></script>
</body></html>
`);
}
console.log('OK');
