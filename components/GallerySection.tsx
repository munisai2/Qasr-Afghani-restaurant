'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { optimizedImage } from '@/sanity.client'
import type { GalleryImage } from '@/types/sanity'

interface GallerySectionProps {
  images: GalleryImage[]
}

export default function GallerySection({ images }: GallerySectionProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const openLightbox = (i: number) => setLightboxIndex(i)
  const closeLightbox = useCallback(() => setLightboxIndex(null), [])
  const goNext = useCallback(() => {
    setLightboxIndex((prev) => (prev !== null ? (prev + 1) % images.length : null))
  }, [images.length])
  const goPrev = useCallback(() => {
    setLightboxIndex((prev) => (prev !== null ? (prev - 1 + images.length) % images.length : null))
  }, [images.length])

  // Keyboard navigation
  useEffect(() => {
    if (lightboxIndex === null) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft') goPrev()
    }
    window.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [lightboxIndex, closeLightbox, goNext, goPrev])

  if (images.length === 0) return null

  return (
    <section id="gallery" className="bg-palace-smoke py-24 md:py-32 border-t border-palace-stone">
      {/* Section Header */}
      <motion.div
        className="text-center px-6 mb-12"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <p className="font-body text-xs tracking-[0.35em] uppercase text-gold-muted mb-4">
          THE PALACE EXPERIENCE
        </p>
        <h2 className="font-display text-5xl md:text-6xl font-light text-white tracking-wide mb-4">
          A Feast for the{' '}
          <span className="text-shimmer">Eyes</span>
        </h2>
        <div className="relative flex items-center justify-center w-32 my-8 mx-auto">
          <div className="absolute inset-0 border-t border-gold/30 top-1/2" />
          <span className="relative bg-palace-smoke px-3 text-gold text-xs">◆</span>
        </div>
      </motion.div>

      {/* Gallery Grid */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1">
          {images.map((img, i) => (
            <motion.div
              key={i}
              className={`relative overflow-hidden cursor-pointer ${
                i === 0 ? 'col-span-2 row-span-2' : ''
              } aspect-square`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, delay: i * 0.05 }}
              onClick={() => openLightbox(i)}
            >
              <motion.div
                className="relative w-full h-full"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              >
                <Image
                  src={optimizedImage(img, { width: 600, height: 600 })}
                  alt={img.caption || `Gallery photo ${i + 1}`}
                  fill
                  sizes="(max-width: 768px) 50vw, 600px"
                  style={{ objectFit: 'cover' }}
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-palace-black/80 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 flex items-end">
                  {img.caption && (
                    <p className="font-body text-xs text-gold/80 tracking-wide p-3">
                      {img.caption}
                    </p>
                  )}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            className="fixed inset-0 z-[200] bg-palace-black/95 backdrop-blur-sm flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLightbox}
          >
            <div
              className="relative max-w-4xl w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close */}
              <button
                onClick={closeLightbox}
                className="absolute -top-12 right-0 text-gold text-2xl hover:text-gold-light transition-colors z-10"
                aria-label="Close lightbox"
              >
                ✕
              </button>

              {/* Image */}
              <motion.div
                key={lightboxIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="relative aspect-[4/3]"
              >
                <Image
                  src={optimizedImage(images[lightboxIndex], { width: 1200, height: 900 })}
                  alt={images[lightboxIndex].caption || 'Gallery photo'}
                  fill
                  sizes="100vw"
                  style={{ objectFit: 'contain' }}
                />
              </motion.div>

              {/* Caption */}
              {images[lightboxIndex].caption && (
                <p className="text-center font-body text-sm text-white/50 mt-4">
                  {images[lightboxIndex].caption}
                </p>
              )}

              {/* Navigation arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={goPrev}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-14 w-10 h-10 border border-gold/40 bg-palace-black flex items-center justify-center text-gold hover:border-gold hover:bg-gold/10 transition-all duration-300"
                    aria-label="Previous image"
                  >
                    ←
                  </button>
                  <button
                    onClick={goNext}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-14 w-10 h-10 border border-gold/40 bg-palace-black flex items-center justify-center text-gold hover:border-gold hover:bg-gold/10 transition-all duration-300"
                    aria-label="Next image"
                  >
                    →
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
