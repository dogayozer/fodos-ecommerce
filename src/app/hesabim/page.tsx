import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { jwtVerify } from 'jose'
import { ProfileForm } from '@/components/ProfileForm'

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
      <ProfileForm customer={customer} />
    </div>
  )
}
