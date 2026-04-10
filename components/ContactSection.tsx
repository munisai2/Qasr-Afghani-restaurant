'use client'

import { motion } from 'framer-motion'
import { useCart } from '@/context/CartContext'
import { extractMapSrc } from '@/lib/utils'
import type { OpeningHours } from '@/types/sanity'

interface ContactSectionProps {
  address: string
  phone: string
  email: string
  instagramUrl: string
  reservationUrl: string
  openingHours: OpeningHours[]
  googleMapsEmbed: string
}

function CalendarIcon() {
  return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>)
}
function MapPinIcon() {
  return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 text-gold/60 flex-shrink-0 mt-0.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>)
}
function PhoneIcon() {
  return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 text-gold/60 flex-shrink-0 mt-0.5"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.362 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0122 16.92z" /></svg>)
}
function EmailIcon() {
  return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 text-gold/60 flex-shrink-0 mt-0.5"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 4l-10 7L2 4" /></svg>)
}
function InstagramIcon() {
  return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 text-gold/60 flex-shrink-0 mt-0.5"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="5" /><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" /></svg>)
}

export default function ContactSection({ address, phone, email, instagramUrl, reservationUrl, openingHours, googleMapsEmbed }: ContactSectionProps) {
  const { itemCount, openCart } = useCart()
  const igHandle = instagramUrl ? '@' + instagramUrl.replace(/\/$/, '').split('/').pop() : ''

  return (
    <section id="contact" className="bg-palace-charcoal py-24 md:py-36 px-6 md:px-16 border-t border-palace-stone">
      <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
        <p className="font-body text-xs tracking-[0.35em] uppercase text-gold-muted mb-4">FIND US</p>
        <h2 className="font-display text-5xl md:text-6xl font-light text-white tracking-wide mb-4">Visit the{' '}<span className="text-shimmer">Palace</span></h2>
        <div className="relative flex items-center justify-center w-32 my-6 mx-auto"><div className="absolute inset-0 border-t border-gold/30 top-1/2" /><span className="relative bg-palace-charcoal px-3 text-gold text-xs">◆</span></div>
      </motion.div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Hours */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <h3 className="font-display text-xl font-light text-white mb-6 tracking-wide">Opening Hours</h3>
          {openingHours.map((h, i) => (
            <div key={i} className="flex justify-between border-b border-palace-stone/50 pb-3 mb-3">
              <span className="font-body text-sm text-white/50">{h.days}</span>
              <span className={`font-body text-sm ${h.isClosed ? 'text-red-400' : 'text-gold'}`}>{h.isClosed ? 'Closed' : h.hours}</span>
            </div>
          ))}
          {reservationUrl && (
            <a href={reservationUrl} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 mt-6 border border-gold text-gold font-body text-xs tracking-[0.2em] uppercase py-4 hover:bg-gold hover:text-palace-black transition-all duration-300">
              <CalendarIcon /> Reserve a Table
            </a>
          )}
        </motion.div>

        {/* Contact */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}>
          <h3 className="font-display text-xl font-light text-white mb-6 tracking-wide">Get in Touch</h3>
          {address && <a href={`https://maps.google.com/?q=${encodeURIComponent(address)}`} target="_blank" rel="noopener noreferrer" className="font-body text-sm text-white/50 hover:text-gold transition-colors duration-300 flex items-start gap-3 mb-5"><MapPinIcon /><span>{address}</span></a>}
          {phone && <a href={`tel:${phone}`} className="font-body text-sm text-white/50 hover:text-gold transition-colors duration-300 flex items-start gap-3 mb-5"><PhoneIcon /><span>{phone}</span></a>}
          {email && <a href={`mailto:${email}`} className="font-body text-sm text-white/50 hover:text-gold transition-colors duration-300 flex items-start gap-3 mb-5"><EmailIcon /><span>{email}</span></a>}
          {instagramUrl && <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="font-body text-sm text-white/50 hover:text-gold transition-colors duration-300 flex items-start gap-3 mb-5"><InstagramIcon /><span>{igHandle}</span></a>}
          <button onClick={openCart} className="w-full flex items-center justify-center gap-2 mt-6 border border-gold/50 text-gold font-body text-xs tracking-[0.18em] uppercase py-4 hover:bg-gold/10 hover:border-gold transition-all duration-300">
            {itemCount > 0 ? `Continue Your Order (${itemCount} items)` : 'Start Your Order'}
          </button>
        </motion.div>

        {/* Map */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}>
          {(() => {
            const mapSrc = extractMapSrc(googleMapsEmbed)
            if (mapSrc) {
              return (
                <div className="w-full border border-palace-stone overflow-hidden" style={{ aspectRatio: '4/3' }}>
                  <iframe
                    src={mapSrc}
                    width="100%"
                    height="100%"
                    style={{ border: 0, display: 'block' }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Qasr Afghan location on Google Maps"
                  />
                </div>
              )
            }
            return (
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(address ?? '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center aspect-[4/3] w-full border border-palace-stone bg-palace-smoke text-center p-8 hover:border-gold transition-colors duration-300 group"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-gold/40 group-hover:text-gold transition-colors duration-300 mb-3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                <p className="font-body text-xs tracking-widest uppercase text-white/30 group-hover:text-gold/60 transition-colors duration-300">View on Google Maps</p>
                {address && <p className="font-body text-xs text-white/20 mt-2 leading-relaxed">{address}</p>}
              </a>
            )
          })()}
        </motion.div>
      </div>
    </section>
  )
}
