import { defineField, defineType } from 'sanity'

export default defineType({
  name:  'googleReviewsCache',
  title: 'Google Reviews Cache (auto-managed)',
  type:  'document',
  // @ts-ignore - Hidden from types but still works in Sanity v3
  __experimental_actions: ['update', 'publish'],
  fields: [
    defineField({ 
      name:  'reviewsJson', 
      type:  'text', 
      title: 'Cached Reviews (JSON — do not edit manually)',
      readOnly: false,
    }),
    defineField({ name: 'rating',     type: 'number', title: 'Google Rating' }),
    defineField({ name: 'totalCount', type: 'number', title: 'Total Review Count' }),
    defineField({ name: 'fetchedAt',  type: 'datetime', title: 'Last Fetched' }),
  ],
  preview: {
    select: { fetchedAt: 'fetchedAt', rating: 'rating' },
    prepare({ fetchedAt, rating }) {
      return {
        title:    `Google Reviews Cache`,
        subtitle: `Rating: ${rating} ★ — Last fetched: ${fetchedAt ?? 'Never'}`,
      }
    }
  }
})
