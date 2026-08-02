'use client'

import { useState } from 'react'
import { login } from './actions'

export function LoginForm() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const formData = new FormData(e.currentTarget)
    const res = await login(formData)
    
    if (res.error) {
      setError(res.error)
      setLoading(false)
    } else {
      // Reload the page to reflect the server-side cookie change
      window.location.reload()
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg border border-gray-100">
        <h2 className="text-2xl font-bold text-center text-trust-blue-600 mb-6">Fodos Yönetim Paneli</h2>
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-risk-red-500 rounded-md text-sm border border-red-100">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kullanıcı Adı</label>
            <input 
              name="username" 
              type="text" 
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-trust-blue-500 focus:border-trust-blue-500" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Şifre</label>
            <input 
              name="password" 
              type="password" 
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-trust-blue-500 focus:border-trust-blue-500" 
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-2 px-4 bg-cta-background hover:bg-cta-hover text-white rounded-md transition-colors font-medium"
          >
            {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>
      </div>
    </div>
  )
}
