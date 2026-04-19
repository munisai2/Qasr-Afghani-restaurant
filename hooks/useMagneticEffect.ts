'use client'

import { useState, useEffect, RefObject } from 'react'
import { useSpring } from 'framer-motion'

interface MagneticOptions {
  strength?: number
  radius?: number
}

export function useMagneticEffect(ref: RefObject<HTMLElement | null>, options: MagneticOptions = {}) {
  const { strength = 0.35, radius = 80 } = options

  const [isMobile, setIsMobile] = useState(false)
  const x = useSpring(0, { stiffness: 200, damping: 20 })
  const y = useSpring(0, { stiffness: 200, damping: 20 })

  useEffect(() => {
    // Disable on touch devices
    if (window.matchMedia('(pointer: coarse)').matches) {
      setIsMobile(true)
      return
    }

    const handleMouseMove = (e: MouseEvent) => {
      const element = ref.current
      if (!element) return

      const rect = element.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      const distX = e.clientX - centerX
      const distY = e.clientY - centerY
      const distance = Math.sqrt(distX * distX + distY * distY)

      if (distance < radius) {
        x.set(distX * strength)
        y.set(distY * strength)
      } else {
        x.set(0)
        y.set(0)
      }
    }

    const handleMouseLeave = () => {
      x.set(0)
      y.set(0)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [ref, radius, strength, x, y])

  if (isMobile) {
    return { x: 0, y: 0 }
  }

  return { x, y }
}
