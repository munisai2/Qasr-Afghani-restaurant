/**
 * KITCHEN SETTINGS — Singleton document
 *
 * After deploying this schema, go to Sanity Studio (/studio)
 * and create the Kitchen App Settings document once:
 *
 * 1. Go to /studio
 * 2. Find "Kitchen App Settings" in the left sidebar
 * 3. Click it
 * 4. The default PINs will be pre-filled (1111, 2222, 3333, 4444)
 * 5. Change them to your preferred PINs
 * 6. Click Publish
 *
 * The kitchen app reads these PINs every time someone logs in.
 * Change PINs anytime from the Studio or from the app Settings screen.
 */

import { defineField, defineType } from 'sanity'

export default defineType({
  name:  'kitchenSettings',
  title: '🍢 Kitchen App Settings',
  type:  'document',
  fields: [
    defineField({
      name:        'chefPin',
      title:       'Chef PIN',
      type:        'string',
      description: '4-digit PIN for kitchen chef. Default: 1111',
      initialValue: '1111',
      validation:  Rule => Rule
        .required()
        .regex(/^\d{4}$/)
        .error('PIN must be exactly 4 digits'),
    }),
    defineField({
      name:        'cashierPin',
      title:       'Cashier PIN',
      type:        'string',
      description: '4-digit PIN for cashier. Default: 2222',
      initialValue: '2222',
      validation:  Rule => Rule
        .required()
        .regex(/^\d{4}$/)
        .error('PIN must be exactly 4 digits'),
    }),
    defineField({
      name:        'managerPin',
      title:       'Manager PIN',
      type:        'string',
      description: '4-digit PIN for manager. Default: 3333',
      initialValue: '3333',
      validation:  Rule => Rule
        .required()
        .regex(/^\d{4}$/)
        .error('PIN must be exactly 4 digits'),
    }),
    defineField({
      name:        'ownerPin',
      title:       'Owner PIN',
      type:        'string',
      description: '4-digit PIN for owner (full access). Default: 4444',
      initialValue: '4444',
      validation:  Rule => Rule
        .required()
        .regex(/^\d{4}$/)
        .error('PIN must be exactly 4 digits'),
    }),
    defineField({
      name:         'alarmEnabled',
      title:        'Alarm Sound Enabled',
      type:         'boolean',
      description:  'Turn the kitchen alarm sound on or off.',
      initialValue: true,
    }),
    defineField({
      name:         'alarmVolume',
      title:        'Alarm Volume (1 to 10)',
      type:         'number',
      description:  '1 is quietest, 10 is loudest.',
      initialValue: 8,
      validation:   Rule => Rule.min(1).max(10),
    }),
  ],

  // Singleton — only one document of this type ever exists.
  // Owner can update it but never create a second one
  // or delete it.
  __experimental_actions: ['update', 'publish'],

  preview: {
    prepare() {
      return {
        title:    'Kitchen App Settings',
        subtitle: 'PIN codes and alarm configuration',
      }
    },
  },
})
