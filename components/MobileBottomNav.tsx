'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCart } from '@/context/CartContext'

export default function MobileBottomNav() {
  const [isVisible, setIsVisible] = useState(true)
  const pathname = usePathname()
  const { openCart } = useCart()

  useEffect(() => {
    // Hide navbar if keyboard is open
    const visualViewport = window.visualViewport
    const handleResize = () => {
      if (visualViewport) {
        // If viewport height is significantly less than window innerHeight, keyboard is likely open
        setIsVisible(visualViewport.height >= window.innerHeight - 100)
      }
    }
    
    if (visualViewport) {
      visualViewport.addEventListener('resize', handleResize)
    }
    
    return () => {
      if (visualViewport) {
        visualViewport.removeEventListener('resize', handleResize)
      }
    }
  }, [])

  // Only render on specific paths
  const shouldRender = pathname === '/' || pathname === '/menu'
  if (!shouldRender || !isVisible) return null

  // Ensure this explicitly renders for touch devices only using Tailwind classes
  return (
    <AnimatePresence>
      <motion.div
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-palace-charcoal/98 backdrop-blur-md border-t border-palace-maroon/20 pb-safe"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="flex px-2 py-1 items-center justify-between">
          
          <Link href="/" className={`flex-1 flex flex-col items-center py-2 ${pathname === '/' ? 'text-gold' : 'text-cream/50'}`}>
            <span className="text-xl mb-1">🏠</span>
            <span className="text-[9px] tracking-wide uppercase font-body">Home</span>
          </Link>
          
          <Link href="/menu" className={`flex-1 flex flex-col items-center py-2 ${pathname === '/menu' ? 'text-gold' : 'text-cream/50'}`}>
            <span className="text-xl mb-1">📋</span>
            <span className="text-[9px] tracking-wide uppercase font-body">Menu</span>
          </Link>

          <button onClick={openCart} className="flex-1 flex flex-col items-center py-2 text-cream/50 hover:text-gold active:text-gold transition-colors">
            <span className="text-xl mb-1">🍢</span>
            <span className="text-[9px] tracking-wide uppercase font-body">Order</span>
          </button>

          <button onClick={() => {
            const el = document.getElementById('contact')
            if (el) el.scrollIntoView({ behavior: 'smooth' })
          }} className="flex-1 flex flex-col items-center py-2 text-cream/50 hover:text-gold active:text-gold transition-colors">
            <span className="text-xl mb-1">📞</span>
            <span className="text-[9px] tracking-wide uppercase font-body">Contact</span>
          </button>

        </div>
      </motion.div>
    </AnimatePresence>
  )
}
