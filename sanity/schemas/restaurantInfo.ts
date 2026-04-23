import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'restaurantInfo',
  title: 'Restaurant Info',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Restaurant Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline / Hero Subtitle',
      type: 'string',
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name:  'restaurantStatus',
      title: 'Restaurant Status',
      type:  'string',
      options: {
        list: [
          { title: '🟢 Open — accepting orders',    value: 'open'   },
          { title: '🟡 Busy — longer wait times',   value: 'busy'   },
          { title: '🔴 Paused — not taking orders', value: 'paused' },
        ],
        layout: 'radio',
      },
      initialValue: 'open',
      description:
        'Controls order acceptance on the website. ' +
        'Change from Kitchen App or Studio.',
    }),
    defineField({
      name:        'busyExtraMinutes',
      title:       'Busy Mode: Extra Prep Time (minutes)',
      type:        'number',
      description: 'When status is set to "Busy", this many minutes are added ' +
                   'to the calculated ready time for all orders.',
      initialValue: 15,
      validation:   Rule => Rule.min(0).max(120),
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero Background Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'aboutTitle',
      title: 'About Section Heading',
      type: 'string',
      initialValue: 'A Palace of Flavors',
    }),
    defineField({
      name: 'aboutBody',
      title: 'About / Story Text',
      description: 'The restaurant story. 2–3 paragraphs.',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'aboutImage',
      title: 'About Section Photo',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'openingYear',
      title: 'Opening Year (e.g. "2024")',
      type: 'string',
    }),
    defineField({
      name: 'galleryImages',
      title: 'Gallery Media (Photos & Videos)',
      type: 'array',
      of: [
        {
          type: 'image',
          name: 'image',
          title: '📷 Photo',
          options: { hotspot: true },
          fields: [
            {
              name: 'caption',
              title: 'Caption',
              type: 'string',
            },
          ],
        },
        {
          type: 'object',
          name: 'videoEmbed',
          title: '🎬 Video',
          fields: [
            {
              name: 'url',
              title: 'Video URL (YouTube or MP4)',
              type: 'url',
            },
            {
              name: 'caption',
              title: 'Caption',
              type: 'string',
            },
          ],
          preview: {
            select: { title: 'caption', subtitle: 'url' },
            prepare({ title, subtitle }) { return { title: title || 'Video', subtitle: '🎬 ' + subtitle } }
          }
        }
      ],
      validation: (rule) => rule.max(15),
    }),
    defineField({
      name: 'googleMapsEmbed',
      title: 'Google Maps Embed URL',
      description: `Paste the embed code from Google Maps. How to get it: 1. Go to Google Maps and search for the restaurant. 2. Click Share → Embed a map. 3. Click "Copy HTML" — paste the entire code here. You can also paste just the URL from the src="..." part. Either format works.`,
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'openingHours',
      title: 'Opening Hours',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'days', title: 'Days', type: 'string' },
            { name: 'hours', title: 'Hours', type: 'string' },
            {
              name: 'isClosed',
              title: 'Closed?',
              type: 'boolean',
              initialValue: false,
            },
          ],
          preview: {
            select: { title: 'days', subtitle: 'hours' },
          },
        },
      ],
    }),
    defineField({
      name: 'address',
      title: 'Full Address',
      type: 'string',
    }),
    defineField({
      name: 'phone',
      title: 'Phone Number',
      type: 'string',
    }),
    defineField({
      name: 'email',
      title: 'Contact Email',
      type: 'string',
    }),
    defineField({
      name: 'instagramUrl',
      title: 'Instagram URL',
      type: 'url',
    }),
    defineField({
      name: 'reservationUrl',
      title: 'Reservation Link (OpenTable / Resy / Direct)',
      type: 'url',
    }),
    defineField({
      name: 'seoTitle',
      title: 'SEO Page Title (browser tab)',
      type: 'string',
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO Meta Description (160 chars)',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'seoImage',
      title: 'Social Share Image (OG Image)',
      type: 'image',
    }),
  ],
})
