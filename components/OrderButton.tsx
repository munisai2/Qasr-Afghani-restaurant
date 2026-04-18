'use client'

import type { GloriaFoodConfig } from '@/types/sanity'
import { isGloriaFoodReady } from '@/lib/gloriaFood'

interface OrderButtonProps {
  config: GloriaFoodConfig | null
  variant?: 'hero' | 'nav' | 'card' | 'menu'
  className?: string
}

export default function OrderButton({ config, variant = 'nav', className = '' }: OrderButtonProps) {
  const ready = isGloriaFoodReady(config)
  const label = config?.buttonLabel || 'Order Online'

  // If not ready, clicking acts as a standard anchor linking down to the '#menu' section or '/menu'
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    if (ready) {
      // Allow default GloriaFood widget behavior to take over via data-glf-cuid
      return
    }
    // graceful fallback
    e.preventDefault()
    window.location.href = '/#menu'
  }

  // Common attribute for GloriaFood intercept
  const glfAttrs = ready ? { 'data-glf-cuid': config!.restaurantUUID, 'data-glf-ruid': config!.restaurantUUID } : {}

  if (variant === 'hero') {
    return (
      <a
        {...glfAttrs}
        onClick={handleClick}
        className={`group relative inline-flex items-center justify-center px-8 py-4 bg-transparent border border-gold hover:bg-[rgba(201,168,76,0.1)] transition-colors duration-500 overflow-hidden cursor-pointer ${className}`}
      >
        <span className="absolute inset-0 w-0 bg-gold transition-all duration-[600ms] ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:w-full opacity-10"></span>
        <span className="relative z-10 text-gold uppercase tracking-[0.25em] text-sm font-medium">
          {label}
        </span>
      </a>
    )
  }

  if (variant === 'menu') {
    return (
      <button
        {...glfAttrs}
        onClick={handleClick}
        className={`w-full py-4 bg-[rgba(201,168,76,0.05)] border-y border-[rgba(201,168,76,0.2)] text-gold uppercase tracking-[0.2em] text-xs hover:bg-[rgba(201,168,76,0.15)] transition-colors cursor-pointer ${className}`}
      >
        {label}
      </button>
    )
  }

  if (variant === 'card') {
    return (
      <button
        {...glfAttrs}
        onClick={handleClick}
        className={`mt-4 w-full py-3 bg-[rgba(201,168,76,0.05)] border border-[rgba(201,168,76,0.2)] text-gold uppercase tracking-[0.15em] text-xs hover:bg-gold hover:text-palace-black transition-colors cursor-pointer ${className}`}
      >
        Order Now
      </button>
    )
  }

  // nav variant
  return (
    <a
      {...glfAttrs}
      onClick={handleClick}
      className={`px-5 py-2.5 bg-palace-maroon/20 border border-gold/40 text-gold hover:bg-gold/10 uppercase tracking-widest text-xs transition-colors cursor-pointer ${className}`}
    >
      {label}
    </a>
  )
}
