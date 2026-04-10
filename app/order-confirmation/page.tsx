'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

interface SavedOrder {
  orderId: string
  items: Array<{ id: string; name: string; quantity: number; price: number; specialInstructions?: string }>
  orderType: 'pickup'
  subtotal: number
  tax: number
  total: number
  customer: { firstName: string; lastName: string; phone: string; email: string }
  specialRequests: string
  placedAt: string
}

export default function OrderConfirmationPage() {
  const router = useRouter()
  const [order, setOrder] = useState<SavedOrder | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const saved = sessionStorage.getItem('qasr-last-order')
      if (saved) {
        setOrder(JSON.parse(saved))
      } else {
        router.replace('/')
      }
    } catch {
      router.replace('/')
    }
  }, [router])

  if (!mounted || !order) return null

  const placedTime = new Date(order.placedAt).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', hour12: true,
  })

  return (
    <div className="min-h-screen bg-palace-black flex flex-col items-center justify-center px-6 py-20 text-center relative overflow-hidden">
      {/* Grain overlay */}
      <div className="grain-overlay absolute inset-0 z-0" />

      {/* Watermark */}
      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-display italic text-gold/[0.04] text-[12rem] md:text-[18rem] select-none pointer-events-none z-0 whitespace-nowrap">
        Qasr Afghan
      </span>

      <div className="relative z-10 max-w-lg w-full">
        {/* Animated Checkmark */}
        <svg viewBox="0 0 80 80" className="w-20 h-20 mx-auto mb-2" fill="none">
          <motion.circle
            cx="40" cy="40" r="36" stroke="#C9A84C" strokeWidth="1.5"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
          <motion.path
            d="M24 42l10 10 22-24" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.7, ease: 'easeOut' }}
          />
        </svg>

        <h1 className="font-display text-4xl md:text-5xl font-light text-white mt-6">Order Placed</h1>
        <p className="font-display text-2xl text-shimmer tracking-widest mt-2">#{order.orderId}</p>

        {/* Message */}
        <p className="font-body text-sm text-white/50 leading-relaxed max-w-sm mx-auto mt-4">
          Your order is being prepared.<br />Please come to the counter in approximately 25–35 minutes.
        </p>

        {/* Phone Box */}
        <div className="border border-gold/20 bg-gold/5 px-6 py-4 mt-8 max-w-sm mx-auto flex items-center gap-3">
          <svg viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.5" className="w-5 h-5 flex-shrink-0">
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.362 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0122 16.92z" />
          </svg>
          <p className="font-body text-sm text-white/60 text-left">
            We will call {order.customer.firstName} at{' '}
            <span className="text-gold">{order.customer.phone}</span>{' '}
            to confirm your order.
          </p>
        </div>

        {/* Order Details Toggle */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="border border-gold/30 text-gold font-body text-xs tracking-[0.15em] uppercase px-5 py-2 mt-8 hover:bg-gold/10 transition-all duration-200"
        >
          {showDetails ? 'Hide Details' : 'View Order Details'}
        </button>

        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mt-4"
            >
              <div className="border border-palace-stone bg-palace-smoke p-5 text-left space-y-3 max-w-sm mx-auto">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="font-body text-sm text-white">
                      {item.name} <span className="text-white/30">x{item.quantity}</span>
                    </span>
                    <span className="font-body text-sm text-gold">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t border-palace-stone/50 pt-2 mt-2 space-y-1">
                  <div className="flex justify-between"><span className="font-body text-xs text-white/40">Subtotal</span><span className="font-body text-xs text-white/70">${order.subtotal.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span className="font-body text-xs text-white/40">Tax</span><span className="font-body text-xs text-white/70">${order.tax.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span className="font-body text-xs text-white/40">Pickup</span><span className="font-body text-xs text-gold">FREE</span></div>
                  <div className="border-t border-palace-stone/50 pt-1"><div className="flex justify-between"><span className="font-display text-sm text-white">Total</span><span className="font-display text-sm text-gold">${order.total.toFixed(2)}</span></div></div>
                </div>
                {order.specialRequests && (
                  <div className="pt-2">
                    <p className="font-body text-xs text-white/30 tracking-widest uppercase mb-1">Special Requests</p>
                    <p className="font-body text-xs text-white/50 italic">{order.specialRequests}</p>
                  </div>
                )}
                <p className="font-body text-[10px] text-white/20 pt-2">Placed at {placedTime}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-10 justify-center">
          <a href="/#menu" className="border border-gold/40 text-gold font-body text-xs tracking-[0.18em] uppercase px-8 py-3 hover:bg-gold/10 hover:border-gold transition-all duration-300 text-center">
            Order Again
          </a>
          <a href="/" className="font-body text-xs text-white/30 hover:text-white tracking-wide uppercase py-3 px-8 text-center transition-colors">
            Back to Home
          </a>
        </div>
      </div>
    </div>
  )
}
