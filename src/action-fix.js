const GI = {
  user: { name: 'Mustafa', level: 7, xp: 1840, points: 425, trust: 92, complaints: 1, tests: 0 },
  files: [{ id: 'GVN-2026-0001', brand: 'Örnek Marka', topic: 'İşlem gecikmesi', status: 'Moderasyon incelemesinde', score: 74 }],
  test: null,
  selectedExpert: 'Güvenlik Uzmanı'
};

const style = document.createElement('style');
style.textContent = `
  .gi-profile{display:grid;gap:12px;margin:18px 0;padding:14px;border:1px solid #24433b;border-radius:18px;background:#071113}
  .gi-profile b{color:#34f58b}.gi-profile .gi-row{display:flex;justify-content:space-between;gap:10px;color:#91a8a1;font-size:13px}
  .gi-ecosystem{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin:14px 0}.gi-ecosystem article{border:1px solid #24433b;border-radius:16px;background:#071113;padding:14px}.gi-ecosystem b{display:block;color:#34f58b;font-size:22px}.gi-modal-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:14px}.gi-modal-grid span{border:1px solid #24433b;border-radius:12px;background:#071113;padding:10px}.gi-action-modal article{max-width:620px}.gi-toast{position:fixed;left:50%;bottom:22px;transform:translateX(-50%);z-index:120;max-width:min(760px,calc(100vw - 32px));border:1px solid #34f58b;background:#123527;border-radius:16px;padding:14px;color:#ccffe2}.gi-focus{outline:2px solid rgba(52,245,139,.7);outline-offset:4px}@media(max-width:900px){.gi-ecosystem,.gi-modal-grid{grid-template-columns:1fr}}
`;
document.head.appendChild(style);

function modal(title, body) {
  document.querySelector('.gi-action-modal')?.remove();
  const wrap = document.createElement('div');
  wrap.className = 'modal gi-action-modal';
  wrap.innerHTML = `<article><button class="close" data-gi-close>×</button><h3>${title}</h3>${body}</article>`;
  document.body.appendChild(wrap);
}

function toast(text) {
  document.querySelector('.gi-toast')?.remove();
  const el = document.createElement('div');
  el.className = 'gi-toast';
  el.textContent = text;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

function profileHtml() {
  return `<div class="gi-profile"><div class="gi-row"><span>Üye Profili</span><b>${GI.user.name}</b></div><div class="gi-row"><span>Seviye</span><b>${GI.user.level}</b></div><div class="gi-row"><span>XP</span><b>${GI.user.xp}</b></div><div class="gi-row"><span>Katkı Puanı</span><b>${GI.user.points}</b></div><div class="gi-row"><span>Güven Profili</span><b>%${GI.user.trust}</b></div></div>`;
}

function ecosystemHtml() {
  return `<div class="gi-ecosystem"><article><b>${GI.user.points}</b><span>Katkı Puanı</span></article><article><b>${GI.user.xp}</b><span>XP</span></article><article><b>${GI.files.length}</b><span>Dosya</span></article><article><b>%${GI.user.trust}</b><span>Güven Profili</span></article></div>`;
}

function connectedAction(label) {
  GI.user.xp += 15;
  GI.user.points += 4;
  modal('Bağlı Ekosistem Aksiyonu', `${profileHtml()}${ecosystemHtml()}<p><b>${label}</b> işlemi profil puanına, XP sistemine ve kişisel güven paneline işlendi.</p><div class="gi-modal-grid"><span>Profil güncellendi</span><span>Katkı puanı işlendi</span><span>Aktivite kaydı eklendi</span><span>Sonraki öneri hazırlandı</span></div>`);
  toast(`${label} işlendi · +15 XP · +4 puan`);
}

function ensureButtons() {
  document.querySelectorAll('button:not([type])').forEach(b => b.type = 'button');
  document.querySelectorAll('[data-complaint] button').forEach(b => b.type = 'submit');
  document.querySelectorAll('[data-chat] button').forEach(b => b.type = 'submit');
  const side = document.querySelector('.side-stats,.sideStats');
  if (side && !side.querySelector('.gi-profile')) side.insertAdjacentHTML('afterend', profileHtml());
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
      setTimeout(() => form.classList.remove('gi-focus'), 1600);
    }
    return;
  }
  const action = event.target.closest('[data-action],[data-act]');
  if (action) {
    event.preventDefault();
    event.stopImmediatePropagation();
    connectedAction(action.dataset.action || action.dataset.act || 'İşlem');
  }
}, true);

window.addEventListener('submit', event => {
  const form = event.target;
  if (!form.matches('form')) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  if (form.matches('[data-complaint]')) {
    const id = `GVN-2026-${String(GI.files.length + 1).padStart(4, '0')}`;
    GI.files.unshift({ id, brand: 'Yeni Marka Dosyası', topic: 'Kullanıcı bildirimi', status: 'Moderasyon incelemesinde', score: 71 });
    GI.user.complaints += 1;
    GI.user.xp += 80;
    GI.user.points += 25;
    modal('Şikayet dosyan oluşturuldu', `${profileHtml()}<p><b>Dosya No:</b> ${id}</p><p><b>Durum:</b> Moderasyon incelemesinde</p><p>Dosya artık profil, katkı puanı, marka risk analizi ve şikayet akışıyla bağlantılı.</p>${ecosystemHtml()}`);
    toast(`${id} oluşturuldu · +80 XP · +25 puan`);
    return;
  }
  if (form.matches('[data-chat]')) {
    GI.user.xp += 20;
    modal('AI Danışman Yanıtı', `${profileHtml()}<p>AI danışman soruyu marka güvenliği, davranışsal risk ve şikayet geçmişi bağlamında değerlendirdi.</p><div class="gi-modal-grid"><span>Risk: Orta</span><span>Öneri: Belge kontrolü</span><span>Sonraki adım: Şikayet kaydı</span><span>Profil etkisi: +20 XP</span></div>`);
    return;
  }
  GI.user.xp += 10;
  modal('Form kaydedildi', `${profileHtml()}<p>Bu form profil ve aktivite sistemine işlendi.</p>`);
}, true);

new MutationObserver(ensureButtons).observe(document.documentElement, { childList: true, subtree: true });
ensureButtons();
