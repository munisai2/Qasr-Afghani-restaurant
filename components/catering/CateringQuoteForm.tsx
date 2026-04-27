'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import TurnstileWidget from '@/components/TurnstileWidget'
import { AnalyticsEvents } from '@/lib/analytics'
import MagneticButton from '@/components/MagneticButton'

interface QuoteFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  selectedPlan: string
  eventDate: string
  guestCount: number
  message: string
}

interface CateringQuoteFormProps {
  planTitles: string[]
}

export default function CateringQuoteForm({ planTitles }: CateringQuoteFormProps) {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState('')
  const [submittedPhone, setSubmittedPhone] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(false)
  const [minDate, setMinDate] = useState('')
  const [turnstileToken, setTurnstileToken] = useState<string>('')

  const phone = process.env.NEXT_PUBLIC_RESTAURANT_PHONE

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<QuoteFormData>()

  useEffect(() => {
    setMinDate(new Date().toISOString().split('T')[0])

    const params = new URLSearchParams(window.location.search)
    const plan = params.get('plan')
    if (plan) setValue('selectedPlan', plan)

    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (detail) setValue('selectedPlan', detail)
    }
    window.addEventListener('catering-plan-selected', handler)
    return () => window.removeEventListener('catering-plan-selected', handler)
  }, [setValue])

  const onSubmit = async (formData: QuoteFormData) => {
    setIsSubmitting(true)
    setSubmitError(false)
    try {
      const res = await fetch('/api/catering-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          turnstileToken,
        }),
      })
      if (!res.ok) throw new Error('Server error')
      setSubmittedEmail(formData.email || '')
      setSubmittedPhone(formData.phone || '')
      setIsSubmitted(true)
      reset()
      AnalyticsEvents.cateringInquiry(Number(formData.guestCount))
    } catch (err) {
      console.error('[catering-form] Submit error:', err)
      setSubmitError(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  const turnstileConfigured = !!(siteKey && siteKey !== 'your_site_key_here')
  const submitDisabled = isSubmitting || (turnstileConfigured && !turnstileToken)

  return (
    <section id="quote-form" className="bg-palace-charcoal py-24 px-6 md:px-16 border-t border-palace-stone">
      <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
        <p className="font-body text-xs tracking-[0.35em] uppercase text-gold-muted mb-4">START THE CONVERSATION</p>
        <h2 className="font-display text-5xl md:text-6xl font-light text-white tracking-wide mb-4">
          Request a <span className="text-shimmer">Quote</span>
        </h2>
        <p className="font-body text-sm text-white/40 max-w-lg mx-auto leading-relaxed mt-2">
          Our team will respond within 24 hours to discuss your vision for the perfect palace event.
        </p>
        <div className="relative flex items-center justify-center w-32 my-6 mx-auto">
          <div className="absolute inset-0 border-t border-gold/30 top-1/2" />
          <span className="relative bg-palace-charcoal px-3 text-gold text-xs">◆</span>
        </div>
      </motion.div>

      <div className="max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          {isSubmitted ? (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16">
              <motion.span animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} className="text-gold text-5xl inline-block">◆</motion.span>
              <h3 className="font-display text-3xl font-light text-white tracking-wide mt-6">Your Request Has Been Sent to the Palace</h3>
              {submittedEmail ? (
                <>
                  <p className="font-body text-sm text-white/50 max-w-sm mx-auto mt-4 leading-relaxed">
                    Our catering team will contact you within 24 hours to discuss your event.
                  </p>
                  <p className="font-body text-xs text-white/30 max-w-sm mx-auto mt-2 italic">
                    A confirmation email has been sent to your email address.
                  </p>
                </>
              ) : (
                <p className="font-body text-sm text-white/50 max-w-sm mx-auto mt-4 leading-relaxed">
                  We will contact you at {submittedPhone} within 24 hours.
                </p>
              )}
              <button onClick={() => setIsSubmitted(false)} className="font-body text-xs text-gold underline mt-8 hover:text-gold-light transition-colors">Send Another Request</button>
            </motion.div>
          ) : (
            <motion.form key="form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FieldWrapper label="First Name" error={errors.firstName?.message}>
                  <input {...register('firstName', { required: 'Required' })} className="form-input" placeholder="First name" />
                </FieldWrapper>
                <FieldWrapper label="Last Name" error={errors.lastName?.message}>
                  <input {...register('lastName', { required: 'Required' })} className="form-input" placeholder="Last name" />
                </FieldWrapper>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FieldWrapper label="Email Address" error={errors.email?.message}>
                  <input {...register('email', { required: 'Required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })} className="form-input" placeholder="you@company.com" type="email" suppressHydrationWarning />
                </FieldWrapper>
                <FieldWrapper label="Phone Number" error={errors.phone?.message}>
                  <input {...register('phone', { required: 'Required' })} className="form-input" placeholder="(716) 555-0123" type="tel" />
                </FieldWrapper>
              </div>

              <FieldWrapper label="Catering Package (optional)">
                <div className="relative">
                  <select {...register('selectedPlan')} className="form-input appearance-none pr-10">
                    <option value="">Select a package...</option>
                    {planTitles.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <svg viewBox="0 0 12 8" fill="none" className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none"><path d="M1 1l5 5 5-5" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" /></svg>
                </div>
              </FieldWrapper>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FieldWrapper label="Event Date" error={errors.eventDate?.message}>
                  <input {...register('eventDate', { required: 'Required' })} type="date" min={minDate} className="form-input" />
                </FieldWrapper>
                <FieldWrapper label="Number of Guests" error={errors.guestCount?.message}>
                  <input {...register('guestCount', { required: 'Required', min: { value: 20, message: 'Minimum 20 guests' } })} type="number" min="20" placeholder="e.g. 50" className="form-input" />
                </FieldWrapper>
              </div>

              <FieldWrapper label="Tell Us About Your Event" error={errors.message?.message}>
                <textarea {...register('message', { required: 'Please describe your event' })} rows={5} className="form-input resize-none" placeholder="Describe your event — occasion, vision, dietary requirements, preferred date range..." />
              </FieldWrapper>

              {/* Turnstile Widget */}
              <TurnstileWidget onSuccess={setTurnstileToken} />

              <MagneticButton type="submit" disabled={submitDisabled}
                className="bg-gold text-palace-black font-body font-bold text-sm tracking-[0.25em] uppercase py-5 w-full mt-8 rounded-none flex items-center justify-center gap-3 disabled:opacity-70 hover:shadow-[0_0_40px_rgba(201,168,76,0.5)] active:scale-[0.98] transition-all duration-300"
              >
                {isSubmitting ? <><span className="w-5 h-5 border-2 border-palace-black/30 border-t-palace-black rounded-full animate-spin" /> Sending to the Palace...</> : 'Send Request  ✦'}
              </MagneticButton>

              {turnstileConfigured && !turnstileToken && !isSubmitting && (
                <p className="font-body text-[10px] text-white/20 text-center mt-2">
                  Verifying you are human...
                </p>
              )}

              {submitError && (
                <p className="font-body text-sm text-red-400/80 text-center mt-4">
                  Could not send your request. Please call us at{' '}
                  {phone ? (
                    <a href={`tel:${phone}`} className="text-gold underline">{phone}</a>
                  ) : (
                    'the restaurant'
                  )}
                </p>
              )}
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}

function FieldWrapper({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <div><label className="font-body text-xs tracking-widest uppercase text-white/40 mb-1 block">{label}</label>{children}{error && <p className="font-body text-xs text-red-400 mt-1">{error}</p>}</div>
}
