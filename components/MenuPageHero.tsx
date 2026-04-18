'use client'

import { motion } from 'framer-motion'

export default function MenuPageHero() {
  return (
    <section
      className="relative min-h-[42vh] flex items-center
                 justify-center overflow-hidden bg-palace-black
                 pt-20"
    >
      {/* Radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 70% at 50% 60%, ' +
            'rgba(201,168,76,0.07) 0%, ' +
            'rgba(125,26,26,0.04) 50%, ' +
            'transparent 70%)',
        }}
      />

      {/* Grain overlay */}
      <div className="grain-overlay" />

      {/* Top border line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            'linear-gradient(to right, transparent, ' +
            'rgba(201,168,76,0.3), transparent)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center px-6">

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="font-body text-[10px] tracking-[0.45em]
                     uppercase text-gold-muted mb-5"
        >
          HALAL · AUTHENTIC · BUFFALO, NY
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-display text-6xl md:text-8xl font-light
                     text-white tracking-widest mb-6"
        >
          The Royal{' '}
          <span className="text-shimmer">Menu</span>
        </motion.h1>

        {/* Ornamental row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex items-center justify-center gap-3 mb-6"
        >
          {['◆', '◇', '◆', '◇', '◆'].map((glyph, i) => (
            <span
              key={i}
              className="text-gold/30 text-[10px]"
            >
              {glyph}
            </span>
          ))}
        </motion.div>

        {/* Halal badges */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center
                     gap-6"
        >
          {[
            '✦ 100% Halal Certified',
            '✦ Fresh Daily',
            '✦ Made to Order',
          ].map(badge => (
            <span
              key={badge}
              className="font-body text-[10px] tracking-[0.2em]
                         uppercase text-white/30"
            >
              {badge}
            </span>
          ))}
        </motion.div>
      </div>

      {/* Bottom border line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background:
            'linear-gradient(to right, transparent, ' +
            'rgba(201,168,76,0.15), transparent)',
        }}
      />
    </section>
  )
}
