import { cookies } from 'next/headers'
import { LoginForm } from './LoginForm'
import { Dashboard } from './Dashboard'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Admin Panel | Fodos",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const cookieStore = cookies()
  const session = cookieStore.get('admin_session')

  if (session?.value === 'authenticated') {
    return <Dashboard />
  }

  return <LoginForm />
}
