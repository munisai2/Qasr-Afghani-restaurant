import restaurantInfo from './restaurantInfo'
import menuCategory from './menuCategory'
import menuItem from './menuItem'
import order from './order'
import teamMember from './teamMember'
import testimonial from './testimonial'
import cateringPlan from './cateringPlan'
import kitchenSettings from './kitchenSettings'
import googleReviewSettings from './googleReviewSettings'
import googleReviewsCache from './googleReviewsCache'
import promoCode from './promoCode'

export const schemaTypes = [
  restaurantInfo,
  menuCategory,
  menuItem,
  order,
  teamMember,
  testimonial,
  cateringPlan,
  promoCode,
  googleReviewSettings,
  googleReviewsCache,
  kitchenSettings,   // ← must be last
]
