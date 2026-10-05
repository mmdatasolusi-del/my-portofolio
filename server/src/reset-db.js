import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, '../../data');

for (const f of fs.readdirSync(dataDir)) {
  if (f.startsWith('portfolio.db')) {
    fs.rmSync(path.join(dataDir, f), { force: true });
    console.log(`Dihapus: ${f}`);
  }
}

const { spawnSync } = await import('node:child_process');
spawnSync('node', [path.join(__dirname, 'seed.js')], { stdio: 'inherit' });
