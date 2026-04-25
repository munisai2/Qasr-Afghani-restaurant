import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'testimonial',
  title: 'Customer Reviews',
  type: 'document',
  fields: [
    defineField({ name: 'quote',  title: 'Review Text',    type: 'text',   validation: (r) => r.required() }),
    defineField({ name: 'author', title: 'Customer Name',  type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'source', title: 'Source', type: 'string',
      options: {
        list: [
          { title: 'Google',   value: 'google'   },
          { title: 'Yelp',     value: 'yelp'     },
          { title: 'Direct',   value: 'direct'   },
          { title: 'Facebook', value: 'facebook' },
        ],
      },
      initialValue: 'google',
    }),
    defineField({
      name:  'googleReviewUrl',
      title: 'Link to Original Review (optional)',
      type:  'url',
    }),
    defineField({
      name: 'rating', title: 'Star Rating (1–5)', type: 'number',
      validation: (r) => r.min(1).max(5),
    }),
    defineField({
      name: 'isHighlighted', title: 'Show on Homepage?', type: 'boolean',
      initialValue: false,
    }),
    defineField({ name: 'order', title: 'Display Order', type: 'number' }),
  ],
  preview: {
    select: { title: 'author', subtitle: 'quote', rating: 'rating' },
    prepare: ({ title, subtitle, rating }) => ({
      title: `${'★'.repeat(rating ?? 0)} ${title}`,
      subtitle: subtitle?.slice(0, 80) + '...',
    }),
  },
})
