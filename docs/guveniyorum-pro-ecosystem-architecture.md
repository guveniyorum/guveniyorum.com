# Güveniyorum.com PRO Ekosistem Mimarisi

Bu belge, video referansındaki görsel yapıyı gerçek ürün ekosistemine dönüştürmek için kullanılacak ana mimariyi tanımlar.

## Amaç

Güveniyorum.com; yalnızca bahis sitesi listeleyen bir yapı değil, kullanıcı güvenliği, şikayet çözümü, firma rekabeti, topluluk etkileşimi, puanlama, sertifikasyon, sorumlu oyun ve AI destekli rehberlik içeren premium trust-platform olmalıdır.

## Ana Ürün Döngüsü

1. Kullanıcı site arar.
2. Site güven skoru, kullanıcı puanı, şikayet geçmişi ve çözüm oranı görüntülenir.
3. Kullanıcı yorum, değerlendirme veya şikayet oluşturur.
4. Topluluk faydalı oy, doğrulama ve yorum desteği verir.
5. Firma panelden yanıt verir ve çözüm üretir.
6. Çözüm performansı marka güven skoruna ve lig sıralamasına yansır.
7. Kullanıcı katkı puanı, seviye, rozet ve ödül kazanır.
8. Riskli davranış veya psikolojik uyarı durumunda sorumlu oyun ve psikoloji modülleri devreye girer.

## Çekirdek Modüller

### 1. Site Güven Skoru

Skor sadece ortalama puan değildir. Ağırlıklı model:

- Şikayet çözüm performansı: %30
- Kullanıcı değerlendirmeleri: %25
- Operasyon kalitesi: %25
- Şeffaflık ve doğrulama: %20

### 2. Şikayet Sistemi

Alanlar:

- Şikayet edilen site
- Kategori
- Başlık
- Açıklama
- Kanıt dosyası
- Kullanıcı gizlilik seçeneği
- Durum
- Öncelik
- Firma yanıtı
- Kullanıcı çözüm onayı

Durum akışı:

- Taslak
- İncelemede
- Firmaya iletildi
- Yanıtlandı
- Çözüm bekleniyor
- Çözüldü
- Reddedildi / Kanıt yetersiz

### 3. Firma Rekabeti

Firmalar ligde şu kriterlere göre sıralanır:

- Güven skoru
- Çözüm oranı
- Ortalama yanıt süresi
- Kullanıcı memnuniyeti
- Sertifika durumu
- Trend değişimi

### 4. Kullanıcı Etkileşim Ağı

Kullanıcılar içeride şunları yapar:

- Yorum yazar
- Şikayet oluşturur
- Faydalı oy verir
- Başarı hikayesi paylaşır
- Forum başlığı açar
- Diğer kullanıcılara destek verir
- Rozet ve XP kazanır
- Liderlik tablosunda görünür

### 5. Sorumlu Oyun

Alt modüller:

- Zaman kontrolü
- Bütçe yönetimi
- Kayıp kovalamayı fark etme
- Duygusal kontrol
- Kendini değerlendirme testi
- Destek kaynakları

### 6. Oyuncu Psikolojisi

Kartlar:

- Kayıp Kovalama Psikolojisi
- Kazanma Yanılgısı
- Kontrol İllüzyonu
- Sunk Cost Yanılgısı
- Aşırı Güven Yanılgısı

Test sonucu:

- Risk yüzdesi
- Risk seviyesi
- Kayıp kovalama skoru
- Duygusal kontrol skoru
- Bütçe disiplini skoru
- Risk farkındalığı skoru

### 7. AI Danışman

AI persona seti:

- Dr. Psikoloji
- Güvenlik Uzmanı
- Analiz Uzmanı
- Kişisel Danışman

Not: Tıbbi teşhis dili kullanılmaz. AI, farkındalık ve yönlendirme asistanı olarak konumlanır.

### 8. Sertifikasyon

Paketler:

- Temel Güven Sertifikası
- Gelişmiş Güven Sertifikası
- Premium Güven Sertifikası

Sertifika, firmanın güvenilirlik iddiasını görsel rozete dönüştürür ve B2B gelir modelinin merkezidir.

### 9. Kara Liste / Risk Uyarı Merkezi

Kesin suçlayıcı ifade kullanılmaz. Kullanılacak ifadeler:

- Yüksek Risk
- Çok Sayıda Şikayet
- Çözüm Oranı Düşük
- İnceleme Altında
- Kullanıcı Uyarısı

## Mevcut WordPress Uygulaması

İlk interaktif PRO ekosistem prototipi WordPress üzerinde güncellendi:

- Sayfa: Güveniyorum PRO Ekosistem
- Slug: /pro-video-referans/
- Durum: publish

Bu sürümde scroll, sidebar linkleri, arama, filtreleme, şikayet kategori seçimi, test sonucu ve AI mock chat etkileşimleri çalışacak şekilde düzenlenmiştir.

## Sonraki Entegrasyon Sırası

1. Bu prototipin CSS sistemi `theme.css` ve `app-dashboard.css` içine parçalara ayrılacak.
2. Sidebar ve topbar ortak template parçası haline getirilecek.
3. Site kartı, stat card, badge, tab, risk card, complaint form, AI chat componentleri ayrıştırılacak.
4. Mevcut şablonlara taşınacak:
   - front-page.php
   - page-site-league.php
   - page-sikayet-et.php
   - page-puan-merkezi.php
   - page-profil.php
5. Dinamik veriler mevcut pluginlere bağlanacak:
   - guveniyorum-platform-core-v2
   - guveniyorum-platform-admin-v3
   - guveniyorum-gamification-core
   - ai-engine / vibe-ai
6. QA sonrası canlı tema yayını yapılacak.
