'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useCart } from '@/context/CartContext'
import { client } from '@/sanity.client'
import { validatePromoCode } from '@/lib/promo'
import type { RestaurantInfo, PromoCode } from '@/types/sanity'
import { format, addDays, startOfToday, setHours, setMinutes, isBefore, isAfter, parseISO } from 'date-fns'
import { parseTimeToMinutes, parseDayRange } from '@/lib/storeHours'

export default function CartDrawer() {
  const router = useRouter()
  const {
    state, itemCount, subtotal, tax, total, storeStatus,
    incrementItem, decrementItem, removeItem, closeCart, dispatch,
    setOrderType, setIsScheduled, setScheduledTime, setGuestCount, setTableNumber,
    applyPromo, removePromo, includeUtensils, setUtensils
  } = useCart()

  const [info, setInfo] = useState<(RestaurantInfo & { activePromos?: PromoCode[] }) | null>(null)
  const [promoInput, setPromoInput] = useState('')
  const [promoError, setPromoError] = useState<string | null>(null)
  const [isPromoOpen, setIsPromoOpen] = useState(false)
  const [shake, setShake] = useState(false)

  // Scheduling states
  const [availableDates, setAvailableDates] = useState<Date[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedDateSlots, setSelectedDateSlots] = useState<Date[]>([])

  useEffect(() => {
    async function loadInfo() {
      try {
        const res = await fetch('/api/restaurant-info', { cache: 'no-store' })
        const data = await res.json()
        setInfo(data)
      } catch (e) {
        console.error('Failed to load restaurant info', e)
      }
    }
    loadInfo()
  }, [])

  useEffect(() => {
    const today = startOfToday()
    setAvailableDates([today, addDays(today, 1), addDays(today, 2)])
    // Auto-select today if scheduling is enabled but no date picked
    if (state.isScheduled && !selectedDate) {
      setSelectedDate(today)
    }
  }, [state.isScheduled, selectedDate])

  useEffect(() => {
    if (!selectedDate || !info?.openingHours) {
      setSelectedDateSlots([])
      return
    }

    const dayIndex = selectedDate.getDay()
    const hoursForDay = info.openingHours.find(h => {
      const days = parseDayRange(h.days)
      return days.includes(dayIndex)
    })

    if (!hoursForDay || hoursForDay.isClosed) {
      setSelectedDateSlots([])
      return
    }

    const hoursParts = hoursForDay.hours.split(/\s*[-–—]\s*/)
    const openStr    = hoursParts[0]?.trim()
    const closeStr   = hoursParts[1]?.trim()

    const openMins = parseTimeToMinutes(openStr)
    const closeMins = parseTimeToMinutes(closeStr)

    const slots: Date[] = []
    let currentMins = openMins

    while (currentMins <= closeMins - 30) {
      const h = Math.floor(currentMins / 60)
      const m = currentMins % 60
      const slotTime = setMinutes(setHours(selectedDate, h), m)
      
      const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
      const bufferTime = new Date(Date.now() + 60 * 60 * 1000)

      if (!isToday || isAfter(slotTime, bufferTime)) {
        slots.push(slotTime)
      }
      currentMins += 30
    }
    if (slots.length === 0) {
      console.warn('[CartDrawer] No slots found for', format(selectedDate, 'yyyy-MM-dd'), {
        openMins, closeMins, isToday: format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
      })
    }
    setSelectedDateSlots(slots)
  }, [selectedDate, info?.openingHours])

  const handleApplyPromo = () => {
    if (!info) return
    const result = validatePromoCode(promoInput, info?.activePromos || [], subtotal, state.items)
    if (result.valid) {
      applyPromo(promoInput.toUpperCase(), result.discount)
      setPromoError(null)
      setIsPromoOpen(false)
    } else {
      setPromoError(result.error || 'Invalid code')
      setShake(true)
      setTimeout(() => setShake(false), 500)
    }
  }

  const isBasePickup = state.orderType === 'pickup' || state.orderType === 'pickup-scheduled'
  const isBaseDineIn = state.orderType === 'dine-in' || state.orderType === 'reservation'

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
                <p className="font-body text-xs text-gold-muted tracking-wide">{itemCount} item{itemCount !== 1 ? 's' : ''} · {state.orderType === 'dine-in' ? `Table ${state.tableNumber || '?'}` : 'Pickup'}</p>
              </div>
              <button onClick={closeCart} className="w-8 h-8 border border-palace-stone text-white/40 hover:text-gold hover:border-gold transition-all duration-200 flex items-center justify-center" aria-label="Close cart">✕</button>
            </div>

            {/* SCROLLABLE CONTENT */}
            <div className="flex-1 overflow-y-auto min-h-0">
              {/* Order Type Selector */}
              <div className="px-6 py-4 bg-palace-smoke/50 border-b border-palace-stone space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => { setOrderType('pickup'); setIsScheduled(false); setScheduledTime(null); }}
                  className={`relative p-3 border text-left transition-all duration-300 ${isBasePickup ? 'bg-gold/8 border-gold shadow-[0_0_15px_rgba(201,168,76,0.1)] text-cream' : 'bg-transparent border-palace-stone text-cream/40 hover:border-white/20 hover:opacity-100'}`}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-2xl">🏪</span>
                  </div>
                  <h3 className="font-display text-base font-light mt-2">Pickup</h3>
                  {isBasePickup && <motion.div layoutId="active-tick" className="absolute top-2 right-2 text-gold text-xs">✓</motion.div>}
                </button>

                <button
                  onClick={() => { setOrderType('dine-in'); setIsScheduled(false); setScheduledTime(null); }}
                  className={`relative p-3 border text-left transition-all duration-300 ${isBaseDineIn ? 'bg-gold/8 border-gold shadow-[0_0_15px_rgba(201,168,76,0.1)] text-cream' : 'bg-transparent border-palace-stone text-cream/40 hover:border-white/20 hover:opacity-100'}`}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-2xl">🍽️</span>
                  </div>
                  <h3 className="font-display text-base font-light mt-2">Dine In</h3>
                  {isBaseDineIn && <motion.div layoutId="active-tick" className="absolute top-2 right-2 text-gold text-xs">✓</motion.div>}
                </button>
              </div>

              {/* Timing Sub-options */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsScheduled(false)
                    setScheduledTime(null)
                    setOrderType(isBasePickup ? 'pickup' : 'dine-in')
                  }}
                  className={`flex-1 py-2 font-body text-xs rounded-full transition-colors ${!state.isScheduled ? 'bg-palace-maroon text-cream' : 'text-cream/30 hover:bg-white/5'}`}
                >
                  {isBasePickup ? 'Order Now' : 'Arrive Now'}
                </button>
                <button
                  onClick={() => {
                    setIsScheduled(true)
                    setOrderType(isBasePickup ? 'pickup-scheduled' : 'reservation')
                  }}
                  className={`flex-1 py-2 font-body text-xs rounded-full transition-colors ${state.isScheduled ? 'bg-palace-maroon text-cream' : 'text-cream/30 hover:bg-white/5'}`}
                >
                  {isBasePickup ? 'Schedule for Later' : 'Reserve for Later'}
                </button>
              </div>

              {/* Date/Time Picker */}
              <AnimatePresence>
                {state.isScheduled && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="mt-4">
                      <label className="font-body text-[10px] tracking-widest uppercase text-cream/40 mb-3 block">Select Date & Time</label>
                      <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
                        {availableDates.map((date, i) => {
                          const isSel = selectedDate && format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
                          return (
                            <button
                              key={i}
                              onClick={() => { setSelectedDate(date); setScheduledTime(null); }}
                              className={`flex-shrink-0 px-4 py-2 border font-body text-xs rounded-none transition-all ${isSel ? 'border-gold bg-gold/10 text-gold' : 'border-palace-stone text-cream/30'}`}
                            >
                              {i === 0 ? `Today — ${format(date, 'EEE MMM d')}` : i === 1 ? `Tomorrow — ${format(date, 'EEE MMM d')}` : format(date, 'EEE MMM d')}
                            </button>
                          )
                        })}
                      </div>

                      {selectedDate && selectedDateSlots.length > 0 && (
                        <div className="flex overflow-x-auto gap-2 pb-2 mt-2 scrollbar-hide">
                          {selectedDateSlots.map((slot, i) => {
                            const isSel = state.scheduledTime === slot.toISOString()
                            return (
                              <button
                                key={i}
                                onClick={() => setScheduledTime(slot.toISOString())}
                                className={`flex-shrink-0 px-4 py-2 border font-body text-xs rounded-none transition-all ${isSel ? 'border-gold bg-gold/10 text-gold' : 'border-palace-stone text-cream/30'}`}
                              >
                                {format(slot, 'h:mm a')}
                              </button>
                            )
                          })}
                        </div>
                      )}

                      {selectedDate && selectedDateSlots.length === 0 && (
                        <p className="font-body text-[10px] text-red-400/60 italic mt-2">No available times for this date.</p>
                      )}

                      {state.scheduledTime && (
                        <div className="font-body text-xs text-gold border border-gold/20 px-3 py-2 mt-2 text-center">
                          {isBasePickup ? 'Ready at' : 'Arriving at'} {format(parseISO(state.scheduledTime), 'h:mm a')} on {format(parseISO(state.scheduledTime), 'EEEE')}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Dine-In Extras */}
              <AnimatePresence>
                {isBaseDineIn && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="mt-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="font-body text-[10px] tracking-widest uppercase text-cream/40">Number of Guests</label>
                        <div className="flex items-center gap-3 bg-palace-smoke border border-palace-stone px-2 py-1">
                          <button onClick={() => setGuestCount(Math.max(1, (state.guestCount || 1) - 1))} className="w-6 h-6 flex items-center justify-center text-white/50 hover:text-gold">−</button>
                          <span className="font-display text-sm w-4 text-center text-white">{state.guestCount || 1}</span>
                          <button onClick={() => setGuestCount(Math.min(info?.maxPartySize ?? 20, (state.guestCount || 1) + 1))} className="w-6 h-6 flex items-center justify-center text-white/50 hover:text-gold">+</button>
                        </div>
                      </div>
                      
                      <div>
                        <input
                          type="number"
                          placeholder={`Table no. (1–${info?.totalTables ?? 16}) — optional`}
                          value={state.tableNumber}
                          onChange={(e) => setTableNumber(e.target.value)}
                          min="1" max={info?.totalTables ?? 16}
                          className="w-full bg-transparent border border-palace-stone px-4 py-2.5 text-cream text-sm rounded-none focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 placeholder:text-cream/20 font-body transition-all"
                        />
                        <p className="font-body text-[9px] italic text-cream/20 mt-1">Leave blank if you do not know your table yet.</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              </div>

              {/* Items */}
              <div className="px-6 py-4 space-y-4">
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
            </div>

            {/* Summary */}
            {state.items.length > 0 && (
              <div className="flex-shrink-0 border-t border-palace-stone px-6 py-5 space-y-2">
                {/* Utensils Toggle */}
                <div className="flex items-center justify-between py-3 border-b border-palace-stone/40 mb-2">
                  <div>
                    <p className="font-body text-sm text-cream">Include utensils?</p>
                    <p className="font-body text-[10px] text-cream/30">Napkins, fork, knife, spoon</p>
                  </div>
                  <button
                    onClick={() => setUtensils(!includeUtensils)}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none ${includeUtensils ? 'bg-gold' : 'bg-palace-stone'}`}
                    aria-label="Toggle utensils"
                  >
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${includeUtensils ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                </div>

                {/* Promo Code Toggle */}
                <div className="mb-4">
                  {(info?.activePromos && info.activePromos.length > 0) && (
                    <button onClick={() => setIsPromoOpen(!isPromoOpen)} className="font-body text-xs text-cream/30 hover:text-gold underline transition-colors cursor-pointer text-left w-full">
                      🏷️ Have a promo code?
                    </button>
                  )}
                  <AnimatePresence>
                    {isPromoOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mt-3">
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            placeholder="Enter code" 
                            value={promoInput} 
                            onChange={(e) => setPromoInput(e.target.value)}
                            className="bg-transparent border border-palace-stone px-3 py-2 text-cream text-xs rounded-none focus:outline-none focus:border-gold flex-1 uppercase"
                          />
                          <button onClick={handleApplyPromo} className="border border-gold text-gold px-4 py-2 text-xs font-body uppercase hover:bg-gold hover:text-palace-black transition-colors">Apply</button>
                        </div>
                        {promoError && (
                          <motion.p animate={shake ? { x: [-5, 5, -5, 5, 0] } : {}} className="text-red-400 font-body text-[10px] mt-1">{promoError}</motion.p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {state.appliedPromoCode && (
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-green-400 text-xs font-body">✓ {state.appliedPromoCode} applied — saving ${state.promoDiscountAmount.toFixed(2)}</span>
                      <button onClick={removePromo} className="text-cream/30 text-xs font-body hover:text-white transition-colors">× Remove</button>
                    </div>
                  )}
                </div>

                <SummaryRow label="Subtotal" value={`$${subtotal.toFixed(2)}`} />
                <SummaryRow label="Tax (8%)" value={`$${tax.toFixed(2)}`} />
                {state.appliedPromoCode && (
                  <div className="flex justify-between"><span className="font-body text-xs text-green-400 tracking-wide">Promo ({state.appliedPromoCode})</span><span className="font-body text-xs text-green-400">−${state.promoDiscountAmount.toFixed(2)}</span></div>
                )}
                <SummaryRow label={isBaseDineIn ? 'Service' : 'Pickup'} value={isBaseDineIn ? 'AT TABLE' : 'FREE'} valueClass="text-gold" />
                <div className="border-t border-palace-stone/50 my-2" />
                <div className="flex justify-between">
                  <span className="font-display text-base text-white">Total</span>
                  <span className="font-display text-base text-gold">${total.toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* Footer */}
            {state.items.length > 0 && (
              <div className="flex-shrink-0 px-6 pb-8 pt-4 bg-palace-charcoal border-t border-palace-stone/30">
                {storeStatus.isOpen && storeStatus.closingTime && (
                  <p className="font-body text-[10px] text-yellow-500/60 text-center mb-2">⏱ {storeStatus.closingTime}</p>
                )}
                {!storeStatus.isOpen && (
                  <p className="font-body text-[10px] text-red-400/60 text-center mb-2">🔴 {storeStatus.message}</p>
                )}
                <motion.button
                  disabled={(state.isScheduled && !state.scheduledTime)}
                  onClick={() => { closeCart(); router.push('/checkout') }}
                  className="bg-gold text-palace-black w-full py-4 rounded-none font-body font-semibold text-sm tracking-[0.2em] uppercase flex items-center justify-center gap-3 disabled:opacity-40 disabled:grayscale-[0.5] disabled:cursor-not-allowed shadow-xl"
                  whileHover={(state.isScheduled && !state.scheduledTime) ? {} : { boxShadow: '0 0 30px rgba(201,168,76,0.5)' }}
                  whileTap={(state.isScheduled && !state.scheduledTime) ? {} : { scale: 0.98 }}>
                  {state.isScheduled && !state.scheduledTime ? 'Select a Time to Continue' : 'Proceed to Checkout →'}
                </motion.button>
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
