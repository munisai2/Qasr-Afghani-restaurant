import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './sanity/schemas'
import type { StructureBuilder } from 'sanity/structure'

export default defineConfig({
  name: 'default',
  title: 'Qasr Afghan — Content Studio',

  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,

  plugins: [
    structureTool({
      structure: (S: StructureBuilder) => {
        const defaultApiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01'
        
        return S.list()
          .title('Content')
          .items([
            // Orders dashboard — newest first
            S.listItem()
              .title('📋 Orders')
              .child(
                S.documentList()
                  .title('All Orders')
                  .filter('_type == "order"')
                  .apiVersion(defaultApiVersion)
                  .defaultOrdering([{ field: 'placedAt', direction: 'desc' }])
              ),
            S.divider(),
            // Restaurant Info singleton
            S.listItem()
              .title('🏰 Restaurant Info')
              .child(
                S.documentList()
                  .title('Restaurant Info')
                  .apiVersion(defaultApiVersion)
                  .filter('_type == "restaurantInfo"')
              ),
            // Menu Items
            S.listItem()
              .title('🍽️ Menu Items')
              .child(
                S.documentList()
                  .title('Menu Items')
                  .apiVersion(defaultApiVersion)
                  .filter('_type == "menuItem"')
              ),
            // Catering Plans
            S.listItem()
              .title('🎉 Catering Plans')
              .child(
                S.documentList()
                  .title('Catering Plans')
                  .apiVersion(defaultApiVersion)
                  .filter('_type == "cateringPlan"')
              ),
            // Promo Codes
            S.listItem()
              .title('🎟️ Promo Codes')
              .child(
                S.documentList()
                  .title('Promo Codes')
                  .apiVersion(defaultApiVersion)
                  .filter('_type == "promoCode"')
              ),
            // Testimonials
            S.listItem()
              .title('⭐ Customer Reviews')
              .child(
                S.documentList()
                  .title('Customer Reviews')
                  .apiVersion(defaultApiVersion)
                  .filter('_type == "testimonial"')
              ),
            // Team Members
            S.listItem()
              .title('👥 Team Members')
              .child(
                S.documentList()
                  .title('Team Members')
                  .apiVersion(defaultApiVersion)
                  .filter('_type == "teamMember"')
              ),
            S.divider(),
            // Kitchen App Settings singleton
            S.listItem()
              .title('🍢 Kitchen App Settings')
              .child(
                S.document()
                  .schemaType('kitchenSettings')
                  .documentId('kitchenSettings')
              ),
          ])
      },
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
})
