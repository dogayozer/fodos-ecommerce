'use client'

import { useState, useEffect } from 'react'

export default function SplashIntro() {
  const [showSplash, setShowSplash] = useState(false)
  const [isFadingOut, setIsFadingOut] = useState(false)

  useEffect(() => {
    // Sadece tarayıcıda çalışır
    const hasPlayed = sessionStorage.getItem('introPlayed')
    if (!hasPlayed) {
      setShowSplash(true)
      document.body.style.overflow = 'hidden' // Kaydırmayı engelle
    }
  }, [])

  const closeSplash = () => {
    setIsFadingOut(true)
    sessionStorage.setItem('introPlayed', 'true')
    setTimeout(() => {
      setShowSplash(false)
      document.body.style.overflow = 'auto' // Kaydırmayı geri aç
    }, 800) // 800ms fade-out animasyon süresi
  }

  if (!showSplash) return null

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center transition-opacity duration-800 ${
        isFadingOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <video
        src="/intro.mp4"
        autoPlay
        muted
        playsInline
        onEnded={closeSplash}
        className="w-full h-full object-cover"
      />
      
      {/* Atla Butonu */}
      <button
        onClick={closeSplash}
        className="absolute bottom-10 right-10 z-10 px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md border border-white/20 transition-all font-medium"
      >
        Geç
      </button>
    </div>
  )
}
