import { copyFileSync, mkdirSync, rmSync, existsSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const routes = [
  'marka-ligi',
  'marka-karsilastirma',
  'site-ligi',
  'puanlama-motoru',
  'firma-rekabeti',
  'kara-liste',
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
  'marketing-marketplace',
  'sertifika-basvurusu',
  'marka-yonetimi',
  'yardim',
  'profil',
  'profil/sikayetlerim',
  'profil/puanlarim',
  'puan-merkezi',
  'odul-merkezi',
  'sikayet-et',
  'sikayet',
  'admin',
  'admin/sikayetler',
  'admin-sikayetler',
  'admin/puanlama',
  'misafir-kullanici',
  'giris-yap',
  'giris',
  'uye-ol',
];

const browserModules = [
  'platform-store.js',
  'product-app.js',
  'auth-topbar-bridge.js',
  'complaint-case-submit.js',
  'complaint-case-core.js',
  'complaint-evidence.js',
  'evidence-center.js',
  'complaint-dossier-api.js',
  'complaint-dossier-view.js',
  'complaint-dossier-integration.js',
];

for (const file of browserModules) {
  if (existsSync(`src/${file}`)) execFileSync(process.execPath, ['--check', `src/${file}`], { stdio: 'inherit' });
}

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

for (const file of browserModules) {
  if (existsSync(`src/${file}`)) copyFileSync(`src/${file}`, `dist/src/${file}`);
}

copyFileSync('_redirects', 'dist/_redirects');
copyFileSync('vercel.json', 'dist/vercel.json');

for (const route of routes) {
  mkdirSync(`dist/${route}`, { recursive: true });
  copyFileSync('index.html', `dist/${route}/index.html`);
}

console.log('Static build completed in dist/ with Diamond platform app.');
