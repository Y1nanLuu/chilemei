<template>
  <view class="mobile-shell publish-page">
    <view class="screen-frame">
      <view class="header">
        <text class="title">发布美食</text>
        <text class="caption">优先复用已有食物，没有的话再新建食物并创建记录</text>
      </view>

      <view class="glass-card">
        <view v-if="fromReuse" class="reuse-tip">
          <text>已从一条旧记录带入信息，你可以直接发布，也可以改成选择其他已有食物。</text>
        </view>

        <view class="field">
          <text class="field-label">美食名称</text>
          <input
            class="field-input"
            :value="dto.food.name"
            placeholder="今天吃了什么？"
            @input="handleFoodNameInput"
            @focus="handleFoodNameFocus"
            @blur="handleFoodNameBlur"
          />

          <view v-if="showFoodSuggestions" class="suggestion-panel">
            <view v-if="suggestionLoading" class="suggestion-state">正在查找已有食物...</view>
            <template v-else>
              <view
                v-for="item in suggestedFoods"
                :key="item.id"
                class="suggestion-item"
                @click="selectExistingFood(item)"
              >
                <text class="suggestion-title">{{ item.name }}</text>
                <text class="suggestion-subtitle">{{ item.location }} | RMB {{ item.price }}</text>
              </view>

              <view
                v-if="dto.food.name.trim()"
                class="suggestion-item create-item"
                @click="selectCreateNewFood"
              >
                <text class="suggestion-title">新建食物</text>
                <text class="suggestion-subtitle">当前名称：{{ dto.food.name.trim() }}</text>
              </view>

              <view
                v-if="!suggestedFoods.length && dto.food.name.trim()"
                class="suggestion-state empty-state"
              >
                没找到同名食物，可以直接新建
              </view>
            </template>
          </view>
        </view>

        <view v-if="selectedFoodSummary" class="selected-food-card">
          <text class="selected-food-label">当前使用已有食物</text>
          <text class="selected-food-value">{{ selectedFoodSummary }}</text>
          <view class="selected-food-action" @click="selectCreateNewFood">改为新建食物</view>
        </view>

        <view class="field">
          <text class="field-label">餐厅/地点</text>
          <input
            class="field-input"
            :value="dto.food.location"
            :disabled="Boolean(selectedFood)"
            :placeholder="selectedFood ? '已根据已有食物自动填充' : '在哪里吃的？'"
            @input="handleFoodLocationInput"
          />
        </view>

        <view class="field">
          <text class="field-label">价格</text>
          <input
            class="field-input"
            type="digit"
            :value="dto.food.price"
            :disabled="Boolean(selectedFood)"
            :placeholder="selectedFood ? '已根据已有食物自动填充' : '花了多少钱？'"
            @input="handleFoodPriceInput"
          />
        </view>

        <view class="field">
          <text class="field-label">描述</text>
          <textarea
            class="field-textarea"
            :value="dto.review_text"
            placeholder="有什么想说的？"
            @input="handleReviewTextInput"
          />
        </view>

        <view class="field">
          <text class="field-label">心情</text>
          <view class="mood-row">
            <view
              v-for="mood in ['like', 'dislike']"
              :key="mood"
              class="mood-option"
              :class="{ active: dto.sentiment === mood }"
              @click="setSentiment(mood as 'like' | 'dislike')"
            >
              <text>{{ mood === 'like' ? '喜欢' : '劝退' }}</text>
            </view>
          </view>
        </view>

        <view class="field">
          <text class="field-label">评分</text>
          <view class="score-row">
            <view
              v-for="i in [1, 2, 3, 4, 5]"
              :key="i"
              class="score-star"
              :class="{ active: dto.rating_level >= i }"
              @click="setRatingLevel(i)"
            >
              ★
            </view>
          </view>
        </view>

        <view class="field">
          <view class="field-head">
            <text class="field-label">记录图片</text>
            <view v-if="dto.image_url" class="field-link" @click="clearRecordImage">移除</view>
          </view>
          <view class="image-picker" @click="pickRecordImage">
            <image v-if="dto.image_url" class="preview-image" :src="recordPreviewUrl" mode="aspectFill" />
            <view v-else class="placeholder">
              <text class="text">{{ loading ? '上传中...' : '点击上传本次记录图片' }}</text>
            </view>
          </view>
        </view>

        <view class="submit-btn" @click="onSubmit">
          {{ loading ? '处理中...' : '发布美食' }}
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import Taro, { useLoad } from '@tarojs/taro'
import { computed, onBeforeUnmount, reactive, ref } from 'vue'
import { createFoodRecord, getFoodRecords, uploadFoodImage } from '../../api/foods'
import type { FoodRecord, Sentiment } from '../../api/types'
import { hasAccessToken } from '../../utils/auth'
import { type RatingLevelValue } from '../../utils/rating'
import { getMediaUrl } from '../../utils/request'

type PublishFoodField = 'name' | 'location' | 'price'

type ExistingFoodOption = {
  id: number
  name: string
  location: string
  price: number
}

const dto = reactive({
  food: {
    name: '',
    location: '',
    price: '',
  },
  sentiment: 'like' as Sentiment,
  rating_level: 5 as RatingLevelValue,
  review_text: '',
  image_url: '',
})

const loading = ref(false)
const suggestionLoading = ref(false)
const nameInputFocused = ref(false)
const fromReuse = ref(false)
const suggestedFoods = ref<ExistingFoodOption[]>([])
const selectedFood = ref<ExistingFoodOption | null>(null)
let blurTimer: ReturnType<typeof setTimeout> | null = null
let searchTimer: ReturnType<typeof setTimeout> | null = null

const showFoodSuggestions = computed(() => {
  return nameInputFocused.value && !!dto.food.name.trim()
})

const selectedFoodSummary = computed(() => {
  if (!selectedFood.value) {
    return ''
  }

  return `${selectedFood.value.name} · ${selectedFood.value.location}`
})

const recordPreviewUrl = computed(() => getMediaUrl(dto.image_url))

const clearTimers = () => {
  if (blurTimer) {
    clearTimeout(blurTimer)
    blurTimer = null
  }

  if (searchTimer) {
    clearTimeout(searchTimer)
    searchTimer = null
  }
}

const updateFoodField = (field: PublishFoodField, value: string) => {
  dto.food[field] = value
}

const handleFoodLocationInput = (event) => {
  updateFoodField('location', event.detail.value)
}

const handleFoodPriceInput = (event) => {
  updateFoodField('price', event.detail.value)
}

const handleReviewTextInput = (event) => {
  dto.review_text = event.detail.value
}

const setSentiment = (value: Sentiment) => {
  dto.sentiment = value
}

const setRatingLevel = (value: number) => {
  dto.rating_level = value as RatingLevelValue
}

const mapRecordsToFoods = (records: FoodRecord[], keyword: string) => {
  const normalizedKeyword = keyword.trim().toLowerCase()
  const uniqueFoods = new Map<string, ExistingFoodOption>()

  records.forEach((record) => {
    const food = record.food
    const key = String(food.id || `${food.name}::${food.location}`)

    if (!uniqueFoods.has(key)) {
      uniqueFoods.set(key, {
        id: food.id,
        name: food.name,
        location: food.location,
        price: food.price,
      })
    }
  })

  return Array.from(uniqueFoods.values()).filter((food) =>
    food.name.toLowerCase().includes(normalizedKeyword),
  )
}

const searchExistingFoods = async (keyword: string) => {
  const trimmedKeyword = keyword.trim()

  if (!trimmedKeyword) {
    suggestedFoods.value = []
    suggestionLoading.value = false
    return
  }

  suggestionLoading.value = true

  try {
    const records = await getFoodRecords({
      food_name: trimmedKeyword,
    })

    suggestedFoods.value = mapRecordsToFoods(records, trimmedKeyword)
  } catch {
    suggestedFoods.value = []
  } finally {
    suggestionLoading.value = false
  }
}

const scheduleSearchExistingFoods = (keyword: string) => {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }

  if (!keyword.trim()) {
    suggestedFoods.value = []
    suggestionLoading.value = false
    return
  }

  searchTimer = setTimeout(() => {
    void searchExistingFoods(keyword)
  }, 220)
}

const handleFoodNameInput = (event) => {
  const nextName = event.detail.value
  const previousSelectedFood = selectedFood.value

  updateFoodField('name', nextName)
  nameInputFocused.value = true

  if (previousSelectedFood && previousSelectedFood.name !== nextName) {
    selectedFood.value = null

    if (dto.food.location === previousSelectedFood.location) {
      dto.food.location = ''
    }

    if (dto.food.price === String(previousSelectedFood.price)) {
      dto.food.price = ''
    }
  }

  scheduleSearchExistingFoods(nextName)
}

const handleFoodNameFocus = () => {
  if (blurTimer) {
    clearTimeout(blurTimer)
    blurTimer = null
  }

  nameInputFocused.value = true
  scheduleSearchExistingFoods(dto.food.name)
}

const handleFoodNameBlur = () => {
  blurTimer = setTimeout(() => {
    nameInputFocused.value = false
  }, 160)
}

const selectExistingFood = (food: ExistingFoodOption) => {
  selectedFood.value = food
  dto.food.name = food.name
  dto.food.location = food.location
  dto.food.price = String(food.price)

  suggestedFoods.value = []
  nameInputFocused.value = false
}

const selectCreateNewFood = () => {
  selectedFood.value = null
  dto.food.location = ''
  dto.food.price = ''
  suggestedFoods.value = []
  nameInputFocused.value = false
}

const pickRecordImage = async () => {
  try {
    const chooseRes = await Taro.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
    })

    const tempFilePath = chooseRes.tempFiles?.[0]?.tempFilePath

    if (!tempFilePath) {
      Taro.showToast({ title: '未获取到图片', icon: 'none' })
      return
    }

    loading.value = true
    const uploadRes = await uploadFoodImage(tempFilePath)
    dto.image_url = uploadRes.image_url
  } catch (error) {
    const message = error instanceof Error ? error.message : '上传失败'
    Taro.showToast({ title: message, icon: 'none' })
  } finally {
    loading.value = false
  }
}

const clearRecordImage = () => {
  dto.image_url = ''
}

const resetForm = () => {
  dto.food.name = ''
  dto.food.location = ''
  dto.food.price = ''
  dto.sentiment = 'like'
  dto.rating_level = 5
  dto.review_text = ''
  dto.image_url = ''
  selectedFood.value = null
  suggestedFoods.value = []
  fromReuse.value = false
}

const applyPrefill = (params: Record<string, string>) => {
  if (params.foodId && params.foodName && params.location) {
    selectedFood.value = {
      id: Number(params.foodId),
      name: decodeURIComponent(params.foodName),
      location: decodeURIComponent(params.location),
      price: Number(params.price || '0'),
    }
  }

  if (params.foodName) {
    dto.food.name = decodeURIComponent(params.foodName)
  }

  if (params.location) {
    dto.food.location = decodeURIComponent(params.location)
  }

  if (params.price) {
    dto.food.price = decodeURIComponent(params.price)
  }

  if (params.recordImageUrl) {
    dto.image_url = decodeURIComponent(params.recordImageUrl)
  }

  if (params.reviewText) {
    dto.review_text = decodeURIComponent(params.reviewText)
  }

  if (params.sentiment === 'like' || params.sentiment === 'dislike') {
    dto.sentiment = params.sentiment
  }

  const ratingLevel = Number(params.ratingLevel)

  if (ratingLevel >= 1 && ratingLevel <= 5) {
    dto.rating_level = ratingLevel as RatingLevelValue
  }

  fromReuse.value = params.fromReuse === '1'
}

const onSubmit = async () => {
  if (!hasAccessToken()) {
    Taro.showToast({ title: '请先登录', icon: 'none' })
    return
  }

  if (loading.value) {
    return
  }

  if (!dto.food.name.trim()) {
    Taro.showToast({ title: '请输入美食名称', icon: 'none' })
    return
  }

  if (!dto.food.location.trim()) {
    Taro.showToast({ title: '请输入餐厅/地点', icon: 'none' })
    return
  }

  if (!dto.food.price) {
    Taro.showToast({ title: '请输入价格', icon: 'none' })
    return
  }

  try {
    loading.value = true

    await createFoodRecord({
      food: {
        name: dto.food.name.trim(),
        location: dto.food.location.trim(),
        price: Number(dto.food.price),
      },
      sentiment: dto.sentiment,
      rating_level: dto.rating_level,
      review_text: dto.review_text.trim(),
      image_url: dto.image_url || undefined,
    })

    Taro.showToast({ title: '发布成功', icon: 'success' })
    resetForm()
    Taro.switchTab({ url: '/pages/index/index' })
  } catch (error) {
    const message = error instanceof Error ? error.message : '发布失败'
    Taro.showToast({ title: message, icon: 'none' })
  } finally {
    loading.value = false
  }
}

useLoad((params) => {
  if (params) {
    applyPrefill(params as Record<string, string>)
  }
})

onBeforeUnmount(() => {
  clearTimers()
})
</script>

<style lang="scss">
.publish-page {
  .header {
    padding: 28px 28px 12px;
  }

  .title {
    display: block;
    font-size: 44px;
    font-weight: 800;
    margin-bottom: 6px;
    color: var(--ink-900);
  }

  .caption {
    display: block;
    font-size: 24px;
    color: var(--ink-600);
  }

  .glass-card {
    margin: 12px 28px 28px;
    padding: 28px;
  }

  .reuse-tip,
  .selected-food-card {
    padding: 18px 20px;
    border-radius: 22px;
    margin-bottom: 24px;
  }

  .reuse-tip {
    background: #eef4ff;
    color: var(--brand-700);
    font-size: 22px;
    line-height: 1.6;
  }

  .selected-food-card {
    background: #f6fbf1;
    border: 1px solid #d7ebc6;
  }

  .selected-food-label {
    display: block;
    font-size: 20px;
    color: #638348;
    margin-bottom: 8px;
  }

  .selected-food-value {
    display: block;
    font-size: 24px;
    font-weight: 700;
    color: var(--ink-900);
    margin-bottom: 12px;
  }

  .selected-food-action,
  .field-link {
    color: var(--brand-600);
    font-size: 20px;
    font-weight: 600;
  }

  .field {
    position: relative;
    margin-bottom: 32px;
  }

  .field-label {
    display: block;
    font-size: 26px;
    font-weight: 700;
    color: var(--ink-800);
    margin-bottom: 12px;
  }

  .field-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 12px;
  }

  .field-input,
  .field-textarea {
    width: 100%;
    padding: 20px 24px;
    border-radius: 24px;
    background: #fff;
    box-shadow: 0 18px 40px rgba(28, 56, 118, 0.08);
    font-size: 26px;
    color: var(--ink-900);
    box-sizing: border-box;
    border: none;
    outline: none;
  }

  .field-input[disabled] {
    background: #f7fbf1;
    color: var(--ink-600);
  }

  .field-textarea {
    min-height: 200px;
    resize: none;
  }

  .suggestion-panel {
    margin-top: 12px;
    border-radius: 24px;
    background: #fff;
    box-shadow: 0 18px 40px rgba(28, 56, 118, 0.12);
    overflow: hidden;
  }

  .suggestion-item,
  .suggestion-state {
    padding: 18px 20px;
  }

  .suggestion-item + .suggestion-item,
  .suggestion-state + .suggestion-item,
  .suggestion-item + .suggestion-state {
    border-top: 1px solid #edf2fb;
  }

  .suggestion-title {
    display: block;
    font-size: 24px;
    font-weight: 700;
    color: var(--ink-900);
    margin-bottom: 6px;
  }

  .suggestion-subtitle,
  .suggestion-state {
    display: block;
    font-size: 20px;
    line-height: 1.6;
    color: var(--ink-500);
  }

  .create-item {
    background: #f8fbff;
  }

  .empty-state {
    padding-top: 0;
  }

  .image-picker {
    width: 100%;
    aspect-ratio: 4/3;
    border-radius: 28px;
    background: #fff;
    box-shadow: 0 18px 40px rgba(28, 56, 118, 0.08);
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .preview-image {
    width: 100%;
    height: 100%;
  }

  .placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    color: var(--ink-400);
  }

  .text {
    font-size: 24px;
  }

  .mood-row {
    display: flex;
    gap: 16px;
  }

  .mood-option {
    flex: 1;
    height: 88px;
    border-radius: 24px;
    background: rgba(255, 255, 255, 0.72);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 26px;
    font-weight: 700;
    color: var(--ink-600);
    transition: all 0.2s ease;
  }

  .mood-option.active {
    background: linear-gradient(135deg, var(--brand-500) 0%, var(--peach-500) 100%);
    color: #fff;
    box-shadow: 0 12px 28px rgba(220, 154, 95, 0.25);
  }

  .score-row {
    display: flex;
    gap: 12px;
    justify-content: center;
  }

  .score-star {
    font-size: 48px;
    color: rgba(200, 200, 200, 0.5);
    transition: all 0.2s ease;
  }

  .score-star.active {
    color: #ffc107;
    text-shadow: 0 2px 12px rgba(255, 193, 7, 0.4);
  }

  .submit-btn {
    width: 100%;
    height: 96px;
    border-radius: 28px;
    font-size: 30px;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 16px;
    background: linear-gradient(135deg, var(--brand-500) 0%, var(--peach-500) 100%);
    color: #fff;
    box-shadow: 0 12px 28px rgba(220, 154, 95, 0.25);
  }
}
</style>
