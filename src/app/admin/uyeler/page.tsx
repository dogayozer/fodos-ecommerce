import { UserManager } from './UserManager'

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Üyelik Yönetimi</h1>
      </div>
      <UserManager />
    </div>
  )
}
