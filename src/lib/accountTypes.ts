// Kayıt formu (hesap türü) ve bayi bülteni splash formu için ortak işletme türleri.
// mobilparcamerkezi reposunda da aynı dosya var — iki site aynı veritabanını
// kullandığı için değerlerin birebir aynı kalması gerekiyor.
export const BUSINESS_TYPES = ['Cep Telefonu Tamiri', 'Cep Telefonu Mağazası', 'Diğer'] as const

export function isBusinessType(value: unknown): value is (typeof BUSINESS_TYPES)[number] {
  return typeof value === 'string' && (BUSINESS_TYPES as readonly string[]).includes(value)
}

// Kayıt isteğindeki hesap türünü doğrular; geçersizse null döner.
export function parseAccountType(
  accountType: unknown,
  businessType: unknown
): { accountType: 'bireysel' | 'isletme'; businessType: string | null } | null {
  if (accountType === undefined || accountType === null || accountType === '' || accountType === 'bireysel') {
    return { accountType: 'bireysel', businessType: null }
  }
  if (accountType === 'isletme' && isBusinessType(businessType)) {
    return { accountType: 'isletme', businessType }
  }
  return null
}

// Türkiye telefon numarasını 0XXXXXXXXXX biçimine getirir; geçersizse null döner.
export function normalizeTrPhone(value: unknown): string | null {
  if (typeof value !== 'string') return null
  let digits = value.replace(/\D/g, '')
  if (digits.length === 12 && digits.startsWith('90')) digits = '0' + digits.slice(2)
  if (digits.length === 10) digits = '0' + digits
  return /^0\d{10}$/.test(digits) ? digits : null
}
