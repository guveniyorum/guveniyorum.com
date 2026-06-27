import { platformStore } from './platform-store.js';

const state = {
  route: normalize(location.pathname),
  mobile: false,
  activeTestScore: 35,
  search: '',
  modal: null,
  selectedBrand: null
};

const menu = [
  ['/', 'Ana Sayfa', '⌘'],
  ['/marka-ligi', 'Marka Ligi', 'HOT'],
  ['/sikayetler', 'Şikayetler', '89'],
  ['/admin', 'Admin Paneli', 'ADM'],
  ['/profil', 'Üye Profili', 'XP'],
  ['/kullanici-psikolojisi', 'Psikoloji Testi', 'TEST'],
  ['/ai-danisman', 'AI Danışman', 'AI'],
  ['/wellness-merkezi', 'Wellness Merkezi', 'SAFE'],
  ['/topluluk-merkezi', 'Topluluk', '1.2K'],
  ['/sertifikasyon', 'Sertifikasyon', 'OK'],
  ['/marka-yonetimi', 'Marka Paneli', 'B2B'],
  ['/yardim', 'Yardım', '?']
];

function normalize(path) {
  const aliases = { '/giris': '/giris-yap', '/uye': '/uye-ol', '/site-ligi': '/marka-ligi', '/marketing-marketplace': '/seffaflik-marketplace' };
  let value = path !== '/' && path.endsWith('/') ? path.slice(0, -1) : path;
  return aliases[value] || value;
}

function css() {
  const el = document.createElement('style');
  el.textContent = `
  *{box-sizing:border-box}html,body,#root{min-height:100%}body{margin:0;background:#080f16;color:#eefcf6;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;overflow-x:hidden}a{color:inherit;text-decoration:none}button,input,select,textarea{font:inherit}button{cursor:pointer}input,select,textarea{width:100%;border:1px solid #263c47;background:#0d1821;color:#eefcf6;border-radius:14px;padding:13px 14px;outline:none}textarea{min-height:116px;resize:vertical}.app{display:grid;grid-template-columns:92px minmax(0,1fr);min-height:100vh}.rail{position:sticky;top:0;height:100vh;background:#071014;border-right:1px solid #163029;padding:16px 10px;display:flex;flex-direction:column;align-items:center;gap:12px;z-index:30}.logo{width:52px;height:52px;border-radius:18px;background:#31f58a;color:#04120b;display:grid;place-items:center;font-weight:1000;font-size:22px;box-shadow:0 0 34px rgba(49,245,138,.22)}.rail a{width:58px;min-height:58px;border-radius:18px;display:grid;place-items:center;background:#0b161d;color:#91a8a1;border:1px solid transparent;font-weight:900;font-size:13px;text-align:center}.rail a.active,.rail a:hover{background:#123927;color:#31f58a;border-color:#1f6b49}.main{min-width:0}.top{position:sticky;top:0;z-index:20;background:rgba(8,15,22,.88);backdrop-filter:blur(18px);border-bottom:1px solid #20343a;padding:14px 24px;display:grid;grid-template-columns:minmax(260px,1fr) auto;gap:16px;align-items:center}.topActions{display:flex;align-items:center;gap:10px}.pill,.btn,.primary,.danger,.ghost{border:1px solid #263c47;background:#0d1821;color:#eefcf6;border-radius:14px;padding:11px 14px;font-weight:850;display:inline-flex;align-items:center;justify-content:center;gap:7px;min-height:42px}.primary{background:#31f58a;color:#05130b;border-color:#31f58a}.danger{background:#35131b;border-color:#7b3342;color:#ffdbe2}.ghost{background:#111b24}.wrap{max-width:1540px;margin:0 auto;padding:26px}.hero{position:relative;overflow:hidden;border:1px solid #203b43;border-radius:34px;background:radial-gradient(circle at 80% 10%,rgba(49,245,138,.12),transparent 34%),linear-gradient(145deg,#102630,#0a171f);padding:54px;margin-bottom:20px;min-height:300px;box-shadow:0 28px 90px rgba(0,0,0,.24)}.hero small,.green{color:#31f58a;font-weight:900}.hero h1{font-size:clamp(46px,6.4vw,92px);line-height:.9;margin:20px 0 18px;letter-spacing:-.07em}.hero p{max-width:820px;color:#bfd1cb;line-height:1.65;font-size:18px}.heroGrid{display:grid;grid-template-columns:1.4fr .9fr;gap:18px;align-items:stretch}.panel,.card,.metric,.form,.table,.modalCard{border:1px solid #203b43;border-radius:24px;background:linear-gradient(180deg,#10252d,#0b171f);box-shadow:0 20px 65px rgba(0,0,0,.18)}.panel,.card,.form,.table{padding:20px;margin-bottom:18px}.metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin-bottom:20px}.metric{padding:18px;min-height:104px;display:grid;align-content:center}.metric b{font-size:30px;color:#31f58a}.metric span,.muted{color:#91a8a1}.section{display:flex;justify-content:space-between;align-items:end;gap:14px;margin-bottom:16px}.section h2{font-size:30px;letter-spacing:-.04em;margin:0}.grid3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}.grid4{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px}.split{display:grid;grid-template-columns:330px minmax(0,1fr);gap:18px}.three{display:grid;grid-template-columns:280px minmax(0,1fr) 390px;gap:18px}.brandHead{display:flex;justify-content:space-between;gap:14px}.score{width:92px;height:92px;flex:0 0 92px;border-radius:50%;display:grid;place-items:center;background:#123927;border:1px solid rgba(49,245,138,.55)}.score b{font-size:24px;color:#31f58a}.tags{display:flex;gap:8px;flex-wrap:wrap}.tag{border:1px solid #24433b;background:#0d1821;border-radius:999px;color:#31f58a;padding:6px 9px;font-size:12px;font-weight:800}.info{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:12px 0}.info span{padding:10px;border:1px solid #263c47;border-radius:12px;background:#0a141b;color:#cfe2dc}.risk{border:1px solid #7b3342;background:#35131b;color:#ffdbe2;border-radius:16px;padding:12px;margin-top:12px}.actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px}.queueItem{display:grid;grid-template-columns:1fr auto;gap:12px;border:1px solid #263c47;background:#0a141b;border-radius:16px;padding:14px;margin-bottom:10px}.status{color:#31f58a;font-weight:900}.profileBox{display:grid;gap:10px}.profileRow{display:flex;justify-content:space-between;gap:10px;padding:10px;border-radius:12px;background:#0a141b;border:1px solid #263c47}.progress{height:10px;background:#0a141b;border-radius:999px;overflow:hidden;border:1px solid #263c47}.progress span{display:block;height:100%;background:linear-gradient(90deg,#31f58a,#77a7ff)}.tabs{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}.tab{border:1px solid #263c47;border-radius:14px;padding:10px 12px;background:#0a141b;color:#bfd1cb;font-weight:800}.tab.active{background:#31f58a;color:#06120b}.testOptions{display:grid;gap:10px}.testOptions button{text-align:left;justify-content:flex-start}.modal{position:fixed;inset:0;background:rgba(0,0,0,.68);z-index:100;display:grid;place-items:center;padding:20px}.modalCard{width:min(680px,100%);padding:24px;position:relative}.close{position:absolute;right:14px;top:14px;width:38px;height:38px;border-radius:50%;border:1px solid #263c47;background:#0d1821;color:#eefcf6}.toast{position:fixed;left:50%;bottom:22px;transform:translateX(-50%);z-index:120;background:#123927;border:1px solid #31f58a;color:#d8ffe8;padding:14px 18px;border-radius:16px;box-shadow:0 16px 44px rgba(0,0,0,.26)}.mobileBtn{display:none}.live{position:fixed;right:22px;bottom:22px;background:#31f58a;color:#04120b;border:0;border-radius:999px;padding:15px 20px;font-weight:1000;z-index:40}@media(max-width:1180px){.heroGrid,.three,.split{grid-template-columns:1fr}.grid3,.grid4,.metrics{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:760px){.app{grid-template-columns:1fr}.rail{position:fixed;transform:translateX(-110%);transition:.25s ease}.rail.open{transform:translateX(0)}.mobileBtn{display:inline-flex}.top{grid-template-columns:auto 1fr}.top input{min-width:0}.topActions .ghost,.topActions .primary{display:none}.wrap{padding:16px}.hero{padding:32px 22px}.metrics,.grid3,.grid4{grid-template-columns:1fr}.score{width:78px;height:78px;flex-basis:78px}}
  `;
  document.head.appendChild(el);
}

function store() { return platformStore.getState(); }
function user() { return platformStore.currentUser(); }
function money(n) { return new Intl.NumberFormat('tr-TR').format(n); }
function route(path) { history.pushState({}, '', path); state.route = normalize(path); state.mobile = false; render(); scrollTo(0, 0); }
function setModal(title, body) { state.modal = { title, body }; render(); }
function toast(text) { const old = document.querySelector('.toast'); if (old) old.remove(); const el = document.createElement('div'); el.className = 'toast'; el.textContent = text; document.body.appendChild(el); setTimeout(() => el.remove(), 3200); }
function button(label, action, cls='btn') { return `<button class="${cls}" data-action="${action}">${label}</button>`; }
function link(path, label, cls='btn') { return `<a class="${cls}" href="${path}" data-route>${label}</a>`; }
function metric(value, label) { return `<article class="metric"><b>${value}</b><span>${label}</span></article>`; }
function tag(text) { return `<span class="tag">${text}</span>`; }
function section(title, desc, right='') { return `<div class="section"><div><h2>${title}</h2><p class="muted">${desc}</p></div>${right}</div>`; }

function sidebar() {
  return `<aside class="rail ${state.mobile ? 'open' : ''}"><div class="logo">G</div>${menu.map(([path,label,badge]) => `<a href="${path}" data-route class="${normalize(path)===state.route?'active':''}" title="${label}"><span>${label.split(' ')[0]}</span>${badge?`<small>${badge}</small>`:''}</a>`).join('')}</aside>`;
}

function topbar() {
  const u = user();
  return `<header class="top"><button class="mobileBtn btn" data-toggle>☰</button><input value="${state.search}" data-search placeholder="Marka ara, şikayet bul, kullanıcı ara..."/><div class="topActions"><button class="ghost" data-action="notifications">🔔</button><button class="ghost" data-action="messages">✉️</button><button class="ghost" data-action="signin">${u?.displayName || 'Giriş Yap'}</button>${link('/profil','Profil','primary')}</div></header>`;
}

function hero() {
  return `<section class="hero"><div class="heroGrid"><div><small>Türkiye’nin #1 Şikayet ve Marka Güvenliği Platformu</small><h1>Güvenli Karar<br><span class="green">Kontrol Sende</span></h1><p>Markaları skorla, şikayet dosyanı oluştur, admin onay sürecini takip et, katkı puanı ve XP kazan. Her aksiyon profil, marka skoru ve moderasyon sistemiyle bağlantılıdır.</p><div class="actions">${link('/marka-ligi','Marka Skorlarını İncele','primary')}${link('/sikayetler','Şikayet Oluştur','btn')}</div></div><div class="card">${profileMini()}<div class="actions">${link('/admin','Admin Kuyruğu','btn')}${link('/profil','Ödül Paneli','primary')}</div></div></div></section>`;
}

function profileMini() {
  const u = user(); const s = store(); const pct = Math.min(100, ((u?.xp || 0) % 1000) / 10);
  return `<div class="profileBox"><div class="profileRow"><span>Üye</span><b>${u?.displayName || 'Misafir'}</b></div><div class="profileRow"><span>Rol</span><b>${u?.role || 'user'}</b></div><div class="profileRow"><span>Level</span><b>${u?.level || 1}</b></div><div class="profileRow"><span>XP</span><b>${u?.xp || 0}</b></div><div class="profileRow"><span>Puan</span><b>${u?.points || 0}</b></div><div class="progress"><span style="width:${pct}%"></span></div><p class="muted">${platformStore.hasSupabase ? 'Supabase bağlı' : 'Yerel fallback aktif'} · ${s.complaints.length} dosya</p></div>`;
}

function brandCard(b) {
  return `<article class="card"><div class="brandHead"><div><small class="green">${b.status}</small><h3>${b.name}</h3><p class="muted">${b.domain || b.slug}</p></div><div class="score"><b>${b.trustScore || 70}%</b></div></div><div class="info"><span>Şikayet: ${b.complaintCount || 0}</span><span>Çözüm: ${b.solvedCount || 0}</span><span>Yanıt: ${b.responseTimeHours || 24}s</span><span>Skor: ${b.trustScore || 70}</span></div><div class="tags">${tag('Güven Skoru')}${tag('Şeffaflık')}${tag('Yanıt SLA')}</div>${b.status==='high_risk'?'<div class="risk"><b>Dikkat:</b> Marka yüksek risk izleme listesinde.</div>':''}<div class="actions">${button('Detay',`brand:${b.id}`)}${button('Risk Analizi',`risk:${b.id}`,'primary')}</div></article>`;
}

function home() {
  const s = store();
  return `${hero()}<div class="metrics">${metric('150+','İzlenen Marka')}${metric(money(s.profiles.length),'Üye Profili')}${metric(money(s.complaints.length),'Şikayet Dosyası')}${metric('%98','Platform Uptime')}</div><section class="panel">${section('En Güvenilir Markalar','Skor, şikayet yoğunluğu, çözüm oranı ve yanıt süresiyle değerlendirilir.', link('/marka-ligi','Tümünü Gör','btn'))}<div class="grid3">${s.brands.map(brandCard).join('')}</div></section><section class="panel">${section('Admin Onay Kuyruğu','Üyelerin oluşturduğu şikayetler yayınlanmadan önce senin onayına düşer.', link('/admin','Admin Paneline Git','primary'))}${complaintList(s.complaints.slice(0,3), true)}</section>`;
}

function brandLeague() { const s=store(); return `<section class="panel">${section('Marka Ligi','Canlı skor, şikayet yoğunluğu ve çözüm performansı.', '')}<div class="grid3">${s.brands.map(brandCard).join('')}</div></section>`; }
function complaintList(items, compact=false) { if(!items.length) return `<p class="muted">Henüz dosya yok.</p>`; return items.map(c=>`<article class="queueItem"><div><b>${c.publicId}</b><p>${c.title}</p><span class="status">${c.status}</span><p class="muted">${c.brandName || 'Marka'} · ${c.category}</p></div><div class="actions">${button('İncele',`complaint:${c.id}`)}${button('Onayla',`approve:${c.id}`,'primary')}${compact?'':button('Reddet',`reject:${c.id}`,'danger')}</div></article>`).join(''); }

function complaints() {
  const s=store();
  return `<section class="three"><aside class="panel">${section('Şikayet Merkezi','Dosya aç, takip et, puan kazan.')}<div class="tabs"><button class="tab active">Tümü</button><button class="tab">Onay Bekleyen</button><button class="tab">Çözülen</button></div>${profileMini()}</aside><main class="panel">${section('Şikayet Akışı','Her dosya admin onayına düşer.')}${complaintList(s.complaints)}</main><form class="form" data-complaint-form><h3>Yeni Şikayet Oluştur</h3><input name="brandName" placeholder="Site / Marka adı" required><input name="title" placeholder="Şikayet başlığı" required><select name="category"><option>Para çekim sorunu</option><option>Hesap doğrulama</option><option>Yanıt gecikmesi</option><option>Şart uyuşmazlığı</option></select><textarea name="description" placeholder="Açıklama ve kanıt özeti" required></textarea><button class="primary" type="submit">Admin Onayına Gönder</button></form></section>`;
}

function admin() { const s=store(); return `<section class="split"><aside class="panel">${section('Admin Kontrol','Onay, red, puan ve marka skoru yönetimi.')}<div class="metrics">${metric(s.complaints.filter(c=>c.status==='pending_review').length,'Onay Bekleyen')}${metric(s.complaints.filter(c=>c.status==='approved').length,'Onaylı')}</div>${profileMini()}</aside><main class="panel">${section('Moderasyon Kuyruğu','Onaylanan dosya kullanıcıya XP/puan verir ve marka analizine işlenir.')}${complaintList(s.complaints)}</main></section>`; }

function profile() { const s=store(); const u=user(); return `<section class="split"><aside class="panel">${section('Üye Profili','Puan, XP, rozet ve şikayet geçmişi.')}${profileMini()}</aside><main class="panel">${section('Puan İşlemleri','Onaylı katkılar transaction mantığıyla takip edilir.')}<div class="grid3">${metric(u?.points||0,'Katkı Puanı')}${metric(u?.xp||0,'XP')}${metric(u?.level||1,'Level')}</div>${s.pointTransactions.map(t=>`<article class="queueItem"><div><b>${t.reason || t.sourceType}</b><p class="muted">${t.status}</p></div><b>+${t.points} puan / +${t.xp} XP</b></article>`).join('')}</main></section>`; }

function psychology() { return `<section class="split"><aside class="panel">${section('Psikoloji Testi','Sonuç profil risk haritasına ve önerilere işlenir.')}<p class="muted">Referans yapıdaki test akışına uygun: risk skoru, öneri ve profil güncelleme.</p></aside><main class="panel"><h2>Kontrol Farkındalık Testi</h2><div class="testOptions"><button class="tab" data-score="20">Düşük risk: düzenli takip yapıyorum.</button><button class="tab" data-score="50">Orta risk: bazen kontrol kaybı hissediyorum.</button><button class="tab" data-score="85">Yüksek risk: ara vermekte zorlanıyorum.</button></div><div class="actions">${button('Testi Kaydet','save-test','primary')}${link('/wellness-merkezi','Wellness Önerileri','btn')}</div></main></section>`; }

function ai() { return `<section class="split"><aside class="panel">${section('AI Danışman','Şikayet, marka skoru ve psikoloji profilini birlikte yorumlar.')}${profileMini()}</aside><main class="panel"><div class="card"><p>Merhaba. Marka güvenliği, şikayet dosyan ve davranışsal risk profilin üzerinden öneri üretebilirim.</p></div><form data-ai-form class="form"><input name="question" placeholder="Sorunu yaz..."><button class="primary">Analiz Et</button></form></main></section>`; }
function generic(title, desc) { return `<section class="panel">${section(title,desc)}<div class="grid3">${['Durum','Analiz','Aksiyon'].map(x=>`<article class="card"><h3>${x}</h3><p class="muted">Bu alan platform store, profil ve bildirim sistemiyle bağlıdır.</p>${button('İşlemi Aç',`generic:${x}`,'primary')}</article>`).join('')}</div></section>`; }

const pages = {
  '/': home,
  '/marka-ligi': brandLeague,
  '/sikayetler': complaints,
  '/admin': admin,
  '/profil': profile,
  '/kullanici-psikolojisi': psychology,
  '/ai-danisman': ai,
  '/wellness-merkezi': () => generic('Wellness Merkezi','Riskli davranışı azaltan destek ve öneri merkezi.'),
  '/topluluk-merkezi': () => generic('Topluluk Merkezi','Deneyim paylaşımı, mentorlar ve güvenli tartışma alanları.'),
  '/sertifikasyon': () => generic('Sertifikasyon','Markalar için güven ve şeffaflık başvuru süreci.'),
  '/marka-yonetimi': () => generic('Marka Paneli','Marka yanıtları, skor ve şikayet yönetimi.'),
  '/yardim': () => generic('Yardım Merkezi','Platform kullanımı ve destek akışları.'),
  '/giris-yap': () => auth('Giriş Yap'),
  '/uye-ol': () => auth('Üye Ol')
};
function auth(title) { return `<section class="split"><aside class="panel">${section(title,'Hesap açıldığında profil, puan, şikayet geçmişi ve bildirim sistemi bağlanır.')}</aside><form class="form" data-auth><input name="email" type="email" placeholder="E-posta" required><input type="password" placeholder="Şifre"><button class="primary">${title}</button></form></section>`; }

function render() {
  const page = pages[state.route] || pages['/'];
  document.querySelector('#root').innerHTML = `<div class="app">${sidebar()}<div class="main">${topbar()}<div class="wrap">${page()}</div></div></div><button class="live" data-action="support">Canlı Destek</button>${state.modal ? `<div class="modal"><article class="modalCard"><button class="close" data-close>×</button><h3>${state.modal.title}</h3>${state.modal.body}</article></div>` : ''}`;
}

async function handleAction(action) {
  if(action.startsWith('approve:')) { const c = await platformStore.approveComplaint(action.split(':')[1]); toast(`${c?.publicId || 'Dosya'} onaylandı`); render(); return; }
  if(action.startsWith('reject:')) { const c = await platformStore.rejectComplaint(action.split(':')[1]); toast(`${c?.publicId || 'Dosya'} reddedildi`); render(); return; }
  if(action.startsWith('complaint:')) { const c = store().complaints.find(x=>x.id===action.split(':')[1]); setModal(c?.publicId || 'Dosya', `<p>${c?.description || ''}</p><p class="status">${c?.status || ''}</p>`); return; }
  if(action.startsWith('brand:') || action.startsWith('risk:')) { const b = store().brands.find(x=>x.id===action.split(':')[1]); setModal(b?.name || 'Marka', `<p>Skor: <b>${b?.trustScore}</b></p><p>Şikayet: ${b?.complaintCount}</p><p>Yanıt süresi: ${b?.responseTimeHours}s</p>`); return; }
  if(action==='save-test') { const result = await platformStore.submitPsychologyTest(state.activeTestScore, { selected: state.activeTestScore }); setModal('Test Sonucu', `<p>Risk seviyesi: <b>${result.riskLevel}</b></p><p>Öneriler: ${result.recommendations.join(', ')}</p>`); render(); return; }
  if(action==='signin') { await platformStore.signIn('admin@guveniyorum.com'); toast('Profil oturumu açıldı'); render(); return; }
  setModal('Bağlı Aksiyon', `<p>${action} store ve bildirim sistemine bağlı çalışıyor.</p>`);
}

function events() {
  addEventListener('click', async e => {
    const r=e.target.closest('[data-route]'); if(r){ e.preventDefault(); route(r.getAttribute('href')); return; }
    if(e.target.closest('[data-toggle]')){ state.mobile=!state.mobile; render(); return; }
    if(e.target.closest('[data-close]')){ state.modal=null; render(); return; }
    const sc=e.target.closest('[data-score]'); if(sc){ state.activeTestScore=Number(sc.dataset.score); document.querySelectorAll('[data-score]').forEach(x=>x.classList.remove('active')); sc.classList.add('active'); return; }
    const a=e.target.closest('[data-action]'); if(a){ e.preventDefault(); await handleAction(a.dataset.action); }
  });
  addEventListener('submit', async e => {
    if(e.target.matches('[data-complaint-form]')){ e.preventDefault(); const fd=new FormData(e.target); const complaint=await platformStore.createComplaint(Object.fromEntries(fd.entries())); setModal('Şikayet admin onayına gönderildi', `<p><b>${complaint.publicId}</b></p><p>Durum: pending_review</p><p>Onaydan sonra üye XP/puan kazanır ve marka skoru etkilenir.</p>`); render(); return; }
    if(e.target.matches('[data-auth]')){ e.preventDefault(); const fd=new FormData(e.target); await platformStore.signIn(fd.get('email')); toast('Üyelik/profil aktif'); route('/profil'); return; }
    if(e.target.matches('[data-ai-form]')){ e.preventDefault(); const res=await platformStore.submitPsychologyTest(35,{source:'ai'}); setModal('AI Analiz Sonucu', `<p>Risk: <b>${res.riskLevel}</b></p><p>${res.recommendations.join(', ')}</p>`); render(); }
  });
  addEventListener('popstate',()=>{state.route=normalize(location.pathname);render();});
  addEventListener('gi:state',()=>render());
}

css();
platformStore.sync().finally(()=>{ render(); events(); });
