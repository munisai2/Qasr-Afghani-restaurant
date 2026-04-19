export interface SanityImage {
  _type: 'image'
  asset: { _ref: string; _type: 'reference' }
  hotspot?: { x: number; y: number; height: number; width: number }
}

export interface OpeningHours {
  days: string
  hours: string
  isClosed: boolean
}

export interface GalleryImage {
  _type?: 'image' | 'videoEmbed'
  asset?: SanityImage['asset']
  hotspot?: SanityImage['hotspot']
  caption?: string
  url?: string
}

export interface RestaurantInfo {
  name: string
  tagline: string
  logo: SanityImage
  heroImage: SanityImage
  aboutTitle: string
  aboutBody: any[]
  aboutImage: SanityImage
  openingYear: string
  galleryImages: GalleryImage[]
  googleMapsEmbed: string
  openingHours: OpeningHours[]
  address: string
  phone: string
  email: string
  instagramUrl: string
  reservationUrl: string
  seoTitle: string
  seoDescription: string
  seoImage: SanityImage
}

export interface MenuItem {
  _id: string
  name: string
  slug: { current: string }
  category: string
  price: number
  description: string
  spiceLevel?: string
  includes?: string[]
  dietary?: string[]
  image: SanityImage
  isSignature: boolean
  isAvailable: boolean
}

export interface TeamMember {
  _id: string
  name: string
  role: string
  bio: string
  photo: SanityImage
  order: number
}

export interface CateringPlan {
  _id: string
  title: string
  slug: { current: string }
  tagline: string
  description: any[]
  pricePerPerson: number
  minimumGuests: number
  maximumGuests?: number
  coverImage: SanityImage
  includes: string[]
  isPopular: boolean
  order: number
}

export interface Testimonial {
  _id: string
  quote: string
  author: string
  source: 'google' | 'yelp' | 'facebook' | 'direct'
  rating: number
  isHighlighted: boolean
}

