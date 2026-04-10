'use client'

import { CartProvider } from '@/context/CartContext'
import type { OpeningHours } from '@/types/sanity'

interface CartProviderWrapperProps {
  children: React.ReactNode
  openingHours: OpeningHours[]
}

export default function CartProviderWrapper({ children, openingHours }: CartProviderWrapperProps) {
  return <CartProvider openingHours={openingHours}>{children}</CartProvider>
}
