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

const ARK_IMAGE_GENERATION_URL = 'https://ark.cn-beijing.volces.com/api/v3/images/generations'
const ARK_IMAGE_MODEL = 'doubao-seedream-4-0-250828'
const ARK_API_KEY =
  (typeof process !== 'undefined' && process.env?.TARO_APP_ARK_API_KEY) ||
  'ark-41df6df1-6438-496d-bb37-2d24e3310770-aff78'

type SeedreamFoodImageOptions = {
  foodName: string
  location?: string
  reviewText?: string
  sourceImageFileId?: string
  sourceImageUrl?: string
}

type SeedreamGenerationPayload = {
  model: string
  prompt: string
  image?: string
  sequential_image_generation: 'disabled'
  response_format: 'url'
  size: '2K'
  stream: false
  watermark: true
}

type SeedreamGenerationResponse = {
  data?: Array<{
    url?: string
  }>
  url?: string
  error?: {
    message?: string
  }
  message?: string
}

const buildSeedreamPrompt = (options: SeedreamFoodImageOptions) => {
  const foodName = options.foodName.trim() || '一道诱人的美食'
  const location = options.location?.trim()
  const reviewText = options.reviewText?.trim()
  const context = [
    `美食名称：${foodName}`,
    location ? `餐厅或地点：${location}` : '',
    reviewText ? `用户描述：${reviewText}` : '',
  ].filter(Boolean).join('；')

  if (options.sourceImageFileId || options.sourceImageUrl) {
    return `${context}。请在保留原图主体、构图和真实食物特征的基础上，对这张美食照片进行精修、美化和轻度重绘：提升色泽、光线、质感、热气和酱汁细节，让食物看起来更有食欲；保持自然真实、适合社交平台分享，不要改变成完全不同的菜品，不要添加文字、水印或边框。`
  }

  return `${context}。请生成一张真实、有食欲的美食摄影图片：主体是${foodName}，自然餐厅光线，色泽饱满，质感真实，构图干净，浅景深，高级食物摄影风格，适合美食记录应用封面，不要文字、水印或边框。`
}

const getSeedreamResultUrl = (data: SeedreamGenerationResponse) => {
  return data.data?.find((item) => item.url)?.url || data.url || ''
}

const requestSeedreamImage = async (payload: SeedreamGenerationPayload) => {
  if (!ARK_API_KEY) {
    throw new Error('缺少 TARO_APP_ARK_API_KEY 配置')
  }

  const response = await Taro.request<SeedreamGenerationResponse>({
    url: ARK_IMAGE_GENERATION_URL,
    method: 'POST',
    header: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ARK_API_KEY}`,
    },
    data: payload,
  })

  if (response.statusCode < 200 || response.statusCode >= 300) {
    const message = response.data?.error?.message || response.data?.message || `豆包图片生成失败 (${response.statusCode})`
    throw new Error(message)
  }

  const imageUrl = getSeedreamResultUrl(response.data)

  if (!imageUrl) {
    throw new Error('豆包未返回图片地址')
  }

  return imageUrl
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

export const createSeedreamFoodImage = async (
  options: SeedreamFoodImageOptions,
): Promise<UploadImageResponse> => {
  const image = options.sourceImageFileId
    ? await getCloudTempFileUrl(options.sourceImageFileId)
    : options.sourceImageUrl

  const generatedImageUrl = await requestSeedreamImage({
    model: ARK_IMAGE_MODEL,
    prompt: buildSeedreamPrompt(options),
    ...(image ? { image } : {}),
    sequential_image_generation: 'disabled',
    response_format: 'url',
    size: '2K',
    stream: false,
    watermark: true,
  })

  const tempFilePath = await downloadRemoteImage(generatedImageUrl)
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
