import { defineField, defineType } from 'sanity'

const CATEGORY_LABELS: Record<string, string> = {
  lamb:       'Lamb Specials',
  chicken:    'Chicken Specials',
  family:     'Family Packages',
  wings:      'Buffalo Wild Wings',
  gyro:       'Gyro Specials',
  appetizers: 'Appetizers & Drinks',
}

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
      name:        'prepTime',
      title:       'Preparation Time (minutes)',
      type:        'number',
      description: 'How many minutes this dish takes to prepare. ' +
                   'Used to calculate estimated ready time for customers.',
      initialValue: 20,
      validation:   Rule => Rule.min(1).max(120),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'spiceLevel',
      title: 'Spice Level',
      type: 'string',
      options: {
        list: [
          { title: 'None',  value: 'none' },
          { title: 'Mild',  value: 'mild' },
          { title: 'Medium',value: 'medium'},
          { title: 'Spicy', value: 'spicy'},
          { title: 'Extra Spicy', value: 'extra_spicy'}
        ]
      }
    }),
    defineField({
      name: 'includes',
      title: 'Includes (Served With)',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'dietary',
      title: 'Dietary Markers',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Gluten-Free', value: 'gf' },
          { title: 'Halal', value: 'halal' },
          { title: 'Vegan', value: 'vegan' },
          { title: 'Vegetarian', value: 'vegetarian' },
          { title: 'Contains Dairy', value: 'dairy' },
          { title: 'Contains Nuts', value: 'nuts' }
        ]
      }
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
  preview: {
    select: {
      title:    'name',
      category: 'category',
      price:    'price',
      prepTime: 'prepTime',
    },
    prepare({ title, category, price, prepTime }) {
      return {
        title,
        subtitle: `${CATEGORY_LABELS[category] || category} · $${price} · ${prepTime ?? 20} min`,
      }
    },
  },
})
