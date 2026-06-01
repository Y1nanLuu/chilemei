export const toReportNumber = (value: string | number | null | undefined) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export const formatReportMoney = (value: string | number | null | undefined) => {
  return toReportNumber(value).toFixed(2)
}

export const formatReportPercent = (rate: string | number | null | undefined, digits = 0) => {
  return (toReportNumber(rate) * 100).toFixed(digits)
}

export const getMonthLabel = (month: number) => {
  return `${month}月`
}
