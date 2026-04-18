import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'gloriaFoodConfig',
  title: 'Online Ordering (GloriaFood)',
  type: 'document',
  fields: [
    defineField({
      name: 'restaurantUUID',
      title: 'GloriaFood Restaurant UUID',
      type: 'string',
      description: 'From GloriaFood → Publish → Order Button → Get Code. Paste the UUID here.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'isEnabled',
      title: 'Enable Online Ordering?',
      type: 'boolean',
      initialValue: false,
      description: 'Toggle ON once GloriaFood is set up.',
    }),
    defineField({
      name: 'buttonLabel',
      title: 'Order Button Label',
      type: 'string',
      initialValue: 'Order Online',
    }),
  ],
})
