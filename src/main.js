import './product-app.js';

import('./platform-store.js').then(({ platformStore, profileAvatarPool = [] }) => {
  const KEY = 'guveniyorum-auth-session-v1';
  const NICKNAME_RE = /^[A-Za-z0-9ğüşöçıİĞÜŞÖÇ_-]{3,24}$/u;
  const avatars = profileAvatarPool.length ? profileAvatarPool : [{ key: 'neon-orbit', label: 'Neon Orbit', emoji: '◎' }];
  let mode = 'signin';
  let user = readUser();
  let error = '';
  let busy = false;
  let bootstrapError = '';
  let selectedAvatar = user?.avatarKey || user?.profile?.avatarKey || 'neon-orbit';
  const SESSION_PENDING_MESSAGE = 'Giriş isteği alındı. E-posta doğrulaması gerekiyorsa bağlantıyı kontrol et.';

  function readUser() { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch { return null; } }
  function saveUser(next) { user = next || null; user ? localStorage.setItem(KEY, JSON.stringify(user)) : localStorage.removeItem(KEY); window.dispatchEvent(new CustomEvent('gi:auth', { detail: user })); paintTopbar(); }
  function showGuestTopbar() { clearAuthSession(); }
  function clearAuthSession() { user = null; localStorage.removeItem(KEY); window.dispatchEvent(new CustomEvent('gi:auth', { detail: null })); paintTopbar(); }
  function esc(v) { return String(v ?? '').replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c])); }
  function emailPrefix(email = '') { return String(email).split('@')[0]?.trim() || 'Üye'; }
  function fmt(value) { return Number(value || 0).toLocaleString('tr-TR'); }
  function avatar(key) { return avatars.find(item => item.key === key) || avatars[0]; }
  function profileOf() { return user?.profile || user || {}; }
  function profileName(profile = profileOf()) { return profile.nickname || profile.displayName || user?.displayName || emailPrefix(profile.email || user?.email); }
  function userKey() { return user ? `user:${user.id || user.email || user.displayName || 'active'}:${user.nickname || user.avatarKey || ''}` : 'guest'; }
  function needsBootstrap(profile = profileOf()) { return Boolean(user && (!profile.nickname || profile.onboardingCompleted === false)); }
  function hasValidSupabaseSession(session) { return Boolean(session && !session.localOnly && session.user?.id); }
  function shouldOpenProfileBootstrap(session, profile = profileOf()) { return hasValidSupabaseSession(session) && needsBootstrap(profile); }
  function authProvider(authUser = null, fallback = 'Supabase') { return authUser?.app_metadata?.provider || authUser?.app_metadata?.providers?.[0] || fallback; }
  function debugAuthStep(label, payload = {}) {
    const isDevBrowser = typeof window !== 'undefined' && ['localhost', '127.0.0.1', '::1', ''].includes(location.hostname);
    if (!isDevBrowser) return;
    const session = payload.session || null;
    const profile = payload.profile || null;
    const authUser = payload.user || session?.user || null;
    console.debug('[gi-auth]', label, {
      hasSession: Boolean(payload.hasSession ?? session),
      hasUser: Boolean(payload.hasUser ?? authUser),
      hasUserId: Boolean(payload.hasUserId ?? authUser?.id),
      hasEmail: Boolean(payload.hasEmail ?? authUser?.email ?? profile?.email),
      hasProfile: Boolean(payload.hasProfile ?? profile),
      onboardingCompleted: Boolean(payload.onboardingCompleted ?? profile?.onboardingCompleted ?? profile?.onboarding_completed)
    });
  }

  function styles() {
    if (document.getElementById('auth-diamond-style')) return;
    const s = document.createElement('style');
    s.id = 'auth-diamond-style';
    s.textContent = `.authOverlay{position:fixed;inset:0;z-index:9999;display:grid;place-items:center;background:rgba(3,7,14,.76);backdrop-filter:blur(18px);padding:22px}.authCard{width:min(980px,100%);display:grid;grid-template-columns:.95fr 1.05fr;overflow:hidden;border:1px solid rgba(178,204,255,.14);border-radius:24px;background:linear-gradient(135deg,rgba(13,24,41,.98),rgba(7,15,27,.98));box-shadow:0 28px 100px rgba(0,0,0,.48);color:#eef7ff}.authHero{padding:34px;background:radial-gradient(circle at 15% 20%,rgba(37,240,132,.22),transparent 40%),radial-gradient(circle at 90% 0,rgba(139,61,255,.26),transparent 45%),rgba(255,255,255,.025);border-right:1px solid rgba(178,204,255,.14)}.authHero h2{font-size:44px;line-height:.98;letter-spacing:-.06em;margin:0 0 14px}.authHero p,.authFine{color:#9fb1c8;line-height:1.55}.authForm{padding:30px;position:relative}.authTabs,.oauthGrid,.authMiniGrid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.authTabs{margin-bottom:16px}.authTabs button,.oauth,.authSubmit,.authClose,.authSignout{border:1px solid rgba(178,204,255,.14);border-radius:13px;color:#fff;font-weight:950;background:rgba(255,255,255,.045);padding:12px;cursor:pointer}.authTabs button.active{background:rgba(37,240,132,.12);border-color:rgba(37,240,132,.35)}.oauth{display:flex;align-items:center;justify-content:center;gap:8px;background:#0b1627}.divider{display:flex;align-items:center;gap:12px;color:#94a8bd;font-size:12px;margin:15px 0}.divider:before,.divider:after{content:'';height:1px;background:rgba(178,204,255,.14);flex:1}.authInput{width:100%;background:#081321;border:1px solid rgba(178,204,255,.18);border-radius:13px;color:#fff;padding:13px 14px;outline:none;margin-bottom:10px}.authSubmit{width:100%;background:linear-gradient(135deg,#25f084,#16a34a);color:#04120b;border-color:rgba(37,240,132,.56);box-shadow:0 0 34px rgba(37,240,132,.18)}.authSubmit[disabled]{opacity:.65;cursor:wait}.authError{color:#ffc2cb;background:rgba(255,77,109,.12);border:1px solid rgba(255,77,109,.28);border-radius:13px;padding:11px;margin-bottom:12px}.authClose{position:absolute;right:16px;top:16px;width:34px;height:34px;padding:0}.authMiniGrid{margin-top:18px}.authMini{border:1px solid rgba(178,204,255,.14);border-radius:16px;padding:16px;background:rgba(255,255,255,.04)}.authMini b{display:block;color:#8affb5;font-size:24px}.authSession{display:inline-flex;align-items:center;gap:8px;border:1px solid rgba(37,240,132,.28);background:rgba(37,240,132,.10);border-radius:12px;padding:7px 10px;color:#d9ffe7;font-size:12px;font-weight:900;cursor:pointer}.authAvatar{width:23px;height:23px;border-radius:8px;display:grid;place-items:center;background:linear-gradient(135deg,#25f084,#8b3dff);color:#05120a;font-weight:950}.authAvatar.big{width:44px;height:44px;border-radius:15px;font-size:22px}.authSignout{padding:9px 12px;font-size:12px}.topPanel{position:fixed;right:22px;top:72px;z-index:9998;width:min(380px,calc(100vw - 28px));border:1px solid rgba(178,204,255,.16);border-radius:20px;background:linear-gradient(160deg,rgba(13,24,41,.98),rgba(7,15,27,.98));box-shadow:0 24px 80px rgba(0,0,0,.42);color:#eef7ff;padding:18px}.topPanel h3{margin:0 0 8px;font-size:19px}.topPanel p{margin:0 0 12px;color:#9fb1c8;line-height:1.5}.topPanelRow{display:flex;justify-content:space-between;gap:12px;border:1px solid rgba(178,204,255,.12);border-radius:14px;background:rgba(255,255,255,.04);padding:12px;margin-top:10px}.topPanelRow b{color:#8affb5}.topPanelClose{position:absolute;right:10px;top:10px;border:1px solid rgba(178,204,255,.14);border-radius:10px;background:rgba(255,255,255,.05);color:#fff;width:30px;height:30px;cursor:pointer}.topPanelAction{width:100%;margin-top:12px;border:1px solid rgba(37,240,132,.34);border-radius:13px;background:rgba(37,240,132,.12);color:#d9ffe7;padding:11px;font-weight:900;cursor:pointer}.profileSummaryHead{display:flex;align-items:center;gap:12px;margin:8px 0 12px}.profileSummaryHead b{display:block}.profileSummaryHead small{color:#9fb1c8}.profileCard{width:min(520px,100%);border:1px solid rgba(178,204,255,.16);border-radius:22px;background:linear-gradient(150deg,rgba(13,24,41,.98),rgba(7,15,27,.98));box-shadow:0 24px 90px rgba(0,0,0,.45);color:#eef7ff;padding:24px}.profileCard h2{margin:0 0 8px;font-size:28px}.profileCard p{margin:0 0 18px;color:#9fb1c8;line-height:1.5}.profileAvatarGrid{display:grid;grid-template-columns:repeat(4,1fr);gap:9px;margin:8px 0 16px}.profileAvatarOption{border:1px solid rgba(178,204,255,.14);border-radius:14px;background:rgba(255,255,255,.045);color:#eef7ff;padding:11px 7px;cursor:pointer}.profileAvatarOption.active{border-color:rgba(37,240,132,.55);background:rgba(37,240,132,.12)}.profileAvatarOption span{display:block;font-size:24px}.profileAvatarOption small{display:block;margin-top:4px;color:#9fb1c8;font-size:11px}.profileLabel{display:block;color:#dce8f6;font-size:12px;font-weight:900;margin:12px 0 6px}.authToast{position:fixed;right:18px;bottom:18px;z-index:10000;border:1px solid rgba(37,240,132,.34);border-radius:14px;background:rgba(8,19,33,.96);color:#d9ffe7;padding:12px 14px;box-shadow:0 18px 60px rgba(0,0,0,.32);font-weight:900}@media(max-width:860px){.authCard{grid-template-columns:1fr}.authHero{border-right:0;border-bottom:1px solid rgba(178,204,255,.14)}.oauthGrid,.authMiniGrid{grid-template-columns:1fr}.authHero h2{font-size:34px}.topPanel{top:64px;right:14px}.profileAvatarGrid{grid-template-columns:repeat(3,1fr)}}`;
    document.head.appendChild(s);
  }

  function close() { document.querySelector('[data-auth-overlay]')?.remove(); }
  function closeBootstrap() { document.querySelector('[data-profile-bootstrap]')?.remove(); }
  function closeTopPanel() { document.querySelector('[data-top-panel]')?.remove(); }
  function toast(message) {
    styles();
    document.querySelector('[data-auth-toast]')?.remove();
    document.body.insertAdjacentHTML('beforeend', `<div class="authToast" data-auth-toast>${esc(message)}</div>`);
    setTimeout(() => document.querySelector('[data-auth-toast]')?.remove(), 3400);
  }

  function identityFromProfile(profile = {}, authUser = null, email = '', provider = 'E-posta') {
    const resolvedEmail = profile.email || authUser?.email || email || '';
    const base = {
      id: authUser?.id || profile.userId || profile.id || user?.id || `user-${Date.now()}`,
      profileId: profile.id || user?.profileId || null,
      email: resolvedEmail,
      displayName: profile.nickname || profile.displayName || authUser?.user_metadata?.full_name || authUser?.user_metadata?.name || emailPrefix(resolvedEmail),
      nickname: profile.nickname || null,
      avatarKey: profile.avatarKey || 'neon-orbit',
      provider,
      role: profile.role || 'user',
      wallet: profile.wallet || user?.wallet || 0,
      xp: profile.xp || user?.xp || 0,
      points: profile.points || user?.points || 0,
      level: profile.level || user?.level || 1,
      contributionScore: profile.contributionScore || user?.contributionScore || 0,
      reviewCount: profile.reviewCount || 0,
      complaintCount: profile.complaintCount || 0,
      solvedContributionCount: profile.solvedContributionCount || 0,
      helpfulVotes: profile.helpfulVotes || 0,
      onboardingCompleted: Boolean(profile.onboardingCompleted)
    };
    return { ...base, profile: { ...profile, ...base } };
  }

  function openTopPanel(type) {
    styles();
    closeTopPanel();
    const profile = profileOf();
    const title = type === 'settings' ? 'Hesap ve Güvenlik' : type === 'profile' ? 'Profil Özeti' : 'Bildirimler';
    const body = type === 'settings'
      ? `<p>Oturum, tema ve güvenlik ayarlarını buradan yöneteceğiz.</p><div class="topPanelRow"><span>Oturum</span><b>Aktif</b></div><div class="topPanelRow"><span>Auth provider</span><b>${esc(user?.provider || 'E-posta')}</b></div>`
      : type === 'profile'
        ? `<div class="profileSummaryHead"><span class="authAvatar big">${esc(avatar(profile.avatarKey).emoji)}</span><div><b>${esc(profileName(profile))}</b><small>${esc(profile.email || user?.email || '')}</small></div></div><div class="topPanelRow"><span>Seviye</span><b>${fmt(profile.level || 1)}</b></div><div class="topPanelRow"><span>Puan</span><b>${fmt(profile.points || user?.points)}</b></div><div class="topPanelRow"><span>Katkı Skoru</span><b>${fmt(profile.contributionScore)}</b></div><div class="topPanelRow"><span>Değerlendirme</span><b>${fmt(profile.reviewCount)}</b></div><div class="topPanelRow"><span>Şikayet</span><b>${fmt(profile.complaintCount)}</b></div><div class="topPanelRow"><span>Çözüm</span><b>${fmt(profile.solvedContributionCount)}</b></div><div class="topPanelRow"><span>Faydalı Oy</span><b>${fmt(profile.helpfulVotes)}</b></div>`
        : `<p>Son güven hareketleri ve şikayet çözüm bildirimleri burada görünecek.</p><div class="topPanelRow"><span>BetSafe çözümü</span><b>+75</b></div><div class="topPanelRow"><span>Profil hazırlandı</span><b>Aktif</b></div>`;
    document.body.insertAdjacentHTML('beforeend', `<aside class="topPanel" data-top-panel><button class="topPanelClose" data-top-panel-close>×</button><h3>${title}</h3>${body}<button class="topPanelAction" data-top-panel-close>Tamam</button></aside>`);
  }

  function open(nextMode = 'signin') {
    styles(); mode = nextMode; close();
    const title = mode === 'signup' ? 'Premium hesabını oluştur' : 'Premium hesabına giriş yap';
    const action = mode === 'signup' ? 'Premium Hesap Oluştur' : 'Giriş Yap';
    document.body.insertAdjacentHTML('beforeend', `<div class="authOverlay" data-auth-overlay><section class="authCard"><div class="authHero"><div class="kicker purple">Premium Üyelik</div><h2>Kontrol Sende.<br><span class="grad">Güven hesabın hazır.</span></h2><p>Üye olunca puan cüzdanın, görevlerin, şikayet geçmişin ve ödül uygunluğun tek profilde birleşir.</p><div class="authMiniGrid"><div class="authMini"><b>+40</b><span>Kanıtlı bildirim puanı</span></div><div class="authMini"><b>₺</b><span>Sponsor havuzu uygunluğu</span></div></div></div><div class="authForm"><button class="authClose" data-auth-close>×</button><div class="authTabs"><button class="${mode === 'signin' ? 'active' : ''}" data-auth-mode="signin">Giriş Yap</button><button class="${mode === 'signup' ? 'active' : ''}" data-auth-mode="signup">Üye Ol</button></div><h3>${title}</h3>${error ? `<div class="authError">${esc(error)}</div>` : ''}<div class="oauthGrid"><button class="oauth" data-oauth="google">● Google ile devam et</button><button class="oauth" data-oauth="apple"> Apple ile devam et</button></div><div class="divider">veya e-posta ile</div><form data-auth-form><input class="authInput" name="email" type="email" autocomplete="email" placeholder="E-posta adresi" required><input class="authInput" name="password" type="password" autocomplete="${mode === 'signup' ? 'new-password' : 'current-password'}" placeholder="Şifre" required><button class="authSubmit" type="submit" ${busy ? 'disabled' : ''}>${busy ? 'İşleniyor...' : action}</button></form><p class="authFine">Google ve Apple girişleri Supabase OAuth provider ayarları aktifse gerçek redirect ile çalışır. Provider yoksa e-posta/demo oturumu ile profil bootstrap yapılır.</p></div></section></div>`);
  }

  function openProfileBootstrap(profile = profileOf()) {
    styles(); closeBootstrap(); bootstrapError = bootstrapError || '';
    selectedAvatar = selectedAvatar || profile.avatarKey || 'neon-orbit';
    const avatarOptions = avatars.map(item => `<button type="button" class="profileAvatarOption ${item.key === selectedAvatar ? 'active' : ''}" data-avatar-select="${esc(item.key)}"><span>${esc(item.emoji)}</span><small>${esc(item.label)}</small></button>`).join('');
    document.body.insertAdjacentHTML('beforeend', `<div class="authOverlay" data-profile-bootstrap><section class="profileCard"><h2>Profilini oluştur</h2><p>Güven ekosisteminde takma adın ve avatarınla görün. Gerçek adını paylaşmak zorunda değilsin.</p>${bootstrapError ? `<div class="authError">${esc(bootstrapError)}</div>` : ''}<form data-profile-form><label class="profileLabel" for="nickname">Takma ad</label><input id="nickname" class="authInput" name="nickname" value="${esc(profile.nickname || '')}" minlength="3" maxlength="24" autocomplete="nickname" required><label class="profileLabel">Avatar</label><div class="profileAvatarGrid">${avatarOptions}</div><button class="authSubmit" type="submit" ${busy ? 'disabled' : ''}>${busy ? 'Kaydediliyor...' : 'Kaydet ve Devam Et'}</button></form></section></div>`);
  }

  async function completeLocal(email, provider = 'Demo e-posta') {
    const profile = await platformStore.signIn(email);
    const nextUser = identityFromProfile(profile, null, email, provider);
    saveUser(nextUser);
    close();
  }

  async function completeSession(session, { provider = 'Supabase', source = 'session', openBootstrap = true } = {}) {
    const authUser = session?.user || null;
    debugAuthStep(`${source}:session`, { session, user: authUser });
    if (!authUser?.id && !authUser?.email) return null;
    let profile = null;
    try { profile = await platformStore.ensureOwnProfile(authUser); } catch (e) { console.warn('Profile bootstrap failed:', e); }
    const nextUser = identityFromProfile(profile || {}, authUser, authUser.email || user?.email || '', provider);
    saveUser(nextUser);
    debugAuthStep(`${source}:profile`, { session, user: authUser, profile: nextUser.profile });
    if (openBootstrap && shouldOpenProfileBootstrap(session, nextUser.profile)) openProfileBootstrap(nextUser.profile);
    return nextUser;
  }

  async function bootAuthRuntime() {
    const session = await platformStore.getCurrentSession();
    debugAuthStep('boot:getCurrentSession', { session });
    if (session?.user) {
      await completeSession(session, { provider: authProvider(session.user), source: 'boot' });
      return true;
    }
    showGuestTopbar();
    return false;
  }

  async function submit(e) {
    e.preventDefault();
    const fd = new FormData(e.target); const email = fd.get('email')?.toString().trim(); const password = fd.get('password')?.toString();
    if (!email || !password || busy) return;
    busy = true; error = ''; open(mode);
    try {
      const sb = platformStore.supabase;
      if (sb) {
        const res = mode === 'signup' ? await sb.auth.signUp({ email, password, options: { emailRedirectTo: location.origin } }) : await sb.auth.signInWithPassword({ email, password });
        if (res.error) throw res.error;
        const session = await platformStore.getCurrentSession();
        debugAuthStep('login-submit:getCurrentSession', { session, user: res.data?.user });
        if (!session?.user) {
          busy = false;
          error = SESSION_PENDING_MESSAGE;
          open(mode);
          return;
        }
        await completeSession(session, { provider: 'E-posta', source: 'login-submit' });
        close();
      } else {
        await completeLocal(email);
      }
    } catch (err) { busy = false; error = err?.message || 'Giriş işlemi tamamlanamadı.'; open(mode); }
    finally { busy = false; }
  }

  async function submitProfile(e) {
    e.preventDefault();
    const nickname = new FormData(e.target).get('nickname')?.toString().trim();
    if (!NICKNAME_RE.test(nickname || '')) { bootstrapError = 'Takma ad 3-24 karakter olmalı; Türkçe harf, sayı, alt çizgi veya tire kullanabilirsin.'; openProfileBootstrap(profileOf()); return; }
    busy = true; bootstrapError = ''; openProfileBootstrap({ ...profileOf(), nickname });
    try {
      const session = await platformStore.getCurrentSession();
      if (!hasValidSupabaseSession(session)) throw new Error('Profil kaydı için aktif oturum doğrulanmalı.');
      const profile = await platformStore.updateOwnProfileProfileFields({ nickname, avatarKey: selectedAvatar, onboardingCompleted: true }, user);
      saveUser(identityFromProfile(profile, user, user?.email, user?.provider || 'E-posta'));
      debugAuthStep('profile-save:success', { session, user: session.user, profile });
      busy = false; closeBootstrap();
      toast(profile.localOnly ? 'Profil yerel olarak kaydedildi. Bağlantı gelince yeniden eşitlenecek.' : 'Profilin hazır.');
    } catch (err) {
      busy = false;
      bootstrapError = err?.message || 'Profil kaydedilemedi. Lütfen bilgileri kontrol edip tekrar dene.';
      openProfileBootstrap({ ...profileOf(), nickname, avatarKey: selectedAvatar, onboardingCompleted: false });
    }
  }

  async function oauth(provider) {
    const sb = platformStore.supabase;
    if (!sb) { error = 'Supabase OAuth için VITE_SUPABASE_URL ve VITE_SUPABASE_ANON_KEY gerekir.'; open(mode); return; }
    const { error: err } = await sb.auth.signInWithOAuth({ provider, options: { redirectTo: location.origin } });
    if (err) { error = err.message; open(mode); }
  }

  async function signOut() {
    try { await platformStore.supabase?.auth.signOut(); } catch {}
    closeTopPanel(); closeBootstrap();
    busy = false; error = ''; mode = 'signin';
    clearAuthSession();
    setTimeout(() => location.replace('/'), 50);
  }

  function paintTopbar() {
    styles();
    const topbar = document.querySelector('.topbar'); if (!topbar) return;
    const key = userKey();
    if (topbar.dataset.authState === key && (user ? topbar.querySelector('.authSession') : true)) return;
    topbar.dataset.authState = key;
    topbar.querySelectorAll('.authSession,.authWallet,.authSignout').forEach(n => n.remove());
    const login = topbar.querySelector('[data-action="signin"]'); const signup = topbar.querySelector('[data-action="signup"]');
    if (user) {
      const profile = profileOf();
      if (login) login.style.display = 'none';
      if (signup) signup.style.display = 'none';
      topbar.insertAdjacentHTML('beforeend', `<button type="button" class="authSession" data-action="profile"><span class="authAvatar">${esc(avatar(profile.avatarKey).emoji)}</span>${esc(profileName(profile))}</button><span class="btn authWallet hideMobile">₺${fmt(user.wallet)} · ${fmt(user.xp)} XP</span><button type="button" class="authSignout" data-auth-signout>Çıkış</button>`);
    } else {
      if (login) login.style.display = '';
      if (signup) signup.style.display = '';
    }
  }

  document.addEventListener('click', (e) => {
    const signIn = e.target.closest('[data-action="signin"]'); const signUp = e.target.closest('[data-action="signup"]');
    const topIcon = e.target.closest('.topbar .iconbtn:not([data-menu])');
    const avatarButton = e.target.closest('[data-avatar-select]');
    if (signIn) { e.preventDefault(); e.stopImmediatePropagation(); error = ''; open('signin'); }
    if (signUp) { e.preventDefault(); e.stopImmediatePropagation(); error = ''; open('signup'); }
    if (e.target.closest('[data-auth-close]')) close();
    if (e.target.closest('[data-top-panel-close]')) closeTopPanel();
    if (e.target.closest('.authSession')) { e.preventDefault(); openTopPanel('profile'); }
    if (topIcon) { e.preventDefault(); openTopPanel(topIcon.textContent.includes('⚙') ? 'settings' : 'notifications'); }
    if (avatarButton) {
      selectedAvatar = avatarButton.dataset.avatarSelect;
      document.querySelectorAll('[data-avatar-select]').forEach(node => node.classList.toggle('active', node === avatarButton));
    }
    const tab = e.target.closest('[data-auth-mode]'); if (tab) { error = ''; open(tab.dataset.authMode); }
    const provider = e.target.closest('[data-oauth]')?.dataset.oauth; if (provider) oauth(provider);
    if (e.target.closest('[data-auth-signout]')) signOut();
  }, true);
  document.addEventListener('submit', (e) => {
    if (e.target.matches('[data-auth-form]')) submit(e);
    if (e.target.matches('[data-profile-form]')) submitProfile(e);
  });
  new MutationObserver(() => requestAnimationFrame(paintTopbar)).observe(document.getElementById('root'), { childList: true, subtree: true });
  paintTopbar();
  const authRouteMode = location.pathname.replace(/\/$/, '').includes('uye') ? 'signup' : 'signin';
  const isAuthRoute = ['/uye-ol', '/giris', '/giris-yap'].includes(location.pathname.replace(/\/$/, ''));
  bootAuthRuntime().then((hasSession) => { if (!hasSession && isAuthRoute) open(authRouteMode); }).catch((err) => { console.warn('Auth boot failed:', err?.message || err); showGuestTopbar(); if (isAuthRoute) open(authRouteMode); });
  platformStore.supabase?.auth.onAuthStateChange((event, session) => {
    debugAuthStep(`auth-state:${event}`, { session });
    if (event === 'SIGNED_OUT') {
      closeTopPanel(); closeBootstrap();
      clearAuthSession();
      return;
    }
    if (event === 'SIGNED_IN' && session?.user) {
      completeSession(session, { provider: authProvider(session.user), source: 'auth-state' }).catch((err) => console.warn('Auth state sync failed:', err?.message || err));
    }
  });
});
