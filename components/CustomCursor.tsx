'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion'

export default function CustomCursor() {
  const [mounted,  setMounted]  = useState(false)
  const [visible,  setVisible]  = useState(false)
  const [clicking, setClicking] = useState(false)
  const [hovering, setHovering] = useState(false)
  const [label,    setLabel]    = useState('')

  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)

  // Inner dot — very snappy
  const dotX  = useSpring(rawX, { stiffness: 800, damping: 40 })
  const dotY  = useSpring(rawY, { stiffness: 800, damping: 40 })

  // Outer ring — lags behind for glow trail effect
  const ringX = useSpring(rawX, { stiffness: 150, damping: 22 })
  const ringY = useSpring(rawY, { stiffness: 150, damping: 22 })

  // Aura (third layer) — even more lag, very large glow
  const auraX = useSpring(rawX, { stiffness: 80,  damping: 18 })
  const auraY = useSpring(rawY, { stiffness: 80,  damping: 18 })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    // Only run on devices with a real mouse
    if (window.matchMedia('(pointer: coarse)').matches) return

    const onMove = (e: MouseEvent) => {
      rawX.set(e.clientX)
      rawY.set(e.clientY)
      if (!visible) setVisible(true)

      // Detect interactive elements
      const el = e.target as HTMLElement
      const interactive =
        el.tagName === 'A'        ||
        el.tagName === 'BUTTON'   ||
        el.tagName === 'INPUT'    ||
        el.tagName === 'TEXTAREA' ||
        el.tagName === 'SELECT'   ||
        el.tagName === 'LABEL'    ||
        el.closest('a')      !== null ||
        el.closest('button') !== null ||
        el.getAttribute('role') === 'button' ||
        window.getComputedStyle(el).cursor === 'pointer'

      setHovering(!!interactive)

      // Show label for specific interactive elements
      if (interactive) {
        const btn = el.closest('button') ?? el.closest('a')
        const dataLabel = btn?.getAttribute('data-cursor-label')
        setLabel(dataLabel ?? '')
      } else {
        setLabel('')
      }
    }

    const onLeave   = () => setVisible(false)
    const onEnter   = () => setVisible(true)
    const onDown    = () => setClicking(true)
    const onUp      = () => setClicking(false)

    document.addEventListener('mousemove',  onMove,  { passive: true })
    document.addEventListener('mouseleave', onLeave)
    document.addEventListener('mouseenter', onEnter)
    document.addEventListener('mousedown',  onDown)
    document.addEventListener('mouseup',    onUp)

    return () => {
      document.removeEventListener('mousemove',  onMove)
      document.removeEventListener('mouseleave', onLeave)
      document.removeEventListener('mouseenter', onEnter)
      document.removeEventListener('mousedown',  onDown)
      document.removeEventListener('mouseup',    onUp)
    }
  }, [mounted, visible, rawX, rawY])

  // Don't render on server or touch devices
  if (!mounted) return null

  return (
    <>
      {/* ── LAYER 1: AURA — large soft glow, most lag ── */}
      <motion.div
        aria-hidden="true"
        style={{
          position:      'fixed',
          top:           0,
          left:          0,
          x:             auraX,
          y:             auraY,
          translateX:    '-50%',
          translateY:    '-50%',
          pointerEvents: 'none',
          zIndex:        99997,
        }}
        animate={{
          opacity: visible && hovering ? 1 : 0,
          scale:   clicking ? 0.8 : 1,
          width:   hovering ? 80 : 60,
          height:  hovering ? 80 : 60,
        }}
        transition={{ duration: 0.3 }}
      >
        <div style={{
          width:        '100%',
          height:       '100%',
          borderRadius: '50%',
          background:   'radial-gradient(circle, ' +
            'rgba(201,168,76,0.12) 0%, ' +
            'rgba(125,26,26,0.06) 50%, ' +
            'transparent 70%)',
        }} />
      </motion.div>

      {/* ── LAYER 2: RING — medium lag, gold border ── */}
      <motion.div
        aria-hidden="true"
        style={{
          position:      'fixed',
          top:           0,
          left:          0,
          x:             ringX,
          y:             ringY,
          translateX:    '-50%',
          translateY:    '-50%',
          pointerEvents: 'none',
          zIndex:        99998,
        }}
        animate={{
          opacity: visible ? 1 : 0,
          scale:   clicking ? 0.75 
                 : hovering ? 1.6 
                 : 1,
          width:   hovering ? 44 : 36,
          height:  hovering ? 44 : 36,
        }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        <div style={{
          width:        '100%',
          height:       '100%',
          borderRadius: '50%',
          border:       hovering
            ? '1px solid rgba(201,168,76,0.8)'
            : '1px solid rgba(201,168,76,0.4)',
          boxShadow: hovering
            ? '0 0 20px rgba(201,168,76,0.4), ' +
              'inset 0 0 10px rgba(201,168,76,0.1), ' +
              '0 0 40px rgba(125,26,26,0.15)'
            : '0 0 10px rgba(201,168,76,0.15)',
          background: hovering
            ? 'rgba(201,168,76,0.05)'
            : 'transparent',
          transition: 'all 0.2s ease',
        }} />
        
        {/* Label inside ring on hover */}
        <AnimatePresence>
          {label && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{    opacity: 0, scale: 0.8 }}
              style={{
                position:   'absolute',
                top:        '50%',
                left:       '50%',
                transform:  'translate(-50%, -50%)',
                whiteSpace: 'nowrap',
                fontSize:   '9px',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color:      'rgba(201,168,76,0.9)',
                fontFamily: 'var(--font-body)',
                marginTop:  '30px',
              }}
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── LAYER 3: DOT — snappy, precise, always on top ── */}
      <motion.div
        aria-hidden="true"
        style={{
          position:      'fixed',
          top:           0,
          left:          0,
          x:             dotX,
          y:             dotY,
          translateX:    '-50%',
          translateY:    '-50%',
          pointerEvents: 'none',
          zIndex:        99999,
        }}
        animate={{
          opacity: visible ? 1 : 0,
          scale:   clicking ? 3
                 : hovering ? 0.4
                 : 1,
        }}
        transition={{ duration: 0.1 }}
      >
        <div style={{
          width:        7,
          height:       7,
          borderRadius: '50%',
          background:   hovering
            ? '#E8C97A'
            : clicking
            ? 'rgba(201,168,76,0.6)'
            : '#C9A84C',
          boxShadow: '0 0 10px rgba(201,168,76,1), ' +
                     '0 0 20px rgba(201,168,76,0.5)',
          transition: 'background 0.15s ease',
        }} />
      </motion.div>
    </>
  )
}
