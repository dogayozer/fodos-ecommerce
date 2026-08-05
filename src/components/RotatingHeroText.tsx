'use client'

import { useState, useEffect } from 'react'

const messages = [
  {
    titleLine1: "Cihazınızı Çöpe Atmayın.",
    titleLine2: "Güvenle Yenileyin.",
    subtitle: "Özensiz gönderilen, kontrol edilmeyen parçaların neden olduğu emek israfı ve anakart hasarı risklerinden korunun. Sertifikalı parçalarla cihazınızın ömrünü uzatın."
  },
  {
    titleLine1: "Sirkeci'nin Köklü Esnaflığıyla",
    titleLine2: "Güvenle Alışveriş",
    subtitle: "30 yıllık esnaf tecrübesiyle, özenle seçilmiş ve güvenilir parçalara ulaşın."
  },
  {
    titleLine1: "Orijinal ve Sertifikalı",
    titleLine2: "Yedek Parça Tedariği",
    subtitle: "Sirkeci'den 30 Yıllık Esnaf Güveniyle Yanınızdayız. Siparişleriniz aynı gün kargoda."
  }
]

export function RotatingHeroText() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFadingOut, setIsFadingOut] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      // Start fade out
      setIsFadingOut(true)
      
      // Wait for fade out to complete (500ms), then change text and fade in
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % messages.length)
        setIsFadingOut(false)
      }, 500) // 500ms transition duration
      
    }, 4500) // Change every 4.5 seconds

    return () => clearInterval(timer)
  }, [])

  const currentMessage = messages[currentIndex]

  return (
    <div className="min-h-[220px] md:min-h-[200px] flex flex-col justify-start">
      <div 
        className={`transition-opacity duration-500 ease-in-out ${isFadingOut ? 'opacity-0' : 'opacity-100'}`}
      >
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
          {currentMessage.titleLine1}
          <span className="block text-trust-blue-100 mt-2">{currentMessage.titleLine2}</span>
        </h1>
        
        <p className="text-lg md:text-xl text-trust-blue-50 max-w-lg leading-relaxed mt-6">
          {currentMessage.subtitle}
        </p>
      </div>
    </div>
  )
}
