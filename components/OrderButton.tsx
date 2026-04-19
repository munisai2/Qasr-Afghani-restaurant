'use client'

import React from 'react'
import MagneticButton from '@/components/MagneticButton'

interface OrderButtonProps {
  label?: string
  variant?: 'hero' | 'nav' | 'card' | 'menu'
  className?: string
}

export default function OrderButton({ label = 'Order Online', variant = 'nav', className = '' }: OrderButtonProps) {

  // Redirect to full digital menu page
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    e.preventDefault()
    window.location.href = '/menu'
  }

  if (variant === 'hero') {
    return (
      <MagneticButton
        href="/menu"
        onClick={handleClick as any}
        className={`group relative inline-flex items-center justify-center px-8 py-4 bg-transparent border border-gold hover:bg-[rgba(201,168,76,0.1)] transition-colors duration-500 overflow-hidden cursor-pointer ${className}`}
      >
        <span className="absolute inset-0 w-0 bg-gold transition-all duration-[600ms] ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:w-full opacity-10"></span>
        <span className="relative z-10 text-gold uppercase tracking-[0.25em] text-sm font-medium">
          {label}
        </span>
      </MagneticButton>
    )
  }

  if (variant === 'menu') {
    return (
      <MagneticButton
        onClick={handleClick as any}
        className={`w-full py-4 bg-[rgba(201,168,76,0.05)] border-y border-[rgba(201,168,76,0.2)] text-gold uppercase tracking-[0.2em] text-xs hover:bg-[rgba(201,168,76,0.15)] transition-colors cursor-pointer ${className}`}
      >
        {label}
      </MagneticButton>
    )
  }

  if (variant === 'card') {
    return (
      <MagneticButton
        onClick={handleClick as any}
        className={`mt-4 w-full py-3 bg-[rgba(201,168,76,0.05)] border border-[rgba(201,168,76,0.2)] text-gold uppercase tracking-[0.15em] text-xs hover:bg-gold hover:text-palace-black transition-colors cursor-pointer ${className}`}
      >
        Order Now
      </MagneticButton>
    )
  }

  // nav variant
  return (
    <MagneticButton
      href="/menu"
      onClick={handleClick as any}
      className={`px-5 py-2.5 bg-palace-maroon/20 border border-gold/40 text-gold hover:bg-gold/10 uppercase tracking-widest text-xs transition-colors cursor-pointer ${className}`}
    >
      {label}
    </MagneticButton>
  )
}
