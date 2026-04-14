<template>
  <view class="mobile-shell home-page">
    <view class="screen-frame">
      <view class="header">
        <view class="header-copy">
          <view class="headline-wrap">
            <view class="headline-row">
              <view class="headline-shell">
                <view class="headline-bubbles" aria-hidden="true">
                  <text
                    v-for="bubble in bubbleDots"
                    :key="bubble.id"
                    class="bubble-dot"
                    :style="{
                      width: `${bubble.size}px`,
                      height: `${bubble.size}px`,
                      left: bubble.left,
                      bottom: bubble.bottom,
                      animationDelay: bubble.delay,
                      animationDuration: bubble.duration,
                    }"
                  />
                </view>
                <view class="headline" aria-label="把今天想记住的美味，轻轻存下来">
                  <text
                    v-for="(char, index) in headlineChars"
                    :key="`${char}-${index}`"
                    class="headline-char"
                    :style="{
                      animationDelay: `${1.4 + (index % 5) * 0.18}s`,
                      animationDuration: `${4.2 + (index % 3) * 0.22}s`,
                    }"
                  >
                    {{ char }}
                  </text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="search-box glass-card">
        <text class="search-icon">⌕</text>
        <text class="search-text">首页现在直接展示后端返回的 food 推荐卡片</text>
      </view>

      <view v-if="loading" class="status-card glass-card">加载中...</view>
      <view v-else-if="errorMessage" class="status-card glass-card">{{ errorMessage }}</view>
      <template v-else>
        <view class="section-title">
          <text class="title">今日推荐</text>
        </view>

        <view v-if="dailyPick" class="hero-clip">
          <view class="hero-card glass-card" @click="openFoodDetail(dailyPick.food_id)">
            <image class="hero-image" :src="getCardImage(dailyPick.cover_image_url)" mode="aspectFill" />
            <view class="hero-overlay">
              <view class="hero-top">
                <text class="hero-tag">点赞 {{ getLikeCount(dailyPick) }}</text>
                <text class="hero-tag">收藏 {{ getFavoriteCount(dailyPick.food_id) }}</text>
                <text class="hero-tag">劝退 {{ getDislikeCount(dailyPick) }}</text>
              </view>
              <view class="hero-bottom">
                <text class="hero-name">{{ dailyPick.name }}</text>
                <text class="hero-meta">{{ dailyPick.location }} | RMB {{ dailyPick.price }}</text>
                <view class="hero-rating">
                  <text class="star">★</text>
                  <text>得分 {{ dailyPick.score }}</text>
                </view>
                <view class="card-actions">
                  <view
                    class="action-pill"
                    :class="{ active: isLiked(dailyPick.food_id) }"
                    @click.stop="toggleInteraction('likes', dailyPick)"
                  >
                    {{ isLiked(dailyPick.food_id) ? '已点赞' : '点赞' }}
                  </view>
                  <view
                    class="action-pill"
                    :class="{ active: isFavorited(dailyPick.food_id) }"
                    @click.stop="toggleInteraction('favorites', dailyPick)"
                  >
                    {{ isFavorited(dailyPick.food_id) ? '已收藏' : '收藏' }}
                  </view>
                  <view
                    class="action-pill"
                    :class="{ active: isDisliked(dailyPick.food_id) }"
                    @click.stop="toggleInteraction('dislikes', dailyPick)"
                  >
                    {{ isDisliked(dailyPick.food_id) ? '已劝退' : '劝退' }}
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>
        <view v-else class="status-card glass-card">暂无今日推荐</view>

        <view class="section-title personalized-head">
          <text class="title">个性化推荐</text>
          <text class="caption">根据你的口味画像生成</text>
        </view>

        <view v-if="recommendations.length" class="recommend-list">
          <view
            v-for="dish in recommendations"
            :key="dish.food_id"
            class="recommend-card glass-card"
            @click="openFoodDetail(dish.food_id)"
          >
            <image class="recommend-image" :src="getCardImage(dish.cover_image_url)" mode="aspectFill" />
            <view class="recommend-content">
              <view>
                <text class="recommend-name">{{ dish.name }}</text>
                <text class="recommend-summary">{{ dish.location }}</text>
              </view>
              <view class="recommend-foot">
                <text class="recommend-meta">得分 {{ dish.score }} | 点赞 {{ getLikeCount(dish) }} | 收藏 {{ getFavoriteCount(dish.food_id) }} | 劝退 {{ getDislikeCount(dish) }}</text>
                <text class="recommend-price">RMB {{ dish.price }}</text>
              </view>
              <view class="recommend-actions">
                <view
                  class="inline-action"
                  :class="{ active: isLiked(dish.food_id) }"
                  @click.stop="toggleInteraction('likes', dish)"
                >
                  {{ isLiked(dish.food_id) ? '已点赞' : '点赞' }}
                </view>
                <view
                  class="inline-action"
                  :class="{ active: isFavorited(dish.food_id) }"
                  @click.stop="toggleInteraction('favorites', dish)"
                >
                  {{ isFavorited(dish.food_id) ? '已收藏' : '收藏' }}
                </view>
                <view
                  class="inline-action"
                  :class="{ active: isDisliked(dish.food_id) }"
                  @click.stop="toggleInteraction('dislikes', dish)"
                >
                  {{ isDisliked(dish.food_id) ? '已劝退' : '劝退' }}
                </view>
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
import { ref } from 'vue'
import { getDailyRecommendations, getPersonalizedRecommendations } from '../../api/foods'
import type { FoodRecommendationCard } from '../../api/types'
import { hasAccessToken } from '../../utils/auth'
import {
  getFoodInteractionCount,
  isFoodInteracted,
  toggleFoodInteraction,
  type InteractionType,
} from '../../utils/interactions'
import { consumeUserPreferencesUpdated } from '../../utils/preferences'
import { getMediaUrl } from '../../utils/request'

const headlineChars = Array.from('把今天想记住的美味，轻轻存下来')
const bubbleDots = [
  { id: 'b1', size: 7, left: '3%', bottom: '4px', delay: '0.1s', duration: '2.9s' },
  { id: 'b2', size: 10, left: '9%', bottom: '0px', delay: '0.5s', duration: '3.3s' },
  { id: 'b3', size: 6, left: '16%', bottom: '5px', delay: '1s', duration: '2.7s' },
  { id: 'b4', size: 9, left: '23%', bottom: '1px', delay: '1.4s', duration: '3.4s' },
  { id: 'b5', size: 5, left: '31%', bottom: '6px', delay: '0.8s', duration: '2.8s' },
  { id: 'b6', size: 8, left: '38%', bottom: '2px', delay: '1.9s', duration: '3.1s' },
  { id: 'b7', size: 6, left: '46%', bottom: '4px', delay: '0.3s', duration: '2.6s' },
  { id: 'b8', size: 10, left: '54%', bottom: '-1px', delay: '1.2s', duration: '3.6s' },
  { id: 'b9', size: 5, left: '61%', bottom: '6px', delay: '2.1s', duration: '2.9s' },
  { id: 'b10', size: 8, left: '69%', bottom: '0px', delay: '0.7s', duration: '3.2s' },
  { id: 'b11', size: 6, left: '77%', bottom: '5px', delay: '1.6s', duration: '2.8s' },
  { id: 'b12', size: 9, left: '85%', bottom: '1px', delay: '2.3s', duration: '3.5s' },
  { id: 'b13', size: 5, left: '92%', bottom: '4px', delay: '1.1s', duration: '2.7s' },
]

const PLACEHOLDER_IMAGE = 'https://dummyimage.com/640x420/eaf1ff/7a90c2&text=Chilemei'

const dailyPick = ref<FoodRecommendationCard | null>(null)
const recommendations = ref<FoodRecommendationCard[]>([])
const loading = ref(false)
const errorMessage = ref('')
const interactionVersion = ref(0)

const getCardImage = (url?: string | null) => {
  return getMediaUrl(url) || PLACEHOLDER_IMAGE
}

const isLiked = (foodId: number) => {
  interactionVersion.value
  return isFoodInteracted('likes', foodId)
}

const isFavorited = (foodId: number) => {
  interactionVersion.value
  return isFoodInteracted('favorites', foodId)
}

const isDisliked = (foodId: number) => {
  interactionVersion.value
  return isFoodInteracted('dislikes', foodId)
}

const getLikeCount = (food: FoodRecommendationCard) => {
  interactionVersion.value
  return food.like_count + (isLiked(food.food_id) ? 1 : 0)
}

const getFavoriteCount = (foodId: number) => {
  interactionVersion.value
  return getFoodInteractionCount('favorites', foodId)
}

const getDislikeCount = (food: FoodRecommendationCard) => {
  interactionVersion.value
  return food.dislike_count + (isDisliked(food.food_id) ? 1 : 0)
}

const toggleInteraction = (type: InteractionType, food: FoodRecommendationCard) => {
  const result = toggleFoodInteraction(type, food)
  interactionVersion.value += 1

  Taro.showToast({
    title: result.active
      ? (type === 'likes' ? '已加入点赞' : type === 'favorites' ? '已加入收藏' : '已加入劝退')
      : (type === 'likes' ? '已取消点赞' : type === 'favorites' ? '已取消收藏' : '已取消劝退'),
    icon: 'none',
  })
}

const loadData = async () => {
  if (!hasAccessToken()) {
    errorMessage.value = '请先前往登录页获取 access token。'
    dailyPick.value = null
    recommendations.value = []
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    const preferencesUpdated = consumeUserPreferencesUpdated()
    const personalizedPromise = getPersonalizedRecommendations()

    try {
      dailyPick.value = await getDailyRecommendations()
    } catch (error) {
      const message = error instanceof Error ? error.message : '获取每日推荐失败'

      if (!message.includes('404') && !message.includes('No recommendation data')) {
        throw error
      }

      dailyPick.value = null
    }

    recommendations.value = await personalizedPromise

    if (preferencesUpdated) {
      Taro.showToast({
        title: '已按最新口味画像刷新推荐',
        icon: 'none',
      })
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : '推荐接口请求失败'
    errorMessage.value = message
    Taro.showToast({ title: message, icon: 'none' })
  } finally {
    loading.value = false
  }
}

const openFoodDetail = (foodId: number) => {
  Taro.navigateTo({
    url: `/pages/food/index?foodId=${foodId}`,
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
  min-height: 100vh;
  background:
    radial-gradient(circle at 82% 7%, rgba(255, 210, 195, 0.82), transparent 20%),
    radial-gradient(circle at 16% 12%, rgba(231, 252, 246, 0.94), transparent 24%),
    radial-gradient(circle at 52% 0%, rgba(255, 241, 233, 0.85), transparent 26%),
    linear-gradient(180deg, #f4fffd 0%, #f6fffb 24%, #fffaf6 58%, #fff2ea 100%);

  .screen-frame,
  .glass-card,
  .search-box,
  .hero-clip,
  .hero-card,
  .hero-overlay,
  .recommend-list,
  .recommend-card,
  .recommend-content,
  .recommend-foot,
  .headline-wrap,
  .headline-row,
  .headline-shell,
  .headline-bubbles,
  .bubble-dot,
  .headline-char,
  .search-icon {
    box-sizing: border-box;
    min-width: 0;
    max-width: 100%;
  }

  .screen-frame {
    position: relative;
    padding: 0 2px 20px;
  }

  .header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 12px;
    gap: 20px;
    padding: 8px 0 4px;
  }

  .header-copy {
    flex: 1;
    min-width: 0;
  }

  .headline-wrap {
    position: relative;
    z-index: 1;
  }

  .headline-row {
    display: flex;
    align-items: flex-start;
    gap: 0;
    flex-wrap: wrap;
  }

  .headline-shell {
    position: relative;
    flex: 1;
    min-width: 0;
    padding-bottom: 20px;
    overflow: visible;
  }

  .headline-bubbles {
    position: absolute;
    left: 0;
    right: 4px;
    bottom: 2px;
    height: 46px;
    pointer-events: none;
    overflow: visible;
    z-index: 2;
  }

  .bubble-dot {
    position: absolute;
    border-radius: 50%;
    background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.98), rgba(255, 211, 198, 0.24) 72%);
    border: 1px solid rgba(255, 215, 204, 0.78);
    opacity: 0;
    animation-name: bubble-rise;
    animation-timing-function: ease-in-out;
    animation-iteration-count: infinite;
    animation-fill-mode: both;
  }

  .headline {
    position: relative;
    z-index: 3;
    display: block;
    font-size: 34px;
    line-height: 1.35;
    font-weight: 700;
    color: #5d433a;
    word-break: break-word;
  }

  .headline-char {
    display: inline-block;
    animation: fizz-text 4.4s ease-in-out infinite;
    animation-fill-mode: both;
  }

  .glass-card {
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.84), rgba(251, 255, 253, 0.76)),
      radial-gradient(circle at top right, rgba(255, 229, 220, 0.22), transparent 30%);
    border: 1px solid rgba(217, 242, 235, 0.92);
    box-shadow: 0 18px 34px rgba(186, 223, 215, 0.14);
    backdrop-filter: blur(12px);
  }

  .search-box,
  .status-card {
    display: flex;
    align-items: center;
    gap: 16px;
    width: 100%;
    padding: 18px;
    margin-bottom: 32px;
    overflow: hidden;
    border-radius: 24px;
    position: relative;
  }

  .search-icon {
    flex-shrink: 0;
    color: #f09a7e;
    font-size: 30px;
    line-height: 1;
  }

  .search-text {
    flex: 1;
    min-width: 0;
    color: #98a8a1;
    font-size: 24px;
    word-break: break-word;
  }

  .section-title {
    margin-bottom: 16px;
  }

  .section-title .title {
    font-size: 31px;
    font-weight: 700;
    color: #5e4a42;
    letter-spacing: 1px;
  }

  .personalized-head .caption {
    display: block;
    margin-top: 8px;
    font-size: 20px;
    color: var(--ink-500);
  }

  .hero-clip {
    width: 100%;
    overflow: hidden;
    border-radius: 28px;
    margin-bottom: 30px;
  }

  .hero-card {
    position: relative;
    width: 100%;
    height: 440px;
    overflow: hidden;
    border-radius: 28px;
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
    padding: 24px;
    background: linear-gradient(180deg, rgba(248, 255, 252, 0.06) 12%, rgba(93, 70, 58, 0.58) 100%);
    color: #fffaf8;
  }

  .hero-top {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .hero-tag {
    padding: 10px 16px;
    border-radius: 999px;
    background: rgba(255, 250, 246, 0.24);
    font-size: 20px;
  }

  .hero-name {
    display: block;
    font-size: 36px;
    font-weight: 700;
    margin-bottom: 10px;
  }

  .hero-meta {
    display: block;
    font-size: 22px;
    color: rgba(255, 247, 244, 0.88);
    margin-bottom: 12px;
  }

  .hero-rating {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 22px;
    font-weight: 700;
  }

  .star {
    color: #ffd47a;
  }

  .card-actions,
  .recommend-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 16px;
  }

  .action-pill,
  .inline-action {
    min-width: 118px;
    padding: 10px 18px;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    font-weight: 700;
  }

  .action-pill {
    background: rgba(255, 250, 246, 0.22);
    color: #fffaf8;
    border: 1px solid rgba(255, 250, 246, 0.32);
  }

  .inline-action {
    background: #fff5ef;
    color: #c57960;
  }

  .action-pill.active,
  .inline-action.active {
    background: linear-gradient(135deg, #ef9172 0%, #f4b19d 100%);
    color: #fff;
    border-color: transparent;
  }

  .recommend-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 100%;
    padding-bottom: 30px;
  }

  .recommend-card {
    display: flex;
    gap: 18px;
    width: 100%;
    padding: 16px;
    overflow: hidden;
    border-radius: 24px;
  }

  .recommend-image {
    width: 140px;
    height: 140px;
    border-radius: 20px;
    flex-shrink: 0;
  }

  .recommend-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .recommend-name {
    display: block;
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 8px;
    color: #5d433a;
  }

  .recommend-summary {
    display: block;
    font-size: 20px;
    color: #7e817d;
    line-height: 1.5;
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
    color: #9aaaa3;
  }

  .recommend-price {
    flex-shrink: 0;
    font-size: 24px;
    font-weight: 700;
    color: #ef9172;
  }

  @keyframes bubble-rise {
    0% { opacity: 0; transform: translate3d(0, 8px, 0) scale(0.74); }
    20% { opacity: 0.74; }
    60% { opacity: 0.92; transform: translate3d(8px, -18px, 0) scale(1.06); }
    100% { opacity: 0; transform: translate3d(-6px, -36px, 0) scale(1.14); }
  }

  @keyframes fizz-text {
    0%, 100% { transform: translateY(0) scale(1); }
    25% { transform: translateY(-0.03px) scale(1.0001); }
    50% { transform: translateY(0.02px) scale(0.99996); }
    75% { transform: translateY(-0.03px) scale(1.00008); }
  }
}
</style>
