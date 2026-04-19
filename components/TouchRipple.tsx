'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Ripple {
  id: number
  x: number
  y: number
}

let nextId = 0

export default function TouchRipple() {
  const [ripples, setRipples] = useState<Ripple[]>([])
  const [isTouchDevice, setIsTouchDevice] = useState(false)

  useEffect(() => {
    // Check if pointer is strictly fine (mouse). If so, we don't need touch ripples.
    if (window.matchMedia('(pointer: fine)').matches) {
      setIsTouchDevice(false)
      return
    }
    setIsTouchDevice(true)

    const handleTouchStart = (e: TouchEvent) => {
      // Don't interfere if they are swiping multiple fingers
      if (e.touches.length > 1) return
      
      const touch = e.touches[0]
      const newRipple = {
        id: nextId++,
        x: touch.clientX,
        y: touch.clientY
      }

      setRipples(prev => {
        const next = [...prev, newRipple]
        if (next.length > 5) return next.slice(next.length - 5)
        return next
      })
      
      // Cleanup after duration
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== newRipple.id))
      }, 650)
    }

    document.addEventListener('touchstart', handleTouchStart, { passive: true })
    return () => document.removeEventListener('touchstart', handleTouchStart)
  }, [])

  if (!isTouchDevice) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      <AnimatePresence>
        {ripples.map(ripple => (
          <motion.div
            key={ripple.id}
            className="absolute rounded-full border border-[rgba(201,168,76,0.6)]"
            style={{
              left: ripple.x,
              top: ripple.y,
              x: '-50%',
              y: '-50%',
              width: 16,
              height: 16
            }}
            initial={{ scale: 1, opacity: 0.4 }}
            animate={{ scale: 8, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
