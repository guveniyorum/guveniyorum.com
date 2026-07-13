import { currentPath, esc, publicFeed, publicStats, brandCases, resetDossierCaches } from './complaint-dossier-api.js';
import { ensureDossierStyles, openDossier, publicCard, toast } from './complaint-dossier-view.js';

let renderToken = 0;
let lastRoute = '';

function routeTo(path) {
  history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

function extractPublicId(path = currentPath()) {
  return decodeURIComponent(path.match(/^\/sikayet\/(GVN-[^/]+)$/i)?.[1] || '');
}

function selectedBrandName() {
  const select = document.querySelector('[data-brand-ops-brand], .brandOps select, select');
  return select?.selectedOptions?.[0]?.textContent?.trim() || select?.value?.trim() || '';
}

function caseCard(row, mode = 'public') {
  if (mode === 'public') return publicCard(row);
  return publicCard({
    ...row,
    public_summary: row.public_summary || row.description || '',
    author_nickname: 'Kayıtlı kullanıcı',
    author_avatar_key: 'neon-orbit',
    attachment_count: row.attachment_count || 0,
    published_at: row.published_at || row.updated_at || row.created_at,
  });
}

async function renderComplaintNetwork() {
  if (currentPath() !== '/sikayetler') return;
  const token = ++renderToken;
  ensureDossierStyles();
  const queue = document.querySelector('.queue');
  if (!queue) return;
  queue.innerHTML = '<div class="pcdLoading">Gerçek şikayet dosyaları yükleniyor…</div>';
  try {
    const [rows, stats] = await Promise.all([publicFeed(null, true), publicStats()]);
    if (token !== renderToken || currentPath() !== '/sikayetler') return;
    queue.innerHTML = rows.length ? rows.map((row) => publicCard(row)).join('') : '<div class="pcdEmpty">Henüz kamusal şikayet dosyası bulunmuyor.</div>';

    const statValues = document.querySelectorAll('.stats .stat b');
    if (stats && statValues.length >= 4) {
      statValues[0].textContent = String(stats.resolved || 0);
      statValues[1].textContent = String(stats.open || 0);
      statValues[2].textContent = String(stats.total || 0);
      statValues[3].textContent = `%${stats.total ? Math.round((Number(stats.resolved || 0) / Number(stats.total)) * 100) : 0}`;
    }
  } catch (error) {
    queue.innerHTML = `<div class="pcdEmpty">Şikayet dosyaları yüklenemedi.<br><small>${esc(error?.message || 'Beklenmeyen hata')}</small></div>`;
  }
}

async function renderBrandDossiers(force = false) {
  if (currentPath() !== '/marka-yonetimi') return;
  ensureDossierStyles();
  const wrap = document.querySelector('.scroll .wrap') || document.querySelector('.scroll section .wrap');
  if (!wrap) return;
  let panel = document.querySelector('[data-pcd-brand-panel]');
  if (!panel) {
    panel = document.createElement('section');
    panel.dataset.pcdBrandPanel = '';
    panel.className = 'panel';
    panel.style.marginTop = '18px';
    wrap.appendChild(panel);
  }
  if (!force && panel.dataset.loading === '1') return;
  panel.dataset.loading = '1';
  const brand = selectedBrandName();
  panel.innerHTML = `<h3>Gerçek Şikayet Dosyaları</h3><p class="muted">${esc(brand || 'Seçili marka')} için merkezi veritabanı kayıtları yükleniyor…</p>`;
  try {
    const result = await brandCases(brand || null);
    const rows = result.rows || [];
    panel.innerHTML = `<div style="display:flex;justify-content:space-between;gap:12px;align-items:center;margin-bottom:12px"><div><h3 style="margin:0">Gerçek Şikayet Dosyaları</h3><small class="muted">${esc(brand || 'Tüm markalar')} · ${rows.length} dosya</small></div><button class="btn" type="button" data-pcd-brand-refresh>Yenile</button></div><div class="pcdFeed">${rows.length ? rows.map((row) => caseCard(row, result.mode)).join('') : '<div class="pcdEmpty">Bu marka için görüntülenebilir merkezi dosya yok.</div>'}</div>`;
  } catch (error) {
    panel.innerHTML = `<h3>Gerçek Şikayet Dosyaları</h3><div class="pcdEmpty">Dosyalar yüklenemedi.<br><small>${esc(error?.message || 'Beklenmeyen hata')}</small></div>`;
  } finally {
    panel.dataset.loading = '0';
  }
}

async function renderDirectDossier() {
  const publicId = extractPublicId();
  if (!publicId) return;
  ensureDossierStyles();
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `<main style="min-height:100vh;background:#050b14;color:#eef7ff;display:grid;place-items:center;padding:24px;font-family:Inter,system-ui,sans-serif"><section style="text-align:center"><h1>${esc(publicId)}</h1><p style="color:#91a4bc">Şikayet dosyası hazırlanıyor…</p><button class="pcdBtn" data-pcd-back>Ana sayfaya dön</button></section></main>`;
  }
  await openDossier(publicId);
}

function wireCardLinks() {
  document.querySelectorAll('[data-pcd-public-id]').forEach((card) => {
    const id = card.dataset.pcdPublicId;
    card.setAttribute('aria-label', `${id} şikayet dosyasını aç`);
  });
}

async function syncRoute(force = false) {
  const path = currentPath();
  if (!force && path === lastRoute) {
    wireCardLinks();
    return;
  }
  lastRoute = path;
  renderToken += 1;
  if (extractPublicId(path)) { await renderDirectDossier(); return; }
  if (path === '/sikayetler') await renderComplaintNetwork();
  if (path === '/marka-yonetimi') await renderBrandDossiers(true);
  wireCardLinks();
}

function bind() {
  document.addEventListener('click', async (event) => {
    const open = event.target.closest?.('[data-pcd-open], [data-pcd-public-id]');
    if (open) {
      const id = open.dataset.pcdOpen || open.dataset.pcdPublicId;
      if (!id) return;
      event.preventDefault();
      event.stopPropagation();
      history.pushState({}, '', `/sikayet/${encodeURIComponent(id)}`);
      await renderDirectDossier();
      return;
    }
    if (event.target.closest?.('[data-pcd-close]')) {
      document.querySelector('[data-pcd-modal]')?.remove();
      if (extractPublicId()) history.back();
      return;
    }
    if (event.target.closest?.('[data-pcd-back]')) { routeTo('/'); return; }
    if (event.target.closest?.('[data-pcd-brand-refresh]')) { resetDossierCaches(); await renderBrandDossiers(true); return; }
  });

  document.addEventListener('keydown', async (event) => {
    const card = event.target.closest?.('[data-pcd-public-id]');
    if (card && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      history.pushState({}, '', `/sikayet/${encodeURIComponent(card.dataset.pcdPublicId)}`);
      await renderDirectDossier();
    }
    if (event.key === 'Escape') document.querySelector('[data-pcd-modal]')?.remove();
  });

  document.addEventListener('change', (event) => {
    if (currentPath() === '/marka-yonetimi' && event.target.matches('select')) setTimeout(() => renderBrandDossiers(true), 50);
  });
  window.addEventListener('popstate', () => syncRoute(true));
  window.addEventListener('gi:auth', () => { resetDossierCaches(); syncRoute(true); });
  window.addEventListener('gi:evidence-upload-complete', () => { resetDossierCaches(); setTimeout(() => syncRoute(true), 400); });
}

ensureDossierStyles();
bind();
syncRoute(true).catch((error) => toast(error?.message || 'Şikayet dosyaları hazırlanamadı.', true));

new MutationObserver(() => {
  requestAnimationFrame(() => {
    if (currentPath() === '/sikayetler' && !document.querySelector('.queue [data-pcd-public-id]')) renderComplaintNetwork();
    if (currentPath() === '/marka-yonetimi' && !document.querySelector('[data-pcd-brand-panel]')) renderBrandDossiers(true);
    wireCardLinks();
  });
}).observe(document.getElementById('root') || document.body, { childList: true, subtree: true });