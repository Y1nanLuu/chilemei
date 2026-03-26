<template>
  <view class="mobile-shell profile-page">
    <view class="screen-frame">
      <view class="profile-hero glass-card">
        <view class="hero-top">
          <view class="hero-avatar">{{ avatarInitial }}</view>
          <view>
            <text class="hero-name">{{ profile?.nickname || '未登录用户' }}</text>
            <text class="hero-signature">{{ profile?.bio || '这里展示当前用户资料和当年的年度报告摘要。' }}</text>
          </view>
        </view>
        <view class="hero-actions">
          <view class="follow-btn">GET /users/me</view>
          <view class="share-btn">GET /reports/annual/{{ currentYear }}</view>
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
          <text class="title">年度标签</text>
          <text class="caption">来自年度报告 title_tags</text>
        </view>

        <view class="action-list">
          <view v-for="tag in titleTags" :key="tag" class="action-card glass-card">
            <text class="action-name">{{ tag }}</text>
            <text class="action-arrow">标签</text>
          </view>
        </view>

        <view class="favorites glass-card">
          <text class="favorite-title">高频食物</text>
          <view v-for="food in topFoods" :key="food.name" class="favorite-item">
            <view class="favorite-image placeholder-box">{{ food.count }}</view>
            <view class="favorite-content">
              <text class="favorite-name">{{ food.name }}</text>
              <text class="favorite-meta">出现 {{ food.count }} 次</text>
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

const currentYear = new Date().getFullYear()

const profile = ref<UserProfile | null>(null)
const report = ref<AnnualReport | null>(null)
const loading = ref(false)
const errorMessage = ref('')

const avatarInitial = computed(() => (profile.value?.nickname || 'M').slice(0, 1).toUpperCase())
const titleTags = computed(() => report.value?.title_tags || [])
const topFoods = computed(() => report.value?.top_foods || [])
const profileHighlights = computed(() => {
  if (!report.value) {
    return []
  }

  return [
    { label: '已记录', value: String(report.value.total_records) },
    { label: '总消费', value: `RMB ${report.value.total_spend}` },
    { label: '喜欢', value: String(report.value.total_like_records) },
    { label: '不喜欢', value: String(report.value.total_dislike_records) },
  ]
})

const loadData = async () => {
  if (!hasAccessToken()) {
    errorMessage.value = '请先登录后再查看个人中心。'
    profile.value = null
    report.value = null
    return
  }

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

useDidShow(() => {
  void loadData()
})
</script>

<style lang="scss">
.profile-page {
  .profile-hero {
    padding: 24px;
    margin-bottom: 22px;
    background: linear-gradient(135deg, #2f6bff 0%, #7bbcff 100%);
    color: #fff;
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
    background: rgba(255, 255, 255, 0.18);
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
    color: rgba(255, 255, 255, 0.82);
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
    font-size: 20px;
    font-weight: 700;
  }

  .follow-btn {
    background: #fff;
    color: var(--brand-600);
  }

  .share-btn {
    background: rgba(255, 255, 255, 0.16);
    color: #fff;
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
  }

  .action-name {
    font-size: 24px;
    font-weight: 600;
  }

  .action-arrow {
    color: var(--brand-600);
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
