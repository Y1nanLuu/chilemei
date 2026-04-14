<template>
  <view class="mobile-shell profile-page">
    <view class="screen-frame">
      <view class="profile-hero glass-card">
        <view class="hero-top">
          <view class="hero-avatar">{{ avatarInitial }}</view>
          <view>
            <text class="hero-name">{{ profile?.nickname || 'Mia 同学' }}</text>
            <text class="hero-signature">{{ profile?.bio || '偏爱轻食、烤物和所有看起来会发光的甜品。' }}</text>
          </view>
        </view>
        <view class="hero-actions">
          <view class="follow-btn">编辑资料</view>
          <view class="share-btn">分享主页</view>
        </view>
      </view>

      <view v-if="loading" class="favorites glass-card">加载中...</view>
      <view v-else-if="errorMessage" class="favorites glass-card">{{ errorMessage }}</view>

      <template v-else>
        <view class="stats-grid">
          <view v-for="item in profileHighlights" :key="item.label" class="stat-card glass-card">
            <text class="stat-value">{{ item.value }}</text>
            <text class="stat-label">{{ item.label }}</text>
          </view>
        </view>

        <view class="section-title">
          <text class="title">互动功能</text>
          <text class="caption">评论、点赞、收藏、想吃</text>
        </view>

        <view class="action-list">
          <view
            v-for="action in interactionActions"
            :key="action.key"
            class="action-card glass-card"
            @click="openInteractionPage(action.path)"
          >
            <view>
              <text class="action-name">{{ action.label }}</text>
              <text class="action-desc">{{ action.description }}</text>
            </view>
            <text class="action-arrow">→</text>
          </view>
        </view>

        <view class="section-title">
          <text class="title">个人设置</text>
          <text class="caption">画像偏好与推荐联动入口</text>
        </view>

        <view class="action-list">
          <view
            v-for="action in settingsActions"
            :key="action.key"
            class="action-card glass-card"
            @click="openInteractionPage(action.path)"
          >
            <view>
              <text class="action-name">{{ action.label }}</text>
              <text class="action-desc">{{ action.description }}</text>
            </view>
            <text class="action-arrow">→</text>
          </view>
        </view>

        <view class="favorites glass-card">
          <text class="favorite-title">最近收藏</text>
          <view v-for="food in topFoods.slice(0, 2)" :key="food.name" class="favorite-item">
            <view class="favorite-image placeholder-box">{{ food.count || '0' }}</view>
            <view class="favorite-content">
              <text class="favorite-name">{{ food.name || '示例食物' }}</text>
              <text class="favorite-meta">{{ food.location || '示例餐厅' }} · ￥{{ food.price || 0 }}</text>
            </view>
          </view>
          <view v-if="topFoods.length === 0" class="favorite-meta">年度报告中暂时没有高频食物。</view>
        </view>
      </template>
    </view>
  </view>
</template>

<script setup lang="ts">
import Taro, { useDidShow } from '@tarojs/taro'
import { computed, ref } from 'vue'
import { getCurrentUser, getAnnualReport } from '../../api/user'
import type { AnnualReport, UserProfile } from '../../api/types'
import { hasAccessToken } from '../../utils/auth'
import { getFoodInteractions } from '../../utils/interactions'

const currentYear = new Date().getFullYear()
const interactionActions = [
  {
    key: 'comments',
    label: '评论',
    description: '查看自己参与讨论过的内容入口',
    path: '/pages/interactions/comments/index',
  },
  {
    key: 'likes',
    label: '点赞',
    description: '查看你点赞过的美食与记录入口',
    path: '/pages/interactions/likes/index',
  },
  {
    key: 'favorites',
    label: '收藏',
    description: '查看你收藏过的美食清单入口',
    path: '/pages/interactions/favorites/index',
  },
] as const

const settingsActions = [
  {
    key: 'taste-profile',
    label: '口味画像',
    description: '管理偏爱口味、忌口和吃辣等级',
    path: '/pages/preferences/index',
  },
] as const

const profile = ref<UserProfile | null>(null)
const report = ref<AnnualReport | null>(null)
const loading = ref(false)
const errorMessage = ref('')
const localFavoriteFoods = ref(getFoodInteractions('favorites'))
const localLikedFoods = ref(getFoodInteractions('likes'))

const avatarInitial = computed(() => (profile.value?.nickname || 'M').slice(0, 1).toUpperCase())
const topFoods = computed(() => {
  if (localFavoriteFoods.value.length) {
    return localFavoriteFoods.value.map((food) => ({
      name: food.name,
      count: 1,
      location: food.location,
      price: food.price,
    }))
  }

  return report.value?.top_foods || []
})
const profileHighlights = computed(() => {
  if (!report.value) {
    return [
      { label: '点赞', value: String(localLikedFoods.value.length) },
      { label: '收藏', value: String(localFavoriteFoods.value.length) },
    ]
  }

  return [
    { label: '已记录', value: String(report.value.total_records) },
    { label: '总消费', value: `RMB ${report.value.total_spend}` },
    { label: '点赞', value: String(localLikedFoods.value.length) },
    { label: '收藏', value: String(localFavoriteFoods.value.length) },
  ]
})

const loadData = async () => {
  if (!hasAccessToken()) {
    errorMessage.value = '请先登录后再查看个人中心。'
    profile.value = null
    report.value = null
    return
  }

  localFavoriteFoods.value = getFoodInteractions('favorites')
  localLikedFoods.value = getFoodInteractions('likes')
  loading.value = true
  errorMessage.value = ''

  try {
    const [user, annualReport] = await Promise.all([
      getCurrentUser(),
      getAnnualReport(currentYear),
    ])

    profile.value = user
    report.value = annualReport
  } catch (error) {
    const message = error instanceof Error ? error.message : '个人中心加载失败'
    errorMessage.value = message
    Taro.showToast({ title: message, icon: 'none' })
  } finally {
    loading.value = false
  }
}

const openInteractionPage = (path: string) => {
  Taro.navigateTo({ url: path })
}

useDidShow(() => {
  void loadData()
})
</script>

<style lang="scss">
.profile-page {
  .profile-hero {
    padding: 24px;
    margin-bottom: 22px;
    background: linear-gradient(135deg, #fff4df 0%, #f8c66d 100%);
    color: var(--ink-900);
  }

  .hero-top {
    display: flex;
    gap: 16px;
    align-items: center;
  }

  .hero-top > view:last-child {
    flex: 1;
    min-width: 0;
  }

  .hero-avatar,
  .placeholder-box {
    width: 82px;
    height: 82px;
    border-radius: 26px;
    background: rgba(255, 255, 255, 0.42);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 34px;
    font-weight: 800;
  }

  .placeholder-box {
    background: #edf4ff;
    color: var(--brand-600);
    font-size: 28px;
  }

  .hero-name {
    display: block;
    font-size: 32px;
    font-weight: 700;
    margin-bottom: 8px;
    word-break: break-word;
  }

  .hero-signature {
    display: block;
    font-size: 22px;
    line-height: 1.6;
    color: rgba(51, 39, 34, 0.72);
    word-break: break-word;
  }

  .hero-actions {
    display: flex;
    gap: 12px;
    margin-top: 22px;
  }

  .follow-btn,
  .share-btn {
    flex: 1;
    height: 78px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    font-weight: 700;
  }

  .follow-btn {
    background: #fffaf4;
    color: var(--peach-600);
  }

  .share-btn {
    background: rgba(255, 250, 244, 0.72);
    color: var(--ink-900);
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
    margin-bottom: 24px;
  }

  .stat-card,
  .action-card,
  .favorites {
    padding: 20px;
  }

  .stat-value {
    display: block;
    font-size: 34px;
    font-weight: 800;
    color: var(--brand-600);
    margin-bottom: 8px;
  }

  .stat-label {
    font-size: 20px;
    color: var(--ink-500);
  }

  .section-title {
    margin-bottom: 16px;
  }

  .title {
    display: block;
    font-size: 31px;
    font-weight: 700;
    color: #5e4a42;
    letter-spacing: 1px;
    margin-bottom: 8px;
  }

  .caption {
    font-size: 20px;
    color: var(--ink-500);
  }

  .action-list {
    display: flex;
    flex-direction: column;
    gap: 14px;
    margin-bottom: 24px;
  }

  .action-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }

  .action-name {
    display: block;
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 6px;
  }

  .action-desc {
    display: block;
    font-size: 18px;
    line-height: 1.5;
    color: var(--ink-500);
  }

  .action-arrow {
    color: var(--peach-600);
    font-size: 24px;
  }

  .favorite-title {
    display: block;
    font-size: 28px;
    font-weight: 700;
    margin-bottom: 16px;
  }

  .favorite-item {
    display: flex;
    gap: 14px;
  }

  .favorite-item + .favorite-item {
    margin-top: 14px;
  }

  .favorite-image {
    width: 124px;
    height: 124px;
    border-radius: 18px;
    flex-shrink: 0;
  }

  .favorite-content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .favorite-name {
    display: block;
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 8px;
    word-break: break-word;
  }

  .favorite-meta {
    font-size: 20px;
    color: var(--ink-500);
  }
}
</style>
