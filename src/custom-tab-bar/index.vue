<template>
  <view class="custom-tabbar-shell">
    <view class="custom-tabbar">
      <view
        class="nav-item"
        :class="{ active: isActive('pages/index/index') }"
        @tap="switchTo('pages/index/index')"
      >
        <text class="nav-label">首页</text>
      </view>
      <view
        class="nav-item"
        :class="{ active: isActive('pages/record/index') }"
        @tap="switchTo('pages/record/index')"
      >
        <text class="nav-label">记录</text>
      </view>
      <view class="plus-slot" @tap="switchTo('pages/publish/index')">
        <view class="plus-button" :class="{ active: isActive('pages/publish/index') }">+</view>
      </view>
      <view
        class="nav-item"
        :class="{ active: isActive('pages/rank/index') }"
        @tap="switchTo('pages/rank/index')"
      >
        <text class="nav-label">榜单</text>
      </view>
      <view
        class="nav-item"
        :class="{ active: isActive('pages/profile/index') }"
        @tap="switchTo('pages/profile/index')"
      >
        <text class="nav-label">我的</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Taro, { useDidShow } from '@tarojs/taro'

declare const getCurrentPages: () => Array<{ route?: string }>

const currentPath = ref('')

const syncCurrentPath = () => {
  const pages = getCurrentPages?.() ?? []
  const route = pages[pages.length - 1]?.route ?? ''
  currentPath.value = route
}

const isActive = (pagePath: string) => {
  return currentPath.value === pagePath || currentPath.value === `/${pagePath}`
}

const switchTo = (pagePath: string) => {
  if (isActive(pagePath)) {
    return
  }

  Taro.switchTab({ url: `/${pagePath}` })
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
}

.nav-item.active .nav-label {
  font-size: 33px;
  color: #122033;
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
}

.plus-button.active {
  transform: scale(1.05);
  filter: brightness(1.1);
}
</style>
