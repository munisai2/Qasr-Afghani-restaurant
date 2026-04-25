import { defineField, defineType } from 'sanity'

export default defineType({
  name:  'promoCode',
  title: '🎟️ Promo Codes',
  type:  'document',
  fields: [
    defineField({
      name:         'code',
      title:        'Promo Code',
      type:         'string',
      description:  'The code customers type in (e.g. 50OFF). It will be uppercase automatically.',
      validation:   Rule => Rule.required().uppercase(),
    }),
    defineField({
      name:         'isActive',
      title:        'Active Status',
      type:         'boolean',
      description:  'Turn this toggle off to temporarily disable the promo code without deleting it.',
      initialValue: true,
    }),
    defineField({
      name:         'discountType',
      title:        'Discount Type',
      type:         'string',
      options: {
        list: [
          { title: 'Percentage Off', value: 'percentage' },
          { title: 'Fixed Amount Off', value: 'fixed' },
          { title: 'Buy 1 Get 1 (BOGO)', value: 'bogo' },
        ]
      },
      validation:   Rule => Rule.required(),
      initialValue: 'percentage',
    }),
    defineField({
      name:         'discountValue',
      title:        'Discount Value',
      type:         'number',
      description:  'For Percentage (e.g. 50 for 50%). For Fixed (e.g. 10 for $10). Leave as 0 for BOGO.',
      initialValue: 0,
      hidden:       ({ document }) => document?.discountType === 'bogo',
    }),
    defineField({
      name:         'minOrderAmount',
      title:        'Minimum Order Subtotal ($)',
      type:         'number',
      description:  'Minimum subtotal required to use this code (leave 0 for no minimum).',
      initialValue: 0,
      validation:   Rule => Rule.min(0),
    }),
    defineField({
      name:         'expiryDate',
      title:        'Expiry Date',
      type:         'datetime',
      description:  'Optional: The code will automatically stop working after this date.',
    }),
    defineField({
      name:         'applicableItems',
      title:        'Applicable Items (for BOGO or Specific Discounts)',
      type:         'array',
      of:           [{ type: 'reference', to: [{ type: 'menuItem' }] }],
      description:  'If BOGO is selected, the cart MUST contain at least two of these items to get the cheapest one free.',
      hidden:       ({ document }) => document?.discountType !== 'bogo',
    }),
  ],
  preview: {
    select: {
      title:    'code',
      type:     'discountType',
      val:      'discountValue',
      isActive: 'isActive',
    },
    prepare({ title, type, val, isActive }) {
      const typeDisplay = type === 'percentage' ? `${val}% off` : type === 'fixed' ? `$${val} off` : 'BOGO'
      return {
        title:    title,
        subtitle: `${typeDisplay} • ${isActive ? '🟢 Active' : '🔴 Inactive'}`,
      }
    }
  }
})
