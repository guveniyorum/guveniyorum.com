const routes = {
  '/': 'Ana Sayfa',
  '/marka-karsilastirma': 'Marka Karşılaştırma',
  '/misafir-kullanici': 'Misafir Kullanıcı',
  '/sertifikasyon': 'Sertifikasyon',
  '/sikayetler': 'Şikayetler',
  '/giris-yap': 'Giriş Yap',
  '/giris': 'Giriş Yap',
  '/uye-ol': 'Üye Ol',
};

const brands = [
  { name: 'NovaPay', score: 92, speed: '4 saatte ödeme', complaints: 'Düşük şikayet yoğunluğu' },
  { name: 'AtlasBet', score: 89, speed: 'Aynı gün ödeme', complaints: 'Orta seviye şikayet' },
  { name: 'GreenTrade', score: 84, speed: '24 saatte ödeme', complaints: 'Aktif takipte' },
];

const scoreNote = 'Skor; lisans, ödeme geçmişi, kullanıcı şikayetleri ve platform verileri baz alınarak hesaplanır.';
const icons = { shield: '◈', warning: '!', check: '✓', chart: '↗' };

function link(path, label, className = '') {
  return `<a href="${path}" class="${className}" data-route>${label}</a>`;
}

function brandCards() {
  return `<div class="cards">${brands.map((brand) => `
    <article class="card">
      <div class="card-head"><h3>${brand.name}</h3><span class="score">${brand.score}</span></div>
      <p class="score-note">${scoreNote}</p>
      <p>${brand.speed}</p><p>${brand.complaints}</p>
    </article>`).join('')}</div>`;
}

function header() {
  return `<header class="header">
    ${link('/', `<span class="icon">${icons.shield}</span> Güveniyorum.com`, 'brand')}
    <nav class="nav">${Object.entries(routes).map(([path, label]) => link(path, label)).join('')}</nav>
  </header>`;
}

function aside() {
  return `<aside class="helper-panel">
    <h2>Güven Merkezi</h2>
    <p>Karar vermeden önce lisans, ödeme hızı ve şikayet yoğunluğu sinyallerini birlikte incele.</p>
    <div class="mini-stat"><span class="icon">${icons.check}</span> 127 marka takipte</div>
    <div class="mini-stat"><span class="icon">${icons.warning}</span> 18.420 şikayet kaydı</div>
    ${link('/marka-karsilastirma', 'Markaları karşılaştır', 'secondary-cta')}
  </aside>`;
}

const pages = {
  '/': () => `<section class="hero"><span class="eyebrow">Veriye dayalı güven platformu</span><h1>Güvenmeden önce kontrol et.</h1><p>Markaları; lisans, kullanıcı deneyimi, ödeme hızı, şikayet yoğunluğu ve güven skoruna göre karşılaştır.</p><div class="hero-actions">${link('/marka-karsilastirma', `Marka karşılaştır <span>${icons.chart}</span>`, 'primary-cta')}${link('/misafir-kullanici', 'Misafir olarak incele', 'ghost-cta')}</div><div class="trust-strip"><span class="icon">${icons.shield}</span> Ortalama güven skoru <strong>88/100</strong></div></section>${brandCards()}`,
  '/marka-karsilastirma': () => `<section><h1>Marka Karşılaştırma</h1><p class="lead">Markaları yan yana değerlendir; lisans durumu, ödeme performansı, şikayet yoğunluğu ve güven skorunu tek ekranda gör.</p>${brandCards()}</section>`,
  '/misafir-kullanici': () => `<section><h1>Misafir Kullanıcı</h1><p class="lead">Kayıt olmadan markaları inceleyebilirsin. Ancak şikayet oluşturmak, marka takibi yapmak ve kişisel güven listeni kaydetmek için hesap oluşturman gerekir.</p><div class="split"><div class="card"><h3>Kayıt olmadan</h3><p>Marka profillerini, güven skorlarını ve temel karşılaştırma verilerini görüntüle.</p></div><div class="card"><h3>Hesap açınca</h3><p>Şikayetlerini kaydet, markaları takip et ve kişisel güven listeni güvenle yönet.</p></div></div>${link('/uye-ol', 'Ücretsiz hesap oluştur', 'primary-cta')}</section>`,
  '/sertifikasyon': () => `<section><h1>Sertifikasyon</h1><p class="lead">Güven sertifikasyonu; lisans doğrulaması, operasyon geçmişi, ödeme disiplini ve şikayet çözüm performansı üzerinden değerlendirilir.</p><div class="card"><span class="big-icon">${icons.check}</span><h3>Kurumsal doğrulama</h3><p>Markaların güven sinyalleri düzenli olarak kontrol edilir ve raporlanır.</p></div></section>`,
  '/sikayetler': () => `<section><h1>Şikayetler</h1><p class="lead">Kullanıcı bildirimleri, çözüm süresi ve tekrar eden problem yoğunluğu marka güven skorunun önemli bir parçasıdır.</p><div class="card"><span class="big-icon">${icons.warning}</span><h3>Şikayet takibi</h3><p>Aktif şikayetleri izlemek ve yeni kayıt oluşturmak için hesabına giriş yap.</p></div></section>`,
  '/giris-yap': () => auth('Giriş Yap', 'Daha önce değerlendirdiğin markalara ve şikayet geçmişine eriş.', 'Giriş yap', link('/uye-ol', 'Hesabın yok mu? Üye ol')),
  '/giris': () => auth('Giriş Yap', 'Daha önce değerlendirdiğin markalara ve şikayet geçmişine eriş.', 'Giriş yap', link('/uye-ol', 'Hesabın yok mu? Üye ol')),
  '/uye-ol': () => auth('Üye Ol', 'Hesabını oluştur, markaları takip et, şikayetlerini kaydet ve güven skorlarına göre karar ver.', 'Hesap oluştur', link('/giris-yap', 'Zaten üye misin? Giriş yap')),
};

function auth(title, text, button, footer) {
  return `<section class="auth"><h1>${title}</h1><p class="lead">${text}</p><form class="form"><label>E-posta<input type="email" placeholder="ornek@eposta.com" /></label><label>Şifre<input type="password" placeholder="••••••••" /></label><button type="button" class="primary-cta">${button}</button></form><p class="auth-footer">${footer}</p></section>`;
}

function render() {
  const page = pages[window.location.pathname] || pages['/'];
  document.querySelector('#root').innerHTML = `${header()}<main class="shell"><div class="content">${page()}</div>${aside()}</main>`;
  document.querySelectorAll('[data-route]').forEach((route) => route.addEventListener('click', (event) => {
    event.preventDefault();
    history.pushState({}, '', route.getAttribute('href'));
    render();
  }));
}

window.addEventListener('popstate', render);
render();
