'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useCart } from '@/context/CartContext'

export default function CartDrawer() {
  const router = useRouter()
  const {
    state, itemCount, subtotal, tax, total, storeStatus,
    incrementItem, decrementItem, removeItem, closeCart, dispatch,
  } = useCart()

  return (
    <AnimatePresence>
      {state.isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-palace-black/70 backdrop-blur-sm z-[150]"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={closeCart}
          />
          <motion.div
            className="fixed right-0 top-0 bottom-0 z-[160] w-full max-w-md bg-palace-charcoal border-l border-gold/15 flex flex-col"
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          >
            {/* Header */}
            <div className="flex-shrink-0 px-6 py-5 border-b border-palace-stone flex items-center justify-between">
              <div>
                <h2 className="font-display text-xl font-light text-white">Your Order</h2>
                <p className="font-body text-xs text-gold-muted tracking-wide">{itemCount} item{itemCount !== 1 ? 's' : ''} · Pickup</p>
              </div>
              <button onClick={closeCart} className="w-8 h-8 border border-palace-stone text-white/40 hover:text-gold hover:border-gold transition-all duration-200 flex items-center justify-center" aria-label="Close cart">✕</button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {state.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <span className="text-gold/20 text-4xl">◆</span>
                  <p className="font-display italic text-white/25 text-lg mt-3">Your order is empty</p>
                  <p className="font-body text-xs text-white/20 mt-1">Add items from the menu to begin</p>
                  <button onClick={() => { closeCart(); document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' }) }}
                    className="border border-gold/40 text-gold font-body text-xs tracking-[0.15em] uppercase px-5 py-2 mt-6 hover:bg-gold/10 transition-all duration-200">Browse Menu</button>
                </div>
              ) : (
                state.items.map((item) => (
                  <CartItemRow key={item.id} item={item}
                    onIncrement={() => incrementItem(item.id)}
                    onDecrement={() => decrementItem(item.id)}
                    onRemove={() => removeItem(item.id)}
                    onUpdateInstructions={(v) => dispatch({ type: 'UPDATE_INSTRUCTIONS', payload: { id: item.id, instructions: v } })} />
                ))
              )}
            </div>

            {/* Summary */}
            {state.items.length > 0 && (
              <div className="flex-shrink-0 border-t border-palace-stone px-6 py-5 space-y-2">
                <SummaryRow label="Subtotal" value={`$${subtotal.toFixed(2)}`} />
                <SummaryRow label="Tax (8%)" value={`$${tax.toFixed(2)}`} />
                <SummaryRow label="Pickup" value="FREE" valueClass="text-gold" />
                <div className="border-t border-palace-stone/50 my-2" />
                <div className="flex justify-between">
                  <span className="font-display text-base text-white">Total</span>
                  <span className="font-display text-base text-gold">${total.toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* Footer */}
            {state.items.length > 0 && (
              <div className="flex-shrink-0 px-6 pb-6 pt-4">
                {storeStatus.isOpen && storeStatus.closingTime && (
                  <p className="font-body text-[10px] text-yellow-500/60 text-center mb-2">⏱ {storeStatus.closingTime}</p>
                )}
                {!storeStatus.isOpen && (
                  <p className="font-body text-[10px] text-red-400/60 text-center mb-2">🔴 {storeStatus.message}</p>
                )}
                <motion.button
                  onClick={() => { closeCart(); router.push('/checkout') }}
                  className="bg-gold text-palace-black w-full py-4 rounded-none font-body font-semibold text-sm tracking-[0.2em] uppercase flex items-center justify-center gap-3"
                  whileHover={{ boxShadow: '0 0 30px rgba(201,168,76,0.5)' }}
                  whileTap={{ scale: 0.98 }}>
                  Proceed to Checkout →
                </motion.button>
                <p className="font-body text-[10px] text-white/20 mt-3 text-center">🏪 Pickup · Ready in 25–35 min</p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function CartItemRow({ item, onIncrement, onDecrement, onRemove, onUpdateInstructions }: {
  item: import('@/context/CartContext').CartItem
  onIncrement: () => void; onDecrement: () => void; onRemove: () => void; onUpdateInstructions: (v: string) => void
}) {
  const [showNote, setShowNote] = useState(false)
  return (
    <div className="flex gap-3 pb-4 border-b border-palace-stone/40">
      <div className="w-16 h-16 flex-shrink-0 relative overflow-hidden">
        {item.image ? <Image src={item.image} alt={item.name} fill sizes="64px" style={{ objectFit: 'cover' }} /> : <div className="w-full h-full bg-palace-smoke flex items-center justify-center"><span className="text-gold/20 text-lg">◆</span></div>}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-display text-sm text-white font-light truncate">{item.name}</p>
        <p className="font-body text-[10px] text-gold-muted tracking-widest uppercase mt-0.5">{item.category}</p>
        {!showNote && !item.specialInstructions && <button onClick={() => setShowNote(true)} className="font-body text-xs text-white/25 mt-1 hover:text-gold/50 transition-colors">+ Add note</button>}
        {(showNote || item.specialInstructions) && (
          <textarea defaultValue={item.specialInstructions} placeholder="E.g. No onions, extra spicy..." rows={2} onBlur={(e) => { onUpdateInstructions(e.target.value); if (!e.target.value) setShowNote(false) }}
            className="bg-palace-smoke border border-palace-stone text-white/60 text-xs p-2 w-full mt-2 rounded-none resize-none focus:outline-none focus:border-gold/30" />
        )}
      </div>
      <div className="flex flex-col items-end flex-shrink-0">
        <span className="font-display text-sm text-gold">${(item.price * item.quantity).toFixed(2)}</span>
        <div className="flex items-center gap-1 mt-2">
          <button onClick={onDecrement} className="w-6 h-6 border border-gold/30 text-gold/60 hover:border-gold hover:text-gold text-xs flex items-center justify-center transition-all" aria-label="Decrease">−</button>
          <span className="font-display text-xs text-gold w-5 text-center">{item.quantity}</span>
          <button onClick={onIncrement} className="w-6 h-6 border border-gold/30 text-gold/60 hover:border-gold hover:text-gold text-xs flex items-center justify-center transition-all" aria-label="Increase">+</button>
        </div>
        <button onClick={onRemove} className="font-body text-[10px] text-white/20 hover:text-red-400 transition-colors cursor-pointer mt-2">Remove</button>
      </div>
    </div>
  )
}

function SummaryRow({ label, value, valueClass = 'text-white/70' }: { label: string; value: string; valueClass?: string }) {
  return <div className="flex justify-between"><span className="font-body text-xs text-white/40 tracking-wide">{label}</span><span className={`font-body text-xs ${valueClass}`}>{value}</span></div>
}
