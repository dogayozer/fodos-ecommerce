import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { prisma } from '@/lib/prisma'

// api/auth/login, register ve me route'larıyla birebir aynı çerez/JWT şeması.
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fodos-super-secret-customer-key')

export async function getCustomerFromRequest() {
  try {
    const cookieStore: any = cookies()
    const store = cookieStore instanceof Promise ? await cookieStore : cookieStore
    const token = store.get('customer_token')?.value
    if (!token) return null

    const { payload } = await jwtVerify(token, JWT_SECRET)
    if (!payload.sub) return null

    const customer = await prisma.customer.findUnique({ where: { id: payload.sub as string } })
    if (!customer || customer.isGuest) return null
    return customer
  } catch {
    return null
  }
}
