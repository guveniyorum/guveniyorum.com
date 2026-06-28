import { topbar } from './product-app.js';
import { readAuthSession, writeAuthSession, signOutAuth } from './platform-store.js';

const sidebarItems = [
  ['/', 'Ana Sayfa'],
  ['/marka-ligi', 'Marka Ligi'],
  ['/kullanici-yarismasi', 'Kullanıcı Yarışması'],
  ['/guven-merkezi', 'Güven Merkezi'],
  ['/sorumlu-kullanim', 'Sorumlu Kullanım'],
  ['/kullanici-psikolojisi', 'Kullanıcı Psikolojisi'],
  ['/wellness-merkezi', 'Wellness Merkezi'],
  ['/topluluk-merkezi', 'Topluluk Merkezi'],
  ['/ai-danisman', 'AI Danışman'],
  ['/sertifikasyon', 'Sertifikasyon'],
  ['/farkindalik-programlari', 'Farkındalık Programları'],
  ['/sohbet', 'Sohbet'],
  ['/sikayetler', 'Şikayetler'],
  ['/seffaflik-marketplace', 'Şeffaflık Marketplace'],
  ['/sertifika-basvurusu', 'Sertifika Başvurusu'],
  ['/marka-yonetimi', 'Marka Yönetimi'],
  ['/yardim', 'Yardım'],
  ['/giris-yap', 'Giriş Yap'],
  ['/uye-ol', 'Üye Ol'],
];

const aliases = {
  '/site-ligi': '/marka-ligi',
  '/marka-karsilastirma': '/marka-ligi',
  '/sorumlu-oyun': '/sorumlu-kullanim',
  '/oyuncu-psikolojisi': '/kullanici-psikolojisi',
  '/kampanyalar': '/farkindalik-programlari',
  '/marketing-marketplace': '/seffaflik-marketplace',
  '/giris': '/giris-yap',
};

const brands = [
  { name: 'GüvenBet', domain: 'guvenbet.com', year: '2020', label: 'Temel Güven', score: 88, rating: '4.3', reviews: '567', users: '76K', complaints: 18, response: '5 dk', min: '50₺', tags: ['Güvenli Altyapı', 'Hızlı KYC', 'Bonus Çeşitliliği', 'Mobil Uyum'], pros: ['Güvenli ödeme sistemi', 'Hızlı hesap doğrulama', 'Çeşitli bonus seçenekleri'], risks: [] },
  { name: 'BetSafe', domain: 'betsafe.example', year: '2018', label: 'Premium Güven', score: 98, rating: '4.8', reviews: '2.1K', users: '125K', complaints: 7, response: '2 dk', min: '100₺', tags: ['Efsanevi', 'Lisanslı', 'Hızlı Destek', 'VIP Program'], pros: ['Çok hızlı ödeme', 'Güçlü kullanıcı memnuniyeti', '7/24 canlı destek'], risks: [] },
  { name: 'RiskPlay', domain: 'riskplay.example', year: '2024', label: 'İncelemede', score: 62, rating: '3.1', reviews: '91', users: '12K', complaints: 44, response: '18 dk', min: '250₺', tags: ['Yeni Site', 'Casino', 'Yüksek Bonus'], pros: ['Geniş oyun kataloğu'], risks: ['Yavaş müşteri hizmetleri', 'KYC zorunlu değil', 'Yüksek çevrim şartları', 'Mobil uygulama yok', 'Ödeme süreçleri gecikiyor'] },
];

const contributors = [
  ['BahisGuru', 'Bahis Analizi', 'Level 42', '18.400 XP', ['Uzman', 'Güvenilir'], '128 İnceleme', '74 Çözüm', '912 Faydalı oy'],
  ['CasinoExpert', 'Casino Specialist', 'Level 39', '16.900 XP', ['Casino Specialist', 'Popüler'], '116 İnceleme', '61 Çözüm', '803 Faydalı oy'],
  ['GüvenliOyuncu', 'Güvenlik Uzmanı', 'Level 35', '14.200 XP', ['Yardımsever', 'Şikayet Çözücü'], '92 İnceleme', '88 Çözüm', '701 Faydalı oy'],
];

let state = {
  activeAi: 'Dr. Psikoloji',
  aiMessages: ['Merhaba, güvenli kararlar için buradayım. Sorunu yaz veya hızlı sorulardan birini seç.'],
  complaints: [
    { id: 'GVN-2026-0000', brand: 'GüvenBet', title: 'Ödeme gecikmesi bildirimi', status: 'Marka Yanıtı Bekleniyor' },
  ],
};

function normalizePath(pathname) {
  const cleanPath = pathname !== '/' && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  return aliases[cleanPath] || cleanPath;
}

function navigate(path) {
  history.pushState({}, '', path);
  render();
}

function routeLink(path, label, className = '') {
  return `<a href="${path}" class="${className}" data-route>${label}</a>`;
}

function button(label, action, extra = '') {
  return `<button type="button" class="btn ${extra}" data-action="${action}" data-label="${label}">${label}</button>`;
}

function chips(items) {
  return `<div class="chips">${items.map((item) => `<span>${item}</span>`).join('')}</div>`;
}

function stats(items) {
  return `<div class="stats-grid">${items.map(([value, label]) => `<article class="stat-card"><strong>${value}</strong><span>${label}</span></article>`).join('')}</div>`;
}

function pageHeader(title, subtitle) {
  return `<section class="page-header"><p>Güveniyorum · Kontrol Sende</p><h1>${title}</h1><span>${subtitle}</span></section>`;
}

function tabs(items) {
  return `<div class="tabs">${items.map((item, index) => `<button type="button" class="${index === 0 ? 'active' : ''}" data-action="demo" data-label="${item}">${item}</button>`).join('')}</div>`;
}

function brandCards() {
  return `<div class="brand-grid">${brands.map((brand) => `<article class="brand-card ${brand.risks.length ? 'has-risk' : ''}">
    <div class="brand-top"><div><h3>${brand.name}</h3><p>${brand.domain} · ${brand.year} yılından beri</p><b>${brand.label}</b></div><div class="score-ring"><strong>${brand.score}</strong><span>Güven</span></div></div>
    <div class="brand-metrics"><span>★ ${brand.rating} — ${brand.reviews} değerlendirme</span><span>${brand.users} Kullanıcı</span><span>${brand.complaints} Şikayet</span><span>${brand.response} Yanıt Süresi</span><span>${brand.min} Min. Yatırım</span></div>
    ${chips(brand.tags)}
    <h4>Avantajlar</h4><ul>${brand.pros.map((item) => `<li>${item}</li>`).join('')}</ul>
    ${brand.risks.length ? `<div class="risk-panel"><strong>DİKKAT!</strong>${brand.risks.map((risk) => `<span>${risk}</span>`).join('')}</div>` : ''}
    <div class="card-actions">${button('Detayları Gör', 'demo')}${button('Risk Raporunu Aç', 'demo', 'ghost')}</div>
  </article>`).join('')}</div>`;
}

function homePage() {
  return `<section class="hero">
    <div class="hero-copy"><p>Türkiye’nin #1 Şikayet ve Marka Güvenliği Platformu</p><h1>Güvenli Karar <span>Kontrol Sende</span></h1><small>Yapay zeka destekli güvenlik analizi ile markaları değerlendir, toplulukla deneyim paylaş ve güvenli kararlar al.</small><div class="hero-actions">${routeLink('/marka-ligi', 'Marka Skorlarını İncele', 'btn primary')}${routeLink('/sikayetler', 'Şikayet Oluştur', 'btn ghost')}</div></div>
    <aside class="hero-orb"><strong>%98</strong><span>Güven Skoru</span><small>Kontrol Sende</small></aside>
  </section>
  ${stats([['150+', 'Güvenilir Marka'], ['50K+', 'Aktif Kullanıcı'], ['12K+', 'Çözülen Şikayet'], ['%98', 'Güven Skoru']])}
  ${section('En Güvenilir Markalar', 'Markaları güven skoru, şikayet yoğunluğu, yanıt hızı ve topluluk puanı ile karşılaştır.', brandCards())}
  ${leaguePage(true)}${contributorsPage(true)}${trustPage(true)}`;
}

function section(title, subtitle, body) {
  return `<section class="panel"><div class="section-title"><div><h2>${title}</h2><p>${subtitle}</p></div></div>${body}</section>`;
}

function leaguePage(compact = false) {
  const body = `${tabs(['Liderlik Tablosu', 'Aktif Yarışmalar', 'Performans Metrikleri', 'Kara Liste'])}${chips(['Tüm Seviyeler', 'Efsanevi', 'Epik', 'Nadir', 'Yaygın'])}<div class="cards-grid">${brands.map((brand, index) => `<article class="mini-card"><h3>${brand.name}</h3><p>${index === 2 ? 'Casino Siteleri' : 'Bahis & Casino'}</p>${chips(index === 0 ? ['Epik', 'Temel Güven'] : index === 1 ? ['Efsanevi', 'Güven Lideri'] : ['Riskli', 'İncelemede'])}<div class="metric-list"><b>Lig Puanı: ${brand.score}</b><span>Güven Skoru: ${brand.score}%</span><span>Kullanıcı Puanı: ${brand.rating}/5</span><span>Kullanıcı Sayısı: ${brand.users}</span><em>${index === 2 ? '-4 sıra' : '+8 sıra'}</em></div>${button('Detayı Aç', 'demo')}</article>`).join('')}</div>`;
  return compact ? section('Türkiye Marka Güvenliği Ligi', 'Güvenlik, kullanıcı memnuniyeti ve hizmet kalitesine göre markalar arası rekabet.', body) : pageHeader('Türkiye Marka Güvenliği Ligi', 'Güvenlik, kullanıcı memnuniyeti ve hizmet kalitesine göre markalar arası rekabet.') + body;
}

function contributorsPage(compact = false) {
  const body = `<div class="cards-grid">${contributors.map((user) => `<article class="mini-card"><h3>${user[0]}</h3><p>${user[1]} · ${user[2]} · ${user[3]}</p>${chips(user[4])}<div class="metric-list"><span>${user[5]}</span><span>${user[6]}</span><span>${user[7]}</span></div>${button('Profili Aç', 'demo')}</article>`).join('')}</div>`;
  return compact ? section('En Aktif Katkı Sağlayanlar', 'Topluluk için en çok katkı sağlayan, güvenilir ve deneyimli üyelerimiz.', body) : pageHeader('En Aktif Katkı Sağlayanlar', 'Topluluk için en çok katkı sağlayan, güvenilir ve deneyimli üyelerimiz.') + body;
}

function trustPage(compact = false) {
  const body = `${tabs(['Genel Bakış', 'Doğrulama Seviyeleri', 'Güvenlik Özellikleri', 'Şeffaflık Raporu'])}${stats([['98.5%', 'Platform Güvenlik Skoru'], ['96.8%', 'Topluluk Güven Oranı'], ['94.2%', 'Şeffaflık Puanı'], ['97.1%', 'Yanıt Hızı Skoru']])}<div class="status-panel"><b>Platform Durumu</b><span>99.9% Uptime</span><span>2.3s Ortalama Yanıt</span><span>0 Güvenlik İhlali</span><strong>Tüm Sistemler Çalışıyor</strong></div>`;
  return compact ? section('Güvenlik ve Şeffaflık', 'Platform güvenliğimiz, kullanıcı doğrulama sistemimiz ve şeffaflık politikalarımız.', body) : pageHeader('Güvenlik ve Şeffaflık', 'Platform güvenliğimiz, kullanıcı doğrulama sistemimiz ve şeffaflık politikalarımız.') + body;
}

function responsiblePage() {
  return pageHeader('Güvenli ve Sorumlu Kullanım', 'Deneyiminizi kontrol altında tutun, sağlıklı sınırlar belirleyin ve gerektiğinde yardım alın.') + tabs(['Genel Bakış', 'Kendini Değerlendir', 'Kontrol Araçları', 'Yardım Al']) + `<div class="cards-grid">${['Zaman Kontrolü', 'Bütçe Yönetimi', 'Duygusal Kontrol', 'Sosyal Destek'].map((item) => `<article class="mini-card"><h3>${item}</h3><p>Kontrollü kullanım için premium rehber ve takip araçları.</p>${button('Aracı Aç', 'demo')}</article>`).join('')}</div>` + section('Uyarı İşaretleri', 'Riskli davranışları erken fark edin.', `<ul class="warning-list">${['Kayıpları geri kazanmak için daha fazla oynamak', 'Harcamaları gizlemek', 'Zaman kontrolünü kaybetmek', 'Sosyal ilişkileri ihmal etmek', 'Borç alarak oynamak', 'Oynamadığında huzursuzluk hissetmek'].map((item) => `<li>${item}</li>`).join('')}</ul>`);
}

function psychologyPage() {
  return pageHeader('Kullanıcı Psikolojisi', 'Oyun alışkanlıklarınızın psikolojik boyutlarını değerlendirin ve sağlıklı davranışlar geliştirin.') + tabs(['Psikolojik Tuzaklar', 'Psikolojik Test', 'Duygusal Durumlar', 'Kontrol Araçları']) + stats([['15', 'Soru'], ['5-8 dk', 'Süre'], ['%100', 'Anonim'], ['Anında', 'Sonuç']]) + `<section class="panel test-panel"><h2>Soru 1/15</h2><p>Günde ortalama ne kadar süre bahis ile ilgili aktivitelerle geçirirsiniz?</p>${['30 dakikadan az', '30 dakika - 2 saat arası', '2-5 saat arası', '5 saatten fazla'].map((item) => `<label class="radio-card"><input type="radio" name="psycho"> <span>${item}</span></label>`).join('')}<div class="card-actions">${button('Teste Başla', 'test')}${button('Uzman Desteği Al', 'demo', 'ghost')}</div></section>`;
}

function wellnessPage() {
  return pageHeader('Wellness Merkezi', 'Sağlıklı alışkanlıklar geliştirin, uzman desteği alın ve toplulukla birlikte iyileşin.') + stats([['1,247', 'Aktif Program Katılımcısı'], ['89', 'Tamamlanan Program'], ['4.8/5', 'Memnuniyet'], ['24', 'Uzman Danışman']]) + `<div class="cards-grid">${['Mindful Gaming Program', 'Healthy Limits Workshop', 'Online Terapi Seansları', 'Grup Terapisi'].map((item) => `<article class="mini-card"><h3>${item}</h3><p>Premium destek akışı, ilerleme takibi ve uzman eşleşmesi.</p>${button('Programa Katıl', 'demo')}</article>`).join('')}</div><section class="emergency-panel"><h2>Acil Durum Desteği</h2><p>Kendinize zarar verme düşünceleriniz varsa hemen yardım alın. 7/24 kriz hattımız sizin için burada.</p><strong>0850 123 45 67</strong>${button('Canlı Destek', 'demo')}</section>`;
}

function communityPage() {
  return pageHeader('Topluluk Merkezi', 'Güvenli bir ortamda deneyimlerinizi paylaşın, destek alın ve başkalarına ilham verin.') + stats([['50,247', 'Toplam Üye'], ['1,247', 'Aktif Tartışma'], ['8,934', 'Paylaşılan Deneyim'], ['15,678', 'Verilen Destek']]) + `<div class="cards-grid">${['Destek ve Yardım', 'İyileşme Hikayeleri', 'İpuçları ve Stratejiler', 'Genel Sohbet'].map((item) => `<article class="mini-card"><h3>${item}</h3><p>Moderasyonlu topluluk alanı ve güvenli paylaşım deneyimi.</p>${button('Kategoriye Git', 'demo')}</article>`).join('')}</div>`;
}

function aiPage() {
  const experts = ['Dr. Psikoloji', 'Güvenlik Uzmanı', 'Analiz Uzmanı', 'Kişisel Danışman'];
  return pageHeader('AI Danışman', 'Kişiselleştirilmiş AI danışmanlarından güvenlik, psikoloji ve strateji konularında destek alın.') + `<section class="ai-shell"><aside>${experts.map((expert) => `<button type="button" class="expert ${state.activeAi === expert ? 'active' : ''}" data-action="aiExpert" data-label="${expert}">${expert}<span>%98 güven</span></button>`).join('')}</aside><div class="chat-panel"><div id="chatMessages">${state.aiMessages.map((message, index) => `<p class="${index % 2 ? 'user-msg' : 'ai-msg'}">${message}</p>`).join('')}</div><form data-action="aiSend" class="chat-form"><input name="message" placeholder="Mesajınızı yazın..."><button type="submit" class="btn primary">Gönder</button></form></div><div class="quick-questions">${['Bu site güvenli mi?', 'Sağlıklı limitler nedir?', 'Kayıp kovalama nasıl önlenir?', 'Bonus şartları nasıl değerlendirilir?'].map((q) => `<button type="button" data-action="quickQuestion" data-label="${q}">${q}</button>`).join('')}</div></section>`;
}

function complaintsPage() {
  return pageHeader('Şikayetler', 'Şikayet oluştur, akışı takip et, marka yanıtlarını ve çözüm durumunu gör.') + `<section class="panel"><div class="section-title"><div><h2>Şikayet Akışı</h2><p>Dosyalar, marka yanıtları ve moderasyon durumları tek ekranda.</p></div>${button('Şikayet Oluştur', 'scrollComplaint')}</div><div class="filters">${['Tümü', 'Yeni', 'Moderasyon İncelemesinde', 'Çözüldü', 'Riskli'].map((filter) => `<button type="button" data-action="demo" data-label="${filter} filtresi">${filter}</button>`).join('')}</div><div id="complaintList" class="complaint-list">${state.complaints.map((item) => complaintItem(item)).join('')}</div></section><section id="complaintFormPanel" class="panel complaint-form-panel"><h2>Şikayet Formu</h2><form id="complaintForm" class="complaint-form" data-action="complaintSubmit">${['Site / Marka adı', 'Domain', 'Şikayet konusu', 'Şikayet başlığı', 'Olay tarihi', 'İşlem tutarı', 'Ödeme yöntemi', 'Açıklama', 'Kanıt yükle', 'Talep edilen çözüm', 'Gizlilik tercihi', 'Yayın onayı'].map((field) => `<label>${field}<input name="${field}" placeholder="${field}"></label>`).join('')}<button type="submit" class="btn primary">Gönder</button></form></section>`;
}

function complaintItem(item) {
  return `<article class="complaint-item"><div><b>${item.id}</b><h3>${item.title}</h3><p>${item.brand} · ${item.status}</p></div>${button('Detayı Aç', 'complaintDetail', 'ghost')}</article>`;
}

function marketplacePage() {
  return pageHeader('Şeffaflık Marketplace', 'Markanız için güven, şeffaflık ve pazarlama hizmetlerini tek yerden yönetin.') + tabs(['Hizmetler', 'Sağlayıcılar', 'Siparişlerim', 'Satıcı Ol']) + `<div class="cards-grid">${['Meta Reklam Yönetimi', 'Push Notification Sistemi', 'E-mail Marketing Paketi', 'SEO & İçerik Optimizasyonu'].map((item) => `<article class="mini-card"><h3>${item}</h3><p>Doğrulanmış sağlayıcı, hızlı teslim ve şeffaf raporlama.</p>${button('Sipariş Ver', 'demo')}</article>`).join('')}</div>`;
}

function certificatePage() {
  return pageHeader('Sertifika Başvurusu', 'Guveniyorum.com güven sertifikası ile kullanıcılarınıza güvenilirliğinizi kanıtlayın.') + tabs(['Sertifika Seviyeleri', 'Başvuru Yap', 'Sertifikalı Siteler', 'Süreç']) + `<div class="cards-grid">${['Temel Güven Sertifikası — ₺2,500/yıl', 'Gelişmiş Güven Sertifikası — ₺7,500/yıl', 'Premium Güven Sertifikası — ₺15,000/yıl'].map((item) => `<article class="mini-card"><h3>${item}</h3><p>SSL, lisans, ödeme güvenliği ve şeffaf denetim gereksinimleri.</p>${button('Başvuru Yap', 'demo')}</article>`).join('')}</div>`;
}

function brandManagementPage() {
  return pageHeader('Marka Yönetimi', 'Markanızın güvenilirliğini artırın, müşteri geri bildirimlerini yönetin ve itibarınızı koruyun.') + tabs(['Dashboard', 'İncelemeler', 'Şikayetler', 'Analitik', 'Ayarlar']) + `<section class="panel form-panel"><label>Marka Adı<input value="GüvenBet"></label><label>Marka Açıklaması<textarea>Güvenilir karar deneyimi sunan marka profili.</textarea></label><label>İletişim E-postası<input value="iletisim@guvenbet.com"></label><label>Telefon<input value="0850 000 00 00"></label><div class="card-actions">${button('İptal', 'demo', 'ghost')}${button('Değişiklikleri Kaydet', 'demo')}</div></section>`;
}

function simplePage(title, subtitle, items) {
  return pageHeader(title, subtitle) + `<div class="cards-grid">${items.map((item) => `<article class="mini-card"><h3>${item}</h3><p>Premium dashboard deneyimi içinde demo state ve detay paneli hazır.</p>${button('Detayı Aç', 'demo')}</article>`).join('')}</div>`;
}

function authPage(type) {
  const isRegister = type === 'Üye Ol';
  return pageHeader(type, isRegister ? 'Hesabını oluştur, markaları takip et ve güven skorlarına göre karar ver.' : 'Değerlendirdiğin markalara ve şikayet geçmişine eriş.') + `<section class="panel form-panel auth-panel"><form data-action="authSubmit" class="auth-form"><label>Ad Soyad<input name="displayName" placeholder="Yeni Üye"></label><label>E-posta<input name="email" type="email" placeholder="ornek@eposta.com" required></label><label>Şifre<input name="password" type="password" placeholder="••••••••"></label><button type="submit" class="btn primary">${type}</button></form><div class="card-actions">${button('Google ile Devam Et', 'oauthLogin', 'ghost')}${button('Profil Özeti', 'profileSummary', 'ghost')}</div></section>`;
}

const pages = {
  '/': homePage,
  '/marka-ligi': () => pageHeader('Marka Ligi', 'Marka skorlarını incele, risk raporlarını aç ve güvenli karar ver.') + brandCards() + leaguePage(true),
  '/kullanici-yarismasi': contributorsPage,
  '/guven-merkezi': trustPage,
  '/sorumlu-kullanim': responsiblePage,
  '/kullanici-psikolojisi': psychologyPage,
  '/wellness-merkezi': wellnessPage,
  '/topluluk-merkezi': communityPage,
  '/ai-danisman': aiPage,
  '/sertifikasyon': certificatePage,
  '/farkindalik-programlari': () => simplePage('Farkındalık Programları', 'Katılın, gelişin ve güvenli kullanım alışkanlıkları kazanın.', ['Haftalık Güven Programı', 'Yılbaşı Farkındalık Kampanyası', 'Topluluk Görevleri', 'Liderlik Panosu']),
  '/sohbet': () => simplePage('Sohbet', 'Topluluk ve marka temsilcileriyle güvenli iletişim kurun.', ['Genel Sohbet', 'Marka Destek Odası', 'Moderasyon Kanalı']),
  '/sikayetler': complaintsPage,
  '/seffaflik-marketplace': marketplacePage,
  '/sertifika-basvurusu': certificatePage,
  '/marka-yonetimi': brandManagementPage,
  '/yardim': () => simplePage('Yardım', 'Platform rehberi, sık sorulan sorular ve destek merkezi.', ['Başlangıç Rehberi', 'Güven Skoru Nasıl Çalışır?', 'Destek Talebi']),
  '/giris-yap': () => authPage('Giriş Yap'),
  '/uye-ol': () => authPage('Üye Ol'),
};

function sidebar(currentPath) {
  return `<aside class="sidebar"><div class="brand"><strong>Güveniyorum</strong><span>Kontrol Sende</span></div><nav>${sidebarItems.map(([path, label]) => routeLink(path, label, normalizePath(currentPath) === path ? 'active' : '')).join('')}</nav><div class="sidebar-stats"><span>Online Kullanıcı <b>1,247</b></span><span>Aktif Yarışma <b>3</b></span><span>Günlük Ödül <b>₺2,500</b></span><span>Güven Skoru <b>%98.5</b></span></div></aside>`;
}

function modal(title, text) {
  return `<div class="modal-backdrop"><section class="modal"><button type="button" class="modal-close" data-action="closeModal">×</button><h2>${title}</h2><p>${text}</p><button type="button" class="btn primary" data-action="closeModal">Tamam</button></section></div>`;
}

function render() {
  const currentPath = normalizePath(window.location.pathname);
  const page = pages[currentPath] || pages['/'];
  document.querySelector('#root').innerHTML = `${sidebar(currentPath)}<main class="app-shell">${topbar(routeLink)}<div class="content-wrap">${page()}</div></main><button type="button" class="live-support" data-action="demo" data-label="Canlı Destek">Canlı Destek</button><div id="modalRoot"></div>`;
}

function showModal(title, text = 'Bu aksiyon demo state olarak çalışıyor; kullanıcı akışı boş bırakılmadı.') {
  document.querySelector('#modalRoot').innerHTML = modal(title, text);
}

function handleAction(action, label, target) {
  if (action === 'closeModal') return document.querySelector('#modalRoot').innerHTML = '';
  if (action === 'toggleMenu') return document.body.classList.toggle('sidebar-open');
  if (action === 'scrollComplaint') return document.querySelector('#complaintFormPanel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  if (action === 'complaintDetail') return showModal('Şikayet Detayı', 'Marka yanıtı, çözüm durumu, topluluk yorumu, kanıt seviyesi ve platform değerlendirmesi açıldı.');
  if (action === 'test') return showModal('Psikolojik Test Başladı', 'Soru 1/15 kayıt altına alındı. Test sonunda güçlü yönler, dikkat edilmesi gerekenler ve kişisel öneriler gösterilecek.');
  if (action === 'aiExpert') { state.activeAi = label; render(); return showModal(label, `${label} seçildi. Yeni yanıtlar bu uzman profiliyle üretilecek.`); }
  if (action === 'quickQuestion') return showModal(label, `${state.activeAi} hızlı sorunu analiz etti ve güvenli karar önerisi hazırladı.`);
  if (action === 'profileSummary') {
    const session = readAuthSession();
    if (!session) return showModal('Misafir Kullanıcı', 'Profil özetini görmek için giriş yapmalısın.');
    return showModal('Profil Özeti', `${session.displayName || session.email} · ${session.level || 'Yeni Üye'} · ₺${session.wallet || 0} · ${session.xp || 0} XP`);
  }
  if (action === 'signOut') {
    signOutAuth(window.supabaseClient || window.supabase);
    render();
    return showModal('Çıkış Yapıldı', 'Oturum kapatıldı. Giriş Yap ve Üye Ol butonları yeniden gösteriliyor.');
  }
  if (action === 'oauthLogin') {
    writeAuthSession({ email: 'oauth@guveniyorum.com', displayName: 'OAuth Kullanıcısı', provider: 'oauth' });
    render();
    return showModal('OAuth Girişi Başarılı', 'Demo OAuth oturumu oluşturuldu.');
  }
  if (action === 'demo') return showModal(label || 'Detay', 'Detay paneli açıldı. Bu buton route, modal veya demo state üreterek boş kalmıyor.');
}

function handleSubmit(action, form) {
  if (action === 'complaintSubmit') {
    state.complaints.unshift({ id: 'GVN-2026-0001', brand: form.elements['Site / Marka adı']?.value || 'Demo Marka', title: form.elements['Şikayet başlığı']?.value || 'Yeni şikayet dosyası', status: 'Moderasyon incelemesinde' });
    render();
    showModal('Şikayet dosyan oluşturuldu', 'Dosya No: GVN-2026-0001 · Durum: Moderasyon incelemesinde');
  }
  if (action === 'aiSend') {
    const message = form.elements.message.value.trim();
    if (!message) return;
    state.aiMessages.push(message, `${state.activeAi}: Mesajını aldım. Güven skoru, risk sinyalleri ve sorumlu kullanım açısından değerlendirme hazırladım.`);
    render();
  }
  if (action === 'authSubmit') {
    const email = form.elements.email.value.trim();
    const displayName = form.elements.displayName.value.trim() || email;
    if (!email) return;
    writeAuthSession({ email, displayName, provider: 'email' });
    navigate('/');
    showModal('Giriş Başarılı', 'Oturum açıldı. Üst barda kullanıcı rozeti, cüzdan/XP bilgisi ve Çıkış butonu gösteriliyor.');
  }
}

window.addEventListener('guveniyorum-auth-change', () => render());
window.addEventListener('storage', (event) => {
  if (event.key === 'guveniyorum-auth-session-v1') render();
});

document.addEventListener('click', (event) => {
  const route = event.target.closest('[data-route]');
  if (route) { event.preventDefault(); navigate(route.getAttribute('href')); return; }
  const actionTarget = event.target.closest('[data-action]');
  if (actionTarget && actionTarget.tagName !== 'FORM') handleAction(actionTarget.dataset.action, actionTarget.dataset.label || actionTarget.textContent.trim(), actionTarget);
});

document.addEventListener('submit', (event) => {
  const form = event.target.closest('form[data-action]');
  if (!form) return;
  event.preventDefault();
  handleSubmit(form.dataset.action, form);
});

window.addEventListener('popstate', render);
render();
