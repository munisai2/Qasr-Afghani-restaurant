'use client'

import { motion } from 'framer-motion'
import { useRef } from 'react'
import { useParallax } from '@/hooks/useParallax'
import type { CombinedReview } from '@/types/reviews'

interface TestimonialsSectionProps {
  reviews:      CombinedReview[]
  googleRating: number | null
  totalCount:   number | null
}

export default function TestimonialsSection({ reviews, googleRating, totalCount }: TestimonialsSectionProps) {
  if (reviews.length === 0) {
    if (process.env.NODE_ENV === 'development') {
      console.info('[TestimonialsSection] No highlighted testimonials. Add reviews in Sanity Studio → Customer Reviews.')
    }
    return null
  }

  const containerRef = useRef<HTMLElement>(null)
  const yParallax = useParallax(containerRef, 0.4, 300)

  return (
    <section ref={containerRef} className="relative bg-palace-smoke py-20 md:py-28 px-6 md:px-16 border-t border-palace-stone overflow-hidden">
      {/* Parallax Background Monogram/Shape */}
      <motion.div 
        className="absolute -right-20 top-10 font-display text-[300px] text-palace-stone/10 pointer-events-none z-0"
        style={{ y: yParallax }}
      >
        Q
      </motion.div>
      <motion.div
        className="text-center mb-12 relative z-10"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        {googleRating !== null && (
          <div className="flex flex-col items-center justify-center mb-10">
            <div className="flex gap-1 mb-2">
              {Array.from({ length: Math.floor(googleRating) }).map((_, i) => (
                <span key={i} className="text-gold text-2xl">★</span>
              ))}
              {googleRating % 1 > 0 && (
                <div className="relative">
                  <span className="text-white/10 text-2xl">★</span>
                  <span 
                    className="text-gold text-2xl absolute left-0 top-0 overflow-hidden" 
                    style={{ width: `${(googleRating % 1) * 100}%` }}
                  >★</span>
                </div>
              )}
            </div>
            <p className="font-display text-5xl text-gold font-light mb-1">
              {googleRating.toFixed(1)}
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <div className="w-4 h-4 rounded-full bg-[#4285F4] flex items-center justify-center">
                <span className="text-white font-bold text-[10px] leading-none">G</span>
              </div>
              <p className="font-body text-xs text-cream/40 tracking-widest">
                {totalCount} reviews on Google
              </p>
            </div>
          </div>
        )}
        <p className="font-body text-xs tracking-[0.35em] uppercase text-gold-muted mb-4">
          WHAT OUR GUESTS SAY
        </p>
        <h2 className="font-display text-5xl md:text-6xl font-light text-white tracking-wide mb-4">
          Voices from the{' '}
          <span className="text-shimmer">Palace</span>
        </h2>
        <div className="relative flex items-center justify-center w-32 my-6 mx-auto">
          <div className="absolute inset-0 border-t border-gold/30 top-1/2" />
          <span className="relative bg-palace-smoke px-3 text-gold text-xs">◆</span>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Horizontal scroll container for all devices */}
        <div className="flex overflow-x-auto gap-4 md:gap-6 pb-8 pt-2 scrollbar-hide snap-x snap-mandatory">
          {reviews.map((t, i) => (
            <motion.div
              key={t.id}
              className="bg-palace-charcoal border border-palace-stone p-6 rounded-none min-w-[280px] md:min-w-[380px] max-w-[380px] flex-shrink-0 flex flex-col relative snap-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              whileHover={{ borderColor: 'rgba(201,168,76,0.4)', boxShadow: '0 8px 30px rgba(201,168,76,0.1)' }}
            >
              {/* Badge */}
              <div className="absolute top-4 right-4">
                {t.source === 'google' ? (
                  <span className="bg-blue-600/15 text-blue-400/80 border border-blue-600/20 px-2 py-0.5 font-body text-[9px] tracking-wide uppercase">
                    G Google
                  </span>
                ) : t.source === 'yelp' ? (
                  <span className="bg-red-600/15 text-red-400/80 border border-red-600/20 px-2 py-0.5 font-body text-[9px] tracking-wide uppercase">
                    ★ Yelp
                  </span>
                ) : (
                  <span className="bg-gold/10 text-gold/70 border border-gold/20 px-2 py-0.5 font-body text-[9px] tracking-wide uppercase">
                    ✦ Featured
                  </span>
                )}
              </div>

              {/* Stars */}
              <div className="flex gap-0.5 mb-3 mt-4">
                {Array.from({ length: t.rating ?? 0 }).map((_, si) => (
                  <span key={si} className="text-gold text-sm">★</span>
                ))}
                {Array.from({ length: 5 - (t.rating ?? 0) }).map((_, si) => (
                  <span key={si} className="text-white/10 text-sm">★</span>
                ))}
              </div>

              {/* Opening quote */}
              <span className="font-display text-5xl text-gold/20 leading-none">&ldquo;</span>

              {/* Quote text */}
              <p className="font-body text-sm text-white/60 leading-relaxed italic mt-2 line-clamp-5 flex-1">
                {t.quote}
              </p>

              {/* Bottom: author */}
              <div className="mt-4 flex flex-col">
                {t.url ? (
                  <a href={t.url} target="_blank" rel="noopener noreferrer" className="font-display text-sm text-white font-light hover:text-gold transition-colors">
                    {t.author}
                  </a>
                ) : (
                  <span className="font-display text-sm text-white font-light">{t.author}</span>
                )}
                {t.timeAgo && (
                  <span className="font-body text-[9px] text-cream/20 mt-0.5">{t.timeAgo}</span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
