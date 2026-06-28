const AUTH_KEY = 'guveniyorum-auth-session-v1';

const qs = (selector, root = document) => root.querySelector(selector);
const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];
const safe = (value) => String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
const initial = (value = 'G') => String(value || 'G').trim().slice(0, 1).toUpperCase() || 'G';

let store = null;
let currentUser = readUser();

function readUser() {
  try { return JSON.parse(localStorage.getItem(AUTH_KEY) || 'null'); } catch { return null; }
}

function writeUser(user) {
  currentUser = user || null;
  if (currentUser) localStorage.setItem(AUTH_KEY, JSON.stringify(currentUser));
  else localStorage.removeItem(AUTH_KEY);
  paint(true);
}

function installStyle() {
  if (qs('#auth-topbar-bridge-style')) return;
  const style = document.createElement('style');
  style.id = 'auth-topbar-bridge-style';
  style.textContent = `
    .giUserChip,.giWalletPill,.giLogout{display:inline-flex;align-items:center;justify-content:center;min-height:38px;border:1px solid rgba(178,204,255,.16);border-radius:13px;background:rgba(255,255,255,.045);color:#fff;padding:7px 12px;font-size:12px;font-weight:950;cursor:pointer}.giUserChip{gap:9px;background:rgba(37,240,132,.12);border-color:rgba(37,240,132,.34);color:#d9ffe7}.giAvatar{width:25px;height:25px;border-radius:9px;display:grid;place-items:center;background:linear-gradient(135deg,#25f084,#8b3dff);color:#05120a;font-weight:950}.giMeta{display:grid;line-height:1.05;text-align:left}.giMeta small{color:#8affb5;font-size:9px;letter-spacing:.02em}.giWalletPill{color:#8affb5}.giPanel{position:fixed;right:22px;top:72px;z-index:9998;width:min(360px,calc(100vw - 28px));border:1px solid rgba(178,204,255,.16);border-radius:20px;background:linear-gradient(160deg,rgba(13,24,41,.98),rgba(7,15,27,.98));box-shadow:0 24px 80px rgba(0,0,0,.42);color:#eef7ff;padding:18px}.giPanel h3{margin:0 0 10px;font-size:19px}.giPanel p{margin:0 0 12px;color:#9fb1c8;line-height:1.5}.giPanelClose{position:absolute;right:10px;top:10px;border:1px solid rgba(178,204,255,.14);border-radius:10px;background:rgba(255,255,255,.05);color:#fff;width:30px;height:30px;cursor:pointer}.giPanelRow{display:flex;justify-content:space-between;gap:12px;border:1px solid rgba(178,204,255,.12);border-radius:14px;background:rgba(255,255,255,.04);padding:12px;margin-top:10px}.giPanelRow b{color:#8affb5}.giPanelAction{width:100%;margin-top:12px;border:1px solid rgba(37,240,132,.34);border-radius:13px;background:rgba(37,240,132,.12);color:#d9ffe7;padding:11px;font-weight:900;cursor:pointer}@media(max-width:860px){.giMeta small,.giWalletPill{display:none}.giPanel{right:14px;top:64px}}
  `;
  document.head.appendChild(style);
}

function bar() { return qs('.topbar'); }
function loginButtons(topbar) { return [qs('[data-action="signin"]', topbar), qs('a[href="/uye-ol"], [data-action="signup"]', topbar)]; }
function removeInjected(topbar) { qsa('#gi-user-chip,#gi-wallet-pill,#gi-logout', topbar).forEach((node) => node.remove()); }

function paint(force = false) {
  installStyle();
  const topbar = bar();
  if (!topbar) return;
  const stored = readUser();
  if (stored) currentUser = stored;
  const key = currentUser ? `active:${currentUser.id || currentUser.email}` : 'guest';
  if (!force && topbar.dataset.giAuthState === key && (currentUser ? qs('#gi-user-chip', topbar) : true)) return;
  topbar.dataset.giAuthState = key;
  removeInjected(topbar);
  const [login, signup] = loginButtons(topbar);
  if (!currentUser) {
    if (login) login.style.display = '';
    if (signup) signup.style.display = '';
    return;
  }
  if (login) login.style.display = 'none';
  if (signup) signup.style.display = 'none';
  const label = currentUser.displayName || currentUser.email || 'Üye';
  topbar.insertAdjacentHTML('beforeend', `
    <button class="giUserChip" id="gi-user-chip" data-gi-panel="profile"><span class="giAvatar">${initial(label)}</span><span class="giMeta"><b>${safe(label)}</b><small>${safe(currentUser.provider || 'E-posta')} · Yeni Üye</small></span></button>
    <button class="giWalletPill" id="gi-wallet-pill" data-gi-panel="profile">₺0 · 0 XP</button>
    <button class="giLogout" id="gi-logout" data-gi-logout>Çıkış</button>
  `);
}

function openPanel(type) {
  installStyle();
  qs('[data-gi-overlay]')?.remove();
  const user = currentUser || readUser();
  const title = type === 'settings' ? 'Hesap ve Güvenlik' : type === 'profile' ? 'Profil Özeti' : 'Bildirimler';
  const rows = type === 'settings'
    ? [['Oturum', user ? 'Aktif' : 'Misafir'], ['Auth provider', user?.provider || '-']]
    : type === 'profile'
      ? [['Kullanıcı', user?.displayName || user?.email || 'Misafir'], ['Seviye', 'Yeni Üye'], ['Cüzdan', '₺0 · 0 XP']]
      : [['BetSafe çözümü', '+75'], ['Profil hazırlandı', 'Aktif']];
  document.body.insertAdjacentHTML('beforeend', `<aside class="giPanel" data-gi-overlay><button class="giPanelClose" data-gi-close>×</button><h3>${title}</h3><p>${type === 'profile' ? 'Giriş yapan kullanıcı platform ekonomisine bağlandı.' : type === 'settings' ? 'Oturum ve güvenlik durumu.' : 'Son güven hareketleri.'}</p>${rows.map(([a,b]) => `<div class="giPanelRow"><span>${safe(a)}</span><b>${safe(b)}</b></div>`).join('')}<button class="giPanelAction" data-gi-close>Tamam</button></aside>`);
}

async function signOut() {
  try { await store?.supabase?.auth.signOut(); } catch {}
  qs('[data-gi-overlay]')?.remove();
  writeUser(null);
  setTimeout(() => location.replace('/'), 50);
}

async function syncSession() {
  try {
    if (!store?.supabase) return paint(true);
    const { data } = await store.supabase.auth.getSession();
    const sessionUser = data?.session?.user;
    if (sessionUser?.email) {
      writeUser({ id: sessionUser.id, email: sessionUser.email, displayName: sessionUser.user_metadata?.full_name || sessionUser.user_metadata?.name || sessionUser.email.split('@')[0], provider: sessionUser.app_metadata?.provider || 'Supabase', role: 'user' });
    } else {
      paint(true);
    }
  } catch { paint(true); }
}

document.addEventListener('click', (event) => {
  const icon = event.target.closest('.topbar .iconbtn:not([data-menu])');
  if (event.target.closest('[data-gi-logout], [data-auth-signout]')) { event.preventDefault(); event.stopImmediatePropagation(); signOut(); return; }
  if (event.target.closest('[data-gi-panel], .authSession')) { event.preventDefault(); event.stopImmediatePropagation(); openPanel('profile'); return; }
  if (event.target.closest('[data-gi-close], [data-top-panel-close]')) { qs('[data-gi-overlay]')?.remove(); return; }
  if (icon) { event.preventDefault(); openPanel(icon.textContent.includes('⚙') ? 'settings' : 'notifications'); }
}, true);

import('./platform-store.js').then((module) => {
  store = module.platformStore;
  syncSession();
  store.supabase?.auth.onAuthStateChange((_event, session) => {
    if (session?.user?.email) writeUser({ id: session.user.id, email: session.user.email, displayName: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email.split('@')[0], provider: session.user.app_metadata?.provider || 'Supabase', role: 'user' });
    else if (!readUser()) paint(true);
  });
});

installStyle();
new MutationObserver(() => requestAnimationFrame(() => paint())).observe(document.getElementById('root'), { childList: true, subtree: true });
setInterval(() => paint(), 500);
paint(true);
