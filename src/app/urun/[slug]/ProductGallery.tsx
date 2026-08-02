'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export function ProductGallery({ images, alt }: { images: { url: string }[], alt: string }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center">
        <span className="text-gray-300">Görsel Yok</span>
      </div>
    )
  }

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  // Swipe handlers for mobile
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const minSwipeDistance = 40

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    if (distance > minSwipeDistance) nextImage() // Swipe left -> next
    if (distance < -minSwipeDistance) prevImage() // Swipe right -> prev
  }

  return (
    <div className="flex flex-col space-y-4">
      {/* Main Image Container */}
      <div 
        className="relative aspect-square bg-white rounded-lg border border-gray-100 flex items-center justify-center overflow-hidden group touch-pan-y select-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img 
          src={images[currentIndex].url} 
          alt={`${alt} - ${currentIndex + 1}`} 
          className="w-full h-full object-contain p-4 mix-blend-multiply" 
        />
        
        {images.length > 1 && (
          <>
            <button 
              onClick={(e) => { e.preventDefault(); prevImage(); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md md:opacity-0 md:group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft size={24} className="text-gray-800" />
            </button>
            <button 
              onClick={(e) => { e.preventDefault(); nextImage(); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md md:opacity-0 md:group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight size={24} className="text-gray-800" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
          {images.map((img, idx) => (
            <button 
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`flex-shrink-0 w-20 h-20 rounded-lg border-2 bg-white flex items-center justify-center overflow-hidden ${
                currentIndex === idx ? 'border-trust-blue-500' : 'border-gray-100 hover:border-gray-300'
              }`}
            >
              <img src={img.url} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover mix-blend-multiply" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
