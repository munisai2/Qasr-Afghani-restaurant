'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import type { MenuItem } from '@/types/sanity'

interface ModalContextValue {
  openItem: MenuItem | null
  openModal: (item: MenuItem) => void
  closeModal: () => void
}

const ModalContext = createContext<ModalContextValue | null>(null)

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [openItem, setOpenItem] = useState<MenuItem | null>(null)

  useEffect(() => {
    document.body.style.overflow = openItem ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [openItem])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenItem(null)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <ModalContext.Provider value={{
      openItem,
      openModal: (item) => setOpenItem(item),
      closeModal: () => setOpenItem(null),
    }}>
      {children}
    </ModalContext.Provider>
  )
}

export function useModal() {
  const ctx = useContext(ModalContext)
  if (!ctx) throw new Error('useModal must be used inside ModalProvider')
  return ctx
}
