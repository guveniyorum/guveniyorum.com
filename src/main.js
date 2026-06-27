import './product-app.js';

import('./platform-store.js').then(({ platformStore }) => {
  const KEY = 'guveniyorum-auth-session-v1';
  let mode = 'signin';
  let user = readUser();
  let error = '';
  let busy = false;

  function readUser() { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch { return null; } }
  function saveUser(next) { user = next || null; user ? localStorage.setItem(KEY, JSON.stringify(user)) : localStorage.removeItem(KEY); paintTopbar(); }
  function esc(v) { return String(v ?? '').replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c])); }
  function initial(v = 'G') { return String(v).trim().slice(0, 1).toUpperCase() || 'G'; }

  function styles() {
    if (document.getElementById('auth-diamond-style')) return;
    const s = document.createElement('style');
    s.id = 'auth-diamond-style';
    s.textContent = `.authOverlay{position:fixed;inset:0;z-index:9999;display:grid;place-items:center;background:rgba(3,7,14,.76);backdrop-filter:blur(18px);padding:22px}.authCard{width:min(980px,100%);display:grid;grid-template-columns:.95fr 1.05fr;overflow:hidden;border:1px solid rgba(178,204,255,.14);border-radius:24px;background:linear-gradient(135deg,rgba(13,24,41,.98),rgba(7,15,27,.98));box-shadow:0 28px 100px rgba(0,0,0,.48);color:#eef7ff}.authHero{padding:34px;background:radial-gradient(circle at 15% 20%,rgba(37,240,132,.22),transparent 40%),radial-gradient(circle at 90% 0,rgba(139,61,255,.26),transparent 45%),rgba(255,255,255,.025);border-right:1px solid rgba(178,204,255,.14)}.authHero h2{font-size:44px;line-height:.98;letter-spacing:-.06em;margin:0 0 14px}.authHero p,.authFine{color:#9fb1c8;line-height:1.55}.authForm{padding:30px;position:relative}.authTabs,.oauthGrid,.authMiniGrid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.authTabs{margin-bottom:16px}.authTabs button,.oauth,.authSubmit,.authClose,.authSignout{border:1px solid rgba(178,204,255,.14);border-radius:13px;color:#fff;font-weight:950;background:rgba(255,255,255,.045);padding:12px;cursor:pointer}.authTabs button.active{background:rgba(37,240,132,.12);border-color:rgba(37,240,132,.35)}.oauth{display:flex;align-items:center;justify-content:center;gap:8px;background:#0b1627}.divider{display:flex;align-items:center;gap:12px;color:#94a8bd;font-size:12px;margin:15px 0}.divider:before,.divider:after{content:'';height:1px;background:rgba(178,204,255,.14);flex:1}.authInput{width:100%;background:#081321;border:1px solid rgba(178,204,255,.18);border-radius:13px;color:#fff;padding:13px 14px;outline:none;margin-bottom:10px}.authSubmit{width:100%;background:linear-gradient(135deg,#25f084,#16a34a);color:#04120b;border-color:rgba(37,240,132,.56);box-shadow:0 0 34px rgba(37,240,132,.18)}.authError{color:#ffc2cb;background:rgba(255,77,109,.12);border:1px solid rgba(255,77,109,.28);border-radius:13px;padding:11px;margin-bottom:12px}.authClose{position:absolute;right:16px;top:16px;width:34px;height:34px;padding:0}.authMiniGrid{margin-top:18px}.authMini{border:1px solid rgba(178,204,255,.14);border-radius:16px;padding:16px;background:rgba(255,255,255,.04)}.authMini b{display:block;color:#8affb5;font-size:24px}.authSession{display:inline-flex;align-items:center;gap:8px;border:1px solid rgba(37,240,132,.28);background:rgba(37,240,132,.10);border-radius:12px;padding:7px 10px;color:#d9ffe7;font-size:12px;font-weight:900}.authAvatar{width:23px;height:23px;border-radius:8px;display:grid;place-items:center;background:linear-gradient(135deg,#25f084,#8b3dff);color:#05120a;font-weight:950}.authSignout{padding:9px 12px;font-size:12px}@media(max-width:860px){.authCard{grid-template-columns:1fr}.authHero{border-right:0;border-bottom:1px solid rgba(178,204,255,.14)}.oauthGrid,.authMiniGrid{grid-template-columns:1fr}.authHero h2{font-size:34px}}`;
    document.head.appendChild(s);
  }

  function close() { document.querySelector('[data-auth-overlay]')?.remove(); }
  function open(nextMode = 'signin') {
    styles(); mode = nextMode; close();
    const title = mode === 'signup' ? 'Premium hesabını oluştur' : 'Premium hesabına giriş yap';
    const action = mode === 'signup' ? 'Premium Hesap Oluştur' : 'Giriş Yap';
    document.body.insertAdjacentHTML('beforeend', `<div class="authOverlay" data-auth-overlay><section class="authCard"><div class="authHero"><div class="kicker purple">Premium Üyelik</div><h2>Kontrol Sende.<br><span class="grad">Güven hesabın hazır.</span></h2><p>Üye olunca puan cüzdanın, görevlerin, şikayet geçmişin ve ödül uygunluğun tek profilde birleşir.</p><div class="authMiniGrid"><div class="authMini"><b>+40</b><span>Kanıtlı bildirim puanı</span></div><div class="authMini"><b>₺</b><span>Sponsor havuzu uygunluğu</span></div></div></div><div class="authForm"><button class="authClose" data-auth-close>×</button><div class="authTabs"><button class="${mode === 'signin' ? 'active' : ''}" data-auth-mode="signin">Giriş Yap</button><button class="${mode === 'signup' ? 'active' : ''}" data-auth-mode="signup">Üye Ol</button></div><h3>${title}</h3>${error ? `<div class="authError">${esc(error)}</div>` : ''}<div class="oauthGrid"><button class="oauth" data-oauth="google">● Google ile devam et</button><button class="oauth" data-oauth="apple"> Apple ile devam et</button></div><div class="divider">veya e-posta ile</div><form data-auth-form><input class="authInput" name="email" type="email" autocomplete="email" placeholder="E-posta adresi" required><input class="authInput" name="password" type="password" autocomplete="${mode === 'signup' ? 'new-password' : 'current-password'}" placeholder="Şifre" required><button class="authSubmit" type="submit">${busy ? 'İşleniyor...' : action}</button></form><p class="authFine">Google ve Apple girişleri Supabase OAuth provider ayarları aktifse gerçek redirect ile çalışır. Provider yoksa e-posta/demo oturumu ile profil bootstrap yapılır.</p></div></section></div>`);
  }

  async function complete(email, authUser = null, provider = 'E-posta') {
    let profile = null;
    try { profile = await platformStore.signIn(email); } catch (e) { console.warn('Profile bootstrap failed:', e); }
    const displayName = authUser?.user_metadata?.full_name || authUser?.user_metadata?.name || profile?.displayName || email.split('@')[0];
    saveUser({ id: authUser?.id || profile?.id || `user-${Date.now()}`, email, displayName, provider, role: profile?.role || 'user' });
  }

  async function submit(e) {
    e.preventDefault();
    const fd = new FormData(e.target); const email = fd.get('email')?.toString().trim(); const password = fd.get('password')?.toString();
    if (!email || !password) return;
    busy = true; error = ''; open(mode);
    try {
      const sb = platformStore.supabase;
      if (sb) {
        const res = mode === 'signup' ? await sb.auth.signUp({ email, password, options: { emailRedirectTo: location.origin } }) : await sb.auth.signInWithPassword({ email, password });
        if (res.error) throw res.error;
        await complete(email, res.data?.user, 'E-posta');
      } else {
        await complete(email, null, 'Demo e-posta');
      }
      close();
    } catch (err) { error = err?.message || 'Giriş işlemi tamamlanamadı.'; open(mode); }
    finally { busy = false; }
  }

  async function oauth(provider) {
    const sb = platformStore.supabase;
    if (!sb) { error = 'Supabase OAuth için VITE_SUPABASE_URL ve VITE_SUPABASE_ANON_KEY gerekir.'; open(mode); return; }
    const { error: err } = await sb.auth.signInWithOAuth({ provider, options: { redirectTo: location.origin } });
    if (err) { error = err.message; open(mode); }
  }

  async function signOut() { try { await platformStore.supabase?.auth.signOut(); } catch {} saveUser(null); }

  function paintTopbar() {
    styles();
    const topbar = document.querySelector('.topbar'); if (!topbar) return;
    topbar.querySelectorAll('.authSession,.authSignout').forEach(n => n.remove());
    const login = topbar.querySelector('[data-action="signin"]'); const signup = topbar.querySelector('a[href="/uye-ol"]');
    if (user) { if (login) login.style.display = 'none'; if (signup) signup.style.display = 'none'; topbar.insertAdjacentHTML('beforeend', `<span class="authSession"><span class="authAvatar">${initial(user.displayName || user.email)}</span>${esc(user.displayName || user.email)}</span><button class="authSignout" data-auth-signout>Çıkış</button>`); }
    else { if (login) login.style.display = ''; if (signup) signup.style.display = ''; }
  }

  document.addEventListener('click', (e) => {
    const signIn = e.target.closest('[data-action="signin"]'); const signUp = e.target.closest('a[href="/uye-ol"], [data-action="signup"]');
    if (signIn) { e.preventDefault(); e.stopImmediatePropagation(); error = ''; open('signin'); }
    if (signUp) { e.preventDefault(); e.stopImmediatePropagation(); error = ''; open('signup'); }
    if (e.target.closest('[data-auth-close]')) close();
    const tab = e.target.closest('[data-auth-mode]'); if (tab) { error = ''; open(tab.dataset.authMode); }
    const provider = e.target.closest('[data-oauth]')?.dataset.oauth; if (provider) oauth(provider);
    if (e.target.closest('[data-auth-signout]')) signOut();
  }, true);
  document.addEventListener('submit', (e) => { if (e.target.matches('[data-auth-form]')) submit(e); });
  new MutationObserver(paintTopbar).observe(document.getElementById('root'), { childList: true, subtree: true });
  paintTopbar();
  if (['/uye-ol', '/giris', '/giris-yap'].includes(location.pathname.replace(/\/$/, ''))) open(location.pathname.includes('uye') ? 'signup' : 'signin');
  platformStore.supabase?.auth.getSession().then(({ data }) => { if (data?.session?.user?.email) complete(data.session.user.email, data.session.user, data.session.user.app_metadata?.provider || 'Supabase'); }).catch(() => {});
  platformStore.supabase?.auth.onAuthStateChange((_event, session) => { if (session?.user?.email) complete(session.user.email, session.user, session.user.app_metadata?.provider || 'Supabase'); });
});
