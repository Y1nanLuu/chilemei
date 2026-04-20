<template>
  <view class="mobile-shell profile-page">
    <view class="screen-frame">
      <view class="profile-hero glass-card">
        <view class="hero-top">
          <image v-if="profile?.avatar_url" class="hero-avatar-image" :src="avatarUrl" mode="aspectFill" />
          <view v-else class="hero-avatar">{{ avatarInitial }}</view>
          <view>
            <text class="hero-name">{{ profile?.nickname || 'Mia 同学' }}</text>
            <text class="hero-signature">{{ profile?.bio || '偏爱轻食、烤物和所有看起来会发光的甜品。' }}</text>
          </view>
        </view>
        <view class="hero-actions">
          <view class="follow-btn" @tap="profile ? openEditProfile() : handleWechatLogin()">
            {{ profile ? '编辑资料' : '立即登录' }}
          </view>
          <view class="share-btn">美食报告</view>
        </view>
      </view>

      <view v-if="loading" class="favorites glass-card">加载中...</view>
      <view v-else-if="loginRequired" class="login-panel glass-card">
        <text class="login-title">登录后查看个人中心</text>
        <text class="login-copy">同步你的收藏、记录和口味画像。</text>
        <view class="login-btn" @tap="handleWechatLogin">
          {{ loginLoading ? '登录中...' : '立即登录' }}
        </view>
      </view>
      <view v-else-if="errorMessage" class="favorites glass-card">{{ errorMessage }}</view>

      <template v-else>
        <view class="stats-grid">
          <view
            v-for="item in profileHighlights"
            :key="item.label"
            class="stat-card glass-card"
            :class="{ 'is-clickable': !!item.path }"
            @tap="openProfileHighlight(item)"
          >
            <text class="stat-value">{{ item.value }}</text>
            <text class="stat-label">{{ item.label }}</text>
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
import { getFavoriteFoods } from '../../api/foods'
import { wechatLogin } from '../../api/auth'
import { getCurrentUser, getAnnualReport } from '../../api/user'
import type { AnnualReport, FavoriteFoodItem, UserProfile } from '../../api/types'
import {
  getCurrentUser as getStoredCurrentUser,
  hasAccessToken,
  setAccessToken,
  setCurrentUser,
} from '../../utils/auth'
import { getMediaUrl } from '../../utils/request'

const currentYear = new Date().getFullYear()

const profile = ref<UserProfile | null>(null)
const report = ref<AnnualReport | null>(null)
const loading = ref(false)
const loginLoading = ref(false)
const errorMessage = ref('')
const favoriteFoods = ref<FavoriteFoodItem[]>([])
const isLoggedIn = ref(hasAccessToken())
type ProfileHighlight = {
  label: string
  value: string
  path?: string
  isTab?: boolean
}

const avatarInitial = computed(() => (profile.value?.nickname || 'M').slice(0, 1).toUpperCase())
const avatarUrl = computed(() => getMediaUrl(profile.value?.avatar_url))
const loginRequired = computed(() => !isLoggedIn.value)
const topFoods = computed(() => {
  if (favoriteFoods.value.length) {
    return favoriteFoods.value.slice(0, 2).map((food) => ({
      name: food.name,
      count: 1,
      location: food.location,
      price: food.price,
    }))
  }

  return report.value?.top_foods || []
})
const profileHighlights = computed<ProfileHighlight[]>(() => {
  if (!report.value) {
    return [
      { label: '已记录', value: '0', path: '/pages/record/index', isTab: true },
      { label: '总消费', value: 'RMB --' },
      { label: '口味画像', value: '去设置', path: '/pages/preferences/index' },
      { label: '收藏', value: String(favoriteFoods.value.length), path: '/pages/interactions/favorites/index' },
    ]
  }

  return [
    { label: '已记录', value: String(report.value.total_records), path: '/pages/record/index', isTab: true },
    { label: '总消费', value: `RMB ${report.value.total_spend}` },
    { label: '口味画像', value: '去设置', path: '/pages/preferences/index' },
    { label: '收藏', value: String(favoriteFoods.value.length), path: '/pages/interactions/favorites/index' },
  ]
})

const loadData = async () => {
  isLoggedIn.value = hasAccessToken()

  if (!isLoggedIn.value) {
    errorMessage.value = ''
    profile.value = null
    report.value = null
    favoriteFoods.value = []
    return
  }

  const storedUser = getStoredCurrentUser()
  if (storedUser && !profile.value) {
    profile.value = {
      id: storedUser.id,
      nickname: storedUser.nickname,
      avatar_url: storedUser.avatar_url,
    }
  }

  loading.value = true
  errorMessage.value = ''

  try {
    const user = await getCurrentUser()
    profile.value = user
    setCurrentUser(user)

    const [annualReportResult, favoritesResult] = await Promise.allSettled([
      getAnnualReport(currentYear),
      getFavoriteFoods(),
    ])

    if (annualReportResult.status === 'fulfilled') {
      report.value = annualReportResult.value
    } else {
      report.value = null
    }

    if (favoritesResult.status === 'fulfilled') {
      favoriteFoods.value = favoritesResult.value
    } else {
      favoriteFoods.value = []
    }
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

const openEditProfile = () => {
  Taro.navigateTo({
    url: '/pages/profile/edit/index',
    fail: (error) => {
      const message = error?.errMsg || '编辑资料页面打开失败'
      Taro.showToast({ title: message, icon: 'none' })
    },
  })
}

const handleWechatLogin = async () => {
  if (loginLoading.value) {
    return
  }

  const modalResult = await Taro.showModal({
    title: '微信登录',
    content: '是否授权微信登录并创建/进入你的账号？',
    confirmText: '授权登录',
    cancelText: '取消',
  })

  if (!modalResult.confirm) {
    return
  }

  try {
    loginLoading.value = true
    const loginResult = await Taro.login()

    if (!loginResult.code) {
      Taro.showToast({ title: '未获取到微信 code', icon: 'none' })
      return
    }

    const result = await wechatLogin({ code: loginResult.code })
    setAccessToken(result.access_token)
    setCurrentUser(result.user || null)
    isLoggedIn.value = true

    if (result.user) {
      profile.value = {
        id: result.user.id,
        nickname: result.user.nickname,
        avatar_url: result.user.avatar_url,
      }
    }

    Taro.showToast({ title: '登录成功', icon: 'success' })
    await loadData()
  } catch (error) {
    const message = error instanceof Error ? error.message : '微信登录失败'
    Taro.showToast({ title: message, icon: 'none' })
  } finally {
    loginLoading.value = false
  }
}

const openProfileHighlight = (item: ProfileHighlight) => {
  if (!item.path) {
    return
  }

  if (item.isTab) {
    Taro.switchTab({ url: item.path })
    return
  }

  openInteractionPage(item.path)
}

useDidShow(() => {
  void loadData()
})
</script>

<style lang="scss">
.profile-page {
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  min-height: 100vh;

  &.mobile-shell {
    padding: 40px 30px 260px;
  }

  /* 与 rank-page 同一套页面底色 */
  background:
    radial-gradient(circle at 78% 4%, rgba(255, 210, 195, 0.75), transparent 22%),
    radial-gradient(circle at 12% 18%, rgba(186, 236, 220, 0.55), transparent 28%),
    radial-gradient(circle at 50% 0%, rgba(255, 241, 233, 0.9), transparent 32%),
    linear-gradient(180deg, #dff5ec 0%, #e8faf4 18%, #f6fffb 42%, #fffaf6 72%, #fff2ea 100%);

  .screen-frame {
    position: relative;
    width: 100%;
    max-width: 100%;
    margin: 0 auto;
    padding: 0 4px 20px;
  }

  .profile-hero {
    padding: 24px;
    margin-bottom: 22px;
    border-radius: 24px;
    background: rgba(255, 255, 255, 0.78);
    border: 1px solid rgba(255, 255, 255, 0.95);
    box-shadow: none;
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
  .hero-avatar-image,
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

  .hero-avatar-image {
    display: block;
    overflow: hidden;
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
    gap: 10px;
    margin-top: 22px;
  }

  /* 与记录页 filter-chip / 首页主操作同一套：主按钮珊瑚渐变 + 次按钮磨砂白丸 */
  .follow-btn,
  .share-btn {
    flex: 1;
    min-height: 72px;
    padding: 10px 14px;
    border-radius: 999px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 23px;
    font-weight: 700;
    line-height: 1.3;
    -webkit-tap-highlight-color: transparent;
  }

  .follow-btn {
    color: #fffaf8;
    background: linear-gradient(135deg, #ef9172 0%, #f4b19d 100%);
    border: 1px solid rgba(255, 255, 255, 0.35);
    box-shadow: 0 4px 12px rgba(239, 145, 114, 0.22);
  }

  .follow-btn:active {
    opacity: 0.92;
  }

  .share-btn {
    color: #9e9084;
    background: rgba(255, 255, 255, 0.55);
    border: 1px solid rgba(255, 210, 200, 0.45);
    backdrop-filter: blur(8px);
  }

  .share-btn:active {
    opacity: 0.88;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
    margin-bottom: 24px;
  }

  .stat-card,
  .action-card,
  .login-panel,
  .favorites {
    padding: 20px;
    background: rgba(255, 255, 255, 0.28);
    border: 1px solid rgba(255, 255, 255, 0.58);
    box-shadow: 0 8px 16px rgba(202, 221, 214, 0.08);
    backdrop-filter: blur(12px);
    border-radius: 24px;
  }

  .login-title {
    display: block;
    font-size: 28px;
    font-weight: 800;
    color: #5d433a;
    margin-bottom: 10px;
  }

  .login-copy {
    display: block;
    font-size: 21px;
    line-height: 1.6;
    color: #7f8a84;
    margin-bottom: 18px;
  }

  .login-btn {
    min-height: 74px;
    border-radius: 999px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fffaf8;
    background: linear-gradient(135deg, #ef9172 0%, #f4b19d 100%);
    font-size: 24px;
    font-weight: 800;
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

  .stat-card.is-clickable {
    -webkit-tap-highlight-color: transparent;
  }

  .stat-card.is-clickable:active {
    opacity: 0.86;
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
