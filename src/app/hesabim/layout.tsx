import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Package, User, LogOut } from 'lucide-react'

export default async function HesabimLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')

  if (!token) {
    redirect('/giris')
  }

  return (
    <div className="flex-1 bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Menu */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 bg-trust-blue-600 text-white font-bold">
              Hesabım
            </div>
            <nav className="flex flex-col">
              <Link href="/hesabim" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 border-b">
                <User size={18} /> Profil Bilgilerim
              </Link>
              <Link href="/hesabim/siparislerim" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 border-b">
                <Package size={18} /> Siparişlerim ve Kargo Takip
              </Link>
              <form action={async () => {
                'use server'
                const cs = await cookies()
                cs.delete('auth_token')
                redirect('/giris')
              }}>
                <button type="submit" className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 text-left w-full">
                  <LogOut size={18} /> Çıkış Yap
                </button>
              </form>
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  )
}
