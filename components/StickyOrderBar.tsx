'use client'

import { useState } from 'react'
import { motion, useScroll, useMotionValueEvent } from 'framer-motion'
import { useCart } from '@/context/CartContext'

interface StickyOrderBarProps {
  restaurantName: string
}

export default function StickyOrderBar({ restaurantName }: StickyOrderBarProps) {
  const { scrollY } = useScroll()
  const [scrolled, setScrolled] = useState(false)
  const { itemCount, openCart } = useCart()

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setScrolled(latest >= 100)
  })

  // Only show when scrolled AND cart has items
  const visible = scrolled && itemCount > 0

  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      initial={{ y: 100, opacity: 0 }}
      animate={visible ? { y: 0, opacity: 1 } : { y: 100, opacity: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div className="bg-palace-charcoal/95 backdrop-blur-md border-t border-gold/20 px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="font-body text-xs text-white/50 truncate flex-1">
            {itemCount} item{itemCount > 1 ? 's' : ''} in your order
          </span>
          <button
            onClick={openCart}
            className="flex-shrink-0 bg-gold text-palace-black font-body text-xs tracking-widest uppercase px-5 py-3 rounded-none"
          >
            View Order →
          </button>
        </div>
      </div>
    </motion.div>
  )
}
