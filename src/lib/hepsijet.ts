// HepsiJET Kargo Entegrasyonu (Retail/STD Gönderi Oluşturma)
// Doküman: https://documenter.getpostman.com/view/33109546/2sA2rGwKq9
//
// Sabit şirket/adres/X-Dock bilgileri HepsiJET tarafından tanımlanmış, her siparişte
// aynı gönderilmesi gereken değerler (.env ile override edilebilir, yoksa test
// ortamında doğrulanmış varsayılanlar kullanılır).

const BASE_URL = process.env.HEPSIJET_BASE_URL || 'https://integration-apitest.hepsijet.com'
const USERNAME = process.env.HEPSIJET_USERNAME || 'fodos_integration'
const PASSWORD = process.env.HEPSIJET_PASSWORD || 'T!SO22Pz9E'

const COMPANY_NAME = process.env.HEPSIJET_COMPANY_NAME || 'FODOS'
const COMPANY_CODE = process.env.HEPSIJET_COMPANY_CODE || 'FODOS'
const XDOCK_CODE = process.env.HEPSIJET_XDOCK_CODE || 'FODOSFATIH'

const SENDER_ADDRESS_ID = process.env.HEPSIJET_SENDER_ADDRESS_ID || 'hfodo-fodos-611'
const SENDER_CITY = process.env.HEPSIJET_SENDER_CITY || 'İstanbul'
const SENDER_TOWN = process.env.HEPSIJET_SENDER_TOWN || 'FATİH'
const SENDER_DISTRICT = process.env.HEPSIJET_SENDER_DISTRICT || 'DEMİRTAŞ'
const SENDER_ADDRESS_LINE1 = process.env.HEPSIJET_SENDER_ADDRESS_LINE1
  || 'DEMİRTAŞ MAH. PAÇACI SK. TAHTAKALE İŞ MERKEZİ NO: 11 İÇ KAPI NO: 208 FATİH/ İSTANBUL'

// Token TTL 60 dakika (HepsiJET dokümantasyonu) — bir warm lambda içinde tekrar tekrar
// token almamak için process içi basit önbellek. Cold start'ta yeniden alınır, sorun değil.
let cachedToken: string | null = null
let tokenExpiresAt = 0

async function getToken(): Promise<string> {
  const now = Date.now()
  if (cachedToken && now < tokenExpiresAt) {
    return cachedToken
  }

  const res = await fetch(`${BASE_URL}/auth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Origin': 'integration',
      'X-Client-Id': 'hj-integration',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ username: USERNAME, password: PASSWORD }),
  })
  const json: any = await res.json()
  if (!res.ok || !json?.data?.token) {
    throw new Error('HepsiJET token alınamadı: ' + JSON.stringify(json))
  }

  const token: string = json.data.token
  cachedToken = token
  // 60 dakikalık ömrün 5 dakika öncesinde yenile (güvenlik payı)
  tokenExpiresAt = now + 55 * 60 * 1000
  return token
}

function splitName(fullName: string): { firstName: string; lastName: string } {
  const nameParts = (fullName || '').trim().split(/\s+/)
  const firstName = nameParts.slice(0, -1).join(' ') || nameParts[0] || ''
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : ''
  return { firstName, lastName }
}

export interface HepsijetOrderInput {
  orderNumber: string
  customerName: string
  customerPhone: string
  customerEmail?: string | null
  shippingCity: string
  shippingDistrict: string
  shippingAddress: string
}

export interface HepsijetResult {
  success: boolean
  trackingNumber?: string
  trackingUrl?: string
  error?: string
}

function buildDeliveryBody(order: HepsijetOrderInput, deliveryType: 'RETAIL' | 'RETURNED', deliveryDate: string) {
  const { firstName, lastName } = splitName(order.customerName)
  return {
    company: { name: COMPANY_NAME, abbreviationCode: COMPANY_CODE },
    delivery: {
      customerDeliveryNo: order.orderNumber,
      customerOrderId: order.orderNumber,
      totalParcels: '1',
      desi: '1',
      deliverySlotOriginal: '0',
      deliveryDateOriginal: deliveryDate,
      deliveryType,
      product: { productCode: 'HX_STD' },
      senderAddress: {
        companyAddressId: SENDER_ADDRESS_ID,
        country: { name: 'Türkiye' },
        city: { name: SENDER_CITY },
        town: { name: SENDER_TOWN },
        district: { name: SENDER_DISTRICT },
        addressLine1: SENDER_ADDRESS_LINE1,
      },
      receiver: {
        companyCustomerId: crypto.randomUUID(),
        firstName,
        lastName,
        phone1: order.customerPhone || '',
        phone2: '',
        email: order.customerEmail || '',
      },
      recipientAddress: {
        companyAddressId: crypto.randomUUID(),
        country: { name: 'Türkiye' },
        city: { name: order.shippingCity || '' },
        town: { name: order.shippingDistrict || '' },
        district: { name: '' },
        addressLine1: order.shippingAddress || '',
      },
      recipientPerson: order.customerName,
      recipientPersonPhone1: order.customerPhone || '',
    },
    currentXDock: { abbreviationCode: XDOCK_CODE },
  }
}

async function sendDeliveryOrder(order: HepsijetOrderInput, deliveryType: 'RETAIL' | 'RETURNED', deliveryDate: string): Promise<HepsijetResult> {
  const token = await getToken()
  const body = buildDeliveryBody(order, deliveryType, deliveryDate)

  const res = await fetch(`${BASE_URL}/delivery/sendDeliveryOrderEnhanced`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Auth-Token': token,
      'X-Origin': 'integration',
      'X-Client-Id': 'hj-integration',
      'Accept': 'application/json',
    },
    body: JSON.stringify(body),
  })
  const json: any = await res.json()

  if (!res.ok || json?.status !== 'OK') {
    return { success: false, error: json?.message || `HTTP ${res.status}` }
  }

  const barcodeInfo = json?.data?.zplBarcodeDTOList?.[0]
  return {
    success: true,
    trackingNumber: json?.data?.customerDeliveryNo || barcodeInfo?.barcodeNo,
    trackingUrl: barcodeInfo?.trackingUrl,
  }
}

/**
 * Bir siparişi HepsiJET'e STD (Standart Teslimat) gönderisi olarak iletir.
 * Başarılı olursa barkod/takip numarasını döner; hata durumunda süreci
 * durdurmadan (throw etmeden) success:false ile hatayı bildirir — çağıran taraf
 * (PayTR webhook'u gibi) bu yüzden asla kesintiye uğramamalı.
 */
export async function sendHepsijetOrder(order: HepsijetOrderInput): Promise<HepsijetResult> {
  try {
    const today = new Date().toISOString().slice(0, 10)
    return await sendDeliveryOrder(order, 'RETAIL', today)
  } catch (e: any) {
    return { success: false, error: e.message || 'Bilinmeyen hata' }
  }
}

/**
 * HepsiJET'in resmi dokümantasyonuna göre (developers.hepsiburada.com), RETURNED
 * (randevulu iade) gönderisi oluşturmadan önce delivery/findAvailableDeliveryDatesV2
 * servisinden uygun bir randevu tarihi alınması gerekiyor. Bu servis test ortamında
 * (deneme yaptığımızda) sürekli genel bir sunucu hatası döndürdü — dokümantasyonda
 * örnek bir başarılı yanıt da yok, bu yüzden yanıtı esnek/savunmacı şekilde
 * ayrıştırıyoruz. Servis başarısız olursa veya beklenmeyen bir yanıt dönerse,
 * daha önce canlı ortamda iki kez doğrulanmış "yarının tarihi" yöntemine düşüyoruz
 * (HepsiJET bugünün tarihini randevu için kabul etmiyor).
 */
async function findAvailableReturnDate(city: string, town: string): Promise<string> {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const fallback = tomorrow.toISOString().slice(0, 10)

  try {
    const token = await getToken()
    const start = new Date().toISOString().slice(0, 10)
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + 14)
    const params = new URLSearchParams({
      startDate: start,
      endDate: endDate.toISOString().slice(0, 10),
      deliveryType: 'RETURNED',
      city,
      town,
    })

    const res = await fetch(`${BASE_URL}/rest/delivery/findAvailableDeliveryDatesV2?${params.toString()}`, {
      headers: {
        'X-Auth-Token': token,
        'X-Origin': 'integration',
        'X-Client-Id': 'hj-integration',
        'Accept': 'application/json',
      },
    })
    if (!res.ok) return fallback
    const json: any = await res.json()

    // Yanıt şekli dokümante edilmemiş — birkaç olası şekli deneyelim.
    const candidates: any[] =
      json?.data?.availableDates || json?.data?.dates || json?.availableDates || json?.dates || json?.data || []
    if (!Array.isArray(candidates) || candidates.length === 0) return fallback

    const first = candidates[0]
    const date = typeof first === 'string' ? first : first?.date || first?.deliveryDate
    return date || fallback
  } catch {
    return fallback
  }
}

/**
 * Bir siparişi HepsiJET'e RETURNED (randevulu iade) gönderisi olarak iletir.
 * Şu an uygulamanın hiçbir yerinden otomatik çağrılmıyor (ödeme sonrası otomasyon
 * sadece STD/RETAIL kullanıyor) — ileride bir "iade süreci" özelliği eklenirse
 * hazır olması için burada tutuluyor.
 */
export async function sendHepsijetReturn(order: HepsijetOrderInput): Promise<HepsijetResult> {
  try {
    const deliveryDate = await findAvailableReturnDate(order.shippingCity || SENDER_CITY, order.shippingDistrict || SENDER_TOWN)
    return await sendDeliveryOrder(order, 'RETURNED', deliveryDate)
  } catch (e: any) {
    return { success: false, error: e.message || 'Bilinmeyen hata' }
  }
}
