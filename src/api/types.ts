import type { RatingLevelValue } from '../utils/rating'

export type Sentiment = 'like' | 'dislike'

export type UserSummary = {
  id: number
  nickname: string
  avatar_url: string | null
}

export type UserGender = 'male' | 'female' | 'unknown'
export type UserGrade =
  | 'freshman'
  | 'sophomore'
  | 'junior'
  | 'senior'
  | 'master_1'
  | 'master_2'
  | 'master_3'
  | 'phd_1'
  | 'phd_2'
  | 'phd_3'
  | 'phd_4'
  | 'phd_5'
  | 'graduated'
export type UserCampus = 'shahe' | 'haidian'

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
  is_favorited?: boolean
}

export type FoodComment = {
  id: number
  user_id?: number
  user_nickname?: string
  food_id?: number
  parent_comment_id?: number | null
  parent_user_id?: number | null
  parent_user_nickname?: string | null
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
  is_favorited?: boolean
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
  is_favorited?: boolean
}

export type FoodRankingItem = FoodRecommendationCard

export type FavoriteFoodItem = FoodRecommendationCard & {
  favorited_at?: string
  created_at?: string
  saved_at?: string
}

export type UserProfile = {
  id: number
  username?: string
  nickname: string
  bio?: string | null
  avatar_url?: string | null
  gender?: UserGender | null
  grade?: UserGrade | null
  campus?: UserCampus | null
  is_private?: boolean
  taste_preferences?: string[]
  taboo_list?: string[]
  spicy_level?: number
}

export type UpdateUserProfilePayload = {
  nickname?: string
  bio?: string
  gender?: UserGender
  grade?: UserGrade
  campus?: UserCampus
  avatar_url?: string
}

export type UserPreferenceProfile = {
  taste_preferences: string[]
  taboo_list: string[]
  spicy_level: number
}

export type UpdateUserPreferencesPayload = UserPreferenceProfile

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
  food_id?: number
  food?: {
    name: string
    location: string
    price: number
    image_url?: string
  }
  sentiment: Sentiment
  rating_level: RatingLevelValue
  review_text?: string
  image_filename?: string
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
  parent_comment_id?: number
}

export type UploadImageResponse = {
  image_url: string
  stored_path: string
  original_filename: string
  image_filename?: string
  file_id?: string
}
