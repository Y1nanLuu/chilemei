import Taro from '@tarojs/taro'
import { getAccessToken } from './auth'
import { getCloudEnv, getCloudMediaBaseUrl, getCloudService } from './cloud'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

type RequestOptions<TData> = {
  url: string
  method?: HttpMethod
  data?: TData
  withAuth?: boolean
}

type ApiErrorResponse = {
  detail?: string
  message?: string
}

const getMediaBaseUrl = () => {
  return getCloudMediaBaseUrl()
}

const MEDIA_BASE_URL = getMediaBaseUrl()
const API_PREFIX = '/api/v1'

const getWechatCloud = () => {
  return (globalThis as { wx?: { cloud?: any } }).wx?.cloud
}

const ensureCloudInitialized = async (cloud: any, env: string) => {
  const globalState = globalThis as { __cloudInited?: boolean }
  if (globalState.__cloudInited) {
    return
  }

  if (cloud?.init) {
    await cloud.init({
      env,
      traceUser: true,
    })
  }

  globalState.__cloudInited = true
}

const formatMissingCloudConfig = (cloud: any, env?: string, service?: string) => {
  const reasons: string[] = []
  if (!cloud) {
    reasons.push('wx.cloud 未挂载')
  } else if (!cloud.callContainer) {
    reasons.push('callContainer 不可用')
  }
  if (!env) {
    reasons.push('TARO_APP_CLOUD_ENV 为空')
  }
  if (!service) {
    reasons.push('TARO_APP_CLOUD_SERVICE 为空')
  }
  return reasons.length ? `（${reasons.join('，')}）` : ''
}

export const getApiUrl = (url: string) => {
  return `${API_PREFIX}${url}`
}

export const getMediaUrl = (url?: string | null) => {
  if (!url) {
    return ''
  }

  const mediaOrigin = MEDIA_BASE_URL.replace(/\/+$/, '')

  if (/^https?:\/\//.test(url)) {
    if (url.startsWith(`${mediaOrigin}/`)) {
      return url
    }

    const mediaIndex = url.indexOf('/media/')
    if (mediaIndex >= 0) {
      return `${mediaOrigin}${url.slice(mediaIndex)}`
    }

    return url
  }

  if (url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('cloud://') || url.startsWith('wxfile://')) {
    return url
  }

  const normalizedPath = url.startsWith('/') ? url : `/${url}`
  return `${mediaOrigin}${normalizedPath}`
}

const getErrorMessage = (data: ApiErrorResponse | string | undefined, fallback: string) => {
  if (typeof data === 'string' && data.trim()) {
    return data
  }

  if (data && typeof data === 'object') {
    if (typeof data.detail === 'string' && data.detail.trim()) {
      return data.detail
    }

    if (typeof data.message === 'string' && data.message.trim()) {
      return data.message
    }
  }

  return fallback
}

export const request = async <TResponse, TData = Record<string, unknown>>(
  options: RequestOptions<TData>,
): Promise<TResponse> => {
  const cloud = getWechatCloud()
  const cloudEnv = getCloudEnv()
  const cloudService = getCloudService()

  if (!cloud?.callContainer || !cloudEnv || !cloudService) {
    const detail = formatMissingCloudConfig(cloud, cloudEnv, cloudService)
    throw new Error(`缺少微信云托管调用配置或未在小程序环境运行${detail}`)
  }

  await ensureCloudInitialized(cloud, cloudEnv)

  const { url, method = 'GET', data, withAuth = true } = options
  const token = getAccessToken()

  const response = await cloud.callContainer({
    config: {
      env: cloudEnv,
    },
    path: `${API_PREFIX}${url}`,
    method,
    header: {
      'Content-Type': 'application/json',
      'X-WX-SERVICE': cloudService,
      ...(withAuth && token ? { Authorization: `Bearer ${token}` } : {}),
    },
    data,
  })

  if (response.statusCode >= 200 && response.statusCode < 300) {
    return response.data as TResponse
  }

  const message = getErrorMessage(
    response.data as ApiErrorResponse | string | undefined,
    `请求失败 (${response.statusCode})`,
  )

  throw new Error(message)
}
