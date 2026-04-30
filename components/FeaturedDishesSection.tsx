'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { optimizedImage } from '@/sanity.client'
import type { MenuItem } from '@/types/sanity'

interface FeaturedDishesSectionProps {
  dishes: MenuItem[]
}

export default function FeaturedDishesSection({ dishes }: FeaturedDishesSectionProps) {
  if (!dishes || dishes.length === 0) return null

  // We use the first dish as the dramatic backdrop for the entire section
  const backdropDish = dishes[0]

  return (
    <section id="featured" className="relative min-h-[90vh] bg-palace-black flex flex-col items-center justify-center py-24 overflow-hidden">
      {/* Background Image Layer */}
      {backdropDish.image && (
        <motion.div 
          className="absolute inset-0 opacity-[0.15] z-0"
          initial={{ scale: 1.1 }}
          whileInView={{ scale: 1 }}
          transition={{ duration: 10, ease: 'easeOut' }}
          viewport={{ once: true }}
        >
          <Image
            src={optimizedImage(backdropDish.image, { width: 1920, height: 1080 })}
            alt="Signature Dish Backdrop"
            fill
            style={{ objectFit: 'cover' }}
          />
          {/* Gradients to fade out edges */}
          <div className="absolute inset-0 bg-gradient-to-t from-palace-black via-transparent to-palace-black" />
          <div className="absolute inset-0 bg-gradient-to-r from-palace-black via-transparent to-palace-black" />
        </motion.div>
      )}

      <div className="relative z-10 w-full max-w-7xl px-6 md:px-12 flex flex-col items-center">
        {/* Title Block */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="font-body text-xs tracking-[0.3em] uppercase text-gold-muted mb-4">Taste the Royalty</p>
          <h2 className="font-display text-4xl md:text-6xl text-white font-light">
            Palace <span className="text-shimmer italic">Signatures</span>
          </h2>
          <div className="mt-6 flex items-center justify-center w-full">
            <span className="w-16 h-px bg-gold/20" />
            <span className="mx-4 text-gold/50 text-xs">◆</span>
            <span className="w-16 h-px bg-gold/20" />
          </div>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 w-full">
          {dishes.slice(0, 6).map((dish, i) => (
            <motion.div
              key={dish._id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="group relative flex flex-col items-center text-center p-6 bg-palace-charcoal/40 border border-gold/10 hover:border-gold/30 transition-all duration-500 overflow-hidden"
            >
              {/* Image Container with Gold Trim */}
              <div className="relative w-full aspect-square mb-6 border-b border-gold/20 pb-6 overflow-hidden">
                <div className="w-full h-full relative rounded-t-full overflow-hidden">
                  <div className="absolute inset-0 border-[3px] border-double border-gold/20 rounded-t-full z-10 pointer-events-none transition-all group-hover:border-gold/50 duration-500" />
                  {dish.image ? (
                    <Image
                      src={optimizedImage(dish.image, { width: 400, height: 400 })}
                      alt={dish.name}
                      fill
                      style={{ objectFit: 'cover' }}
                      className="group-hover:scale-110 transition-transform duration-1000 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full bg-palace-smoke flex items-center justify-center">
                      <span className="text-gold/20 text-3xl">◆</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Text */}
              <h3 className="font-display text-2xl text-white group-hover:text-gold transition-colors duration-300">
                {dish.name}
              </h3>
              <p className="font-body text-xs tracking-widest text-gold-muted mt-2 mb-4 uppercase">
                {dish.category?.title ?? dish.category?.slug ?? ''}
              </p>
              {dish.description && (
                <p className="font-body text-sm text-white/50 line-clamp-2 mt-auto">
                  {dish.description}
                </p>
              )}
            </motion.div>
          ))}
        </div>

        {/* Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16"
        >
          <a
            href="/#menu"
            className="inline-block relative font-body text-xs tracking-[0.2em] uppercase text-gold hover:text-white transition-colors duration-300 px-8 py-4 border border-gold hover:bg-gold/10 overflow-hidden group"
          >
            <span className="relative z-10">Explore the Full Menu</span>
            <div className="absolute inset-0 bg-gold/5 scale-x-0 group-hover:scale-x-100 transform origin-left transition-transform duration-500 ease-out" />
          </a>
        </motion.div>
      </div>
    </section>
  )
}
