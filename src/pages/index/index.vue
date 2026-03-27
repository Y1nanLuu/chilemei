<template>
  <view class="mobile-shell home-page">
    <view class="screen-frame">
      <view class="header">
        <view class="header-copy">
          <text class="headline">今日推荐和个性化推荐已经切到后端接口。</text>
          <text class="subhead">接口来源：GET /foods/recommendations/daily 和 GET /foods/recommendations/personalized</text>
        </view>
      </view>

      <view class="search-box glass-card">
        <text class="search-text">后端推荐会优先返回最近 24 小时内的最新可见记录</text>
      </view>

      <view v-if="loading" class="status-card glass-card">加载中...</view>
      <view v-else-if="errorMessage" class="status-card glass-card">{{ errorMessage }}</view>

      <template v-else>
        <view class="section-title">
          <text class="title">Today Picks</text>
        </view>

        <view v-if="dailyPicks.length" class="hero-clip">
          <swiper class="hero-swiper" circular autoplay interval="3600" duration="420">
            <swiper-item v-for="dish in dailyPicks" :key="dish.id">
              <view class="hero-card glass-card" @click="openDetail(dish.id)">
                <image class="hero-image" :src="dish.image" mode="aspectFill" />
                <view class="hero-overlay">
                  <view class="hero-top">
                    <text v-for="tag in dish.tags" :key="tag" class="hero-tag">{{ tag }}</text>
                  </view>
                  <view class="hero-bottom">
                    <text class="hero-name">{{ dish.name }}</text>
                    <text class="hero-meta">{{ dish.location }} | RMB {{ dish.price }}</text>
                    <view class="hero-rating">
                      <text class="star">★</text>
                      <text>{{ dish.ratingText }}</text>
                    </view>
                  </view>
                </view>
              </view>
            </swiper-item>
          </swiper>
        </view>
        <view v-else class="status-card glass-card">暂无今日推荐</view>

        <view class="section-title">
          <text class="title">Hot Spots</text>
        </view>

        <view v-if="hotSpots.length" class="restaurant-grid">
          <view
            v-for="spot in hotSpots"
            :key="spot.id"
            class="restaurant-card glass-card"
            @click="openDetail(spot.recordId)"
          >
            <image class="restaurant-image" :src="spot.image" mode="aspectFill" />
            <view class="restaurant-body">
              <text class="restaurant-name">{{ spot.name }}</text>
              <text class="restaurant-theme">{{ spot.theme }}</text>
              <view class="restaurant-score">
                <text class="star">★</text>
                <text>{{ spot.score }}</text>
              </view>
            </view>
          </view>
        </view>
        <view v-else class="status-card glass-card">暂无热门地点数据</view>

        <view class="section-title">
          <text class="title">Recommended</text>
        </view>

        <view v-if="recommendations.length" class="recommend-list">
          <view
            v-for="dish in recommendations"
            :key="dish.id"
            class="recommend-card glass-card"
            @click="openDetail(dish.id)"
          >
            <image class="recommend-image" :src="dish.image" mode="aspectFill" />
            <view class="recommend-content">
              <text class="recommend-name">{{ dish.name }}</text>
              <text class="recommend-summary">{{ dish.summary }}</text>
              <view class="recommend-foot">
                <text class="recommend-meta">{{ dish.location }}</text>
                <text class="recommend-price">RMB {{ dish.price }}</text>
              </view>
            </view>
          </view>
        </view>
        <view v-else class="status-card glass-card">暂无个性化推荐</view>
      </template>
    </view>
  </view>
</template>

<script setup lang="ts">
import Taro, { useDidShow } from '@tarojs/taro'
import { computed, ref } from 'vue'
import { getDailyRecommendations, getPersonalizedRecommendations } from '../../api/foods'
import type { FoodRecord } from '../../api/types'
import { hasAccessToken } from '../../utils/auth'
import { ratingLevelToLabel } from '../../utils/rating'

type HomeDishCard = {
  id: number
  name: string
  location: string
  price: number
  image: string
  summary: string
  tags: string[]
  ratingText: string
}

type HotSpotCard = {
  id: string
  recordId: number
  name: string
  theme: string
  image: string
  score: string
}

const PLACEHOLDER_IMAGE = 'https://dummyimage.com/640x420/eaf1ff/7a90c2&text=Chilemei'

const dailyRecords = ref<FoodRecord[]>([])
const personalizedRecords = ref<FoodRecord[]>([])
const loading = ref(false)
const errorMessage = ref('')

const sentimentLabelMap: Record<string, string> = {
  like: '喜欢',
  dislike: '劝退',
}

const mapRecordToCard = (record: FoodRecord): HomeDishCard => {
  return {
    id: record.id,
    name: record.food.name,
    location: record.food.location,
    price: record.food.price,
    image: record.image_url || record.food.image_url || PLACEHOLDER_IMAGE,
    summary: record.review_text || '这条记录暂无文字评价',
    tags: [
      sentimentLabelMap[record.sentiment] || record.sentiment,
      ratingLevelToLabel(record.rating_level),
    ].filter(Boolean),
    ratingText: ratingLevelToLabel(record.rating_level),
  }
}

const dailyPicks = computed(() => dailyRecords.value.map(mapRecordToCard))
const recommendations = computed(() => personalizedRecords.value.map(mapRecordToCard))

const hotSpots = computed<HotSpotCard[]>(() => {
  const locationMap = new Map<string, HotSpotCard>()
  const merged = [...dailyRecords.value, ...personalizedRecords.value]

  merged.forEach((record) => {
    const key = record.food.location
    const current = locationMap.get(key)

    if (!current) {
      locationMap.set(key, {
        id: `${record.food.location}-${record.id}`,
        recordId: record.id,
        name: record.food.location,
        theme: `最近常出现：${record.food.name}`,
        image: record.image_url || record.food.image_url || PLACEHOLDER_IMAGE,
        score: ratingLevelToLabel(record.rating_level),
      })
    }
  })

  return Array.from(locationMap.values()).slice(0, 4)
})

const loadData = async () => {
  if (!hasAccessToken()) {
    errorMessage.value = '请先前往登录页获取 access token。'
    dailyRecords.value = []
    personalizedRecords.value = []
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    const personalizedPromise = getPersonalizedRecommendations()
    let daily: FoodRecord | null = null

    try {
      daily = await getDailyRecommendations()
    } catch (error) {
      const message = error instanceof Error ? error.message : '获取每日推荐失败'

      if (!message.includes('404') && !message.includes('No recommendation data')) {
        throw error
      }
    }

    personalizedRecords.value = await personalizedPromise
    dailyRecords.value = daily ? [daily] : []
  } catch (error) {
    const message = error instanceof Error ? error.message : '推荐接口请求失败'
    errorMessage.value = message
    Taro.showToast({
      title: message,
      icon: 'none',
    })
  } finally {
    loading.value = false
  }
}

const openDetail = (id: number) => {
  Taro.navigateTo({
    url: `/pages/check/index?id=${id}`,
  })
}

useDidShow(() => {
  void loadData()
})
</script>

<style lang="scss">
.home-page {
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;

  .screen-frame,
  .glass-card,
  .search-box,
  .hero-clip,
  .hero-swiper,
  .hero-card,
  .hero-overlay,
  .restaurant-grid,
  .restaurant-card,
  .restaurant-body,
  .recommend-list,
  .recommend-card,
  .recommend-content,
  .recommend-foot {
    box-sizing: border-box;
    min-width: 0;
    max-width: 100%;
  }

  .header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 28px;
    gap: 20px;
  }

  .header-copy {
    flex: 1;
    min-width: 0;
  }

  .headline {
    display: block;
    font-size: 34px;
    line-height: 1.35;
    font-weight: 700;
    color: var(--ink-900);
    word-break: break-word;
  }

  .subhead {
    display: block;
    margin-top: 10px;
    font-size: 20px;
    line-height: 1.6;
    color: var(--ink-500);
    word-break: break-word;
  }

  .search-box,
  .status-card {
    display: flex;
    align-items: center;
    gap: 18px;
    width: 100%;
    padding: 24px 28px;
    margin-bottom: 36px;
    overflow: hidden;
  }

  .search-text {
    flex: 1;
    min-width: 0;
    color: var(--ink-500);
    font-size: 24px;
    word-break: break-word;
  }

  .hero-clip {
    width: 100%;
    overflow: hidden;
    border-radius: 32px;
    margin-bottom: 36px;
  }

  .hero-swiper {
    width: 100%;
    height: 440px;
    overflow: hidden;
  }

  .hero-swiper swiper-item {
    width: 100%;
    overflow: hidden;
  }

  .hero-card {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  .hero-image {
    width: 100%;
    height: 100%;
  }

  .hero-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 100%;
    padding: 28px;
    background: linear-gradient(180deg, rgba(7, 21, 48, 0.04) 18%, rgba(7, 21, 48, 0.66) 100%);
    color: #fff;
  }

  .hero-top {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .hero-tag {
    padding: 10px 16px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.2);
    font-size: 20px;
  }

  .hero-name {
    display: block;
    font-size: 36px;
    font-weight: 700;
    margin-bottom: 10px;
    word-break: break-word;
  }

  .hero-meta {
    display: block;
    font-size: 22px;
    color: rgba(255, 255, 255, 0.84);
    margin-bottom: 12px;
    word-break: break-word;
  }

  .hero-rating,
  .restaurant-score {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 22px;
    font-weight: 700;
  }

  .star {
    color: #ffb648;
  }

  .restaurant-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px;
    width: 100%;
    margin-bottom: 36px;
    overflow: hidden;
  }

  .restaurant-card {
    width: 100%;
    overflow: hidden;
  }

  .restaurant-image {
    width: 100%;
    height: 200px;
  }

  .restaurant-body {
    width: 100%;
    padding: 22px;
  }

  .restaurant-name,
  .recommend-name {
    display: block;
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 8px;
    word-break: break-word;
  }

  .restaurant-theme {
    display: block;
    font-size: 20px;
    color: var(--ink-500);
    margin-bottom: 10px;
    word-break: break-word;
  }

  .recommend-list {
    display: flex;
    flex-direction: column;
    gap: 22px;
    width: 100%;
  }

  .recommend-card {
    display: flex;
    gap: 18px;
    width: 100%;
    padding: 18px;
    overflow: hidden;
  }

  .recommend-image {
    width: 152px;
    height: 152px;
    border-radius: 24px;
    flex-shrink: 0;
  }

  .recommend-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .recommend-summary {
    display: block;
    font-size: 20px;
    color: var(--ink-700);
    line-height: 1.6;
    word-break: break-word;
  }

  .recommend-foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
    width: 100%;
    margin-top: 12px;
  }

  .recommend-meta {
    flex: 1;
    min-width: 0;
    font-size: 18px;
    color: var(--ink-500);
    word-break: break-word;
  }

  .recommend-price {
    flex-shrink: 0;
    font-size: 24px;
    font-weight: 700;
    color: var(--brand-600);
  }
}
</style>
