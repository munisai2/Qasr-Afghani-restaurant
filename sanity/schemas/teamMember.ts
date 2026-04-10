import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'teamMember',
  title: 'Team Member',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Full Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'role',
      title: 'Title / Role',
      type: 'string',
    }),
    defineField({
      name: 'bio',
      title: 'Short Bio',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'photo',
      title: 'Headshot Photo',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      description: 'Lower numbers display first (1 = first).',
      type: 'number',
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'role', media: 'photo' },
  },
})
