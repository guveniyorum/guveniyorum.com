import { platformStore } from './platform-store.js';

const BUCKET = 'complaint-evidence';
const ADMIN_PATHS = new Set(['/admin/sikayetler', '/admin-sikayetler']);
const STAFF_ROLES = new Set(['admin', 'moderator']);
const SIGNED_URL_TTL = 300;
const AVATARS = {
  'neon-orbit': '◎', 'green-pulse': '◉', 'purple-shield': '◆', 'diamond-cat': '◇',
  'cyber-fox': '✦', 'trust-owl': '◌', 'luna-mask': '◐', 'radar-bot': '⌾',
  'mint-dragon': '△', 'glass-panther': '◈', 'safe-rabbit': '○', 'nova-wolf': '✧',
};

let staffSession = null;
let staffRole = null;
let attachments = [];
let profileByUser = new Map();
let selectedCaseKey = '';
let renderVersion = 0;

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[char]));
}

function pathNow() {
  return location.pathname.replace(/\/+$/, '') || '/';
}

function isAdminRoute() {
  return ADMIN_PATHS.has(pathNow());
}

function formatBytes(value = 0) {
  const bytes = Number(value || 0);
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(date);
}

function ensureStyles() {
  if (document.getElementById('evidence-center-style')) return;
  const style = document.createElement('style');
  style.id = 'evidence-center-style';
  style.textContent = `
    .ecShell{position:fixed;inset:0;z-index:12000;overflow:auto;background:#050b14;color:#eef7ff;font-family:Inter,ui-sans-serif,system-ui,-apple-system,sans-serif}.ecTop{position:sticky;top:0;z-index:4;display:flex;justify-content:space-between;align-items:center;gap:16px;padding:16px 22px;border-bottom:1px solid rgba(178,204,255,.12);background:rgba(5,11,20,.93);backdrop-filter:blur(18px)}.ecBrand{display:flex;gap:12px;align-items:center}.ecMark{width:40px;height:40px;display:grid;place-items:center;border-radius:14px;background:linear-gradient(135deg,#25f084,#22d3ee);color:#03120b;font-weight:1000;box-shadow:0 0 30px rgba(37,240,132,.22)}.ecBrand b{display:block}.ecBrand small{display:block;color:#8fa3ba;margin-top:2px}.ecActions{display:flex;gap:8px;flex-wrap:wrap}.ecBtn{border:1px solid rgba(178,204,255,.14);border-radius:12px;background:rgba(255,255,255,.045);color:#edf7ff;padding:10px 13px;font-weight:850;cursor:pointer}.ecBtn.primary{border-color:rgba(37,240,132,.35);background:rgba(37,240,132,.12);color:#d5ffe4}.ecBtn.danger{border-color:rgba(255,77,109,.28);background:rgba(255,77,109,.08);color:#ffc2cb}.ecLayout{display:grid;grid-template-columns:minmax(300px,390px) 1fr;min-height:calc(100vh - 73px)}.ecAside{padding:18px;border-right:1px solid rgba(178,204,255,.10);background:#07101d}.ecStats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px}.ecStat{padding:11px;border:1px solid rgba(178,204,255,.11);border-radius:14px;background:rgba(255,255,255,.03)}.ecStat b{display:block;color:#9fffc0;font-size:20px}.ecStat small{color:#8094ab;font-size:10px}.ecCases{display:grid;gap:9px}.ecCase{width:100%;padding:13px;text-align:left;border:1px solid rgba(178,204,255,.11);border-radius:16px;background:rgba(255,255,255,.035);color:#eef7ff;cursor:pointer}.ecCase:hover,.ecCase.active{border-color:rgba(37,240,132,.38);background:rgba(37,240,132,.07)}.ecCaseHead{display:flex;justify-content:space-between;gap:8px}.ecCaseHead b{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ecPill{flex:none;padding:5px 8px;border:1px solid rgba(34,211,238,.24);border-radius:999px;background:rgba(34,211,238,.08);color:#c9f7ff;font-size:10px;font-weight:900}.ecCase p{margin:8px 0 0;color:#91a4bc;font-size:12px}.ecMain{padding:24px;min-width:0}.ecHero{display:flex;justify-content:space-between;align-items:flex-start;gap:18px;padding:19px;border:1px solid rgba(178,204,255,.12);border-radius:20px;background:radial-gradient(circle at 0 0,rgba(37,240,132,.10),transparent 42%),rgba(255,255,255,.025)}.ecIdentity{display:flex;gap:13px;align-items:center}.ecAvatar{width:48px;height:48px;display:grid;place-items:center;border-radius:16px;background:linear-gradient(135deg,#25f084,#8b5cf6);color:#04120b;font-size:24px;font-weight:1000}.ecIdentity b{display:block}.ecIdentity small,.ecMeta{color:#8fa3ba;font-size:12px}.ecMeta{text-align:right}.ecGallery{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin-top:16px}.ecAsset{overflow:hidden;border:1px solid rgba(178,204,255,.12);border-radius:18px;background:#081321}.ecMedia{height:280px;display:grid;place-items:center;background:#02060b}.ecMedia img,.ecMedia video,.ecMedia iframe{width:100%;height:100%;border:0;object-fit:contain}.ecFallback{padding:30px;text-align:center;color:#9fb1c8}.ecInfo{padding:13px}.ecInfo b{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ecInfo small{display:block;margin-top:4px;color:#8296ad}.ecControls{display:flex;gap:7px;flex-wrap:wrap;margin-top:10px}.ecStatus{padding:5px 8px;border:1px solid rgba(178,204,255,.15);border-radius:999px;font-size:10px}.ecStatus.approved{border-color:rgba(37,240,132,.30);color:#aaffc5}.ecStatus.rejected{border-color:rgba(255,77,109,.30);color:#ffb0be}.ecEmpty,.ecLoading{display:grid;place-items:center;min-height:360px;padding:30px;text-align:center;border:1px dashed rgba(178,204,255,.15);border-radius:22px;color:#91a4bc}.ecAccess{width:min(620px,calc(100% - 36px));margin:12vh auto;padding:28px;text-align:center;border:1px solid rgba(178,204,255,.13);border-radius:22px;background:#081321}.ecAccess p{color:#8fa3ba;line-height:1.55}.ecModal{position:fixed;inset:0;z-index:13000;display:grid;place-items:center;padding:20px;background:rgba(1,4,8,.84);backdrop-filter:blur(14px)}.ecModalCard{width:min(1080px,100%);max-height:92vh;overflow:auto;border:1px solid rgba(178,204,255,.14);border-radius:22px;background:#07101d;color:#eef7ff;box-shadow:0 30px 100px rgba(0,0,0,.55)}.ecModalHead{position:sticky;top:0;z-index:2;display:flex;justify-content:space-between;align-items:center;gap:12px;padding:16px 18px;border-bottom:1px solid rgba(178,204,255,.12);background:rgba(7,16,29,.94)}.ecModalBody{padding:18px}.ecShortcut{position:fixed;left:18px;bottom:18px;z-index:8500;padding:10px 14px;border:1px solid rgba(37,240,132,.34);border-radius:999px;background:rgba(8,19,33,.96);color:#d9ffe7;font-weight:900;box-shadow:0 16px 50px rgba(0,0,0,.32);cursor:pointer}.complaintEvidenceChip{cursor:pointer}.complaintEvidenceChip:hover{border-color:rgba(37,240,132,.42)!important;color:#d8ffe6!important}@media(max-width:900px){.ecLayout{grid-template-columns:1fr}.ecAside{border-right:0;border-bottom:1px solid rgba(178,204,255,.10)}.ecGallery{grid-template-columns:1fr}.ecTop{padding:13px}.ecMain{padding:13px}.ecHero{display:block}.ecMeta{text-align:left;margin-top:12px}.ecMedia{height:230px}}
  `;
  document.head.appendChild(style);
}

async function identity() {
  const session = await platformStore.getCurrentSession();
  if (!session?.user?.id || session.localOnly || !platformStore.supabase) return { session: null, role: null };
  const result = await platformStore.supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', session.user.id)
    .maybeSingle();
  return { session, role: result.error ? null : result.data?.role || null };
}

async function refreshStaff() {
  const current = await identity();
  staffSession = current.session;
  staffRole = current.role;
  return Boolean(staffSession && STAFF_ROLES.has(staffRole));
}

function groupKey(item) {
  if (item.complaint_id) return `db:${item.complaint_id}`;
  return `local:${item.user_id}:${item.local_complaint_id || item.id}`;
}

function displayCaseId(item) {
  return item.local_complaint_id || item.complaint_id || item.id;
}

function caseGroups() {
  const groups = new Map();
  attachments.forEach((item) => {
    const key = groupKey(item);
    if (!groups.has(key)) {
      groups.set(key, {
        key,
        displayId: displayCaseId(item),
        userId: item.user_id,
        latest: item.created_at,
        attachments: [],
      });
    }
    const group = groups.get(key);
    group.attachments.push(item);
    if (new Date(item.created_at) > new Date(group.latest)) group.latest = item.created_at;
  });
  return [...groups.values()].sort((a, b) => new Date(b.latest) - new Date(a.latest));
}

async function loadQueue() {
  const rows = await platformStore.supabase
    .from('complaint_attachments')
    .select('id,user_id,complaint_id,local_complaint_id,file_path,file_name,file_size,mime_type,media_kind,evidence_type,upload_status,scan_status,moderation_status,admin_note,reviewed_by,reviewed_at,created_at')
    .order('created_at', { ascending: false })
    .limit(250);
  if (rows.error) throw rows.error;
  attachments = rows.data || [];

  profileByUser = new Map();
  const userIds = [...new Set(attachments.map((item) => item.user_id).filter(Boolean))];
  if (userIds.length) {
    const profileRows = await platformStore.supabase
      .from('profiles')
      .select('user_id,nickname,display_name,avatar_key')
      .in('user_id', userIds);
    if (!profileRows.error) {
      (profileRows.data || []).forEach((profile) => profileByUser.set(profile.user_id, profile));
    }
  }

  const groups = caseGroups();
  if (!groups.some((group) => group.key === selectedCaseKey)) selectedCaseKey = groups[0]?.key || '';
}

async function withSignedUrls(rows) {
  return Promise.all(rows.map(async (item) => {
    const signed = await platformStore.supabase.storage.from(BUCKET).createSignedUrl(item.file_path, SIGNED_URL_TTL);
    return { ...item, signedUrl: signed.error ? '' : signed.data?.signedUrl || '', signedError: signed.error?.message || '' };
  }));
}

function media(item) {
  if (!item.signedUrl) return `<div class="ecFallback">Dosya bağlantısı oluşturulamadı.<br><small>${esc(item.signedError)}</small></div>`;
  const url = esc(item.signedUrl);
  if (String(item.mime_type).startsWith('image/')) return `<img src="${url}" alt="${esc(item.file_name)}">`;
  if (String(item.mime_type).startsWith('video/')) return `<video src="${url}" controls playsinline preload="metadata"></video>`;
  if (item.mime_type === 'application/pdf') return `<iframe src="${url}" title="${esc(item.file_name)}"></iframe>`;
  return `<div class="ecFallback"><a class="ecBtn primary" href="${url}" target="_blank" rel="noopener">Dosyayı Aç</a></div>`;
}

function accessScreen(title, message) {
  return `<div class="ecShell" data-ec-shell><div class="ecAccess"><h1>${esc(title)}</h1><p>${esc(message)}</p><button class="ecBtn primary" data-ec-home>Ana Sayfaya Dön</button></div></div>`;
}

function shell() {
  const groups = caseGroups();
  const pending = attachments.filter((item) => item.moderation_status === 'pending').length;
  const videos = attachments.filter((item) => String(item.mime_type).startsWith('video/')).length;
  return `
    <div class="ecShell" data-ec-shell>
      <header class="ecTop">
        <div class="ecBrand"><div class="ecMark">G</div><div><b>Şikayet Kanıt Operasyon Merkezi</b><small>Özel dosyalar · rol tabanlı erişim · 5 dakikalık bağlantılar</small></div></div>
        <div class="ecActions"><button class="ecBtn" data-ec-refresh>Yenile</button><button class="ecBtn primary" data-ec-home>Ana Panele Dön</button></div>
      </header>
      <div class="ecLayout">
        <aside class="ecAside">
          <div class="ecStats"><div class="ecStat"><b>${groups.length}</b><small>DOSYA</small></div><div class="ecStat"><b>${pending}</b><small>BEKLEYEN</small></div><div class="ecStat"><b>${videos}</b><small>VİDEO</small></div></div>
          <div class="ecCases">
            ${groups.length ? groups.map((group) => {
              const profile = profileByUser.get(group.userId) || {};
              const name = profile.nickname || profile.display_name || 'Takma adlı kullanıcı';
              return `<button class="ecCase ${group.key === selectedCaseKey ? 'active' : ''}" data-ec-case="${esc(group.key)}"><div class="ecCaseHead"><b>${esc(group.displayId)}</b><span class="ecPill">${group.attachments.length} kanıt</span></div><p>${esc(name)} · ${esc(formatDate(group.latest))}</p></button>`;
            }).join('') : '<div class="ecEmpty" style="min-height:220px"><p>Henüz kanıt yok.</p></div>'}
          </div>
        </aside>
        <main class="ecMain" data-ec-main></main>
      </div>
    </div>`;
}

async function renderSelected() {
  const main = document.querySelector('[data-ec-main]');
  if (!main) return;
  const group = caseGroups().find((item) => item.key === selectedCaseKey);
  if (!group) {
    main.innerHTML = '<div class="ecEmpty"><div><h2>Henüz kanıt yüklenmemiş</h2><p>Yeni özel dosyalar burada görünecek.</p></div></div>';
    return;
  }
  main.innerHTML = '<div class="ecLoading">Özel dosya bağlantıları hazırlanıyor…</div>';
  const rows = await withSignedUrls(group.attachments);
  const profile = profileByUser.get(group.userId) || {};
  const name = profile.nickname || profile.display_name || 'Takma adlı kullanıcı';
  const glyph = AVATARS[profile.avatar_key] || '◎';
  main.innerHTML = `
    <div class="ecHero">
      <div class="ecIdentity"><div class="ecAvatar">${esc(glyph)}</div><div><b>${esc(name)}</b><small>${esc(group.displayId)} · ${group.attachments.length} özel kanıt</small></div></div>
      <div class="ecMeta">Son yükleme<br><b>${esc(formatDate(group.latest))}</b><br>Bağlantılar 5 dakika geçerli</div>
    </div>
    <div class="ecGallery">
      ${rows.map((item) => `<article class="ecAsset"><div class="ecMedia">${media(item)}</div><div class="ecInfo"><b>${esc(item.file_name)}</b><small>${esc(formatBytes(item.file_size))} · ${esc(item.mime_type)} · ${esc(formatDate(item.created_at))}</small><div class="ecControls"><span class="ecStatus ${esc(item.moderation_status)}">${esc(item.moderation_status || 'pending')}</span><button class="ecBtn primary" data-ec-moderate="${esc(item.id)}" data-ec-status="approved">Onayla</button><button class="ecBtn" data-ec-moderate="${esc(item.id)}" data-ec-status="pending">İncelemede</button><button class="ecBtn danger" data-ec-moderate="${esc(item.id)}" data-ec-status="rejected">Reddet</button></div></div></article>`).join('')}
    </div>`;
}

async function renderAdmin() {
  const version = ++renderVersion;
  document.querySelector('[data-ec-shell]')?.remove();
  if (!isAdminRoute()) return;
  const loading = document.createElement('div');
  loading.innerHTML = '<div class="ecShell" data-ec-shell><div class="ecLoading">Yetki ve kanıt kuyruğu doğrulanıyor…</div></div>';
  document.body.appendChild(loading.firstElementChild);
  try {
    const allowed = await refreshStaff();
    if (version !== renderVersion || !isAdminRoute()) return;
    const target = document.querySelector('[data-ec-shell]');
    if (!staffSession) {
      target.outerHTML = accessScreen('Giriş gerekli', 'Bu alanı açmak için yetkili hesabınla giriş yapmalısın.');
      return;
    }
    if (!allowed) {
      target.outerHTML = accessScreen('Yetkisiz erişim', 'Bu alan yalnızca Güveniyorum admin ve moderasyon ekibine açıktır.');
      return;
    }
    await loadQueue();
    if (version !== renderVersion || !isAdminRoute()) return;
    document.querySelector('[data-ec-shell]').outerHTML = shell();
    await renderSelected();
  } catch (error) {
    const target = document.querySelector('[data-ec-shell]');
    if (target) target.outerHTML = accessScreen('Kanıt merkezi açılamadı', error?.message || 'Beklenmeyen hata.');
  }
}

async function moderate(id, status) {
  if (!staffSession?.user?.id || !STAFF_ROLES.has(staffRole)) return;
  const result = await platformStore.supabase
    .from('complaint_attachments')
    .update({ moderation_status: status, reviewed_by: staffSession.user.id, reviewed_at: new Date().toISOString() })
    .eq('id', id)
    .select('id')
    .maybeSingle();
  if (result.error) throw result.error;
  const item = attachments.find((row) => row.id === id);
  if (item) item.moderation_status = status;
  await renderAdmin();
}

function complaintIdFromChip(chip) {
  const text = chip.closest('article.complaint')?.querySelector('.complaintHead small')?.textContent || '';
  return text.match(/GVN-\d{4}-\d+/)?.[0] || '';
}

function ownerModal(title, rows) {
  document.querySelector('[data-ec-modal]')?.remove();
  const modal = document.createElement('div');
  modal.className = 'ecModal';
  modal.dataset.ecModal = '';
  modal.innerHTML = `<div class="ecModalCard"><div class="ecModalHead"><b>${esc(title)}</b><button class="ecBtn" data-ec-close>Kapat</button></div><div class="ecModalBody">${rows.length ? `<div class="ecGallery">${rows.map((item) => `<article class="ecAsset"><div class="ecMedia">${media(item)}</div><div class="ecInfo"><b>${esc(item.file_name)}</b><small>${esc(formatBytes(item.file_size))} · ${esc(formatDate(item.created_at))}</small></div></article>`).join('')}</div>` : '<div class="ecEmpty"><p>Görüntülenebilir kanıt bulunamadı.</p></div>'}</div></div>`;
  document.body.appendChild(modal);
}

async function openOwnerEvidence(complaintId) {
  const current = await platformStore.getCurrentSession();
  if (!current?.user?.id || current.localOnly || !platformStore.supabase) {
    ownerModal('Giriş gerekli', []);
    return;
  }
  const result = await platformStore.supabase
    .from('complaint_attachments')
    .select('id,file_path,file_name,file_size,mime_type,media_kind,moderation_status,created_at')
    .eq('local_complaint_id', complaintId)
    .order('created_at', { ascending: true });
  if (result.error) {
    ownerModal(result.error.message || 'Kanıtlar alınamadı.', []);
    return;
  }
  ownerModal(`${complaintId} · Yüklediğin kanıtlar`, await withSignedUrls(result.data || []));
}

async function syncShortcut() {
  if (isAdminRoute()) {
    document.querySelector('[data-ec-shortcut]')?.remove();
    return;
  }
  const allowed = await refreshStaff().catch(() => false);
  const existing = document.querySelector('[data-ec-shortcut]');
  if (!allowed) {
    existing?.remove();
    return;
  }
  if (existing) return;
  const button = document.createElement('button');
  button.className = 'ecShortcut';
  button.dataset.ecShortcut = '';
  button.textContent = 'Admin Kanıt Merkezi';
  document.body.appendChild(button);
}

function navigate(path) {
  history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

function bind() {
  document.addEventListener('click', async (event) => {
    const caseButton = event.target.closest?.('[data-ec-case]');
    if (caseButton) {
      selectedCaseKey = caseButton.dataset.ecCase;
      document.querySelectorAll('[data-ec-case]').forEach((item) => item.classList.toggle('active', item === caseButton));
      await renderSelected();
      return;
    }
    if (event.target.closest?.('[data-ec-refresh]')) { await renderAdmin(); return; }
    if (event.target.closest?.('[data-ec-home]')) { navigate('/'); return; }
    if (event.target.closest?.('[data-ec-shortcut]')) { navigate('/admin/sikayetler'); return; }
    const moderation = event.target.closest?.('[data-ec-moderate]');
    if (moderation) {
      moderation.disabled = true;
      try { await moderate(moderation.dataset.ecModerate, moderation.dataset.ecStatus); }
      catch (error) { alert(error?.message || 'Durum güncellenemedi.'); moderation.disabled = false; }
      return;
    }
    if (event.target.closest?.('[data-ec-close]') || event.target.matches?.('[data-ec-modal]')) {
      document.querySelector('[data-ec-modal]')?.remove();
      return;
    }
    const chip = event.target.closest?.('[data-evidence-chip]');
    if (chip) {
      const id = complaintIdFromChip(chip);
      if (id) await openOwnerEvidence(id);
    }
  });

  window.addEventListener('popstate', () => { renderAdmin(); syncShortcut(); });
  window.addEventListener('gi:auth', () => {
    staffSession = null;
    staffRole = null;
    renderAdmin();
    syncShortcut();
  });
}

ensureStyles();
bind();
renderAdmin();
syncShortcut();

new MutationObserver(() => {
  document.querySelectorAll('[data-evidence-chip]').forEach((chip) => {
    chip.title = 'Yüklediğin özel kanıtları görüntüle';
    chip.setAttribute('role', 'button');
    chip.setAttribute('tabindex', '0');
  });
}).observe(document.getElementById('root') || document.body, { childList: true, subtree: true });
