import { ShieldCheck, Lock, CreditCard, CheckCircle2 } from 'lucide-react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Güvenli Ödeme | Fodos",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 relative z-50">
      {/* Absolute overlay to hide standard layout headers if they exist, to ensure frictionless checkout. 
          In a real app, you might use a separate Next.js layout group for checkout. */}
      
      <div className="max-w-4xl mx-auto px-4">
        {/* Simple Checkout Header */}
        <div className="flex justify-between items-center mb-8 border-b border-gray-200 pb-4">
          <h1 className="text-2xl font-black text-trust-blue-600 tracking-tight">FODOS</h1>
          <div className="flex items-center text-sm font-semibold text-gray-500">
            <Lock size={16} className="mr-1 text-badge-certified" />
            256-bit Güvenli Ödeme
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            
            {/* Guest Checkout Info */}
            <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h2 className="text-lg font-bold mb-4 flex items-center">
                <span className="w-6 h-6 rounded-full bg-trust-blue-100 text-trust-blue-600 flex items-center justify-center text-sm mr-2">1</span>
                İletişim & Teslimat
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="Ad" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-trust-blue-500" />
                <input type="text" placeholder="Soyad" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-trust-blue-500" />
                <input type="email" placeholder="E-posta" className="col-span-2 w-full p-3 border border-gray-300 rounded-lg focus:ring-trust-blue-500" />
                <textarea placeholder="Açık Adres" rows={3} className="col-span-2 w-full p-3 border border-gray-300 rounded-lg focus:ring-trust-blue-500"></textarea>
              </div>
            </section>

            {/* Paynet Payment Form */}
            <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative">
              <h2 className="text-lg font-bold mb-4 flex items-center">
                <span className="w-6 h-6 rounded-full bg-trust-blue-100 text-trust-blue-600 flex items-center justify-center text-sm mr-2">2</span>
                Ödeme Bilgileri
              </h2>
              
              <div className="space-y-4">
                <div className="relative">
                  <input type="text" placeholder="Kart Numarası" className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-trust-blue-500" />
                  <CreditCard className="absolute left-3 top-3.5 text-gray-400" size={20} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="AA / YY" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-trust-blue-500" />
                  <input type="text" placeholder="CVV" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-trust-blue-500" />
                </div>
              </div>

              {/* Neuro-UX: Micro Trust Badges directly below the payment form */}
              <div className="mt-6 p-4 bg-blue-50/50 rounded-lg flex flex-wrap gap-x-6 gap-y-2 text-trust-micro text-gray-700 font-medium">
                <div className="flex items-center"><ShieldCheck size={16} className="mr-1 text-badge-certified" /> 30 Gün Sorgusuz İade</div>
                <div className="flex items-center"><CheckCircle2 size={16} className="mr-1 text-badge-certified" /> 1 Yıl Birebir Değişim Garantisi</div>
                <div className="flex items-center"><Lock size={16} className="mr-1 text-gray-400" /> Paynet Altyapısı ile Korunmaktadır</div>
              </div>
            </section>

          </div>

          {/* Sidebar Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-6">
              <h3 className="font-bold mb-4">Sipariş Özeti</h3>
              
              {/* Mock Items */}
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 truncate mr-2">1x iPhone 14 Pro Max Kılıf...</span>
                  <span className="font-medium">450 TL</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 truncate mr-2">1x 20W Hızlı Şarj Adaptörü...</span>
                  <span className="font-medium">300 TL</span>
                </div>
              </div>

              <hr className="border-gray-200 mb-4" />
              
              <div className="flex justify-between mb-2 text-sm text-gray-600">
                <span>Ara Toplam</span>
                <span>750 TL</span>
              </div>
              <div className="flex justify-between mb-4 text-sm text-gray-600">
                <span>Kargo</span>
                <span>49.90 TL</span>
              </div>
              
              <div className="flex justify-between mb-6 text-xl font-bold text-gray-900">
                <span>Toplam</span>
                <span>799.90 TL</span>
              </div>

              <button className="w-full py-4 bg-cta-background hover:bg-cta-hover text-white rounded-xl font-bold transition-colors shadow-md hover:shadow-lg flex items-center justify-center">
                <Lock size={18} className="mr-2" />
                Siparişi Tamamla
              </button>

              <p className="text-xs text-gray-400 mt-4 text-center">
                Siparişi tamamlayarak Mesafeli Satış Sözleşmesi'ni kabul etmiş olursunuz.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
