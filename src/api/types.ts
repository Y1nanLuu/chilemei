import type { RatingLevelValue } from '../utils/rating'

export type Sentiment = 'like' | 'dislike'

export type UserSummary = {
  id: number
  nickname: string
  avatar_url: string | null
}

export type Food = {
  id: number
  name: string
  location: string
  price: number
  image_url: string | null
}

export type FoodRecord = {
  id: number
  user_id: number
  food_id: number
  food: Food
  sentiment: Sentiment
  rating_level: RatingLevelValue
  review_text: string
  image_url: string | null
  uploaded_at: string
  like_count?: number
  dislike_count?: number
  created_at?: string
  updated_at?: string
  user?: UserSummary
}

export type FoodComment = {
  id: number
  content: string
  created_at?: string
  user?: UserSummary
}

export type FoodRecommendationCard = {
  food_id: number
  name: string
  location: string
  price: number
  score: number
  like_count: number
  dislike_count: number
  cover_image_url: string | null
}

export type FoodDetailResponse = {
  food_id: number
  name?: string
  location?: string
  price?: number
  score?: number
  like_count?: number
  dislike_count?: number
  cover_image_url?: string | null
  image_urls: string[]
  description?: string | null
  comments: FoodComment[]
}

export type FoodRankingItem = FoodRecommendationCard

export type UserProfile = {
  id: number
  username?: string
  nickname: string
  bio?: string | null
  avatar_url?: string | null
  is_private?: boolean
}

export type AnnualReport = {
  total_records: number
  total_spend: number
  average_spend: number
  total_like_records: number
  total_dislike_records: number
  top_foods: Array<{ name: string; count: number }>
  top_locations: Array<{ location: string; count: number }>
  monthly_spend: Array<{ month: string; amount: number }>
  title_tags: string[]
}

export type LoginPayload = {
  username: string
  password: string
}

export type WechatLoginPayload = {
  code: string
}

export type LoginResponse = {
  access_token: string
  token_type: string
  user?: UserSummary
}

export type FoodListQuery = {
  food_name?: string
  location?: string
  sentiment?: Sentiment
  mine_only?: boolean
  start_time?: string
  end_time?: string
}

export type CreateFoodRecordPayload = {
  food: {
    name: string
    location: string
    price: number
    image_url?: string
  }
  sentiment: Sentiment
  rating_level: RatingLevelValue
  review_text: string
  image_url?: string
}

export type UpdateFoodRecordPayload = {
  food?: {
    name?: string
    location?: string
    price?: number
    image_url?: string
  }
  sentiment?: Sentiment
  rating_level?: RatingLevelValue
  review_text?: string
  image_url?: string
}

export type CreateCommentPayload = {
  content: string
}

export type UploadImageResponse = {
  image_url: string
  stored_path: string
  original_filename: string
}
