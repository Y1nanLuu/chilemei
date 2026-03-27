<template>
  <view class="mobile-shell publish-page">
    <view class="screen-frame">
      <view class="header">
        <text class="title">发布美食</text>
        <text class="caption">记录今天吃的好东西</text>
      </view>

      <view class="glass-card">
        <view class="field">
          <text class="field-label">美食名称</text>
          <input class="field-input" :value="dto.food.name" placeholder="今天吃了什么？" @input="updateFoodField('name', $event.detail.value)" />
        </view>

        <view class="field">
          <text class="field-label">餐厅/地点</text>
          <input class="field-input" :value="dto.food.location" placeholder="在哪里吃的？" @input="updateFoodField('location', $event.detail.value)" />
        </view>

        <view class="field">
          <text class="field-label">价格</text>
          <input class="field-input" type="number" :value="dto.food.price" placeholder="花了多少钱？" @input="updateFoodField('price', $event.detail.value)" />
        </view>

        <view class="field">
          <text class="field-label">描述</text>
          <textarea class="field-textarea" :value="dto.review_text" placeholder="有什么想说的？" @input="updateField('review_text', $event.detail.value)" />
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
              <text>{{ mood === 'like' ? '👍 喜欢' : '👎 不喜欢' }}</text>
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
          <text class="field-label">图片</text>
          <view class="image-picker" @click="pickImage">
            <image v-if="dto.food.image_url" class="preview-image" :src="dto.food.image_url" mode="aspectFill" />
            <view v-else class="placeholder">
              <text class="icon">📷</text>
              <text class="text">点击上传图片</text>
            </view>
          </view>
        </view>

        <view class="submit-btn" @click="onSubmit">
          {{ loading ? '发布中...' : '发布美食' }}
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import Taro from '@tarojs/taro'
import { reactive, ref } from 'vue'
import { createFoodRecord, uploadFoodImage } from '../../api/foods'
import { hasAccessToken } from '../../utils/auth'

const dto = reactive({
  food: {
    name: '',
    location: '',
    price: '',
    image_url: '',
  },
  sentiment: 'like' as 'like' | 'dislike',
  rating_level: 5,
  review_text: '',
  image_url: '',
})
const loading = ref(false)

const updateFoodField = (field: keyof typeof dto.food, value: string) => {
  dto.food[field] = value
}

const updateField = (field: 'review_text' | 'image_url', value: string) => {
  dto[field] = value
}

const setSentiment = (value: 'like' | 'dislike') => {
  dto.sentiment = value
}

const setRatingLevel = (value: number) => {
  dto.rating_level = value
}

const pickImage = async () => {
  try {
    const res = await Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
    })

    if (res.tempFilePaths && res.tempFilePaths[0]) {
      loading.value = true
      const uploadRes = await uploadFoodImage(res.tempFilePaths[0])
      dto.food.image_url = uploadRes.image_url
      dto.image_url = uploadRes.image_url
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : '上传失败'
    Taro.showToast({ title: message, icon: 'none' })
  } finally {
    loading.value = false
  }
}

const onSubmit = async () => {
  if (!hasAccessToken()) {
    Taro.showToast({ title: '请先登录', icon: 'none' })
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
        image_url: dto.food.image_url || undefined,
      },
      sentiment: dto.sentiment,
      rating_level: dto.rating_level,
      review_text: dto.review_text,
      image_url: dto.image_url || undefined,
    })

    Taro.showToast({ title: '发布成功', icon: 'success' })
    
    dto.food.name = ''
    dto.food.location = ''
    dto.food.price = ''
    dto.food.image_url = ''
    dto.sentiment = 'like'
    dto.rating_level = 5
    dto.review_text = ''
    dto.image_url = ''

    Taro.switchTab({ url: '/pages/index/index' })
  } catch (error) {
    const message = error instanceof Error ? error.message : '发布失败'
    Taro.showToast({ title: message, icon: 'none' })
  } finally {
    loading.value = false
  }
}
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

  .field {
    margin-bottom: 32px;
  }

  .field-label {
    display: block;
    font-size: 26px;
    font-weight: 700;
    color: var(--ink-800);
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

  .field-textarea {
    min-height: 200px;
    resize: none;
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

  .icon {
    font-size: 64px;
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
    cursor: pointer;
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
