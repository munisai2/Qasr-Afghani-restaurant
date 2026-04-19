'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { GalleryImage } from '@/types/sanity'
import { optimizedImage } from '@/sanity.client'

// ══════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════
interface GallerySectionProps {
  images: GalleryImage[]
}

export default function GallerySection({ images: items }: GallerySectionProps) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const scrollByAmount = (offset: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' })
    }
  }

  return (
    <section
      id="gallery"
      className="relative bg-palace-charcoal py-24 border-t border-palace-stone overflow-hidden"
    >
      <div className="px-6 md:px-14 mb-12">
        <p className="font-body text-[9px] tracking-[0.45em] uppercase text-gold-muted mb-3">
          THE PALACE EXPERIENCE
        </p>
        <h2 className="font-display text-4xl md:text-5xl font-light text-white tracking-wide leading-none">
          Our Gallery
        </h2>
      </div>

      {/* HORIZONTAL SWIPE CONTAINER */}
      <div className="relative w-full overflow-hidden group">
        <div 
          ref={scrollRef}
          className="flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-6 md:px-14 pb-8"
        >
          {items.map((item, i) => (
            <GalleryCard
              key={i}
              item={item}
              onClick={() => setLightboxIdx(i)}
            />
          ))}
        </div>
      </div>

      {/* LARGE ANIMATED SCROLL ARROWS UNDERNEATH */}
      <div className="flex justify-center items-center gap-8 mt-6 md:mt-10 px-6">
        <motion.button 
          onClick={() => scrollByAmount(-window.innerWidth * 0.5)} 
          className="w-16 h-16 flex items-center justify-center rounded-full border border-palace-stone text-gold/80 hover:bg-gold hover:text-palace-black hover:border-gold transition-colors duration-300"
          aria-label="Scroll left"
          whileHover={{ x: -6, scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="text-2xl mt-[-2px]">←</span>
        </motion.button>
        
        <div className="h-px bg-palace-stone w-16 hidden md:block" />
        
        <motion.button 
          onClick={() => scrollByAmount(window.innerWidth * 0.5)} 
          className="w-16 h-16 flex items-center justify-center rounded-full border border-palace-stone text-gold/80 hover:bg-gold hover:text-palace-black hover:border-gold transition-colors duration-300"
          aria-label="Scroll right"
          whileHover={{ x: 6, scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="text-2xl mt-[-2px]">→</span>
        </motion.button>
      </div>

      {/* LIGHTBOX */}
      <AnimatePresence>
        {lightboxIdx !== null && (
          <GalleryLightbox
            items={items}
            startIndex={lightboxIdx}
            onClose={() => setLightboxIdx(null)}
          />
        )}
      </AnimatePresence>
    </section>
  )
}

// ══════════════════════════════════════════════════════
// GALLERY CARD
// ══════════════════════════════════════════════════════
interface GalleryCardProps {
  item: GalleryImage
  onClick: () => void
}

function GalleryCard({ item, onClick }: GalleryCardProps) {
  const [isShimmering, setIsShimmering] = useState(false)

  const handleCardClick = () => {
    if (isShimmering) return
    setIsShimmering(true)
    setTimeout(() => {
      setIsShimmering(false)
      onClick()
    }, 400)
  }

  const isVideo = item._type === 'videoEmbed' || item.url
  const cardWidth = isVideo 
    ? 'w-[85vw] sm:w-[60vw] md:w-[45vw] lg:w-[35vw]'
    : 'w-[75vw] sm:w-[50vw] md:w-[35vw] lg:w-[25vw]'

  return (
    <div
      className={`
        relative flex-shrink-0 snap-center
        h-[50vh] md:h-[60vh] overflow-hidden
        group cursor-pointer border border-palace-stone/30
        ${cardWidth}
      `}
      onClick={handleCardClick}
      data-cursor-label="View"
    >
      {(item._type === 'image' || !item._type) && item.asset ? (
        <>
          <Image
            src={optimizedImage(item, { width: 700, height: 900 })}
            alt={item.caption ?? 'Gallery image'}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            style={{ objectFit: 'cover' }}
            className="transition-transform duration-700 group-hover:scale-[1.05]"
          />

          <div
            className="absolute inset-0 transition-opacity duration-300"
            style={{
              background: 'linear-gradient(to top, rgba(12,10,8,0.85) 0%, transparent 60%)',
            }}
          />

          <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <p className="font-body text-xs tracking-wide text-white/90 leading-relaxed">
              {item.caption}
            </p>
          </div>
          
          <div className="absolute inset-0 pointer-events-none transition-shadow duration-300 group-hover:shadow-[inset_0_0_0_1px_rgba(201,168,76,0.35)]" />
          
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
            <div className="w-8 h-8 flex items-center justify-center text-gold border border-gold/40 bg-palace-black/60 rounded-full backdrop-blur-sm">
              ↗
            </div>
          </div>
        </>
      ) : (
        <>
          {item.url ? (
            item.url.includes('youtube') || item.url.includes('youtu.be') ? (
              <iframe
                src={item.url}
                className="w-full h-full pointer-events-none scale-[1.02]"
                style={{ border: 0 }}
                allow="autoplay; encrypted-media"
                title={item.caption ?? 'Video'}
              />
            ) : (
              <video
                src={item.url}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover scale-[1.02]"
              />
            )
          ) : (
            <div className="w-full h-full bg-palace-smoke flex items-center justify-center">
              <span className="text-white/20 text-4xl">🎬</span>
            </div>
          )}

          <div className="absolute inset-0 pointer-events-none" style={{ background: 'rgba(12,10,8,0.2)' }} />

          <div
            className="absolute bottom-0 left-0 right-0 px-4 py-4"
            style={{ background: 'linear-gradient(to top, rgba(12,10,8,0.9), transparent)' }}
          >
            <p className="font-body text-[10px] text-white/80 tracking-wide uppercase flex items-center gap-2">
              <span className="text-gold">▶</span> {item.caption || "Video Feature"}
            </p>
          </div>
        </>
      )}

      <AnimatePresence>
        {isShimmering && (
          <motion.div
            className="absolute inset-0 z-20 pointer-events-none"
            style={{ background: 'linear-gradient(transparent 0%, rgba(201,168,76,0.15) 40%, rgba(255,107,26,0.1) 60%, transparent 100%)' }}
            initial={{ opacity: 0, scaleY: 0.8 }}
            animate={{ opacity: 1, scaleY: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ══════════════════════════════════════════════════════
// LIGHTBOX
// ══════════════════════════════════════════════════════
interface LightboxProps {
  items: GalleryImage[]
  startIndex: number
  onClose: () => void
}

function GalleryLightbox({ items, startIndex, onClose }: LightboxProps) {
  const [current, setCurrent] = useState(startIndex)
  const item = items[current]

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') setCurrent(c => Math.min(c + 1, items.length - 1))
      if (e.key === 'ArrowLeft') setCurrent(c => Math.max(c - 1, 0))
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [items.length, onClose])

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ background: 'rgba(12,10,8,0.96)' }}
    >
      <button
        className="absolute top-5 right-5 z-10 w-12 h-12 border border-palace-stone/50 bg-palace-black/50 backdrop-blur-sm flex items-center justify-center text-white/60 hover:text-gold hover:border-gold transition-all duration-300 rounded-full"
        onClick={onClose}
        aria-label="Close gallery"
      >
        ✕
      </button>

      <p className="absolute top-6 left-1/2 -translate-x-1/2 font-body text-[11px] tracking-[0.2em] text-white/40 uppercase">
        {current + 1} / {items.length}
      </p>

      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          className="relative w-full max-w-5xl max-h-[85vh] mx-4 md:mx-12 overflow-hidden rounded-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          onClick={e => e.stopPropagation()}
        >
          {(!item._type || item._type === 'image') && item.asset ? (
            <div className="relative w-full h-[70vh] md:h-[80vh]">
              <Image
                src={optimizedImage(item, { width: 1600, height: 1200 })}
                alt={item.caption ?? 'Gallery Image'}
                fill
                sizes="100vw"
                style={{ objectFit: 'contain' }}
                priority
              />
            </div>
          ) : item.url ? (
            <div className="w-full h-[70vh] md:h-[80vh] flex items-center justify-center bg-black">
              {item.url.includes('youtube') || item.url.includes('youtu.be') ? (
                <iframe
                  src={item.url}
                  className="w-full h-full max-w-4xl max-h-full aspect-video"
                  allowFullScreen
                  title={item.caption ?? 'Video'}
                />
              ) : (
                <video
                  src={item.url}
                  controls
                  autoPlay
                  className="max-w-full max-h-full aspect-video object-contain"
                />
              )}
            </div>
          ) : null}

          {item.caption && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-center">
              <p className="font-body text-sm text-white/80 tracking-wide mt-4">
                {item.caption}
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {current > 0 && (
        <button
          className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 border border-palace-stone/50 bg-palace-black/50 backdrop-blur-sm flex items-center justify-center text-white/60 hover:text-gold hover:border-gold transition-all duration-300 rounded-full"
          onClick={e => { e.stopPropagation(); setCurrent(c => c - 1) }}
        >
          ←
        </button>
      )}

      {current < items.length - 1 && (
        <button
          className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 border border-palace-stone/50 bg-palace-black/50 backdrop-blur-sm flex items-center justify-center text-white/60 hover:text-gold hover:border-gold transition-all duration-300 rounded-full"
          onClick={e => { e.stopPropagation(); setCurrent(c => c + 1) }}
        >
          →
        </button>
      )}
    </motion.div>
  )
}
