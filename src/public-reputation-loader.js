const currentPath = () => location.pathname.replace(/\/+$/, '') || '/';

function shouldLoadPublicReputationPlatform(path = currentPath()) {
  const embeddedComplaintHome = window.self !== window.top && path === '/sikayetler';
  return embeddedComplaintHome
    || path === '/sikayet-olustur'
    || path === '/markalar'
    || /^\/sikayet\/[^/]+$/i.test(path)
    || /^\/marka\/[^/]+$/i.test(path);
}

function showLoadFailure(error) {
  console.error('[complaints-v2] Public reputation platform could not load.', error);
  if (window.self === window.top) return;
  const notice = document.createElement('div');
  notice.setAttribute('role', 'alert');
  notice.style.cssText = 'position:fixed;inset:24px;z-index:99999;display:grid;place-items:center;padding:24px;border:1px solid rgba(255,77,109,.45);border-radius:18px;background:#091626;color:#fff;font:700 14px/1.5 system-ui;text-align:center';
  notice.textContent = 'Şikayetler V2 yüklenemedi. Sayfayı yenileyip tekrar deneyin.';
  document.body.appendChild(notice);
}

if (shouldLoadPublicReputationPlatform()) {
  document.documentElement.dataset.publicReputationLoading = 'true';
  import('./public-reputation-platform.js')
    .then(() => {
      delete document.documentElement.dataset.publicReputationLoading;
      document.documentElement.dataset.publicReputationReady = 'true';
    })
    .catch(showLoadFailure);
}
