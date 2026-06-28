import { copyFileSync, mkdirSync, rmSync } from 'node:fs';

const routes = [
  'marka-ligi',
  'site-ligi',
  'marka-karsilastirma',
  'kullanici-yarismasi',
  'guven-merkezi',
  'sorumlu-kullanim',
  'sorumlu-oyun',
  'kullanici-psikolojisi',
  'oyuncu-psikolojisi',
  'wellness-merkezi',
  'topluluk-merkezi',
  'ai-danisman',
  'sertifikasyon',
  'farkindalik-programlari',
  'kampanyalar',
  'sohbet',
  'sikayetler',
  'seffaflik-marketplace',
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
copyFileSync('src/product-app.js', 'dist/src/product-app.js');
copyFileSync('src/platform-store.js', 'dist/src/platform-store.js');
copyFileSync('src/styles.css', 'dist/src/styles.css');
copyFileSync('_redirects', 'dist/_redirects');
copyFileSync('vercel.json', 'dist/vercel.json');

for (const route of routes) {
  mkdirSync(`dist/${route}`, { recursive: true });
  copyFileSync('index.html', `dist/${route}/index.html`);
}

console.log('Static build completed in dist/ with dashboard direct-route fallbacks.');
