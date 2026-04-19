'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/context/CartContext'

export default function ViewCartHeroButton() {
  const { itemCount, openCart } = useCart()

  return (
    <AnimatePresence mode="wait">
      {itemCount > 0 ? (
        <motion.button
          key="view-order"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          onClick={openCart}
          className="group relative overflow-hidden inline-flex w-full sm:w-auto justify-center items-center gap-3 bg-gold text-palace-black font-body font-semibold text-sm tracking-[0.25em] uppercase px-10 py-4 rounded-none border border-gold"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path d="M2 19l2-9 4 4 4-8 4 8 4-4 2 9H2z" />
          </svg>
          <span className="relative z-10">View Your Order ({itemCount})</span>
        </motion.button>
      ) : (
        <motion.a
          key="explore-menu"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          href="#menu"
          className="inline-flex w-full sm:w-auto justify-center items-center gap-2 border border-gold/50 text-gold font-body text-sm tracking-[0.2em] uppercase px-8 py-4 rounded-none hover:bg-gold/10 hover:border-gold transition-all duration-300"
        >
          Explore Our Menu ↓
        </motion.a>
      )}
    </AnimatePresence>
  )
}
