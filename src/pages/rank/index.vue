<template>
  <view class="mobile-shell rank-page">
    <view class="screen-frame">
      <view class="section-title">
        <text class="title">热度榜单</text>
      </view>

      <view class="tabs glass-card">
        <view
          v-for="tab in tabs"
          :key="tab.key"
          class="tab-item"
          :class="{ active: activeTab === tab.key }"
          @click="switchTab(tab.key)"
        >
          {{ tab.label }}
        </view>
      </view>

      <view class="scope-switch glass-card">
        <view
          v-for="option in scopeOptions"
          :key="option.key"
          class="scope-item"
          :class="{ active: activeScope === option.key }"
          @click="switchScope(option.key)"
        >
          {{ option.label }}
        </view>
      </view>

      <view v-if="loading" class="board-card glass-card">加载中...</view>
      <view v-else-if="errorMessage" class="board-card glass-card">{{ errorMessage }}</view>

      <view v-else class="board-list">
        <view
          v-for="(item, index) in rankings"
          :key="`${item.food_id}-${activeTab}-${activeScope}`"
          class="board-card glass-card"
          @click="openFood(item)"
        >
          <view class="board-rank" :class="`rank-${index + 1}`">{{ index + 1 }}</view>
          <image class="board-image" :src="getCardImage(item.cover_image_url)" mode="aspectFill" />
          <view class="board-content">
            <view class="board-head">
              <text class="board-name">{{ item.name }}</text>
              <text class="board-price">RMB {{ item.price }}</text>
            </view>
            <text class="board-restaurant">{{ item.location }}</text>
            <view class="board-meta">
              <text class="board-heat">得分 {{ item.score }} | 喜欢 {{ item.like_count }} | 劝退 {{ item.dislike_count }}</text>
              <text class="board-action">查看食物详情</text>
            </view>
          </view>
        </view>
        <view v-if="rankings.length === 0" class="board-card glass-card">暂无榜单数据</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Taro, { useDidShow } from '@tarojs/taro'
import { getFoodRankings } from '../../api/foods'
import type { FoodRankingItem } from '../../api/types'
import { hasAccessToken } from '../../utils/auth'
import { getMediaUrl } from '../../utils/request'

const tabs = [
  { key: 'daily', label: '日榜' },
  { key: 'weekly', label: '周榜' },
  { key: 'all', label: '总榜' },
] as const

const scopeOptions = [
  { key: 'global', label: '全部用户' },
  { key: 'mine', label: '只看自己' },
] as const

const activeTab = ref<'daily' | 'weekly' | 'all'>('daily')
const activeScope = ref<'global' | 'mine'>('global')
const rankings = ref<FoodRankingItem[]>([])
const loading = ref(false)
const errorMessage = ref('')

const PLACEHOLDER_IMAGE = 'https://dummyimage.com/640x420/eaf1ff/7a90c2&text=Chilemei'

const loadData = async () => {
  if (!hasAccessToken()) {
    errorMessage.value = '请先登录后再查看榜单。'
    rankings.value = []
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    rankings.value = await getFoodRankings(activeTab.value, activeScope.value)
  } catch (error) {
    const message = error instanceof Error ? error.message : '榜单加载失败'
    errorMessage.value = message
    Taro.showToast({ title: message, icon: 'none' })
  } finally {
    loading.value = false
  }
}

const switchTab = (tab: 'daily' | 'weekly' | 'all') => {
  activeTab.value = tab
  void loadData()
}

const switchScope = (scope: 'global' | 'mine') => {
  activeScope.value = scope
  void loadData()
}

const getCardImage = (url?: string | null) => {
  return getMediaUrl(url) || PLACEHOLDER_IMAGE
}

const openFood = (item: FoodRankingItem) => {
  Taro.navigateTo({
    url: `/pages/food/index?foodId=${item.food_id}`,
  })
}

useDidShow(() => {
  void loadData()
})
</script>

<style lang="scss">
.rank-page {
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  min-height: 100vh;

  .tabs {
    display: flex;
    gap: 10px;
    padding: 10px;
    margin-bottom: 24px;
  }

  .scope-switch {
    display: flex;
    gap: 10px;
    padding: 10px;
    margin-bottom: 24px;
  }

  .tab-item {
    flex: 1;
    height: 72px;
    border-radius: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--ink-500);
    font-size: 22px;
    font-weight: 600;
  }

  .scope-item {
    flex: 1;
    height: 64px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--ink-500);
    font-size: 20px;
    font-weight: 600;
  }

  .tab-item.active {
    background: linear-gradient(135deg, var(--brand-500) 0%, var(--peach-500) 100%);
    color: #f5eee6ff;
    box-shadow: 0 8px 16px rgba(220, 154, 95, 0.1);
  }

  .scope-item.active {
    background: #f3dfccff;
    color: var(--brand-700);
    box-shadow: 0 6px 12px rgba(220, 154, 95, 0.1);
  }

  .board-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .board-card {
    display: flex;
    gap: 18px;
    align-items: flex-start;
    padding: 18px;
  }

  .board-rank {
    width: 56px;
    height: 56px;
    border-radius: 18px;
    background: #e3e9f5ff;
    color: var(--brand-600);
    font-size: 26px;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .rank-1 {
    background: linear-gradient(135deg, #ffd873 0%, #ffb648 100%);
    color: #6f4a00;
  }

  .rank-2 {
    background: linear-gradient(135deg, #dbe4f1 0%, #b9c7da 100%);
    color: #41526e;
  }

  .rank-3 {
    background: linear-gradient(135deg, #ffcfa9 0%, #df9e6c 100%);
    color: #6f3d0b;
  }

  .board-content {
    flex: 1;
    min-width: 0;
  }

  .board-image {
    width: 124px;
    height: 124px;
    border-radius: 20px;
    flex-shrink: 0;
  }

  .board-head,
  .board-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .board-name {
    flex: 1;
    min-width: 0;
    font-size: 26px;
    font-weight: 700;
    color: var(--ink-900);
    word-break: break-word;
  }

  .board-price {
    flex-shrink: 0;
    font-size: 24px;
    font-weight: 700;
    color: var(--brand-600);
  }

  .board-restaurant {
    display: block;
    font-size: 20px;
    color: var(--ink-500);
    margin: 10px 0 14px;
  }

  .board-heat,
  .board-action {
    font-size: 20px;
    color: var(--ink-700);
  }
}
</style>
