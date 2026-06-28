const STORAGE_KEY = 'guveniyorum-diamond-state-v1';

const initialState = {
  route: normalize(location.pathname),
  sidebarOpen: false,
  search: '',
  activeFilter: 'all',
  points: 1247,
  wallet: 920,
  level: 'Uzman',
  contribution: 89,
  riskScore: 25,
  toast: '',
  feed: [
    'BetSafe ödeme gecikmesi çözüldü · +75 puan',
    'AyşeK çözüm onayı verdi · ödül uygunluğu yükseldi',
    'TürkBahis yanıt süresini 4 saate düşürdü',
  ],
  aiMessages: [
    { role: 'ai', text: 'Kontrol sende. Güven skoru, şikayet çözümü, risk sinyali ve ödül uygunluğunu birlikte okuyabilirim.' },
  ],
};

const saved = readStore();
const state = { ...initialState, ...saved, route: normalize(location.pathname) };

const brands = [
  {
    slug: 'betsafe', name: 'BetSafe', badge: 'Diamond Trust', score: 98, ux: 4.8, users: '128K', complaints: 8,
    resolution: 98, response: '3s', trend: '+12%', pool: '₺120K', kind: 'safe', tags: ['Hızlı Ödeme', 'Çözüm Garantisi', '7/24 Destek'],
  },
  {
    slug: 'turkbahis', name: 'TürkBahis', badge: 'Yükselen Marka', score: 95, ux: 4.6, users: '88K', complaints: 12,
    resolution: 95, response: '4s', trend: '+18%', pool: '₺70K', kind: 'safe new', tags: ['KYC Hızlı', 'Canlı Destek', 'Düşük Limit'],
  },
  {
    slug: 'kacinbet', name: 'KaçınBet', badge: 'Yüksek Risk', score: 25, ux: 1.8, users: '12K', complaints: 178,
    resolution: 11, response: 'Yok', trend: '-31%', pool: 'Yok', kind: 'risk', tags: ['Çözüm Oranı Düşük', 'Yanıt Bekleniyor', 'Kullanıcı Uyarısı'],
  },
];

const missions = [
  { key: 'daily', title: 'Günlük güven kontrolü', desc: '3 site kartını incele, güven sinyallerini karşılaştır.', points: 5 },
  { key: 'review', title: 'Doğrulanmış yorum yaz', desc: 'Gerçek deneyimini kanıt ve tarih bağlamıyla paylaş.', points: 15 },
  { key: 'complaint', title: 'Kanıtlı şikayet oluştur', desc: 'Marka, kategori ve beklenen çözümle dosya aç.', points: 40 },
  { key: 'resolution', title: 'Çözüm onayı ver', desc: 'Sorun çözüldüyse süreci kapat ve marka skoruna katkı ver.', points: 75 },
];

const menu = [
  ['/', '✓', 'Ana Sayfa', ''],
  ['/marka-ligi', '🏆', 'Site Ligi', 'HOT'],
  ['/sikayetler', '⚠', 'Şikayet Ağı', '347'],
  ['/puanlama-motoru', '◆', 'Puanlama Motoru', 'LIVE'],
  ['/firma-rekabeti', '⚔', 'Firma Rekabeti', ''],
  ['/kara-liste', '▲', 'Kara Liste', 'ALARM'],
  ['/sorumlu-kullanim', '♡', 'Sorumlu Oyun', 'ÖNEMLİ'],
  ['/kullanici-psikolojisi', '🧠', 'Oyuncu Psikolojisi', ''],
  ['/wellness-merkezi', '✣', 'Wellness Merkezi', 'PRO'],
  ['/topluluk-merkezi', '✳', 'Topluluk Merkezi', '12K'],
  ['/ai-danisman', '◇', 'AI Danışman', 'AI'],
  ['/sertifikasyon', '♜', 'Sertifikasyon', ''],
  ['/marka-yonetimi', '▤', 'Marka Yönetimi', 'B2B'],
];

function normalize(path) {
  const clean = path !== '/' && path.endsWith('/') ? path.slice(0, -1) : path;
  const aliases = {
    '/site-ligi': '/marka-ligi',
    '/profil/puanlarim': '/puanlama-motoru',
    '/puan-merkezi': '/puanlama-motoru',
    '/odul-merkezi': '/puanlama-motoru',
    '/complaints': '/sikayetler',
    '/sikayet-et': '/sikayetler',
    '/responsible-gaming': '/sorumlu-kullanim',
  };
  return aliases[clean] || clean;
}

function readStore() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; }
}

function saveStore() {
  const snapshot = {
    points: state.points,
    wallet: state.wallet,
    level: state.level,
    contribution: state.contribution,
    riskScore: state.riskScore,
    feed: state.feed,
    aiMessages: state.aiMessages,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
}

function money(value) { return new Intl.NumberFormat('tr-TR').format(value); }
function root() { return document.getElementById('root'); }

function installStyles() {
  if (document.getElementById('diamond-style')) return;
  const style = document.createElement('style');
  style.id = 'diamond-style';
  style.textContent = `
    :root{--bg:#07111f;--side:#07101d;--panel:#0d1829;--panel2:#111d31;--line:rgba(178,204,255,.14);--text:#eef7ff;--muted:#94a8bd;--green:#25f084;--green2:#8affb5;--purple:#8b3dff;--red:#ff4d6d;--amber:#f8b84e;--radius:20px;--shadow:0 24px 80px rgba(0,0,0,.34)}
    *{box-sizing:border-box}html,body,#root{min-height:100%}body{margin:0;background:var(--bg);color:var(--text);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;letter-spacing:-.025em;overflow:hidden}a{color:inherit;text-decoration:none}button,input,select,textarea{font:inherit}button{cursor:pointer}
    .app{height:100vh;display:grid;grid-template-columns:204px minmax(0,1fr);overflow:hidden;background:radial-gradient(900px 540px at 74% 0,rgba(37,240,132,.14),transparent 62%),radial-gradient(760px 500px at 46% 28%,rgba(139,61,255,.13),transparent 60%),linear-gradient(180deg,#07111f,#091424)}
    .sidebar{height:100vh;background:linear-gradient(180deg,#07101d,#081120 58%,#050a13);border-right:1px solid var(--line);padding:16px 10px;overflow:auto;z-index:5}.brand{display:flex;align-items:center;gap:10px;margin:0 0 20px}.logo{width:34px;height:34px;border-radius:11px;display:grid;place-items:center;background:linear-gradient(135deg,var(--green),#14b8a6);box-shadow:0 0 28px rgba(37,240,132,.34);color:#06120b;font-weight:950}.brand b{display:block;font-size:14px}.brand small{color:var(--green2);font-size:10px}.nav{display:grid;gap:4px}.nav a{display:grid;grid-template-columns:20px 1fr auto;gap:8px;align-items:center;min-height:38px;padding:9px 10px;border:1px solid transparent;border-radius:11px;color:#b9c7d9;font-size:12px;line-height:1.25}.nav a.active,.nav a:hover{background:rgba(37,240,132,.11);border-color:rgba(37,240,132,.28);color:#fff}.badge{border-radius:999px;padding:2px 6px;font-size:9px;font-weight:900;background:rgba(37,240,132,.14);color:#86ffb2;border:1px solid rgba(37,240,132,.24)}.badge.red{background:rgba(255,77,109,.17);color:#ffa0ad}.badge.purple{background:rgba(139,61,255,.19);color:#d9c8ff}.sidecard{margin-top:20px;border:1px solid var(--line);background:rgba(255,255,255,.03);border-radius:14px;padding:12px;color:var(--muted);font-size:11px}.sidecard div{display:flex;justify-content:space-between;margin:7px 0}.sidecard strong{color:var(--green2)}
    .main{height:100vh;min-width:0;display:grid;grid-template-rows:56px minmax(0,1fr);overflow:hidden}.topbar{height:56px;background:rgba(7,13,23,.90);backdrop-filter:blur(16px);border-bottom:1px solid var(--line);display:flex;align-items:center;gap:12px;padding:0 16px}.hamb{display:none}.search{width:min(520px,48vw);height:36px;background:#0d1828;border:1px solid rgba(178,204,255,.18);border-radius:10px;color:#dfeaff;padding:0 14px;outline:none}.topspacer{flex:1}.iconbtn,.btn{display:inline-flex;align-items:center;justify-content:center;border:1px solid var(--line);border-radius:11px;background:rgba(255,255,255,.045);color:#fff;padding:10px 14px;font-size:12px;font-weight:900;min-height:36px}.iconbtn{width:32px;height:32px;padding:0}.btn.green{background:linear-gradient(135deg,var(--green),#16a34a);color:#04120b;border-color:rgba(37,240,132,.56);box-shadow:0 0 34px rgba(37,240,132,.18)}.btn.purple{background:linear-gradient(135deg,var(--purple),#9333ea);border-color:rgba(147,51,234,.55)}.btn.red{background:linear-gradient(135deg,#be123c,#e11d48);border-color:rgba(255,77,109,.55)}
    .scroll{height:calc(100vh - 56px);overflow:auto;scroll-behavior:smooth;overscroll-behavior:contain}.scroll::-webkit-scrollbar,.sidebar::-webkit-scrollbar{width:10px}.scroll::-webkit-scrollbar-thumb,.sidebar::-webkit-scrollbar-thumb{background:rgba(148,163,184,.22);border-radius:99px}.section{padding:72px 24px}.wrap{max-width:1080px;margin:0 auto}.center{text-align:center}.kicker{display:inline-flex;align-items:center;gap:7px;margin-bottom:14px;border:1px solid rgba(37,240,132,.28);background:rgba(37,240,132,.10);color:#9effbd;border-radius:999px;padding:6px 11px;font-size:11px;font-weight:950;letter-spacing:.02em}.kicker.red{border-color:rgba(255,77,109,.38);background:rgba(255,77,109,.13);color:#ffa1ae}.kicker.purple{border-color:rgba(139,61,255,.35);background:rgba(139,61,255,.15);color:#dac8ff}.kicker.amber{border-color:rgba(248,184,78,.36);background:rgba(248,184,78,.14);color:#ffd48a}h1,h2,h3,p{margin-top:0}h1{font-size:clamp(46px,6vw,82px);line-height:.94;letter-spacing:-.078em;font-weight:950;margin-bottom:16px}h2{font-size:clamp(32px,4vw,50px);line-height:1;letter-spacing:-.06em;font-weight:950;margin-bottom:14px}h3{font-size:19px}.grad{background:linear-gradient(135deg,#fff 8%,#85ffb4 50%,var(--green));-webkit-background-clip:text;background-clip:text;color:transparent}.sub{max-width:760px;margin:0 auto 24px;color:var(--muted);font-size:16px;line-height:1.6}.actions{display:flex;gap:11px;justify-content:center;flex-wrap:wrap;margin-top:18px}.grid{display:grid;gap:16px}.stats{grid-template-columns:repeat(4,1fr);max-width:760px;margin:30px auto 0}.card,.stat,.site,.panel,.form,.row,.live{border:1px solid var(--line);background:linear-gradient(180deg,rgba(255,255,255,.058),rgba(255,255,255,.024));border-radius:var(--radius);box-shadow:var(--shadow)}.stat{padding:18px;text-align:center}.stat b{display:block;font-size:27px}.stat span{display:block;color:var(--muted);font-size:11px;margin-top:5px}.panel,.card,.form{padding:20px}.panel p,.card p,.form p,.site p{color:#a7b8ca;line-height:1.55}.cards2{grid-template-columns:repeat(2,1fr)}.cards3{grid-template-columns:repeat(3,1fr)}.cards4{grid-template-columns:repeat(4,1fr)}.split{grid-template-columns:1.05fr .95fr}.siteList{max-width:850px;margin:24px auto 0;display:grid;gap:16px}.site{padding:20px;text-align:left;position:relative;overflow:hidden}.site.danger{border-color:rgba(255,77,109,.32);background:linear-gradient(120deg,rgba(82,19,34,.58),rgba(255,255,255,.018))}.siteHead{display:flex;align-items:center;gap:12px}.medal{width:36px;height:36px;border-radius:11px;display:grid;place-items:center;background:rgba(37,240,132,.12);font-size:19px}.score{margin-left:auto;color:var(--green2);font-size:32px;font-weight:950}.danger .score{color:#ff7188}.chip{display:inline-flex;border-radius:999px;background:#eafdf0;color:#0c3d23;padding:3px 7px;font-size:10px;font-weight:900;margin:2px}.chip.dark{background:rgba(255,255,255,.07);color:#c9d7e8;border:1px solid var(--line)}.metrics{grid-template-columns:repeat(5,1fr);gap:9px;margin-top:12px}.metric{border:1px solid var(--line);border-radius:12px;background:rgba(255,255,255,.035);padding:10px;text-align:center}.metric b{display:block}.metric span{font-size:10px;color:#98a9bc}.tabs{display:flex;justify-content:center;gap:8px;flex-wrap:wrap;margin:24px 0}.tab{border:1px solid var(--line);background:rgba(255,255,255,.04);color:#c9d7ea;border-radius:999px;padding:8px 12px;font-size:12px;font-weight:850}.tab.active{background:linear-gradient(135deg,var(--green),#16a34a);border-color:transparent;color:#04120b}.input,.select,.textarea{width:100%;border:1px solid rgba(255,255,255,.15);background:#0b1524;color:#eaf3ff;border-radius:12px;padding:12px;margin:7px 0;outline:none}.textarea{min-height:110px;resize:vertical}.mission{display:flex;align-items:center;justify-content:space-between;gap:12px;border:1px solid var(--line);border-radius:14px;background:rgba(255,255,255,.035);padding:12px;margin:9px 0}.mission small,.muted{color:var(--muted)}.progress{height:10px;border-radius:999px;background:rgba(255,255,255,.08);overflow:hidden;border:1px solid rgba(178,204,255,.12)}.progress i{display:block;height:100%;background:linear-gradient(90deg,var(--green),var(--green2));width:var(--w,50%)}.feed p{border-bottom:1px solid rgba(178,204,255,.10);padding:10px 0;margin:0;color:#cbd8e6}.row{display:grid;grid-template-columns:1.4fr repeat(4,.8fr);gap:10px;align-items:center;padding:14px;text-align:left}.row span{color:#9aacc2;font-size:12px}.chat{display:grid;grid-template-columns:220px minmax(0,1fr);gap:16px}.expert{padding:12px;border-radius:13px;border:1px solid var(--line);background:rgba(255,255,255,.035);margin-bottom:8px}.expert.active{background:linear-gradient(135deg,var(--purple),#6d5dfc)}.chatbox{border:1px solid var(--line);border-radius:20px;background:rgba(255,255,255,.045);overflow:hidden}.chathead{padding:14px 16px;background:linear-gradient(135deg,var(--purple),#9333ea);font-weight:950;display:flex;justify-content:space-between}.msgs{padding:16px;height:260px;overflow:auto}.msg{max-width:78%;border-radius:14px;padding:12px;margin:10px 0;background:#17243a;color:#dce8f7;font-size:13px}.msg.me{margin-left:auto;background:var(--purple)}.chatinput{display:flex;gap:8px;padding:12px;border-top:1px solid var(--line)}.chatinput input{flex:1}.toast{position:fixed;right:18px;bottom:18px;background:linear-gradient(135deg,#0e1b2d,#10243b);border:1px solid rgba(37,240,132,.33);box-shadow:0 20px 60px rgba(0,0,0,.35);border-radius:14px;padding:12px 14px;color:#dfffee;font-size:12px;z-index:20}.empty{display:none;color:var(--muted);margin-top:20px}.modal{position:fixed;inset:0;background:rgba(0,0,0,.6);display:grid;place-items:center;z-index:30}.modalBox{width:min(560px,92vw);border:1px solid var(--line);background:#0b1524;border-radius:20px;padding:24px;box-shadow:var(--shadow)}
    @media(max-width:980px){.app{grid-template-columns:1fr}.sidebar{position:fixed;left:0;top:0;bottom:0;width:230px;transform:translateX(-105%);transition:.25s;z-index:10}.sidebar.open{transform:none}.hamb{display:inline-flex}.search{width:42vw}.section{padding:56px 16px}.stats,.cards2,.cards3,.cards4,.metrics,.split,.chat{grid-template-columns:1fr}.row{grid-template-columns:1fr 1fr}h1{font-size:44px}.score{font-size:24px}.topbar .hideMobile{display:none}}
  `;
  document.head.appendChild(style);
}

function routeTo(path) {
  const next = normalize(path);
  history.pushState({}, '', next);
  state.route = next;
  state.sidebarOpen = false;
  render();
}

function showToast(text) {
  state.toast = text;
  render();
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => { state.toast = ''; render(); }, 2600);
}

function addFeed(text) {
  state.feed = [text, ...state.feed].slice(0, 8);
  saveStore();
}

function gain(points, label) {
  state.points += points;
  state.contribution = Math.min(100, state.contribution + 1);
  if (state.points >= 2000) state.level = 'Diamond';
  addFeed(`${label} · +${points} puan`);
  saveStore();
  showToast(`${label}: +${points} puan eklendi.`);
}

function sidebar() {
  return `
    <aside class="sidebar ${state.sidebarOpen ? 'open' : ''}">
      <div class="brand"><div class="logo">✓</div><div><b>Güveniyorum</b><small>Trust Starts</small></div></div>
      <nav class="nav">
        ${menu.map(([path, icon, label, badge]) => `
          <a href="${path}" data-route class="${normalize(path) === state.route ? 'active' : ''}">
            <span>${icon}</span><span>${label}</span>${badge ? `<em class="badge ${badge === 'ALARM' || badge === 'ÖNEMLİ' ? 'red' : badge === 'AI' ? 'purple' : ''}">${badge}</em>` : ''}
          </a>
        `).join('')}
      </nav>
      <div class="sidecard">
        <div>Güven Puanı <strong>${money(state.points)}</strong></div>
        <div>Katkı Skoru <strong>${state.contribution}%</strong></div>
        <div>Seviye <strong>${state.level}</strong></div>
        <div>Ödül Cüzdanı <strong>₺${money(state.wallet)}</strong></div>
      </div>
    </aside>
  `;
}

function topbar() {
  return `
    <header class="topbar">
      <button class="iconbtn hamb" data-menu>☰</button>
      <input class="search" data-search value="${escapeHtml(state.search)}" placeholder="Site ara, şikayet bul, kullanıcı incele...">
      <span class="topspacer"></span>
      <button class="iconbtn hideMobile">◌</button>
      <button class="iconbtn hideMobile">⚙</button>
      <button class="btn hideMobile" data-action="signin">Giriş Yap</button>
      <a class="btn green" href="/uye-ol" data-route>Üye Ol</a>
    </header>
  `;
}

function stat(value, label) { return `<article class="stat"><b>${value}</b><span>${label}</span></article>`; }
function chip(text, dark = false) { return `<span class="chip ${dark ? 'dark' : ''}">${text}</span>`; }

function filteredBrands() {
  const q = state.search.trim().toLowerCase();
  return brands.filter((brand) => {
    const filterOk = state.activeFilter === 'all' || brand.kind.includes(state.activeFilter);
    const searchOk = !q || `${brand.name} ${brand.slug} ${brand.tags.join(' ')}`.toLowerCase().includes(q);
    return filterOk && searchOk;
  });
}

function brandCard(brand) {
  const danger = brand.kind.includes('risk');
  return `
    <article class="site ${danger ? 'danger' : ''}">
      <div class="siteHead">
        <div class="medal">${danger ? '⚠' : brand.score > 96 ? '💎' : '🏆'}</div>
        <div><h3>${brand.name} ${chip(brand.badge, danger)}</h3><small class="muted">${brand.slug}.com · ${danger ? 'İnceleme altında' : 'Verified'}</small></div>
        <strong class="score">${brand.score}%</strong>
      </div>
      <div style="margin:10px 0">${brand.tags.map((tagName, i) => chip(tagName, i > 1)).join('')}</div>
      ${danger ? '<p style="color:#ffc0ca">Çok sayıda şikayet, düşük çözüm oranı ve zayıf yanıt performansı. Kesin hüküm değil; kullanıcı uyarısıdır.</p>' : ''}
      <div class="grid metrics">
        <div class="metric"><b>${brand.ux}</b><span>UX</span></div>
        <div class="metric"><b>${brand.users}</b><span>Kullanıcı</span></div>
        <div class="metric"><b>%${brand.resolution}</b><span>Çözüm</span></div>
        <div class="metric"><b>${brand.response}</b><span>Yanıt</span></div>
        <div class="metric"><b>${brand.trend}</b><span>Trend</span></div>
      </div>
    </article>
  `;
}

function home() {
  const list = filteredBrands();
  return `
    <section class="section center" id="home">
      <div class="wrap">
        <div class="kicker">Türkiye'nin AI Destekli Güvenlik Platformu</div>
        <h1>Güvenli <span class="grad">Bahis</span><br>Kontrol <span class="grad">Sende</span></h1>
        <p class="sub">Site güven skoru, şikayet çözümü, kullanıcı etkileşimi, firma rekabeti, sorumlu oyun ve psikoloji desteği tek ekosistemde birleşir.</p>
        <div class="actions">
          <a class="btn green" href="/marka-ligi" data-route>Güvenli Siteleri Keşfet →</a>
          <a class="btn" href="/sikayetler" data-route>Şikayet Oluştur</a>
          <a class="btn purple" href="/puanlama-motoru" data-route>Puanlama Sistemini Gör</a>
        </div>
        <div class="grid stats">${stat('150+', 'Güvenli Site')}${stat('50K+', 'Aktif Kullanıcı')}${stat('12K+', 'Çözülen Şikayet')}${stat('%98', 'Güven Skoru')}</div>
      </div>
    </section>
    <section class="section center">
      <div class="wrap">
        <div class="kicker">Türkiye Bahis Siteleri</div>
        <h2>En Güvenilir Bahis Siteleri</h2>
        <p class="sub">Güvenlik, kullanıcı memnuniyeti ve şikayet çözüm performansına göre canlı liste.</p>
        ${tabs()}
        <div class="siteList">${list.map(brandCard).join('')}</div>
        <p class="empty" style="display:${list.length ? 'none' : 'block'}">Bu filtrede gösterilecek marka yok.</p>
      </div>
    </section>
  `;
}

function tabs() {
  const items = [['all', 'Tüm Siteler'], ['safe', 'Güvenli Siteler'], ['new', 'Yeni Siteler'], ['risk', 'Riskli Siteler']];
  return `<div class="tabs">${items.map(([key, label]) => `<button class="tab ${state.activeFilter === key ? 'active' : ''}" data-filter="${key}">${label}</button>`).join('')}</div>`;
}

function pointsEngine() {
  const nextPct = Math.min(100, Math.round((state.points % 2000) / 20));
  return `
    <section class="section">
      <div class="wrap">
        <div class="kicker purple">Diamond Puanlama Motoru</div>
        <h1>Puan ve Ödül <span class="grad">Merkezi</span></h1>
        <p class="sub" style="margin-left:0;text-align:left">Katkı ver, güven puanı kazan, ödül uygunluğunu yükselt. Kontrol sende.</p>
        <div class="grid stats" style="max-width:none;margin:22px 0">
          ${stat(money(state.points), 'Güven Puanı')}${stat(`${state.contribution}%`, 'Katkı Skoru')}${stat(`₺${money(state.wallet)}`, 'Ödül Cüzdanı')}${stat(state.level, 'Seviye')}
        </div>
        <div class="grid split">
          <div class="panel">
            <h3>Görevler</h3>
            <p>Her görev kullanıcıya puan kazandırır ve ödül uygunluğunu artırır.</p>
            ${missions.map((mission) => `
              <div class="mission">
                <div><b>${mission.title}</b><br><small>${mission.desc}</small></div>
                <button class="btn purple" data-mission="${mission.key}">+${mission.points}</button>
              </div>
            `).join('')}
          </div>
          <div class="panel">
            <h3>Diamond Cüzdan</h3>
            <p>Katkı puanın sponsor havuzlarından ödül uygunluğuna dönüşür. Ödül dağıtımı admin onaylı ilerler.</p>
            <div class="progress" style="--w:${nextPct}%"><i></i></div>
            <p class="muted" style="margin-top:12px">Diamond seviyeye ilerleme: ${nextPct}%</p>
            <div class="grid cards2" style="margin-top:16px">
              <div class="card"><h3>₺120K</h3><p>BetSafe sadakat havuzu</p></div>
              <div class="card"><h3>₺70K</h3><p>TürkBahis yükselen marka havuzu</p></div>
            </div>
          </div>
        </div>
        <div class="grid split" style="margin-top:16px">
          <div class="panel feed"><h3>Son Hareketler</h3>${state.feed.map((line) => `<p>${line}</p>`).join('')}</div>
          <div class="panel"><h3>Ödül Uygunluğu</h3><p>Doğrulanmış katkılar arttıkça rozet ve ödül talep hakkın yükselir.</p><button class="btn green" data-reward>Ödül Uygunluğunu Hesapla</button></div>
        </div>
      </div>
    </section>
  `;
}

function complaints() {
  return `
    <section class="section">
      <div class="wrap">
        <div class="kicker amber">Şikayet Ağı</div>
        <h1>Şikayet, Çözüm ve <span class="grad">İtibar</span> Akışı</h1>
        <p class="sub" style="margin-left:0;text-align:left">Şikayet sadece kayıt değildir. Firma için açık sınav, kullanıcı için puan ve ekosistem için güven sinyalidir.</p>
        <div class="live panel"><b>✅ BetSafe ödeme sorunu çözüldü</b><br><span class="muted">2 dk önce · +75 katkı puanı · çözüm oranına yansıdı</span></div>
        <div class="grid stats" style="max-width:none;margin:22px 0">${stat('1,247', 'Çözülen Şikayet')}${stat('89', 'İncelenen Dosya')}${stat('24 saat', 'Ortalama Yanıt')}${stat('%98', 'En İyi Çözüm Oranı')}</div>
        <div class="grid split">
          <form class="form" data-complaint-form>
            <div class="kicker red">Kanıtlı Şikayet Oluştur</div>
            <select class="select" name="brand"><option>BetSafe</option><option>TürkBahis</option><option>KaçınBet</option></select>
            <select class="select" name="category"><option>Para çekme</option><option>Bonus şartı</option><option>KYC / belge</option><option>Destek kalitesi</option></select>
            <input class="input" name="title" placeholder="Kısa ve net başlık">
            <textarea class="textarea" name="details" placeholder="Yaşadığınız sorunu detaylı açıklayın..."></textarea>
            <button class="btn green" type="submit">Şikayeti Gönder ve +40 Puan Kazan</button>
          </form>
          <div class="panel">
            <h3>Süreç nasıl çalışır?</h3>
            <div class="mission"><span>1. Kullanıcı kanıtlı şikayet oluşturur</span><b>+40</b></div>
            <div class="mission"><span>2. Marka yanıt verir</span><b>Skor</b></div>
            <div class="mission"><span>3. Kullanıcı çözüm onayı verir</span><b>+75</b></div>
            <div class="mission"><span>4. Site ligi güncellenir</span><b>Live</b></div>
          </div>
        </div>
      </div>
    </section>
  `;
}

function brandArena() {
  return `
    <section class="section">
      <div class="wrap">
        <div class="kicker amber">Firma Arenası</div>
        <h1>Siteler Arası <span class="grad">Rekabet</span></h1>
        <p class="sub" style="margin-left:0;text-align:left">Her çözüm, her kötü deneyim ve her yanıt süresi lig sıralamasını değiştirir.</p>
        <div class="grid" style="gap:12px">
          ${brands.map((brand, i) => `
            <div class="row">
              <b>${i === 0 ? '💎' : brand.kind.includes('risk') ? '⚠' : '🚀'} ${brand.name}</b>
              <span>Güven<br><b>${brand.kind.includes('risk') ? state.riskScore : brand.score}</b></span>
              <span>Çözüm<br><b>%${brand.resolution}</b></span>
              <span>Yanıt<br><b>${brand.response}</b></span>
              <span>Trend<br><b>${brand.trend}</b></span>
            </div>
          `).join('')}
        </div>
        <div class="actions"><button class="btn red" data-risk>Risk Alarmını Tetikle</button><button class="btn green" data-improve>BetSafe Çözüm Hamlesi</button></div>
      </div>
    </section>
  `;
}

function riskCenter() {
  return `
    <section class="section">
      <div class="wrap">
        <div class="kicker red">Kara Liste Aksiyon Alanı</div>
        <h1>Risk Uyarı <span class="grad">Merkezi</span></h1>
        <p class="sub" style="margin-left:0;text-align:left">Kesin suçlayıcı dil yok. Veri tabanlı risk dili var. Kötü hizmet veren marka görünürlük kaybeder.</p>
        <div class="grid cards3">
          <div class="card"><span class="kicker red">Yüksek Risk</span><h3>Çözüm Oranı Düşük</h3><p>Marka yanıt vermezse güven skoru düşer ve görünürlük azalır.</p></div>
          <div class="card"><span class="kicker red">Çok Sayıda Şikayet</span><h3>Yoğun Alarm</h3><p>Benzer sorunlar otomatik kümelenir ve risk sinyaline dönüşür.</p></div>
          <div class="card"><span class="kicker amber">İnceleme Altında</span><h3>Hukuki Güvenli Dil</h3><p>Dolandırıcı gibi kesin hüküm veren ifadeler kullanılmaz.</p></div>
        </div>
        <div class="siteList">${brandCard(brands[2])}</div>
      </div>
    </section>
  `;
}

function responsible() {
  return `
    <section class="section"><div class="wrap"><div class="kicker red">Sorumlu Oyun ve Psikoloji</div><h1>Koruma <span class="grad">Katmanı</span></h1><p class="sub" style="margin-left:0;text-align:left">Kullanıcıyı yalnızca siteye yönlendirmiyoruz. Riskli davranışta limit, mola, duygusal kontrol ve destek modülleri öne çıkar.</p><div class="grid cards4"><div class="card"><h3>⏱ Zaman Kontrolü</h3><p>Günlük süre, mola ve aktivite uyarısı.</p></div><div class="card"><h3>💵 Bütçe Yönetimi</h3><p>Bütçe, kayıp limiti ve çekim koruması.</p></div><div class="card"><h3>🧠 Psikoloji Testi</h3><p>Kayıp kovalama ve duygu kontrolü ölçülür.</p></div><div class="card"><h3>👥 Sosyal Destek</h3><p>Destek grupları ve uzman yönlendirme.</p></div></div></div></section>
  `;
}

function aiAdvisor() {
  return `
    <section class="section">
      <div class="wrap">
        <div class="kicker purple">AI Danışman</div>
        <h1>Yapay Zeka Destekli <span class="grad">Rehberlik</span></h1>
        <p class="sub" style="margin-left:0;text-align:left">Güvenlik, şikayet, psikoloji ve ödül akışı için kontrollü yönlendirme.</p>
        <div class="chat">
          <aside><div class="expert active">🧠 Dr. Psikoloji<br><small>Oyun kontrolü</small></div><div class="expert">🛡 Güvenlik Uzmanı<br><small>Site analizi</small></div><div class="expert">📊 Analiz Uzmanı<br><small>Veri ve skor</small></div><div class="expert">💡 Ödül Danışmanı<br><small>Puan ve sadakat</small></div></aside>
          <div class="chatbox"><div class="chathead">Dr. Psikoloji <span class="chip">Online</span></div><div class="msgs">${state.aiMessages.map((m) => `<div class="msg ${m.role === 'me' ? 'me' : ''}">${escapeHtml(m.text)}</div>`).join('')}</div><form class="chatinput" data-ai-form><input class="input" name="message" placeholder="Güvenlik, şikayet veya oyun kontrolü hakkında sorunuzu yazın..."><button class="btn purple">➤</button></form></div>
        </div>
      </div>
    </section>
  `;
}

function generic(title, kicker, description, cards) {
  return `<section class="section"><div class="wrap"><div class="kicker">${kicker}</div><h1>${title}</h1><p class="sub" style="margin-left:0;text-align:left">${description}</p><div class="grid cards3">${cards.map((c) => `<div class="card"><h3>${c[0]}</h3><p>${c[1]}</p></div>`).join('')}</div></div></section>`;
}

function view() {
  switch (state.route) {
    case '/': return home();
    case '/puanlama-motoru': return pointsEngine();
    case '/sikayetler': return complaints();
    case '/marka-ligi':
    case '/firma-rekabeti': return brandArena();
    case '/kara-liste': return riskCenter();
    case '/sorumlu-kullanim':
    case '/kullanici-psikolojisi': return responsible();
    case '/ai-danisman': return aiAdvisor();
    case '/topluluk-merkezi': return generic('Topluluk Merkezi', 'Birlikte İyileşiyoruz', 'Yorum, şikayet desteği, başarı hikayesi, mentorluk ve ödül sistemi tek yerde çalışır.', [['Forum', 'Deneyim paylaşımı ve faydalı cevaplar.'], ['Etkinlikler', 'Haftalık farkındalık buluşmaları.'], ['Mentorluk', 'Deneyimli üyelerden destek.']]);
    case '/wellness-merkezi': return generic('Wellness Merkezi', 'Ruh Sağlığı ve Wellness', 'Sağlıklı oyun alışkanlıkları geliştirin, uzman desteği alın ve toplulukla iyileşin.', [['Mindful Gaming', '4 hafta · 8 seans.'], ['Healthy Limits', 'Kontrollü limit alışkanlığı.'], ['Digital Detox', '7 günlük dijital mola.']]);
    case '/sertifikasyon': return generic('Güvenilirliğinizi Belgeleyin', 'Sertifikasyon', 'Firmalar için doğrulanabilir güven sertifikası, denetim ve raporlama modeli.', [['Temel Güven Sertifikası', 'Lisans kontrolü ve şikayet takibi.'], ['Gelişmiş Sertifika', 'KYC, ödeme ve bonus şartları analizi.'], ['Premium Diamond', 'Risk raporu ve marka yöneticisi paneli.']]);
    case '/marka-yonetimi': return generic('Marka İtibarınızı Yönetin', 'Marka Yönetimi', 'Geri bildirimleri yönetin, şikayetleri çözün ve güven skorunuzu artırın.', [['Dashboard', 'Güven skoru, yanıt süresi ve çözüm oranı.'], ['Şikayetler', 'Yanıtla, çözüldü işaretle, takip et.'], ['Analitik', 'Trend, risk ve kullanıcı memnuniyeti.']]);
    default: return home();
  }
}

function render() {
  installStyles();
  root().innerHTML = `
    <div class="app">
      ${sidebar()}
      <main class="main">${topbar()}<div class="scroll">${view()}</div></main>
      ${state.toast ? `<div class="toast">${state.toast}</div>` : ''}
    </div>
  `;
  bindEvents();
}

function bindEvents() {
  document.querySelectorAll('[data-route]').forEach((el) => {
    el.addEventListener('click', (event) => {
      event.preventDefault();
      routeTo(el.getAttribute('href'));
    });
  });
  document.querySelector('[data-menu]')?.addEventListener('click', () => {
    state.sidebarOpen = !state.sidebarOpen;
    render();
  });
  document.querySelector('[data-search]')?.addEventListener('input', (event) => {
    state.search = event.target.value;
    render();
  });
  document.querySelectorAll('[data-filter]').forEach((button) => {
    button.addEventListener('click', () => {
      state.activeFilter = button.dataset.filter;
      render();
    });
  });
  document.querySelectorAll('[data-mission]').forEach((button) => {
    button.addEventListener('click', () => {
      const mission = missions.find((item) => item.key === button.dataset.mission);
      if (mission) gain(mission.points, mission.title);
    });
  });
  document.querySelector('[data-reward]')?.addEventListener('click', () => {
    state.wallet += 250;
    state.points += 50;
    addFeed('Sponsor havuzundan ₺250 ödül uygunluğu hesaplandı · +50 puan');
    saveStore();
    showToast('Ödül uygunluğu hesaplandı. Cüzdana ₺250 eklendi.');
  });
  document.querySelector('[data-risk]')?.addEventListener('click', () => {
    state.riskScore = 18;
    addFeed('Risk alarmı tetiklendi · marka görünürlüğü düştü');
    saveStore();
    routeTo('/kara-liste');
    setTimeout(() => showToast('Risk alarmı tetiklendi. Marka görünürlüğü düştü.'), 80);
  });
  document.querySelector('[data-improve]')?.addEventListener('click', () => {
    gain(25, 'Çözüm hamlesi kaydedildi');
  });
  document.querySelector('[data-complaint-form]')?.addEventListener('submit', (event) => {
    event.preventDefault();
    gain(40, 'Kanıtlı şikayet oluşturuldu');
    event.target.reset();
  });
  document.querySelector('[data-ai-form]')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const message = new FormData(event.target).get('message')?.toString().trim();
    if (!message) return;
    state.aiMessages.push({ role: 'me', text: message });
    state.aiMessages.push({ role: 'ai', text: 'Önce güven skoru, sonra şikayet çözümü, ardından ödül ve firma rekabet etkisi hesaplanır. Kötü deneyim markanın lig konumunu doğrudan düşürür.' });
    saveStore();
    render();
  });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}

window.addEventListener('popstate', () => {
  state.route = normalize(location.pathname);
  render();
});

render();
