import { copyFileSync, mkdirSync, rmSync } from 'node:fs';

const routes = [
  'guvenilir-siteler',
  'site-ligi',
  'kullanici-yarismasi',
  'guven-merkezi',
  'sorumlu-oyun',
  'oyuncu-psikolojisi',
  'wellness-merkezi',
  'topluluk-merkezi',
  'ai-danisman',
  'sertifikasyon',
  'kampanyalar',
  'sohbet',
  'sikayetler',
  'marketing-marketplace',
  'sertifika-basvurusu',
  'marka-yonetimi',
  'yardim',
  'giris-yap',
  'giris',
  'uye-ol',
];

rmSync('dist', { recursive: true, force: true });
mkdirSync('dist/src', { recursive: true });
copyFileSync('index.html', 'dist/index.html');
copyFileSync('src/main.js', 'dist/src/main.js');
copyFileSync('src/styles.css', 'dist/src/styles.css');
copyFileSync('_redirects', 'dist/_redirects');
copyFileSync('vercel.json', 'dist/vercel.json');

for (const route of routes) {
  mkdirSync(`dist/${route}`, { recursive: true });
  copyFileSync('index.html', `dist/${route}/index.html`);
}

console.log('Static build completed in dist/ with direct-route fallbacks.');
