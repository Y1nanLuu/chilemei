<template>
  <view class="mobile-shell publish-page">
    <view class="screen-frame">
      <view class="hero glass-card">
        <text class="hero-tag">POST /foods</text>
        <text class="hero-title">发布新的食物记录</text>
        <text class="hero-desc">按后端文档，这里提交 food 基础信息和本次打卡评价。</text>
      </view>

      <view class="composer glass-card">
        <view class="field">
          <text class="label">食物名称</text>
          <input class="input-box" :value="form.name" placeholder="例如：红烧牛肉面" @input="handleNameInput" />
        </view>

        <view class="field">
          <text class="label">位置</text>
          <input class="input-box" :value="form.location" placeholder="例如：一食堂二楼" @input="handleLocationInput" />
        </view>

        <view class="field row">
          <view class="field-half">
            <text class="label">价格</text>
            <input class="input-box" type="digit" :value="form.price" placeholder="18.5" @input="handlePriceInput" />
          </view>
          <view class="field-half">
            <text class="label">评价等级</text>
            <picker
              class="input-box picker-box"
              mode="selector"
              :range="ratingLevels"
              :value="ratingLevelIndex"
              @change="onRatingLevelChange"
            >
              {{ form.ratingLevel }}
            </picker>
          </view>
        </view>

        <view class="field">
          <text class="label">情绪标签</text>
          <view class="tag-row">
            <view class="choice-chip" :class="{ active: form.sentiment === 'like' }" @click="updateField('sentiment', 'like')">喜欢</view>
            <view class="choice-chip" :class="{ active: form.sentiment === 'dislike' }" @click="updateField('sentiment', 'dislike')">劝退</view>
          </view>
        </view>

        <view class="field">
          <view class="image-head">
            <text class="label">食物图片</text>
            <view class="image-action" @click="chooseImage('food')">
              {{ uploadState.food ? '上传中...' : '从相册或相机选择' }}
            </view>
          </view>
          <view v-if="foodPreviewUrl" class="image-preview-card">
            <image class="preview-image" :src="foodPreviewUrl" mode="aspectFill" />
            <view class="preview-actions">
              <text class="preview-path">{{ form.foodImageUrl }}</text>
              <view class="clear-link" @click="clearImage('food')">移除</view>
            </view>
          </view>
          <view v-else class="image-placeholder">还没有选择食物图片</view>
        </view>

        <view class="field">
          <view class="image-head">
            <text class="label">记录图片</text>
            <view class="image-action" @click="chooseImage('record')">
              {{ uploadState.record ? '上传中...' : '从相册或相机选择' }}
            </view>
          </view>
          <view v-if="recordPreviewUrl" class="image-preview-card">
            <image class="preview-image" :src="recordPreviewUrl" mode="aspectFill" />
            <view class="preview-actions">
              <text class="preview-path">{{ form.recordImageUrl }}</text>
              <view class="clear-link" @click="clearImage('record')">移除</view>
            </view>
          </view>
          <view v-else class="image-placeholder">还没有选择记录图片</view>
        </view>

        <view class="field">
          <text class="label">评价内容</text>
          <textarea
            class="textarea-box"
            :value="form.reviewText"
            maxlength="300"
            placeholder="写下这次打卡感受"
            @input="handleReviewTextInput"
          />
        </view>

        <view class="actions">
          <view class="draft-btn" @click="fillDemo">填充示例</view>
          <view class="publish-btn" @click="submitRecord">立即发布</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import Taro from '@tarojs/taro'
import { computed, reactive } from 'vue'
import { createFoodRecord, uploadFoodImage } from '../../api/foods'
import type { CreateFoodRecordPayload, Sentiment } from '../../api/types'
import { hasAccessToken } from '../../utils/auth'
import { RATING_LEVEL_OPTIONS, type RatingLevelLabel, ratingLabelToValue } from '../../utils/rating'

type ImageKind = 'food' | 'record'

const ratingLevels = RATING_LEVEL_OPTIONS.map((item) => item.label)

const form = reactive({
  name: '',
  location: '',
  price: '',
  ratingLevel: '顶级' as RatingLevelLabel,
  sentiment: 'like' as Sentiment,
  foodImageUrl: '',
  recordImageUrl: '',
  reviewText: '',
})

const preview = reactive({
  food: '',
  record: '',
})

const uploadState = reactive({
  food: false,
  record: false,
})

const ratingLevelIndex = computed(() => {
  const index = ratingLevels.findIndex((item) => item === form.ratingLevel)
  return index < 0 ? 0 : index
})

const foodPreviewUrl = computed(() => preview.food || form.foodImageUrl)
const recordPreviewUrl = computed(() => preview.record || form.recordImageUrl)

const updateField = (field: keyof typeof form, value: string) => {
  form[field] = value as never
}

const handleNameInput = (event) => {
  updateField('name', event.detail.value)
}

const handleLocationInput = (event) => {
  updateField('location', event.detail.value)
}

const handlePriceInput = (event) => {
  updateField('price', event.detail.value)
}

const handleReviewTextInput = (event) => {
  updateField('reviewText', event.detail.value)
}

const onRatingLevelChange = (event) => {
  form.ratingLevel = (ratingLevels[event.detail.value] || ratingLevels[0]) as RatingLevelLabel
}

const chooseImage = async (kind: ImageKind) => {
  if (!hasAccessToken()) {
    Taro.showToast({ title: '请先登录后再上传图片', icon: 'none' })
    return
  }

  try {
    const result = await Taro.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      maxDuration: 30,
      camera: 'back',
    })

    const tempFilePath = result.tempFiles?.[0]?.tempFilePath

    if (!tempFilePath) {
      Taro.showToast({ title: '未获取到图片', icon: 'none' })
      return
    }

    preview[kind] = tempFilePath
    uploadState[kind] = true

    const uploadResult = await uploadFoodImage(tempFilePath)

    if (kind === 'food') {
      form.foodImageUrl = uploadResult.image_url
    } else {
      form.recordImageUrl = uploadResult.image_url
    }

    Taro.showToast({ title: '图片上传成功', icon: 'success' })
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : ''

    if (errMsg.includes('cancel')) {
      return
    }

    Taro.showToast({ title: errMsg || '选择图片失败', icon: 'none' })
  } finally {
    uploadState[kind] = false
  }
}

const clearImage = (kind: ImageKind) => {
  preview[kind] = ''

  if (kind === 'food') {
    form.foodImageUrl = ''
    return
  }

  form.recordImageUrl = ''
}

const fillDemo = () => {
  form.name = '红烧牛肉面'
  form.location = '一食堂二楼'
  form.price = '18.5'
  form.ratingLevel = '顶级'
  form.sentiment = 'like'
  form.foodImageUrl = ''
  form.recordImageUrl = ''
  form.reviewText = '汤很浓，面也劲道'
  preview.food = ''
  preview.record = ''
}

const buildPayload = (): CreateFoodRecordPayload | null => {
  if (!form.name || !form.location || !form.price || !form.reviewText) {
    return null
  }

  return {
    food: {
      name: form.name,
      location: form.location,
      price: Number(form.price),
      ...(form.foodImageUrl ? { image_url: form.foodImageUrl } : {}),
    },
    sentiment: form.sentiment,
    rating_level: ratingLabelToValue(form.ratingLevel),
    review_text: form.reviewText,
    ...(form.recordImageUrl ? { image_url: form.recordImageUrl } : {}),
  }
}

const submitRecord = async () => {
  if (!hasAccessToken()) {
    Taro.showToast({ title: '请先登录后再发布', icon: 'none' })
    return
  }

  if (uploadState.food || uploadState.record) {
    Taro.showToast({ title: '图片上传中，请稍候', icon: 'none' })
    return
  }

  const payload = buildPayload()

  if (!payload) {
    Taro.showToast({ title: '请填写完整信息', icon: 'none' })
    return
  }

  try {
    const result = await createFoodRecord(payload)
    Taro.showToast({ title: '发布成功', icon: 'success' })
    Taro.navigateTo({
      url: `/pages/check/index?id=${result.id}`,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : '发布失败'
    Taro.showToast({ title: message, icon: 'none' })
  }
}
</script>

<style lang="scss">
.publish-page {
  .hero {
    padding: 28px;
    background: linear-gradient(135deg, #3476ff 0%, #59a7ff 100%);
    color: #fff;
  }

  .hero-tag {
    display: inline-block;
    padding: 8px 14px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.18);
    font-size: 20px;
    margin-bottom: 16px;
  }

  .hero-title {
    display: block;
    font-size: 38px;
    line-height: 1.35;
    font-weight: 700;
    margin-bottom: 12px;
  }

  .hero-desc {
    display: block;
    font-size: 24px;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.84);
  }

  .composer {
    margin-top: 22px;
    padding: 24px;
  }

  .field {
    margin-bottom: 24px;
  }

  .row {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
  }

  .field-half {
    flex: 1 1 0;
    min-width: 0;
  }

  .label {
    display: block;
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 12px;
  }

  .image-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 12px;
  }

  .image-action,
  .clear-link {
    color: var(--brand-600);
    font-size: 20px;
    font-weight: 600;
  }

  .input-box,
  .textarea-box,
  .picker-box {
    width: 100%;
    border-radius: 20px;
    background: #f7faff;
    border: 1px solid #e1ebff;
    color: var(--ink-700);
    font-size: 24px;
    line-height: 1.6;
    box-sizing: border-box;
  }

  .input-box,
  .picker-box {
    padding: 20px;
    min-height: 80px;
  }

  .textarea-box {
    min-height: 160px;
    padding: 20px;
  }

  .image-preview-card,
  .image-placeholder {
    border-radius: 20px;
    background: #f7faff;
    border: 1px solid #e1ebff;
    overflow: hidden;
  }

  .image-placeholder {
    padding: 24px 20px;
    color: var(--ink-500);
    font-size: 22px;
  }

  .preview-image {
    width: 100%;
    height: 260px;
    display: block;
  }

  .preview-actions {
    padding: 16px 18px;
  }

  .preview-path {
    display: block;
    font-size: 18px;
    line-height: 1.6;
    color: var(--ink-500);
    word-break: break-all;
    margin-bottom: 10px;
  }

  .tag-row {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }

  .choice-chip {
    padding: 12px 18px;
    border-radius: 999px;
    background: var(--brand-50);
    color: var(--brand-600);
    font-size: 22px;
    font-weight: 600;
  }

  .choice-chip.active {
    background: linear-gradient(135deg, #3476ff 0%, #59a7ff 100%);
    color: #fff;
  }

  .actions {
    display: flex;
    gap: 14px;
  }

  .draft-btn,
  .publish-btn {
    flex: 1;
    height: 88px;
    border-radius: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 26px;
    font-weight: 700;
  }

  .draft-btn {
    background: #eef4ff;
    color: var(--brand-600);
  }

  .publish-btn {
    background: linear-gradient(135deg, #3476ff 0%, #59a7ff 100%);
    color: #fff;
    box-shadow: 0 16px 24px rgba(52, 118, 255, 0.24);
  }
}
</style>
