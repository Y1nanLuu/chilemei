import Taro from '@tarojs/taro'
import type { FoodRecommendationCard } from '../api/types'
import { getCurrentUser } from './auth'

export type InteractionType = 'likes' | 'favorites' | 'dislikes'

export type FoodInteractionItem = FoodRecommendationCard & {
  saved_at: string
}

const STORAGE_PREFIX = 'food_interactions'

const getStorageKey = (type: InteractionType) => {
  const currentUser = getCurrentUser()
  const userId = currentUser?.id || 'guest'
  return `${STORAGE_PREFIX}:${userId}:${type}`
}

export const getFoodInteractions = (type: InteractionType) => {
  return Taro.getStorageSync<FoodInteractionItem[]>(getStorageKey(type)) || []
}

export const isFoodInteracted = (type: InteractionType, foodId: number) => {
  return getFoodInteractions(type).some((item) => item.food_id === foodId)
}

export const getFoodInteractionCount = (type: InteractionType, foodId: number) => {
  return getFoodInteractions(type).filter((item) => item.food_id === foodId).length
}

export const toggleFoodInteraction = (type: InteractionType, food: FoodRecommendationCard) => {
  const currentItems = getFoodInteractions(type)
  const exists = currentItems.some((item) => item.food_id === food.food_id)

  if (exists) {
    const nextItems = currentItems.filter((item) => item.food_id !== food.food_id)
    Taro.setStorageSync(getStorageKey(type), nextItems)
    return { active: false, items: nextItems }
  }

  const nextItems = [
    {
      ...food,
      saved_at: new Date().toISOString(),
    },
    ...currentItems,
  ]

  Taro.setStorageSync(getStorageKey(type), nextItems)

  // Keep "点赞" and "劝退" mutually exclusive for the same food.
  if (type === 'likes') {
    const nextDislikes = getFoodInteractions('dislikes').filter((item) => item.food_id !== food.food_id)
    Taro.setStorageSync(getStorageKey('dislikes'), nextDislikes)
  }

  if (type === 'dislikes') {
    const nextLikes = getFoodInteractions('likes').filter((item) => item.food_id !== food.food_id)
    Taro.setStorageSync(getStorageKey('likes'), nextLikes)
  }

  return { active: true, items: nextItems }
}
