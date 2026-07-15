const V2_PATH = '/sikayetler-v2';
const EMBED_PATH = '/sikayetler?embedded=v2';
const HOST_ID = 'complaints-v2-shell';
const NAV_SELECTOR = '[data-complaints-v2-route]';

let previousTitle = '';
let syncFrame = 0;

function currentPath() {
  return location.pathname.replace(/\/+$/, '') || '/';
}

function navigate(path) {
  if (currentPath() === path) return;
  history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

function ensureStyles() {
  if (document.getElementById('complaints-v2-shell-style')) return;
  const style = document.createElement('style');
  style.id = 'complaints-v2-shell-style';
  style.textContent = `
    #${HOST_ID}{position:fixed;left:204px;top:56px;right:0;bottom:0;z-index:4;overflow:hidden;border-left:1px solid rgba(178,204,255,.10);background:#06101d;box-shadow:-24px 0 70px rgba(0,0,0,.22)}
    #${HOST_ID} iframe{display:block;width:100%;height:100%;border:0;background:#06101d}
    #${HOST_ID} .complaintsV2Loader{position:absolute;inset:0;z-index:2;display:grid;place-items:center;background:radial-gradient(circle at 50% 35%,rgba(37,240,132,.12),transparent 34%),#06101d;color:#9db0c4;font:800 13px/1.5 Inter,system-ui,sans-serif;text-align:center}
    #${HOST_ID} .complaintsV2Loader b{display:block;margin-bottom:6px;color:#eafff0;font-size:17px}
    .sidebar .nav ${NAV_SELECTOR}{position:relative}
    .sidebar .nav ${NAV_SELECTOR} .badge{background:rgba(139,61,255,.19);border-color:rgba(139,61,255,.32);color:#dccfff}
    @media(max-width:980px){#${HOST_ID}{left:0}}
  `;
  document.head.appendChild(style);
}

function ensureSidebarEntry() {
  const existing = document.querySelector(NAV_SELECTOR);
  if (existing) {
    existing.classList.toggle('active', currentPath() === V2_PATH);
    return existing;
  }

  const source = document.querySelector('.sidebar .nav a[href="/sikayetler"]');
  if (!source) return null;

  const link = document.createElement('a');
  link.href = V2_PATH;
  link.setAttribute('data-complaints-v2-route', '');
  link.className = currentPath() === V2_PATH ? 'active' : '';
  link.setAttribute('aria-label', 'Şikayetler V2 bölümünü aç');
  link.innerHTML = '<span>◫</span><span>Şikayetler V2</span><em class="badge purple">V2</em>';
  link.addEventListener('click', (event) => {
    event.preventDefault();
    source.closest('.sidebar')?.classList.remove('open');
    navigate(V2_PATH);
  });
  source.insertAdjacentElement('afterend', link);
  return link;
}

function mountV2() {
  if (document.getElementById(HOST_ID)) return;
  previousTitle = document.title;
  document.title = 'Şikayetler V2 — Güveniyorum';
  document.body.classList.add('complaintsV2Active');

  const host = document.createElement('section');
  host.id = HOST_ID;
  host.setAttribute('aria-label', 'Şikayetler V2');
  host.innerHTML = `
    <div class="complaintsV2Loader" aria-live="polite"><div><b>Şikayetler V2 hazırlanıyor</b>Gerçek şikayet, marka ve kanıt verileri yükleniyor…</div></div>
    <iframe title="Güveniyorum Şikayetler V2" src="${EMBED_PATH}" allow="clipboard-read; clipboard-write; fullscreen" referrerpolicy="same-origin"></iframe>
  `;
  host.querySelector('iframe')?.addEventListener('load', () => host.querySelector('.complaintsV2Loader')?.remove(), { once: true });
  document.body.appendChild(host);
}

function unmountV2() {
  document.getElementById(HOST_ID)?.remove();
  document.body.classList.remove('complaintsV2Active');
  if (previousTitle) document.title = previousTitle;
  previousTitle = '';
}

function sync() {
  syncFrame = 0;
  ensureStyles();
  ensureSidebarEntry();
  document.querySelector(NAV_SELECTOR)?.classList.toggle('active', currentPath() === V2_PATH);
  if (currentPath() === V2_PATH) mountV2();
  else unmountV2();
}

function queueSync() {
  if (syncFrame) return;
  syncFrame = requestAnimationFrame(sync);
}

if (window.self === window.top) {
  window.addEventListener('popstate', queueSync);
  window.addEventListener('resize', queueSync);
  window.addEventListener('gi:state', queueSync);
  new MutationObserver(queueSync).observe(document.getElementById('root') || document.body, { childList: true, subtree: true });
  queueSync();
}
