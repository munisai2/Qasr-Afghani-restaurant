import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'order',
  title: 'Orders',
  type: 'document',
  // @ts-ignore
  __experimental_actions: ['update', 'publish', 'delete'],
  fields: [
    defineField({ name: 'orderId', title: 'Order ID', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'status', title: 'Status', type: 'string',
      options: {
        list: [
          { title: 'New',          value: 'new'       },
          { title: '📅 Scheduled', value: 'scheduled' },
          { title: 'Confirmed',    value: 'confirmed' },
          { title: 'Preparing',    value: 'preparing' },
          { title: 'Ready',        value: 'ready'     },
          { title: 'Completed',    value: 'completed' },
          { title: 'Cancelled',    value: 'cancelled' },
        ],
      },
      initialValue: 'new',
    }),
    defineField({ name: 'customerName',  title: 'Customer Name',  type: 'string' }),
    defineField({ name: 'customerPhone', title: 'Customer Phone', type: 'string' }),
    defineField({ name: 'customerEmail', title: 'Customer Email (optional)', type: 'string' }),
    defineField({
      name: 'orderType', title: 'Order Type', type: 'string',
      options: { 
        list: [
          { title: 'Pickup — Immediate',   value: 'pickup'      },
          { title: 'Pickup — Scheduled',   value: 'pickup-scheduled' },
          { title: 'Dine In — Now',        value: 'dine-in'     },
          { title: 'Dine In — Reserved',   value: 'reservation' },
        ] 
      },
      initialValue: 'pickup',
    }),
    defineField({
      name:  'guestCount',
      title: 'Number of Guests',
      type:  'number',
      description: 'For dine-in orders.',
    }),
    defineField({
      name:  'tableNumber',
      title: 'Table Number (optional)',
      type:  'string',
      description: 'Customer-selected table. Optional.',
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
    defineField({
      name:  'kitchenMessage',
      title: 'Kitchen Message to Customer',
      type:  'text',
      rows:  2,
      description:
        'A message from the kitchen to the customer. ' +
        'This is sent to the customer in their email ' +
        'when the order is adjusted or confirmed. ' +
        'Example: "No apple juice available — replaced with water."',
    }),
    defineField({
      name:  'scheduledTime',
      title: 'Scheduled Pickup Time',
      type:  'datetime',
      description: 'If set, this is a scheduled order. ' +
                   'Kitchen will be alerted 30 minutes before this time.',
    }),
    defineField({
      name:  'reservationTime',
      title: 'Reservation / Scheduled Time',
      type:  'datetime',
      description: 'For both scheduled pickup and dine-in reservations.',
    }),
    defineField({ name: 'estimatedTime',    title: 'Estimated Pickup Time (min)', type: 'number' }),
    defineField({ name: 'discountAmount',   title: 'Discount Amount ($)',         type: 'number' }),
    defineField({
      name:  'promoCode',
      title: 'Promo Code Used',
      type:  'string',
    }),
    defineField({
      name:  'promoDiscount',
      title: 'Promo Discount Amount ($)',
      type:  'number',
    }),
    defineField({ name: 'adjustmentReason',  title: 'Adjustment Reason',           type: 'string' }),
    defineField({ name: 'cancellationReason', title: 'Cancellation Reason',          type: 'string' }),
    defineField({
      name:         'includeUtensils',
      title:        'Include Utensils',
      type:         'boolean',
      initialValue: false,
      description:  'Customer requested napkins, fork, knife, spoon.',
    }),
    defineField({
      name:        'archivedAt',
      title:       'Archived At',
      type:        'datetime',
      description: 'Set automatically for completed orders older than 90 days. Archived orders are hidden from the main view but never deleted.',
      readOnly:    true,
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
