'use client'

import Image from 'next/image'
import { optimizedImage } from '@/sanity.client'
import StudioBackdoor from './StudioBackdoor'
import type { SanityImage, OpeningHours } from '@/types/sanity'

interface SiteFooterProps {
  restaurantName: string
  logo: SanityImage | null
  address: string
  phone: string
  email: string
  instagramUrl: string
  reservationUrl: string
  openingHours?: OpeningHours[]
}

const NAV_LINKS = [
  { label: 'Menu',     href: '#menu' },
  { label: 'About',    href: '#about' },
  { label: 'Gallery',  href: '#gallery' },
  { label: 'Contact',  href: '#contact' },
  { label: 'Catering', href: '/catering' },
]

export default function SiteFooter({
  restaurantName, logo, address, phone, email,
  instagramUrl, reservationUrl, openingHours,
}: SiteFooterProps) {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-palace-black border-t border-gold/10 pt-16 pb-8 px-6 md:px-16">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-palace-stone">
        <div>
          {logo ? <Image src={optimizedImage(logo, { width: 96, height: 96 })} alt={restaurantName} width={48} height={48} style={{ objectFit: 'contain', width: '48px', height: 'auto' }} /> : <span className="font-display italic text-xl text-gold">{restaurantName}</span>}
          {address && <p className="font-body text-xs text-white/30 mt-3 leading-relaxed">{address}</p>}
          <div className="flex gap-2 mt-4">
            {instagramUrl && <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="w-8 h-8 border border-gold/20 flex items-center justify-center text-gold/40 hover:text-gold hover:border-gold transition-all duration-300" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="5" /></svg></a>}
            {address && <a href={`https://maps.google.com/?q=${encodeURIComponent(address)}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 border border-gold/20 flex items-center justify-center text-gold/40 hover:text-gold hover:border-gold transition-all duration-300" aria-label="Location"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg></a>}
          </div>
        </div>
        <div>
          <h4 className="font-body text-xs tracking-widest uppercase text-gold-muted mb-4">Navigate</h4>
          {NAV_LINKS.map((link) => <a key={link.href} href={link.href.startsWith('#') ? `/${link.href}` : link.href} className="font-body text-sm text-white/35 hover:text-gold transition-colors block mb-2">{link.label}</a>)}
        </div>
        <div>
          <h4 className="font-body text-xs tracking-widest uppercase text-gold-muted mb-4">Hours</h4>
          {openingHours && openingHours.slice(0, 2).map((h, i) => (
            <div key={i} className="flex justify-between mb-2">
              <span className="font-body text-xs text-white/35">{h.days}</span>
              <span className={`font-body text-xs ${h.isClosed ? 'text-red-400' : 'text-gold/60'}`}>{h.isClosed ? 'Closed' : h.hours}</span>
            </div>
          ))}
          {openingHours && openingHours.length > 2 && <a href="#contact" className="font-body text-xs text-gold/40 hover:text-gold transition-colors">View all hours →</a>}
        </div>
        <div>
          <h4 className="font-body text-xs tracking-widest uppercase text-gold-muted mb-4">Visit Us</h4>
          {reservationUrl && <a href={reservationUrl} target="_blank" rel="noopener noreferrer" className="block w-full text-center border border-gold/40 text-gold font-body text-xs tracking-[0.15em] uppercase py-3 hover:bg-gold hover:text-palace-black transition-all duration-300">Make a Reservation</a>}
          <a href="/#menu" className="block w-full text-center border border-gold/40 text-gold font-body text-xs tracking-[0.15em] uppercase py-3 mt-2 hover:bg-gold hover:text-palace-black transition-all duration-300">Explore Menu</a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center pt-8 gap-2">
        <p className="font-body text-xs text-white/20">© {currentYear} {restaurantName}. All rights reserved.</p>
        <div className="flex items-center gap-2">
          <span className="font-body text-xs text-white/15 italic">Crafted with care in Buffalo, NY</span>
          <StudioBackdoor />
        </div>
      </div>
    </footer>
  )
}
