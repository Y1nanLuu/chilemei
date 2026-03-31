<template>
  <view class="mobile-shell food-detail-page">
    <view class="screen-frame">
      <view v-if="loading" class="detail-card glass-card">加载中...</view>
      <view v-else-if="errorMessage" class="detail-card glass-card">{{ errorMessage }}</view>
      <template v-else-if="detail">
        <view class="hero-card glass-card">
          <swiper
            class="hero-swiper"
            circular
            :indicator-dots="galleryImages.length > 1"
            indicator-color="rgba(255,255,255,0.44)"
            indicator-active-color="#ffffff"
          >
            <swiper-item v-for="(image, index) in galleryImages" :key="`${image}-${index}`">
              <image class="hero-image" :src="image" mode="aspectFill" />
            </swiper-item>
          </swiper>
        </view>

        <view class="detail-card glass-card info-shell">
          <view class="title-row">
            <text class="food-name">{{ detail.name || `食物 ${detail.food_id}` }}</text>
            <text class="food-score">得分 {{ detail.score || 0 }}</text>
          </view>
          <view class="meta-row">
            <text>{{ detail.location || '未知地点' }}</text>
            <text>RMB {{ detail.price ?? '--' }}</text>
            <text>喜欢 {{ detail.like_count || 0 }}</text>
            <text>劝退 {{ detail.dislike_count || 0 }}</text>
          </view>
          <view class="stat-row">
            <view class="stat-pill">{{ galleryImages.length }} 张图片</view>
            <view class="stat-pill">food_id {{ detail.food_id }}</view>
          </view>
        </view>

        <view class="detail-card glass-card">
          <text class="section-title">食物描述</text>
          <text class="section-copy">{{ detail.description || '暂无描述。' }}</text>
        </view>

        <view class="detail-card glass-card">
          <view class="section-head">
            <text class="section-title">Comments</text>
            <text class="section-meta">后端已聚合返回</text>
          </view>
          <view v-if="detail.comments.length === 0" class="empty-copy">这道菜还没有评论。</view>
          <view v-for="comment in detail.comments" :key="comment.id" class="comment-item">
            <view class="comment-avatar">{{ getInitial(comment.user?.nickname || 'U') }}</view>
            <view class="comment-body">
              <view class="comment-top">
                <text class="comment-user">{{ comment.user?.nickname || `用户 ${comment.user?.id || ''}` }}</text>
                <text class="comment-time">{{ formatDateTime(comment.created_at) }}</text>
              </view>
              <text class="comment-text">{{ comment.content }}</text>
            </view>
          </view>
        </view>
      </template>
      <view v-else class="detail-card glass-card">没有找到对应食物</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import Taro, { useDidShow } from '@tarojs/taro'
import { computed, ref } from 'vue'
import { getFoodDetail } from '../../api/foods'
import type { FoodDetailResponse } from '../../api/types'
import { hasAccessToken } from '../../utils/auth'
import { getMediaUrl } from '../../utils/request'

const route = Taro.getCurrentInstance().router?.params || {}
const foodId = Number(route.foodId || '0')
const PLACEHOLDER_IMAGE = 'https://dummyimage.com/640x420/eaf1ff/7a90c2&text=Chilemei'

const detail = ref<FoodDetailResponse | null>(null)
const loading = ref(false)
const errorMessage = ref('')

const galleryImages = computed(() => {
  if (!detail.value) {
    return [PLACEHOLDER_IMAGE]
  }

  const images = detail.value.image_urls
    .map((url) => getMediaUrl(url))
    .filter(Boolean) as string[]
  const coverImage = getMediaUrl(detail.value.cover_image_url)

  if (coverImage && !images.includes(coverImage)) {
    images.unshift(coverImage)
  }

  return images.length ? images : [PLACEHOLDER_IMAGE]
})

const formatDateTime = (value?: string) => {
  if (!value) {
    return '未知时间'
  }

  return value.replace('T', ' ').slice(0, 16)
}

const getInitial = (value: string) => value.slice(0, 1).toUpperCase()

const loadData = async () => {
  if (!hasAccessToken()) {
    errorMessage.value = '请先登录后再查看食物详情。'
    detail.value = null
    return
  }

  if (!foodId) {
    errorMessage.value = '缺少 food_id。'
    detail.value = null
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    detail.value = await getFoodDetail(foodId)
  } catch (error) {
    const message = error instanceof Error ? error.message : '食物详情加载失败'
    errorMessage.value = message
    Taro.showToast({ title: message, icon: 'none' })
  } finally {
    loading.value = false
  }
}

useDidShow(() => {
  void loadData()
})
</script>

<style lang="scss">
.food-detail-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at 82% 7%, rgba(255, 210, 195, 0.82), transparent 20%),
    radial-gradient(circle at 16% 12%, rgba(231, 252, 246, 0.94), transparent 24%),
    radial-gradient(circle at 52% 0%, rgba(255, 241, 233, 0.85), transparent 26%),
    linear-gradient(180deg, #f4fffd 0%, #f6fffb 24%, #fffaf6 58%, #fff2ea 100%);

  .hero-card,
  .detail-card {
    margin-bottom: 18px;
    overflow: hidden;
  }

  .glass-card {
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.88), rgba(251, 255, 253, 0.82)),
      radial-gradient(circle at top right, rgba(255, 229, 220, 0.22), transparent 30%);
    border: 1px solid rgba(217, 242, 235, 0.92);
    box-shadow: 0 18px 34px rgba(186, 223, 215, 0.14);
    backdrop-filter: blur(12px);
    border-radius: 28px;
  }

  .hero-swiper {
    width: 100%;
    height: 420px;
  }

  .hero-image {
    width: 100%;
    height: 100%;
  }

  .detail-card {
    padding: 22px;
  }

  .title-row,
  .meta-row,
  .section-head,
  .comment-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }

  .food-name {
    font-size: 36px;
    font-weight: 800;
    color: #5d433a;
  }

  .food-score {
    font-size: 28px;
    font-weight: 700;
    color: #ef9172;
  }

  .meta-row {
    margin-top: 10px;
    color: #7f8a84;
    font-size: 22px;
  }

  .stat-row {
    display: flex;
    gap: 12px;
    margin-top: 18px;
    flex-wrap: wrap;
  }

  .stat-pill {
    padding: 10px 16px;
    border-radius: 999px;
    background: #fff3eb;
    color: #ef9172;
    font-size: 20px;
    font-weight: 700;
  }

  .section-title {
    display: block;
    font-size: 28px;
    font-weight: 800;
    color: #5d433a;
    margin-bottom: 14px;
  }

  .section-meta,
  .comment-time,
  .empty-copy {
    color: #9aa7a0;
    font-size: 18px;
  }

  .section-copy,
  .comment-text {
    font-size: 22px;
    line-height: 1.7;
    color: #6a6f6c;
  }

  .comment-item {
    display: flex;
    gap: 14px;
    padding-top: 18px;
    margin-top: 18px;
    border-top: 1px solid #e8eefc;
  }

  .comment-avatar {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--brand-500) 0%, var(--peach-500) 100%);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    font-weight: 700;
    flex-shrink: 0;
  }

  .comment-body {
    flex: 1;
  }

  .comment-user {
    font-size: 22px;
    font-weight: 700;
    color: #5d433a;
  }
}
</style>
