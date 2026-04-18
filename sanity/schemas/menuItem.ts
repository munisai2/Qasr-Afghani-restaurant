import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'menuItem',
  title: 'Menu Item',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Dish Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Lamb Specials',       value: 'lamb'       },
          { title: 'Chicken Specials',    value: 'chicken'    },
          { title: 'Family Packages',     value: 'family'     },
          { title: 'Buffalo Wild Wings',  value: 'wings'      },
          { title: 'Gyro Specials',       value: 'gyro'       },
          { title: 'Appetizers & Drinks', value: 'appetizers' },
        ],
      },
    }),
    defineField({
      name: 'price',
      title: 'Price (USD)',
      type: 'number',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'image',
      title: 'Dish Photo',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'isSignature',
      title: 'Signature Dish?',
      description: 'Mark as a featured / signature item for homepage highlights.',
      type: 'boolean',
    }),
    defineField({
      name: 'isAvailable',
      title: 'Currently Available?',
      type: 'boolean',
      initialValue: true,
    }),
  ],
})
