import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'order',
  title: 'Orders',
  type: 'document',
  fields: [
    defineField({ name: 'orderId', title: 'Order ID', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'status', title: 'Status', type: 'string',
      options: {
        list: [
          { title: 'New',       value: 'new'       },
          { title: 'Confirmed', value: 'confirmed' },
          { title: 'Preparing', value: 'preparing' },
          { title: 'Ready',     value: 'ready'     },
          { title: 'Completed', value: 'completed' },
          { title: 'Cancelled', value: 'cancelled' },
        ],
      },
      initialValue: 'new',
    }),
    defineField({ name: 'customerName',  title: 'Customer Name',  type: 'string' }),
    defineField({ name: 'customerPhone', title: 'Customer Phone', type: 'string' }),
    defineField({ name: 'customerEmail', title: 'Customer Email (optional)', type: 'string' }),
    defineField({
      name: 'orderType', title: 'Order Type', type: 'string',
      options: { list: [{ title: 'Pickup', value: 'pickup' }] },
      initialValue: 'pickup',
    }),
    defineField({
      name: 'items', title: 'Order Items', type: 'array',
      of: [{
        type: 'object',
        name: 'orderItem',
        fields: [
          { name: 'name',     title: 'Item Name',  type: 'string' },
          { name: 'quantity', title: 'Quantity',    type: 'number' },
          { name: 'price',    title: 'Unit Price',  type: 'number' },
        ],
      }],
    }),
    defineField({ name: 'subtotal', title: 'Subtotal', type: 'number' }),
    defineField({ name: 'tax',      title: 'Tax',      type: 'number' }),
    defineField({ name: 'total',    title: 'Total',    type: 'number' }),
    defineField({ name: 'specialRequests', title: 'Special Requests', type: 'text' }),
    defineField({ name: 'placedAt', title: 'Placed At', type: 'datetime' }),
    defineField({
      name: 'notes', title: 'Staff Notes', type: 'text',
      description: 'Internal notes — not visible to customer',
    }),
  ],
  preview: {
    select: { title: 'orderId', subtitle: 'customerName', status: 'status' },
    prepare: ({ title, subtitle, status }) => ({
      title: `${title}`,
      subtitle: `${subtitle} · ${status?.toUpperCase() ?? 'NEW'}`,
    }),
  },
  orderings: [
    { title: 'Newest First', name: 'placedAtDesc', by: [{ field: 'placedAt', direction: 'desc' }] },
  ],
})
