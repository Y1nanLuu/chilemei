<template>
  <view class="mobile-shell interaction-page">
    <view class="screen-frame">
      <view class="hero-card glass-card">
        <text class="hero-badge">互动中心</text>
        <text class="hero-title">我的点赞</text>
        <text class="hero-copy">这里汇总你从首页加入点赞的美食，方便回看和继续进入详情。</text>
      </view>

      <view v-if="items.length === 0" class="panel-card glass-card">
        <text class="panel-title">还没有点赞内容</text>
        <text class="panel-copy">先去首页给喜欢的美食点个赞吧。</text>
      </view>

      <view v-else class="list-shell">
        <view v-for="item in items" :key="item.food_id" class="food-card glass-card" @click="openFood(item.food_id)">
          <image class="food-image" :src="getCardImage(item.cover_image_url)" mode="aspectFill" />
          <view class="food-content">
            <text class="food-name">{{ item.name }}</text>
            <text class="food-meta">{{ item.location }} · RMB {{ item.price }}</text>
            <text class="food-score">得分 {{ item.score }} · 喜欢 {{ item.like_count }} · 劝退 {{ item.dislike_count }}</text>
            <text class="food-time">点赞时间 {{ formatTime(item.saved_at) }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import Taro, { useDidShow } from '@tarojs/taro'
import { ref } from 'vue'
import type { FoodInteractionItem } from '../../../utils/interactions'
import { getFoodInteractions } from '../../../utils/interactions'
import { getMediaUrl } from '../../../utils/request'

const items = ref<FoodInteractionItem[]>([])
const PLACEHOLDER_IMAGE = 'https://dummyimage.com/640x420/eaf1ff/7a90c2&text=Chilemei'

const loadData = () => {
  items.value = getFoodInteractions('likes')
}

const getCardImage = (url?: string | null) => {
  return getMediaUrl(url) || PLACEHOLDER_IMAGE
}

const formatTime = (value: string) => value.replace('T', ' ').slice(0, 16)

const openFood = (foodId: number) => {
  Taro.navigateTo({
    url: `/pages/food/index?foodId=${foodId}`,
  })
}

useDidShow(() => {
  loadData()
})
</script>

<style lang="scss">
.interaction-page {
  .hero-card,
  .panel-card,
  .food-card {
    padding: 24px;
    margin-bottom: 18px;
  }

  .hero-badge {
    display: inline-flex;
    padding: 8px 14px;
    border-radius: 999px;
    background: #eef4ff;
    color: var(--brand-600);
    font-size: 20px;
    margin-bottom: 14px;
  }

  .hero-title,
  .panel-title,
  .food-name {
    display: block;
    font-weight: 700;
    color: var(--ink-900);
  }

  .hero-title {
    font-size: 38px;
    margin-bottom: 10px;
  }

  .panel-title {
    font-size: 28px;
    margin-bottom: 10px;
  }

  .hero-copy,
  .panel-copy,
  .food-meta,
  .food-score,
  .food-time {
    display: block;
    font-size: 22px;
    line-height: 1.7;
    color: var(--ink-600);
  }

  .list-shell {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .food-card {
    display: flex;
    gap: 18px;
    align-items: center;
  }

  .food-image {
    width: 150px;
    height: 150px;
    border-radius: 24px;
    flex-shrink: 0;
  }

  .food-content {
    flex: 1;
    min-width: 0;
  }

  .food-name {
    font-size: 28px;
    margin-bottom: 8px;
  }
}
</style>
