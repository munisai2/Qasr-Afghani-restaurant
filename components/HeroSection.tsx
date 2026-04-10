'use client'

import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { optimizedImage } from '@/sanity.client'
import ViewCartHeroButton from './ViewCartHeroButton'
import type { RestaurantInfo } from '@/types/sanity'

const HeroCanvas = dynamic(() => import('./HeroCanvas'), { ssr: false })

function useMouseTilt() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => setMousePosition({ x: e.clientX, y: e.clientY })
    const updateSize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('resize', updateSize)
    updateSize()
    return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('resize', updateSize) }
  }, [])
  const centerX = windowSize.width / 2
  const centerY = windowSize.height / 2
  const rotateXStr = windowSize.height > 0 ? ((mousePosition.y - centerY) / centerY) * -5 : 0
  const rotateYStr = windowSize.width > 0 ? ((mousePosition.x - centerX) / centerX) * 5 : 0
  const rotateX = useSpring(rotateXStr, { stiffness: 80, damping: 20 })
  const rotateY = useSpring(rotateYStr, { stiffness: 80, damping: 20 })
  return { rotateX, rotateY }
}

function getTodayHours(openingHours?: RestaurantInfo['openingHours']): string | null {
  if (!openingHours || openingHours.length === 0) return null
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const today = days[new Date().getDay()]
  const match = openingHours.find((h) => h.days?.toLowerCase().includes(today))
  if (!match) return null
  if (match.isClosed) return 'Closed Today'
  return match.hours ?? null
}

export default function HeroSection({ info }: { info: RestaurantInfo }) {
  const { scrollY } = useScroll()
  const grainY = useTransform(scrollY, [0, 1000], [0, -300])
  const glowY = useTransform(scrollY, [0, 1000], [0, -500])
  const imageY = useTransform(scrollY, [0, 1000], [0, -700])
  const { rotateX, rotateY } = useMouseTilt()
  const todayHours = getTodayHours(info?.openingHours)

  return (
    <div id="hero" className="relative overflow-hidden min-h-screen">
      {/* LAYER 0 — Base black */}
      <div className="absolute inset-0 bg-palace-black z-0" />

      {/* LAYER 1 — Grain texture (parallax) */}
      <motion.div className="grain-overlay absolute inset-0 z-[1]" style={{ y: grainY }} />

      {/* LAYER 1.5 — Three.js geometric particle field */}
      <HeroCanvas />

      {/* LAYER 2 — Radial amber glow (parallax) */}
      <motion.div className="absolute inset-0 z-[2]" style={{ y: glowY, background: `radial-gradient(ellipse 90% 70% at 50% 50%, rgba(201,168,76,0.12) 0%, rgba(201,168,76,0.04) 40%, transparent 70%)` }} />

      {/* LAYER 3 — Optional Sanity hero image */}
      {info?.heroImage && (
        <motion.div className="absolute inset-0 z-[3] opacity-20" style={{ y: imageY }}>
          <Image src={optimizedImage(info.heroImage, { width: 1920, height: 1080 })} alt={info.name || 'Hero background'} fill style={{ objectFit: 'cover', objectPosition: 'center' }} priority />
        </motion.div>
      )}

      {/* LAYER 4 — Vignette */}
      <div className="absolute inset-0 z-[4]" style={{ background: `radial-gradient(ellipse 100% 100% at 50% 50%, transparent 40%, rgba(10,8,5,0.7) 100%)` }} />

      {/* LAYER 5 — Foreground content */}
      <div className="relative z-10 min-h-screen px-6 py-20 flex flex-col items-center justify-center">
        <motion.div className="flex flex-col items-center justify-center w-full max-w-4xl" style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}>
          {/* Eyebrow */}
          <motion.div style={{ transform: 'translateZ(10px)' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }} className="font-body text-xs tracking-[0.3em] uppercase text-gold-muted text-center">
            BUFFALO, NEW YORK  ·  AUTHENTIC AFGHAN CUISINE
          </motion.div>

          {/* Logo */}
          <motion.div style={{ transform: 'translateZ(40px)', filter: 'drop-shadow(0 0 24px rgba(201,168,76,0.4))' }} animate={{ y: [0, -10, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} whileHover={{ scale: 1.05 }} className="mt-8 mb-4 max-w-full">
            {info?.logo ? (
              <Image src={optimizedImage(info.logo, { width: 280, height: 280 })} alt={`${info.name} logo`} width={140} height={140} style={{ objectFit: 'contain', width: '140px', height: 'auto' }} priority />
            ) : (
              <div className="w-36 h-36 border border-gold/30 flex items-center justify-center"><span className="text-gold italic font-display">[LOGO]</span></div>
            )}
          </motion.div>

          {/* Headline */}
          <motion.h1 style={{ transform: 'translateZ(30px)' }} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.4 }} className="font-display text-7xl md:text-9xl font-light tracking-widest text-white mt-6 text-center">
            {info?.name ? (<><span className="text-shimmer">{info.name.charAt(0)}</span>{info.name.slice(1)}</>) : (<><span className="text-shimmer">Q</span>asr Afghan</>)}
          </motion.h1>

          {/* Tagline */}
          <motion.p style={{ transform: 'translateZ(20px)' }} initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.6 }} className="font-display italic text-xl md:text-2xl font-light text-white/55 mt-4 max-w-lg text-center">
            {info?.tagline}
          </motion.p>

          {/* Divider */}
          <motion.div style={{ transform: 'translateZ(15px)' }} initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.7 }} className="relative flex items-center justify-center w-32 my-8">
            <div className="absolute inset-0 border-t border-gold/30 top-1/2" /><span className="relative bg-palace-black px-3 text-gold text-xs">◆</span>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.9 }} className="flex flex-col sm:flex-row gap-4 mt-2 justify-center items-center">
            <ViewCartHeroButton />
            {info?.reservationUrl && (
              <motion.a href={info.reservationUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 border border-gold/50 text-gold font-body text-sm tracking-[0.2em] uppercase px-8 py-4 rounded-none hover:bg-gold/10 hover:border-gold transition-all duration-300" whileHover={{ boxShadow: '0 0 30px rgba(201,168,76,0.3)' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                Reserve a Table
              </motion.a>
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom Bar */}
      <div className="absolute bottom-16 left-0 right-0 px-8 md:px-16 z-10 hidden md:flex items-center justify-between">
        {todayHours && <span className="font-body text-xs text-white/35 tracking-wide">Open Today: {todayHours}</span>}
        {info?.phone && <a href={`tel:${info.phone}`} className="font-body text-xs text-white/35 tracking-wide hover:text-gold transition-colors duration-300">{info.phone}</a>}
      </div>

      <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center" animate={{ y: [0, 8, 0], opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
        <span className="font-body text-[9px] tracking-[0.3em] text-gold-muted mb-1">SCROLL</span>
        <span className="font-body text-xs tracking-widest text-gold opacity-80">↓</span>
      </motion.div>
    </div>
  )
}
