import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { jwtVerify } from 'jose'

export const dynamic = 'force-dynamic'

export default async function HesabimPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value
  
  if (!token) return null // handled by layout

  let customer = null
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret')
    const { payload } = await jwtVerify(token, secret)
    customer = await prisma.customer.findUnique({
      where: { id: payload.userId as string }
    })
  } catch (e) {
    return <div>Oturum süreniz dolmuş.</div>
  }

  if (!customer) return <div>Hesap bulunamadı.</div>

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4">Profil Bilgilerim</h1>
      
      <div className="space-y-6 max-w-lg">
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">Ad Soyad</label>
          <div className="font-semibold text-gray-900">{customer.name || '-'}</div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">E-Posta Adresi</label>
          <div className="font-semibold text-gray-900">{customer.email}</div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">Telefon Numarası</label>
          <div className="font-semibold text-gray-900">{customer.phone || '-'}</div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">Kayıtlı Adres</label>
          <div className="text-gray-900">
            {customer.address ? (
              <>
                {customer.address}<br/>
                <span className="font-semibold">{customer.district} / {customer.city}</span>
              </>
            ) : '-'}
          </div>
        </div>
      </div>
    </div>
  )
}
