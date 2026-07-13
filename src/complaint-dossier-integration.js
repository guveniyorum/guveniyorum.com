import { publicFeed, publicStats, brandCases, esc, statusLabel, formatDate } from './complaint-dossier-api.js';
import { ensureDossierStyles, publicCard, openDossier } from './complaint-dossier-view.js';

let renderToken = 0;

function path() { return location.pathname.replace(/\/+$/, '') || '/'; }
function caseIdFromText(value = '') { return String(value).match(/GVN-\d{4}-\d+/)?.[0] || ''; }
function navigate(pathname) {
  history.pushState({}, '', pathname);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

function ensureIntegrationStyles() {
  ensureDossierStyles();
  if (document.getElementById('complaint-dossier-integration-style')) return;
  const style = document.createElement('style');
  style.id = 'complaint-dossier-integration-style';
  style.textContent = `
    .pdiHead{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px}.pdiHead p{margin:0;color:#91a4bc;font-size:12px}.pdiCount{padding:6px 9px;border:1px solid rgba(37,240,132,.28);border-radius:999px;background:rgba(37,240,132,.09);color:#caffdc;font-size:11px;font-weight:900}.pdiLoading{padding:24px;border:1px dashed rgba(178,204,255,.16);border-radius:16px;text-align:center;color:#91a4bc}.pdiBrandCases{margin-top:16px;border:1px solid rgba(178,204,255,.12);border-radius:20px;background:linear-gradient(150deg,rgba(13,24,41,.96),rgba(7,15,27,.96));padding:18px}.pdiBrandCases h2{font-size:24px;margin:0 0 5px}.pdiBrandCases>p{color:#91a4bc}.pdiPrivateCard{padding:15px;border:1px solid rgba(178,204,255,.12);border-radius:15px;background:rgba(255,255,255,.035);cursor:pointer}.pdiPrivateCard:hover{border-color:rgba(37,240,132,.34)}.pdiPrivateCardHead{display:flex;justify-content:space-between;gap:10px}.pdiPrivateCard p{color:#9aadc2;line-height:1.5;margin:9px 0}.pdiOpen{display:inline-flex;margin-top:9px}.pdiLinked{cursor:pointer}.pdiLinked:hover{border-color:rgba(37,240,132,.34)!important}@media(max-width:700px){.pdiHead{align-items:flex-start;flex-direction:column}}
  `;
  document.head.appendChild(style);
}

async function replaceComplaintQueue() {
  if (path() !== '/sikayetler') return;
  const token = ++renderToken;
  const queue = document.querySelector('.queue');
  if (!queue || queue.dataset.pdiRealQueue === 'loading') return;
  queue.dataset.pdiRealQueue = 'loading';
  queue.innerHTML = '<div class="pdiLoading">Gerçek şikayet dosyaları veritabanından yükleniyor…</div>';
  try {
    const [rows, stats] = await Promise.all([publicFeed(null, true), publicStats()]);
    if (token !== renderToken || path() !== '/sikayetler' || !document.contains(queue)) return;
    queue.dataset.pdiRealQueue = 'ready';
    const total = Number(stats?.total ?? rows.length);
    queue.innerHTML = `<div class="pdiHead"><div><b>Gerçek Şikayet Dosyaları</b><p>Karta tıklayarak kullanıcı profili, açıklama, süreç ve kanıtları aç.</p></div><span class="pdiCount">${total} dosya</span></div><div class="pcdFeed">${rows.length ? rows.map(publicCard).join('') : '<div class="pcdEmpty">Henüz kamusal şikayet dosyası bulunmuyor.</div>'}</div>`;
  } catch (error) {
    queue.dataset.pdiRealQueue = 'error';
    queue.innerHTML = `<div class="pcdEmpty">Dosyalar yüklenemedi: ${esc(error?.message || 'Beklenmeyen hata')}</div>`;
  }
}

function selectedBrandName() {
  const select = document.querySelector('[data-brand-ops-brand]');
  if (!select) return '';
  return select.options?.[select.selectedIndex]?.textContent?.trim() || select.value || '';
}

function privateBrandCard(row) {
  return `<article class="pdiPrivateCard" data-pcd-open="${esc(row.public_id)}"><div class="pdiPrivateCardHead"><b>${esc(row.public_id)} · ${esc(row.title)}</b><span class="status">${esc(statusLabel(row.status))}</span></div><p>${esc(row.description || row.public_summary || '')}</p><small class="muted">${esc(row.category || 'Genel')} · ${esc(formatDate(row.updated_at || row.created_at))}</small><br><button class="btn green pdiOpen" type="button" data-pcd-open="${esc(row.public_id)}">Dosya Detayını Aç</button></article>`;
}

async function renderBrandCases() {
  if (path() !== '/marka-yonetimi') return;
  const host = document.querySelector('.scroll .wrap') || document.querySelector('.scroll .section') || document.querySelector('.scroll');
  if (!host) return;
  let section = document.querySelector('[data-pdi-brand-cases]');
  if (!section) {
    section = document.createElement('section');
    section.className = 'pdiBrandCases';
    section.dataset.pdiBrandCases = '';
    host.appendChild(section);
  }
  const brandName = selectedBrandName();
  section.innerHTML = '<div class="pdiLoading">Markanın gerçek şikayet dosyaları yükleniyor…</div>';
  try {
    const result = await brandCases(brandName);
    const rows = result.rows || [];
    section.innerHTML = `<div class="pdiHead"><div><h2>${esc(brandName || 'Marka')} Şikayet Dosyaları</h2><p>Veriler Supabase complaints tablosundan gelir. Dosyaya tıklayarak kullanıcı, kanıt ve durum geçmişini gör.</p></div><span class="pdiCount">${rows.length} dosya</span></div><div class="pcdFeed">${rows.length ? rows.map((row) => result.mode === 'private' ? privateBrandCard(row) : publicCard(row)).join('') : '<div class="pcdEmpty">Bu markaya bağlı gerçek dosya bulunmuyor.</div>'}</div>`;
  } catch (error) {
    section.innerHTML = `<div class="pcdEmpty">Marka dosyaları yüklenemedi: ${esc(error?.message || 'Beklenmeyen hata')}</div>`;
  }
}

function connectExistingCards() {
  if (!['/sikayetler', '/marka-yonetimi'].includes(path())) return;
  document.querySelectorAll('article.complaint:not([data-pcd-public-id]), .site:not([data-pdi-checked])').forEach((card) => {
    card.dataset.pdiChecked = '1';
    const id = caseIdFromText(card.textContent);
    if (!id) return;
    card.classList.add('pdiLinked');
    card.dataset.pcdOpen = id;
    card.tabIndex = 0;
    card.title = 'Şikayet dosyası detayını aç';
  });
}

async function openFromLocation() {
  const match = path().match(/^\/sikayet\/(GVN-\d{4}-\d+)$/i);
  if (match) await openDossier(match[1].toUpperCase());
}

function sync() {
  ensureIntegrationStyles();
  replaceComplaintQueue();
  renderBrandCases();
  connectExistingCards();
  openFromLocation();
}

document.addEventListener('click', async (event) => {
  const target = event.target.closest?.('[data-pcd-open], [data-pcd-public-id]');
  if (!target) return;
  const publicId = target.dataset.pcdOpen || target.dataset.pcdPublicId;
  if (!publicId) return;
  event.preventDefault();
  event.stopPropagation();
  const desired = `/sikayet/${publicId}`;
  if (path() !== desired) history.pushState({}, '', desired);
  await openDossier(publicId);
});

document.addEventListener('keydown', async (event) => {
  if (!['Enter', ' '].includes(event.key)) return;
  const target = event.target.closest?.('[data-pcd-open], [data-pcd-public-id]');
  if (!target) return;
  event.preventDefault();
  const publicId = target.dataset.pcdOpen || target.dataset.pcdPublicId;
  if (publicId) await openDossier(publicId);
});

document.addEventListener('change', (event) => {
  if (event.target.matches?.('[data-brand-ops-brand]')) renderBrandCases();
});

document.addEventListener('click', (event) => {
  if (!event.target.closest?.('[data-pcd-close]')) return;
  if (path().startsWith('/sikayet/')) navigate('/sikayetler');
});

window.addEventListener('popstate', sync);
window.addEventListener('gi:state', sync);
window.addEventListener('gi:complaint-created', () => setTimeout(sync, 800));

ensureIntegrationStyles();
sync();
new MutationObserver(() => requestAnimationFrame(() => {
  connectExistingCards();
  if (path() === '/sikayetler' && !document.querySelector('.queue[data-pdi-real-queue="ready"]')) replaceComplaintQueue();
  if (path() === '/marka-yonetimi' && !document.querySelector('[data-pdi-brand-cases]')) renderBrandCases();
})).observe(document.getElementById('root') || document.body, { childList: true, subtree: true });
