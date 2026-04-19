'use client'

import { motion, useScroll, useTransform } from 'framer-motion'

export default function SteamWisps() {
  const { scrollY } = useScroll()
  const yOffset = useTransform(scrollY, [0, 1000], [0, -300])

  // Staggered x positions: 15%, 28%, 42%, 58%, 72%, 85%
  const wisps = [
    { x: '15%', delay: 0.5, dur: 5.2 },
    { x: '28%', delay: 2.1, dur: 6.8 },
    { x: '42%', delay: 1.0, dur: 4.5 },
    { x: '58%', delay: 3.5, dur: 6.0 },
    { x: '72%', delay: 0.2, dur: 4.8 },
    { x: '85%', delay: 1.8, dur: 5.5 }
  ]

  // Organic vertical curve
  const pathData = "M 20 120 C 40 90, 0 60, 20 30 C 40 0, 10 -20, 20 -40"

  return (
    <motion.div 
      className="absolute inset-0 z-[6] pointer-events-none overflow-hidden" 
      style={{ y: yOffset }}
      aria-hidden="true"
    >
      {wisps.map((w, idx) => (
        <motion.svg
          key={idx}
          className="absolute"
          style={{ left: w.x, top: '60%', width: '40px', height: '160px', overflow: 'visible' }}
          viewBox="0 -40 40 160"
          initial={{ y: 0, opacity: 0, scaleX: 1 }}
          animate={{
            y: [-20, -140],
            opacity: [0, 0.15, 0],
            scaleX: [0.8, 1.2, 0.8]
          }}
          transition={{
            duration: w.dur,
            delay: w.delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <path
            d={pathData}
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </motion.svg>
      ))}
    </motion.div>
  )
}
