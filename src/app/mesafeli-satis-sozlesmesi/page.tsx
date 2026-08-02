import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mesafeli Satış Sözleşmesi | Fodos ve Piaks",
};

export default function MesafeliSatisPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-trust-blue-600">Mesafeli Satış Sözleşmesi</h1>
      
      <div className="prose prose-slate max-w-none">
        <h2 className="text-xl font-semibold mt-6 mb-3">1. Taraflar</h2>
        <p><strong>Satıcı:</strong> Fodos ve Piaks</p>
        <p><strong>Adres:</strong> Sirkeci, Fatih / İstanbul</p>
        <p><strong>Telefon:</strong> 0532 232 44 99</p>
        <p><strong>Alıcı:</strong> Sistemi kullanarak sipariş veren müşteri.</p>
        
        <h2 className="text-xl font-semibold mt-6 mb-3">2. Konu</h2>
        <p>İşbu sözleşmenin konusu, Alıcı'nın Satıcı'ya ait web sitesinden elektronik ortamda siparişini yaptığı ürünlerin satışı ve teslimi ile ilgili olarak 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri gereğince tarafların hak ve yükümlülüklerinin saptanmasıdır.</p>
        
        <h2 className="text-xl font-semibold mt-6 mb-3">3. Sözleşme Konusu Ürün ve Ödeme</h2>
        <p>Ürünlerin cinsi ve türü, miktarı, marka/modeli, rengi ve tüm vergiler dâhil satış bedeli web sitesinde belirtildiği gibidir. Ödemeler kredi kartı veya havale/EFT ile yapılabilir.</p>
        
        <h2 className="text-xl font-semibold mt-6 mb-3">4. Teslimat ve İfa</h2>
        <p>Sipariş edilen ürünler, yasal 30 günlük süreyi aşmamak koşuluyla, web sitesinde belirtilen kargo süresi içerisinde Alıcı'nın gösterdiği adrese teslim edilir.</p>
        
        <h2 className="text-xl font-semibold mt-6 mb-3">5. Cayma Hakkı</h2>
        <p>Alıcı, ürünü teslim aldığı tarihten itibaren 14 (on dört) gün içerisinde hiçbir hukuki ve cezai sorumluluk üstlenmeksizin ve hiçbir gerekçe göstermeksizin malı reddederek sözleşmeden cayma hakkına sahiptir. Montajı yapılmış, ambalajı bozulmuş veya jelatini sökülmüş ekran ve batarya gibi hassas elektronik parçalarda iade koşulları ürün özelliklerine göre değişiklik gösterebilir.</p>
      </div>
    </main>
  );
}
