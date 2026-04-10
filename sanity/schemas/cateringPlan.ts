import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'cateringPlan',
  title: 'Catering Plan',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Plan Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title' },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'tagline',
      title: 'Short Tagline',
      type: 'string',
    }),
    defineField({
      name: 'description',
      title: 'Full Description',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'pricePerPerson',
      title: 'Price Per Person (USD)',
      type: 'number',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'minimumGuests',
      title: 'Minimum Guests',
      type: 'number',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'maximumGuests',
      title: 'Maximum Guests (leave blank for unlimited)',
      type: 'number',
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Photo',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'includes',
      title: 'What is Included',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'isPopular',
      title: 'Mark as Most Popular?',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'order',
      title: 'Display Order (lower = first)',
      type: 'number',
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'tagline', media: 'coverImage' },
  },
})
