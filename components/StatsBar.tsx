'use client'

import { motion, useInView } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { useParallax } from '@/hooks/useParallax'

function useCountUp(target: number, duration: number, isCurrency: boolean = false, decimalPlaces: number = 0, startFrom: number = 0) {
  const [count, setCount] = useState(startFrom)
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px 0px' })

  useEffect(() => {
    if (!isInView) return
    let startTime: number | null = null
    let rafId: number

    const update = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = timestamp - startTime
      
      // ease-out cubic
      const ratio = Math.min(progress / duration, 1)
      const easeOut = 1 - Math.pow(1 - ratio, 3)

      const current = startFrom + (target - startFrom) * easeOut
      setCount(current)

      if (progress < duration) {
        rafId = requestAnimationFrame(update)
      } else {
        setCount(target)
      }
    }

    rafId = requestAnimationFrame(update)
    return () => cancelAnimationFrame(rafId)
  }, [isInView, target, duration, startFrom])

  return { ref, count, isInView }
}

export default function StatsBar() {
  const stats = [
    { target: 47, label: 'Palace Dishes', suffix: '+', dur: 2000, startFrom: 0 },
    { target: 100, label: 'Halal Certified', suffix: '%', dur: 2000, startFrom: 0 },
    { target: 2023, label: 'Est. in Buffalo', suffix: '', dur: 2000, startFrom: 1990 },
    { target: 4.9, label: 'Guest Rating', suffix: '★', dur: 2000, startFrom: 0.0, decimals: 1 }
  ]

  const containerVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { staggerChildren: 0.15, delayChildren: 0.2, duration: 0.8, ease: "easeOut" }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  }

  const containerRef = useRef<HTMLElement>(null)
  const yParallax = useParallax(containerRef, 1.2, 100)

  return (
    <section ref={containerRef} className="w-full bg-palace-charcoal py-16 relative overflow-hidden">
      {/* Dynamic Parallax Lighting */}
      <motion.div 
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          y: yParallax,
          background: 'linear-gradient(180deg, transparent 0%, rgba(201,168,76,0.02) 50%, transparent 100%)'
        }}
      />
      <div className="absolute top-0 left-0 w-full h-[1px]" style={{ background: 'linear-gradient(90deg, transparent, rgba(125,26,26,0.6), transparent)' }} />
      
      <motion.div 
        className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 divide-x divide-palace-stone border-transparent relative z-10"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
      >
        {stats.map((stat, i) => {
          // Internal component hook wrapper so each stat mounts cleanly
          return <StatItem key={i} {...stat} delay={i * 150} variants={itemVariants} />
        })}
      </motion.div>

      <div className="absolute bottom-0 left-0 w-full h-[1px]" style={{ background: 'linear-gradient(90deg, transparent, rgba(125,26,26,0.6), transparent)' }} />
    </section>
  )
}

function StatItem({ target, label, suffix, dur, startFrom, decimals, delay, variants }: any) {
  const { ref, count, isInView } = useCountUp(target, dur, false, decimals, startFrom)
  const [didBurst, setDidBurst] = useState(false)
  
  const displayVal = decimals ? count.toFixed(decimals) : Math.round(count)
  const isDone = Math.abs(count - target) < 0.01

  useEffect(() => {
    if (isDone && target > 0 && !didBurst) {
      setDidBurst(true)
    }
  }, [isDone, target, didBurst])

  return (
    <motion.div ref={ref} variants={variants} className="flex flex-col items-center justify-center p-4 relative">
      <motion.div 
        className="font-display text-5xl md:text-6xl font-light text-gradient-royal flex items-baseline relative"
        animate={didBurst ? {
          scale: [1, 1.15, 1],
          color: ['#C9A84C', '#fb923c', '#C9A84C'],
          textShadow: ['0px 0px 0px transparent', '0px 0px 20px rgba(255,107,26,0.8)', '0px 0px 0px transparent']
        } : {}}
        transition={{ duration: 0.4 }}
      >
        
        {/* Embers Burst */}
        {didBurst && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60px] h-1 pointer-events-none">
            {[0,1,2].map(j => {
              const xOffset = (Math.random() - 0.5) * 60
              return (
                <motion.div
                  key={j}
                  className="absolute w-[4px] h-[4px] rounded-full bg-[#fb923c]"
                  style={{ left: `calc(50% + ${xOffset}px)` }}
                  initial={{ y: 0, opacity: 0.8 }}
                  animate={{ y: -40, opacity: 0 }}
                  transition={{ duration: 0.6, delay: j * 0.08 }}
                />
              )
            })}
          </div>
        )}

        {displayVal}
        
        {/* Special star pop effect for rating suffix */}
        {suffix === '★' ? (
          <motion.span 
            initial={{ scale: 0 }} 
            animate={{ scale: isDone ? 1 : 0 }} 
            transition={{ type: "spring", stiffness: 300, damping: 10 }}
            className="text-[0.6em] ml-1 mb-2 text-gold inline-block"
          >
            {suffix}
          </motion.span>
        ) : (
          <span className="text-[0.6em] ml-1">{suffix}</span>
        )}
      </motion.div>
      <p className="font-body text-xs tracking-[0.3em] uppercase text-cream/40 mt-3 text-center px-2">
        {label}
      </p>
    </motion.div>
  )
}
