export const RATING_LEVEL_MAP = {
  5: '夯',
  4: '顶级',
  3: '人上人',
  2: 'NPC',
  1: '拉完了',
} as const

export type RatingLevelValue = keyof typeof RATING_LEVEL_MAP
export type RatingLevelLabel = (typeof RATING_LEVEL_MAP)[RatingLevelValue]

export const RATING_LEVEL_OPTIONS = Object.entries(RATING_LEVEL_MAP)
  .sort((a, b) => Number(b[0]) - Number(a[0]))
  .map(([value, label]) => ({
    label,
    value: Number(value) as RatingLevelValue,
  }))

export const ratingLevelToLabel = (ratingLevel?: number | null) => {
  if (!ratingLevel) {
    return '未评分'
  }

  return RATING_LEVEL_MAP[ratingLevel as RatingLevelValue] || `评分 ${ratingLevel}`
}

export const ratingLabelToValue = (ratingLabel: string) => {
  const target = RATING_LEVEL_OPTIONS.find((item) => item.label === ratingLabel)
  return target?.value || 5
}
