/** Fetches the single RestaurantInfo document with all fields */
export const restaurantInfoQuery = `
  *[_type == "restaurantInfo"][0] {
    name, tagline, logo, heroImage,
    aboutTitle, aboutBody, aboutImage, openingYear,
    galleryImages[] { 
      _type, caption, url, asset->{ _id, url }, hotspot, crop 
    },
    googleMapsEmbed,
    openingHours,
    address, phone, email,
    instagramUrl, reservationUrl,
    restaurantStatus, busyExtraMinutes,
    seoTitle, seoDescription,
    seoImage { asset->{ _id, url } }
  }
`

/** Fetches all available menu items, ordered by category */
export const menuItemsQuery = `
  *[_type == "menuItem" && isAvailable == true] | order(category asc) {
    _id, name, slug, category, price, prepTime,
    description, spiceLevel, includes, dietary, image { asset->{ _id, url }, hotspot, crop },
    isSignature, isAvailable
  }
`

/** Fetches only signature dishes */
export const signatureDishesQuery = `
  *[_type == "menuItem" && isSignature == true && isAvailable == true] 
  | order(name asc) [0...6] {
    _id, name, slug, category, price, prepTime, description, 
    image { asset->{ _id, url }, hotspot, crop }
  }
`

/** Fetches menu items for a specific category */
export const menuByCategoryQuery = (category: string) => `
  *[_type == "menuItem" && category == "${category}" && isAvailable == true]
  | order(name asc) {
    _id, name, slug, category, price, prepTime,
    description, spiceLevel, includes, dietary, image { asset->{ _id, url }, hotspot, crop },
    isSignature, isAvailable
  }
`

/** Fetches all team members ordered by display order */
export const teamMembersQuery = `
  *[_type == "teamMember"] | order(order asc) {
    _id, name, role, bio,
    photo { asset->{ _id, url }, hotspot, crop }
  }
`

/** Fetches all catering plans ordered by display order */
export const cateringPlansQuery = `
  *[_type == "cateringPlan"] | order(order asc) {
    _id, title, slug, tagline, description,
    pricePerPerson, minimumGuests, maximumGuests,
    coverImage { asset->{ _id, url }, hotspot, crop },
    includes, isPopular, order
  }
`

/** Fetches highlighted testimonials for homepage */
export const testimonialsQuery = `
  *[_type == "testimonial" && isHighlighted == true]
  | order(order asc) [0...6] {
    _id, quote, author, source, rating, isHighlighted
  }
`
