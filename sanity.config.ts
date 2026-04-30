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
            // Orders dashboard — split into Active and Archived
            S.listItem()
              .title('📋 Orders')
              .schemaType('order')
              .child(
                S.list()
                  .title('Orders')
                  .items([
                    S.listItem()
                      .title('🔴 New Orders')
                      .child(
                        S.documentList()
                          .title('New Orders')
                          .schemaType('order')
                          .filter('_type == "order" && status == "new"')
                          .apiVersion(defaultApiVersion)
                          .defaultOrdering([{ field: 'placedAt', direction: 'desc' }])
                      ),
                    S.listItem()
                      .title('🟡 Active Orders')
                      .child(
                        S.documentList()
                          .title('Active Orders')
                          .schemaType('order')
                          .filter('_type == "order" && status in ["preparing","ready","confirmed"]')
                          .apiVersion(defaultApiVersion)
                          .defaultOrdering([{ field: 'placedAt', direction: 'desc' }])
                      ),
                    S.listItem()
                      .title('✅ Completed Orders')
                      .child(
                        S.documentList()
                          .title('Completed Orders')
                          .schemaType('order')
                          .filter('_type == "order" && status == "completed" && !defined(archivedAt)')
                          .apiVersion(defaultApiVersion)
                          .defaultOrdering([{ field: 'placedAt', direction: 'desc' }])
                      ),
                    S.listItem()
                      .title('❌ Cancelled Orders')
                      .child(
                        S.documentList()
                          .title('Cancelled Orders')
                          .schemaType('order')
                          .filter('_type == "order" && status == "cancelled"')
                          .apiVersion(defaultApiVersion)
                          .defaultOrdering([{ field: 'placedAt', direction: 'desc' }])
                      ),
                    S.listItem()
                      .title('📅 Scheduled Orders')
                      .child(
                        S.documentList()
                          .title('Scheduled Orders')
                          .schemaType('order')
                          .filter('_type == "order" && status == "scheduled"')
                          .apiVersion(defaultApiVersion)
                          .defaultOrdering([{ field: 'scheduledTime', direction: 'asc' }])
                      ),
                    S.listItem()
                      .title('📦 Archived Orders')
                      .child(
                        S.documentList()
                          .title('Archived Orders')
                          .schemaType('order')
                          .filter('_type == "order" && defined(archivedAt)')
                          .apiVersion(defaultApiVersion)
                          .defaultOrdering([{ field: 'placedAt', direction: 'desc' }])
                      ),
                    S.listItem()
                      .title('📊 All Orders')
                      .child(
                        S.documentList()
                          .title('All Orders')
                          .schemaType('order')
                          .filter('_type == "order"')
                          .apiVersion(defaultApiVersion)
                          .defaultOrdering([{ field: 'placedAt', direction: 'desc' }])
                      ),
                  ])
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
            // Menu Categories (dynamic)
            S.listItem()
              .title('📂 Menu Categories')
              .child(
                S.documentList()
                  .title('Menu Categories')
                  .apiVersion(defaultApiVersion)
                  .filter('_type == "menuCategory"')
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
