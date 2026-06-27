# Güveniyorum.com Diamond Ekosistem V2

Bu sürümün amacı mevcut görsel dili bozmadan sistemi bir ürün motoruna dönüştürmektir. Tasarım yönü korunacak; üzerine çalışan puan, ödül, şikayet, firma rekabeti, kara liste ve sorumlu oyun katmanları eklenecektir.

## Ana vizyon

Güveniyorum.com statik bir site listesi değildir. Üye davranışını, firma performansını ve topluluk verisini sürekli işleyen canlı bir güven ekosistemidir.

Temel döngü:

1. Kullanıcı üye olur.
2. Site inceler, yorum yapar, değerlendirme bırakır veya şikayet oluşturur.
3. Her değerli aksiyon puana, rozete ve seviye ilerlemesine dönüşür.
4. Yönetici veya sponsor marka kullanıcıya kampanya bakiyesi, ödül veya promosyon tanımlar.
5. Firma iyi hizmet verirse güven skoru, görünürlük ve lig sıralaması yükselir.
6. Firma kötü hizmet verirse kullanıcı deneyimi düşer, şikayet yoğunluğu görünür olur ve kara liste / risk alanında baskı oluşur.
7. Sorumlu oyun ve psikoloji katmanı kullanıcıyı yalnızca yönlendiren değil koruyan bir yapı sağlar.

## Puan ve ödül sistemi

Üye aksiyonları:

- Doğrulanmış yorum: +15 puan
- Kanıtlı şikayet: +40 puan
- Çözüm onayı: +75 puan
- Faydalı oy: +5 puan
- Başarı hikayesi: +60 puan
- Mentor cevabı: +30 puan

Puanlar şu alanlarda görünür:

- Üye cüzdanı
- Profil seviyesi
- Liderlik tablosu
- Topluluk katkı skoru
- Ödül uygunluğu

Ödül modeli:

- Sponsor site havuzu
- Yönetici kontrollü ödül dağıtımı
- Kampanya bakiyesi
- Sadakat bonusu
- Rozet bazlı özel haklar

Önemli: Bu yapı manuel veya otomatik kural motoruyla çalışabilir. İlk MVP için manuel admin onayı, ikinci faz için otomatik kural motoru önerilir.

## Firma rekabet sistemi

Firmalar yalnızca listelenmez. Her marka bir arenada yarışır.

Skor metrikleri:

- Güven skoru
- Kullanıcı deneyimi skoru
- Çözüm oranı
- Ortalama yanıt süresi
- Şikayet yoğunluğu
- Tekrarlayan sorun oranı
- Sertifika seviyesi
- Sponsor havuzu büyüklüğü
- Topluluk güven oyu

Bu metrikler şuna yansır:

- Güvenilir bahis siteleri vitrini
- Site ligi
- Marka detay sayfası
- Kara liste / risk uyarısı
- Sertifika rozeti
- Önerilen siteler sıralaması

## Kara liste aksiyon alanı

Kara liste pasif bir liste olmamalı. Aksiyon filmi gibi çalışan bir risk sahnesi olmalı.

Kara liste mantığı:

- Çok sayıda şikayet alan site kırmızı alarm alır.
- Yanıt vermeyen firma görünürlük kaybeder.
- Çözüm oranı düşükse lig puanı düşer.
- Kullanıcıya güvenli alternatifler gösterilir.
- Firma iyileşme hamlesi yaparsa risk puanı tekrar hesaplanır.

Kullanılacak dil:

- Yüksek Risk
- Çok Sayıda Şikayet
- Çözüm Oranı Düşük
- İnceleme Altında
- Kullanıcı Uyarısı

Kesin suçlayıcı ifade kullanılmaz.

## Güvenilir bahis siteleri alanı

Bu alan premium vitrin olmalı. Burada listelenen siteler yüksek standart altında yarışır.

Kartta olacaklar:

- Diamond Trust rozeti
- Güven skoru
- Çözüm oranı
- Kullanıcı deneyimi skoru
- Yanıt süresi
- Trend yükselişi
- Sadakat havuzu
- Sertifika seviyesi
- Kullanıcı yorum sinyali

## Sorumlu oyun ve psikoloji katmanı

Bu alan marka güvenini güçlendirir.

Modüller:

- Zaman kontrolü
- Bütçe yönetimi
- Kayıp kovalama farkındalığı
- Duygusal kontrol testi
- Risk yüzdesi
- Destek kaynakları
- AI farkındalık asistanı

AI tıbbi teşhis vermez. Farkındalık ve yönlendirme asistanı olarak çalışır.

## MVP fonksiyon listesi

İlk canlı MVP için gerekli backend parçaları:

1. Kullanıcı puan tablosu
2. Kullanıcı cüzdan tablosu
3. Ödül işlem geçmişi
4. Site güven skoru hesaplayıcı
5. Şikayet custom post type meta alanları
6. Firma yanıt sistemi
7. Kullanıcı yorum ve değerlendirme sistemi
8. Faydalı oy sistemi
9. Kara liste risk hesaplayıcı
10. Admin sponsor ödül dağıtım paneli
11. Marka paneli
12. AI yönlendirme endpointi

## Teknik uygulama sırası

1. Mevcut PRO görsel kabuk korunacak.
2. Sidebar ve topbar ortak component yapılacak.
3. Puan ve ödül motoru ayrı plugin modülü olarak yazılacak.
4. Şikayet sistemi gerçek CPT/meta yapısına bağlanacak.
5. Firma güven skoru hesaplayıcı eklenecek.
6. Marka rekabet ligi dinamik hale getirilecek.
7. Kara liste risk motoru eklenecek.
8. Sorumlu oyun ve psikoloji testi gerçek kullanıcı profiline bağlanacak.
9. AI danışman mevcut ai-engine veya vibe-ai ile bağlanacak.
10. QA sonrası ana sayfa ve route şablonlarına taşınacak.
