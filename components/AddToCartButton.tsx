'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/context/CartContext'
import { AnalyticsEvents } from '@/lib/analytics'

interface AddToCartButtonProps {
  item: {
    id: string
    name: string
    category: string
    price: number
    prepTime?: number
    image?: string
    specialInstructions?: string
  }
  variant?: 'card' | 'full'
}

export default function AddToCartButton({ item, variant = 'card' }: AddToCartButtonProps) {
  const { addItem, incrementItem, decrementItem, isInCart, getItemQuantity } = useCart()
  const [justAdded, setJustAdded] = useState(false)

  const inCart = isInCart(item.id)
  const quantity = getItemQuantity(item.id)

  useEffect(() => {
    if (justAdded) {
      const timer = setTimeout(() => setJustAdded(false), 1200)
      return () => clearTimeout(timer)
    }
  }, [justAdded])

  const py = variant === 'full' ? 'py-3.5 px-8 text-sm' : 'py-2.5 px-5 text-xs'

  // STATE 2 — Just Added
  if (justAdded) {
    return (
      <motion.div
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 0.3 }}
        className={`inline-flex items-center justify-center gap-2 bg-gold text-palace-black font-body font-semibold tracking-[0.18em] uppercase rounded-none ${py}`}
      >
        ✦ Added!
      </motion.div>
    )
  }

  // STATE 3 — In Cart (quantity controls)
  if (inCart && quantity > 0) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="qty"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-1"
        >
          <button
            onClick={() => decrementItem(item.id)}
            className="w-7 h-7 border border-gold/40 text-gold/70 hover:border-gold hover:text-gold hover:bg-gold/10 transition-all duration-200 flex items-center justify-center font-body text-base rounded-none"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="font-display text-sm text-gold w-6 text-center">{quantity}</span>
          <button
            onClick={() => incrementItem(item.id)}
            className="w-7 h-7 border border-gold/40 text-gold/70 hover:border-gold hover:text-gold hover:bg-gold/10 transition-all duration-200 flex items-center justify-center font-body text-base rounded-none"
            aria-label="Increase quantity"
          >
            +
          </button>
        </motion.div>
      </AnimatePresence>
    )
  }

  // STATE 1 — Not in cart
  return (
    <button
      onClick={() => {
        addItem(item)
        setJustAdded(true)
        AnalyticsEvents.addToCart(item.name, item.price)
      }}
      className={`border border-gold/50 text-gold font-body tracking-[0.18em] uppercase bg-transparent hover:bg-gold/10 hover:border-gold transition-all duration-300 rounded-none ${py}`}
    >
      Add to Order
    </button>
  )
}
