import { cookies } from 'next/headers'
import { LoginForm } from './LoginForm'
import { Dashboard } from './Dashboard'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Admin Panel | Fodos",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  try {
    const cookieStore: any = cookies()
    const store = cookieStore instanceof Promise ? await cookieStore : cookieStore
    const session = store.get('admin_session')

    if (session?.value === 'authenticated') {
      return <Dashboard />
    }

    return <LoginForm />
  } catch (error: any) {
    return (
      <div className="p-8 bg-white min-h-screen">
        <h1 className="text-2xl text-red-600 font-bold mb-4">Admin Page Error</h1>
        <pre className="bg-red-50 p-4 rounded text-sm text-red-900 border border-red-200 overflow-auto whitespace-pre-wrap">
          {error?.stack || error?.message || String(error)}
        </pre>
      </div>
    )
  }
}
