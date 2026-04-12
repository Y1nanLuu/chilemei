import Taro from '@tarojs/taro'
import type { FoodComment, FoodDetailResponse } from '../api/types'
import { getCurrentUser } from './auth'

export type LocalFoodComment = FoodComment & {
  food_id: number
  food_name: string
  food_location: string
}

const STORAGE_PREFIX = 'food_comments'

const getStorageKey = () => {
  const currentUser = getCurrentUser()
  const userId = currentUser?.id || 'guest'
  return `${STORAGE_PREFIX}:${userId}`
}

export const getLocalFoodComments = () => {
  return Taro.getStorageSync<LocalFoodComment[]>(getStorageKey()) || []
}

export const getLocalCommentsByFoodId = (foodId: number) => {
  return getLocalFoodComments().filter((item) => item.food_id === foodId)
}

export const createLocalFoodComment = (detail: FoodDetailResponse, content: string) => {
  const currentUser = getCurrentUser()
  const currentComments = getLocalFoodComments()
  const nextComment: LocalFoodComment = {
    id: Date.now(),
    content,
    created_at: new Date().toISOString(),
    user: currentUser
      ? {
          id: currentUser.id,
          nickname: currentUser.nickname,
          avatar_url: currentUser.avatar_url,
        }
      : undefined,
    food_id: detail.food_id,
    food_name: detail.name || `食物 ${detail.food_id}`,
    food_location: detail.location || '未知地点',
  }

  const nextComments = [nextComment, ...currentComments]
  Taro.setStorageSync(getStorageKey(), nextComments)
  return nextComment
}
