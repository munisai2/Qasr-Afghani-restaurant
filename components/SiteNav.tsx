'use client'

import { useState, useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { optimizedImage } from '@/sanity.client'
import CartNavButton from './CartNavButton'
import MagneticButton from './MagneticButton'
import type { SanityImage } from '@/types/sanity'

interface SiteNavProps {
  logo: SanityImage | null
  restaurantName: string
  reservationUrl: string
}

const NAV_LINKS = [
  { label: 'Menu',     href: '/menu' },
  { label: 'About',    href: '#about' },
  { label: 'Gallery',  href: '#gallery' },
  { label: 'Contact',  href: '#contact' },
  { label: 'Catering', href: '/catering' },
]

export default function SiteNav({ logo, restaurantName, reservationUrl }: SiteNavProps) {
  const pathname = usePathname()
  const { scrollY } = useScroll()
  const [scrolled, setScrolled] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [activeHash, setActiveHash] = useState('')

  useMotionValueEvent(scrollY, 'change', (latest) => { setScrolled(latest >= 60) })

  useEffect(() => {
    const sections = NAV_LINKS.filter(l => l.href.startsWith('#')).map(l => l.href.slice(1))
    const observers: IntersectionObserver[] = []
    sections.forEach((id) => {
      const el = document.getElementById(id)
      if (!el) return
      const observer = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveHash(id) },
        { rootMargin: '-40% 0px -40% 0px', threshold: 0 }
      )
      observer.observe(el)
      observers.push(observer)
    })
    return () => observers.forEach(o => o.disconnect())
  }, [])

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [drawerOpen])

  const closeDrawer = useCallback(() => setDrawerOpen(false), [])

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-palace-black/95 backdrop-blur-md border-b border-gold/10' : 'bg-transparent border-b border-transparent'}`}>
        <div className="flex items-center justify-between px-6 md:px-12 h-16 md:h-[72px]">
          <MagneticButton href="/#hero" className="flex items-center gap-3 flex-shrink-0" strength={0.4} radius={60}>
            {logo ? <Image src={optimizedImage(logo, { width: 96, height: 96 })} alt={restaurantName} width={48} height={48} style={{ objectFit: 'contain', width: '48px', height: 'auto' }} priority /> : <span className="font-display italic text-xl text-gold">{restaurantName}</span>}
          </MagneticButton>

          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link, i) => {
              const isHash = link.href.startsWith('#')
              const isInternalPage = link.href.startsWith('/') && !link.href.includes('#')
              const isActive = (isHash && activeHash === link.href.slice(1)) || (isInternalPage && pathname === link.href)
              return (
                <span key={link.href} className="flex items-center">
                  <a href={isHash ? `/${link.href}` : link.href} className={`font-body text-xs tracking-[0.2em] uppercase px-3 py-2 transition-colors duration-300 ${isActive ? 'text-gold' : 'text-white/50 hover:text-gold'}`}>{link.label}</a>
                  {i < NAV_LINKS.length - 1 && <span className="text-gold/20 text-xs">◆</span>}
                </span>
              )
            })}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {reservationUrl && (
              <MagneticButton href={reservationUrl} target="_blank" rel="noopener noreferrer"
                className="font-body text-xs tracking-[0.18em] uppercase border border-gold/40 text-gold px-4 py-2 rounded-none hover:border-gold hover:bg-gold/10 hover:shadow-[0_0_20px_rgba(201,168,76,0.2)] transition-all duration-300">
                Reserve
              </MagneticButton>
            )}
            <CartNavButton />
            <Link
              href="/admin"
              className="font-body text-[9px] tracking-[0.2em] uppercase text-white/20 hover:text-white/50 transition-colors duration-300 ml-4"
            >
              Admin
            </Link>
          </div>

          <div className="md:hidden flex items-center gap-2">
            <CartNavButton />
            <button className="flex flex-col justify-center items-center gap-[5px] w-8 h-8" onClick={() => setDrawerOpen(true)} aria-label="Open navigation menu">
              <span className="block w-5 h-px bg-white/60" /><span className="block w-5 h-px bg-white/60" /><span className="block w-5 h-px bg-white/60" />
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div className="fixed inset-0 z-[99] bg-palace-black/60" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeDrawer} />
            <motion.div className="fixed inset-0 z-[100] bg-palace-black flex flex-col" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}>
              <div className="flex justify-end p-6">
                <button onClick={closeDrawer} className="text-gold text-2xl w-10 h-10 flex items-center justify-center" aria-label="Close menu">✕</button>
              </div>
              <div className="text-center mb-8"><span className="text-shimmer text-2xl">◆</span></div>
              <div className="flex flex-col items-center justify-center flex-1 gap-0 px-8">
                {NAV_LINKS.map((link) => (
                  <a key={link.href} href={link.href.startsWith('#') ? `/${link.href}` : link.href} onClick={closeDrawer}
                    className="font-display italic text-4xl font-light text-white py-5 border-b border-gold/10 w-full text-center hover:text-gold transition-colors duration-300">{link.label}</a>
                ))}
              </div>
              <div className="px-8 pb-10 space-y-3">
                {reservationUrl && <a href={reservationUrl} target="_blank" rel="noopener noreferrer" onClick={closeDrawer} className="block w-full text-center border border-gold text-gold font-body text-xs tracking-[0.2em] uppercase py-4 hover:bg-gold hover:text-palace-black transition-all duration-300">Reserve a Table</a>}
                <Link
                  href="/admin"
                  onClick={closeDrawer}
                  className="font-body text-xs text-white/20 hover:text-white/40 tracking-widest uppercase mt-auto pt-6 border-t border-palace-stone/30 w-full text-center block"
                >
                  Admin Login
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
