<template>
  <view class="custom-tabbar-shell">
    <view class="custom-tabbar">
      <view
        v-for="item in leftItems"
        :key="item.pagePath"
        class="nav-item"
        :class="{ active: currentPath === item.pagePath }"
        @click="switchTo(item.pagePath)"
      >
        <text class="nav-label">{{ item.text }}</text>
      </view>

      <view class="plus-slot" @click="switchTo(centerItem.pagePath)">
        <view class="plus-button" :class="{ active: currentPath === centerItem.pagePath }">+</view>
      </view>

      <view
        v-for="item in rightItems"
        :key="item.pagePath"
        class="nav-item"
        :class="{ active: currentPath === item.pagePath }"
        @click="switchTo(item.pagePath)"
      >
        <text class="nav-label">{{ item.text }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Taro, { useDidShow } from '@tarojs/taro'

type TabItem = {
  pagePath: string
  text: string
}

declare const getCurrentPages: () => Array<{ route?: string }>

const tabs: TabItem[] = [
  { pagePath: 'pages/index/index', text: '首页' },
  { pagePath: 'pages/record/index', text: '记录' },
  { pagePath: 'pages/publish/index', text: '+' },
  { pagePath: 'pages/rank/index', text: '榜单' },
  { pagePath: 'pages/profile/index', text: '我的' },
]

const leftItems = tabs.slice(0, 2)
const centerItem = tabs[2]
const rightItems = tabs.slice(3)

const currentPath = ref('')

const syncCurrentPath = () => {
  const pages = getCurrentPages?.() ?? []
  const route = pages[pages.length - 1]?.route ?? ''
  currentPath.value = route ? `/${route}` : ''
}

const switchTo = (pagePath: string) => {
  const target = `/${pagePath}`
  if (currentPath.value === target) {
    return
  }

  Taro.switchTab({ url: target })
}

onMounted(syncCurrentPath)
useDidShow(syncCurrentPath)
</script>

<style lang="scss">
.custom-tabbar-shell {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  padding-bottom: env(safe-area-inset-bottom);
  background: rgba(249, 251, 255, 0.98);
  border-top: 1px solid rgba(220, 231, 255, 0.95);
}

.custom-tabbar {
  height: 108px;
  width: 100%;
  background: rgba(249, 251, 255, 0.98);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
  box-sizing: border-box;
}

.nav-item {
  flex: 1 1 0;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
}

.nav-label {
  font-size: 24px;
  font-weight: 600;
  color: #7f8ba8;
  white-space: nowrap;
}

.nav-item.active .nav-label {
  color: #2f6bff;
  font-weight: 700;
}

.plus-slot {
  flex: 0 0 92px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 92px;
}

.plus-button {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2f6bff 0%, #67b4ff 100%);
  border: 6px solid #f9fbff;
  box-shadow: 0 12px 22px rgba(47, 107, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 40px;
  font-weight: 500;
  line-height: 1;
  flex-shrink: 0;
}

.plus-button.active {
  transform: scale(1.03);
}
</style>
