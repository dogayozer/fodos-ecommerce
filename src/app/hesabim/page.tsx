import { ProfileForm } from '@/components/ProfileForm'
import { getCustomerFromRequest } from '@/lib/customerAuth'

export const dynamic = 'force-dynamic'

export default async function HesabimPage() {
  const customer = await getCustomerFromRequest()

  if (!customer) return <div>Oturum süreniz dolmuş.</div>

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4">Profil Bilgilerim</h1>
      <ProfileForm customer={customer} />
    </div>
  )
}
