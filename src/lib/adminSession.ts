// Admin oturumu: HMAC-SHA256 ile imzalı, süreli çerez token'ı.
// Eskiden çerez değeri sabit 'authenticated' idi — şifreyi bilmeyen biri de tarayıcısında
// bu çerezi elle oluşturup admin paneline ve /api/admin/* uçlarına erişebiliyordu.
// Web Crypto kullanıldığı için hem proxy/middleware'de hem route handler'larda çalışır.

// Giriş bilgileri (önceden admin/actions.ts içinde sabitti — davranış aynı kaldı)
export const ADMIN_USERNAME = 'Admin'
export const ADMIN_PASSWORD = 'Pds135596'

export const ADMIN_SESSION_COOKIE = 'admin_session'
const SESSION_TTL_MS = 24 * 60 * 60 * 1000
export const ADMIN_SESSION_MAX_AGE = SESSION_TTL_MS / 1000

// ADMIN_SESSION_SECRET tanımlıysa o kullanılır; değilse anahtar admin şifresinden
// türetilir — böylece şifreyi bilmeyen token üretemez, şifre değişince tüm oturumlar düşer.
function getSecret(): string {
  return process.env.ADMIN_SESSION_SECRET || `fodos-admin-session:${ADMIN_PASSWORD}`
}

const encoder = new TextEncoder()

function toBase64Url(bytes: ArrayBuffer | Uint8Array): string {
  let binary = ''
  for (const b of new Uint8Array(bytes)) binary += String.fromCharCode(b)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function sign(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(getSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  return toBase64Url(await crypto.subtle.sign('HMAC', key, encoder.encode(payload)))
}

export async function createAdminSessionToken(): Promise<string> {
  const nonce = toBase64Url(crypto.getRandomValues(new Uint8Array(16)))
  const payload = `${Date.now() + SESSION_TTL_MS}.${nonce}`
  return `${payload}.${await sign(payload)}`
}

export async function verifyAdminSessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false
  const parts = token.split('.')
  if (parts.length !== 3) return false
  const [expiresAt, nonce, signature] = parts
  if (!(Number(expiresAt) > Date.now())) return false

  const expected = await sign(`${expiresAt}.${nonce}`)
  if (expected.length !== signature.length) return false
  let diff = 0
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i)
  return diff === 0
}
