'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { optimizedImage } from '@/sanity.client'
import { CATEGORY_LABELS } from '@/lib/fetchData'
import { useModal } from '@/context/ModalContext'
import { useCart } from '@/context/CartContext'
import { AnalyticsEvents } from '@/lib/analytics'

export default function ItemModal() {
  const { openItem, closeModal } = useModal()
  const { addItemWithQty, dispatch } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [specialNote, setSpecialNote] = useState('')
  const [justAdded, setJustAdded] = useState(false)

  useEffect(() => {
    setQuantity(1)
    setSpecialNote('')
    setJustAdded(false)
    if (openItem) AnalyticsEvents.viewDish(openItem.name, openItem.category)
  }, [openItem?._id])

  if (!openItem) return null
  const item = openItem

  const handleAddToOrder = () => {
    addItemWithQty(
      {
        id: item._id,
        name: item.name,
        category: item.category,
        price: item.price,
        image: item.image ? optimizedImage(item.image, { width: 128, height: 128 }) : undefined,
      },
      quantity
    )
    if (specialNote.trim()) {
      dispatch({ type: 'UPDATE_INSTRUCTIONS', payload: { id: item._id, instructions: specialNote.trim() } })
    }
    setJustAdded(true)
    setTimeout(() => {
      closeModal()
      setJustAdded(false)
    }, 1200)
  }

  return (
    <AnimatePresence>
      {openItem && (
        <>
          {/* Backdrop */}
          <motion.div
            key="modal-backdrop"
            className="fixed inset-0 z-[180] bg-palace-black/85 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={closeModal}
          />

          {/* Centering wrapper */}
          <div className="fixed inset-0 z-[190] flex items-center justify-center p-4 md:p-8 pointer-events-none">
            <motion.div
              key={`modal-${item._id}`}
              className="pointer-events-auto relative w-full max-w-3xl max-h-[90vh] overflow-hidden bg-palace-charcoal border border-gold/25 flex flex-col md:flex-row"
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            >
              {/* Close */}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center border border-palace-stone text-white/30 hover:text-gold hover:border-gold transition-all duration-200 font-body text-sm"
                aria-label="Close modal"
              >
                ✕
              </button>

              {/* Image */}
              <div className="relative h-48 md:h-auto md:w-[45%] flex-shrink-0">
                {item.image ? (
                  <>
                    <Image
                      src={optimizedImage(item.image, { width: 700, height: 900 })}
                      alt={item.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 700px"
                      style={{ objectFit: 'cover' }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-palace-charcoal via-palace-charcoal/20 to-transparent" />
                  </>
                ) : (
                  <div className="w-full h-full min-h-[280px] bg-palace-smoke flex items-center justify-center">
                    <span className="text-gold/10 text-6xl">◆</span>
                  </div>
                )}
                {item.isSignature && (
                  <div className="absolute top-3 left-3 bg-gold text-palace-black font-body text-[9px] tracking-widest uppercase px-2 py-1">
                    ✦ Signature Dish
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 flex flex-col overflow-y-auto">
                <div className="p-6 md:p-8 flex-1">
                  <span className="font-body text-[9px] tracking-[0.25em] uppercase text-gold-muted border border-gold/20 px-2 py-0.5">
                    {CATEGORY_LABELS[item.category] ?? item.category}
                  </span>

                  <h2 className={`font-display text-3xl md:text-4xl font-light tracking-wide mt-2 leading-tight ${item.isSignature ? 'text-shimmer' : 'text-white'}`}>
                    {item.name}
                  </h2>

                  <p className="font-display text-2xl text-gold font-light mt-1">
                    ${item.price?.toFixed(2)}
                  </p>

                  {/* Divider */}
                  <div className="relative flex items-center w-16 my-5">
                    <div className="absolute inset-0 border-t border-gold/30 top-1/2" />
                    <span className="relative bg-palace-charcoal pr-3 text-gold text-xs">◆</span>
                  </div>

                  <p className="font-body text-sm text-white/55 leading-[1.9]">
                    {item.description || <em className="text-white/25">A palace-worthy dish, prepared fresh.</em>}
                  </p>

                  {/* Special Instructions */}
                  <label className="font-body text-xs tracking-widest uppercase text-white/30 mb-2 mt-6 block">
                    Special Instructions (optional)
                  </label>
                  <textarea
                    value={specialNote}
                    onChange={(e) => setSpecialNote(e.target.value)}
                    rows={2}
                    placeholder="E.g. No coriander, extra spicy, allergen info..."
                    className="bg-transparent border border-palace-stone px-4 py-3 w-full font-body text-sm text-white rounded-none resize-none placeholder:text-white/20 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 transition-all duration-200"
                  />
                </div>

                {/* Bottom action bar */}
                <div className="sticky bottom-0 bg-palace-charcoal border-t border-palace-stone px-6 md:px-8 pt-5 pb-6">
                  <div className="flex items-end justify-between gap-4">
                    {/* Quantity */}
                    <div>
                      <p className="font-body text-[10px] tracking-widest uppercase text-white/25 mb-2">Quantity</p>
                      <div className="flex items-center gap-0">
                        <button
                          onClick={() => setQuantity(q => Math.max(1, q - 1))}
                          disabled={quantity === 1}
                          className="w-10 h-10 border border-palace-stone text-white/50 hover:border-gold hover:text-gold transition-all duration-200 flex items-center justify-center font-body text-lg disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          −
                        </button>
                        <div className="w-12 h-10 border-y border-palace-stone font-display text-lg text-white text-center flex items-center justify-center bg-transparent">
                          {quantity}
                        </div>
                        <button
                          onClick={() => setQuantity(q => Math.min(20, q + 1))}
                          className="w-10 h-10 border border-palace-stone text-white/50 hover:border-gold hover:text-gold transition-all duration-200 flex items-center justify-center font-body text-lg"
                        >
                          +
                        </button>
                        <span className="font-display text-base text-gold ml-4">
                          ${(item.price * quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Add to order */}
                    <AnimatePresence mode="wait">
                      {justAdded ? (
                        <motion.div
                          key="added"
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: 'spring', stiffness: 300 }}
                          className="bg-palace-smoke border border-gold text-gold font-body font-bold text-xs tracking-[0.25em] uppercase px-7 py-3.5 rounded-none flex items-center gap-2 pointer-events-none"
                        >
                          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                            <motion.path
                              d="M3 8l3.5 3.5L13 5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              initial={{ pathLength: 0 }}
                              animate={{ pathLength: 1 }}
                              transition={{ duration: 0.4 }}
                            />
                          </svg>
                          Added to Order!
                        </motion.div>
                      ) : (
                        <motion.button
                          key="add"
                          onClick={handleAddToOrder}
                          className="group relative overflow-hidden bg-gold text-palace-black font-body font-bold text-xs tracking-[0.25em] uppercase px-7 py-3.5 rounded-none flex items-center gap-2"
                          whileHover={{ boxShadow: '0 0 30px rgba(201,168,76,0.5)' }}
                          whileTap={{ scale: 0.97 }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                          <span className="relative z-10">
                            Add {quantity > 1 ? `${quantity}× ` : ''}to Order
                          </span>
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
