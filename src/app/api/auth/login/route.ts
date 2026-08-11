import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'
import { cookies } from 'next/headers'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fodos-super-secret-customer-key')

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email ve şifre zorunludur' }, { status: 400 })
    }

    const user = await prisma.customer.findUnique({
      where: { email }
    })

    if (!user || user.isGuest) {
      return NextResponse.json({ error: 'Geçersiz email veya şifre' }, { status: 401 })
    }

    if (!user.password) {
      return NextResponse.json({ error: 'Lütfen şifremi unuttum ile yeni şifre oluşturun' }, { status: 400 })
    }

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      return NextResponse.json({ error: 'Geçersiz email veya şifre' }, { status: 401 })
    }

    const token = await new SignJWT({ sub: user.id, email: user.email, role: 'customer' })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('30d')
      .sign(JWT_SECRET)

    const cookieStore: any = cookies()
    const store = cookieStore instanceof Promise ? await cookieStore : cookieStore
    store.set('customer_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 24 * 30 })

    return NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email } })
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Giriş yaparken bir hata oluştu' }, { status: 500 })
  }
}
