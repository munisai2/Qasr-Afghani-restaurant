'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// SVG Tile Pattern matching the circular geometric border logic
const GeometricPatternSVG = () => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="islamic-star" width="120" height="120" patternUnits="userSpaceOnUse" patternTransform="scale(0.5)">
        <g stroke="#C9A84C" strokeWidth="0.8" fill="none" opacity="0.25">
          {/* Base outer circle/square framing */}
          <rect x="0" y="0" width="120" height="120" />
          <circle cx="60" cy="60" r="50" />
          {/* 8-pointed star constructed by two interlocking squares */}
          <g transform="translate(60,60)">
            <rect x="-35" y="-35" width="70" height="70" />
            <rect x="-35" y="-35" width="70" height="70" transform="rotate(45)" />
            {/* Inner detail circle */}
            <circle cx="0" cy="0" r="15" />
          </g>
        </g>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#islamic-star)" />
  </svg>
)

export default function PalaceGate() {
  const [isVisible, setIsVisible] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [showExitGlow, setShowExitGlow] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    const hasSeenGate = sessionStorage.getItem('qasr-gate-shown')
    if (!hasSeenGate) {
      setIsVisible(true)
      
      // Step 4 (Light burst glow effect at center)
      setTimeout(() => setShowExitGlow(true), 1300)
      
      // Step 7 Unmount timeline
      setTimeout(() => {
        setIsVisible(false)
        sessionStorage.setItem('qasr-gate-shown', 'true')
      }, 2800)
    }
  }, [])

  if (!isMounted) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[10000] bg-palace-black flex overflow-hidden pointer-events-auto"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }} // Fades out completely when exiting (Step 6/7)
        >
          {/* Background Ambient Overlay */}
          <div className="absolute inset-0 bg-palace-black/50 z-0 pointer-events-none" />

          {/* Burst of Light Simulation */}
          <motion.div 
            className="absolute top-0 bottom-0 left-1/2 w-[80vw] -translate-x-1/2 bg-gradient-to-r from-transparent via-gold to-transparent opacity-0 mix-blend-screen blur-xl z-[5]"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={showExitGlow ? { opacity: [0, 0.4, 0], scaleX: [0, 1, 2] } : { opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />

          {/* Left Door */}
          <motion.div
            className="relative w-1/2 h-full bg-[#110e0c] border-r border-palace-stone/80 overflow-hidden flex items-center justify-end z-10"
            initial={{ x: '0vw' }}
            animate={{ x: '-50vw' }}
            transition={{ delay: 1.4, duration: 1.0, ease: [0.76, 0, 0.24, 1] }} 
          >
            <GeometricPatternSVG />
            
            {/* Medallion Left Half */}
            <div className="absolute right-0 translate-x-1/2 w-48 h-48 md:w-64 md:h-64 rounded-full border-[2px] border-gold bg-[#110e0c] flex items-center justify-center overflow-hidden">
              {/* Pulse glow wrapper */}
              <motion.div 
                className="absolute inset-0 bg-gold/10"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ delay: 0.9, duration: 0.5 }}
              />
              <span className="font-display text-7xl md:text-8xl italic text-gold absolute right-1/2 translate-x-1/2 -mt-4">
                Q
              </span>
            </div>
          </motion.div>

          {/* Right Door */}
          <motion.div
            className="relative w-1/2 h-full bg-[#110e0c] border-l border-palace-stone/80 overflow-hidden flex items-center justify-start z-10"
            initial={{ x: '0vw' }}
            animate={{ x: '50vw' }}
            transition={{ delay: 1.4, duration: 1.0, ease: [0.76, 0, 0.24, 1] }}
          >
            <GeometricPatternSVG />

            {/* Medallion Right Half */}
            <div className="absolute left-0 -translate-x-1/2 w-48 h-48 md:w-64 md:h-64 rounded-full border-[2px] border-gold bg-[#110e0c] flex items-center justify-center overflow-hidden">
              <motion.div 
                className="absolute inset-0 bg-gold/10"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ delay: 0.9, duration: 0.5 }}
              />
              <span className="font-display text-7xl md:text-8xl italic text-gold absolute left-1/2 -translate-x-1/2 -mt-4">
                Q
              </span>
            </div>
          </motion.div>

          {/* Title - Fades in above seam early in sequence */}
          <motion.div
            className="absolute top-[25%] left-1/2 -translate-x-1/2 z-20 whitespace-nowrap"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: [0, 1, 0], y: [10, 0, -10] }}
            transition={{ delay: 0.4, duration: 1.5, ease: "easeInOut" }}
          >
            <span className="font-body text-gold tracking-[0.4em] uppercase text-[10px] md:text-xs">
              Qasr Afghani Grill & Kabab
            </span>
          </motion.div>

        </motion.div>
      )}
    </AnimatePresence>
  )
}
