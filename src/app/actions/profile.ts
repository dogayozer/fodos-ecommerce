'use server'

import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { jwtVerify } from 'jose'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value

    if (!token) {
      return { success: false, error: 'Oturum bulunamadı. Lütfen tekrar giriş yapın.' }
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret')
    const { payload } = await jwtVerify(token, secret)
    const userId = payload.userId as string

    if (!userId) {
      return { success: false, error: 'Geçersiz oturum.' }
    }

    const name = formData.get('name') as string
    const phone = formData.get('phone') as string
    const city = formData.get('city') as string
    const district = formData.get('district') as string
    const address = formData.get('address') as string

    await prisma.customer.update({
      where: { id: userId },
      data: {
        name: name?.trim() || null,
        phone: phone?.trim() || null,
        city: city?.trim() || null,
        district: district?.trim() || null,
        address: address?.trim() || null,
      }
    })

    // Revalidate the profile page to show new data
    revalidatePath('/hesabim')

    return { success: true }
  } catch (error: any) {
    console.error('Profile update error:', error)
    return { success: false, error: 'Profil güncellenirken bir hata oluştu.' }
  }
}
