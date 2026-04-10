import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://qasrafghan.com'
  const now = new Date()

  return [
    {
      url:             baseUrl,
      lastModified:    now,
      changeFrequency: 'weekly',
      priority:        1.0,
    },
    {
      url:             `${baseUrl}/#menu`,
      lastModified:    now,
      changeFrequency: 'weekly',
      priority:        0.9,
    },
    {
      url:             `${baseUrl}/catering`,
      lastModified:    now,
      changeFrequency: 'monthly',
      priority:        0.8,
    },
    {
      url:             `${baseUrl}/#about`,
      lastModified:    now,
      changeFrequency: 'monthly',
      priority:        0.6,
    },
    {
      url:             `${baseUrl}/#contact`,
      lastModified:    now,
      changeFrequency: 'monthly',
      priority:        0.7,
    },
    {
      url:             `${baseUrl}/privacy`,
      lastModified:    now,
      changeFrequency: 'yearly',
      priority:        0.2,
    },
  ]
}
