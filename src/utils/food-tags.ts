import type { FoodTagExtraction } from '../api/types'

const unique = (items: string[]) => {
  return Array.from(new Set(items.map((item) => item.trim()).filter(Boolean)))
}

export const getFoodTagChips = (
  foodTags?: Partial<FoodTagExtraction> | null,
  limit = 5,
) => {
  if (!foodTags) {
    return []
  }

  const flags = [
    foodTags.has_chili ? `辣度${foodTags.chili_level ?? 0}` : '',
    foodTags.has_sichuan_pepper ? '花椒' : '',
    typeof foodTags.delicious_level === 'number' && foodTags.delicious_level >= 4
      ? '高好评'
      : '',
  ]

  return unique([
    ...(foodTags.recommendation_tags || []),
    ...(foodTags.taste_preferences || []),
    ...(foodTags.cuisines || []),
    ...flags,
    ...(foodTags.ingredients || []),
    ...(foodTags.seasonings || []),
    ...(foodTags.cooking_methods || []),
    ...(foodTags.texture_tags || []),
    ...(foodTags.health_tags || []),
  ]).slice(0, limit)
}
