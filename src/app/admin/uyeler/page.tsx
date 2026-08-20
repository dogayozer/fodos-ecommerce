import { UserManager } from './UserManager'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin" className="p-2 hover:bg-gray-100 rounded-full transition-colors" title="Panele Dön">
          <ArrowLeft size={24} className="text-gray-600" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Üyelik Yönetimi</h1>
      </div>
      <UserManager />
    </div>
  )
}
