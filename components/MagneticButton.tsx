'use client'

import React, { useRef } from 'react'
import { motion } from 'framer-motion'
import { useMagneticEffect } from '@/hooks/useMagneticEffect'

type MagneticButtonProps = {
  children: React.ReactNode
  className?: string
  strength?: number
  radius?: number
  href?: string
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  onClick?: React.MouseEventHandler<HTMLElement>
  target?: string
  rel?: string
}

export default function MagneticButton({
  children,
  className = '',
  href,
  strength = 0.35,
  radius = 80,
  ...props
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { x, y } = useMagneticEffect(ref, { strength, radius })

  if (href) {
    return (
      <motion.div ref={ref} style={{ x, y }} className="inline-flex">
        <a 
          href={href} 
          className={className}
          target={props.target}
          rel={props.rel}
          onClick={props.onClick as any}
        >
          {children}
        </a>
      </motion.div>
    )
  }

  return (
    <motion.div ref={ref} style={{ x, y }} className="inline-flex w-full">
      <button 
        className={className}
        type={props.type}
        disabled={props.disabled}
        onClick={props.onClick as any}
      >
        {children}
      </button>
    </motion.div>
  )
}
