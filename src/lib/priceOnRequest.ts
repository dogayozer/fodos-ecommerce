// "Fiyat Sorunuz" kategorileri: tedarik fiyatı sık değiştiği için fiyat gösterilmez, satın alma WhatsApp ile yapılır.
// Kategori slug'ı ile belirlenir (şema değişikliği gerekmez); listeye slug eklemek yeterli.
export const PRICE_ON_REQUEST_SLUGS = ['ekranlar-ve-koruyucular']

export const isPriceOnRequest = (categorySlug?: string | null) =>
  !!categorySlug && PRICE_ON_REQUEST_SLUGS.includes(categorySlug)

export const PRICE_ON_REQUEST_LABEL = 'Fiyat Sorunuz'
export const PRICE_ON_REQUEST_NOTE =
  'Tedarik sürecinde aksilik yaşanmaması için Stok ve Fiyat Bilgisi için lütfen iletişime geçin.'

const WA_PHONE = '905322324499'

export const priceOnRequestWaUrl = (title: string, barcode?: string | null) =>
  `https://wa.me/${WA_PHONE}?text=${encodeURIComponent(
    `Merhaba, "${title}"${barcode ? ` (Stok Kodu: ${barcode})` : ''} ürünü için stok ve fiyat bilgisi almak istiyorum.`
  )}`
