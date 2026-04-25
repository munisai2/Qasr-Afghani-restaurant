export interface CombinedReview {
  id:       string
  quote:    string
  author:   string
  rating:   number
  source:   'google' | 'sanity' | 'yelp' | 'direct' | 'facebook'
  timeAgo?: string   // only from Google: "3 months ago"
  url?:     string   // link to original review
}
