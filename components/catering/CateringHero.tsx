'use client'

import { motion } from 'framer-motion'
import type { RestaurantInfo } from '@/types/sanity'

export default function CateringHero({ info }: { info: RestaurantInfo | null }) {
  return (
    <div className="relative overflow-hidden min-h-[60vh] flex flex-col items-center justify-center px-6">
      <div className="absolute inset-0 bg-palace-black z-0" />
      <div className="grain-overlay absolute inset-0 z-[1]" />
      <div className="absolute inset-0 z-[2]" style={{ background: 'radial-gradient(ellipse 90% 70% at 50% 50%, rgba(201,168,76,0.12) 0%, rgba(201,168,76,0.04) 40%, transparent 70%)' }} />
      <div className="absolute inset-0 z-[3]" style={{ background: 'radial-gradient(ellipse 100% 100% at 50% 50%, transparent 40%, rgba(10,8,5,0.7) 100%)' }} />

      <div className="relative z-10 text-center max-w-3xl">
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
          className="font-body text-xs tracking-[0.3em] uppercase text-gold-muted">
          PRIVATE EVENTS  ·  BUFFALO, NY
        </motion.p>

        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.3 }}
          className="font-display text-5xl md:text-7xl font-light text-white tracking-widest mt-6">
          Host a <span className="text-shimmer">Royal</span> Feast
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }}
          className="font-display italic text-xl text-white/50 mt-4 max-w-xl mx-auto text-center">
          Authentic Afghan hospitality for your most important occasions.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.7 }}
          className="relative flex items-center justify-center w-32 my-8 mx-auto">
          <div className="absolute inset-0 border-t border-gold/30 top-1/2" />
          <span className="relative bg-palace-black px-3 text-gold text-xs">◆</span>
        </motion.div>

        <motion.a href="#quote-form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.9 }}
          className="inline-flex items-center gap-2 border border-gold/50 text-gold font-body text-sm tracking-[0.2em] uppercase px-8 py-4 rounded-none hover:bg-gold/10 hover:border-gold transition-all duration-300">
          Request a Quote ↓
        </motion.a>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}
        className="absolute bottom-8 left-0 right-0 px-8 md:px-16 z-10 hidden md:flex items-center justify-center gap-8">
        <span className="font-body text-xs text-white/25 tracking-widest uppercase">Minimum 20 Guests</span>
        <span className="text-gold/20 text-xs">◆</span>
        <span className="font-body text-xs text-white/25 tracking-widest uppercase">Custom Menus Available</span>
        <span className="text-gold/20 text-xs">◆</span>
        <span className="font-body text-xs text-white/25 tracking-widest uppercase">Buffalo, NY</span>
      </motion.div>
    </div>
  )
}
