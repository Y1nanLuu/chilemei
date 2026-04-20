import type {
  CreateCommentPayload,
  CreateFoodRecordPayload,
  FavoriteFoodItem,
  FoodComment,
  FoodDetailResponse,
  FoodListQuery,
  FoodRankingItem,
  FoodRecord,
  FoodRecommendationCard,
  UpdateFoodRecordPayload,
  UploadImageResponse,
} from './types'
import Taro from '@tarojs/taro'
import { getAccessToken } from '../utils/auth'
import { getCloudEnv } from '../utils/cloud'
import { getApiUrl, request } from '../utils/request'

const toQueryString = (query: Record<string, string | number | boolean | undefined>) => {
  const queryString = Object.entries(query)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&')

  return queryString ? `?${queryString}` : ''
}

export const getFoodRecords = (query: FoodListQuery = {}) => {
  return request<FoodRecord[]>({
    url: `/foods${toQueryString(query)}`,
  })
}

export const getFoodRecordDetail = (recordId: string | number) => {
  return request<FoodRecord>({
    url: `/foods/records/${recordId}`,
  })
}

export const getFoodRecordComments = (recordId: string | number) => {
  return request<FoodComment[]>({
    url: `/foods/records/${recordId}/comments`,
  })
}

export const getDailyRecommendations = () => {
  return request<FoodRecommendationCard>({
    url: '/foods/recommendations/daily',
  })
}

export const getPersonalizedRecommendations = () => {
  return request<FoodRecommendationCard[]>({
    url: '/foods/recommendations/personalized',
  })
}

export const getFoodDetail = (foodId: string | number) => {
  return request<FoodDetailResponse>({
    url: `/foods/${foodId}/detail`,
  })
}

export const getFoodComments = (foodId: string | number) => {
  return request<FoodComment[]>({
    url: `/foods/${foodId}/comments`,
  })
}

export const createFoodComment = (
  foodId: string | number,
  payload: CreateCommentPayload,
) => {
  return request<FoodComment, CreateCommentPayload>({
    url: `/foods/${foodId}/comments`,
    method: 'POST',
    data: payload,
  })
}

export const getFoodRankings = (
  period: 'daily' | 'weekly' | 'all',
  scope: 'global' | 'mine' = 'global',
) => {
  return request<FoodRankingItem[]>({
    url: `/foods/rankings${toQueryString({ period, scope })}`,
  })
}

export const getFavoriteFoods = () => {
  return request<FavoriteFoodItem[]>({
    url: '/foods/favorites',
  })
}

export const createFoodFavorite = (foodId: string | number) => {
  return request<void>({
    url: `/foods/${foodId}/favorite`,
    method: 'POST',
  })
}

export const deleteFoodFavorite = (foodId: string | number) => {
  return request<void>({
    url: `/foods/${foodId}/favorite`,
    method: 'DELETE',
  })
}

export const createFoodRecord = (payload: CreateFoodRecordPayload) => {
  return request<FoodRecord, CreateFoodRecordPayload>({
    url: '/foods',
    method: 'POST',
    data: payload,
  })
}

export const updateFoodRecord = (recordId: string | number, payload: UpdateFoodRecordPayload) => {
  return request<FoodRecord, UpdateFoodRecordPayload>({
    url: `/foods/records/${recordId}`,
    method: 'PUT',
    data: payload,
  })
}

export const deleteFoodRecord = (recordId: string | number) => {
  return request<void>({
    url: `/foods/records/${recordId}`,
    method: 'DELETE',
  })
}

export const reuseFoodRecord = (recordId: string | number) => {
  return request<FoodRecord>({
    url: `/foods/records/${recordId}/reuse`,
    method: 'POST',
  })
}

export const createFoodRecordComment = (
  recordId: string | number,
  payload: CreateCommentPayload,
) => {
  return request<FoodComment, CreateCommentPayload>({
    url: `/foods/records/${recordId}/comments`,
    method: 'POST',
    data: payload,
  })
}

const buildTempImageFilename = (filePath: string) => {
  const extMatch = filePath.match(/\.([a-zA-Z0-9]+)(?:\?|$)/)
  const ext = extMatch?.[1]?.toLowerCase() || 'jpg'
  const unique = `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`

  return `${unique}.${ext}`
}

const getWechatCloud = () => {
  return (globalThis as { wx?: { cloud?: any } }).wx?.cloud
}

export const uploadFoodImage = async (filePath: string) => {
  if (Taro.getEnv() !== Taro.ENV_TYPE.WEAPP) {
    throw new Error('云存储上传仅支持微信小程序环境')
  }

  const cloudEnv = getCloudEnv()

  if (!cloudEnv) {
    throw new Error('缺少 TARO_APP_CLOUD_ENV 配置')
  }

  const imageFilename = buildTempImageFilename(filePath)
  const cloudPath = `media/tmp/${imageFilename}`

  const uploadResult = await new Promise<{ fileID: string }>((resolve, reject) => {
    const cloud = getWechatCloud()

    if (!cloud) {
      reject(new Error('微信云能力未初始化'))
      return
    }

    cloud.uploadFile({
      cloudPath,
      filePath,
      config: {
        env: cloudEnv,
      },
      success: (res) => resolve({ fileID: res.fileID }),
      fail: (error) => {
        reject(new Error(error?.errMsg || '图片上传失败'))
      },
    })
  })

  return {
    image_url: uploadResult.fileID,
    stored_path: cloudPath,
    original_filename: filePath.split('/').pop() || imageFilename,
    image_filename: imageFilename,
    file_id: uploadResult.fileID,
  }
}

export const deleteUploadedImage = async (fileId: string) => {
  if (!fileId || Taro.getEnv() !== Taro.ENV_TYPE.WEAPP) {
    return
  }

  const cloudEnv = getCloudEnv()

  if (!cloudEnv) {
    return
  }

  await new Promise<void>((resolve, reject) => {
    const cloud = getWechatCloud()

    if (!cloud) {
      resolve()
      return
    }

    cloud.deleteFile({
      fileList: [fileId],
      config: {
        env: cloudEnv,
      },
      success: () => resolve(),
      fail: (error) => reject(new Error(error?.errMsg || '图片删除失败')),
    })
  })
}
