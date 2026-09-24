'use server'

import { cookies } from 'next/headers'
import {
  ADMIN_USERNAME,
  ADMIN_PASSWORD,
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE,
  createAdminSessionToken,
} from '@/lib/adminSession'

export async function login(formData: FormData) {
  const username = formData.get('username')
  const password = formData.get('password')

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const cookieStore: any = cookies()
    const store = cookieStore instanceof Promise ? await cookieStore : cookieStore
    store.set(ADMIN_SESSION_COOKIE, await createAdminSessionToken(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: ADMIN_SESSION_MAX_AGE,
      path: '/',
    })
    return { success: true }
  }

  return { success: false, error: 'Hatalı kullanıcı adı veya şifre' }
}

export async function logout() {
  const cookieStore: any = cookies()
  const store = cookieStore instanceof Promise ? await cookieStore : cookieStore
  store.delete(ADMIN_SESSION_COOKIE)
}
