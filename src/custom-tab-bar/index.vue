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
  { pagePath: 'pages/index/index', text: '棣栭〉' },
  { pagePath: 'pages/record/index', text: '璁板綍' },
  { pagePath: 'pages/publish/index', text: '+' },
  { pagePath: 'pages/rank/index', text: '姒滃崟' },
  { pagePath: 'pages/profile/index', text: '鎴戠殑' },
]

const leftItems = tabs.slice(0, 2)
const centerItem = tabs[2]
const rightItems = tabs.slice(3)

const currentPath = ref('')

const syncCurrentPath = () => {
  const pages = getCurrentPages?.() ?? []
  const route = pages[pages.length - 1]?.route ?? ''
  currentPath.value = route
}

const switchTo = (pagePath: string) => {
  const target = `/${pagePath}`
  if (currentPath.value === target || currentPath.value === pagePath) {
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
  background: rgba(255, 255, 255, 0.98);
  border-top: 1px solid rgba(237, 222, 205, 0.95);
}

.custom-tabbar {
  height: 115px;
  width: 100%;
  background: rgba(255, 255, 255, 0.98);
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
  font-size: 30px;
  font-weight: 450;
  color: #b8a99c;
  white-space: nowrap;
  transition: all 0.2s;
}

.nav-item.active .nav-label {
  font-size: 33px;
  color: var(--ink-900);
  font-weight: 450;
}

.plus-slot {
  flex: 0 0 130px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 92px;
}

.plus-button {
  width: 110px;
  height: 80px;
  border-radius: 999px;
  background: linear-gradient(135deg, #f4b19d 0%, #ee9278 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 50px;
  font-weight: 500;
  line-height: 1;
  transition: all 0.2s;
}

.plus-button.active {
  transform: scale(1.05);
  filter: brightness(1.1);
}
</style>
