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

      <view class="search-wrap">
        <view class="search-box glass-card">
          <text class="search-icon">⌕</text>
          <input
            v-model="searchInput"
            class="search-input"
            type="text"
            confirm-type="search"
            placeholder="搜索美食名称"
            placeholder-class="search-placeholder"
            @confirm="runSearch"
            @focus="handleSearchFocus"
            @blur="handleSearchBlur"
            @input="handleSearchInput"
          />
          <text class="search-submit" @tap.stop="runSearch">搜索</text>
        </view>
        <view v-if="showSearchSuggestions" class="home-suggestion-panel glass-card">
          <view v-if="searchPanelPinned" class="home-suggestion-bar">
            <text class="home-suggestion-bar-title">「{{ searchInput.trim() }}」相关美食</text>
            <text class="home-suggestion-bar-clear" @tap.stop="clearSearch">清除</text>
          </view>
          <view v-if="!hasAccessToken()" class="home-suggestion-state">请先登录后再使用搜索联想</view>
          <view v-else-if="suggestionLoading" class="home-suggestion-state">正在查找...</view>
          <template v-else>
            <view
              v-for="item in suggestedFoods"
              :key="item.id"
              class="home-suggestion-item"
              @tap.stop="pickSuggestion(item)"
            >
              <text class="home-suggestion-title">{{ item.name }}</text>
              <text class="home-suggestion-sub">{{ item.location }} | RMB {{ item.price }}</text>
            </view>
            <view
              v-if="searchInput.trim() && !suggestedFoods.length"
              class="home-suggestion-state home-suggestion-state--muted"
            >
              暂无包含该名称的美食
            </view>
          </template>
        </view>
      </view>

      <view v-if="loading" class="status-card glass-card">加载中...</view>
      <view v-else-if="errorMessage" class="status-card glass-card">{{ errorMessage }}</view>
      <template v-else>
        <view class="section-title">
          <text class="title">今日推荐</text>
        </view>

        <view v-if="dailySlides.length" class="hero-swiper-wrap">
          <swiper
            class="hero-swiper"
            :circular="dailySlides.length > 1"
            :autoplay="false"
            :indicator-dots="false"
            :previous-margin="dailySlides.length > 1 ? heroSwiperPeek : '0px'"
            :next-margin="dailySlides.length > 1 ? heroSwiperPeek : '0px'"
          >
            <swiper-item
              v-for="dish in dailySlides"
              :key="dish.food_id"
              class="hero-swiper-item"
            >
              <view class="hero-card glass-card" @tap="openFoodDetail(dish.food_id)">
                <image class="hero-image" :src="getCardImage(dish.cover_image_url)" mode="aspectFill" />
                <view class="hero-overlay">
                  <view class="hero-top">
                    <text class="hero-tag">点赞 {{ getLikeCount(dish) }}</text>
                    <text class="hero-tag">收藏 {{ getFavoriteCount(dish.food_id) }}</text>
                    <text class="hero-tag">劝退 {{ getDislikeCount(dish) }}</text>
                  </view>
                  <view class="hero-bottom">
                    <text class="hero-name">{{ dish.name }}</text>
                    <text class="hero-meta">{{ dish.location }} | RMB {{ dish.price }}</text>
                    <view class="hero-rating">
                      <text class="star">★</text>
                      <text>得分 {{ dish.score }}</text>
                    </view>
                    <view class="card-actions">
                      <view
                        class="action-pill"
                        :class="{ active: isLiked(dish.food_id) }"
                        @tap.stop="toggleInteraction('likes', dish)"
                      >
                        {{ isLiked(dish.food_id) ? '已点赞' : '点赞' }}
                      </view>
                      <view
                        class="action-pill"
                        :class="{ active: isFavorited(dish.food_id) }"
                        @tap.stop="toggleInteraction('favorites', dish)"
                      >
                        {{ isFavorited(dish.food_id) ? '已收藏' : '收藏' }}
                      </view>
                      <view
                        class="action-pill"
                        :class="{ active: isDisliked(dish.food_id) }"
                        @tap.stop="toggleInteraction('dislikes', dish)"
                      >
                        {{ isDisliked(dish.food_id) ? '已劝退' : '劝退' }}
                      </view>
                    </view>
                  </view>
                </view>
              </view>
            </swiper-item>
          </swiper>
        </view>
        <view v-else class="status-card glass-card">暂无今日推荐</view>

        <view class="section-title">
          <text class="title">个性化推荐</text>
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

      <view v-if="showCelebration" class="celebration-overlay">
        <view class="celebration-fireworks" aria-hidden="true">
          <view
            v-for="spark in fireworkSparks"
            :key="spark.id"
            class="firework-spark"
            :style="{
              left: spark.left,
              top: spark.top,
              background: spark.color,
                      '--dx': spark.dx,
                      '--dy': spark.dy,
              animationDelay: spark.delay,
              animationDuration: spark.duration,
            }"
          />
        </view>
        <view class="celebration-text-wrap">
          <text class="celebration-text celebration-line">好好吃饭</text>
          <text class="celebration-text celebration-line">天天向上</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import Taro, { useDidShow } from '@tarojs/taro'
import { computed, onBeforeUnmount, ref } from 'vue'
import { getDailyRecommendations, getFoodRecords, getPersonalizedRecommendations } from '../../api/foods'
import type { FoodRecord, FoodRecommendationCard } from '../../api/types'
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
const fireworkSparks = [
  { id: 's1', left: '48%', top: '45%', color: '#ff9aa2', dx: '-46px', dy: '-34px', delay: '0.01s', duration: '0.82s' },
  { id: 's2', left: '52%', top: '45%', color: '#ffd86f', dx: '44px', dy: '-32px', delay: '0.03s', duration: '0.86s' },
  { id: 's3', left: '50%', top: '44%', color: '#84d8ff', dx: '-18px', dy: '-52px', delay: '0.05s', duration: '0.88s' },
  { id: 's4', left: '50%', top: '46%', color: '#ffa7d2', dx: '20px', dy: '-50px', delay: '0.07s', duration: '0.84s' },
  { id: 's5', left: '49%', top: '46%', color: '#ffbf85', dx: '-54px', dy: '-6px', delay: '0.09s', duration: '0.85s' },
  { id: 's6', left: '51%', top: '46%', color: '#9de5b4', dx: '52px', dy: '-8px', delay: '0.11s', duration: '0.86s' },
  { id: 's7', left: '49%', top: '47%', color: '#ffd3a5', dx: '-38px', dy: '30px', delay: '0.13s', duration: '0.83s' },
  { id: 's8', left: '51%', top: '47%', color: '#c9b6ff', dx: '36px', dy: '28px', delay: '0.15s', duration: '0.87s' },
  { id: 's9', left: '50%', top: '45%', color: '#aeeec4', dx: '0px', dy: '-58px', delay: '0.17s', duration: '0.9s' },
  { id: 's10', left: '50%', top: '47%', color: '#ffc7a6', dx: '0px', dy: '34px', delay: '0.19s', duration: '0.82s' },
]

const PLACEHOLDER_IMAGE = 'https://dummyimage.com/640x420/eaf1ff/7a90c2&text=Chilemei'

type SearchFoodItem = {
  id: number
  name: string
  location: string
  price: number
  image_url: string | null | undefined
}

const dailyPick = ref<FoodRecommendationCard | null>(null)
const recommendations = ref<FoodRecommendationCard[]>([])
/** 今日推荐横滑：每日推荐 + 个性化（去重） */
const dailySlides = ref<FoodRecommendationCard[]>([])
/** 两侧留白以露出相邻卡片一角，类似 QQ 音乐歌单卡 */
const heroSwiperPeek = '32px'
const loading = ref(false)
const errorMessage = ref('')
const searchInput = ref('')
const searchInputFocused = ref(false)
/** 点击「搜索」后固定展开下拉，失焦仍展示结果，直至清除或点选 */
const searchPanelPinned = ref(false)
const suggestionLoading = ref(false)
const suggestedFoods = ref<SearchFoodItem[]>([])
const interactionVersion = ref(0)
const showCelebration = ref(false)
let celebrationTimer: ReturnType<typeof setTimeout> | null = null
let searchSuggestTimer: ReturnType<typeof setTimeout> | null = null
let searchBlurTimer: ReturnType<typeof setTimeout> | null = null

const showSearchSuggestions = computed(() => {
  const kw = searchInput.value.trim()
  if (!kw) {
    return false
  }
  return searchInputFocused.value || searchPanelPinned.value
})

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

const rebuildDailySlides = () => {
  const out: FoodRecommendationCard[] = []
  const seen = new Set<number>()
  if (dailyPick.value) {
    out.push(dailyPick.value)
    seen.add(dailyPick.value.food_id)
  }
  for (const item of recommendations.value) {
    if (seen.has(item.food_id)) {
      continue
    }
    out.push(item)
    seen.add(item.food_id)
  }
  dailySlides.value = out
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
    dailySlides.value = []
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
    recommendations.value = []
  } finally {
    rebuildDailySlides()
    loading.value = false
  }
}

const openFoodDetail = (foodId: number) => {
  Taro.navigateTo({
    url: `/pages/food/index?foodId=${foodId}`,
  })
}

const mapRecordsToSearchFoods = (records: FoodRecord[], keyword: string): SearchFoodItem[] => {
  const normalizedKeyword = keyword.trim().toLowerCase()
  const uniqueFoods = new Map<number, SearchFoodItem>()

  records.forEach((record) => {
    const food = record.food
    if (!food.id) {
      return
    }
    if (!uniqueFoods.has(food.id)) {
      uniqueFoods.set(food.id, {
        id: food.id,
        name: food.name,
        location: food.location,
        price: food.price,
        image_url: food.image_url,
      })
    }
  })

  return Array.from(uniqueFoods.values()).filter((food) =>
    food.name.toLowerCase().includes(normalizedKeyword),
  )
}

const clearSearchTimers = () => {
  if (searchSuggestTimer) {
    clearTimeout(searchSuggestTimer)
    searchSuggestTimer = null
  }
  if (searchBlurTimer) {
    clearTimeout(searchBlurTimer)
    searchBlurTimer = null
  }
}

const clearSearch = () => {
  clearSearchTimers()
  searchInput.value = ''
  searchPanelPinned.value = false
  suggestedFoods.value = []
  suggestionLoading.value = false
  searchInputFocused.value = false
}

const fetchSearchSuggestions = async (keyword: string) => {
  if (!hasAccessToken()) {
    suggestedFoods.value = []
    suggestionLoading.value = false
    return
  }

  suggestionLoading.value = true

  try {
    const records = await getFoodRecords({ food_name: keyword })
    suggestedFoods.value = mapRecordsToSearchFoods(records, keyword)
  } catch {
    suggestedFoods.value = []
  } finally {
    suggestionLoading.value = false
  }
}

const scheduleSearchSuggestions = () => {
  if (searchSuggestTimer) {
    clearTimeout(searchSuggestTimer)
    searchSuggestTimer = null
  }

  const keyword = searchInput.value.trim()

  if (!keyword) {
    suggestedFoods.value = []
    suggestionLoading.value = false
    searchPanelPinned.value = false
    return
  }

  searchSuggestTimer = setTimeout(() => {
    searchSuggestTimer = null
    void fetchSearchSuggestions(keyword)
  }, 220)
}

const handleSearchInput = () => {
  searchPanelPinned.value = false
  scheduleSearchSuggestions()
}

const handleSearchFocus = () => {
  if (searchBlurTimer) {
    clearTimeout(searchBlurTimer)
    searchBlurTimer = null
  }
  searchInputFocused.value = true
  scheduleSearchSuggestions()
}

const handleSearchBlur = () => {
  searchBlurTimer = setTimeout(() => {
    searchInputFocused.value = false
    searchBlurTimer = null
  }, 200)
}

const pickSuggestion = (item: SearchFoodItem) => {
  clearSearchTimers()
  suggestedFoods.value = []
  searchInputFocused.value = false
  searchPanelPinned.value = false
  openFoodDetail(item.id)
}

const runSearch = async () => {
  const keyword = searchInput.value.trim()

  if (!keyword) {
    clearSearch()
    return
  }

  if (!hasAccessToken()) {
    Taro.showToast({ title: '请先登录后再搜索', icon: 'none' })
    return
  }

  clearSearchTimers()
  searchInputFocused.value = false
  searchPanelPinned.value = true
  suggestionLoading.value = true

  try {
    const records = await getFoodRecords({ food_name: keyword })
    suggestedFoods.value = mapRecordsToSearchFoods(records, keyword)
  } catch (error) {
    const message = error instanceof Error ? error.message : '搜索失败'
    Taro.showToast({ title: message, icon: 'none' })
    suggestedFoods.value = []
  } finally {
    suggestionLoading.value = false
  }
}

useDidShow(() => {
  const celebrationMessage = Taro.getStorageSync('homeCelebrationMessage')
  if (celebrationMessage) {
    Taro.removeStorageSync('homeCelebrationMessage')
    showCelebration.value = true
    if (celebrationTimer) {
      clearTimeout(celebrationTimer)
    }
    celebrationTimer = setTimeout(() => {
      showCelebration.value = false
    }, 2300)
  }

  void loadData()
})

onBeforeUnmount(() => {
  if (celebrationTimer) {
    clearTimeout(celebrationTimer)
    celebrationTimer = null
  }
  clearSearchTimers()
})
</script>

<style lang="scss">
.home-page {
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  min-height: 100vh;

  &.mobile-shell {
    padding: 40px 30px 260px;
  }
  /* 与榜单页 rank-page 同一套底色 */
  background:
    radial-gradient(circle at 78% 4%, rgba(255, 210, 195, 0.75), transparent 22%),
    radial-gradient(circle at 12% 18%, rgba(186, 236, 220, 0.55), transparent 28%),
    radial-gradient(circle at 50% 0%, rgba(255, 241, 233, 0.9), transparent 32%),
    linear-gradient(180deg, #dff5ec 0%, #e8faf4 18%, #f6fffb 42%, #fffaf6 72%, #fff2ea 100%);

  .screen-frame,
  .glass-card,
  .search-wrap,
  .search-box,
  .home-suggestion-panel,
  .home-suggestion-item,
  .home-suggestion-bar,
  .hero-swiper-wrap,
  .hero-swiper,
  .hero-swiper-item,
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
    width: 100%;
    max-width: 100%;
    margin: 0 auto;
    padding: 0 4px 20px;
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
    background: rgba(255, 255, 255, 0.28);
    border: 1px solid rgba(255, 255, 255, 0.58);
    box-shadow: 0 8px 16px rgba(202, 221, 214, 0.08);
    backdrop-filter: blur(12px);
  }

  .search-wrap {
    position: relative;
    z-index: 30;
    margin-bottom: 32px;
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

  .search-wrap .search-box {
    margin-bottom: 0;
    gap: 10px;
    padding: 11px 14px;
    border-radius: 20px;
  }

  .search-icon {
    flex-shrink: 0;
    color: #f09a7e;
    font-size: 26px;
    line-height: 1;
  }

  .search-input {
    flex: 1;
    min-width: 0;
    height: 40px;
    padding: 0 6px;
    border: none;
    background: transparent;
    font-size: 22px;
    color: #5d433a;
    line-height: 1.35;
  }

  .search-placeholder {
    color: #9aaaa3;
    font-size: 22px;
  }

  .search-submit {
    flex-shrink: 0;
    padding: 0 0 0 10px;
    font-size: 22px;
    font-weight: 600;
    color: #c45c48;
    line-height: 40px;
    -webkit-tap-highlight-color: transparent;
  }

  .search-submit:active {
    opacity: 0.55;
  }

  .home-suggestion-panel {
    position: absolute;
    left: 0;
    right: 0;
    top: 100%;
    margin-top: 8px;
    max-height: 420px;
    overflow-y: auto;
    border-radius: 22px;
    padding: 0;
    z-index: 40;
    box-shadow: 0 14px 32px rgba(120, 140, 130, 0.18);
    -webkit-overflow-scrolling: touch;
  }

  .home-suggestion-item,
  .home-suggestion-state {
    padding: 16px 18px;
  }

  .home-suggestion-item + .home-suggestion-item,
  .home-suggestion-state + .home-suggestion-item,
  .home-suggestion-item + .home-suggestion-state {
    border-top: 1px solid rgba(217, 242, 235, 0.75);
  }

  .home-suggestion-title {
    display: block;
    font-size: 24px;
    font-weight: 700;
    color: #5d433a;
    margin-bottom: 6px;
  }

  .home-suggestion-sub,
  .home-suggestion-state {
    display: block;
    font-size: 20px;
    line-height: 1.55;
    color: #9e9084;
  }

  .home-suggestion-state--muted {
    color: #b0b8b3;
  }

  .home-suggestion-item {
    -webkit-tap-highlight-color: transparent;
  }

  .home-suggestion-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 14px 18px;
    border-bottom: 1px solid rgba(217, 242, 235, 0.75);
  }

  .home-suggestion-bar-title {
    flex: 1;
    min-width: 0;
    font-size: 22px;
    font-weight: 700;
    color: #5d433a;
    word-break: break-word;
  }

  .home-suggestion-bar-clear {
    flex-shrink: 0;
    font-size: 21px;
    font-weight: 600;
    color: #ef9172;
    padding: 4px 6px;
    -webkit-tap-highlight-color: transparent;
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

  .hero-swiper-wrap {
    width: 100%;
    margin-bottom: 26px;
    overflow: visible;
  }

  .hero-swiper {
    width: 100%;
    height: 440px;
    overflow: visible;
  }

  .hero-swiper-item {
    height: 100%;
    padding: 0 6px;
    box-sizing: border-box;
  }

  .hero-swiper-item .hero-card {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    border-radius: 24px;
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
    background: linear-gradient(
      180deg,
      rgba(28, 24, 22, 0.55) 0%,
      rgba(28, 24, 22, 0.22) 32%,
      rgba(93, 70, 58, 0.62) 100%
    );
    color: #fffaf8;
  }

  .hero-top {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .hero-tag {
    padding: 10px 18px;
    border-radius: 999px;
    font-size: 22px;
    font-weight: 700;
    color: #fffdf9;
    background: rgba(22, 20, 18, 0.62);
    border: 1px solid rgba(255, 255, 255, 0.38);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(8px);
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.45);
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

  .card-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 16px;
  }

  .recommend-actions {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: stretch;
    gap: 8px;
    width: 100%;
    margin-top: 12px;
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

  .recommend-actions .inline-action {
    flex: 1;
    min-width: 0;
    padding: 9px 6px;
    font-size: 21px;
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
    font-size: 28px;
    font-weight: 700;
    margin-bottom: 8px;
    color: #5d433a;
  }

  .recommend-summary {
    display: block;
    font-size: 23px;
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
    font-size: 21px;
    color: #9aaaa3;
  }

  .recommend-price {
    flex-shrink: 0;
    font-size: 27px;
    font-weight: 700;
    color: #ef9172;
  }

  .celebration-overlay {
    position: fixed;
    inset: 0;
    z-index: 999;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
  }

  .celebration-fireworks {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .firework-spark {
    position: absolute;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    opacity: 0;
    box-shadow: 0 0 14px currentColor;
    animation-name: firework-burst;
    animation-timing-function: ease-out;
    animation-fill-mode: both;
  }

  .celebration-text-wrap {
    animation: celebration-pop 2.2s ease forwards;
  }

  .celebration-text {
    font-size: 44px;
    font-weight: 800;
    letter-spacing: 1px;
    font-family: 'Comic Sans MS', 'YouYuan', 'PingFang SC', 'Segoe UI', sans-serif;
    color: #ffffff;
    text-shadow: 0 2px 0 #cf6e58, 0 0 10px rgba(207, 110, 88, 0.45), 0 10px 22px rgba(57, 34, 24, 0.42);
  }

  .celebration-line {
    display: block;
    text-align: center;
    line-height: 1.25;
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

  @keyframes celebration-pop {
    0% { opacity: 0; transform: translateY(18px) scale(0.84); }
    22% { opacity: 1; transform: translateY(0) scale(1.06); }
    78% { opacity: 1; transform: translateY(0) scale(1); }
    100% { opacity: 0; transform: translateY(-8px) scale(0.96); }
  }

  @keyframes firework-burst {
    0% { opacity: 0; transform: translate(0, 0) scale(0.2); }
    22% { opacity: 1; transform: translate(calc(var(--dx) * 0.45), calc(var(--dy) * 0.45)) scale(1.25); }
    60% { opacity: 0.95; transform: translate(var(--dx), var(--dy)) scale(1.35); }
    100% { opacity: 0; transform: translate(calc(var(--dx) * 1.1), calc(var(--dy) * 1.1)) scale(0.85); }
  }
}
</style>
