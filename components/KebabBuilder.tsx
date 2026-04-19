'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function KebabBuilder() {
  const [ready, setReady] = useState(false)
  
  useEffect(() => {
    // Small delay before starting the animation so the card flip can begin/settle
    const timer = setTimeout(() => setReady(true), 200)
    return () => clearTimeout(timer)
  }, [])

  if (!ready) return null

  // Stagger items right to left.
  const spring = { type: 'spring', stiffness: 300, damping: 15 }
  
  return (
    <div className="absolute top-4 right-4 w-16 h-16 pointer-events-none">
      <motion.svg
        viewBox="0 0 64 64"
        className="w-full h-full"
        // Wiggle the entire group after all pieces have dropped
        initial={{ rotate: 0 }}
        animate={{ rotate: [0, -5, 5, 0] }}
        transition={{ delay: 0.9, duration: 0.3 }}
      >
        {/* The Skewer Line */}
        <line x1="2" y1="32" x2="62" y2="32" stroke="#c0c0c0" strokeWidth="1.5" strokeLinecap="round" />
        
        {/* Item 1 (Rightmost pepper) -> delay: 0 */}
        <motion.circle
          cx="50" cy="32" r="5" fill="#8b0000"
          initial={{ y: -20, opacity: 0, scale: 0.5 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ ...spring, delay: 0.0 }}
        />
        
        {/* Item 2 (Meat) -> delay: 0.12 */}
        <motion.rect
          x="36" y="26" width="10" height="12" rx="2" fill="#6b2d10"
          initial={{ y: -20, opacity: 0, scale: 0.5 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ ...spring, delay: 0.12 }}
        />
        
        {/* Item 3 (Onion) -> delay: 0.24 */}
        <motion.ellipse
          cx="28" cy="32" rx="4" ry="6" fill="#f5f5e8" opacity={0.9}
          initial={{ y: -20, opacity: 0, scale: 0.5 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ ...spring, delay: 0.24 }}
        />
        
        {/* Item 4 (Meat) -> delay: 0.36 */}
        <motion.rect
          x="16" y="26" width="10" height="12" rx="2" fill="#3d1a0a"
          initial={{ y: -20, opacity: 0, scale: 0.5 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ ...spring, delay: 0.36 }}
        />
        
        {/* Item 5 (Leftmost pepper) -> delay: 0.48 */}
        <motion.circle
          cx="10" cy="32" r="4" fill="#cc8800"
          initial={{ y: -20, opacity: 0, scale: 0.5 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ ...spring, delay: 0.48 }}
        />
      </motion.svg>

      {/* Flame Glow underneath after 0.8s */}
      <motion.div
        className="absolute bottom-2 left-1/2 -translate-x-1/2 w-8 h-2 rounded-[100%] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(255, 107, 26, 0.8) 0%, transparent 70%)',
          filter: 'blur(3px)'
        }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: [0, 1, 0.4, 1], scale: [0, 1.2, 0.9, 1] }}
        transition={{ delay: 0.8, duration: 1.5, repeat: Infinity, repeatType: 'reverse' }}
      />
    </div>
  )
}
