'use client'

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { Search, ShoppingCart, Menu, X, Smartphone, User, LogOut } from 'lucide-react'

import { SidebarNav } from './SidebarNav'

export function Header({ tree }: { tree: any[] }) {
  const [query, setQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me')
        const data = await res.json()
        if (data.user) {
          setUser(data.user)
        }
      } catch (e) {}
    }
    fetchUser()
  }, [])

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
      let searchUrl = `/arama?q=${encodeURIComponent(query)}`
      if (selectedCategory) {
        searchUrl += `&category=${encodeURIComponent(selectedCategory)}`
      }
      window.location.href = searchUrl
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    window.location.reload()
  }

  return (
    <header className="bg-neutral-0 border-b border-neutral-200 sticky top-0 z-40">
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
            <form onSubmit={handleSearch} className="w-full relative flex items-center shadow-[var(--shadow-card)] rounded-full border border-neutral-200 bg-neutral-0 focus-within:ring-2 focus-within:ring-trust-blue-500 overflow-hidden">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-neutral-100 text-neutral-900 h-full py-2 pl-4 pr-8 border-none focus:ring-0 text-sm font-medium border-r border-neutral-200 cursor-pointer"
              >
                <option value="">Tüm Kategoriler</option>
                {tree.map(cat => (
                  <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Telefon kılıfı, batarya veya model arayın..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 px-4 py-2 border-none focus:ring-0 outline-none w-full"
              />
              <button type="submit" className="px-4 text-neutral-500 hover:text-trust-blue-600">
                <Search size={20} />
              </button>
            </form>
          </div>

          {/* Right Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="flex flex-col items-end mr-2">
              <span className="text-xs text-neutral-500 font-medium">WhatsApp Sipariş</span>
              <a href="tel:05322324499" className="text-sm font-bold text-neutral-900">0532 232 44 99</a>
            </div>

            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex flex-col text-right">
                  <span className="text-xs text-neutral-500">Hoş geldin,</span>
                  <Link href="/hesabim" className="text-sm font-bold text-neutral-900 hover:text-trust-blue-600 transition-colors" title="Hesabım">{user.name?.split(' ')[0]}</Link>
                </div>
                <button onClick={handleLogout} className="text-neutral-500 hover:text-risk-red-500 transition-colors" title="Çıkış Yap">
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Link href="/giris" className="flex items-center text-neutral-900 hover:text-trust-blue-600 transition-colors font-medium text-sm">
                <User size={20} className="mr-1.5" />
                Giriş / Üye Ol
              </Link>
            )}

            <Link href="/sepet" className="relative text-neutral-900 hover:text-trust-blue-600 transition-colors ml-4">
              <ShoppingCart size={24} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-action-orange-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">{cartCount}</span>
              )}
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden space-x-4">
            <Link href="/sepet" className="relative text-neutral-900">
              <ShoppingCart size={24} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-action-orange-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">{cartCount}</span>
              )}
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-neutral-900 hover:text-trust-blue-600 focus:outline-none"
            >
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-200 bg-neutral-0 absolute w-full left-0 shadow-[var(--shadow-float)] overflow-y-auto" style={{ maxHeight: 'calc(100vh - 64px)' }}>
          <div className="px-4 pt-4 pb-6 space-y-4">
            <form onSubmit={handleSearch} className="w-full relative">
              <input
                type="text"
                placeholder="Ürün arayın..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-4 pr-10 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-trust-blue-500"
              />
              <button type="submit" className="absolute right-3 top-3.5 text-neutral-500">
                <Search size={20} />
              </button>
            </form>

            <div className="bg-neutral-50 rounded-xl overflow-hidden">
              <Suspense fallback={<div className="p-4 text-center text-sm text-neutral-500">Yükleniyor...</div>}>
                <SidebarNav tree={tree} onNavigate={() => setMobileMenuOpen(false)} />
              </Suspense>
            </div>

            <div className="pt-2 border-t border-neutral-200">
              {user ? (
                <div className="flex justify-between items-center py-2 px-2">
                  <div className="flex items-center">
                    <User size={20} className="text-neutral-500 mr-2" />
                    <Link href="/hesabim" className="font-semibold text-trust-blue-600">Hesabım ({user.name})</Link>
                  </div>
                  <button onClick={handleLogout} className="text-risk-red-500 text-sm font-medium px-3 py-1 bg-risk-red-500/10 rounded-lg">Çıkış Yap</button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Link href="/giris" className="text-center py-2 bg-neutral-100 rounded-lg font-medium text-sm text-neutral-900">Giriş Yap</Link>
                  <Link href="/kayit-ol" className="text-center py-2 bg-trust-blue-600 text-white rounded-lg font-medium text-sm">Üye Ol</Link>
                </div>
              )}
            </div>

            <div className="pt-4 flex flex-col items-center bg-neutral-50 rounded-xl p-4">
              <span className="text-xs text-neutral-500 mb-1">WhatsApp Sipariş Hattı</span>
              <a href="tel:05322324499" className="text-lg font-bold text-trust-blue-600">0532 232 44 99</a>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
