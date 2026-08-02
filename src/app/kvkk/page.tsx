import { Metadata } from "next";

export const metadata: Metadata = {
  title: "KVKK Aydınlatma Metni | Fodos ve Piaks",
};

export default function KVKKPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-trust-blue-600">Kişisel Verilerin Korunması (KVKK) Aydınlatma Metni</h1>
      
      <div className="prose prose-slate max-w-none">
        <p><strong>Veri Sorumlusu:</strong> Fodos ve Piaks (Sirkeci, Fatih / İstanbul)</p>
        
        <h2 className="text-xl font-semibold mt-6 mb-3">1. Kişisel Verilerin İşlenme Amacı</h2>
        <p>Şirketimiz, müşterilerimize daha iyi hizmet verebilmek, sipariş süreçlerini yürütmek, müşteri memnuniyetini artırmak ve yasal yükümlülüklerimizi yerine getirmek amacıyla kişisel verilerinizi (ad, soyad, iletişim bilgileri, adres, alışveriş geçmişi) işlemektedir.</p>
        
        <h2 className="text-xl font-semibold mt-6 mb-3">2. Kişisel Verilerin Aktarılması</h2>
        <p>İşlenen kişisel verileriniz, yasal zorunluluklar kapsamında yetkili kamu kurumlarına, kargo ve lojistik süreçlerinin yürütülmesi için anlaşmalı taşıma firmalarına ve ödeme altyapısı (Paynet) sağlayıcılarına aktarılabilmektedir.</p>
        
        <h2 className="text-xl font-semibold mt-6 mb-3">3. Kişisel Veri Toplamanın Yöntemi ve Hukuki Sebebi</h2>
        <p>Kişisel verileriniz, web sitemiz üzerinden elektronik ortamda toplanmaktadır. İşlemeler, 6698 sayılı Kanun'un 5. maddesinde belirtilen "sözleşmenin kurulması veya ifasıyla doğrudan doğruya ilgili olması kaydıyla" ve "veri sorumlusunun hukuki yükümlülüğünü yerine getirebilmesi için zorunlu olması" hukuki sebeplerine dayanmaktadır.</p>
        
        <h2 className="text-xl font-semibold mt-6 mb-3">4. İlgili Kişinin Hakları</h2>
        <p>Kanun'un 11. maddesi uyarınca; kişisel verilerinizin işlenip işlenmediğini öğrenme, işlenmişse bilgi talep etme, işlenme amacını öğrenme, yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme, eksik veya yanlış işlenmişse düzeltilmesini isteme haklarına sahipsiniz.</p>
      </div>
    </main>
  );
}
