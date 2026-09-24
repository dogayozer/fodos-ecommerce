import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isBusinessType, normalizeTrPhone } from '@/lib/accountTypes'

// "Bayi portalımız yakında" splash formu — bülten kaydı
export async function POST(req: Request) {
  try {
    const { name, phone, email, businessType, marketingConsent } = await req.json()

    const normalizedPhone = normalizeTrPhone(phone)
    if (!normalizedPhone) {
      return NextResponse.json({ error: 'Lütfen geçerli bir telefon numarası girin.' }, { status: 400 })
    }
    if (marketingConsent !== true) {
      return NextResponse.json({ error: 'Bülten kaydı için ileti onayı gereklidir.' }, { status: 400 })
    }
    if (businessType && !isBusinessType(businessType)) {
      return NextResponse.json({ error: 'Geçersiz işletme türü.' }, { status: 400 })
    }
    const cleanEmail = typeof email === 'string' && email.trim() ? email.trim().toLowerCase() : null
    if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return NextResponse.json({ error: 'Lütfen geçerli bir e-posta adresi girin.' }, { status: 400 })
    }

    // Aynı numara tekrar gönderirse ikinci kayıt açma
    const existing = await prisma.dealerNewsletterSignup.findFirst({ where: { phone: normalizedPhone } })
    if (!existing) {
      await prisma.dealerNewsletterSignup.create({
        data: {
          name: typeof name === 'string' && name.trim() ? name.trim().slice(0, 100) : null,
          phone: normalizedPhone,
          email: cleanEmail,
          businessType: businessType || null,
          store: 'fodos',
          marketingConsent: true,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Dealer signup error:', error)
    return NextResponse.json({ error: 'Kayıt sırasında bir hata oluştu.' }, { status: 500 })
  }
}
