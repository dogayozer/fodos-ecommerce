'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'

export function HomeSearchForm() {
  const [brand, setBrand] = useState('')
  const [part, setPart] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const terms = []
    if (brand.trim()) terms.push(brand.trim())
    if (part.trim()) terms.push(part.trim())
    
    if (terms.length > 0) {
      const query = terms.join(' ')
      router.push(`/arama?q=${encodeURIComponent(query)}`)
    }
  }

  return (
    <form onSubmit={handleSearch} className="w-full bg-white p-4 sm:p-5 rounded-xl shadow-lg border border-trust-blue-100 flex flex-col sm:flex-row gap-3">
      <div className="flex-1">
        <input 
          type="text" 
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          placeholder="Hangi marka parçası arıyorsunuz?" 
          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-trust-blue-500 placeholder-gray-400"
        />
      </div>
      <div className="flex-1">
        <input 
          type="text" 
          value={part}
          onChange={(e) => setPart(e.target.value)}
          placeholder="Parça ismi yazın (isteğe bağlı)" 
          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-trust-blue-500 placeholder-gray-400"
        />
      </div>
      <div className="sm:self-end">
        <button 
          type="submit"
          className="w-full sm:w-auto bg-cta-background hover:bg-cta-hover text-white font-bold px-8 py-3 rounded-lg flex items-center justify-center transition-colors h-[46px]"
        >
          <Search size={18} className="mr-2" />
          Bul
        </button>
      </div>
    </form>
  )
}
