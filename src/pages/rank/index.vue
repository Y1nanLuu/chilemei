<template>
  <view class="mobile-shell rank-page">
    <view class="screen-frame">
      <view class="section-title">
        <text class="title">热度榜单</text>
        <text class="caption">日榜 / 周榜 / 总榜</text>
      </view>

      <view class="tabs glass-card">
        <view
          v-for="tab in tabs"
          :key="tab.key"
          class="tab-item"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </view>
      </view>

      <view class="board-list">
        <view v-for="(item, index) in currentBoard" :key="item.name" class="board-card glass-card" @click="openTopDish(index)">
          <view class="board-rank" :class="`rank-${index + 1}`">{{ index + 1 }}</view>
          <view class="board-content">
            <view class="board-head">
              <text class="board-name">{{ item.name }}</text>
              <text class="board-price">￥{{ item.price }}</text>
            </view>
            <text class="board-restaurant">{{ item.restaurant }}</text>
            <view class="board-meta">
              <text class="board-heat">热度 {{ item.heat }}</text>
              <text class="board-action">查看详情</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import Taro from '@tarojs/taro'
import { featuredDishes, rankBoards } from '../../data/mock'

const tabs = [
  { key: 'daily', label: '日榜' },
  { key: 'weekly', label: '周榜' },
  { key: 'total', label: '总榜' },
] as const

const activeTab = ref<'daily' | 'weekly' | 'total'>('daily')

const currentBoard = computed(() => rankBoards[activeTab.value])

const openTopDish = (index: number) => {
  const target = featuredDishes[index] ?? featuredDishes[0]
  Taro.navigateTo({
    url: `/pages/check/index?id=${target.id}`,
  })
}
</script>

<style lang="scss">
.rank-page {
  .tabs {
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

  .tab-item.active {
    background: linear-gradient(135deg, var(--brand-500) 0%, var(--peach-500) 100%);
    color: #fffaf4;
    box-shadow: 0 8px 16px rgba(220, 154, 95, 0.1);
  }

  .board-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .board-card {
    display: flex;
    gap: 18px;
    align-items: center;
    padding: 18px;
  }

  .board-rank {
    width: 56px;
    height: 56px;
    border-radius: 18px;
    background: #fff1dc;
    color: var(--brand-600);
    font-size: 26px;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .rank-1 {
    background: linear-gradient(135deg, #ffd985 0%, #f0b65d 100%);
    color: #6f4a00;
  }

  .rank-2 {
    background: linear-gradient(135deg, #dbe4f1 0%, #b9c7da 100%);
    color: #41526e;
  }

  .rank-3 {
    background: linear-gradient(135deg, #f7c1a3 0%, #df916a 100%);
    color: #6f3d0b;
  }

  .board-content {
    flex: 1;
    min-width: 0;
  }

  .board-head,
  .board-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .board-name {
    font-size: 26px;
    font-weight: 700;
    word-break: break-word;
  }

  .board-price {
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
