import type {
  AnnualReport,
  UpdateUserProfilePayload,
  UpdateUserPreferencesPayload,
  UserPreferenceProfile,
  UserProfile,
} from './types'
import { request } from '../utils/request'

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

export const getAnnualReport = (year: number) => {
  return request<AnnualReport>({
    url: `/reports/annual/${year}`,
  })
}

export const updateUserPreferences = (payload: UpdateUserPreferencesPayload) => {
  return request<UserPreferenceProfile, UpdateUserPreferencesPayload>({
    url: '/users/me/preferences',
    method: 'PUT',
    data: payload,
  })
}
