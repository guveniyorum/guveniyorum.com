import { platformStore } from './platform-store.js';

const BUCKET = 'complaint-evidence';
const STAFF_ROLES = new Set(['admin', 'moderator']);
const ADMIN_PATHS = new Set(['/admin/sikayetler', '/admin-sikayetler']);
const SIGNED_URL_SECONDS = 300;

const avatarGlyphs = {
  'neon-orbit': '◎', 'green-pulse': '◉', 'purple-shield': '◆', 'diamond-cat': '◇',
  'cyber-fox': '✦', 'trust-owl': '◌', 'luna-mask': '◐', 'radar-bot': '⌾',
  'mint-dragon': '△', 'glass-panther': '◈', 'safe-rabbit': '○', 'nova-wolf': '✧',
};

let staffRole = null;
let staffUser = null;
let queue = [];
let profiles = new Map();
let selectedCaseKey = '';
let activeUrls = [];
let routeRenderToken = 0;

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[char]));
}

function attr(value) {
  return esc(value).replace(/`/g, '&#96;');
}

function formatBytes(bytes = 0) {
  const value = Number(bytes || 0);
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(date);
}

function currentPath() {
  return location.pathname.replace(/\/+$/, '') || '/';
}

function isAdminPath() {
  return ADMIN_PATHS.has(currentPath());
}

function cleanupSignedUrls() {
  activeUrls.forEach((url) => {
    if (String(url).startsWith('blob:')) URL.revokeObjectURL(url);
  });
  activeUrls = [];
}

function ensureStyles() {
  if (document.getElementById('evidence-center-styles')) return;
  const style = document.createElement('style');
  style.id = 'evidence-center-styles';
  style.textContent = `
    .evidenceCenterShell{position:fixed;inset:0;z-index:12000;overflow:auto;background:#050b14;color:#eef7ff;font-family:Inter,ui-sans-serif,system-ui,-apple-system,sans-serif}.evidenceCenterTop{position:sticky;top:0;z-index:3;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:17px 24px;border-bottom:1px solid rgba(178,204,255,.12);background:rgba(5,11,20,.92);backdrop-filter:blur(18px)}.evidenceCenterBrand{display:flex;align-items:center;gap:12px}.evidenceCenterMark{width:38px;height:38px;display:grid;place-items:center;border-radius:13px;background:linear-gradient(135deg,#25f084,#22d3ee);color:#03120b;font-weight:1000;box-shadow:0 0 30px rgba(37,240,132,.22)}.evidenceCenterBrand b{display:block}.evidenceCenterBrand small{display:block;color:#8fa3ba;margin-top:2px}.evidenceCenterActions{display:flex;gap:8px}.evidenceCenterBtn{border:1px solid rgba(178,204,255,.14);border-radius:12px;background:rgba(255,255,255,.045);color:#edf7ff;padding:10px 13px;font-weight:850;cursor:pointer}.evidenceCenterBtn.primary{border-color:rgba(37,240,132,.35);background:rgba(37,240,132,.12);color:#cffff0}.evidenceCenterBtn.danger{border-color:rgba(255,77,109,.28);background:rgba(255,77,109,.08);color:#ffc1cc}.evidenceCenterLayout{display:grid;grid-template-columns:minmax(300px,390px) 1fr;min-height:calc(100vh - 73px)}.evidenceCenterAside{border-right:1px solid rgba(178,204,255,.10);padding:18px;background:#07101d}.evidenceCenterStats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px}.evidenceCenterStat{padding:11px;border:1px solid rgba(178,204,255,.11);border-radius:14px;background:rgba(255,255,255,.03)}.evidenceCenterStat b{font-size:20px;color:#9fffc0}.evidenceCenterStat small{display:block;color:#8094ab;font-size:10px;margin-top:3px}.evidenceCaseList{display:grid;gap:9px}.evidenceCase{width:100%;text-align:left;border:1px solid rgba(178,204,255,.11);border-radius:16px;background:rgba(255,255,255,.035);color:#edf7ff;padding:13px;cursor:pointer}.evidenceCase:hover,.evidenceCase.active{border-color:rgba(37,240,132,.36);background:rgba(37,240,132,.07)}.evidenceCaseHead{display:flex;align-items:center;justify-content:space-between;gap:8px}.evidenceCaseId{font-weight:950}.evidenceCaseBadge{font-size:10px;padding:5px 7px;border-radius:999px;border:1px solid rgba(34,211,238,.22);background:rgba(34,211,238,.08);color:#c8f7ff}.evidenceCase p{margin:8px 0 0;color:#91a4bc;font-size:12px;line-height:1.45}.evidenceCenterMain{padding:24px;min-width:0}.evidenceEmpty{display:grid;place-items:center;min-height:420px;text-align:center;border:1px dashed rgba(178,204,255,.15);border-radius:22px;background:rgba(255,255,255,.02);color:#91a4bc;padding:30px}.evidenceDetailHero{display:flex;justify-content:space-between;gap:20px;align-items:flex-start;padding:20px;border:1px solid rgba(178,204,255,.12);border-radius:20px;background:radial-gradient(circle at 0 0,rgba(37,240,132,.10),transparent 42%),rgba(255,255,255,.025)}.evidenceIdentity{display:flex;gap:13px;align-items:center}.evidenceIdentityAvatar{width:48px;height:48px;display:grid;place-items:center;border-radius:16px;background:linear-gradient(135deg,#25f084,#8b5cf6);color:#04120b;font-size:24px;font-weight:1000}.evidenceIdentity b{display:block;font-size:17px}.evidenceIdentity small{display:block;color:#8fa3ba;margin-top:3px}.evidenceDetailMeta{text-align:right;color:#90a3ba;font-size:12px}.evidenceGallery{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin-top:16px}.evidenceAsset{border:1px solid rgba(178,204,255,.12);border-radius:18px;overflow:hidden;background:#081321}.evidenceAssetMedia{height:280px;display:grid;place-items:center;background:#02060b}.evidenceAssetMedia img,.evidenceAssetMedia video,.evidenceAssetMedia iframe{width:100%;height:100%;object-fit:contain;border:0}.evidenceAssetFallback{padding:30px;text-align:center;color:#a9bdd2}.evidenceAssetInfo{padding:13px}.evidenceAssetInfo b{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.evidenceAssetInfo small{display:block;color:#8296ad;margin-top:4px}.evidenceAssetControls{display:flex;flex-wrap:wrap;gap:7px;margin-top:10px}.evidenceStatus{font-size:10px;border-radius:999px;padding:5px 8px;border:1px solid rgba(178,204,255,.15);color:#cbd9e8}.evidenceStatus.approved{border-color:rgba(37,240,132,.30);color:#aaffc5}.evidenceStatus.rejected{border-color:rgba(255,77,109,.30);color:#ffb0be}.evidenceModal{position:fixed;inset:0;z-index:13000;display:grid;place-items:center;padding:20px;background:rgba(1,4,8,.84);backdrop-filter:blur(14px)}.evidenceModalCard{width:min(1080px,100%);max-height:92vh;overflow:auto;border:1px solid rgba(178,204,255,.14);border-radius:22px;background:#07101d;color:#eef7ff;box-shadow:0 30px 100px rgba(0,0,0,.55)}.evidenceModalHead{position:sticky;top:0;z-index:2;display:flex;justify-content:space-between;gap:12px;align-items:center;padding:16px 18px;border-bottom:1px solid rgba(178,204,255,.12);background:rgba(7,16,29,.94);backdrop-filter:blur(16px)}.evidenceModalBody{padding:18px}.evidenceAdminShortcut{position:fixed;left:18px;bottom:18px;z-index:8500;border:1px solid rgba(37,240,132,.34);border-radius:999px;background:rgba(8,19,33,.96);color:#d9ffe7;padding:10px 14px;font-weight:900;box-shadow:0 16px 50px rgba(0,0,0,.32);cursor:pointer}.complaintEvidenceChip{cursor:pointer}.complaintEvidenceChip:hover{border-color:rgba(37,240,132,.42)!important;color:#d8ffe6!important}.evidenceAccessCard{width:min(620px,calc(100% - 36px));margin:12vh auto;padding:28px;border:1px solid rgba(178,204,255,.13);border-radius:22px;background:#081321;text-align:center}.evidenceAccessCard h1{margin:0 0 10px}.evidenceAccessCard p{color:#8fa3ba;line-height:1.55}.evidenceLoading{display:grid;place-items:center;min-height:320px;color:#8fa3ba}@media(max-width:900px){.evidenceCenterLayout{grid-template-columns:1fr}.evidenceCenterAside{border-right:0;border-bottom:1px solid rgba(178,204,255,.10)}.evidenceGallery{grid-template-columns:1fr}.evidenceCenterTop{padding:14px}.evidenceCenterMain{padding:14px}.evidenceDetailHero{display:block}.evidenceDetailMeta{text-align:left;margin-top:12px}.evidenceAssetMedia{height:230px}}`;
  document.head.appendChild(style);
}

async function getSessionAndRole() {
  const session = await platformStore.getCurrentSession();
  if (!session?.user?.id || session.localOnly || !platformStore.supabase) {
    return { session: null, role: null };
  }
  const result = await platformStore.supabase
    .from('user_roles')
    .select('role,brand_id')
    .eq('user_id', session.user.id)
    .maybeSingle();
  return { session, role: result.error ? null : result.data?.role || null };
}

async function refreshStaffIdentity() {
  const { session, role } = await getSessionAndRole();
  staffUser = session?.user || null;
  staffRole = role;
  return Boolean(staffUser && STAFF_ROLES.has(staffRole));
}

function caseKeyOf(item) {
  return item.complaint_id || item.local_complaint_id || item.id;
}

function groupedCases() {
  const map = new Map();
  queue.forEach((item) => {
    const key = caseKeyOf(item);
    if (!map.has(key)) map.set(key, { key, attachments: [], latest: item.created_at, userId: item.user_id });
    const group = map.get(key);
    group.attachments.push(item);
    if (new Date(item.created_at) > new Date(group.latest)) group.latest = item.created_at;
  });
  return [...map.values()].sort((a, b) => new Date(b.latest) - new Date(a.latest));
}

async function loadStaffQueue() {
  const rows = await platformStore.supabase
    .from('complaint_attachments')
    .select('id,user_id,complaint_id,local_complaint_id,file_path,file_name,file_size,mime_type,media_kind,evidence_type,upload_status,scan_status,moderation_status,admin_note,reviewed_by,reviewed_at,created_at')
    .order('created_at', { ascending: false })
    .limit(250);
  if (rows.error) throw rows.error;
  queue = rows.data || [];

  const userIds = [...new Set(queue.map((item) => item.user_id).filter(Boolean))];
  profiles = new Map();
  if (userIds.length) {
    const profileRows = await platformStore.supabase
      .from('profiles')
      .select('user_id,nickname,display_name,avatar_key')
      .in('user_id', userIds);
    if (!profileRows.error) {
      (profileRows.data || []).forEach((profile) => profiles.set(profile.user_id, profile));
    }
  }
  const groups = groupedCases();
  if (!groups.some((group) => group.key === selectedCaseKey)) selectedCaseKey = groups[0]?.key || '';
}

async function signedAssets(attachments) {
  const assets = await Promise.all(attachments.map(async (item) => {
    const result = await platformStore.supabase.storage.from(BUCKET).createSignedUrl(item.file_path, SIGNED_URL_SECONDS);
    return { ...item, signedUrl: result.error ? '' : result.data?.signedUrl || '', signedError: result.error?.message || '' };
  }));
  return assets;
}

function mediaMarkup(item) {
  if (!item.signedUrl) return `<div class="evidenceAssetFallback">Dosya bağlantısı oluşturulamadı.<br><small>${esc(item.signedError)}</small></div>`;
  const url = attr(item.signedUrl);
  if (String(item.mime_type).startsWith('image/')) return `<img src="${url}" alt="${attr(item.file_name)}">`;
  if (String(item.mime_type).startsWith('video/')) return `<video src="${url}" controls playsinline preload="metadata"></video>`;
  if (item.mime_type === 'application/pdf') return `<iframe src="${url}" title="${attr(item.file_name)}"></iframe>`;
  return `<div class="evidenceAssetFallback"><a class="evidenceCenterBtn primary" href="${url}" target="_blank" rel="noopener">Dosyayı Aç</a></div>`;
}

async function renderSelectedCase() {
  const main = document.querySelector('[data-evidence-admin-main]');
  if (!main) return;
  const group = groupedCases().find((item) => item.key === selectedCaseKey);
  if (!group) {
    main.innerHTML = '<div class="evidenceEmpty"><div><h2>Henüz kanıt yüklenmemiş</h2><p>Yeni kanıtlar burada güvenli bir operasyon kuyruğu olarak görünecek.</p></div></div>';
    return;
  }
  main.innerHTML = '<div class="evidenceLoading">Özel dosya bağlantıları hazırlanıyor…</div>';
  const assets = await signedAssets(group.attachments);
  const profile = profiles.get(group.userId) || {};
  const name = profile.nickname || profile.display_name || 'Takma adlı kullanıcı';
  const glyph = avatarGlyphs[profile.avatar_key] || '◎';
  main.innerHTML = `
    <div class="evidenceDetailHero">
      <div class="evidenceIdentity">
        <div class="evidenceIdentityAvatar">${esc(glyph)}</div>
        <div><b>${esc(name)}</b><small>${esc(group.key)} · ${group.attachments.length} özel kanıt</small></div>
      </div>
      <div class="evidenceDetailMeta">Son yükleme<br><b>${esc(formatDate(group.latest))}</b><br><small>Bağlantılar 5 dakika geçerlidir.</small></div>
    </div>
    <div class="evidenceGallery">
      ${assets.map((item) => `
        <article class="evidenceAsset">
          <div class="evidenceAssetMedia">${mediaMarkup(item)}</div>
          <div class="evidenceAssetInfo">
            <b title="${attr(item.file_name)}">${esc(item.file_name)}</b>
            <small>${esc(formatBytes(item.file_size))} · ${esc(item.mime_type)} · ${esc(formatDate(item.created_at))}</small>
            <div class="evidenceAssetControls">
              <span class="evidenceStatus ${esc(item.moderation_status)}">${esc(item.moderation_status || 'pending')}</span>
              <button class="evidenceCenterBtn primary" data-moderate-id="${attr(item.id)}" data-moderate-status="approved">Onayla</button>
              <button class="evidenceCenterBtn" data-moderate-id="${attr(item.id)}" data-moderate-status="pending">İncelemede</button>
              <button class="evidenceCenterBtn danger" data-moderate-id="${attr(item.id)}" data-moderate-status="rejected">Reddet</button>
            </div>
          </div>
        </article>`).join('')}
    </div>`;
}

function adminShellMarkup() {
  const groups = groupedCases();
  const pending = queue.filter((item) => item.moderation_status === 'pending').length;
  const videos = queue.filter((item) => String(item.mime_type).startsWith('video/')).length;
  return `
    <div class="evidenceCenterShell" data-evidence-admin-shell>
      <header class="evidenceCenterTop">
        <div class="evidenceCenterBrand"><div class="evidenceCenterMark">G</div><div><b>Şikayet Kanıt Operasyon Merkezi</b><small>Özel dosyalar · rol tabanlı erişim · kısa süreli bağlantılar</small></div></div>
        <div class="evidenceCenterActions"><button class="evidenceCenterBtn" data-evidence-refresh>Yenile</button><button class="evidenceCenterBtn primary" data-evidence-home>Ana Panele Dön</button></div>
      </header>
      <div class="evidenceCenterLayout">
        <aside class="evidenceCenterAside">
          <div class="evidenceCenterStats"><div class="evidenceCenterStat"><b>${groups.length}</b><small>DOSYA</small></div><div class="evidenceCenterStat"><b>${pending}</b><small>BEKLEYEN KANIT</small></div><div class="evidenceCenterStat"><b>${videos}</b><small>VİDEO</small></div></div>
          <div class="evidenceCaseList">
            ${groups.length ? groups.map((group) => {
              const profile = profiles.get(group.userId) || {};
              const name = profile.nickname || profile.display_name || 'Takma adlı kullanıcı';
              return `<button class="evidenceCase ${group.key === selectedCaseKey ? 'active' : ''}" data-evidence-case="${attr(group.key)}"><div class="evidenceCaseHead"><span class="evidenceCaseId">${esc(group.key)}</span><span class="evidenceCaseBadge">${group.attachments.length} kanıt</span></div><p>${esc(name)} · ${esc(formatDate(group.latest))}</p></button>`;
            }).join('') : '<div class="evidenceEmpty" style="min-height:220px"><p>Henüz kanıt yok.</p></div>'}
          </div>
        </aside>
        <main class="evidenceCenterMain" data-evidence-admin-main></main>
      </div>
    </div>`;
}

function accessMarkup(title, body) {
  return `<div class="evidenceCenterShell" data-evidence-admin-shell><div class="evidenceAccessCard"><h1>${esc(title)}</h1><p>${esc(body)}</p><button class="evidenceCenterBtn primary" data-evidence-home>Ana Sayfaya Dön</button></div></div>`;
}

async function renderAdminRoute() {
  const token = ++routeRenderToken;
  ensureStyles();
  document.querySelector('[data-evidence-admin-shell]')?.remove();
  if (!isAdminPath()) return;

  const placeholder = document.createElement('div');
  placeholder.innerHTML = '<div class="evidenceCenterShell" data-evidence-admin-shell><div class="evidenceLoading">Yetki ve kanıt kuyruğu doğrulanıyor…</div></div>';
  document.body.appendChild(placeholder.firstElementChild);

  try {
    const allowed = await refreshStaffIdentity();
    if (token !== routeRenderToken || !isAdminPath()) return;
    const shell = document.querySelector('[data-evidence-admin-shell]');
    if (!staffUser) {
      shell.outerHTML = accessMarkup('Giriş gerekli', 'Admin kanıt merkezini açmak için yetkili hesabınla giriş yapmalısın.');
      return;
    }
    if (!allowed) {
      shell.outerHTML = accessMarkup('Yetkisiz erişim', 'Bu alan yalnızca Güveniyorum admin ve moderasyon ekibi tarafından görüntülenebilir.');
      return;
    }
    await loadStaffQueue();
    if (token !== routeRenderToken || !isAdminPath()) return;
    document.querySelector('[data-evidence-admin-shell]').outerHTML = adminShellMarkup();
    await renderSelectedCase();
  } catch (error) {
    const shell = document.querySelector('[data-evidence-admin-shell]');
    if (shell) shell.outerHTML = accessMarkup('Kanıt merkezi açılamadı', error?.message || 'Beklenmeyen bir hata oluştu.');
  }
}

async function updateModeration(id, status) {
  if (!staffUser?.id || !STAFF_ROLES.has(staffRole)) return;
  const result = await platformStore.supabase
    .from('complaint_attachments')
    .update({ moderation_status: status, reviewed_by: staffUser.id, reviewed_at: new Date().toISOString() })
    .eq('id', id)
    .select('id')
    .maybeSingle();
  if (result.error) throw result.error;
  const target = queue.find((item) => item.id === id);
  if (target) target.moderation_status = status;
  await renderAdminRoute();
}

async function openOwnerEvidence(complaintId) {
  ensureStyles();
  const session = await platformStore.getCurrentSession();
  if (!session?.user?.id || session.localOnly || !platformStore.supabase) {
    showModal('Kanıtları görmek için giriş yapmalısın.', []);
    return;
  }
  const rows = await platformStore.supabase
    .from('complaint_attachments')
    .select('id,file_path,file_name,file_size,mime_type,media_kind,moderation_status,created_at')
    .eq('local_complaint_id', complaintId)
    .order('created_at', { ascending: true });
  if (rows.error) {
    showModal(rows.error.message || 'Kanıtlar alınamadı.', []);
    return;
  }
  const assets = await signedAssets(rows.data || []);
  showModal(`${complaintId} · Yüklediğin kanıtlar`, assets);
}

function showModal(title, assets) {
  cleanupSignedUrls();
  document.querySelector('[data-evidence-viewer-modal]')?.remove();
  const modal = document.createElement('div');
  modal.className = 'evidenceModal';
  modal.dataset.evidenceViewerModal = '';
  modal.innerHTML = `<div class="evidenceModalCard"><div class="evidenceModalHead"><b>${esc(title)}</b><button class="evidenceCenterBtn" data-evidence-modal-close>Kapat</button></div><div class="evidenceModalBody">${assets.length ? `<div class="evidenceGallery">${assets.map((item) => `<article class="evidenceAsset"><div class="evidenceAssetMedia">${mediaMarkup(item)}</div><div class="evidenceAssetInfo"><b>${esc(item.file_name)}</b><small>${esc(formatBytes(item.file_size))} · ${esc(formatDate(item.created_at))}</small></div></article>`).join('')}</div>` : '<div class="evidenceEmpty"><p>Görüntülenebilir kanıt bulunamadı.</p></div>'}</div></div>`;
  document.body.appendChild(modal);
}

function complaintIdFromChip(chip) {
  const meta = chip.closest('article.complaint')?.querySelector('.complaintHead small')?.textContent || '';
  return meta.match(/GVN-\d{4}-\d+/)?.[0] || '';
}

async function syncStaffShortcut() {
  if (isAdminPath()) {
    document.querySelector('[data-evidence-admin-shortcut]')?.remove();
    return;
  }
  const allowed = await refreshStaffIdentity().catch(() => false);
  const existing = document.querySelector('[data-evidence-admin-shortcut]');
  if (!allowed) {
    existing?.remove();
    return;
  }
  if (existing) return;
  const button = document.createElement('button');
  button.className = 'evidenceAdminShortcut';
  button.dataset.evidenceAdminShortcut = '';
  button.textContent = 'Admin Kanıt Merkezi';
  document.body.appendChild(button);
}

function navigate(path) {
  history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

function bindEvents() {
  document.addEventListener('click', async (event) => {
    const caseButton = event.target.closest?.('[data-evidence-case]');
    if (caseButton) {
      selectedCaseKey = caseButton.dataset.evidenceCase;
      document.querySelectorAll('[data-evidence-case]').forEach((node) => node.classList.toggle('active', node === caseButton));
      await renderSelectedCase();
      return;
    }
    if (event.target.closest?.('[data-evidence-refresh]')) {
      await renderAdminRoute();
      return;
    }
    if (event.target.closest?.('[data-evidence-home]')) {
      navigate('/');
      return;
    }
    if (event.target.closest?.('[data-evidence-admin-shortcut]')) {
      navigate('/admin/sikayetler');
      return;
    }
    const moderation = event.target.closest?.('[data-moderate-id]');
    if (moderation) {
      moderation.disabled = true;
      try { await updateModeration(moderation.dataset.moderateId, moderation.dataset.moderateStatus); }
      catch (error) { alert(error?.message || 'Kanıt durumu güncellenemedi.'); moderation.disabled = false; }
      return;
    }
    if (event.target.closest?.('[data-evidence-modal-close]') || (event.target.matches?.('[data-evidence-viewer-modal]'))) {
      cleanupSignedUrls();
      document.querySelector('[data-evidence-viewer-modal]')?.remove();
      return;
    }
    const chip = event.target.closest?.('[data-evidence-chip]');
    if (chip) {
      const id = complaintIdFromChip(chip);
      if (id) await openOwnerEvidence(id);
    }
  });
  window.addEventListener('popstate', () => {
    renderAdminRoute();
    syncStaffShortcut();
  });
  window.addEventListener('gi:auth', () => {
    staffRole = null;
    staffUser = null;
    renderAdminRoute();
    syncStaffShortcut();
  });
}

ensureStyles();
bindEvents();
renderAdminRoute();
syncStaffShortcut();

new MutationObserver(() => {
  document.querySelectorAll('[data-evidence-chip]').forEach((chip) => {
    chip.title = 'Yüklediğin özel kanıtları görüntüle';
    chip.setAttribute('role', 'button');
    chip.setAttribute('tabindex', '0');
  });
}).observe(document.getElementById('root') || document.body, { childList: true, subtree: true });
