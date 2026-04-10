'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { optimizedImage } from '@/sanity.client'
import type { CateringPlan } from '@/types/sanity'

interface CateringPlansSectionProps {
  plans: CateringPlan[]
}

export default function CateringPlansSection({ plans }: CateringPlansSectionProps) {
  if (plans.length === 0) return null

  return (
    <section className="bg-palace-black py-24 px-6 md:px-16 border-t border-palace-stone">
      <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
        <p className="font-body text-xs tracking-[0.35em] uppercase text-gold-muted mb-4">CATERING PACKAGES</p>
        <h2 className="font-display text-5xl md:text-6xl font-light text-white tracking-wide mb-4">
          Choose Your <span className="text-shimmer">Experience</span>
        </h2>
        <div className="relative flex items-center justify-center w-32 my-6 mx-auto">
          <div className="absolute inset-0 border-t border-gold/30 top-1/2" />
          <span className="relative bg-palace-black px-3 text-gold text-xs">◆</span>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan, i) => (
          <CateringPlanCard key={plan._id} plan={plan} index={i} />
        ))}
      </div>
    </section>
  )
}

function CateringPlanCard({ plan, index }: { plan: CateringPlan; index: number }) {
  const handleSelect = () => {
    const el = document.getElementById('quote-form')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
    // Set URL param for the quote form to pick up
    const url = new URL(window.location.href)
    url.hash = 'quote-form'
    url.searchParams.set('plan', plan.slug?.current ?? plan.title)
    window.history.replaceState({}, '', url.toString())
    // Dispatch a custom event so the form can react
    window.dispatchEvent(new CustomEvent('catering-plan-selected', { detail: plan.title }))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      <motion.div
        className={`relative bg-palace-smoke border flex flex-col overflow-hidden rounded-none h-full ${
          plan.isPopular ? 'border-gold/40' : 'border-palace-stone'
        }`}
        whileHover={{ y: -6, boxShadow: '0 16px 50px rgba(201,168,76,0.18), 0 0 0 1px rgba(201,168,76,0.35)' }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        {plan.isPopular && (
          <div className="bg-gold text-palace-black font-body text-[9px] tracking-[0.25em] uppercase text-center py-1.5">
            ✦ Most Popular Choice
          </div>
        )}

        <div className="relative h-52">
          {plan.coverImage ? (
            <>
              <Image src={optimizedImage(plan.coverImage, { width: 700, height: 400 })} alt={plan.title} fill sizes="(max-width: 768px) 100vw, 700px" style={{ objectFit: 'cover' }} />
              <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-palace-smoke to-transparent" />
            </>
          ) : (
            <div className="w-full h-full bg-palace-charcoal flex items-center justify-center">
              <span className="text-gold/10 text-4xl">◆</span>
            </div>
          )}
        </div>

        <div className="p-6 flex flex-col flex-1">
          <h3 className={`font-display text-2xl font-light tracking-wide ${plan.isPopular ? 'text-shimmer' : 'text-white'}`}>
            {plan.title}
          </h3>
          {plan.tagline && (
            <p className="font-body text-xs text-white/40 tracking-wide mt-1 italic">{plan.tagline}</p>
          )}

          <div className="flex items-baseline gap-1 mt-4">
            <span className="font-display text-4xl text-gold font-light">${plan.pricePerPerson}</span>
            <span className="font-display text-2xl text-gold/60">.00</span>
          </div>
          <p className="font-body text-xs text-white/30 tracking-wide">per person</p>
          <p className="font-body text-xs text-white/30 mt-1">
            {plan.minimumGuests}{plan.maximumGuests ? `–${plan.maximumGuests}` : '+'} guests
          </p>

          <div className="border-t border-gold/20 my-4" />

          {plan.includes?.length > 0 && (
            <div className="flex-1 space-y-2">
              {plan.includes.map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-gold text-[10px] flex-shrink-0 mt-0.5">✦</span>
                  <span className="font-body text-sm text-white/55">{item}</span>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={handleSelect}
            className="mt-auto pt-5 border border-gold/50 text-gold font-body text-xs tracking-[0.2em] uppercase py-3 w-full rounded-none hover:bg-gold hover:text-palace-black transition-all duration-300 text-center"
          >
            Request This Package
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
