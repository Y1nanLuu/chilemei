import type { AnnualReport, UserProfile } from './types'
import { request } from '../utils/request'

export const getCurrentUser = () => {
  return request<UserProfile>({
    url: '/users/me',
  })
}

export const getAnnualReport = (year: number) => {
  return request<AnnualReport>({
    url: `/reports/annual/${year}`,
  })
}
