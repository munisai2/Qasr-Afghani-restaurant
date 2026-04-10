import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Qasr Afghan — Palace Dining',
    short_name: 'Qasr Afghan',
    description: 'Authentic Afghan cuisine in Buffalo, NY. Order online for pickup.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0A0805',
    theme_color: '#C9A84C',
    orientation: 'portrait',
    categories: ['food', 'restaurants'],
  }
}
