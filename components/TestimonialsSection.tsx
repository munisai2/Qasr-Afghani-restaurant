'use client'

import { motion } from 'framer-motion'
import type { Testimonial } from '@/types/sanity'

interface TestimonialsSectionProps {
  testimonials: Testimonial[]
}

export default function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  if (testimonials.length === 0) {
    if (process.env.NODE_ENV === 'development') {
      console.info('[TestimonialsSection] No highlighted testimonials. Add reviews in Sanity Studio → Customer Reviews.')
    }
    return null
  }

  return (
    <section className="bg-palace-smoke py-20 md:py-28 px-6 md:px-16 border-t border-palace-stone">
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
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

      <div className="max-w-7xl mx-auto">
        {/* Mobile: horizontal scroll / Desktop: grid */}
        <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6 md:overflow-visible md:pb-0">
          {testimonials.map((t, i) => (
            <motion.div
              key={t._id}
              className="bg-palace-charcoal border border-palace-stone p-6 rounded-none min-w-[280px] sm:min-w-0 flex flex-col"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              whileHover={{ borderColor: 'rgba(201,168,76,0.4)', boxShadow: '0 8px 30px rgba(201,168,76,0.1)' }}
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-3">
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

              {/* Bottom: author + source */}
              <div className="flex justify-between items-end mt-4">
                <span className="font-display text-sm text-white font-light">{t.author}</span>
                {t.source && (
                  <span className="font-body text-[9px] tracking-widest uppercase text-gold-muted border border-gold/20 px-2 py-0.5">
                    {t.source}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
