import { optimizedImage } from '@/sanity.client'
import type { RestaurantInfo } from '@/types/sanity'

interface StructuredDataProps {
  info: RestaurantInfo
}

export default function StructuredData({ info }: StructuredDataProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://qasrafghan.com'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: info.name,
    description: info.seoDescription,
    url: siteUrl,
    telephone: info.phone,
    email: info.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: info.address,
      addressLocality: 'Buffalo',
      addressRegion: 'NY',
      addressCountry: 'US',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '42.8864',
      longitude: '-78.8784',
    },
    servesCuisine: ['Afghan', 'Middle Eastern', 'Central Asian'],
    priceRange: '$$',
    currenciesAccepted: 'USD',
    paymentAccepted: 'Cash, Credit Card',
    openingHoursSpecification: info.openingHours?.map(h => ({
      '@type': 'OpeningHoursSpecification',
      opens:  h.hours?.split(/[-–—]/)[0]?.trim() ?? '00:00',
      closes: h.hours?.split(/[-–—]/)[1]?.trim() ?? '00:00',
    })) ?? [],
    hasMenu: `${siteUrl}/#menu`,
    acceptsReservations: info.reservationUrl ? 'True' : 'False',
    ...(info.reservationUrl && { reservationUrl: info.reservationUrl }),
    ...(info.logo && { image: optimizedImage(info.logo, { width: 512, height: 512 }) }),
    sameAs: [info.instagramUrl].filter(Boolean),
    potentialAction: {
      '@type': 'OrderAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/#menu`,
        actionPlatform: [
          'http://schema.org/DesktopWebPlatform',
          'http://schema.org/MobileWebPlatform',
        ],
      },
      deliveryMethod: ['http://purl.org/goodrelations/v1#DeliveryModePickUp'],
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd, null, 0) }}
    />
  )
}
