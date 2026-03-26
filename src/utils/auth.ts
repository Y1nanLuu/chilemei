import Taro from '@tarojs/taro'
import type { UserSummary } from '../api/types'

const ACCESS_TOKEN_KEY = 'access_token'
const CURRENT_USER_KEY = 'current_user'

export const getAccessToken = () => {
  return Taro.getStorageSync<string>(ACCESS_TOKEN_KEY) || ''
}

export const setAccessToken = (token: string) => {
  Taro.setStorageSync(ACCESS_TOKEN_KEY, token)
}

export const getCurrentUser = () => {
  return Taro.getStorageSync<UserSummary | null>(CURRENT_USER_KEY) || null
}

export const setCurrentUser = (user: UserSummary | null) => {
  if (user) {
    Taro.setStorageSync(CURRENT_USER_KEY, user)
    return
  }

  Taro.removeStorageSync(CURRENT_USER_KEY)
}

export const clearAccessToken = () => {
  Taro.removeStorageSync(ACCESS_TOKEN_KEY)
  Taro.removeStorageSync(CURRENT_USER_KEY)
}

export const hasAccessToken = () => {
  return Boolean(getAccessToken())
}
