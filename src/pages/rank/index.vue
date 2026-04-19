<template>
  <view class="mobile-shell rank-page">
    <view class="scope-bar">
      <view
        v-for="option in scopeOptions"
        :key="option.key"
        class="scope-item"
        :class="[option.key, { active: activeScope === option.key }]"
        @click="switchScope(option.key)"
      >
        <view
          v-if="activeScope === option.key"
          class="scope-bubbles"
          :class="option.key === 'global' ? 'scope-bubbles--mint' : 'scope-bubbles--pink'"
          aria-hidden="true"
        >
          <text
            v-for="b in scopeBubbleDots"
            :key="b.id"
            class="scope-bubble-dot"
            :style="{
              width: `${b.size}px`,
              height: `${b.size}px`,
              left: b.left,
              bottom: b.bottom,
              animationDelay: b.delay,
              animationDuration: b.duration,
            }"
          />
        </view>
        <view class="scope-label-stack">
          <text class="scope-text">{{ option.label }}</text>
          <view v-if="activeScope === 'global' && option.key === 'global'" class="scope-active-line" />
          <view v-if="activeScope === 'mine' && option.key === 'mine'" class="scope-active-line scope-active-line--mine" />
        </view>
      </view>
    </view>

    <view class="rank-hero">
      <view class="period-oval">
        <view
          v-for="tab in tabs"
          :key="tab.apiKey"
          class="period-pill"
          :class="{ active: activeTab === tab.apiKey }"
          @click="switchTab(tab.apiKey)"
        >
          {{ tab.label }}
        </view>
      </view>
    </view>

    <view class="rank-panel">
      <view class="table-head">
        <text class="th th-rank">排名</text>
        <text class="th th-food">美食</text>
        <text class="th th-num">点赞</text>
        <text class="th th-num">得分</text>
        <view class="th th-arrow" />
      </view>

      <view v-if="loading" class="panel-state">加载中...</view>
      <view v-else-if="errorMessage" class="panel-state panel-state-error">{{ errorMessage }}</view>
      <view v-else-if="rankings.length === 0" class="panel-state">暂无榜单数据</view>
      <view v-else class="table-body">
        <view
          v-for="(item, index) in rankings"
          :key="`${item.food_id}-${activeTab}-${activeScope}`"
          class="table-row"
          :class="[rankCellClass(index)]"
          @click="openFood(item)"
        >
          <view class="td td-rank">
            <text v-if="index < 3" class="td-rank-top">{{ index + 1 }}</text>
            <text v-else class="td-rank-normal">{{ index + 1 }}</text>
          </view>
          <view class="td td-food">
            <text class="row-name">{{ item.name }}</text>
          </view>
          <text class="td td-num">{{ item.like_count }}</text>
          <text class="td td-num">{{ item.score }}</text>
          <view class="td td-arrow">
            <text class="chevron">›</text>
          </view>
        </view>
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

const tabs = [
  { apiKey: 'daily' as const, label: 'Daily' },
  { apiKey: 'weekly' as const, label: 'Weekly' },
  { apiKey: 'all' as const, label: 'Monthly' },
]

const scopeOptions = [
  { key: 'global' as const, label: '全部用户' },
  { key: 'mine' as const, label: '只看自己' },
]

const scopeBubbleDots = [
  { id: 'sb1', size: 7, left: '5%', bottom: '4px', delay: '0.1s', duration: '2.9s' },
  { id: 'sb2', size: 10, left: '16%', bottom: '0px', delay: '0.5s', duration: '3.3s' },
  { id: 'sb3', size: 6, left: '28%', bottom: '5px', delay: '1s', duration: '2.7s' },
  { id: 'sb4', size: 9, left: '40%', bottom: '1px', delay: '1.4s', duration: '3.4s' },
  { id: 'sb5', size: 5, left: '52%', bottom: '6px', delay: '0.8s', duration: '2.8s' },
  { id: 'sb6', size: 8, left: '64%', bottom: '2px', delay: '1.9s', duration: '3.1s' },
  { id: 'sb7', size: 6, left: '76%', bottom: '4px', delay: '0.3s', duration: '2.6s' },
  { id: 'sb8', size: 9, left: '88%', bottom: '1px', delay: '1.2s', duration: '3.5s' },
]

const activeTab = ref<'daily' | 'weekly' | 'all'>('daily')
const activeScope = ref<'global' | 'mine'>('global')
const rankings = ref<FoodRankingItem[]>([])
const loading = ref(false)
const errorMessage = ref('')

const rankCellClass = (index: number) => {
  if (index === 0) {
    return 'rank-cell-gold'
  }
  if (index === 1) {
    return 'rank-cell-blue'
  }
  if (index === 2) {
    return 'rank-cell-red'
  }
  return 'rank-cell-plain'
}

const sortRankingsByLikes = (items: FoodRankingItem[]) => {
  return [...items].sort((a, b) => {
    if (b.like_count !== a.like_count) {
      return b.like_count - a.like_count
    }

    if (b.score !== a.score) {
      return b.score - a.score
    }

    return a.food_id - b.food_id
  })
}

const loadData = async () => {
  if (!hasAccessToken()) {
    errorMessage.value = '请先登录后再查看榜单。'
    rankings.value = []
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    const items = await getFoodRankings(activeTab.value, activeScope.value)
    rankings.value = sortRankingsByLikes(items)
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
  padding: 48px 0 0;
  display: flex;
  flex-direction: column;
  background:
    radial-gradient(circle at 78% 4%, rgba(255, 210, 195, 0.75), transparent 22%),
    radial-gradient(circle at 12% 18%, rgba(186, 236, 220, 0.55), transparent 28%),
    radial-gradient(circle at 50% 0%, rgba(255, 241, 233, 0.9), transparent 32%),
    linear-gradient(180deg, #dff5ec 0%, #e8faf4 18%, #f6fffb 42%, #fffaf6 72%, #fff2ea 100%);
}

.scope-bar {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 14px 100px 22px;
  box-sizing: border-box;
}

.scope-item {
  position: relative;
  padding: 6px 6px 18px;
  min-width: 168px;
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.scope-item.global {
  align-items: flex-start;
}

.scope-item.mine {
  align-items: flex-end;
}

.scope-label-stack {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.scope-item.mine .scope-label-stack {
  align-items: center;
}

.scope-active-line {
  position: absolute;
  top: 100%;
  left: 50%;
  width: 52px;
  height: 6px;
  margin-top: 8px;
  border-radius: 3px;
  background: #1f7a52;
  transform: translateX(-50%);
  pointer-events: none;
}

.scope-active-line--mine {
  background: #c23a72;
}

.scope-item.active.global .scope-text {
  color: #1f7a52;
  font-weight: 800;
}

.scope-item.active.mine .scope-text {
  color: #c23a72;
  font-weight: 800;
}

.scope-item:not(.active) .scope-text {
  color: #1a1a1a;
  font-weight: 600;
}

.scope-text {
  position: relative;
  font-size: 32px;
  line-height: 1.2;
  transition: color 0.2s ease, font-weight 0.2s ease;
}

.scope-bubbles {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 2px;
  height: 42px;
  pointer-events: none;
  overflow: visible;
  z-index: 1;
}

.scope-bubble-dot {
  position: absolute;
  border-radius: 50%;
  box-sizing: border-box;
  opacity: 0;
  animation-name: scope-bubble-rise;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
  animation-fill-mode: both;
}

.scope-bubbles--mint .scope-bubble-dot {
  background: radial-gradient(
    circle at 30% 30%,
    rgba(255, 255, 255, 0.98),
    rgba(130, 215, 180, 0.34) 72%
  );
  border: 1px solid rgba(255, 255, 255, 0.92);
  box-shadow:
    0 0 0 1px rgba(95, 175, 145, 0.28),
    0 4px 12px rgba(60, 120, 95, 0.16);
}

.scope-bubbles--pink .scope-bubble-dot {
  background: radial-gradient(
    circle at 30% 30%,
    rgba(255, 255, 255, 0.98),
    rgba(255, 195, 210, 0.4) 72%
  );
  border: 1px solid rgba(255, 255, 255, 0.9);
  box-shadow:
    0 0 0 1px rgba(235, 155, 175, 0.32),
    0 4px 12px rgba(200, 110, 135, 0.14);
}

.rank-hero {
  padding: 10px 20px 20px;
  box-sizing: border-box;
}

.period-oval {
  display: flex;
  align-items: stretch;
  gap: 0;
  width: 100%;
  max-width: 500px;
  margin: 0 auto 20px;
  padding: 5px 6px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(255, 255, 255, 0.95);
  box-shadow: none;
  box-sizing: border-box;
}

.period-pill {
  flex: 1;
  min-width: 0;
  min-height: 52px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 25px;
  font-weight: 600;
  line-height: 1.35;
  letter-spacing: 0.2px;
  color: #3d4540;
  background: transparent;
  border: none;
  box-shadow: none;
  transition: background 0.2s ease, color 0.2s ease, font-weight 0.2s ease;
}

.period-pill.active {
  background: #e8a598;
  color: #ffffff;
  font-weight: 700;
  box-shadow: none;
}

.rank-panel {
    position: relative;
    z-index: 1;
    padding: 16px;
    border-radius: 24px;
    background: rgba(255, 255, 255, 0.28);
    border: 1px solid rgba(255, 255, 255, 0.58);
    box-shadow: 0 8px 16px rgba(202, 221, 214, 0.08);
    overflow: visible;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.table-head {
  display: flex;
  align-items: center;
  padding: 10px 14px 14px;
  gap: 0;
  margin: 0 -4px 8px;
  background: transparent;
  border: none;
  border-radius: 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.42);
  box-shadow: none;
  backdrop-filter: none;
}

.th {
  font-size: 30px;
  font-weight: 400;
  color: rgba(100, 118, 108, 0.78);
  letter-spacing: 0.02em;
}

.th-rank {
  width: 80px;
  flex-shrink: 0;
  text-align: center;
}

.th-food {
  flex: 1;
  min-width: 0;
  padding-left: 28px;
  padding-right: 8px;
  text-align: left;
}

.th-num {
  width: 96px;
  flex-shrink: 0;
  text-align: center;
}

.th-arrow {
  width: 40px;
  flex-shrink: 0;
}

.panel-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
  font-size: 24px;
  color: #9e9084;
}

.panel-state-error {
  color: #c45c4a;
}

.table-body {
  flex: 1;
  padding-bottom: 8px;
}

.table-row {
  display: flex;
  align-items: center;
  padding: 16px 14px;
  box-sizing: border-box;
  margin-bottom: 12px;
  border: 1px solid rgba(255, 255, 255, 0.58);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.28);
  box-shadow: 0 8px 16px rgba(202, 221, 214, 0.08);
  flex-shrink: 0;
  min-height: 88px;
  overflow: hidden;
}

.table-row.rank-cell-gold {
  background:
    linear-gradient(90deg, rgba(249, 225, 136, 0.42) 0%, rgba(248, 223, 126, 0.32) 12%, rgba(247, 219, 118, 0.22) 28%, rgba(247, 219, 118, 0.12) 52%, rgba(247, 219, 118, 0.05) 76%, rgba(247, 219, 118, 0.015) 100%),
    rgba(255, 255, 255, 0.28);
}

.table-row.rank-cell-blue {
  background:
    linear-gradient(90deg, rgba(170, 213, 245, 0.42) 0%, rgba(151, 203, 241, 0.32) 12%, rgba(131, 190, 236, 0.22) 28%, rgba(131, 190, 236, 0.12) 52%, rgba(131, 190, 236, 0.05) 76%, rgba(131, 190, 236, 0.015) 100%),
    rgba(255, 255, 255, 0.28);
}

.table-row.rank-cell-red {
  background:
    linear-gradient(90deg, rgba(249, 187, 181, 0.4) 0%, rgba(246, 173, 166, 0.3) 12%, rgba(242, 153, 145, 0.2) 28%, rgba(242, 153, 145, 0.11) 52%, rgba(242, 153, 145, 0.045) 76%, rgba(242, 153, 145, 0.015) 100%),
    rgba(255, 255, 255, 0.28);
}

.table-row.rank-cell-plain {
  background: rgba(255, 255, 255, 0.28);
}

.td-rank {
  width: 104px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  align-self: stretch;
  margin: -16px 0 -16px -14px;
  padding: 0 12px;
  background: transparent;
  border-radius: 0;
}

.td-rank-top {
  font-size: 28px;
  font-weight: 700;
  font-style: italic;
  line-height: 1;
  color: #8d6a1f;
  text-shadow: none;
}

.table-row.rank-cell-blue .td-rank-top {
  color: #4d79a8;
}

.table-row.rank-cell-red .td-rank-top {
  color: #b56a62;
}

.td-rank-normal {
  font-size: 24px;
  font-weight: 600;
  font-style: normal;
  line-height: 1;
  color: #8d6a1f;
  text-align: center;
}

.td-food {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  padding-left: 28px;
  padding-right: 8px;
  box-sizing: border-box;
}

.row-name {
  font-size: 26px;
  font-weight: 700;
  color: #5d433a;
  line-height: 1.35;
  word-break: break-word;
}

.td-num {
  width: 96px;
  flex-shrink: 0;
  text-align: center;
  font-size: 24px;
  font-weight: 700;
  color: #5d433a;
}

.td-arrow {
  width: 40px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chevron {
  font-size: 46px;
  font-weight: 300;
  color: #c5d4cc;
  line-height: 1;
}

@keyframes scope-bubble-rise {
  0% { opacity: 0; transform: translate3d(0, 8px, 0) scale(0.74); }
  20% { opacity: 0.74; }
  60% { opacity: 0.92; transform: translate3d(8px, -18px, 0) scale(1.06); }
  100% { opacity: 0; transform: translate3d(-6px, -36px, 0) scale(1.14); }
}
</style>
