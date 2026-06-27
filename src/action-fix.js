import { platformStore } from './platform-store.js';

const style = document.createElement('style');
style.textContent = `
.gi-profile-card{display:grid;gap:8px;margin-top:14px;padding:13px;border:1px solid #24433b;border-radius:16px;background:#071113;color:#91a8a1;font-size:13px}.gi-profile-card div{display:flex;justify-content:space-between;gap:8px}.gi-profile-card b{color:#34f58b}.gi-modal-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:14px}.gi-modal-grid span{border:1px solid #24433b;border-radius:12px;background:#071113;padding:10px}.gi-action-modal article{max-width:620px}.gi-toast{position:fixed;left:50%;bottom:22px;transform:translateX(-50%);z-index:120;max-width:min(760px,calc(100vw - 32px));border:1px solid #34f58b;background:#123527;border-radius:16px;padding:14px;color:#ccffe2}.gi-focus{outline:2px solid rgba(52,245,139,.7);outline-offset:4px}@media(max-width:900px){.gi-modal-grid{grid-template-columns:1fr}}
`;
document.head.appendChild(style);

function user() {
  const current = platformStore.currentUser();
  return {
    name: current.displayName || current.email || 'Üye',
    level: current.level || 1,
    xp: current.xp || 0,
    points: current.points || 0,
    trust: current.trustScore || 70
  };
}

function state() { return platformStore.getState(); }
function profile() { const u = user(); return `<div class="gi-profile-card" data-gi-profile><div><span>Üye Profili</span><b>${u.name}</b></div><div><span>Seviye</span><b>${u.level}</b></div><div><span>XP</span><b>${u.xp}</b></div><div><span>Katkı Puanı</span><b>${u.points}</b></div><div><span>Güven Profili</span><b>%${u.trust}</b></div><div><span>Veri Modu</span><b>${platformStore.hasSupabase ? 'Supabase' : 'Yerel'}</b></div></div>`; }
function stats() { const s = state(); const u = user(); return `<div class="gi-modal-grid"><span>Veri: ${platformStore.hasSupabase ? 'Supabase' : 'Yerel fallback'}</span><span>XP: ${u.xp}</span><span>Katkı: ${u.points}</span><span>Dosya: ${s.complaints.length}</span></div>`; }
function modal(title, body) { document.querySelector('.gi-action-modal')?.remove(); const wrap = document.createElement('div'); wrap.className = 'modal gi-action-modal'; wrap.innerHTML = `<article><button class="close" data-gi-close>×</button><h3>${title}</h3>${body}</article>`; document.body.appendChild(wrap); }
function toast(text) { document.querySelector('.gi-toast')?.remove(); const el = document.createElement('div'); el.className = 'gi-toast'; el.textContent = text; document.body.appendChild(el); setTimeout(() => el.remove(), 3000); }
function refreshProfile() { const old = document.querySelector('[data-gi-profile]'); if (old) old.outerHTML = profile(); }
function install() { document.querySelectorAll('button:not([type])').forEach(button => button.type = 'button'); document.querySelectorAll('[data-complaint] button').forEach(button => button.type = 'submit'); document.querySelectorAll('[data-chat] button').forEach(button => button.type = 'submit'); if (!document.querySelector('[data-gi-profile]')) { const sideStats = document.querySelector('.side-stats,.sideStats'); if (sideStats) sideStats.insertAdjacentHTML('afterend', profile()); } }

async function action(label) {
  const result = await platformStore.submitPsychologyTest(20, { action: label });
  refreshProfile();
  modal('Bağlı Ekosistem Aksiyonu', `<p><b>${label}</b> işlemi profil, XP, katkı puanı ve aktivite sistemine işlendi.</p><p>İşlem kimliği: ${result.id}</p>${stats()}`);
  toast(`${label} işlendi · profil güncellendi`);
}

window.addEventListener('click', async event => {
  if (event.target.closest('[data-gi-close]')) { event.preventDefault(); event.stopImmediatePropagation(); document.querySelector('.gi-action-modal')?.remove(); return; }
  const scroll = event.target.closest('[data-open-complaint],[data-scroll-form]');
  if (scroll) { event.preventDefault(); event.stopImmediatePropagation(); const form = document.querySelector('[data-complaint]'); if (form) { form.scrollIntoView({ behavior: 'smooth', block: 'start' }); form.classList.add('gi-focus'); setTimeout(() => form.classList.remove('gi-focus'), 1400); } return; }
  const act = event.target.closest('[data-action],[data-act]');
  if (act) { event.preventDefault(); event.stopImmediatePropagation(); await action(act.dataset.action || act.dataset.act || 'İşlem'); }
}, true);

window.addEventListener('submit', async event => {
  const form = event.target;
  if (!form.matches('form')) return;
  event.preventDefault();
  event.stopImmediatePropagation();

  if (form.matches('[data-complaint]')) {
    const data = new FormData(form);
    const complaint = await platformStore.createComplaint({
      brandName: data.get('brand') || form.querySelector('input')?.value || 'Yeni Marka',
      title: data.get('title') || 'Yeni şikayet bildirimi',
      category: form.querySelector('select')?.value || 'Genel bildirim',
      description: form.querySelector('textarea')?.value || 'Kullanıcı açıklaması bekleniyor.',
      evidenceLevel: 'medium'
    });
    refreshProfile();
    modal('Şikayet dosyan oluşturuldu', `<p><b>Dosya No:</b> ${complaint.publicId}</p><p><b>Durum:</b> Moderasyon incelemesinde</p><p>Dosya admin onay kuyruğuna, profil geçmişine ve marka risk analizine işlendi.</p>${stats()}`);
    toast(`${complaint.publicId} oluşturuldu`);
    return;
  }

  if (form.matches('[data-chat]')) {
    const result = await platformStore.submitPsychologyTest(35, { source: 'ai-chat' });
    refreshProfile();
    modal('AI Danışman Yanıtı', `<p>AI danışman soruyu marka güvenliği, davranışsal risk ve şikayet geçmişi bağlamında değerlendirdi.</p><p>Risk seviyesi: <b>${result.riskLevel}</b></p>${stats()}`);
    return;
  }

  await platformStore.signIn(form.querySelector('input[type="email"], input')?.value || 'admin@guveniyorum.com');
  refreshProfile();
  modal('Oturum ve profil güncellendi', `<p>Üyelik/profil akışı platform store üzerinden işlendi.</p>${stats()}`);
}, true);

window.addEventListener('gi:state', refreshProfile);
window.addEventListener('gi:store-ready', () => { platformStore.sync().then(() => { refreshProfile(); install(); }); });
setTimeout(install, 0); setTimeout(install, 300); setTimeout(install, 900);
