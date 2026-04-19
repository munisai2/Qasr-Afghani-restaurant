'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export interface SizzleDividerProps {
  className?: string
  intensity?: 'subtle' | 'medium' | 'strong'
}

export default function SizzleDivider({ className = '', intensity = 'medium' }: SizzleDividerProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // State maps for wave paths (viewBox 0 0 1000 40)
  const path1 = "M0,20 Q125,-10 250,20 T500,20 T750,20 T1000,20"
  const path2 = "M0,20 Q125,50 250,20 T500,20 T750,30 T1000,20"
  const path3 = "M0,20 Q125,10 250,15 T500,25 T750,5  T1000,20"

  const sparkCount = intensity === 'strong' ? 8 : intensity === 'medium' ? 5 : 3

  const sparks = Array.from({ length: sparkCount }).map((_, i) => {
    const isGold = i % 2 === 0
    return {
      x: Math.random() * 90 + 5 + '%', // avoid extreme edges
      delay: Math.random() * 2,
      duration: 1.0 + Math.random() * 1.5,
      color: isGold ? '#C9A84C' : '#FF8C3C',
      size: Math.random() * 1.5 + 1.0
    }
  })

  // We only render sparks dynamically client-side
  return (
    <div className={`relative w-full overflow-hidden ${className}`}>
      
      {/* 40px Heat Shimmer SVG */}
      <div className="relative w-full h-[40px] opacity-15">
        <svg viewBox="0 0 1000 40" preserveAspectRatio="none" className="w-full h-full">
          <motion.path
            fill="none"
            stroke="url(#heat-gradient)"
            strokeWidth="3"
            initial={{ d: path1 }}
            animate={{ d: [path1, path2, path3, path1] }}
            transition={{
              duration: 4,
              ease: "linear",
              repeat: Infinity
            }}
          />
          <defs>
            <linearGradient id="heat-gradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="20%" stopColor="#C9A84C" />
              <stop offset="50%" stopColor="#7D1A1A" />
              <stop offset="80%" stopColor="#C9A84C" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Main Grill Line */}
      <div className="w-full h-[1px]" style={{
        background: 'linear-gradient(90deg, transparent, #7D1A1A, #C9A84C, #7D1A1A, transparent)'
      }} />

      {/* Ember Sparks */}
      {mounted && sparks.map((sp, i) => (
        <motion.div
          key={i}
          className="absolute bottom-[20px] rounded-full"
          style={{
            left: sp.x,
            width: `${sp.size}px`,
            height: `${sp.size}px`,
            backgroundColor: sp.color,
            boxShadow: `0 0 ${sp.size * 3}px ${sp.color}`
          }}
          initial={{ y: 0, opacity: 0, x: 0 }}
          animate={{
            y: -30 - Math.random() * 20,
            opacity: [0, 1, 0],
            x: (Math.random() - 0.5) * 15
          }}
          transition={{
            duration: sp.duration,
            delay: sp.delay,
            repeat: Infinity,
            ease: "easeOut"
          }}
        />
      ))}

      {/* Radial Maroon bottom glow */}
      {intensity !== 'subtle' && (
        <div className="absolute top-[41px] left-1/2 -translate-x-1/2 w-3/4 h-[80px]" style={{
          background: 'radial-gradient(ellipse at top, rgba(125,26,26,0.1) 0%, transparent 70%)'
        }} />
      )}
    </div>
  )
}
