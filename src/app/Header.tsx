'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, ShoppingCart, Menu, X, Smartphone } from 'lucide-react'

import { SidebarNav } from './SidebarNav'

export function Header({ tree }: { tree: any[] }) {
  const [query, setQuery] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    const updateCartCount = () => {
      const existingCartStr = localStorage.getItem('cart')
      if (existingCartStr) {
        const cart = JSON.parse(existingCartStr)
        const count = cart.reduce((acc: number, item: any) => acc + (item.qty || 1), 0)
        setCartCount(count)
      } else {
        setCartCount(0)
      }
    }
    
    updateCartCount()
    window.addEventListener('cartUpdated', updateCartCount)
    return () => window.removeEventListener('cartUpdated', updateCartCount)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      window.location.href = `/arama?q=${encodeURIComponent(query)}`
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-2xl font-black text-trust-blue-600 tracking-tighter">
              FODOS<span className="text-action-orange-500">.</span>
            </Link>
          </div>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <form onSubmit={handleSearch} className="w-full relative">
              <input 
                type="text" 
                placeholder="Telefon kılıfı, batarya veya model arayın (Örn: iPhone 14 Pro Max)" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-4 pr-10 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-trust-blue-500 focus:border-transparent transition-shadow"
              />
              <button type="submit" className="absolute right-3 top-2.5 text-gray-400 hover:text-trust-blue-600">
                <Search size={20} />
              </button>
            </form>
          </div>

          {/* Right Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="flex flex-col items-end">
              <span className="text-xs text-gray-500 font-medium">WhatsApp Sipariş</span>
              <a href="tel:05322324499" className="text-sm font-bold text-gray-900">0532 232 44 99</a>
            </div>
            
            <Link href="/sepet" className="relative text-gray-700 hover:text-trust-blue-600 transition-colors">
              <ShoppingCart size={24} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-action-orange-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">{cartCount}</span>
              )}
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden space-x-4">
            <Link href="/sepet" className="relative text-gray-700">
              <ShoppingCart size={24} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-action-orange-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">{cartCount}</span>
              )}
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 hover:text-trust-blue-600 focus:outline-none"
            >
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white absolute w-full left-0 shadow-xl overflow-y-auto" style={{ maxHeight: 'calc(100vh - 64px)' }}>
          <div className="px-4 pt-4 pb-6 space-y-4">
            <form onSubmit={handleSearch} className="w-full relative">
              <input 
                type="text" 
                placeholder="Ürün arayın..." 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-trust-blue-500"
              />
              <button type="submit" className="absolute right-3 top-3.5 text-gray-400">
                <Search size={20} />
              </button>
            </form>
            
            <div className="bg-gray-50 rounded-xl overflow-hidden">
              <SidebarNav tree={tree} />
            </div>
            
            <div className="pt-4 flex flex-col items-center bg-gray-50 rounded-xl p-4">
              <span className="text-xs text-gray-500 mb-1">WhatsApp Sipariş Hattı</span>
              <a href="tel:05322324499" className="text-lg font-bold text-trust-blue-600">0532 232 44 99</a>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
