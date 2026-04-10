'use client'

import { motion } from 'framer-motion'
import { useCart } from '@/context/CartContext'
import { AnalyticsEvents } from '@/lib/analytics'

export default function CartNavButton() {
  const { itemCount, openCart } = useCart()

  return (
    <button
      onClick={() => { openCart(); AnalyticsEvents.openCart() }}
      className="relative p-2 text-white/60 hover:text-gold transition-colors duration-300"
      aria-label={`View cart with ${itemCount} items`}
    >
      {/* Serving cloche icon */}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <path d="M3 13h18M5 13V9a7 7 0 0114 0v4M2 17h20v2a1 1 0 01-1 1H3a1 1 0 01-1-1v-2z" />
      </svg>

      {/* Badge */}
      {itemCount > 0 && (
        <motion.span
          key={itemCount}
          animate={{ scale: [1.4, 1] }}
          transition={{ duration: 0.2 }}
          className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-gold text-palace-black rounded-full font-body text-[9px] font-bold flex items-center justify-center"
        >
          {itemCount}
        </motion.span>
      )}
    </button>
  )
}
