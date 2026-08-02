import { Metadata } from "next";

export const metadata: Metadata = {
  title: "İade ve Garanti Koşulları | Fodos ve Piaks",
};

export default function IadeGarantiPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-trust-blue-600">İade ve Garanti Koşulları</h1>
      
      <div className="prose prose-slate max-w-none">
        <p>Müşteri memnuniyeti bizim için önceliklidir. İade ve garanti süreçlerimizi şeffaf ve hızlı bir şekilde yürütmeyi hedefliyoruz.</p>
        
        <h2 className="text-xl font-semibold mt-6 mb-3">1. İade Koşulları (30 Gün İade Garantisi)</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Satın aldığınız ürünleri, teslimat tarihinden itibaren 30 gün içerisinde iade edebilirsiniz.</li>
          <li>İade edilecek ürünün kullanılmamış, orijinal ambalajı bozulmamış ve tekrar satılabilir durumda olması gerekmektedir.</li>
          <li><strong>Önemli Uyarı:</strong> Ekran ve batarya gibi elektronik ürünlerde, koruyucu jelatinin sökülmesi, filmlerin yırtılması veya lehim/montaj işlemi yapılması durumunda iade kabul edilmemektedir. Lütfen montaj öncesi esnek kablo (flex) üzerinden test yapınız.</li>
        </ul>
        
        <h2 className="text-xl font-semibold mt-6 mb-3">2. Garanti Kapsamı</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Tüm ürünlerimiz üretim hatalarına karşı ithalatçı / üretici firma garantisi altındadır.</li>
          <li>Kullanıcı hatasından kaynaklanan hasarlar (kırılma, sıvı teması, yanlış montaj kaynaklı kısa devre vb.) garanti kapsamı dışındadır.</li>
          <li>Sertifikalı bataryalarımız, pil sağlığının beklenenden çok daha hızlı düşmesi veya şişme gibi üretim hatalarına karşı "1 Yıl Birebir Değişim Garantisi" altındadır.</li>
        </ul>
        
        <h2 className="text-xl font-semibold mt-6 mb-3">3. İade Süreci Nasıl İşler?</h2>
        <p>İade talebinizi WhatsApp destek hattımız (0532 232 44 99) üzerinden veya hesabınızdaki Siparişlerim bölümünden bize iletebilirsiniz. İade kargonuz depomuza ulaşıp incelendikten sonra, ödeme yaptığınız yönteme uygun olarak ücret iadeniz 3-5 iş günü içerisinde gerçekleştirilecektir.</p>
      </div>
    </main>
  );
}
