import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'
import { cookies } from 'next/headers'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fodos-super-secret-customer-key')

export async function POST(req: Request) {
  try {
    const { name, email, phone, password, city, district, address } = await req.json()

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Ad, email ve şifre zorunludur' }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await prisma.customer.findUnique({
      where: { email }
    })

    if (existingUser) {
      if (existingUser.isGuest) {
        // Upgrade guest to registered user
        const hashedPassword = await bcrypt.hash(password, 10)
        const updatedUser = await prisma.customer.update({
          where: { email },
          data: {
            name,
            phone,
            password: hashedPassword,
            city,
            district,
            address,
            isGuest: false
          }
        })
        
        // Login immediately
        const token = await new SignJWT({ sub: updatedUser.id, email: updatedUser.email, role: 'customer' })
          .setProtectedHeader({ alg: 'HS256' })
          .setExpirationTime('30d')
          .sign(JWT_SECRET)

        const cookieStore: any = cookies()
        const store = cookieStore instanceof Promise ? await cookieStore : cookieStore
        store.set('customer_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 24 * 30 })

        return NextResponse.json({ success: true, user: { id: updatedUser.id, name: updatedUser.name, email: updatedUser.email } })
      }
      return NextResponse.json({ error: 'Bu email adresi ile zaten bir hesap var' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = await prisma.customer.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        city,
        district,
        address,
        isGuest: false
      }
    })

    // Login immediately
    const token = await new SignJWT({ sub: newUser.id, email: newUser.email, role: 'customer' })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('30d')
      .sign(JWT_SECRET)

    const cookieStore: any = cookies()
    const store = cookieStore instanceof Promise ? await cookieStore : cookieStore
    store.set('customer_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 24 * 30 })

    return NextResponse.json({ success: true, user: { id: newUser.id, name: newUser.name, email: newUser.email } })
  } catch (error: any) {
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Kayıt olurken bir hata oluştu' }, { status: 500 })
  }
}
