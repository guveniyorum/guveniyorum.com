import { copyFileSync, mkdirSync, rmSync, appendFileSync, existsSync, writeFileSync } from 'node:fs';

const routes = [
  'marka-ligi',
  'marka-karsilastirma',
  'kullanici-yarismasi',
  'guven-merkezi',
  'sorumlu-kullanim',
  'kullanici-psikolojisi',
  'wellness-merkezi',
  'topluluk-merkezi',
  'ai-danisman',
  'sertifikasyon',
  'farkindalik-programlari',
  'sohbet',
  'sikayetler',
  'seffaflik-marketplace',
  'sertifika-basvurusu',
  'marka-yonetimi',
  'yardim',
  'misafir-kullanici',
  'giris-yap',
  'giris',
  'uye-ol',
];

rmSync('dist', { recursive: true, force: true });
mkdirSync('dist/src', { recursive: true });
copyFileSync('index.html', 'dist/index.html');
copyFileSync('src/main.js', 'dist/src/main.js');
copyFileSync('src/styles.css', 'dist/src/styles.css');

const envConfig = {
  supabaseUrl: process.env.VITE_SUPABASE_URL || '',
  supabaseAnonKey: process.env.VITE_SUPABASE_ANON_KEY || '',
};
writeFileSync('dist/src/env.js', `export const ENV = ${JSON.stringify(envConfig)};\n`);

if (existsSync('src/platform-store.js')) {
  copyFileSync('src/platform-store.js', 'dist/src/platform-store.js');
}

if (existsSync('src/app-fix.css')) {
  appendFileSync('dist/src/styles.css', '\n\n/* stabilization layer */\n');
  appendFileSync('dist/src/styles.css', '\n@import url("/src/app-fix.css");\n');
  copyFileSync('src/app-fix.css', 'dist/src/app-fix.css');
}

if (existsSync('src/action-fix.js')) {
  appendFileSync('dist/src/main.js', '\n\n/* action stabilization layer */\n');
  appendFileSync('dist/src/main.js', '\nimport "./action-fix.js";\n');
  copyFileSync('src/action-fix.js', 'dist/src/action-fix.js');
}

copyFileSync('_redirects', 'dist/_redirects');
copyFileSync('vercel.json', 'dist/vercel.json');

for (const route of routes) {
  mkdirSync(`dist/${route}`, { recursive: true });
  copyFileSync('index.html', `dist/${route}/index.html`);
}

console.log('Static build completed in dist/ with dashboard fixes.');
