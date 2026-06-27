const { copyFileSync, existsSync, mkdirSync } = require('node:fs');
const { join } = require('node:path');

const distDir = join(__dirname, '..', 'dist');
const indexPath = join(distDir, 'index.html');
const routes = [
  'login',
  'register',
  'dashboard',
  'documents',
  'documents/new',
  'customers',
  'settings',
  'staff',
];

if (!existsSync(indexPath)) {
  throw new Error('dist/index.html was not found. Run vite build before copying SPA routes.');
}

for (const route of routes) {
  const routeDir = join(distDir, ...route.split('/'));
  mkdirSync(routeDir, { recursive: true });
  copyFileSync(indexPath, join(routeDir, 'index.html'));
}
