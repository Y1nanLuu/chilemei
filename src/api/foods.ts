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
  FoodTagExtraction,
  UpdateFoodRecordPayload,
  UploadImageResponse,
} from './types'
import Taro from '@tarojs/taro'
import { getCloudEnv } from '../utils/cloud'
import { request } from '../utils/request'

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
    url: '/foods/recommendations/guess-you-like?limit=10',
  })
}

export const getPersonalizedRecommendations = () => {
  return request<FoodRecommendationCard[]>({
    url: '/foods/recommendations/today',
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

// AI 代理请求/响应类型（caller 使用 camelCase，内部映射为 snake_case 发送至后端）

type ExtractFoodTagsBackendRequest = {
  food_name: string
  location?: string
  review_text?: string
  sentiment: string
  rating_level: number
}

type GenerateImageBackendRequest = {
  food_name: string
  location?: string
  review_text?: string
  source_image_url?: string
}

type GenerateImageResponse = {
  image_url: string
}

const getCloudTempFileUrl = async (fileId: string) => {
  if (/^https?:\/\//.test(fileId)) {
    return fileId
  }

  const cloud = getWechatCloud()
  const cloudEnv = getCloudEnv()

  if (!cloud?.getTempFileURL || !cloudEnv) {
    throw new Error('无法获取图片临时访问地址')
  }

  const result = await new Promise<{ tempFileURL?: string }>((resolve, reject) => {
    cloud.getTempFileURL({
      fileList: [fileId],
      config: {
        env: cloudEnv,
      },
      success: (res) => resolve(res.fileList?.[0] || {}),
      fail: (error) => reject(new Error(error?.errMsg || '获取图片临时地址失败')),
    })
  })

  if (!result.tempFileURL) {
    throw new Error('图片临时地址为空')
  }

  return result.tempFileURL
}

const downloadRemoteImage = async (imageUrl: string) => {
  const response = await Taro.downloadFile({
    url: imageUrl,
  })

  if (response.statusCode && (response.statusCode < 200 || response.statusCode >= 300)) {
    throw new Error(`下载 AI 图片失败 (${response.statusCode})`)
  }

  if (!response.tempFilePath) {
    throw new Error('下载 AI 图片失败')
  }

  return response.tempFilePath
}

export const extractFoodTags = async (options: {
  foodName: string
  location?: string
  reviewText?: string
  sentiment: string
  ratingLevel: number
}): Promise<FoodTagExtraction> => {
  return request<FoodTagExtraction, ExtractFoodTagsBackendRequest>({
    url: '/ai/extract-tags',
    method: 'POST',
    data: {
      food_name: options.foodName.trim(),
      ...(options.location?.trim() ? { location: options.location.trim() } : {}),
      ...(options.reviewText?.trim() ? { review_text: options.reviewText.trim() } : {}),
      sentiment: options.sentiment,
      rating_level: options.ratingLevel,
    },
  })
}

export const createSeedreamFoodImage = async (options: {
  foodName: string
  location?: string
  reviewText?: string
  sourceImageFileId?: string
  sourceImageUrl?: string
}): Promise<UploadImageResponse> => {
  const sourceImageUrl = options.sourceImageFileId
    ? await getCloudTempFileUrl(options.sourceImageFileId)
    : options.sourceImageUrl

  const requestPayload: GenerateImageBackendRequest = {
    food_name: options.foodName.trim(),
    ...(options.location?.trim() ? { location: options.location.trim() } : {}),
    ...(options.reviewText?.trim() ? { review_text: options.reviewText.trim() } : {}),
    ...(sourceImageUrl ? { source_image_url: sourceImageUrl } : {}),
  }

  const result = await request<GenerateImageResponse, GenerateImageBackendRequest>({
    url: '/ai/generate-image',
    method: 'POST',
    data: requestPayload,
  })

  const tempFilePath = await downloadRemoteImage(result.image_url)
  return uploadFoodImage(tempFilePath)
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
