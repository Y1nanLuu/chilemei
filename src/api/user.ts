import type {
  UpdateUserProfilePayload,
  UpdateUserPreferencesPayload,
  UserPreferenceProfile,
  UserProfile,
} from './types'
import { request } from '../utils/request'

export { getAnnualReport, getMonthlyReport } from './reports'

export const getCurrentUser = () => {
  return request<UserProfile>({
    url: '/users/me',
  })
}

export const updateUserProfile = (payload: UpdateUserProfilePayload) => {
  return request<UserProfile, UpdateUserProfilePayload>({
    url: '/users/me',
    method: 'PUT',
    data: payload,
  })
}

export const updateUserPreferences = (payload: UpdateUserPreferencesPayload) => {
  return request<UserPreferenceProfile, UpdateUserPreferencesPayload>({
    url: '/users/me/preferences',
    method: 'PUT',
    data: payload,
  })
}
