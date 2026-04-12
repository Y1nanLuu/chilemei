<template>
  <view class="mobile-shell interaction-page">
    <view class="screen-frame">
      <view class="hero-card glass-card">
        <text class="hero-badge">互动中心</text>
        <text class="hero-title">我的评论</text>
        <text class="hero-copy">这里汇总你在食物详情页发表过的评论，可以继续点回原食物查看。</text>
      </view>

      <view v-if="items.length === 0" class="panel-card glass-card">
        <text class="panel-title">还没有评论内容</text>
        <text class="panel-copy">先从首页进入一道美食，写下你的第一条评论吧。</text>
      </view>

      <view v-else class="list-shell">
        <view v-for="item in items" :key="item.id" class="comment-card glass-card" @click="openFood(item.food_id)">
          <view class="comment-head">
            <text class="food-name">{{ item.food_name }}</text>
            <text class="comment-time">{{ formatTime(item.created_at) }}</text>
          </view>
          <text class="food-meta">{{ item.food_location }}</text>
          <text class="comment-copy">{{ item.content }}</text>
          <text class="comment-link">查看这道菜 →</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import Taro, { useDidShow } from '@tarojs/taro'
import { ref } from 'vue'
import type { LocalFoodComment } from '../../../utils/food-comments'
import { getLocalFoodComments } from '../../../utils/food-comments'

const items = ref<LocalFoodComment[]>([])

const loadData = () => {
  items.value = [...getLocalFoodComments()].sort((a, b) => {
    const timeA = new Date(a.created_at || 0).getTime()
    const timeB = new Date(b.created_at || 0).getTime()
    return timeB - timeA
  })
}

const formatTime = (value?: string) => {
  if (!value) {
    return '未知时间'
  }

  return value.replace('T', ' ').slice(0, 16)
}

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
  .comment-card {
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
  .comment-copy,
  .comment-time,
  .comment-link {
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

  .comment-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 8px;
  }

  .food-name {
    font-size: 28px;
  }

  .comment-copy {
    color: var(--ink-800);
    margin: 10px 0 12px;
  }

  .comment-link {
    color: var(--brand-600);
    font-weight: 700;
  }
}
</style>
