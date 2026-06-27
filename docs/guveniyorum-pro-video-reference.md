# Güveniyorum.com PRO Video Reference

Bu doküman, iPad Pro ekran kayıtlarından çıkarılan gerçek UI akışına göre mevcut Güveniyorum.com projesinin PRO dashboard/trust-platform yönünü sabitler.

## Temel Kabuk

- Sol sabit sidebar: Güveniyorum / Trust Starts marka alanı, ikonlu navigasyon, küçük badge sistemi, alt metrik paneli.
- Üst bar: geniş arama alanı, bildirim/ayar ikonları, giriş ve yeşil ana CTA.
- Ana içerik: koyu lacivert/siyah zemin, yeşil ve mor radial glow, yuvarlatılmış kartlar, ince border, soft shadow.
- Mobil: sidebar drawer, kartlar tek kolon, üst bar sticky.

## Video Akışından Zorunlu Modüller

1. Hero: “Güvenli Bahis Kontrol Sende”, 150+ site, 50K+ kullanıcı, 12K+ çözülen şikayet, %98 güven skoru.
2. En Güvenilir Siteler: site kartları, güven skoru, rozetler, şikayet, kullanıcı, yanıt süresi, min. çekim.
3. Türkiye Bahis Siteleri Ligi: lider tablosu, aktif yarışmalar, performans metrikleri, kara liste.
4. Sorumlu Oyun: zaman kontrolü, bütçe yönetimi, duygusal kontrol, sosyal destek.
5. Oyuncu Psikolojisi: psikoloji tuzakları, test, duygusal durumlar, kontrol araçları, eğitim kaynakları.
6. Wellness Merkezi: program kartları, destek hizmetleri, kaynaklar, topluluk paylaşımları.
7. Topluluk Merkezi: grup, etkinlik, başarı hikayeleri, mentorluk.
8. AI Danışman: Dr. Psikoloji, Güvenlik Uzmanı, Analiz Uzmanı, Kişisel Danışman; chat arayüzü.
9. Sertifikasyon: Temel, Gelişmiş, Premium Güven Sertifikası paketleri.
10. Şikayet: canlı çözüm kartları, istatistikler, şikayet formu, kategori grid.
11. Marketing Marketplace: Meta, Push, E-mail, Telegram, Influencer, SEO paketleri.
12. Marka Yönetimi: dashboard, incelemeler, şikayetler, analitik, ayarlar.
13. Yarışma/Katkı Sistemi: haftalık yarışmalar, XP, ödül/çark, lider kullanıcılar.
14. Kara Liste: hukuki risk taşımayan uyarı dili; yüksek risk, çok sayıda şikayet, çözüm oranı düşük, inceleme altında.

## WordPress Üzerinde İlk Uygulama

İlk PRO referans sayfası WordPress üzerinde oluşturuldu:

- Sayfa: `Güveniyorum PRO Video Referans`
- Slug: `/pro-video-referans/`
- Durum: publish

Bu sayfa, ana sayfayı bozmadan video referansındaki layout ve ana modülleri tek ekranda test etmek için kullanılır. Onay sonrası aynı yapı mevcut ana sayfa ve ilgili route şablonlarına parçalı olarak taşınmalıdır.

## Sonraki Kodlama Sırası

1. Draft theme içinde `pro-dashboard` component katmanı ayrıştırılacak.
2. Global CSS değişkenleri tema geneline taşınacak.
3. Hero, site kartı, stat card, tab, badge, risk card, AI chat, complaint form bileşenleri parçalanacak.
4. Front page, site league, complaint, psychology, wellness, AI, certification ve brand templates ayrı dosyalara uygulanacak.
5. Dinamik veri için mevcut `guveniyorum-platform-core-v2`, `guveniyorum-platform-admin-v3` ve gamification eklentileriyle bağlantı kurulacak.
6. QA sonrası kullanıcı onayıyla live theme publish adımına geçilecek.
