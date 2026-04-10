'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { useCart } from '@/context/CartContext'
import { AnalyticsEvents } from '@/lib/analytics'

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
  const { state, itemCount, subtotal, tax, total, storeStatus, openCart, clearCart } = useCart()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [checkoutError, setCheckoutError] = useState(false)
  const [mounted, setMounted] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutForm>()

  useEffect(() => {
    setMounted(true)
    AnalyticsEvents.beginCheckout(itemCount, total)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (mounted && itemCount === 0 && !isSubmitting) router.replace('/')
  }, [mounted, itemCount, isSubmitting, router])

  const onSubmit = async (data: CheckoutForm) => {
    try {
      setIsSubmitting(true)

      const order = {
        orderId: generateOrderId(),
        items: [...state.items],
        orderType: 'pickup' as const,
        subtotal,
        tax,
        total,
        customer: { firstName: data.firstName, lastName: data.lastName, phone: data.phone, email: data.email || '' },
        specialRequests: data.specialRequests || '',
        placedAt: new Date().toISOString(),
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

  // ── Error Recovery Screen ──
  if (checkoutError) {
    const phone = process.env.NEXT_PUBLIC_RESTAURANT_PHONE
    return (
      <div className="min-h-screen bg-palace-black flex flex-col items-center justify-center px-6 text-center">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-16 h-16 text-gold/60">
          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.362 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0122 16.92z" />
        </svg>
        <h1 className="font-display text-4xl font-light text-white tracking-wide mt-6">Something went wrong</h1>
        <p className="font-body text-sm text-white/50 max-w-sm mt-4 leading-relaxed">
          We apologize for the inconvenience. Please call us directly and we will take your order over the phone.
        </p>
        {phone && (
          <>
            <a
              href={`tel:${phone}`}
              className="inline-flex items-center gap-3 bg-gold text-palace-black font-body font-bold text-sm tracking-[0.2em] uppercase px-10 py-4 mt-8 rounded-none hover:bg-gold-light transition-colors"
            >
              📞  Call to Order
            </a>
            <p className="font-body text-xs text-white/25 mt-3">{phone}</p>
          </>
        )}
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

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
            {/* Your Details */}
            <div>
              <h2 className="font-display text-lg font-light text-white tracking-wide border-l-2 border-gold pl-4 mb-4">01  ·  Your Details</h2>
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

            {/* Special Requests */}
            <div>
              <h2 className="font-display text-lg font-light text-white tracking-wide border-l-2 border-gold pl-4 mb-4">02  ·  Special Requests</h2>
              <textarea {...register('specialRequests')} rows={3} className="form-input resize-none" placeholder="Allergies, special requests for the kitchen..." />
            </div>

            {/* Submit — store-aware */}
            {storeStatus.isOpen ? (
              <>
                <motion.button type="submit" disabled={isSubmitting}
                  className="bg-gold text-palace-black w-full py-5 mt-8 rounded-none font-body font-bold text-sm tracking-[0.25em] uppercase flex items-center justify-center gap-3 disabled:opacity-70"
                  whileHover={{ boxShadow: '0 0 40px rgba(201,168,76,0.5)' }} whileTap={{ scale: 0.98 }}>
                  {isSubmitting ? <><span className="w-5 h-5 border-2 border-palace-black/30 border-t-palace-black rounded-full animate-spin" /> Placing your order...</> : <>Place Pickup Order  ✦  ${total.toFixed(2)}</>}
                </motion.button>
                <p className="font-body text-xs text-white/25 text-center mt-3">🏪 Your order will be ready for pickup in 25–35 minutes</p>
              </>
            ) : (
              <>
                <button type="button" disabled className="bg-palace-stone text-white/30 w-full py-5 mt-8 rounded-none font-body font-bold text-sm tracking-[0.25em] uppercase flex items-center justify-center gap-3 cursor-not-allowed">
                  Place Pickup Order  ✦  ${total.toFixed(2)}
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
                <div className="flex justify-between"><span className="font-body text-xs text-white/40">Pickup</span><span className="font-body text-xs text-gold">FREE</span></div>
                <div className="border-t border-palace-stone/50 my-2" />
                <div className="flex justify-between"><span className="font-display text-base text-white">Total</span><span className="font-display text-base text-gold">${total.toFixed(2)}</span></div>
              </div>
              <span className="inline-block border border-gold/30 text-gold text-xs px-3 py-1 font-body tracking-wide mt-4">🏪 Pickup Order</span>
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
