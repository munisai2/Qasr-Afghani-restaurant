import { track } from '@vercel/analytics'

export const AnalyticsEvents = {
  viewDish: (name: string, category: string) =>
    track('dish_viewed', { name, category }),

  addToCart: (name: string, price: number) =>
    track('add_to_cart', { name, price }),

  openCart: () => track('cart_opened'),

  beginCheckout: (itemCount: number, total: number) =>
    track('begin_checkout', { itemCount, total }),

  orderPlaced: (orderId: string, total: number) =>
    track('order_placed', { orderId, total }),

  cateringInquiry: (guestCount: number) =>
    track('catering_inquiry', { guestCount }),
}
