import { Metadata } from 'next'
import { getCustomerFromRequest } from '@/lib/customerAuth'
import { BayiPortal } from './BayiPortal'

export const metadata: Metadata = {
  title: 'Bayi Girişi | Fodos',
  robots: { index: false, follow: false },
}

export default async function BayiPage() {
  const customer = await getCustomerFromRequest()

  return (
    <BayiPortal
      loggedIn={!!customer}
      isDealer={!!customer?.isDealer}
      name={customer?.name || null}
    />
  )
}
