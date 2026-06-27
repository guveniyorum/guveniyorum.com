import { platformStore } from './platform-store.js';

const AUTH_KEY = 'guveniyorum-auth-session-v1';
let authMode = 'signin';
let busy = false;
let errorText = '';
let sessionUser = readUser();

function readUser() {
  try { return JSON.parse(localStorage.getItem(AUTH_KEY) || 'null'); } catch { return null; }
}

function saveUser(user) {
  sessionUser = user || null;
  if (sessionUser) localStorage.setItem(AUTH_KEY, JSON.stringify(sessionUser));
  else localStorage.removeItem(AUTH_KEY);
  paintTopbar();
}

function initials(value = 'G') {
  return String(value).trim().slice(0, 1).toUpperCase() || 'G';
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}

function installAuthStyles() {
  if (document.getElementById('auth-diamond-style')) return;
  const style = document.createElement('style');
  style.id = 'auth-diamond-style';
  style.textContent = `
    .authOverlay{position:fixed;inset:0;z-index:9999;display:grid;place-items:center;background:rgba(3,7,14,.76);backdrop-filter:blur(18px);padding:22px}.authCard{width:min(980px,100%);display:grid;grid-template-columns:.95fr 1.05fr;overflow:hidden;border:1px solid rgba(178,204,255,.14);border-radius:24px;background:linear-gradient(135deg,rgba(13,24,41,.98),rgba(7,15,27,.98));box-shadow:0 28px 100px rgba(0,0,0,.48);color:#eef7ff}.authHero{padding:34px;background:radial-gradient(circle at 15% 20%,rgba(37,240,132,.22),transparent 40%),radial-gradient(circle at 90% 0,rgba(139,61,255,.26),transparent 45%),rgba(255,255,255,.025);border-right:1px solid rgba(178,204,255,.14)}.authHero h2{font-size:44px;line-height:.98;letter-spacing:-.06em;margin:0 0 14px}.authHero p,.authFine{color:#9fb1c8;line-height:1.55}.authForm{padding:30px;position:relative}.authTabs{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px}.authTabs button,.oauth,.authSubmit,.authClose{border:1px solid rgba(178,204,255,.14);border-radius:13px;color:#fff;font-weight:950;background:rgba(255,255,255,.045);padding:12px;cursor:pointer}.authTabs button.active{background:rgba(37,240,132,.12);border-color:rgba(37,240,132,.35)}.oauthGrid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:14px 0}.oauth{display:flex;align-items:center;justify-content:center;gap:8px;background:#0b1627}.divider{display:flex;align-items:center;gap:12px;color:#94a8bd;font-size:12px;margin:15px 0}.divider:before,.divider:after{content:'';height:1px;background:rgba(178,204,255,.14);flex:1}.authInput{width:100%;background:#081321;border:1px solid rgba(178,204,255,.18);border-radius:13px;color:#fff;padding:13px 14px;outline:none;margin-bottom:10px}.authSubmit{width:100%;background:linear-gradient(135deg,#25f084,#16a34a);color:#04120b;border-color:rgba(37,240,132,.56);box-shadow:0 0 34px rgba(37,240,132,.18)}.authError{color:#ffc2cb;background:rgba(255,77,109,.12);border:1px solid rgba(255,77,109,.28);border-radius:13px;padding:11px;margin-bottom:12px}.authClose{position:absolute;right:16px;top:16px;width:34px;height:34px;padding:0}.authMiniGrid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:18px}.authMini{border:1px solid rgba(178,204,255,.14);border-radius:16px;padding:16px;background:rgba(255,255,255,.04)}.authMini b{display:block;color:#8affb5;font-size:24px}.authSession{display:inline-flex;align-items:center;gap:8px;border:1px solid rgba(37,240,132,.28);background:rgba(37,240,132,.10);border-radius:12px;padding:7px 10px;color:#d9ffe7;font-size:12px;font-weight:900}.authAvatar{width:23px;height:23px;border-radius:8px;display:grid;place-items:center;background:linear-gradient(135deg,#25f084,#8b3dff);color:#05120a;font-weight:950}.authSignout{border:1px solid rgba(178,204,255,.14);background:rgba(255,255,255,.045);color:#fff;border-radius:11px;padding:9px 12px;font-size:12px;font-weight:900;cursor:pointer}@media(max-width:860px){.authCard{grid-template-columns:1fr}.authHero{border-right:0;border-bottom:1px solid rgba(178,204,255,.14)}.oauthGrid,.authMiniGrid{grid-template-columns:1fr}.authHero h2{font-size:34px}}
  `;
  document.head.appendChild(style);
}

function markup() {
  const title = authMode === 'signup' ? 'Premium hesabını oluştur' : 'Premium hesabına giriş yap';
  const action = authMode === 'signup' ? 'Premium Hesap Oluştur' : 'Giriş Yap';
  return `
    <div class="authOverlay" data-auth-overlay>
      <section class="authCard">
        <div class="authHero">
          <div class="kicker purple">Premium Üyelik</div>
          <h2>Kontrol Sende.<br><span class="grad">Güven hesabın hazır.</span></h2>
          <p>Üye olunca puan cüzdanın, görevlerin, şikayet geçmişin ve ödül uygunluğun tek profilde birleşir.</p>
          <div class="authMiniGrid"><div class="authMini"><b>+40</b><span>Kanıtlı bildirim puanı</span></div><div class="authMini"><b>₺</b><span>Sponsor havuzu uygunluğu</span></div></div>
        </div>
        <div class="authForm">
          <button class="authClose" data-auth-close>×</button>
          <div class="authTabs"><button class="${authMode === 'signin' ? 'active' : ''}" data-auth-mode="signin">Giriş Yap</button><button class="${authMode === 'signup' ? 'active' : ''}" data-auth-mode="signup">Üye Ol</button></div>
          <h3>${title}</h3>
          ${errorText ? `<div class="authError">${escapeHtml(errorText)}</div>` : ''}
          <div class="oauthGrid"><button class="oauth" data-oauth="google">● Google ile devam et</button><button class="oauth" data-oauth="apple"> Apple ile devam et</button></div>
          <div class="divider">veya e-posta ile</div>
          <form data-auth-form><input class="authInput" name="email" type="email" autocomplete="email" placeholder="E-posta adresi" required><input class="authInput" name="password" type="password" autocomplete="${authMode === 'signup' ? 'new-password' : 'current-password'}" placeholder="Şifre" required><button class="authSubmit" type="submit">${busy ? 'İşleniyor...' : action}</button></form>
          <p class="authFine">Google ve Apple girişleri Supabase OAuth provider ayarları aktifse gerçek redirect ile çalışır. Provider yoksa e-posta/demo oturumu ile profil bootstrap yapılır.</p>
        </div>
      </section>
    </div>`;
}

function openAuth(mode = 'signin') {
  installAuthStyles();
  authMode = mode;
  errorText = '';
  closeAuth();
  document.body.insertAdjacentHTML('beforeend', markup());
}

function closeAuth() {
  document.querySelector('[data-auth-overlay]')?.remove();
}

async function completeAuth(email, authUser = null, provider = 'E-posta') {
  let profile = null;
  try { profile = await platformStore.signIn(email); } catch (error) { console.warn('Profile bootstrap failed:', error); }
  const displayName = authUser?.user_metadata?.full_name || authUser?.user_metadata?.name || profile?.displayName || email.split('@')[0];
  saveUser({ id: authUser?.id || profile?.id || `user-${Date.now()}`, email, displayName, role: profile?.role || 'user', provider });
  window.dispatchEvent(new CustomEvent('gi:auth', { detail: sessionUser }));
}

async function submitAuth(event) {
  event.preventDefault();
  const fd = new FormData(event.target);
  const email = fd.get('email')?.toString().trim();
  const password = fd.get('password')?.toString();
  if (!email || !password) return;
  busy = true; errorText = ''; openAuth(authMode);
  try {
    const supabase = platformStore.supabase;
    if (supabase) {
      const response = authMode === 'signup'
        ? await supabase.auth.signUp({ email, password, options: { emailRedirectTo: location.origin } })
        : await supabase.auth.signInWithPassword({ email, password });
      if (response.error) throw response.error;
      await completeAuth(email, response.data?.user, 'E-posta');
    } else {
      await completeAuth(email, null, 'Demo e-posta');
    }
    closeAuth();
  } catch (error) {
    errorText = error?.message || 'Giriş işlemi tamamlanamadı.';
    openAuth(authMode);
  } finally {
    busy = false;
  }
}

async function startOAuth(provider) {
  const supabase = platformStore.supabase;
  if (!supabase) { errorText = 'Supabase OAuth için VITE_SUPABASE_URL ve VITE_SUPABASE_ANON_KEY gerekir.'; openAuth(authMode); return; }
  const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: location.origin } });
  if (error) { errorText = error.message; openAuth(authMode); }
}

async function signOut() {
  try { await platformStore.supabase?.auth.signOut(); } catch (error) { console.warn('Sign out failed:', error); }
  saveUser(null);
}

function paintTopbar() {
  const topbar = document.querySelector('.topbar');
  if (!topbar) return;
  topbar.querySelectorAll('.authSession,.authSignout').forEach((node) => node.remove());
  const login = topbar.querySelector('[data-action="signin"]');
  const signup = topbar.querySelector('a[href="/uye-ol"]');
  if (sessionUser) {
    if (login) login.style.display = 'none';
    if (signup) signup.style.display = 'none';
    topbar.insertAdjacentHTML('beforeend', `<span class="authSession"><span class="authAvatar">${initials(sessionUser.displayName || sessionUser.email)}</span>${escapeHtml(sessionUser.displayName || sessionUser.email)}</span><button class="authSignout" data-auth-signout>Çıkış</button>`);
  } else {
    if (login) login.style.display = '';
    if (signup) signup.style.display = '';
  }
}

function bindAuthEvents() {
  document.addEventListener('click', (event) => {
    const signIn = event.target.closest('[data-action="signin"]');
    const signUp = event.target.closest('a[href="/uye-ol"], [data-action="signup"]');
    const close = event.target.closest('[data-auth-close]');
    const mode = event.target.closest('[data-auth-mode]');
    const oauth = event.target.closest('[data-oauth]');
    const signout = event.target.closest('[data-auth-signout]');
    if (signIn) { event.preventDefault(); event.stopImmediatePropagation(); openAuth('signin'); }
    if (signUp) { event.preventDefault(); event.stopImmediatePropagation(); openAuth('signup'); }
    if (close) closeAuth();
    if (mode) openAuth(mode.dataset.authMode);
    if (oauth) startOAuth(oauth.dataset.oauth);
    if (signout) signOut();
  }, true);
  document.addEventListener('submit', (event) => {
    if (event.target.matches('[data-auth-form]')) submitAuth(event);
  });
  new MutationObserver(paintTopbar).observe(document.getElementById('root'), { childList: true, subtree: true });
}

async function bootstrapSession() {
  installAuthStyles();
  bindAuthEvents();
  paintTopbar();
  if (['/uye-ol', '/giris', '/giris-yap'].includes(location.pathname.replace(/\/$/, ''))) openAuth(location.pathname.includes('uye') ? 'signup' : 'signin');
  try {
    const supabase = platformStore.supabase;
    if (!supabase) return;
    const { data } = await supabase.auth.getSession();
    if (data?.session?.user?.email) await completeAuth(data.session.user.email, data.session.user, data.session.user.app_metadata?.provider || 'Supabase');
    supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.email) completeAuth(session.user.email, session.user, session.user.app_metadata?.provider || 'Supabase');
    });
  } catch (error) { console.warn('Auth bootstrap failed:', error); }
}

bootstrapSession();
