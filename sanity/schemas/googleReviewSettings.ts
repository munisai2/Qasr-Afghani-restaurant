import { defineField, defineType } from 'sanity'

export default defineType({
  name:  'googleReviewSettings',
  title: '⭐ Google Reviews Settings',
  type:  'document',
  // @ts-ignore - Hidden from types but still works in Sanity v3
  __experimental_actions: ['update', 'publish'],
  fields: [
    defineField({
      name:         'enabled',
      title:        'Show Reviews Section on Website',
      type:         'boolean',
      initialValue: true,
    }),
    defineField({
      name:         'maxReviews',
      title:        'Maximum Reviews to Show (max 15)',
      type:         'number',
      initialValue: 15,
      validation:   Rule => Rule.min(1).max(15),
      description:  'Sanity reviews fill first, then Google fills the rest up to this number.',
    }),
    defineField({
      name:         'minRating',
      title:        'Minimum Google Review Rating to Show',
      type:         'number',
      initialValue: 4,
      options: {
        list: [
          { title: '⭐⭐⭐ 3 stars and above', value: 3 },
          { title: '⭐⭐⭐⭐ 4 stars and above', value: 4 },
          { title: '⭐⭐⭐⭐⭐ 5 stars only',     value: 5 },
        ]
      },
      description: 'Google reviews below this rating are hidden automatically.',
    }),
    defineField({
      name:        'hiddenReviewIds',
      title:       'Hidden Google Review Author URLs',
      type:        'array',
      of:          [{ type: 'string' }],
      description: 'Paste the Google reviewer profile URL to hide their review. ' +
                   'Copy from the review management page.',
    }),
  ],
  preview: {
    prepare() {
      return {
        title:    'Google Reviews Settings',
        subtitle: 'Control which reviews appear on the website',
      }
    }
  }
})
