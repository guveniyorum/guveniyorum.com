const GI_STATE = {
  user: { name: 'Mustafa', level: 7, xp: 1840, points: 425, trust: 92, complaints: 1 },
  files: [{ id: 'GVN-2026-0001', status: 'Moderasyon incelemesinde' }]
};

const style = document.createElement('style');
style.textContent = `
.gi-profile-card{display:grid;gap:8px;margin-top:14px;padding:13px;border:1px solid #24433b;border-radius:16px;background:#071113;color:#91a8a1;font-size:13px}.gi-profile-card div{display:flex;justify-content:space-between;gap:8px}.gi-profile-card b{color:#34f58b}.gi-modal-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:14px}.gi-modal-grid span{border:1px solid #24433b;border-radius:12px;background:#071113;padding:10px}.gi-action-modal article{max-width:620px}.gi-toast{position:fixed;left:50%;bottom:22px;transform:translateX(-50%);z-index:120;max-width:min(760px,calc(100vw - 32px));border:1px solid #34f58b;background:#123527;border-radius:16px;padding:14px;color:#ccffe2}.gi-focus{outline:2px solid rgba(52,245,139,.7);outline-offset:4px}@media(max-width:900px){.gi-modal-grid{grid-template-columns:1fr}}
`;
document.head.appendChild(style);

function giProfile() {
  return `<div class="gi-profile-card" data-gi-profile><div><span>Üye Profili</span><b>${GI_STATE.user.name}</b></div><div><span>Seviye</span><b>${GI_STATE.user.level}</b></div><div><span>XP</span><b>${GI_STATE.user.xp}</b></div><div><span>Katkı Puanı</span><b>${GI_STATE.user.points}</b></div><div><span>Güven Profili</span><b>%${GI_STATE.user.trust}</b></div></div>`;
}

function giStats() {
  return `<div class="gi-modal-grid"><span>Profil güncellendi</span><span>XP: ${GI_STATE.user.xp}</span><span>Katkı: ${GI_STATE.user.points}</span><span>Dosya: ${GI_STATE.files.length}</span></div>`;
}

function giModal(title, body) {
  document.querySelector('.gi-action-modal')?.remove();
  const wrap = document.createElement('div');
  wrap.className = 'modal gi-action-modal';
  wrap.innerHTML = `<article><button class="close" data-gi-close>×</button><h3>${title}</h3>${body}</article>`;
  document.body.appendChild(wrap);
}

function giToast(text) {
  document.querySelector('.gi-toast')?.remove();
  const el = document.createElement('div');
  el.className = 'gi-toast';
  el.textContent = text;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

function giRefreshProfile() {
  const old = document.querySelector('[data-gi-profile]');
  if (old) old.outerHTML = giProfile();
}

function giInstallOnce() {
  document.querySelectorAll('button:not([type])').forEach(button => button.type = 'button');
  document.querySelectorAll('[data-complaint] button').forEach(button => button.type = 'submit');
  document.querySelectorAll('[data-chat] button').forEach(button => button.type = 'submit');
  if (!document.querySelector('[data-gi-profile]')) {
    const sideStats = document.querySelector('.side-stats,.sideStats');
    if (sideStats) sideStats.insertAdjacentHTML('afterend', giProfile());
  }
}

function giAction(label) {
  GI_STATE.user.xp += 15;
  GI_STATE.user.points += 4;
  giRefreshProfile();
  giModal('Bağlı Ekosistem Aksiyonu', `<p><b>${label}</b> işlemi profil, XP, katkı puanı ve aktivite sistemine işlendi.</p>${giStats()}`);
  giToast(`${label} işlendi · +15 XP · +4 puan`);
}

window.addEventListener('click', event => {
  if (event.target.closest('[data-gi-close]')) {
    event.preventDefault();
    event.stopImmediatePropagation();
    document.querySelector('.gi-action-modal')?.remove();
    return;
  }

  const scroll = event.target.closest('[data-open-complaint],[data-scroll-form]');
  if (scroll) {
    event.preventDefault();
    event.stopImmediatePropagation();
    const form = document.querySelector('[data-complaint]');
    if (form) {
      form.scrollIntoView({ behavior: 'smooth', block: 'start' });
      form.classList.add('gi-focus');
      setTimeout(() => form.classList.remove('gi-focus'), 1400);
    }
    return;
  }

  const action = event.target.closest('[data-action],[data-act]');
  if (action) {
    event.preventDefault();
    event.stopImmediatePropagation();
    giAction(action.dataset.action || action.dataset.act || 'İşlem');
  }
}, true);

window.addEventListener('submit', event => {
  const form = event.target;
  if (!form.matches('form')) return;
  event.preventDefault();
  event.stopImmediatePropagation();

  if (form.matches('[data-complaint]')) {
    const id = `GVN-2026-${String(GI_STATE.files.length + 1).padStart(4, '0')}`;
    GI_STATE.files.unshift({ id, status: 'Moderasyon incelemesinde' });
    GI_STATE.user.complaints += 1;
    GI_STATE.user.xp += 80;
    GI_STATE.user.points += 25;
    giRefreshProfile();
    giModal('Şikayet dosyan oluşturuldu', `<p><b>Dosya No:</b> ${id}</p><p><b>Durum:</b> Moderasyon incelemesinde</p><p>Dosya profil, katkı puanı, marka risk analizi ve şikayet akışıyla bağlantılı.</p>${giStats()}`);
    giToast(`${id} oluşturuldu · +80 XP · +25 puan`);
    return;
  }

  if (form.matches('[data-chat]')) {
    GI_STATE.user.xp += 20;
    giRefreshProfile();
    giModal('AI Danışman Yanıtı', `<p>AI danışman soruyu marka güvenliği, davranışsal risk ve şikayet geçmişi bağlamında değerlendirdi.</p>${giStats()}`);
    return;
  }

  GI_STATE.user.xp += 10;
  giRefreshProfile();
  giModal('Form kaydedildi', `<p>Form profil ve aktivite sistemine işlendi.</p>${giStats()}`);
}, true);

setTimeout(giInstallOnce, 0);
setTimeout(giInstallOnce, 300);
setTimeout(giInstallOnce, 900);
