'use server'

import { cookies } from 'next/headers'

export async function login(formData: FormData) {
  const username = formData.get('username')
  const password = formData.get('password')

  if (username === 'Admin' && password === 'Pds135596') {
    const cookieStore = await cookies()
    cookieStore.set('admin_session', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    })
    return { success: true }
  }

  return { success: false, error: 'Hatalı kullanıcı adı veya şifre' }
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('admin_session')
}
