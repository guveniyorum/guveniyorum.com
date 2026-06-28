import { readAuthSession } from './platform-store.js';

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}

function avatarInitial(session) {
  const source = session?.displayName || session?.email || 'Ü';
  return escapeHtml(source.trim().charAt(0).toLocaleUpperCase('tr-TR') || 'Ü');
}

export function topbar(routeLink) {
  const session = readAuthSession();
  const authControls = session ? authenticatedControls(session) : guestControls(routeLink);

  return `<header class="topbar"><button type="button" class="menu-toggle" data-action="toggleMenu">☰</button><input type="search" placeholder="Marka ara, şikayet bul, kullanıcı ara..."><div class="top-actions"><button type="button" data-action="demo" data-label="Bildirimler">🔔</button><button type="button" data-action="demo" data-label="Mesajlar">✉</button><button type="button" data-action="demo" data-label="Ayarlar">⚙</button>${authControls}</div></header>`;
}

function guestControls(routeLink) {
  return `${routeLink('/giris-yap', 'Giriş Yap', 'btn ghost')}${routeLink('/uye-ol', 'Üye Ol', 'btn primary')}`;
}

function authenticatedControls(session) {
  const display = escapeHtml(session.displayName || session.email || 'Yeni Üye');
  const email = escapeHtml(session.email || '');
  const level = escapeHtml(session.level || 'Yeni Üye');
  const wallet = Number(session.wallet || 0).toLocaleString('tr-TR');
  const xp = Number(session.xp || 0).toLocaleString('tr-TR');

  return `<button type="button" class="user-chip" data-action="profileSummary" data-label="${display}"><span class="avatar">${avatarInitial(session)}</span><span><b>${display}</b><small>${email ? `${email} · ` : ''}${level}</small></span></button><span class="wallet-pill">₺${wallet} · ${xp} XP</span><button type="button" class="btn ghost logout-btn" data-action="signOut">Çıkış</button>`;
}
