import { defineField, defineType } from 'sanity'

/**
 * FIRST TIME SETUP:
 * Go to Studio → Menu Categories → create these categories:
 * 1. Offers & Deals       slug: offers    (order: 1)
 * 2. Lamb Specials        slug: lamb      (order: 2)
 * 3. Chicken Specials     slug: chicken   (order: 3)
 * 4. Family Packages      slug: family    (order: 4)
 * 5. Buffalo Wild Wings   slug: wings     (order: 5)
 * 6. Gyro Specials        slug: gyro      (order: 6)
 * 7. Appetizers & Drinks  slug: appetizers (order: 7)
 * 8. Sides & Add-ons      slug: sides     (order: 8)
 * 9. Desserts             slug: desserts  (order: 9)
 *
 * After creating them, go to each Menu Item and
 * re-select its category from the new dropdown.
 */

export default defineType({
  name:  'menuCategory',
  title: 'Menu Categories',
  type:  'document',
  fields: [
    defineField({
      name:        'title',
      title:       'Category Name',
      type:        'string',
      description: 'e.g. Lamb Specials, Chicken Specials, Desserts',
      validation:  Rule => Rule.required(),
    }),
    defineField({
      name:    'slug',
      title:   'Slug (auto-generated)',
      type:    'slug',
      options: { source: 'title' },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name:         'order',
      title:        'Display Order',
      type:         'number',
      description:  'Lower number = appears first in menu tabs.',
      initialValue: 10,
    }),
    defineField({
      name:         'isActive',
      title:        'Active',
      type:         'boolean',
      initialValue: true,
      description:  'Uncheck to hide this category from the menu.',
    }),
  ],
  orderings: [{
    title: 'Display Order',
    name:  'orderAsc',
    by:    [{ field: 'order', direction: 'asc' }],
  }],
  preview: {
    select:  { title: 'title', order: 'order', active: 'isActive' },
    prepare(selection: any) {
      const { title, order, active } = selection
      return {
        title,
        subtitle: `Order: ${order ?? '—'} ${active ? '✓ Active' : '✗ Hidden'}`,
      }
    },
  },
})
