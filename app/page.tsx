import type { Metadata } from 'next'
import { fetchRestaurantInfo, fetchMenuByCategory, fetchTeamMembers, fetchTestimonials } from '@/lib/fetchData'
import { optimizedImage } from '@/sanity.client'
import SiteNav from '@/components/SiteNav'
import HeroSection from '@/components/HeroSection'
import RoyalMenuSection from '@/components/RoyalMenuSection'
import TestimonialsSection from '@/components/TestimonialsSection'
import AboutSection from '@/components/AboutSection'
import GallerySection from '@/components/GallerySection'
import ContactSection from '@/components/ContactSection'
import SiteFooter from '@/components/SiteFooter'
import StickyOrderBar from '@/components/StickyOrderBar'
import StructuredData from '@/components/StructuredData'
import SizzleDivider from '@/components/SizzleDivider'
import StatsBar from '@/components/StatsBar'

// ── Dynamic SEO Metadata from Sanity ──
export async function generateMetadata(): Promise<Metadata> {
  const info = await fetchRestaurantInfo()
  const fallbackTitle = 'Qasr Afghan | Palace Dining — Buffalo, NY'
  const fallbackDescription = 'Authentic Afghan cuisine served in an upscale, palace-inspired setting in Buffalo, NY.'

  return {
    title: info?.seoTitle ?? fallbackTitle,
    description: info?.seoDescription ?? fallbackDescription,
    openGraph: {
      title: info?.seoTitle ?? 'Qasr Afghan',
      description: info?.seoDescription ?? fallbackDescription,
      images: info?.seoImage ? [{ url: optimizedImage(info.seoImage, { width: 1200, height: 630 }) }] : [],
      type: 'website',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: info?.seoTitle ?? 'Qasr Afghan',
      description: info?.seoDescription ?? fallbackDescription,
    },
  }
}

function StudioNotConfigured() {
  return (
    <div className="min-h-screen bg-palace-black flex flex-col items-center justify-center gap-6 px-6">
      <span className="text-gold text-3xl">◆</span>
      <p className="text-gold font-body tracking-wider text-center">Studio not yet configured. Visit /studio to add restaurant content.</p>
      <a href="/studio" className="border border-gold text-gold font-body text-xs tracking-[0.2em] uppercase px-6 py-3 hover:bg-gold hover:text-palace-black transition-all duration-300">Open Studio →</a>
    </div>
  )
}

export default async function Page() {
  const [info, menuByCategory, team, testimonials] = await Promise.all([
    fetchRestaurantInfo(),
    fetchMenuByCategory(),
    fetchTeamMembers(),
    fetchTestimonials(),
  ])

  if (!info) return <StudioNotConfigured />

  return (
    <>
      <StructuredData info={info} />

      <SiteNav
        logo={info.logo}
        restaurantName={info.name}
        reservationUrl={info.reservationUrl}
      />

      <main>
        <HeroSection info={info} />

        <StatsBar />
        <SizzleDivider intensity="strong" />

        <RoyalMenuSection
          menuByCategory={menuByCategory}
          restaurantName={info.name}
        />

        <SizzleDivider intensity="medium" />

        {info.galleryImages?.length > 0 && (
          <GallerySection images={info.galleryImages} />
        )}

        <TestimonialsSection testimonials={testimonials} />

        <SizzleDivider intensity="subtle" />

        <AboutSection
          title={info.aboutTitle ?? 'A Palace of Flavors'}
          body={info.aboutBody ?? []}
          image={info.aboutImage}
          team={team}
          openingYear={info.openingYear}
        />

        <SizzleDivider intensity="subtle" />

        <ContactSection
          address={info.address}
          phone={info.phone}
          email={info.email}
          instagramUrl={info.instagramUrl}
          reservationUrl={info.reservationUrl}
          openingHours={info.openingHours ?? []}
          googleMapsEmbed={info.googleMapsEmbed}
        />
      </main>

      <SiteFooter
        restaurantName={info.name}
        logo={info.logo}
        address={info.address}
        phone={info.phone}
        email={info.email}
        instagramUrl={info.instagramUrl}
        reservationUrl={info.reservationUrl}
        openingHours={info.openingHours}
      />

      <StickyOrderBar
        restaurantName={info.name}
      />
    </>
  )
}
