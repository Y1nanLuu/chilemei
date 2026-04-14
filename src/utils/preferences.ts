import Taro from '@tarojs/taro'

const PREFERENCES_UPDATED_KEY = 'user_preferences_updated'

export const markUserPreferencesUpdated = () => {
  Taro.setStorageSync(PREFERENCES_UPDATED_KEY, Date.now())
}

export const consumeUserPreferencesUpdated = () => {
  const value = Taro.getStorageSync<number | ''>(PREFERENCES_UPDATED_KEY)

  if (!value) {
    return false
  }

  Taro.removeStorageSync(PREFERENCES_UPDATED_KEY)
  return true
}
