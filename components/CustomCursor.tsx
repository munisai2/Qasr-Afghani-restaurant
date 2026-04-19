'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion'

// ══════════════════════════════════════════════════════
// EMBER TRAIL CANVAS (Bottom most cursor layer)
// ══════════════════════════════════════════════════════
function EmberTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  useEffect(() => {
    // Only run on devices with a real mouse
    if (window.matchMedia('(pointer: coarse)').matches) return
    
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Size canvas
    const updateSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    updateSize()
    window.addEventListener('resize', updateSize)
    
    // Core Particle Data
    let particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      life: number
      decay: number
      size: number
      color: string
    }> = []
    
    const colors = [
      'rgba(201,168,76,',   // gold
      'rgba(232,201,122,',  // bright gold
      'rgba(125,26,26,',    // maroon
      'rgba(255,140,60,'    // orange
    ]
    
    // Spawner
    let lastSpawn = 0
    const onMove = (e: MouseEvent) => {
      const now = performance.now()
      if (now - lastSpawn < 16) return // throttle to ~60fps spawn rate
      lastSpawn = now
      
      // Spawn 2-3 particles
      const count = Math.floor(Math.random() * 2) + 2
      for (let i = 0; i < count; i++) {
        const colorBase = colors[Math.floor(Math.random() * colors.length)]
        particles.push({
          x: e.clientX,
          y: e.clientY,
          vx: (Math.random() - 0.5) * 1.6,
          vy: -(Math.random() * 1.3 + 1.2), // upward bias
          life: 1.0,
          decay: Math.random() * 0.01 + 0.018, // 0.018 to 0.028
          size: Math.random() * 2.0 + 1.5,     // 1.5 to 3.5
          color: colorBase
        })
      }
      
      // Cap at 80 for perf
      if (particles.length > 80) {
        particles = particles.slice(particles.length - 80)
      }
    }
    document.addEventListener('mousemove', onMove, { passive: true })
    
    // Render Loop
    let rafId: number
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.04  // gravity pulling down/slowing upward velocity
        p.vx *= 0.99  // air resistance
        p.life -= p.decay
        
        if (p.life <= 0) {
          particles.splice(i, 1)
          continue
        }
        
        ctx.beginPath()
        ctx.globalAlpha = p.life
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2)
        ctx.shadowBlur = 6
        ctx.shadowColor = p.color + '1)'
        ctx.fillStyle = p.color + '1)'
        ctx.fill()
      }
      
      rafId = requestAnimationFrame(render)
    }
    render()
    
    return () => {
      window.removeEventListener('resize', updateSize)
      document.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(rafId)
    }
  }, [])
  
  return (
    <canvas 
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[99996]"
      aria-hidden="true"
    />
  )
}

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
      <EmberTrail />
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
