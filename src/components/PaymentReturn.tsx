'use client'

import { useEffect } from 'react'

// PayTR ödeme sonrası müşteriyi merchant_ok_url / merchant_fail_url'e yönlendirir; iFrame API'de bu yönlendirme
// ödeme penceresinin (iframe) İÇİNDE olur. Bu yüzden önce (başarılıysa) sepet temizlenir, sonra sayfa iframe
// içindeyse üst pencereye taşınır; müşteri sonucu tam sayfa görür. Sepet ödeme başlarken değil, sadece ödeme
// BAŞARILI olunca temizlenir (başarısız/vazgeçilen ödemede müşteri sepetine dönüp tekrar deneyebilir).
export default function PaymentReturn({ clearCart = false }: { clearCart?: boolean }) {
  useEffect(() => {
    if (clearCart) {
      try {
        localStorage.removeItem('cart')
        localStorage.removeItem('appliedCoupon')
        window.dispatchEvent(new Event('cartUpdated'))
      } catch {}
    }
    if (window.self !== window.top) {
      try { window.top!.location.href = window.location.href } catch {}
    }
  }, [clearCart])

  return null
}
