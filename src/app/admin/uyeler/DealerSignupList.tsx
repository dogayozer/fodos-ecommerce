'use client'

import { useState, useEffect } from 'react'

// "Bayi portalımız yakında" splash formundan gelen bülten kayıtları (fodos + MPM)
export function DealerSignupList() {
  const [signups, setSignups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/dealer-signups')
      .then(res => res.json())
      .then(data => setSignups(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-3">Bayi Bülteni Kayıtları ({signups.length})</h2>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Yükleniyor...</div>
        ) : signups.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Henüz bülten kaydı yok.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-4 font-semibold text-gray-600">Tarih</th>
                  <th className="p-4 font-semibold text-gray-600">Ad Soyad</th>
                  <th className="p-4 font-semibold text-gray-600">Telefon</th>
                  <th className="p-4 font-semibold text-gray-600">E-posta</th>
                  <th className="p-4 font-semibold text-gray-600">İşletme Türü</th>
                  <th className="p-4 font-semibold text-gray-600">Site</th>
                </tr>
              </thead>
              <tbody>
                {signups.map(s => (
                  <tr key={s.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 text-gray-600 whitespace-nowrap">
                      {new Date(s.createdAt).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="p-4 font-medium text-gray-900">{s.name || '-'}</td>
                    <td className="p-4 text-gray-600 font-mono">{s.phone}</td>
                    <td className="p-4 text-gray-600">{s.email || '-'}</td>
                    <td className="p-4 text-gray-600">{s.businessType || '-'}</td>
                    <td className="p-4">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-black uppercase ${
                        s.store === 'mpm' ? 'bg-indigo-100 text-indigo-700' : 'bg-trust-blue-100 text-trust-blue-600'
                      }`}>
                        {s.store === 'mpm' ? 'MPM' : 'Fodos'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
