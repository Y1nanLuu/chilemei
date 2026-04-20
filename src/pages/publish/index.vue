<template>
  <view class="mobile-shell publish-page">
    <view class="screen-frame">
      <view class="publish-header">
        <text class="title">发布美食</text>
        <text class="caption">记录这次吃到的味道，整理你的口味地图</text>
      </view>

      <view class="glass-card publish-form">

        <view class="section-card basics-section">
          <view class="field name-field">
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
                  没找到同名食物，直接新建
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
            <text class="field-label">餐厅</text>
            <view v-if="selectedFood" class="field-readonly">{{ dto.food.location }}</view>
            <input
              v-else
              class="field-input"
              :value="dto.food.location"
              placeholder="在哪里吃的？"
              @input="handleFoodLocationInput"
            />
          </view>

          <view class="field">
            <text class="field-label">价格</text>
            <view v-if="selectedFood" class="field-readonly">RMB {{ dto.food.price }}</view>
            <input
              v-else
              class="field-input"
              type="digit"
              :value="dto.food.price"
              placeholder="花了多少钱？"
              @input="handleFoodPriceInput"
            />
          </view>


          <view class="field">
            <text class="field-label">描述</text>
            <textarea
              class="field-textarea"
              :value="dto.review_text"
              placeholder="这顿饭让你印象最深的是什么？"
              @input="handleReviewTextInput"
            />
          </view>

          <view class="field mood-field">
            <text class="field-label">心情</text>
            <view class="mood-row">
              <view
                v-for="mood in moodOptions"
                :key="mood"
                class="mood-option"
                :class="{ active: dto.sentiment === mood }"
                @click="setSentiment(mood)"
              >
                <text
                  class="mood-icon"
                  :class="mood === 'like' ? 'mood-icon--like' : 'mood-icon--dislike'"
                >{{ mood === 'like' ? '♥' : '✖' }}</text>
              </view>
            </view>
          </view>

          <view class="field score-field">
            <text class="field-label">评分</text>
            <view
              id="rating-row"
              class="score-row"
              @touchstart="handleRatingTouch"
              @touchmove="handleRatingTouch"
            >
              <view
                v-for="i in ratingOptions"
                :key="i"
                class="score-star"
                :class="{ active: dto.rating_level >= i }"
                @click="setRatingLevel(i)"
              >
                ★
              </view>
            </view>
          </view>

          <view class="section-head">
            <text class="section-title">记录图片</text>
            <view v-if="dto.image_url" class="field-link" @click="clearRecordImage">移除</view>
          </view>
          <view class="field image-field">
            <view class="image-picker" @click="pickRecordImage">
              <image v-if="dto.image_url" class="preview-image" :src="recordPreviewUrl" mode="aspectFill" />
              <view v-else class="placeholder">
                <text class="text">{{ loading ? '上传中...' : '点击上传本次记录图片' }}</text>
              </view>
            </view>
          </view>

          <view class="submit-wrap">
            <view class="submit-btn" @click="onSubmit">
              {{ loading ? '处理中...' : '发布美食' }}
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import Taro, { useLoad } from '@tarojs/taro'
import { computed, onBeforeUnmount, reactive, ref } from 'vue'
import { createFoodRecord, deleteUploadedImage, getFoodRecords, uploadFoodImage } from '../../api/foods'
import type { CreateFoodRecordPayload, FoodRecord, Sentiment } from '../../api/types'
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
  image_filename: '',
  image_file_id: '',
})

const loading = ref(false)
const suggestionLoading = ref(false)
const nameInputFocused = ref(false)
const fromReuse = ref(false)
const suggestedFoods = ref<ExistingFoodOption[]>([])
const selectedFood = ref<ExistingFoodOption | null>(null)
const hasSubmitted = ref(false)
const moodOptions: Sentiment[] = ['like', 'dislike']
const ratingOptions: RatingLevelValue[] = [1, 2, 3, 4, 5]
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

const cleanupTempImage = async (fileId?: string) => {
  const targetFileId = fileId || dto.image_file_id

  if (!targetFileId) {
    return
  }

  try {
    await deleteUploadedImage(targetFileId)
  } catch {
    // Temp image cleanup is best-effort and should not block the user flow.
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

const updateRatingByTouchX = (touchX: number) => {
  const query = Taro.createSelectorQuery()
  query.select('#rating-row').boundingClientRect()
  query.exec((result) => {
    const rect = result?.[0]
    if (!rect || rect.width <= 0) {
      return
    }

    const relativeX = Math.max(0, Math.min(touchX - rect.left, rect.width))
    const ratio = relativeX / rect.width
    const nextRating = Math.min(5, Math.max(1, Math.ceil(ratio * 5)))
    setRatingLevel(nextRating)
  })
}

const handleRatingTouch = (event) => {
  const touchX = event?.changedTouches?.[0]?.clientX ?? event?.touches?.[0]?.clientX
  if (typeof touchX !== 'number') {
    return
  }
  updateRatingByTouchX(touchX)
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
  const previousImageFileId = dto.image_file_id

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
    dto.image_filename = uploadRes.image_filename || uploadRes.stored_path.split('/').pop() || uploadRes.image_url.split('/').pop() || ''
    dto.image_file_id = uploadRes.file_id || uploadRes.image_url

    if (previousImageFileId && previousImageFileId !== dto.image_file_id) {
      await cleanupTempImage(previousImageFileId)
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : '上传失败'
    Taro.showToast({ title: message, icon: 'none' })
  } finally {
    loading.value = false
  }
}

const clearRecordImage = async () => {
  const previousImageFileId = dto.image_file_id
  dto.image_url = ''
  dto.image_filename = ''
  dto.image_file_id = ''

  await cleanupTempImage(previousImageFileId)
}

const resetForm = () => {
  dto.food.name = ''
  dto.food.location = ''
  dto.food.price = ''
  dto.sentiment = 'like'
  dto.rating_level = 5
  dto.review_text = ''
  dto.image_url = ''
  dto.image_filename = ''
  dto.image_file_id = ''
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
    dto.image_filename = dto.image_url.split('/').pop() || ''
    dto.image_file_id = dto.image_url
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

  if (selectedFood.value?.id) {
    if (!selectedFood.value.id) {
      Taro.showToast({ title: '请选择已有食物', icon: 'none' })
      return
    }
  } else {
    if (!dto.food.location.trim()) {
      Taro.showToast({ title: '请输入餐厅/地点', icon: 'none' })
      return
    }

    if (!dto.food.price) {
      Taro.showToast({ title: '请输入价格', icon: 'none' })
      return
    }
  }

  try {
    loading.value = true
    const payload: CreateFoodRecordPayload = {
      sentiment: dto.sentiment,
      rating_level: dto.rating_level,
      ...(dto.review_text.trim() ? { review_text: dto.review_text.trim() } : {}),
      ...(dto.image_filename ? { image_filename: dto.image_filename } : {}),
    }

    if (selectedFood.value?.id) {
      payload.food_id = selectedFood.value.id
    } else {
      payload.food = {
        name: dto.food.name.trim(),
        location: dto.food.location.trim(),
        price: Number(dto.food.price),
      }
    }

    await createFoodRecord(payload)
    hasSubmitted.value = true

    Taro.setStorageSync('homeCelebrationMessage', '好好吃饭，天天向上')
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

  if (!hasSubmitted.value && dto.image_file_id) {
    void cleanupTempImage(dto.image_file_id)
  }
})
</script>

<style lang="scss">
.publish-page {
  min-height: 100vh;
  padding: 48px 0 calc(115px + env(safe-area-inset-bottom, 0px));
  overflow-x: hidden;
  background: #f6fffb;

  .screen-frame {
    width: 100%;
    max-width: 100%;
    margin: 0;
    padding: 0 0 6px;
    overflow-x: hidden;
  }

  .publish-header {
    z-index: 20;
    padding: 8px 24px 4px;
    margin-bottom: 16px;
    background: transparent;
  }

  .title {
    display: block;
    font-size: 34px;
    line-height: 1.35;
    font-weight: 700;
    margin-bottom: 8px;
    color: #5d433a;
    letter-spacing: 1px;
  }

  .caption {
    display: block;
    font-size: 20px;
    line-height: 1.5;
    color: #98a8a1;
  }

  .glass-card {
    margin: 0;
    padding: 14px;
    border-radius: 28px;
    background: rgba(255, 255, 255, 0.28);
    border: 1px solid rgba(255, 255, 255, 0.58);
    box-shadow: 0 8px 16px rgba(202, 221, 214, 0.08);
    position: relative;
    overflow: visible;
  }

  .publish-form {
    overflow-x: hidden;
    padding-bottom: 12px;
  }

  .section-card {
    position: relative;
    z-index: 1;
    padding: 16px;
    border-radius: 24px;
    background: rgba(255, 255, 255, 0.28);
    border: 1px solid rgba(255, 255, 255, 0.58);
    box-shadow: 0 8px 16px rgba(202, 221, 214, 0.08);
    overflow: visible;
  }

  .basics-section {
    padding: 24px 24px 10px;
  }

  .taste-section {
    margin-top: -12px;
    padding-top: 12px;
  }

  .section-tip {
    margin-bottom: 0;
  }

  .section-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    margin-bottom: 14px;
  }

  .section-title {
    font-size: 24px;
    font-weight: 700;
    color: #5d433a;
  }

  .section-desc {
    font-size: 18px;
    color: #9e9084;
  }

  .reuse-tip,
  .selected-food-card {
    padding: 18px 20px;
    border-radius: 22px;
    margin-bottom: 24px;
  }

  .reuse-tip {
    background: rgba(255, 245, 239, 0.72);
    color: #9e9084;
    font-size: 22px;
    line-height: 1.6;
  }

  .selected-food-card {
    background: rgba(255, 255, 255, 0.74);
    border: 1px solid rgba(238, 223, 205, 0.9);
  }

  .selected-food-label {
    display: block;
    font-size: 20px;
    color: #9e9084;
    margin-bottom: 8px;
  }

  .selected-food-value {
    display: block;
    font-size: 24px;
    font-weight: 700;
    color: #5d433a;
    margin-bottom: 12px;
  }

  .selected-food-action,
  .field-link {
    color: #ef9172;
    font-size: 20px;
    font-weight: 700;
  }

  .field {
    position: relative;
    margin-bottom: 22px;
    z-index: 1;
  }

  .name-field {
    z-index: 30;
  }

  .section-card .field:last-child {
    margin-bottom: 0;
  }

  .field-label {
    display: block;
    font-size: 26px;
    font-weight: 700;
    color: #5e4a42;
    margin-bottom: 20px;
  }

  .field-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 12px;
  }

  .field-input,
  .field-readonly,
  .field-textarea {
    width: 100%;
    min-height: 96px;
    border-radius: 24px;
    background: rgba(255, 255, 255, 0.92);
    border: 1px solid rgba(217, 242, 235, 0.88);
    box-shadow: 0 12px 28px rgba(186, 223, 215, 0.16);
    font-size: 26px;
    line-height: 1;
    color: #5d433a;
    box-sizing: border-box;
    outline: none;
  }

  .field-input,
  .field-readonly {
    height: 96px;
    padding: 0 24px;
    line-height: 96px;
    font-weight: 500;
  }

  .field-input::placeholder {
    color: #b2a59a;
    font-weight: 500;
  }

  .field-textarea::placeholder {
    color: #b2a59a;
    font-weight: 400;
  }

  .field-input:focus,
  .field-textarea:focus {
    border-color: rgba(239, 145, 114, 0.4);
    box-shadow: 0 14px 30px rgba(239, 145, 114, 0.16);
  }

  .field-textarea:focus {
    font-weight: 700;
  }

  .field-readonly {
    background: rgba(255, 245, 239, 0.65);
    color: #6b5c52;
    font-weight: 600;
  }

  .field-textarea {
    min-height: 240px;
    padding: 24px;
    line-height: 1.6;
    resize: none;
    height: auto;
    font-weight: 400;
  }

  .suggestion-panel {
    margin-top: 12px;
    border-radius: 24px;
    background: rgba(255, 255, 255, 0.92);
    border: 1px solid rgba(217, 242, 235, 0.88);
    box-shadow: 0 14px 30px rgba(186, 223, 215, 0.18);
    overflow: hidden;
    position: absolute;
    left: 0;
    right: 0;
    top: calc(100% + 8px);
    z-index: 80;
  }

  .suggestion-item,
  .suggestion-state {
    padding: 18px 20px;
  }

  .suggestion-item + .suggestion-item,
  .suggestion-state + .suggestion-item,
  .suggestion-item + .suggestion-state {
    border-top: 1px solid rgba(217, 242, 235, 0.7);
  }

  .suggestion-title {
    display: block;
    font-size: 24px;
    font-weight: 700;
    color: #5d433a;
    margin-bottom: 6px;
  }

  .suggestion-subtitle,
  .suggestion-state {
    display: block;
    font-size: 20px;
    line-height: 1.6;
    color: #9e9084;
  }

  .create-item {
    background: rgba(255, 245, 239, 0.58);
  }

  .empty-state {
    padding-top: 0;
  }

  .image-picker {
    width: 100%;
    height: 420px;
    border-radius: 28px;
    background: rgba(255, 255, 255, 0.92);
    border: 1px solid rgba(217, 242, 235, 0.88);
    box-shadow: 0 12px 28px rgba(186, 223, 215, 0.16);
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .image-field {
    margin-bottom: 0;
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
    color: #9e9084;
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
    height: 92px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.82);
    border: 1px solid rgba(217, 242, 235, 0.88);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #9e9084;
  }

  .mood-icon {
    line-height: 1;
    color: #b8b3ac;
  }

  .mood-icon--like {
    font-size: 58px;
  }

  .mood-icon--dislike {
    font-size: 44px;
  }

  .mood-option.active {
    background: linear-gradient(135deg, #ef9172 0%, #f4b19d 100%);
    color: #fff;
    border-color: transparent;
    box-shadow: 0 8px 16px rgba(239, 145, 114, 0.2);
  }

  .mood-option.active .mood-icon {
    color: #ffd86f;
  }

  .score-row {
    display: flex;
    gap: 8px;
    justify-content: center;
    flex-wrap: wrap;
    margin-top: 6px;
    padding: 8px 0;
  }

  .score-star {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 76px;
    height: 76px;
    font-size: 60px;
    color: #b8b3ac;
    line-height: 1;
    border-radius: 16px;
  }

  .score-star.active {
    color: #ffd86f;
  }

  .score-field {
    margin-top: 42px;
    margin-bottom: 0;
  }

  .mood-field {
    margin-bottom: 6px;
  }

  .mood-field .field-label {
    margin-bottom: 20px;
  }

  .submit-wrap {
    width: 100%;
    margin-top: 24px;
    padding: 0;
    box-sizing: border-box;
  }

  .submit-btn {
    width: 100%;
    height: 86px;
    border-radius: 22px;
    font-size: 28px;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 0;
    background: linear-gradient(135deg, #ef9172 0%, #f4b19d 100%);
    color: #fff;
    box-shadow: 0 8px 20px rgba(239, 145, 114, 0.24);
  }

}
</style>
