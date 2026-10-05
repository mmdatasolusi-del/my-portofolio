import 'dotenv/config';
import bcrypt from 'bcryptjs';
import db from './db.js';

const count = (t) => db.prepare(`SELECT COUNT(*) AS c FROM ${t}`).get().c;

// --- USERS ---
if (count('users') === 0) {
  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  const name = process.env.ADMIN_NAME || 'Administrator';
  db.prepare(`INSERT INTO users (username, password_hash, name, role) VALUES (?, ?, ?, 'admin')`)
    .run(username, bcrypt.hashSync(password, 10), name);
  console.log(`✓ Admin dibuat: ${username}`);
}

// --- PROFILE ---
if (count('profile') === 0) {
  db.prepare(`INSERT INTO profile (name, headline, short_bio, availability) VALUES (?, ?, ?, ?)`)
    .run('Nama Anda', 'Account Officer & Credit Analyst', 'Profesional dengan pengalaman di administrasi, data, dan reporting.', 'Terbuka untuk peluang');
  console.log('✓ Profile placeholder dibuat');
}

// --- SITE SETTINGS ---
if (count('site_settings') === 0) {
  db.prepare(`INSERT INTO site_settings (site_title, site_description, hero_headline, hero_subheadline, hero_cta_primary, hero_cta_secondary) VALUES (?, ?, ?, ?, ?, ?)`)
    .run('Portfolio', 'Portfolio pribadi', 'Excel, Data, Dashboard & Web Apps', 'Solusi pengolahan data dan operasional bisnis yang sederhana, rapi, dan mudah digunakan.', 'Lihat Karya Saya', 'Hubungi Saya');
  console.log('✓ Site settings dibuat');
}

// --- CATEGORIES ---
if (count('categories') === 0) {
  const cats = ['Excel', 'Data', 'Dashboard', 'Website', 'Web Apps', 'Business Tools'];
  const stmt = db.prepare(`INSERT INTO categories (name, slug, sort_order) VALUES (?, ?, ?)`);
  cats.forEach((c, i) => stmt.run(c, c.toLowerCase().replace(/\s+/g, '-'), i + 1));
  console.log(`✓ ${cats.length} kategori dibuat`);
}

// --- SKILLS ---
if (count('skills') === 0) {
  const skills = [
    ['Microsoft Excel', 'Excel'], ['PivotTable', 'Excel'], ['VLOOKUP / XLOOKUP', 'Excel'],
    ['Data Processing', 'Data'], ['Dashboard', 'Data'], ['Reporting', 'Data'],
    ['HTML', 'Web'], ['CSS', 'Web'], ['JavaScript', 'Web'], ['IndexedDB', 'Web'], ['PWA', 'Web']
  ];
  const stmt = db.prepare(`INSERT INTO skills (name, category, level, sort_order) VALUES (?, ?, 'Intermediate', ?)`);
  skills.forEach((s, i) => stmt.run(s[0], s[1], i + 1));
  console.log(`✓ ${skills.length} skills dibuat`);
}

// --- SERVICES ---
if (count('services') === 0) {
  const services = [
    ['Excel & Data Processing', 'Pengolahan, pembersihan, rekap, dan penyusunan data menggunakan Excel.'],
    ['Dashboard & Reporting', 'Membuat dashboard dan laporan agar data lebih mudah dipahami.'],
    ['Website Sederhana', 'Membuat website untuk kebutuhan bisnis, profile, landing page, atau informasi usaha.'],
    ['Web Apps Sederhana', 'Membuat aplikasi web sederhana untuk membantu kebutuhan administrasi dan operasional bisnis.']
  ];
  const stmt = db.prepare(`INSERT INTO services (title, description, sort_order) VALUES (?, ?, ?)`);
  services.forEach((s, i) => stmt.run(s[0], s[1], i + 1));
  console.log(`✓ ${services.length} services dibuat`);
}

// --- PROJECTS ---
if (count('projects') === 0) {
  const catId = (name) => db.prepare(`SELECT id FROM categories WHERE name = ?`).get(name)?.id ?? null;
  const techId = (name) => {
    db.prepare(`INSERT OR IGNORE INTO technologies (name) VALUES (?)`).run(name);
    return db.prepare(`SELECT id FROM technologies WHERE name = ?`).get(name).id;
  };
  const addProject = (p, techs) => {
    const r = db.prepare(`INSERT INTO projects (title, slug, short_description, full_description, category_id, demo_url, featured, status, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(p.title, p.slug, p.desc, p.desc, catId(p.category), p.demo || null, p.featured ? 1 : 0, p.status || 'published', p.order);
    techs.forEach(t => db.prepare(`INSERT OR IGNORE INTO project_technologies (project_id, technology_id) VALUES (?, ?)`).run(r.lastInsertRowid, techId(t)));
  };

  addProject({ title: 'POS Offline PWA', slug: 'pos-offline-pwa', category: 'Web Apps', desc: 'Point of Sale berbasis web dengan konsep offline-first untuk membantu kebutuhan transaksi dan pengelolaan operasional usaha.', featured: true, order: 1 },
    ['HTML', 'CSS', 'JavaScript', 'IndexedDB', 'Dexie.js', 'PWA', 'Bootstrap']);
  addProject({ title: 'Website Kopi', slug: 'website-kopi', category: 'Website', desc: 'Website sederhana untuk bisnis kopi dengan fokus pada informasi produk, branding, dan tampilan responsive.', demo: 'https://kopikutjur.netlify.app/', featured: true, order: 2 },
    ['HTML', 'CSS', 'JavaScript']);
  addProject({ title: 'Excel Dashboard', slug: 'excel-dashboard', category: 'Dashboard', desc: 'Dashboard interaktif untuk membantu menyajikan data dan indikator bisnis secara lebih mudah dipahami.', featured: true, order: 3 },
    ['Excel', 'PivotTable', 'Charts']);
  addProject({ title: 'Business Data Reporting', slug: 'business-data-reporting', category: 'Data', desc: 'Pengolahan data menjadi laporan yang lebih rapi, terstruktur, dan mudah digunakan.', order: 4 },
    ['Excel', 'Data Processing', 'Reporting']);
  addProject({ title: 'Business Web App', slug: 'business-web-app', category: 'Web Apps', desc: 'Aplikasi web sederhana untuk membantu kebutuhan administrasi dan operasional bisnis.', order: 5 },
    ['HTML', 'CSS', 'JavaScript', 'IndexedDB']);
  addProject({ title: 'Excel Data Processing', slug: 'excel-data-processing', category: 'Excel', desc: 'Pengolahan dan penyusunan data untuk kebutuhan administrasi dan reporting.', order: 6 },
    ['Excel', 'Data Processing']);
  console.log('✓ 6 project dibuat');
}

console.log('Seed selesai.');
