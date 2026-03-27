import type {
  CreateCommentPayload,
  CreateFoodRecordPayload,
  FoodComment,
  FoodListQuery,
  FoodRankingItem,
  FoodRecord,
  UpdateFoodRecordPayload,
  UploadImageResponse,
} from './types'
import Taro from '@tarojs/taro'
import { getAccessToken } from '../utils/auth'
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
  return request<FoodRecord>({
    url: '/foods/recommendations/daily',
  })
}

export const getPersonalizedRecommendations = () => {
  return request<FoodRecord[]>({
    url: '/foods/recommendations/personalized',
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

export const uploadFoodImage = async (filePath: string) => {
  const token = getAccessToken()

  const response = await Taro.uploadFile({
    url: getApiUrl('/foods/upload-image'),
    filePath,
    name: 'file',
    header: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  let data: (UploadImageResponse & {
    detail?: string
    message?: string
  }) | null = null

  try {
    data = JSON.parse(response.data || '{}')
  } catch {
    throw new Error('图片上传返回解析失败')
  }

  if (response.statusCode >= 200 && response.statusCode < 300 && data?.image_url) {
    return data
  }

  throw new Error(data?.detail || data?.message || '图片上传失败')
}
