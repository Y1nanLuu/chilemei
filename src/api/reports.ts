import type { AnnualReport, MonthlyReport } from './types'
import { request } from '../utils/request'

export const getAnnualReport = (year: number) => {
  return request<AnnualReport>({
    url: `/reports/annual/${year}`,
  })
}

export const getMonthlyReport = (year: number, month: number) => {
  return request<MonthlyReport>({
    url: `/reports/monthly/${year}/${month}`,
  })
}
