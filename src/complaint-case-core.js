import { platformStore } from './platform-store.js';

const DIAMOND_KEY = 'guveniyorum-diamond-state-v2';
const MY_CASES_PATH = '/profil/sikayetlerim';
const ADMIN_PATHS = new Set(['/admin/sikayetler', '/admin-sikayetler']);
const STAFF_ROLES = new Set(['admin', 'moderator']);
const STATUS_LABELS = {
  submitted: 'Gönderildi',
  pending: 'Beklemede',
  pending_review: 'İncelemede',
  in_review: 'İncelemede',
  brand_waiting: 'Marka Yanıtı Bekleniyor',
  user_action: 'Kullanıcı Yanıtı Bekleniyor',
  resolution_offered: 'Çözüm Sunuldu',
  resolved: 'Çözüldü',
  closed: 'Kapandı',
  rejected: 'Reddedildi',
};

window.__giCaseCoreActive = true;

let submitBusy = false;
let pendingReloadId = '';
let reloadTimer = null;
let ownCases = [];
let ownSelectedId = '';
let staffRole = null;
let adminCases = [];
let adminProfiles = new Map();
let adminLoadedAt = 0;
let routeVersion = 0;

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[char]));
}

function safeJson(value, fallback = null) {
  try { return JSON.parse(value); } catch { return fallback; }
}

function currentPath() {
  return location.pathname.replace(/\/+$/, '') || '/';
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(date);
}

function formatBytes(value = 0) {
  const bytes = Number(value || 0);
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function statusLabel(status) {
  return STATUS_LABELS[status] || status || 'Gönderildi';
}

function ensureStyles() {
  if (document.getElementById('complaint-case-core-style')) return;
  const style = document.createElement('style');
  style.id = 'complaint-case-core-style';
  style.textContent = `
    .ccToast{position:fixed;right:18px;bottom:18px;z-index:14000;max-width:min(460px,calc(100vw - 36px));padding:13px 15px;border:1px solid rgba(37,240,132,.34);border-radius:14px;background:rgba(8,19,33,.98);color:#d9ffe7;box-shadow:0 18px 60px rgba(0,0,0,.38);font:850 13px/1.45 Inter,system-ui,sans-serif}.ccToast.error{border-color:rgba(255,77,109,.35);color:#ffc2cb}
    .ccShell{position:fixed;inset:0;z-index:11500;overflow:auto;background:radial-gradient(circle at 12% 0,rgba(37,240,132,.10),transparent 34%),#050b14;color:#eef7ff;font-family:Inter,ui-sans-serif,system-ui,-apple-system,sans-serif}.ccTop{position:sticky;top:0;z-index:4;display:flex;align-items:center;justify-content:space-between;gap:14px;padding:16px 22px;border-bottom:1px solid rgba(178,204,255,.12);background:rgba(5,11,20,.93);backdrop-filter:blur(18px)}.ccBrand{display:flex;align-items:center;gap:11px}.ccMark{width:40px;height:40px;display:grid;place-items:center;border-radius:14px;background:linear-gradient(135deg,#25f084,#22d3ee);color:#03120b;font-weight:1000;box-shadow:0 0 30px rgba(37,240,132,.22)}.ccBrand b{display:block}.ccBrand small{display:block;color:#8fa3ba;margin-top:2px}.ccActions{display:flex;gap:8px;flex-wrap:wrap}.ccBtn{border:1px solid rgba(178,204,255,.14);border-radius:12px;background:rgba(255,255,255,.045);color:#edf7ff;padding:10px 13px;font-weight:850;cursor:pointer}.ccBtn.primary{border-color:rgba(37,240,132,.35);background:rgba(37,240,132,.12);color:#d5ffe4}.ccBtn.danger{border-color:rgba(255,77,109,.28);background:rgba(255,77,109,.08);color:#ffc2cb}.ccBody{max-width:1120px;margin:0 auto;padding:28px 20px 56px}.ccHero{display:grid;grid-template-columns:1.15fr .85fr;gap:18px;align-items:stretch}.ccIntro,.ccStats,.ccCard,.ccDetail,.ccTimeline{border:1px solid rgba(178,204,255,.12);border-radius:22px;background:linear-gradient(150deg,rgba(13,24,41,.96),rgba(7,15,27,.96));box-shadow:0 22px 70px rgba(0,0,0,.28)}.ccIntro{padding:24px}.ccIntro h1{margin:0 0 10px;font-size:clamp(34px,5vw,60px);line-height:.96;letter-spacing:-.055em}.ccIntro p{margin:0;color:#98abc1;line-height:1.55}.ccStats{display:grid;grid-template-columns:repeat(2,1fr);gap:1px;overflow:hidden}.ccStat{padding:18px;background:rgba(255,255,255,.025)}.ccStat b{display:block;font-size:25px;color:#9fffc0}.ccStat small{color:#8094ab}.ccList{display:grid;gap:12px;margin-top:18px}.ccCard{padding:17px;cursor:pointer}.ccCard:hover{border-color:rgba(37,240,132,.34)}.ccCardHead{display:flex;justify-content:space-between;gap:12px}.ccCardHead b{font-size:15px}.ccPill{flex:none;padding:5px 8px;border:1px solid rgba(34,211,238,.24);border-radius:999px;background:rgba(34,211,238,.08);color:#c9f7ff;font-size:10px;font-weight:900}.ccCard h3{margin:12px 0 6px}.ccCard p{margin:0;color:#91a4bc;line-height:1.5}.ccMeta{display:flex;gap:10px;flex-wrap:wrap;margin-top:12px;color:#8296ad;font-size:11px}.ccEmpty{display:grid;place-items:center;min-height:320px;padding:30px;text-align:center;border:1px dashed rgba(178,204,255,.15);border-radius:22px;color:#91a4bc}.ccModal{position:fixed;inset:0;z-index:14500;display:grid;place-items:center;padding:18px;background:rgba(1,4,8,.84);backdrop-filter:blur(14px)}.ccModalCard{width:min(1040px,100%);max-height:92vh;overflow:auto;border:1px solid rgba(178,204,255,.14);border-radius:22px;background:#07101d;color:#eef7ff;box-shadow:0 30px 100px rgba(0,0,0,.55)}.ccModalHead{position:sticky;top:0;z-index:2;display:flex;justify-content:space-between;align-items:center;gap:12px;padding:16px 18px;border-bottom:1px solid rgba(178,204,255,.12);background:rgba(7,16,29,.95)}.ccModalBody{padding:18px}.ccDetail{padding:18px}.ccDetail h2{margin:0 0 8px}.ccDetail p{color:#a7b8ca;line-height:1.65}.ccTimeline{padding:16px;margin-top:14px}.ccTimelineItem{display:grid;grid-template-columns:12px 1fr;gap:10px;padding:9px 0;border-bottom:1px solid rgba(178,204,255,.08)}.ccTimelineItem:last-child{border-bottom:0}.ccDot{width:10px;height:10px;margin-top:5px;border-radius:999px;background:#25f084;box-shadow:0 0 16px rgba(37,240,132,.55)}.ccTimelineItem small{display:block;color:#8296ad;margin-top:3px}.ccProfileShortcut{display:inline-flex!important}.ccAdminSection{margin-top:12px;padding-top:12px;border-top:1px solid rgba(178,204,255,.10)}.ccAdminTitle{display:flex;align-items:center;justify-content:space-between;margin-bottom:9px;color:#dfffee}.ccAdminCase{width:100%;padding:12px;text-align:left;border:1px solid rgba(37,240,132,.16);border-radius:14px;background:rgba(37,240,132,.045);color:#eef7ff;cursor:pointer;margin-bottom:8px}.ccAdminCase:hover{border-color:rgba(37,240,132,.38)}.ccAdminCase b{display:block}.ccAdminCase small{color:#8fa3ba}.ccAdminDetail{display:grid;gap:14px}.ccAdminGrid{display:grid;grid-template-columns:repeat(4,1fr);gap:9px}.ccAdminMetric{padding:11px;border:1px solid rgba(178,204,255,.11);border-radius:13px;background:rgba(255,255,255,.03)}.ccAdminMetric b{display:block}.ccAdminMetric small{color:#8195ad}.ccAdminEvidence{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.ccAdminAsset{overflow:hidden;border:1px solid rgba(178,204,255,.12);border-radius:16px;background:#081321}.ccAdminMedia{height:250px;display:grid;place-items:center;background:#02060b}.ccAdminMedia img,.ccAdminMedia video,.ccAdminMedia iframe{width:100%;height:100%;object-fit:contain;border:0}.ccAdminAssetInfo{padding:11px}.ccStatusForm{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.ccStatusSelect{border:1px solid rgba(178,204,255,.16);border-radius:11px;background:#0b1524;color:#eef7ff;padding:10px}.ccLoading{padding:30px;text-align:center;color:#91a4bc}@media(max-width:840px){.ccHero{grid-template-columns:1fr}.ccAdminGrid{grid-template-columns:repeat(2,1fr)}.ccAdminEvidence{grid-template-columns:1fr}.ccTop{padding:13px}.ccBody{padding:18px 13px 44px}}
  `;
  document.head.appendChild(style);
}

function toast(message, tone = 'success') {
  document.querySelector('[data-cc-toast]')?.remove();
  const node = document.createElement('div');
  node.className = `ccToast ${tone === 'error' ? 'error' : ''}`;
  node.dataset.ccToast = '';
  node.textContent = message;
  document.body.appendChild(node);
  setTimeout(() => node.remove(), 5200);
}

function readDiamondState() {
  return safeJson(localStorage.getItem(DIAMOND_KEY), null);
}

function writeDiamondState(state) {
  localStorage.setItem(DIAMOND_KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent('gi:state', { detail: state }));
}

function mirrorCase(row) {
  const state = readDiamondState() || {};
  state.complaints = Array.isArray(state.complaints) ? state.complaints : [];
  state.complaintRewards = state.complaintRewards || {};
  state.activityLog = Array.isArray(state.activityLog) ? state.activityLog : [];
  state.feed = Array.isArray(state.feed) ? state.feed : [];

  const complaint = {
    id: row.public_id,
    serverId: row.id,
    brandId: row.brand_id || null,
    brand: row.brand_name || 'Bilinmeyen Marka',
    category: row.category || 'Genel bildirim',
    title: row.title,
    details: row.description,
    status: statusLabel(row.status),
    centralStatus: row.status,
    priority: row.priority || 'normal',
    central: true,
    createdAt: row.created_at,
    updatedAt: row.updated_at || row.created_at,
  };

  state.complaints = [complaint, ...state.complaints.filter((item) => item.serverId !== row.id && item.id !== row.public_id)];
  if (!state.complaintRewards[row.public_id]?.created) {
    state.points = Number(state.points || 0) + 40;
    state.contribution = Math.min(100, Number(state.contribution || 0) + 2);
    state.complaintRewards[row.public_id] = { ...(state.complaintRewards[row.public_id] || {}), created: true };
    state.activityLog.unshift({
      id: `complaint_create:${row.id}`,
      type: 'complaint_create',
      refId: row.id,
      label: `${row.public_id} şikayet oluşturuldu`,
      points: 40,
      contribution: 2,
      createdAt: row.created_at,
    });
    state.feed.unshift(`${row.public_id} merkezi şikayet dosyası açıldı · +40 puan`);
  }
  writeDiamondState(state);
  return complaint;
}

async function sessionRequired() {
  const session = await platformStore.getCurrentSession();
  if (!session?.user?.id || session.localOnly || !platformStore.supabase) {
    throw new Error('Şikayet dosyası oluşturmak için giriş yapmalısın.');
  }
  return session;
}

async function resolveBrand(brandName) {
  if (!brandName) return { id: null, name: 'Bilinmeyen Marka' };
  const result = await platformStore.supabase
    .from('brands')
    .select('id,name')
    .ilike('name', brandName)
    .limit(1)
    .maybeSingle();
  if (result.error || !result.data) return { id: null, name: brandName };
  return result.data;
}

async function createCentralCase(formData) {
  await sessionRequired();
  const brandName = String(formData.get('brand') || '').trim() || 'Bilinmeyen Marka';
  const category = String(formData.get('category') || '').trim() || 'Genel bildirim';
  const title = String(formData.get('title') || '').trim();
  const description = String(formData.get('details') || '').trim();
  const requestedSolution = String(formData.get('requestedSolution') || '').trim() || null;

  if (title.length < 4) throw new Error('Başlık en az 4 karakter olmalı.');
  if (description.length < 12) throw new Error('Şikayet detayını en az 12 karakterle açıklamalısın.');

  const brand = await resolveBrand(brandName);
  const result = await platformStore.supabase.rpc('create_complaint_case', {
    p_brand_id: brand.id,
    p_brand_name: brand.name || brandName,
    p_category: category,
    p_title: title,
    p_description: description,
    p_requested_solution: requestedSolution,
  });
  if (result.error) throw result.error;
  const row = Array.isArray(result.data) ? result.data[0] : result.data;
  if (!row?.id || !row?.public_id) throw new Error('Merkezi şikayet dosyası oluşturulamadı.');
  return row;
}

function scheduleReload(publicId, timeout = 900) {
  pendingReloadId = publicId;
  clearTimeout(reloadTimer);
  reloadTimer = setTimeout(() => {
    if (pendingReloadId === publicId) location.reload();
  }, timeout);
}

async function handleComplaintSubmit(event) {
  const form = event.target.closest?.('form[data-complaint-form]');
  if (!form) return;

  event.preventDefault();
  event.stopPropagation();
  if (submitBusy) return;

  const submit = form.querySelector('button[type="submit"]');
  const originalLabel = submit?.textContent || '';
  submitBusy = true;
  if (submit) { submit.disabled = true; submit.textContent = 'Güvenli dosya oluşturuluyor…'; }

  try {
    const row = await createCentralCase(new FormData(form));
    const localComplaint = mirrorCase(row);
    form.reset();
    toast(`${row.public_id} numaralı şikayet dosyan oluşturuldu.`);
    window.dispatchEvent(new CustomEvent('gi:complaint-created', {
      detail: {
        complaint: {
          id: row.id,
          publicId: row.public_id,
          localComplaintId: row.public_id,
          brandId: row.brand_id,
          brandName: row.brand_name,
          title: row.title,
          description: row.description,
          createdAt: row.created_at,
        },
        localComplaint,
      },
    }));
    scheduleReload(row.public_id, 12000);
  } catch (error) {
    toast(error?.message || 'Şikayet dosyası oluşturulamadı.', 'error');
  } finally {
    submitBusy = false;
    if (submit) { submit.disabled = false; submit.textContent = originalLabel; }
  }
}

async function fetchOwnCases() {
  const session = await sessionRequired();
  const result = await platformStore.supabase
    .from('complaints')
    .select('id,public_id,brand_id,brand_name,category,title,description,status,priority,requested_solution,created_at,updated_at,closed_at')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });
  if (result.error) throw result.error;
  ownCases = result.data || [];
  if (!ownCases.some((item) => item.id === ownSelectedId)) ownSelectedId = ownCases[0]?.id || '';
  return ownCases;
}

async function attachmentCounts(caseIds) {
  if (!caseIds.length) return new Map();
  const result = await platformStore.supabase
    .from('complaint_attachments')
    .select('complaint_id')
    .in('complaint_id', caseIds);
  const counts = new Map();
  if (!result.error) (result.data || []).forEach((row) => counts.set(row.complaint_id, (counts.get(row.complaint_id) || 0) + 1));
  return counts;
}

function myCasesShell(cases, counts) {
  const openCount = cases.filter((item) => !['resolved', 'closed', 'rejected'].includes(item.status)).length;
  const resolvedCount = cases.filter((item) => ['resolved', 'closed'].includes(item.status)).length;
  const evidenceCount = [...counts.values()].reduce((sum, value) => sum + value, 0);
  return `
    <div class="ccShell" data-cc-shell>
      <header class="ccTop">
        <div class="ccBrand"><div class="ccMark">G</div><div><b>Şikayet Dosyalarım</b><small>Merkezi kayıt · cihazlar arası erişim · güvenli kanıt bağlantısı</small></div></div>
        <div class="ccActions"><button class="ccBtn" data-cc-refresh>Yenile</button><button class="ccBtn primary" data-cc-new>Yeni Şikayet</button><button class="ccBtn" data-cc-profile>Profilim</button></div>
      </header>
      <main class="ccBody">
        <section class="ccHero">
          <div class="ccIntro"><h1>Dosyaların artık<br>tek merkezde.</h1><p>Şikayet metni, marka, durum geçmişi ve kanıtların Supabase üzerinde gerçek bir dosya olarak saklanır.</p></div>
          <div class="ccStats"><div class="ccStat"><b>${cases.length}</b><small>TOPLAM DOSYA</small></div><div class="ccStat"><b>${openCount}</b><small>AÇIK DOSYA</small></div><div class="ccStat"><b>${resolvedCount}</b><small>ÇÖZÜLEN</small></div><div class="ccStat"><b>${evidenceCount}</b><small>KANIT</small></div></div>
        </section>
        <section class="ccList">
          ${cases.length ? cases.map((item) => `<article class="ccCard" data-cc-own-case="${esc(item.id)}"><div class="ccCardHead"><b>${esc(item.public_id)}</b><span class="ccPill">${esc(statusLabel(item.status))}</span></div><h3>${esc(item.title)}</h3><p>${esc(item.description)}</p><div class="ccMeta"><span>${esc(item.brand_name || 'Bilinmeyen Marka')}</span><span>${esc(item.category || 'Genel')}</span><span>${counts.get(item.id) || 0} kanıt</span><span>${esc(formatDate(item.created_at))}</span></div></article>`).join('') : '<div class="ccEmpty"><div><h2>Henüz merkezi şikayet dosyan yok</h2><p>İlk dosyanı oluşturduğunda tüm süreç burada görünecek.</p><button class="ccBtn primary" data-cc-new>Şikayet Oluştur</button></div></div>'}
        </section>
      </main>
    </div>`;
}

async function historyForCase(caseId) {
  const result = await platformStore.supabase
    .from('complaint_status_history')
    .select('id,from_status,to_status,actor_role,note,created_at')
    .eq('complaint_id', caseId)
    .order('created_at', { ascending: true });
  return result.error ? [] : result.data || [];
}

async function openOwnCase(caseId) {
  const item = ownCases.find((row) => row.id === caseId);
  if (!item) return;
  const history = await historyForCase(caseId);
  document.querySelector('[data-cc-modal]')?.remove();
  const modal = document.createElement('div');
  modal.className = 'ccModal';
  modal.dataset.ccModal = '';
  modal.innerHTML = `<div class="ccModalCard"><div class="ccModalHead"><b>${esc(item.public_id)} · ${esc(statusLabel(item.status))}</b><button class="ccBtn" data-cc-close>Kapat</button></div><div class="ccModalBody"><section class="ccDetail"><span class="ccPill">${esc(item.brand_name || 'Bilinmeyen Marka')}</span><h2>${esc(item.title)}</h2><p>${esc(item.description)}</p><div class="ccMeta"><span>${esc(item.category || 'Genel')}</span><span>Öncelik: ${esc(item.priority || 'normal')}</span><span>${esc(formatDate(item.created_at))}</span></div></section><section class="ccTimeline"><h3>Durum Geçmişi</h3>${history.length ? history.map((entry) => `<div class="ccTimelineItem"><span class="ccDot"></span><div><b>${esc(statusLabel(entry.to_status))}</b><small>${esc(entry.actor_role || 'system')} · ${esc(formatDate(entry.created_at))}${entry.note ? ` · ${esc(entry.note)}` : ''}</small></div></div>`).join('') : '<p>Henüz durum hareketi yok.</p>'}</section></div></div>`;
  document.body.appendChild(modal);
}

async function renderMyCases() {
  const version = ++routeVersion;
  document.querySelector('[data-cc-shell]')?.remove();
  if (currentPath() !== MY_CASES_PATH) return;
  ensureStyles();
  const loading = document.createElement('div');
  loading.innerHTML = '<div class="ccShell" data-cc-shell><div class="ccLoading">Merkezi şikayet dosyaların yükleniyor…</div></div>';
  document.body.appendChild(loading.firstElementChild);
  try {
    const cases = await fetchOwnCases();
    if (version !== routeVersion || currentPath() !== MY_CASES_PATH) return;
    const counts = await attachmentCounts(cases.map((item) => item.id));
    document.querySelector('[data-cc-shell]').outerHTML = myCasesShell(cases, counts);
  } catch (error) {
    const shell = document.querySelector('[data-cc-shell]');
    if (shell) shell.innerHTML = `<div class="ccEmpty"><div><h2>${error?.message === 'Şikayet dosyası oluşturmak için giriş yapmalısın.' ? 'Giriş gerekli' : 'Dosyalar açılamadı'}</h2><p>${esc(error?.message || 'Beklenmeyen hata.')}</p><button class="ccBtn primary" data-cc-home>Ana Sayfaya Dön</button></div></div>`;
  }
}

async function roleForSession() {
  const session = await platformStore.getCurrentSession();
  if (!session?.user?.id || session.localOnly || !platformStore.supabase) return { session: null, role: null };
  const roleResult = await platformStore.supabase.from('user_roles').select('role').eq('user_id', session.user.id).maybeSingle();
  return { session, role: roleResult.error ? null : roleResult.data?.role || null };
}

async function loadAdminCases(force = false) {
  if (!ADMIN_PATHS.has(currentPath())) return [];
  if (!force && adminCases.length && Date.now() - adminLoadedAt < 15000) return adminCases;
  const identity = await roleForSession();
  staffRole = identity.role;
  if (!identity.session || !STAFF_ROLES.has(staffRole)) return [];
  const result = await platformStore.supabase
    .from('complaints')
    .select('id,public_id,user_id,brand_id,brand_name,category,title,description,status,priority,requested_solution,created_at,updated_at,closed_at')
    .order('created_at', { ascending: false })
    .limit(250);
  if (result.error) throw result.error;
  adminCases = result.data || [];
  adminLoadedAt = Date.now();
  adminProfiles = new Map();
  const ids = [...new Set(adminCases.map((item) => item.user_id).filter(Boolean))];
  if (ids.length) {
    const profiles = await platformStore.supabase.from('profiles').select('user_id,nickname,display_name,avatar_key').in('user_id', ids);
    if (!profiles.error) (profiles.data || []).forEach((profile) => adminProfiles.set(profile.user_id, profile));
  }
  return adminCases;
}

function injectAdminCases() {
  if (!ADMIN_PATHS.has(currentPath()) || !STAFF_ROLES.has(staffRole)) return;
  const list = document.querySelector('.ecCases');
  if (!list || list.querySelector('[data-cc-admin-section]')) return;
  const section = document.createElement('section');
  section.className = 'ccAdminSection';
  section.dataset.ccAdminSection = '';
  section.innerHTML = `<div class="ccAdminTitle"><b>Merkezi Şikayet Dosyaları</b><span class="ecPill">${adminCases.length}</span></div>${adminCases.length ? adminCases.map((item) => { const profile = adminProfiles.get(item.user_id) || {}; return `<button class="ccAdminCase" data-cc-admin-case="${esc(item.id)}"><b>${esc(item.public_id)} · ${esc(item.title)}</b><small>${esc(profile.nickname || profile.display_name || 'Kullanıcı')} · ${esc(item.brand_name || 'Bilinmeyen Marka')} · ${esc(statusLabel(item.status))}</small></button>`; }).join('') : '<p class="ecMeta" style="text-align:left">Henüz merkezi dosya yok.</p>'}`;
  list.prepend(section);
}

async function signedAttachments(caseId) {
  const result = await platformStore.supabase
    .from('complaint_attachments')
    .select('id,file_path,file_name,file_size,mime_type,moderation_status,created_at')
    .eq('complaint_id', caseId)
    .order('created_at', { ascending: true });
  if (result.error) throw result.error;
  return Promise.all((result.data || []).map(async (item) => {
    const signed = await platformStore.supabase.storage.from('complaint-evidence').createSignedUrl(item.file_path, 300);
    return { ...item, signedUrl: signed.error ? '' : signed.data?.signedUrl || '' };
  }));
}

function adminMedia(item) {
  if (!item.signedUrl) return '<div class="ccLoading">Dosya bağlantısı oluşturulamadı.</div>';
  const url = esc(item.signedUrl);
  if (String(item.mime_type).startsWith('image/')) return `<img src="${url}" alt="${esc(item.file_name)}">`;
  if (String(item.mime_type).startsWith('video/')) return `<video src="${url}" controls playsinline preload="metadata"></video>`;
  if (item.mime_type === 'application/pdf') return `<iframe src="${url}" title="${esc(item.file_name)}"></iframe>`;
  return `<a class="ccBtn primary" href="${url}" target="_blank" rel="noopener">Dosyayı Aç</a>`;
}

async function renderAdminCase(caseId) {
  const main = document.querySelector('[data-ec-main]');
  const item = adminCases.find((row) => row.id === caseId);
  if (!main || !item) return;
  main.innerHTML = '<div class="ccLoading">Şikayet dosyası ve kanıtlar hazırlanıyor…</div>';
  const [history, attachments] = await Promise.all([historyForCase(caseId), signedAttachments(caseId)]);
  const profile = adminProfiles.get(item.user_id) || {};
  main.innerHTML = `<div class="ccAdminDetail"><section class="ecHero"><div class="ecIdentity"><div class="ecAvatar">${esc((profile.nickname || profile.display_name || 'K').slice(0, 1).toUpperCase())}</div><div><b>${esc(item.public_id)} · ${esc(item.title)}</b><small>${esc(profile.nickname || profile.display_name || 'Kullanıcı')} · ${esc(item.brand_name || 'Bilinmeyen Marka')}</small></div></div><div class="ecMeta">${esc(statusLabel(item.status))}<br><b>${esc(formatDate(item.created_at))}</b></div></section><section class="ccDetail"><h2>${esc(item.title)}</h2><p>${esc(item.description)}</p><div class="ccAdminGrid"><div class="ccAdminMetric"><b>${esc(item.category || 'Genel')}</b><small>KATEGORİ</small></div><div class="ccAdminMetric"><b>${esc(item.priority || 'normal')}</b><small>ÖNCELİK</small></div><div class="ccAdminMetric"><b>${attachments.length}</b><small>KANIT</small></div><div class="ccAdminMetric"><b>${history.length}</b><small>DURUM HAREKETİ</small></div></div><form class="ccStatusForm" data-cc-status-form><input type="hidden" name="caseId" value="${esc(item.id)}"><select class="ccStatusSelect" name="status">${Object.entries(STATUS_LABELS).filter(([key]) => ['submitted','in_review','brand_waiting','user_action','resolution_offered','resolved','closed','rejected'].includes(key)).map(([key, label]) => `<option value="${key}" ${item.status === key ? 'selected' : ''}>${esc(label)}</option>`).join('')}</select><button class="ccBtn primary" type="submit">Durumu Güncelle</button></form></section>${attachments.length ? `<section class="ccAdminEvidence">${attachments.map((file) => `<article class="ccAdminAsset"><div class="ccAdminMedia">${adminMedia(file)}</div><div class="ccAdminAssetInfo"><b>${esc(file.file_name)}</b><small>${esc(formatBytes(file.file_size))} · ${esc(file.moderation_status || 'pending')}</small></div></article>`).join('')}</section>` : '<div class="ecEmpty" style="min-height:180px"><p>Bu dosyaya henüz kanıt eklenmemiş.</p></div>'}<section class="ccTimeline"><h3>Durum Geçmişi</h3>${history.length ? history.map((entry) => `<div class="ccTimelineItem"><span class="ccDot"></span><div><b>${esc(statusLabel(entry.to_status))}</b><small>${esc(entry.actor_role || 'system')} · ${esc(formatDate(entry.created_at))}</small></div></div>`).join('') : '<p>Henüz durum hareketi yok.</p>'}</section></div>`;
}

async function updateCaseStatus(formData) {
  const id = String(formData.get('caseId') || '');
  const status = String(formData.get('status') || '');
  if (!id || !STATUS_LABELS[status] || !STAFF_ROLES.has(staffRole)) return;
  const result = await platformStore.supabase
    .from('complaints')
    .update({ status, updated_at: new Date().toISOString(), closed_at: ['closed', 'resolved'].includes(status) ? new Date().toISOString() : null })
    .eq('id', id)
    .select('id,status,updated_at,closed_at')
    .maybeSingle();
  if (result.error) throw result.error;
  const item = adminCases.find((row) => row.id === id);
  if (item && result.data) Object.assign(item, result.data);
  toast('Şikayet durumu güncellendi.');
  await renderAdminCase(id);
}

function navigate(path) {
  history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

function injectProfileShortcut() {
  if (currentPath() !== '/profil') return;
  const actions = document.querySelector('.profileHeroActions');
  if (!actions || actions.querySelector('[data-cc-my-cases]')) return;
  const link = document.createElement('a');
  link.className = 'btn ccProfileShortcut';
  link.href = MY_CASES_PATH;
  link.dataset.ccMyCases = '';
  link.textContent = 'Şikayet Dosyalarım';
  actions.appendChild(link);
}

async function syncAdminCore(force = false) {
  if (!ADMIN_PATHS.has(currentPath())) return;
  try {
    await loadAdminCases(force);
    injectAdminCases();
  } catch (error) {
    console.warn('Complaint case admin core could not load.', error?.message || error);
  }
}

function bind() {
  document.addEventListener('submit', handleComplaintSubmit, true);

  document.addEventListener('click', async (event) => {
    const ownCase = event.target.closest?.('[data-cc-own-case]');
    if (ownCase) { await openOwnCase(ownCase.dataset.ccOwnCase); return; }
    const adminCase = event.target.closest?.('[data-cc-admin-case]');
    if (adminCase) { await renderAdminCase(adminCase.dataset.ccAdminCase); return; }
    if (event.target.closest?.('[data-cc-close]') || event.target.matches?.('[data-cc-modal]')) { document.querySelector('[data-cc-modal]')?.remove(); return; }
    if (event.target.closest?.('[data-cc-refresh]')) { await renderMyCases(); return; }
    if (event.target.closest?.('[data-cc-new]')) { navigate('/sikayetler'); return; }
    if (event.target.closest?.('[data-cc-profile]')) { navigate('/profil'); return; }
    if (event.target.closest?.('[data-cc-home]')) { navigate('/'); return; }
    const myCases = event.target.closest?.('[data-cc-my-cases]');
    if (myCases) { event.preventDefault(); navigate(MY_CASES_PATH); }
  });

  document.addEventListener('submit', async (event) => {
    const form = event.target.closest?.('[data-cc-status-form]');
    if (!form) return;
    event.preventDefault();
    try { await updateCaseStatus(new FormData(form)); }
    catch (error) { toast(error?.message || 'Durum güncellenemedi.', 'error'); }
  });

  window.addEventListener('gi:evidence-upload-complete', (event) => {
    const publicId = event.detail?.complaint?.publicId;
    if (publicId && publicId === pendingReloadId) scheduleReload(publicId, 700);
  });

  window.addEventListener('popstate', () => {
    renderMyCases();
    syncAdminCore(true);
    injectProfileShortcut();
  });
  window.addEventListener('gi:auth', () => {
    ownCases = [];
    adminCases = [];
    staffRole = null;
    renderMyCases();
    syncAdminCore(true);
  });
}

ensureStyles();
bind();
renderMyCases();
syncAdminCore(true);
injectProfileShortcut();

new MutationObserver(() => {
  injectProfileShortcut();
  if (ADMIN_PATHS.has(currentPath())) syncAdminCore(false);
}).observe(document.getElementById('root') || document.body, { childList: true, subtree: true });