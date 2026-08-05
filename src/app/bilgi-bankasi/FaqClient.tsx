'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FAQ } from '@/lib/markdown'
import { Search, ChevronRight } from 'lucide-react'

export function FaqClient({ faqs }: { faqs: FAQ[] }) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredFaqs = faqs.filter(faq => {
    const term = searchTerm.toLowerCase()
    return faq.title.toLowerCase().includes(term) || faq.content.toLowerCase().includes(term)
  })

  return (
    <div>
      <div className="relative mb-10 max-w-2xl mx-auto">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-11 pr-4 py-4 bg-white border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-trust-blue-500 shadow-sm"
          placeholder="Aklınıza takılan bir soruyu veya kelimeyi arayın..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq) => (
            <Link 
              href={`/bilgi-bankasi/${faq.slug}`} 
              key={faq.slug}
              className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-trust-blue-200 transition-all flex flex-col justify-between group"
            >
              <div>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-trust-blue-600 mb-2 line-clamp-2">
                  {faq.title}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-3">
                  {faq.content}
                </p>
              </div>
              <div className="mt-4 flex items-center text-sm font-semibold text-trust-blue-600">
                <span>Devamını Oku</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-1 md:col-span-2 text-center py-12 bg-white rounded-xl border border-gray-100">
            <p className="text-gray-500">Aramanızla eşleşen bir sonuç bulunamadı.</p>
          </div>
        )}
      </div>
    </div>
  )
}
