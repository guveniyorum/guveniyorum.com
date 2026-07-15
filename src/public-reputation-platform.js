import { platformStore } from './platform-store.js';
import { AVATARS, PRIVATE_BUCKET, esc, statusLabel, formatDate, formatBytes } from './complaint-dossier-api.js';

window.__giPublicReputationPlatform = true;

const ACCEPTED_TYPES = new Set([
  'image/jpeg', 'image/png', 'image/webp', 'application/pdf',
  'video/mp4', 'video/webm', 'video/quicktime',
]);
const MAX_FILES = 5;
const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
const CLOSED = new Set(['resolved', 'closed', 'solved']);
const CATEGORIES = ['Para çekme', 'Para yatırma', 'Bonus / kampanya', 'KYC / belge', 'Hesap erişimi', 'Destek kalitesi', 'Teknik sorun', 'Diğer'];

const state = {
  token: 0,
  stats: null,
  feed: [],
  brands: [],
  discovery: { search: '', status: 'all', category: 'all' },
  brandSearch: '',
  create: {
    step: 1,
    busy: false,
    files: [],
    draft: { brandId: '', category: '', title: '', details: '', requestedSolution: '', consent: true },
  },
};

function pathNow() {
  return location.pathname.replace(/\/+$/, '') || '/';
}

function isPlatformRoute(path = pathNow()) {
  return path === '/sikayetler'
    || path === '/sikayet-olustur'
    || path === '/markalar'
    || /^\/sikayet\/[^/]+$/i.test(path)
    || /^\/marka\/[^/]+$/i.test(path);
}

function navigate(path) {
  history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

function setMeta(title, description) {
  document.title = `${title} — Güveniyorum`;
  let meta = document.querySelector('meta[name="description"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = 'description';
    document.head.appendChild(meta);
  }
  meta.content = description;
}

function safeExternalUrl(value) {
  try {
    const url = new URL(String(value || ''));
    return ['http:', 'https:'].includes(url.protocol) ? url.toString() : '';
  } catch {
    return '';
  }
}

function sanitizeFilename(name = 'evidence') {
  const cleaned = String(name)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 120);
  return cleaned || `evidence-${Date.now()}`;
}

function logoMarkup(brand, className = 'grpBrandLogo') {
  const url = safeExternalUrl(brand?.logo_url || brand?.brand_logo_url);
  const name = brand?.name || brand?.brand_name || 'G';
  if (url) return `<span class="${className}"><img src="${esc(url)}" alt="${esc(name)} logosu" loading="lazy"></span>`;
  return `<span class="${className} grpLogoFallback">${esc(name.slice(0, 1).toUpperCase())}</span>`;
}

function avatarMarkup(key, className = 'grpAvatar') {
  return `<span class="${className}">${esc(AVATARS[key] || '◎')}</span>`;
}

function ensureStyles() {
  if (document.getElementById('public-reputation-platform-style')) return;
  const style = document.createElement('style');
  style.id = 'public-reputation-platform-style';
  style.textContent = `
    body.grpActive{overflow:hidden!important}.grpApp{position:fixed;inset:0;z-index:7000;overflow:auto;background:#06101d;color:#eef7ff;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;letter-spacing:-.02em}.grpApp *{box-sizing:border-box}.grpApp a{color:inherit;text-decoration:none}.grpApp button,.grpApp input,.grpApp select,.grpApp textarea{font:inherit}.grpTop{position:sticky;top:0;z-index:20;display:flex;align-items:center;gap:18px;min-height:70px;padding:12px 24px;border-bottom:1px solid rgba(178,204,255,.12);background:rgba(6,16,29,.93);backdrop-filter:blur(18px)}.grpHome{display:flex;align-items:center;gap:11px;font-weight:950}.grpHomeMark{width:40px;height:40px;display:grid;place-items:center;border-radius:14px;background:linear-gradient(135deg,#25f084,#20c7b0);color:#04130b;box-shadow:0 0 30px rgba(37,240,132,.24)}.grpHome small{display:block;margin-top:2px;color:#8ea4ba;font-size:10px;font-weight:750}.grpNav{display:flex;gap:7px;align-items:center}.grpNav button,.grpGhost,.grpPrimary{border:1px solid rgba(178,204,255,.14);border-radius:12px;background:rgba(255,255,255,.04);color:#eaf4ff;padding:10px 13px;font-weight:850;cursor:pointer}.grpNav button.active{border-color:rgba(37,240,132,.34);background:rgba(37,240,132,.10);color:#caffdc}.grpPrimary{border-color:rgba(37,240,132,.48);background:linear-gradient(135deg,#25f084,#16b981);color:#03130b;box-shadow:0 12px 35px rgba(37,240,132,.14)}.grpSpacer{flex:1}.grpMain{min-height:calc(100vh - 70px)}.grpWrap{width:min(1180px,calc(100% - 36px));margin:0 auto}.grpHero{position:relative;overflow:hidden;padding:72px 0 38px;background:radial-gradient(circle at 12% 8%,rgba(37,240,132,.18),transparent 32%),radial-gradient(circle at 88% 8%,rgba(139,61,255,.17),transparent 35%)}.grpHeroGrid{display:grid;grid-template-columns:1.15fr .85fr;gap:28px;align-items:center}.grpEyebrow{display:inline-flex;align-items:center;gap:7px;padding:6px 10px;border:1px solid rgba(37,240,132,.28);border-radius:999px;background:rgba(37,240,132,.09);color:#a9ffc5;font-size:11px;font-weight:900}.grpHero h1{max-width:760px;margin:17px 0 14px;font-size:clamp(44px,7vw,88px);line-height:.92;letter-spacing:-.075em}.grpHero h1 span{background:linear-gradient(135deg,#fff,#8affb5 58%,#25f084);-webkit-background-clip:text;background-clip:text;color:transparent}.grpHero p{max-width:680px;color:#9cb0c4;font-size:16px;line-height:1.65}.grpHeroActions{display:flex;gap:10px;flex-wrap:wrap;margin-top:22px}.grpHeroPanel,.grpPanel,.grpCard,.grpBrandCard,.grpComplaintCard,.grpFormCard,.grpDossierCard{border:1px solid rgba(178,204,255,.13);border-radius:22px;background:linear-gradient(150deg,rgba(15,28,47,.96),rgba(7,16,29,.96));box-shadow:0 25px 80px rgba(0,0,0,.3)}.grpHeroPanel{padding:18px}.grpMetricGrid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}.grpMetric{padding:15px;border:1px solid rgba(178,204,255,.10);border-radius:15px;background:rgba(255,255,255,.025)}.grpMetric b{display:block;color:#a8ffc4;font-size:27px}.grpMetric small{display:block;margin-top:4px;color:#8096ad;font-size:10px;font-weight:850}.grpSection{padding:38px 0}.grpSectionHead{display:flex;align-items:flex-end;justify-content:space-between;gap:18px;margin-bottom:18px}.grpSectionHead h2{margin:0 0 6px;font-size:clamp(28px,4vw,46px);letter-spacing:-.055em}.grpSectionHead p{margin:0;color:#91a6bb;line-height:1.5}.grpSearchBar{display:grid;grid-template-columns:1fr auto;gap:10px;padding:12px;border:1px solid rgba(178,204,255,.13);border-radius:18px;background:rgba(255,255,255,.035)}.grpInput,.grpSelect,.grpTextarea{width:100%;border:1px solid rgba(178,204,255,.16);border-radius:13px;background:#091626;color:#edf7ff;padding:12px 13px;outline:none}.grpInput:focus,.grpSelect:focus,.grpTextarea:focus{border-color:rgba(37,240,132,.55);box-shadow:0 0 0 3px rgba(37,240,132,.08)}.grpTextarea{min-height:150px;resize:vertical}.grpFilters{display:flex;gap:8px;flex-wrap:wrap;margin-top:13px}.grpFilter{border:1px solid rgba(178,204,255,.13);border-radius:999px;background:rgba(255,255,255,.035);color:#b9c8d8;padding:8px 11px;font-size:11px;font-weight:850;cursor:pointer}.grpFilter.active{border-color:rgba(37,240,132,.42);background:rgba(37,240,132,.11);color:#caffdc}.grpBrandGrid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:13px}.grpBrandCard{padding:16px;cursor:pointer;transition:.18s ease}.grpBrandCard:hover{transform:translateY(-2px);border-color:rgba(37,240,132,.36)}.grpBrandHead{display:flex;align-items:center;gap:11px}.grpBrandLogo{width:48px;height:48px;display:grid;place-items:center;overflow:hidden;border-radius:15px;border:1px solid rgba(178,204,255,.15);background:#0a1828}.grpBrandLogo img{width:100%;height:100%;object-fit:contain}.grpLogoFallback{background:linear-gradient(135deg,#25f084,#8b5cf6);color:#03130b;font-size:20px;font-weight:1000}.grpBrandHead b{display:block}.grpBrandHead small{display:block;margin-top:3px;color:#8499af}.grpScore{margin-left:auto;color:#9fffc0;font-size:27px;font-weight:950}.grpBrandCard p{min-height:44px;margin:13px 0;color:#91a5ba;font-size:12px;line-height:1.5}.grpMiniMetrics{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}.grpMiniMetric{padding:8px;border:1px solid rgba(178,204,255,.09);border-radius:11px;background:rgba(255,255,255,.025);text-align:center}.grpMiniMetric b{display:block;font-size:13px}.grpMiniMetric small{color:#7890a8;font-size:8px}.grpFeed{display:grid;gap:13px}.grpComplaintCard{padding:17px;cursor:pointer;transition:.18s ease}.grpComplaintCard:hover{transform:translateY(-1px);border-color:rgba(37,240,132,.35)}.grpComplaintTop{display:flex;gap:12px;align-items:flex-start}.grpComplaintBrand{display:flex;align-items:center;gap:9px;min-width:0}.grpComplaintBrand .grpBrandLogo{width:38px;height:38px;border-radius:12px;flex:none}.grpComplaintBrand b{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.grpComplaintBrand small{display:block;color:#8197ad;margin-top:2px}.grpStatus{margin-left:auto;flex:none;padding:6px 9px;border:1px solid rgba(248,184,78,.28);border-radius:999px;background:rgba(248,184,78,.10);color:#ffd28b;font-size:10px;font-weight:900}.grpStatus.solved{border-color:rgba(37,240,132,.28);background:rgba(37,240,132,.10);color:#aaffc5}.grpComplaintCard h3{margin:15px 0 7px;font-size:21px}.grpComplaintCard>p{margin:0;color:#9bafc3;line-height:1.6}.grpComplaintFoot{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:15px}.grpAuthor{display:flex;align-items:center;gap:8px}.grpAvatar{width:31px;height:31px;display:grid;place-items:center;border-radius:10px;background:linear-gradient(135deg,#25f084,#8b5cf6);color:#04130b;font-weight:1000}.grpAuthor small{color:#8197ad}.grpEvidenceCount{padding:6px 8px;border:1px solid rgba(34,211,238,.22);border-radius:999px;background:rgba(34,211,238,.07);color:#c7f7ff;font-size:10px;font-weight:900}.grpEmpty,.grpLoading{display:grid;place-items:center;min-height:260px;padding:28px;border:1px dashed rgba(178,204,255,.16);border-radius:20px;color:#91a5bb;text-align:center;background:rgba(255,255,255,.02)}.grpDirectoryGrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.grpBrandHero{padding:48px 0 26px}.grpBrandHeroGrid{display:grid;grid-template-columns:1fr 320px;gap:22px}.grpBrandIdentity{display:flex;align-items:center;gap:18px}.grpBrandIdentity .grpBrandLogo{width:82px;height:82px;border-radius:23px}.grpBrandIdentity h1{margin:0 0 7px;font-size:clamp(38px,6vw,70px);letter-spacing:-.065em}.grpPills{display:flex;gap:7px;flex-wrap:wrap}.grpPill{padding:6px 9px;border:1px solid rgba(34,211,238,.22);border-radius:999px;background:rgba(34,211,238,.07);color:#caf8ff;font-size:10px;font-weight:900}.grpPill.green{border-color:rgba(37,240,132,.28);background:rgba(37,240,132,.09);color:#caffdc}.grpScoreRing{width:170px;height:170px;margin:auto;display:grid;place-items:center;border-radius:999px;background:conic-gradient(#25f084 calc(var(--score)*1%),rgba(255,255,255,.08) 0);position:relative}.grpScoreRing:after{content:"";position:absolute;inset:11px;border-radius:inherit;background:#091626}.grpScoreRing div{position:relative;z-index:1;text-align:center}.grpScoreRing b{display:block;font-size:43px}.grpScoreRing small{color:#8fa4ba}.grpBreakdown{display:grid;gap:12px}.grpBarHead{display:flex;justify-content:space-between;gap:12px;margin-bottom:6px;font-size:12px}.grpBar{height:8px;border-radius:999px;background:rgba(255,255,255,.07);overflow:hidden}.grpBar i{display:block;height:100%;width:var(--w);background:linear-gradient(90deg,#25f084,#22d3ee)}.grpTwoCol{display:grid;grid-template-columns:1fr 360px;gap:18px}.grpPanel{padding:18px}.grpPanel h2,.grpPanel h3{margin-top:0}.grpDossier{padding:34px 0 60px}.grpBreadcrumb{display:flex;gap:7px;align-items:center;color:#8197ad;font-size:12px;margin-bottom:15px}.grpDossierGrid{display:grid;grid-template-columns:minmax(0,1fr) 340px;gap:17px}.grpDossierCard{padding:21px}.grpDossierCard h1{margin:13px 0;font-size:clamp(34px,5vw,60px);line-height:1;letter-spacing:-.06em}.grpDossierCard p{color:#a2b4c6;line-height:1.7}.grpProfileCard{padding:18px}.grpProfileIdentity{display:flex;align-items:center;gap:12px}.grpProfileIdentity .grpAvatar{width:58px;height:58px;border-radius:18px;font-size:26px}.grpProfileIdentity b{display:block;font-size:18px}.grpProfileIdentity small{display:block;color:#8499af;margin-top:3px}.grpProfileMetrics{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:14px}.grpProfileMetrics .grpMiniMetric{padding:10px}.grpEvidenceGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.grpAsset{overflow:hidden;border:1px solid rgba(178,204,255,.12);border-radius:17px;background:#081321}.grpMedia{height:310px;display:grid;place-items:center;background:#02070d}.grpMedia img,.grpMedia video,.grpMedia iframe{width:100%;height:100%;object-fit:contain;border:0}.grpAssetInfo{padding:12px}.grpAssetInfo small{display:block;color:#8197ad;margin-top:4px}.grpTimeline{display:grid;gap:0}.grpTimelineRow{display:grid;grid-template-columns:13px 1fr;gap:11px;padding:11px 0;border-bottom:1px solid rgba(178,204,255,.08)}.grpTimelineRow:last-child{border-bottom:0}.grpDot{width:10px;height:10px;margin-top:5px;border-radius:999px;background:#25f084;box-shadow:0 0 15px rgba(37,240,132,.55)}.grpTimelineRow small{display:block;color:#8197ad;margin-top:4px}.grpFormPage{padding:38px 0 60px}.grpFormLayout{display:grid;grid-template-columns:minmax(0,1fr) 310px;gap:18px}.grpFormCard{padding:21px}.grpStepper{display:grid;gap:9px}.grpStepItem{display:flex;align-items:center;gap:10px;padding:11px;border:1px solid rgba(178,204,255,.10);border-radius:14px;background:rgba(255,255,255,.025);color:#8196ad}.grpStepItem.active{border-color:rgba(37,240,132,.35);background:rgba(37,240,132,.08);color:#d8ffe6}.grpStepNo{width:29px;height:29px;display:grid;place-items:center;border-radius:9px;background:rgba(255,255,255,.06);font-weight:900}.grpField{display:grid;gap:6px;margin-bottom:14px}.grpField label{font-size:12px;font-weight:850}.grpField small{color:#8196ad;line-height:1.45}.grpFormActions{display:flex;justify-content:space-between;gap:10px;margin-top:18px}.grpDrop{display:grid;place-items:center;min-height:140px;padding:20px;border:1px dashed rgba(37,240,132,.38);border-radius:18px;background:rgba(37,240,132,.035);text-align:center;cursor:pointer}.grpDrop input{position:absolute;width:1px;height:1px;opacity:0}.grpFileList{display:grid;gap:8px;margin-top:11px}.grpFile{display:grid;grid-template-columns:43px 1fr auto;gap:10px;align-items:center;padding:9px;border:1px solid rgba(178,204,255,.11);border-radius:13px;background:rgba(255,255,255,.025)}.grpFilePreview{width:43px;height:43px;display:grid;place-items:center;border-radius:10px;background:#07101d;overflow:hidden}.grpFilePreview img,.grpFilePreview video{width:100%;height:100%;object-fit:cover}.grpFile small{color:#8196ad}.grpFile button{border:0;background:none;color:#ff9bab;font-size:20px;cursor:pointer}.grpReviewRows{display:grid;gap:9px}.grpReviewRow{display:grid;grid-template-columns:150px 1fr;gap:12px;padding:10px 0;border-bottom:1px solid rgba(178,204,255,.08)}.grpReviewRow span{color:#8196ad}.grpNotice{padding:13px;border:1px solid rgba(34,211,238,.18);border-radius:14px;background:rgba(34,211,238,.055);color:#c9f7ff;font-size:12px;line-height:1.55}.grpToast{position:fixed;right:18px;bottom:18px;z-index:12000;max-width:min(460px,calc(100vw - 36px));padding:13px 15px;border:1px solid rgba(37,240,132,.36);border-radius:14px;background:rgba(8,19,33,.98);color:#d9ffe7;box-shadow:0 18px 60px rgba(0,0,0,.4);font-weight:850}.grpToast.error{border-color:rgba(255,77,109,.36);color:#ffc2cb}@media(max-width:980px){.grpNav{display:none}.grpTop{padding:11px 14px}.grpHeroGrid,.grpBrandHeroGrid,.grpTwoCol,.grpDossierGrid,.grpFormLayout{grid-template-columns:1fr}.grpBrandGrid{grid-template-columns:repeat(2,1fr)}.grpDirectoryGrid{grid-template-columns:repeat(2,1fr)}.grpHero{padding-top:44px}.grpScoreRing{width:145px;height:145px}.grpDossierGrid>.grpPanel{order:2}}@media(max-width:640px){.grpWrap{width:min(100% - 22px,1180px)}.grpBrandGrid,.grpDirectoryGrid,.grpEvidenceGrid{grid-template-columns:1fr}.grpComplaintFoot,.grpSectionHead{align-items:flex-start;flex-direction:column}.grpHero h1{font-size:48px}.grpMetricGrid{grid-template-columns:1fr 1fr}.grpHome small{display:none}.grpTop .grpGhost{display:none}.grpDossierCard{padding:16px}.grpMedia{height:230px}.grpReviewRow{grid-template-columns:1fr;gap:4px}}
  `;
  document.head.appendChild(style);
}

function toast(message, error = false) {
  document.querySelector('[data-grp-toast]')?.remove();
  const node = document.createElement('div');
  node.dataset.grpToast = '';
  node.className = `grpToast ${error ? 'error' : ''}`;
  node.textContent = message;
  document.body.appendChild(node);
  setTimeout(() => node.remove(), 5200);
}

function header(active) {
  return `<header class="grpTop">
    <button class="grpHome" type="button" data-grp-nav="/">
      <span class="grpHomeMark">G</span><span>Güveniyorum<small>Şikayet & Marka İtibar Ağı</small></span>
    </button>
    <nav class="grpNav">
      <button type="button" class="${active === 'complaints' ? 'active' : ''}" data-grp-nav="/sikayetler">Şikayetler</button>
      <button type="button" class="${active === 'brands' ? 'active' : ''}" data-grp-nav="/markalar">Markalar</button>
      <button type="button" data-grp-nav="/firma-rekabeti">Firma Rekabeti</button>
    </nav>
    <span class="grpSpacer"></span>
    <button class="grpGhost" type="button" data-grp-nav="/profil">Profilim</button>
    <button class="grpPrimary" type="button" data-grp-nav="/sikayet-olustur">Şikayet Oluştur</button>
  </header>`;
}

function mount(content, { active = '', title = 'Güveniyorum', description = 'Marka güveni ve kullanıcı deneyimi platformu.' } = {}) {
  ensureStyles();
  document.body.classList.add('grpActive');
  document.querySelector('[data-grp-root]')?.remove();
  const root = document.createElement('div');
  root.className = 'grpApp';
  root.dataset.grpRoot = '';
  root.innerHTML = `${header(active)}<main class="grpMain" data-grp-main>${content}</main>`;
  document.body.appendChild(root);
  setMeta(title, description);
}

function unmount() {
  document.body.classList.remove('grpActive');
  document.querySelector('[data-grp-root]')?.remove();
}

async function rpc(name, args = {}) {
  if (!platformStore.supabase) throw new Error('Veri servisi hazır değil.');
  const result = await platformStore.supabase.rpc(name, args);
  if (result.error) throw result.error;
  return result.data;
}

function metric(value, label) {
  return `<div class="grpMetric"><b>${esc(value)}</b><small>${esc(label)}</small></div>`;
}

function miniMetric(value, label) {
  return `<div class="grpMiniMetric"><b>${esc(value)}</b><small>${esc(label)}</small></div>`;
}

function complaintCard(row) {
  const brand = { name: row.brand_name, logo_url: row.brand_logo_url };
  const solved = CLOSED.has(row.status);
  return `<article class="grpComplaintCard" tabindex="0" data-grp-case="${esc(row.public_id)}">
    <div class="grpComplaintTop">
      <div class="grpComplaintBrand">${logoMarkup(brand)}<div><b>${esc(row.brand_name || 'Bilinmeyen Marka')}</b><small>${esc(row.public_id)} · ${esc(row.category || 'Genel')}</small></div></div>
      <span class="grpStatus ${solved ? 'solved' : ''}">${esc(statusLabel(row.status))}</span>
    </div>
    <h3>${esc(row.title)}</h3>
    <p>${esc(row.public_summary || '')}</p>
    <div class="grpComplaintFoot">
      <div class="grpAuthor">${avatarMarkup(row.author_avatar_key)}<small>${esc(row.author_nickname || 'Topluluk Üyesi')} · ${esc(formatDate(row.published_at))}</small></div>
      <div><span class="grpEvidenceCount">📎 ${Number(row.attachment_count || 0)} kanıt</span></div>
    </div>
  </article>`;
}

function brandCard(brand) {
  return `<article class="grpBrandCard" tabindex="0" data-grp-brand="${esc(brand.slug)}">
    <div class="grpBrandHead">${logoMarkup(brand)}<div><b>${esc(brand.name)}</b><small>${esc(brand.category || 'Genel')}</small></div><span class="grpScore">${Math.round(Number(brand.trust_score || 0))}</span></div>
    <p>${esc(brand.public_description || '')}</p>
    <div class="grpMiniMetrics">${miniMetric(`${Number(brand.resolution_rate || 0).toFixed(0)}%`, 'ÇÖZÜM')}${miniMetric(`${Number(brand.avg_response_hours || 0).toFixed(1)}s`, 'YANIT')}${miniMetric(Number(brand.complaint_count || 0), 'ŞİKAYET')}</div>
  </article>`;
}

function discoveryFilteredRows() {
  const search = state.discovery.search.toLocaleLowerCase('tr-TR').trim();
  return state.feed.filter((row) => {
    if (state.discovery.status === 'open' && CLOSED.has(row.status)) return false;
    if (state.discovery.status === 'resolved' && !CLOSED.has(row.status)) return false;
    if (state.discovery.category !== 'all' && row.category !== state.discovery.category) return false;
    if (!search) return true;
    return [row.title, row.public_summary, row.brand_name, row.author_nickname, row.category]
      .some((value) => String(value || '').toLocaleLowerCase('tr-TR').includes(search));
  });
}

function discoveryPage() {
  const rows = discoveryFilteredRows();
  const categories = [...new Set(state.feed.map((item) => item.category).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'tr'));
  const stats = state.stats || {};
  return `<section class="grpHero"><div class="grpWrap grpHeroGrid">
    <div><span class="grpEyebrow">● Gerçek deneyimler · doğrulanabilir süreç</span><h1>Bir markaya güvenmeden önce <span>gerçek hikâyeyi gör.</span></h1><p>Şikayetleri, kullanıcı profillerini, kanıtları, çözüm sürecini ve marka performansını tek bir kamusal itibar ağında incele.</p><div class="grpHeroActions"><button class="grpPrimary" data-grp-nav="/sikayet-olustur">Şikayetini Paylaş</button><button class="grpGhost" data-grp-nav="/markalar">Markaları İncele</button></div></div>
    <aside class="grpHeroPanel"><div class="grpMetricGrid">${metric(Number(stats.published_complaints || 0), 'KAMUSAL ŞİKAYET')}${metric(Number(stats.open_complaints || 0), 'AÇIK DOSYA')}${metric(Number(stats.resolved_complaints || 0), 'ÇÖZÜLEN')}${metric(Number(stats.published_evidence || 0), 'GÖRÜNÜR KANIT')}</div></aside>
  </div></section>
  <section class="grpSection"><div class="grpWrap"><div class="grpSectionHead"><div><h2>Marka güven karneleri</h2><p>Güven, kullanıcı deneyimi, çözüm oranı ve yanıt süresi birlikte değerlendirilir.</p></div><button class="grpGhost" data-grp-nav="/markalar">Tüm markalar</button></div><div class="grpBrandGrid">${state.brands.slice(0, 8).map(brandCard).join('')}</div></div></section>
  <section class="grpSection"><div class="grpWrap"><div class="grpSectionHead"><div><h2>Şikayet Ağı</h2><p>Her kart gerçek Supabase dosyasını, kullanıcı profilini ve kanıtlarını açar.</p></div><span class="grpPill green">${rows.length} sonuç</span></div>
    <div class="grpSearchBar"><input class="grpInput" type="search" data-grp-search value="${esc(state.discovery.search)}" placeholder="Marka, şikayet, kategori veya kullanıcı ara"><button class="grpPrimary" type="button" data-grp-nav="/sikayet-olustur">Yeni Şikayet</button></div>
    <div class="grpFilters"><button class="grpFilter ${state.discovery.status === 'all' ? 'active' : ''}" data-grp-status="all">Tümü</button><button class="grpFilter ${state.discovery.status === 'open' ? 'active' : ''}" data-grp-status="open">Yanıt Bekleyen</button><button class="grpFilter ${state.discovery.status === 'resolved' ? 'active' : ''}" data-grp-status="resolved">Çözülen</button><button class="grpFilter ${state.discovery.category === 'all' ? 'active' : ''}" data-grp-category="all">Tüm Kategoriler</button>${categories.map((category) => `<button class="grpFilter ${state.discovery.category === category ? 'active' : ''}" data-grp-category="${esc(category)}">${esc(category)}</button>`).join('')}</div>
    <div class="grpFeed" style="margin-top:16px">${rows.length ? rows.map(complaintCard).join('') : '<div class="grpEmpty"><div><h3>Bu filtrelerde şikayet bulunamadı</h3><p>Arama kelimelerini veya filtreleri değiştir.</p></div></div>'}</div>
  </div></section>`;
}

async function renderDiscovery() {
  const token = ++state.token;
  mount('<div class="grpWrap grpLoading" style="margin-top:36px">Şikayet ağı ve marka karneleri yükleniyor…</div>', { active: 'complaints', title: 'Şikayet Ağı', description: 'Gerçek kullanıcı şikayetleri, kanıtlar ve marka çözüm performansı.' });
  try {
    const [stats, brands, feed] = await Promise.all([
      rpc('get_public_reputation_stats'),
      rpc('get_public_brand_directory', { p_search: null, p_limit: 40 }),
      rpc('get_public_reputation_feed', { p_search: null, p_status: 'all', p_category: null, p_brand_slug: null, p_limit: 100, p_offset: 0 }),
    ]);
    if (token !== state.token || pathNow() !== '/sikayetler') return;
    state.stats = stats || {};
    state.brands = brands || [];
    state.feed = feed || [];
    mount(discoveryPage(), { active: 'complaints', title: 'Şikayet Ağı', description: 'Gerçek kullanıcı şikayetleri, kanıtlar ve marka çözüm performansı.' });
  } catch (error) {
    mount(`<div class="grpWrap grpEmpty" style="margin-top:36px"><div><h2>Şikayet ağı açılamadı</h2><p>${esc(error?.message || 'Beklenmeyen hata.')}</p></div></div>`, { active: 'complaints', title: 'Şikayet Ağı' });
  }
}

function brandsPage() {
  const search = state.brandSearch.toLocaleLowerCase('tr-TR').trim();
  const rows = state.brands.filter((brand) => !search || [brand.name, brand.category, brand.public_description].some((value) => String(value || '').toLocaleLowerCase('tr-TR').includes(search)));
  return `<section class="grpHero"><div class="grpWrap"><span class="grpEyebrow">Marka Şeffaflığı</span><h1><span>Marka profilleri</span> ve güven karneleri.</h1><p>Her markanın şikayet hacmini, çözüm oranını, yanıt süresini, risk görünümünü ve kullanıcı deneyimi skorunu karşılaştır.</p></div></section><section class="grpSection"><div class="grpWrap"><div class="grpSearchBar"><input class="grpInput" data-grp-brand-search type="search" value="${esc(state.brandSearch)}" placeholder="Marka veya kategori ara"><button class="grpPrimary" data-grp-nav="/sikayet-olustur">Şikayet Oluştur</button></div><div class="grpDirectoryGrid" style="margin-top:16px">${rows.length ? rows.map(brandCard).join('') : '<div class="grpEmpty">Marka bulunamadı.</div>'}</div></div></section>`;
}

async function renderBrands() {
  const token = ++state.token;
  mount('<div class="grpWrap grpLoading" style="margin-top:36px">Marka karneleri yükleniyor…</div>', { active: 'brands', title: 'Markalar' });
  try {
    state.brands = await rpc('get_public_brand_directory', { p_search: null, p_limit: 100 }) || [];
    if (token !== state.token || pathNow() !== '/markalar') return;
    mount(brandsPage(), { active: 'brands', title: 'Markalar', description: 'Marka güven skorları, şikayetler ve çözüm performansı.' });
  } catch (error) {
    mount(`<div class="grpWrap grpEmpty" style="margin-top:36px"><p>${esc(error?.message || 'Markalar yüklenemedi.')}</p></div>`, { active: 'brands', title: 'Markalar' });
  }
}

function scoreBar(label, value) {
  const safe = Math.max(0, Math.min(100, Number(value || 0)));
  return `<div><div class="grpBarHead"><span>${esc(label)}</span><b>${safe.toFixed(0)}</b></div><div class="grpBar"><i style="--w:${safe}%"></i></div></div>`;
}

function brandComplaintCard(row) {
  return complaintCard({
    ...row,
    brand_name: row.brand_name,
    brand_logo_url: row.brand_logo_url,
    public_summary: row.summary,
    author_nickname: row.author_nickname,
    author_avatar_key: row.author_avatar_key,
    attachment_count: row.attachment_count,
  });
}

function brandPage(data) {
  const brand = data.brand || {};
  const metrics = data.metrics || {};
  const complaints = (data.complaints || []).map((item) => ({ ...item, brand_name: brand.name, brand_logo_url: brand.logo_url }));
  const responseScore = Math.max(0, 100 - Number(brand.avg_response_hours || 0) * 5);
  const transparency = (Number(brand.trust_score || 0) + Number(brand.resolution_rate || 0)) / 2;
  const website = safeExternalUrl(brand.website_url);
  return `<section class="grpBrandHero"><div class="grpWrap grpBrandHeroGrid"><div class="grpPanel"><div class="grpBrandIdentity">${logoMarkup(brand)}<div><div class="grpPills">${brand.verified ? '<span class="grpPill green">✓ Doğrulanmış Marka</span>' : '<span class="grpPill">Topluluk Kaydı</span>'}<span class="grpPill">${esc(brand.risk_level || 'İzleniyor')}</span><span class="grpPill">${esc(brand.trend || '+0%')}</span></div><h1>${esc(brand.name)}</h1><p>${esc(brand.description || '')}</p></div></div><div class="grpHeroActions">${website ? `<a class="grpPrimary" href="${esc(website)}" target="_blank" rel="noopener noreferrer">Resmî Siteye Git</a>` : ''}<button class="grpGhost" data-grp-create-brand="${esc(brand.id)}">Bu Marka Hakkında Şikayet Yaz</button></div></div><aside class="grpPanel"><div class="grpScoreRing" style="--score:${Math.max(0, Math.min(100, Number(brand.trust_score || 0)))}"><div><b>${Number(brand.trust_score || 0).toFixed(0)}</b><small>Güven Skoru</small></div></div></aside></div></section>
  <section class="grpSection"><div class="grpWrap"><div class="grpMetricGrid" style="grid-template-columns:repeat(5,1fr)">${metric(Number(metrics.total_complaints || 0), 'TOPLAM ŞİKAYET')}${metric(Number(metrics.open_complaints || 0), 'AÇIK DOSYA')}${metric(Number(metrics.resolved_complaints || 0), 'ÇÖZÜLEN')}${metric(`${Number(brand.resolution_rate || 0).toFixed(0)}%`, 'ÇÖZÜM ORANI')}${metric(`${Number(brand.avg_response_hours || 0).toFixed(1)} sa`, 'ORT. YANIT')}</div></div></section>
  <section class="grpSection"><div class="grpWrap grpTwoCol"><div class="grpPanel"><div class="grpSectionHead"><div><h2>Marka performansı</h2><p>Tek bir puan yerine, güveni oluşturan temel bileşenler ayrı izlenir.</p></div></div><div class="grpBreakdown">${scoreBar('Güvenilirlik', brand.trust_score)}${scoreBar('Kullanıcı deneyimi', Number(brand.user_experience_score || 0) * 20)}${scoreBar('Sorun çözme', brand.resolution_rate)}${scoreBar('Yanıt hızı', responseScore)}${scoreBar('Şeffaflık', transparency)}</div></div><aside class="grpPanel"><h3>Şikayet kategorileri</h3>${(data.categories || []).length ? (data.categories || []).map((item) => `<div class="grpTimelineRow"><span class="grpDot"></span><div><b>${esc(item.name)}</b><small>${Number(item.count || 0)} dosya</small></div></div>`).join('') : '<div class="grpEmpty" style="min-height:160px">Henüz kategori verisi yok.</div>'}</aside></div></section>
  <section class="grpSection"><div class="grpWrap"><div class="grpSectionHead"><div><h2>${esc(brand.name)} şikayetleri</h2><p>Dosya detayında kullanıcı profili, kanıtlar ve çözüm geçmişi bulunur.</p></div><button class="grpPrimary" data-grp-create-brand="${esc(brand.id)}">Şikayet Oluştur</button></div><div class="grpFeed">${complaints.length ? complaints.map(brandComplaintCard).join('') : '<div class="grpEmpty"><div><h3>Henüz kamusal şikayet yok</h3><p>Bu markayla ilgili ilk deneyimi sen paylaşabilirsin.</p></div></div>'}</div></div></section>`;
}

async function renderBrand(slug) {
  const token = ++state.token;
  mount('<div class="grpWrap grpLoading" style="margin-top:36px">Marka profili ve şikayetleri hazırlanıyor…</div>', { active: 'brands', title: 'Marka Profili' });
  try {
    const data = await rpc('get_public_brand_profile', { p_slug: slug });
    if (token !== state.token || !pathNow().startsWith('/marka/')) return;
    if (!data?.brand) throw new Error('Marka profili bulunamadı.');
    mount(brandPage(data), { active: 'brands', title: `${data.brand.name} Güven Karnesi`, description: `${data.brand.name} şikayetleri, çözüm oranı, kullanıcı puanı ve marka yanıt performansı.` });
  } catch (error) {
    mount(`<div class="grpWrap grpEmpty" style="margin-top:36px"><div><h2>Marka profili açılamadı</h2><p>${esc(error?.message || 'Beklenmeyen hata.')}</p><button class="grpPrimary" data-grp-nav="/markalar">Markalara Dön</button></div></div>`, { active: 'brands', title: 'Marka Profili' });
  }
}

async function signedAttachments(rows) {
  return Promise.all((rows || []).map(async (item) => {
    if (!item.file_path) return { ...item, url: '' };
    const result = await platformStore.supabase.storage.from(PRIVATE_BUCKET).createSignedUrl(item.file_path, 300);
    return { ...item, url: result.error ? '' : result.data?.signedUrl || '' };
  }));
}

function mediaMarkup(item) {
  if (!item.url) return '<div class="grpLoading">Kanıt bağlantısı oluşturulamadı.</div>';
  const url = esc(item.url);
  if (String(item.mime_type).startsWith('image/')) return `<img src="${url}" alt="${esc(item.caption || item.file_name || 'Şikayet kanıtı')}">`;
  if (String(item.mime_type).startsWith('video/')) return `<video src="${url}" controls playsinline preload="metadata"></video>`;
  if (item.mime_type === 'application/pdf') return `<iframe src="${url}" title="${esc(item.caption || 'Belge')}"></iframe>`;
  return `<a class="grpPrimary" href="${url}" target="_blank" rel="noopener">Dosyayı Aç</a>`;
}

function dossierPage(data, attachments, similar) {
  const complaint = data.case || {};
  const author = data.author || {};
  const brand = data.brand || { name: complaint.brand_name, slug: complaint.brand_slug, logo_url: complaint.brand_logo_url, website_url: complaint.brand_website_url };
  const solved = CLOSED.has(complaint.status);
  return `<section class="grpDossier"><div class="grpWrap"><div class="grpBreadcrumb"><button class="grpGhost" data-grp-nav="/sikayetler">Şikayet Ağı</button><span>›</span><span>${esc(complaint.public_id)}</span></div><div class="grpDossierGrid"><article class="grpDossierCard"><div class="grpPills"><span class="grpPill green">${esc(complaint.public_id)}</span><span class="grpPill">${esc(complaint.category || 'Genel')}</span><span class="grpStatus ${solved ? 'solved' : ''}">${esc(statusLabel(complaint.status))}</span></div><h1>${esc(complaint.title)}</h1><p>${esc(complaint.summary || '')}</p>${complaint.requested_solution ? `<div class="grpNotice"><b>Beklenen çözüm</b><br>${esc(complaint.requested_solution)}</div>` : ''}<div class="grpComplaintFoot"><small class="grpPill">Yayın: ${esc(formatDate(complaint.published_at || complaint.created_at))}</small><button class="grpGhost" data-grp-share="${esc(complaint.public_id)}">Paylaş</button></div></article><aside class="grpPanel grpProfileCard"><div class="grpProfileIdentity">${avatarMarkup(author.avatar_key)}<div><b>${esc(author.nickname || 'Topluluk Üyesi')}</b><small>Takma adlı kamusal profil</small></div></div><p>${esc(author.bio || '')}</p><div class="grpProfileMetrics">${miniMetric(Number(author.trust_score || 70), 'GÜVEN')}${miniMetric(Number(author.contribution_score || 0), 'KATKI')}${miniMetric(Number(author.complaint_count || 0), 'DOSYA')}</div><p style="color:#8197ad;font-size:11px;margin-bottom:0">Gerçek ad ve e-posta kamusal görünümde paylaşılmaz.</p></aside></div>
  <div class="grpDossierGrid" style="margin-top:17px"><section class="grpPanel"><h2>Kanıt Galerisi</h2>${attachments.length ? `<div class="grpEvidenceGrid">${attachments.map((item) => `<article class="grpAsset"><div class="grpMedia">${mediaMarkup(item)}</div><div class="grpAssetInfo"><b>${esc(item.caption || item.file_name || 'Kanıt')}</b><small>${esc(item.mime_type || 'Dosya')}${item.file_size ? ` · ${esc(formatBytes(item.file_size))}` : ''}</small></div></article>`).join('')}</div>` : '<div class="grpEmpty" style="min-height:180px">Bu şikayette kamusal kanıt bulunmuyor.</div>'}</section><aside class="grpPanel"><div class="grpBrandHead">${logoMarkup(brand)}<div><b>${esc(brand?.name || complaint.brand_name || 'Bilinmeyen Marka')}</b><small>${brand?.verified ? 'Doğrulanmış marka profili' : 'Marka kaydı'}</small></div></div><div class="grpProfileMetrics" style="margin-top:16px">${miniMetric(Number(brand?.trust_score || 0).toFixed(0), 'GÜVEN')}${miniMetric(`${Number(brand?.resolution_rate || 0).toFixed(0)}%`, 'ÇÖZÜM')}${miniMetric(`${Number(brand?.avg_response_hours || 0).toFixed(1)}s`, 'YANIT')}</div>${brand?.slug ? `<button class="grpPrimary" style="width:100%;margin-top:14px" data-grp-brand="${esc(brand.slug)}">Marka Profilini Aç</button>` : ''}</aside></div>
  <div class="grpDossierGrid" style="margin-top:17px"><section class="grpPanel"><h2>Marka ve çözüm süreci</h2>${complaint.resolution_summary ? `<div class="grpNotice"><b>Çözüm özeti</b><br>${esc(complaint.resolution_summary)}</div>` : `<div class="grpEmpty" style="min-height:150px"><div><h3>Marka yanıtı henüz kayıtlı değil</h3><p>Resmî yanıt ve çözüm akışı geldiğinde burada kronolojik olarak görünecek.</p></div></div>`}</section><aside class="grpPanel"><h3>Dosya geçmişi</h3><div class="grpTimeline">${(data.history || []).length ? data.history.map((entry) => `<div class="grpTimelineRow"><span class="grpDot"></span><div><b>${esc(statusLabel(entry.status))}</b><small>${esc(entry.actor_role || 'system')} · ${esc(formatDate(entry.created_at))}${entry.note ? ` · ${esc(entry.note)}` : ''}</small></div></div>`).join('') : `<div class="grpTimelineRow"><span class="grpDot"></span><div><b>${esc(statusLabel(complaint.status))}</b><small>${esc(formatDate(complaint.created_at))}</small></div></div>`}</div></aside></div>
  ${similar.length ? `<section class="grpSection"><div class="grpSectionHead"><div><h2>Benzer şikayetler</h2><p>Aynı markanın diğer kamusal dosyaları.</p></div></div><div class="grpFeed">${similar.map(complaintCard).join('')}</div></section>` : ''}</div></section>`;
}

async function renderDossier(publicId) {
  const token = ++state.token;
  mount('<div class="grpWrap grpLoading" style="margin-top:36px">Şikayet dosyası, kullanıcı profili ve kanıtlar hazırlanıyor…</div>', { active: 'complaints', title: 'Şikayet Detayı' });
  try {
    const data = await rpc('get_public_reputation_dossier', { p_public_id: publicId });
    if (!data?.case) throw new Error('Şikayet dosyası bulunamadı veya kamusal değil.');
    const [attachments, similarRows] = await Promise.all([
      signedAttachments(data.attachments || []),
      data.case.brand_slug ? rpc('get_public_reputation_feed', { p_search: null, p_status: 'all', p_category: null, p_brand_slug: data.case.brand_slug, p_limit: 5, p_offset: 0 }) : [],
    ]);
    if (token !== state.token || !pathNow().startsWith('/sikayet/')) return;
    const similar = (similarRows || []).filter((row) => row.public_id !== publicId).slice(0, 3);
    mount(dossierPage(data, attachments, similar), { active: 'complaints', title: `${data.case.title}`, description: `${data.case.brand_name} hakkında kullanıcı şikayeti, kanıtları ve çözüm süreci.` });
  } catch (error) {
    mount(`<div class="grpWrap grpEmpty" style="margin-top:36px"><div><h2>Şikayet dosyası açılamadı</h2><p>${esc(error?.message || 'Beklenmeyen hata.')}</p><button class="grpPrimary" data-grp-nav="/sikayetler">Şikayetlere Dön</button></div></div>`, { active: 'complaints', title: 'Şikayet Detayı' });
  }
}

function brandOptions() {
  return state.brands.map((brand) => `<option value="${esc(brand.id)}" ${state.create.draft.brandId === brand.id ? 'selected' : ''}>${esc(brand.name)}</option>`).join('');
}

function filePreview(item) {
  if (item.previewUrl && item.file.type.startsWith('image/')) return `<img src="${esc(item.previewUrl)}" alt="">`;
  if (item.previewUrl && item.file.type.startsWith('video/')) return `<video src="${esc(item.previewUrl)}" muted playsinline></video>`;
  return item.file.type === 'application/pdf' ? 'PDF' : 'DOSYA';
}

function createStepContent() {
  const draft = state.create.draft;
  if (state.create.step === 1) return `<div><span class="grpEyebrow">Adım 1 / 4</span><h2>Hangi markayla sorun yaşadın?</h2><p>Doğru marka seçimi, şikayetin doğru güven karnesine ve resmî marka hesabına bağlanmasını sağlar.</p><div class="grpField"><label>Marka</label><select class="grpSelect" data-grp-draft="brandId"><option value="">Marka seç</option>${brandOptions()}</select><small>Marka listede yoksa sonraki sürümde yeni marka talebi açabileceksin.</small></div></div>`;
  if (state.create.step === 2) return `<div><span class="grpEyebrow">Adım 2 / 4</span><h2>Deneyimini açık ve net anlat.</h2><div class="grpField"><label>Kategori</label><select class="grpSelect" data-grp-draft="category"><option value="">Kategori seç</option>${CATEGORIES.map((item) => `<option value="${esc(item)}" ${draft.category === item ? 'selected' : ''}>${esc(item)}</option>`).join('')}</select></div><div class="grpField"><label>Başlık</label><input class="grpInput" data-grp-draft="title" maxlength="120" value="${esc(draft.title)}" placeholder="Sorunu tek cümlede özetle"></div><div class="grpField"><label>Şikayet detayı</label><textarea class="grpTextarea" data-grp-draft="details" placeholder="Ne oldu, ne zaman oldu ve marka sana nasıl yanıt verdi?">${esc(draft.details)}</textarea></div><div class="grpField"><label>Beklediğin çözüm</label><textarea class="grpTextarea" data-grp-draft="requestedSolution" style="min-height:90px" placeholder="İade, açıklama, hesap açılması veya başka bir çözüm…">${esc(draft.requestedSolution)}</textarea></div></div>`;
  if (state.create.step === 3) return `<div><span class="grpEyebrow">Adım 3 / 4</span><h2>Kanıtlarını ekle.</h2><p>Görsel, PDF veya kısa video ekleyebilirsin. Yüklediğin içerik şikayet detayında kamusal olarak görüntülenir; kişisel bilgi içeren dosyaları yükleme.</p><label class="grpDrop"><input type="file" data-grp-files accept=".jpg,.jpeg,.png,.webp,.pdf,.mp4,.webm,.mov" multiple><div><b>Dosyaları seç veya sürükle</b><p>En fazla 5 dosya · Görsel/PDF 10 MB · Video 50 MB</p></div></label><div class="grpFileList">${state.create.files.map((item, index) => `<div class="grpFile"><div class="grpFilePreview">${filePreview(item)}</div><div><b>${esc(item.file.name)}</b><small>${esc(formatBytes(item.file.size))}${item.status ? ` · ${esc(item.status)}` : ''}</small></div><button type="button" data-grp-remove-file="${index}">×</button></div>`).join('')}</div></div>`;
  const selectedBrand = state.brands.find((brand) => brand.id === draft.brandId);
  return `<div><span class="grpEyebrow">Adım 4 / 4</span><h2>Yayınlamadan önce kontrol et.</h2><div class="grpReviewRows"><div class="grpReviewRow"><span>Marka</span><b>${esc(selectedBrand?.name || '—')}</b></div><div class="grpReviewRow"><span>Kategori</span><b>${esc(draft.category || '—')}</b></div><div class="grpReviewRow"><span>Başlık</span><b>${esc(draft.title || '—')}</b></div><div class="grpReviewRow"><span>Detay</span><p>${esc(draft.details || '—')}</p></div><div class="grpReviewRow"><span>Beklenen çözüm</span><p>${esc(draft.requestedSolution || 'Belirtilmedi')}</p></div><div class="grpReviewRow"><span>Kanıt</span><b>${state.create.files.length} dosya</b></div></div><label class="grpNotice" style="display:flex;gap:9px;align-items:flex-start;margin-top:14px"><input type="checkbox" data-grp-consent ${draft.consent ? 'checked' : ''}><span>Şikayet metnimin, takma adımın ve yüklediğim kanıtların kamusal şikayet sayfasında görüntüleneceğini biliyorum. Gerçek adım ve e-posta adresim yayımlanmayacak.</span></label></div>`;
}

function createPage() {
  return `<section class="grpFormPage"><div class="grpWrap"><div class="grpSectionHead"><div><span class="grpEyebrow">Şikayet Oluştur</span><h2>Deneyimini gerçek bir dosyaya dönüştür.</h2><p>Şikayetin marka profiline bağlanır; kanıtları, yanıtları ve çözüm süreci aynı sayfada izlenir.</p></div></div><div class="grpFormLayout"><form class="grpFormCard" data-grp-complaint-form>${createStepContent()}<div class="grpFormActions"><button class="grpGhost" type="button" data-grp-step-back ${state.create.step === 1 || state.create.busy ? 'disabled' : ''}>Geri</button>${state.create.step < 4 ? `<button class="grpPrimary" type="button" data-grp-step-next>Devam Et</button>` : `<button class="grpPrimary" type="submit" ${state.create.busy ? 'disabled' : ''}>${state.create.busy ? 'Şikayet dosyası oluşturuluyor…' : 'Şikayeti Yayınla'}</button>`}</div></form><aside class="grpFormCard"><h3>Süreç</h3><div class="grpStepper">${['Marka seçimi', 'Şikayet detayı', 'Kanıtlar', 'Önizleme ve yayın'].map((label, index) => `<div class="grpStepItem ${state.create.step === index + 1 ? 'active' : ''}"><span class="grpStepNo">${index + 1}</span><b>${label}</b></div>`).join('')}</div><div class="grpNotice" style="margin-top:15px">Şikayet yayınlandıktan sonra kalıcı bir <b>GVN dosya numarası</b> alır ve marka karnesinde görünür.</div></aside></div></div></section>`;
}

async function renderCreate() {
  const token = ++state.token;
  mount('<div class="grpWrap grpLoading" style="margin-top:36px">Şikayet oluşturma akışı hazırlanıyor…</div>', { active: 'complaints', title: 'Şikayet Oluştur' });
  try {
    if (!state.brands.length) state.brands = await rpc('get_public_brand_directory', { p_search: null, p_limit: 100 }) || [];
    const presetSlug = new URLSearchParams(location.search).get('marka');
    if (presetSlug && !state.create.draft.brandId) state.create.draft.brandId = state.brands.find((brand) => brand.slug === presetSlug)?.id || '';
    if (token !== state.token || pathNow() !== '/sikayet-olustur') return;
    mount(createPage(), { active: 'complaints', title: 'Şikayet Oluştur', description: 'Marka seç, deneyimini anlat, kanıtlarını ekle ve şikayetini yayınla.' });
  } catch (error) {
    mount(`<div class="grpWrap grpEmpty" style="margin-top:36px"><p>${esc(error?.message || 'Form hazırlanamadı.')}</p></div>`, { active: 'complaints', title: 'Şikayet Oluştur' });
  }
}

function validateStep() {
  const draft = state.create.draft;
  if (state.create.step === 1 && !draft.brandId) return 'Devam etmek için marka seçmelisin.';
  if (state.create.step === 2) {
    if (!draft.category) return 'Kategori seçmelisin.';
    if (draft.title.trim().length < 4) return 'Başlık en az 4 karakter olmalı.';
    if (draft.details.trim().length < 12) return 'Şikayet detayını en az 12 karakterle açıklamalısın.';
  }
  if (state.create.step === 4 && !draft.consent) return 'Kamusal yayın bilgilendirmesini onaylamalısın.';
  return '';
}

function validateFile(file) {
  if (!(file instanceof File) || !ACCEPTED_TYPES.has(file.type)) return `${file?.name || 'Dosya'} desteklenmiyor.`;
  const limit = file.type.startsWith('video/') ? MAX_VIDEO_BYTES : MAX_DOCUMENT_BYTES;
  if (file.size > limit) return `${file.name} boyut sınırını aşıyor.`;
  return '';
}

function addFiles(fileList) {
  for (const file of Array.from(fileList || [])) {
    if (state.create.files.length >= MAX_FILES) { toast(`En fazla ${MAX_FILES} dosya ekleyebilirsin.`, true); break; }
    const error = validateFile(file);
    if (error) { toast(error, true); continue; }
    const duplicate = state.create.files.some((item) => item.file.name === file.name && item.file.size === file.size && item.file.lastModified === file.lastModified);
    if (!duplicate) state.create.files.push({ file, previewUrl: URL.createObjectURL(file), status: '' });
  }
  mount(createPage(), { active: 'complaints', title: 'Şikayet Oluştur' });
}

async function uploadEvidence(session, complaint) {
  const uploadedRows = [];
  for (const [index, item] of state.create.files.entries()) {
    item.status = 'yükleniyor';
    mount(createPage(), { active: 'complaints', title: 'Şikayet Oluştur' });
    const unique = crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const filePath = `${session.user.id}/${complaint.public_id}/${unique}-${sanitizeFilename(item.file.name)}`;
    const storage = platformStore.supabase.storage.from(PRIVATE_BUCKET);
    const uploaded = await storage.upload(filePath, item.file, { contentType: item.file.type, upsert: false, cacheControl: '3600' });
    if (uploaded.error) { item.status = 'başarısız'; throw uploaded.error; }
    const mediaKind = item.file.type.startsWith('image/') ? 'image' : item.file.type.startsWith('video/') ? 'video' : 'document';
    const inserted = await platformStore.supabase.from('complaint_attachments').insert({
      user_id: session.user.id,
      complaint_id: complaint.id,
      local_complaint_id: complaint.public_id,
      file_path: filePath,
      file_name: item.file.name,
      file_size: item.file.size,
      mime_type: item.file.type,
      media_kind: mediaKind,
      evidence_type: mediaKind === 'image' ? 'screenshot' : mediaKind === 'video' ? 'video_record' : 'document',
      upload_status: 'uploaded',
      scan_status: 'pending',
      moderation_status: 'approved',
    }).select('id').single();
    if (inserted.error) {
      await storage.remove([filePath]);
      item.status = 'başarısız';
      throw inserted.error;
    }
    item.status = 'yüklendi';
    uploadedRows.push(inserted.data);
    if (index < state.create.files.length - 1) mount(createPage(), { active: 'complaints', title: 'Şikayet Oluştur' });
  }
  return uploadedRows;
}

async function submitComplaint() {
  const validation = validateStep();
  if (validation) { toast(validation, true); return; }
  if (state.create.busy) return;
  state.create.busy = true;
  mount(createPage(), { active: 'complaints', title: 'Şikayet Oluştur' });
  try {
    const session = await platformStore.getCurrentSession();
    if (!session?.user?.id || session.localOnly || !platformStore.supabase) throw new Error('Şikayet yayınlamak için giriş yapmalısın.');
    const brand = state.brands.find((item) => item.id === state.create.draft.brandId);
    if (!brand) throw new Error('Seçilen marka bulunamadı.');
    const result = await platformStore.supabase.rpc('create_complaint_case', {
      p_brand_id: brand.id,
      p_brand_name: brand.name,
      p_category: state.create.draft.category,
      p_title: state.create.draft.title.trim(),
      p_description: state.create.draft.details.trim(),
      p_requested_solution: state.create.draft.requestedSolution.trim() || null,
    });
    if (result.error) throw result.error;
    const complaint = Array.isArray(result.data) ? result.data[0] : result.data;
    if (!complaint?.id || !complaint?.public_id) throw new Error('Şikayet dosyası oluşturulamadı.');
    if (state.create.files.length) await uploadEvidence(session, complaint);
    toast(`${complaint.public_id} numaralı şikayet dosyan yayınlandı.`);
    state.create.files.forEach((item) => item.previewUrl && URL.revokeObjectURL(item.previewUrl));
    state.create = { step: 1, busy: false, files: [], draft: { brandId: '', category: '', title: '', details: '', requestedSolution: '', consent: true } };
    navigate(`/sikayet/${complaint.public_id}`);
  } catch (error) {
    state.create.busy = false;
    mount(createPage(), { active: 'complaints', title: 'Şikayet Oluştur' });
    toast(error?.message || 'Şikayet yayınlanamadı.', true);
  }
}

async function route() {
  const path = pathNow();
  if (!isPlatformRoute(path)) { ++state.token; unmount(); return; }
  if (path === '/sikayetler') { await renderDiscovery(); return; }
  if (path === '/markalar') { await renderBrands(); return; }
  if (path === '/sikayet-olustur') { await renderCreate(); return; }
  const brandMatch = path.match(/^\/marka\/([^/]+)$/i);
  if (brandMatch) { await renderBrand(decodeURIComponent(brandMatch[1])); return; }
  const complaintMatch = path.match(/^\/sikayet\/([^/]+)$/i);
  if (complaintMatch) { await renderDossier(decodeURIComponent(complaintMatch[1]).toUpperCase()); }
}

document.addEventListener('click', async (event) => {
  const nav = event.target.closest?.('[data-grp-nav]');
  if (nav) { event.preventDefault(); navigate(nav.dataset.grpNav); return; }
  const complaint = event.target.closest?.('[data-grp-case]');
  if (complaint) { navigate(`/sikayet/${complaint.dataset.grpCase}`); return; }
  const brand = event.target.closest?.('[data-grp-brand]');
  if (brand) { navigate(`/marka/${brand.dataset.grpBrand}`); return; }
  const status = event.target.closest?.('[data-grp-status]');
  if (status) { state.discovery.status = status.dataset.grpStatus; mount(discoveryPage(), { active: 'complaints', title: 'Şikayet Ağı' }); return; }
  const category = event.target.closest?.('[data-grp-category]');
  if (category) { state.discovery.category = category.dataset.grpCategory; mount(discoveryPage(), { active: 'complaints', title: 'Şikayet Ağı' }); return; }
  const createBrand = event.target.closest?.('[data-grp-create-brand]');
  if (createBrand) {
    state.create.draft.brandId = createBrand.dataset.grpCreateBrand;
    state.create.step = 1;
    navigate('/sikayet-olustur');
    return;
  }
  if (event.target.closest?.('[data-grp-step-next]')) {
    const error = validateStep();
    if (error) { toast(error, true); return; }
    state.create.step = Math.min(4, state.create.step + 1);
    mount(createPage(), { active: 'complaints', title: 'Şikayet Oluştur' });
    return;
  }
  if (event.target.closest?.('[data-grp-step-back]')) {
    state.create.step = Math.max(1, state.create.step - 1);
    mount(createPage(), { active: 'complaints', title: 'Şikayet Oluştur' });
    return;
  }
  const remove = event.target.closest?.('[data-grp-remove-file]');
  if (remove) {
    const index = Number(remove.dataset.grpRemoveFile);
    const item = state.create.files[index];
    if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
    if (Number.isInteger(index)) state.create.files.splice(index, 1);
    mount(createPage(), { active: 'complaints', title: 'Şikayet Oluştur' });
    return;
  }
  const share = event.target.closest?.('[data-grp-share]');
  if (share) {
    const url = `${location.origin}/sikayet/${share.dataset.grpShare}`;
    try {
      if (navigator.share) await navigator.share({ title: 'Güveniyorum şikayet dosyası', url });
      else { await navigator.clipboard.writeText(url); toast('Şikayet bağlantısı kopyalandı.'); }
    } catch { /* User cancelled share. */ }
  }
});

document.addEventListener('input', (event) => {
  if (event.target.matches?.('[data-grp-search]')) {
    state.discovery.search = event.target.value;
    const main = document.querySelector('[data-grp-main]');
    if (main) main.innerHTML = discoveryPage();
  }
  if (event.target.matches?.('[data-grp-brand-search]')) {
    state.brandSearch = event.target.value;
    const main = document.querySelector('[data-grp-main]');
    if (main) main.innerHTML = brandsPage();
  }
  const field = event.target.closest?.('[data-grp-draft]');
  if (field) state.create.draft[field.dataset.grpDraft] = field.value;
});

document.addEventListener('change', (event) => {
  const field = event.target.closest?.('[data-grp-draft]');
  if (field) state.create.draft[field.dataset.grpDraft] = field.value;
  if (event.target.matches?.('[data-grp-consent]')) state.create.draft.consent = event.target.checked;
  if (event.target.matches?.('[data-grp-files]')) {
    addFiles(event.target.files);
    event.target.value = '';
  }
});

document.addEventListener('submit', (event) => {
  if (!event.target.matches?.('[data-grp-complaint-form]')) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  submitComplaint();
}, true);

document.addEventListener('keydown', (event) => {
  if (!['Enter', ' '].includes(event.key)) return;
  const complaint = event.target.closest?.('[data-grp-case]');
  const brand = event.target.closest?.('[data-grp-brand]');
  if (complaint) { event.preventDefault(); navigate(`/sikayet/${complaint.dataset.grpCase}`); }
  else if (brand) { event.preventDefault(); navigate(`/marka/${brand.dataset.grpBrand}`); }
});

window.addEventListener('popstate', route);
window.addEventListener('gi:auth', () => { if (isPlatformRoute()) route(); });

ensureStyles();
route();
