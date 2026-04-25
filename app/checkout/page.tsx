'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { useCart } from '@/context/CartContext'
import { AnalyticsEvents } from '@/lib/analytics'
import MagneticButton from '@/components/MagneticButton'
import { calculatePrepTime } from '@/lib/prepTime'
import { validatePromoCode } from '@/lib/promo'
import { format, addDays, startOfToday, setHours, setMinutes, isBefore, isAfter, parseISO } from 'date-fns'
import { parseTimeToMinutes, parseDayRange } from '@/lib/storeHours'
import type { OpeningHours } from '@/types/sanity'

function generateOrderId() {
  return 'QA-' + Math.random().toString(36).substring(2, 7).toUpperCase()
}

interface CheckoutForm {
  firstName: string
  lastName: string
  phone: string
  email?: string
  specialRequests?: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const { state, itemCount, subtotal, tax, total, storeStatus, openCart, clearCart, setOrderType, setIsScheduled, setScheduledTime, setGuestCount, setTableNumber } = useCart()
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [openingHours, setOpeningHours] = useState<OpeningHours[]>([])
  const [maxPartySize, setMaxPartySize] = useState(20)
  const [totalTables, setTotalTables] = useState(16)
  const [info, setInfo] = useState<any>(null)
  const [promoInput, setPromoInput] = useState('')
  const [promoError, setPromoError] = useState<string | null>(null)
  const [showPromoInput, setShowPromoInput] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [checkoutError, setCheckoutError] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [status, setStatus] = useState<'open' | 'busy' | 'paused'>('open')
  const [restaurantPhone, setRestaurantPhone] = useState('')
  const [busyExtraMinutes, setBusyExtraMinutes] = useState(0)

  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutForm>()

  useEffect(() => {
    setMounted(true)
    AnalyticsEvents.beginCheckout(itemCount, total)

    // Fetch latest status and phone
    fetch('/api/restaurant-info', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (data.restaurantStatus) setStatus(data.restaurantStatus)
        if (data.phone) setRestaurantPhone(data.phone)
        if (data.busyExtraMinutes) setBusyExtraMinutes(data.busyExtraMinutes)
        if (data.openingHours) setOpeningHours(data.openingHours)
        if (data.maxPartySize) setMaxPartySize(data.maxPartySize)
        if (data.totalTables) setTotalTables(data.totalTables)
        setInfo(data)
      })
      .catch(() => {})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const isBasePickup = state.orderType === 'pickup' || state.orderType === 'pickup-scheduled'
  const isBaseDineIn = state.orderType === 'dine-in' || state.orderType === 'reservation'

  const availableDates = [
    startOfToday(),
    addDays(startOfToday(), 1),
    addDays(startOfToday(), 2)
  ]

  const getTimeSlots = (date: Date) => {
    const dayIndex = date.getDay()
    const entry = openingHours.find(e => !e.isClosed && parseDayRange(e.days).includes(dayIndex))
    if (!entry) return []

    const [openStr, closeStr] = entry.hours.split(/\s*[-–—]\s*/)
    const openMin = parseTimeToMinutes(openStr)
    const closeMin = parseTimeToMinutes(closeStr)

    if (openMin === -1 || closeMin === -1) return []

    const slots = []
    let current = openMin

    // Start 1 hour from now if today
    const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
    if (isToday) {
      const nowMin = new Date().getHours() * 60 + new Date().getMinutes()
      current = Math.max(current, Math.ceil((nowMin + 60) / 30) * 30)
    }

    while (current <= closeMin) {
      const h = Math.floor(current / 60)
      const m = current % 60
      const d = setMinutes(setHours(date, h), m)
      
      // If today, ensure it's at least 1 hour away
      if (isToday && isBefore(d, addDays(new Date(), 0))) {
         // This check is already handled by 'current' initialization but good to be safe
      }
      
      slots.push(d)
      current += 30
    }
    return slots
  }

  const selectedDateSlots = selectedDate ? getTimeSlots(selectedDate) : []

  useEffect(() => {
    if (mounted && itemCount === 0 && !isSubmitting) router.replace('/')
  }, [mounted, itemCount, isSubmitting, router])

  const prepTimeResult = calculatePrepTime(
    state.items,
    status,
    busyExtraMinutes
  )

  const { applyPromo, removePromo } = useCart()

  const handleApplyPromo = () => {
    if (!info) return
    const result = validatePromoCode(promoInput, info?.activePromos || [], subtotal, state.items)
    if (result.valid) {
      applyPromo(promoInput.toUpperCase(), result.discount)
      setPromoError(null)
      setShowPromoInput(false)
    } else {
      setPromoError(result.error || 'Invalid code')
    }
  }

  const handleRemovePromo = () => {
    removePromo()
    setPromoInput('')
    setPromoError(null)
  }

  const onSubmit = async (data: CheckoutForm) => {
    if ((state.orderType === 'pickup-scheduled' || state.orderType === 'reservation') && !state.scheduledTime) {
      setFormError('Please select a time')
      return
    }

    try {
      setIsSubmitting(true)
      setFormError(null)

      const order = {
        orderId: generateOrderId(),
        items: [...state.items],
        orderType: state.orderType,
        tableNumber: (state.orderType === 'dine-in' || state.orderType === 'reservation') ? state.tableNumber : undefined,
        guestCount: state.guestCount,
        appliedPromoCode: state.appliedPromoCode,
        promoDiscountAmount: state.promoDiscountAmount,
        subtotal,
        tax,
        total,
        customer: { firstName: data.firstName, lastName: data.lastName, phone: data.phone, email: data.email || '' },
        specialRequests: data.specialRequests || '',
        placedAt: new Date().toISOString(),
        scheduledTime: state.scheduledTime ?? null,
      }

      sessionStorage.setItem('qasr-last-order', JSON.stringify(order))

      const orderPayload = {
        email: data.email || undefined,
        orderId: order.orderId,
        customerName: `${data.firstName} ${data.lastName}`,
        customerPhone: data.phone,
        customerEmail: data.email || '',
        items: state.items.map(i => ({ name: i.name, quantity: i.quantity, price: i.price })),
        subtotal, tax, total,
        specialRequests: data.specialRequests || undefined,
        placedAt: order.placedAt,
        orderType: state.orderType,
        tableNumber: (state.orderType === 'dine-in' || state.orderType === 'reservation') ? state.tableNumber : undefined,
        guestCount: state.guestCount,
        promoCode: state.appliedPromoCode,
        promoDiscount: state.promoDiscountAmount,
        estimatedTime: prepTimeResult.minutes,
        scheduledTime: state.scheduledTime ?? null,
      }

      // Fire-and-forget: email receipt + owner notification
      fetch('/api/send-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      }).catch(() => {})

      // Fire-and-forget: save to Sanity (permanent record)
      fetch('/api/save-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      }).catch(() => {})

      // Fire-and-forget: log to server (shows in terminal / Vercel logs)
      fetch('/api/log-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      }).catch(() => {})

      // Fire-and-forget: initial confirmation SMS
      fetch('/api/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to:   data.phone,
          type: state.scheduledTime ? 'scheduled' : 'received',
          data: {
            orderId:       order.orderId,
            customerName:  `${data.firstName} ${data.lastName}`,
            estimatedTime: prepTimeResult.minutes,
            orderType:     state.orderType,
            tableNumber:   state.tableNumber,
            guestCount:    state.guestCount,
            scheduledTime: state.scheduledTime,
          }
        })
      }).catch(() => {})

      AnalyticsEvents.orderPlaced(order.orderId, total)

      await new Promise((resolve) => setTimeout(resolve, 1500))
      clearCart()
      router.push('/order-confirmation')
    } catch (err) {
      setCheckoutError(true)
      setIsSubmitting(false)
    }
  }

  if (!mounted) return null

  // ── Paused Screen ──
  if (status === 'paused') {
    return (
      <div className="min-h-screen bg-palace-black flex flex-col items-center justify-center px-6 relative overflow-hidden">
        {/* Grain overlay */}
        <div className="grain-overlay absolute inset-0 z-0" />
        
        {/* Decorative Watermark */}
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-display italic text-gold/[0.03] text-[15rem] md:text-[25rem] select-none pointer-events-none z-0 whitespace-nowrap">
          Qasr Afghan
        </span>

        <div className="relative z-10 max-w-lg w-full bg-palace-smoke/50 backdrop-blur-sm border border-gold/20 p-8 md:p-16 text-center shadow-2xl">
          <div className="w-20 h-20 border border-gold/30 flex items-center justify-center mx-auto mb-8">
            <span className="text-4xl text-gold/60">⏸</span>
          </div>
          
          <h1 className="font-display text-3xl md:text-4xl text-white tracking-wider font-light">Online Ordering Paused</h1>
          <div className="w-12 h-[1px] bg-gold/40 mx-auto my-6" />
          
          <p className="font-body text-white/50 text-sm md:text-base leading-relaxed mb-10">
            We are currently not accepting online orders through the website. 
            However, we may still be open for phone orders and dine-in.
          </p>

          <div className="space-y-4">
            <a
              href={`tel:${restaurantPhone || '7162601613'}`}
              className="flex items-center justify-center gap-3 bg-gold text-palace-black font-body font-bold text-xs tracking-[0.2em] uppercase px-8 py-4 w-full hover:bg-white transition-all duration-500 shadow-[0_0_20px_rgba(201,168,76,0.2)]"
            >
              📞 Call to Order: {restaurantPhone || '716-260-1613'}
            </a>
            
            <button
              onClick={() => router.push('/')}
              className="block w-full border border-gold/20 text-gold/60 font-body text-[10px] tracking-[0.2em] uppercase py-4 hover:bg-gold/5 hover:text-gold transition-all duration-300"
            >
              Return to Menu
            </button>
          </div>
          
          <p className="font-body text-[10px] text-white/20 mt-12 tracking-[0.3em] uppercase italic">
            Buffalo, New York
          </p>
        </div>
      </div>
    )
  }

  // ── Error Recovery Screen ──
  if (checkoutError) {
    const phone = restaurantPhone || '716-260-1613'
    return (
      <div className="min-h-screen bg-palace-black flex flex-col items-center justify-center px-6 text-center">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-16 h-16 text-gold/60">
          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.362 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0122 16.92z" />
        </svg>
        <h1 className="font-display text-4xl font-light text-white tracking-wide mt-6">Something went wrong</h1>
        <p className="font-body text-sm text-white/50 max-w-sm mt-4 leading-relaxed">
          We apologize for the inconvenience. Please call us directly and we will take your order over the phone.
        </p>
        <a
          href={`tel:${phone}`}
          className="inline-flex items-center gap-3 bg-gold text-palace-black font-body font-bold text-sm tracking-[0.2em] uppercase px-10 py-4 mt-8 rounded-none hover:bg-gold-light transition-colors"
        >
          📞  {phone}
        </a>
        <button
          onClick={() => setCheckoutError(false)}
          className="font-body text-xs text-gold/40 underline mt-6 hover:text-gold transition-colors"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-palace-black pt-24 pb-20 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <a href="/#menu" className="font-body text-xs text-gold-muted tracking-widest uppercase hover:text-gold transition-colors">← Back to Menu</a>
        <h1 className="font-display text-4xl md:text-5xl font-light text-white tracking-wide mt-2 mb-10">Complete Your Order</h1>

        {/* Busy Warning */}
        {status === 'busy' && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-none px-5 py-3 mb-6">
            <p className="font-body text-sm text-amber-400">
              ⏱ We are currently busy. Your order may take a little longer than usual. Thank you for your patience!
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
            {/* 01 · Order Type */}
            <div>
              <h2 className="font-display text-lg font-light text-white tracking-wide border-l-2 border-gold pl-4 mb-6">01  ·  Order Type</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => { setOrderType('pickup'); setIsScheduled(false); setScheduledTime(null); }}
                  className={`relative p-5 border text-left transition-all duration-300 ${isBasePickup ? 'bg-gold/10 border-gold shadow-[0_0_15px_rgba(201,168,76,0.1)] text-cream' : 'bg-palace-smoke border-palace-stone opacity-60 hover:opacity-100 hover:border-white/20'}`}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-3xl">🏪</span>
                    <span className="bg-gold text-[10px] text-palace-black font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Free</span>
                  </div>
                  <h3 className="font-display text-lg text-white mt-3">Pickup</h3>
                  <p className="font-body text-xs text-white/40">Ready in 25–35 min</p>
                </button>

                <button
                  type="button"
                  onClick={() => { setOrderType('dine-in'); setIsScheduled(false); setScheduledTime(null); }}
                  className={`relative p-5 border text-left transition-all duration-300 ${isBaseDineIn ? 'bg-gold/10 border-gold shadow-[0_0_15px_rgba(201,168,76,0.1)] text-cream' : 'bg-palace-smoke border-palace-stone opacity-60 hover:opacity-100 hover:border-white/20'}`}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-3xl">🍽️</span>
                    <span className="bg-gold/20 text-gold text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-gold/30">At Table</span>
                  </div>
                  <h3 className="font-display text-lg text-white mt-3">Dine In</h3>
                  <p className="font-body text-xs text-white/40">At your table</p>
                </button>
              </div>

              {/* Timing Sub-options */}
              <div className="flex gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsScheduled(false)
                    setScheduledTime(null)
                    setOrderType(isBasePickup ? 'pickup' : 'dine-in')
                  }}
                  className={`flex-1 py-3 border font-body text-xs tracking-widest uppercase transition-all ${!state.isScheduled ? 'bg-gold/10 border-gold text-gold' : 'border-palace-stone text-white/40 hover:border-white/20'}`}
                >
                  {isBasePickup ? 'Order Now' : 'Arrive Now'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsScheduled(true)
                    setOrderType(isBasePickup ? 'pickup-scheduled' : 'reservation')
                  }}
                  className={`flex-1 py-3 border font-body text-xs tracking-widest uppercase transition-all ${state.isScheduled ? 'bg-gold/10 border-gold text-gold' : 'border-palace-stone text-white/40 hover:border-white/20'}`}
                >
                  {isBasePickup ? 'Schedule for Later' : 'Reserve for Later'}
                </button>
              </div>

              {state.isScheduled && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 mt-6">
                  <div>
                    <label className="font-body text-[10px] tracking-widest uppercase text-white/30 mb-3 block">Select Date</label>
                    <div className="flex flex-wrap gap-2">
                      {availableDates.map((date, i) => {
                        const isSelected = selectedDate && format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => { setSelectedDate(date); setScheduledTime(null); }}
                            className={`px-4 py-2 border font-body text-xs transition-all ${isSelected ? 'border-gold bg-gold/10 text-gold' : 'border-palace-stone text-white/40 hover:border-white/20'}`}
                          >
                            {i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : format(date, 'EEE MMM d')}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {selectedDate && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <label className="font-body text-[10px] tracking-widest uppercase text-white/30 mb-3 block">Select Time</label>
                      {selectedDateSlots.length > 0 ? (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                          {selectedDateSlots.map((slot, i) => {
                            const isSelected = state.scheduledTime === slot.toISOString()
                            return (
                              <button
                                key={i}
                                type="button"
                                onClick={() => { setScheduledTime(slot.toISOString()); setFormError(null); }}
                                className={`py-2 border font-body text-[11px] transition-all ${isSelected ? 'border-gold bg-gold/10 text-gold' : 'border-palace-stone text-white/40 hover:border-white/20'}`}
                              >
                                {format(slot, 'h:mm a')}
                              </button>
                            )
                          })}
                        </div>
                      ) : (
                        <p className="font-body text-xs text-red-400/60 italic">No available times for this date.</p>
                      )}
                    </motion.div>
                  )}

                  {state.scheduledTime && (
                    <div className="bg-gold/5 border border-gold/20 px-4 py-3">
                      <p className="font-body text-sm text-gold">
                        ✦ {isBasePickup ? 'Your order will be ready at' : 'Arriving at'} <span className="font-bold">{format(parseISO(state.scheduledTime), 'h:mm a')}</span> on <span className="font-bold">{format(parseISO(state.scheduledTime), 'EEEE, MMM d')}</span>
                      </p>
                    </div>
                  )}
                  
                  {formError && (
                    <p className="font-body text-xs text-red-400 bg-red-400/10 border border-red-400/20 px-3 py-2">{formError}</p>
                  )}
                </motion.div>
              )}

              {isBaseDineIn && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-6">
                  <div className="flex items-center justify-between border-b border-palace-stone pb-6">
                    <label className="font-body text-xs tracking-widest uppercase text-white/40">Number of Guests</label>
                    <div className="flex items-center gap-4 bg-palace-smoke border border-palace-stone px-3 py-2">
                      <button type="button" onClick={() => setGuestCount(Math.max(1, (state.guestCount || 1) - 1))} className="w-8 h-8 flex items-center justify-center text-white/50 hover:text-gold text-lg">−</button>
                      <span className="font-display text-lg w-6 text-center text-white">{state.guestCount || 1}</span>
                      <button type="button" onClick={() => setGuestCount(Math.min(maxPartySize, (state.guestCount || 1) + 1))} className="w-8 h-8 flex items-center justify-center text-white/50 hover:text-gold text-lg">+</button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="font-body text-xs tracking-widest uppercase text-white/40 mb-3 block">Table Number (Optional)</label>
                    <input
                      type="number"
                      placeholder={`Table no. (1–${totalTables})`}
                      value={state.tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                      min="1" max={totalTables}
                      className="form-input"
                    />
                    <p className="font-body text-[10px] italic text-white/20 mt-2">Leave blank if you do not know your table yet.</p>
                  </div>
                </motion.div>
              )}


            </div>

            {/* 02 · Your Details */}
            <div>
              <h2 className="font-display text-lg font-light text-white tracking-wide border-l-2 border-gold pl-4 mb-4">02  ·  Your Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FieldWrapper label="First Name" error={errors.firstName?.message}>
                  <input {...register('firstName', { required: 'First name is required' })} className="form-input" placeholder="John" />
                </FieldWrapper>
                <FieldWrapper label="Last Name" error={errors.lastName?.message}>
                  <input {...register('lastName', { required: 'Last name is required' })} className="form-input" placeholder="Doe" />
                </FieldWrapper>
                <FieldWrapper label="Phone Number" error={errors.phone?.message}>
                  <input {...register('phone', { required: 'Phone number is required', pattern: { value: /^[\d\s\-+()]{7,}$/, message: 'Invalid phone number' } })} className="form-input" placeholder="(716) 555-0123" type="tel" />
                </FieldWrapper>
                <FieldWrapper label="Email Address (optional)">
                  <input {...register('email')} className="form-input" placeholder="john@example.com" type="email" />
                  <p className="font-body text-[10px] text-white/20 mt-1">Add your email to receive a digital receipt.</p>
                </FieldWrapper>
              </div>
            </div>

            {/* 03 · Special Requests */}
            <div>
              <h2 className="font-display text-lg font-light text-white tracking-wide border-l-2 border-gold pl-4 mb-4">03  ·  Special Requests</h2>
              <textarea {...register('specialRequests')} rows={3} className="form-input resize-none" placeholder="Allergies, special requests for the kitchen..." />
            </div>

            {/* Submit — store-aware */}
            {storeStatus.isOpen ? (
              <>
                <MagneticButton type="submit" disabled={isSubmitting || (state.orderType === 'dine-in' && !state.tableNumber)}
                  className="bg-gold text-palace-black w-full py-5 mt-8 rounded-none font-body font-bold text-sm tracking-[0.25em] uppercase flex items-center justify-center gap-3 disabled:opacity-70 hover:shadow-[0_0_40px_rgba(201,168,76,0.5)] active:scale-[0.98] transition-all duration-300"
                >
                  {isSubmitting ? <><span className="w-5 h-5 border-2 border-palace-black/30 border-t-palace-black rounded-full animate-spin" /> Placing your order...</> : <>Place {state.orderType === 'dine-in' || state.orderType === 'reservation' ? 'Dine In' : 'Pickup'} Order  ✦  ${total.toFixed(2)}</>}
                </MagneticButton>
              <p className="font-body text-xs text-white/25 text-center mt-3">
                  {state.orderType === 'pickup' || state.orderType === 'pickup-scheduled'
                    ? (state.scheduledTime 
                        ? `📅 Scheduled for ${format(parseISO(state.scheduledTime), 'EEEE, MMM d @ h:mm a')}`
                        : '🏪 Your order will be ready for pickup in 25–35 minutes')
                    : (state.scheduledTime 
                        ? `📅 Reservation for ${state.guestCount} guests at ${format(parseISO(state.scheduledTime), 'EEEE, MMM d @ h:mm a')}`
                        : `Our team will bring your order to Table ${state.tableNumber || '...'} for ${state.guestCount} guests`)}
                </p>
              </>
            ) : (
              <>
                <button type="button" disabled className="bg-palace-stone text-white/30 w-full py-5 mt-8 rounded-none font-body font-bold text-sm tracking-[0.25em] uppercase flex items-center justify-center gap-3 cursor-not-allowed">
                  Place Order  ✦  ${total.toFixed(2)}
                </button>
                <div className="border border-palace-stone bg-palace-smoke p-4 mt-4 flex items-start gap-3">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 text-gold/60 flex-shrink-0 mt-0.5"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                  <div>
                    <p className="font-display text-base text-white/60 font-light">{storeStatus.message}</p>
                    {storeStatus.nextOpenTime && <p className="font-body text-sm text-gold-muted mt-1">{storeStatus.nextOpenTime}</p>}
                    <p className="font-body text-xs text-white/25 mt-2">You can still build your order and place it when we open.</p>
                  </div>
                </div>
              </>
            )}
          </form>

          {/* Right — Order Summary */}
          <div className="hidden lg:block">
            <div className="sticky top-24 bg-palace-smoke border border-palace-stone p-6">
              <h3 className="font-display text-lg font-light text-white mb-5 tracking-wide">Order Summary</h3>
              <div className="max-h-72 overflow-y-auto space-y-0">
                {state.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-start py-3 border-b border-palace-stone/40">
                    <div><p className="font-body text-sm text-white">{item.name} <span className="text-white/30 text-xs">x{item.quantity}</span></p>
                      {item.specialInstructions && <p className="italic text-white/25 text-xs mt-0.5 truncate max-w-[200px]">{item.specialInstructions}</p>}</div>
                    <span className="font-body text-sm text-gold flex-shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between"><span className="font-body text-xs text-white/40">Subtotal</span><span className="font-body text-xs text-white/70">${subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="font-body text-xs text-white/40">Tax (8%)</span><span className="font-body text-xs text-white/70">${tax.toFixed(2)}</span></div>
                {state.appliedPromoCode && (
                  <div className="flex justify-between"><span className="font-body text-xs text-green-400 tracking-wide">Promo ({state.appliedPromoCode})</span><span className="font-body text-xs text-green-400">−${state.promoDiscountAmount.toFixed(2)}</span></div>
                )}
                <div className="flex justify-between"><span className="font-body text-xs text-white/40">{state.orderType === 'dine-in' || state.orderType === 'reservation' ? 'Service' : 'Pickup'}</span><span className="font-body text-xs text-gold">{state.orderType === 'dine-in' || state.orderType === 'reservation' ? 'AT TABLE' : 'FREE'}</span></div>
                <div className="border-t border-palace-stone/50 my-2" />
                <div className="flex justify-between"><span className="font-display text-base text-white">Total</span><span className="font-display text-base text-gold">${total.toFixed(2)}</span></div>
              </div>

              {/* Promo Code UI */}
              {(info?.activePromos && info.activePromos.length > 0) && (
                <div className="mt-6 border-t border-palace-stone/40 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowPromoInput(!showPromoInput)}
                    className="font-body text-xs text-gold flex items-center justify-between w-full uppercase tracking-widest"
                  >
                    ✦ Have a promo code?
                    <span>{showPromoInput ? '−' : '+'}</span>
                  </button>
                  <AnimatePresence>
                    {showPromoInput && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="flex gap-2 mt-4">
                          <input
                            type="text"
                            value={promoInput}
                            onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                            placeholder="Enter code..."
                            className={`flex-1 bg-transparent border border-palace-stone px-3 py-2 text-white font-body text-sm uppercase outline-none focus:border-gold transition-colors ${promoError ? 'border-red-500' : ''}`}
                            disabled={state.appliedPromoCode !== null}
                          />
                          {state.appliedPromoCode ? (
                            <button type="button" onClick={handleRemovePromo} className="px-4 py-2 bg-palace-stone text-white font-body text-xs uppercase tracking-widest hover:bg-red-900 transition-colors">Remove</button>
                          ) : (
                            <button type="button" onClick={handleApplyPromo} disabled={!promoInput} className="px-4 py-2 bg-gold text-palace-black font-body text-xs uppercase tracking-widest disabled:opacity-50 hover:bg-gold/80 transition-colors">Apply</button>
                          )}
                        </div>
                        {promoError && <p className="text-red-400 font-body text-[10px] mt-2">{promoError}</p>}
                        {state.appliedPromoCode && <p className="text-green-400 font-body text-[10px] mt-2 uppercase tracking-wide">Promo {state.appliedPromoCode} applied!</p>}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              <span className="inline-block border border-gold/30 text-gold text-xs px-3 py-1 font-body tracking-wide mt-6">
                {state.orderType === 'pickup' || state.orderType === 'pickup-scheduled' ? '🏪 Pickup Order' : `🍽️ Dine In — Table ${state.tableNumber || '...'} (${state.guestCount} guests)`}
              </span>
              {state.scheduledTime && (
                <div className="mt-2 text-gold font-body text-[10px] tracking-widest uppercase">
                  📅 Scheduled for {format(parseISO(state.scheduledTime), 'MMM d @ h:mm a')}
                </div>
              )}

              <div className="mt-4 p-3 border border-palace-stone bg-palace-smoke/50">
                <p className="font-body text-[10px] tracking-widest uppercase text-cream/30 mb-1">
                  Estimated Ready Time
                </p>
                <p className="font-display text-lg text-gold">
                  {prepTimeResult.displayText}
                </p>
                {prepTimeResult.isEstimate && (
                  <p className="font-body text-[9px] text-cream/20 mt-1 italic">
                    Exact time confirmed after order is accepted
                  </p>
                )}
                {status === 'busy' && (
                  <p className="font-body text-[9px] text-amber-400/70 mt-1">
                    ⏱ Extra time added — we are currently busy
                  </p>
                )}
              </div>

              <button onClick={openCart} className="font-body text-xs text-white/25 hover:text-gold underline cursor-pointer mt-3 block text-center w-full">Edit Order</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function FieldWrapper({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <div><label className="font-body text-xs tracking-widest uppercase text-white/40 mb-1 block">{label}</label>{children}{error && <p className="font-body text-xs text-red-400 mt-1">{error}</p>}</div>
}
