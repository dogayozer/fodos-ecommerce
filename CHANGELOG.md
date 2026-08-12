# Fodos E-Ticaret - Sürüm Notları (Changelog)

Bu dosya, Fodos e-ticaret sisteminde yapılan tüm altyapı, tasarım ve özellik güncellemelerinin geçmişini tutmak amacıyla oluşturulmuştur.

## [v1.6.0] - 12 Ağustos 2026
### Eklendi / Güncellendi
- **Hız ve Performans:** Sitedeki tüm standart resim etiketleri (`<img>`), Next.js Image (`<Image>`) bileşeniyle değiştirildi. Görseller otomatik olarak WebP formatına sıkıştırılacak ve Lazy-Load ile yüklenecek.
- **Akıllı Sıralama:** Ana sayfadaki "Yeni Gelenler", "Çok Satanlar" ve "Arama Sonuçları" sayfalarındaki ürün listelemeleri, **görsel sayısı en çok olandan en aza doğru** olacak şekilde güncellendi.
- **Hukuki Metinler:** Mesafeli Satış Sözleşmesi, KVKK ve Gizlilik Politikası gibi yasal metinler veritabanına işlendi.
- **Zorunlu Onaylar:** Ödeme (Checkout) ve Kayıt Ol sayfalarına KVKK ve Mesafeli Satış/Üyelik sözleşmeleri için zorunlu onay kutucukları eklendi. (Ticari iletişim izni isteğe bağlı olarak eklendi).

## [v1.5.0] - 12 Ağustos 2026
### Eklendi / Güncellendi
- **Gelişmiş Arama:** Arama motoruna PostgreSQL `unaccent` eklentisi entegre edilerek Türkçe karakter (ö,ş,ü vb.) ve büyük/küçük harf duyarsız arama özelliği eklendi.
- **Tasarım:** Ana sayfaya "Türkiye'nin Cep Telefonu Parça Tedarikçisi" vizyon afişi eklendi.
- **SEO:** Global SEO etiketleri (`metadataBase`, `keywords`, `openGraph`) zenginleştirildi. Sitemap'e kategori sayfaları dahil edildi.

## [v1.4.0] - 5 Ağustos 2026
### Eklendi
- İndirim Kuponu Yönetimi (Sepette otomatik hesaplama eklendi).
- Dinamik Kategori Yönetimi ve Toplu Kategori Taşıma Modülü.
- Fiyat güncellemeleri, kargo mantığı ve dinamik mağaza ayarları panele eklendi.
