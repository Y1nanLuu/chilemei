import Taro from '@tarojs/taro'
import { getAccessToken } from './auth'

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

const getApiBaseUrl = () => {
  if (typeof process !== 'undefined' && process.env?.TARO_APP_API_BASE_URL) {
    return process.env.TARO_APP_API_BASE_URL
  }

  return 'http://127.0.0.1:8000'
}

const API_BASE_URL = getApiBaseUrl()
const API_PREFIX = '/api/v1'

const joinUrl = (url: string) => {
  return `${API_BASE_URL}${API_PREFIX}${url}`
}

export const getApiUrl = (url: string) => {
  return joinUrl(url)
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
  const { url, method = 'GET', data, withAuth = true } = options
  const token = getAccessToken()

  const response = await Taro.request<TResponse | ApiErrorResponse>({
    url: joinUrl(url),
    method,
    data,
    header: {
      'Content-Type': 'application/json',
      ...(withAuth && token ? { Authorization: `Bearer ${token}` } : {}),
    },
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
