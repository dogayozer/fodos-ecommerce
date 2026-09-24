import { prisma } from '@/lib/prisma'
import { CheckoutClient } from './CheckoutClient'

export default async function CheckoutPage() {
  const settings = await prisma.storeSettings.findUnique({ where: { id: 'default' } })
  const shippingFee = settings?.shippingFee ?? 110
  const shippingThreshold = settings?.shippingThreshold ?? 500

  return <CheckoutClient shippingFee={shippingFee} shippingThreshold={shippingThreshold} />
}
