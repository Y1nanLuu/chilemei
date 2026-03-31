<template>
  <view class="mobile-shell record-page">
    <view class="screen-frame">
      <view class="section-title">
        <text class="title">我的记录</text>
        <text class="caption">接口：GET /foods?mine_only=true</text>
      </view>

      <view class="summary glass-card">
        <view class="summary-pill">本周记录 {{ records.length }} 餐</view>
        <text class="summary-title">{{ summaryTitle }}</text>
        <text class="summary-copy">时间轴保留每次用餐的照片、情绪和热量，让回看更有画面感。</text>
      </view>

      <view v-if="loading" class="summary glass-card">加载中...</view>
      <view v-else-if="errorMessage" class="summary glass-card">{{ errorMessage }}</view>
      <view v-else-if="records.length === 0" class="summary glass-card">还没有个人记录</view>

      <view v-else class="timeline">
        <view v-for="(item, index) in timelineRecords" :key="item.id" class="timeline-item" @click="openDetail(item.id)">
          <view class="timeline-rail">
            <view class="timeline-dot"></view>
            <view v-if="index !== timelineRecords.length - 1" class="timeline-line"></view>
          </view>
          <view class="timeline-card glass-card">
            <view class="timeline-head">
              <view>
                <text class="timeline-day">{{ item.day }}</text>
                <text class="timeline-meal">{{ item.time }}</text>
              </view>
              <text class="timeline-mood">{{ item.sentiment }}</text>
            </view>
            <image class="timeline-image" :src="item.image" mode="aspectFill" />
            <text class="timeline-title">{{ item.title }}</text>
            <text class="timeline-note">{{ item.note }}</text>
            <text class="timeline-calories">{{ item.meta }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import Taro, { useDidShow } from '@tarojs/taro'
import { computed, ref } from 'vue'
import { getFoodRecords } from '../../api/foods'
import type { FoodRecord } from '../../api/types'
import { hasAccessToken } from '../../utils/auth'
import { getMediaUrl } from '../../utils/request'

const PLACEHOLDER_IMAGE = 'https://dummyimage.com/640x420/eaf1ff/7a90c2&text=Chilemei'

const records = ref<FoodRecord[]>([])
const loading = ref(false)
const errorMessage = ref('')

const summaryTitle = computed(() => {
  const likeCount = records.value.filter((item) => item.sentiment === 'like').length
  return likeCount ? `你一共标记了 ${likeCount} 条“喜欢”的记录。` : '先去发布一条新记录吧。'
})

const timelineRecords = computed(() => {
  return [...records.value]
    .sort((a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime())
    .map((item) => ({
      id: item.id,
      day: formatDate(item.uploaded_at),
      time: formatTime(item.uploaded_at),
      title: item.food.name,
      note: item.review_text || '这条记录没有补充评价。',
      image: getMediaUrl(item.image_url || item.food.image_url) || PLACEHOLDER_IMAGE,
      sentiment: item.sentiment === 'dislike' ? '劝退' : '喜欢',
      meta: `${item.food.location} | RMB ${item.food.price}`,
    }))
})

const formatDate = (value: string) => value.replace('T', ' ').slice(0, 10)
const formatTime = (value: string) => value.replace('T', ' ').slice(11, 16)

const loadData = async () => {
  if (!hasAccessToken()) {
    errorMessage.value = '请先登录后再查看个人记录。'
    records.value = []
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    records.value = await getFoodRecords({ mine_only: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : '个人记录加载失败'
    errorMessage.value = message
    Taro.showToast({ title: message, icon: 'none' })
  } finally {
    loading.value = false
  }
}

const openDetail = (id: number) => {
  Taro.navigateTo({
    url: `/pages/check/index?id=${id}`,
  })
}

useDidShow(() => {
  void loadData()
})
</script>

<style lang="scss">
.record-page {
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  min-height: 100vh;

  .summary {
    padding: 24px;
    margin-bottom: 24px;
  }

  .summary-pill {
    display: inline-flex;
    padding: 8px 14px;
    border-radius: 999px;
    background: #fff0d8;
    color: var(--peach-600);
    font-size: 20px;
    margin-bottom: 14px;
  }

  .summary-title {
    display: block;
    font-size: 32px;
    font-weight: 700;
    line-height: 1.4;
    margin-bottom: 10px;
  }

  .summary-copy {
    display: block;
    font-size: 22px;
    line-height: 1.7;
    color: var(--ink-500);
  }

  .timeline-item {
    display: flex;
    gap: 16px;
  }

  .timeline-rail {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 22px;
  }

  .timeline-dot {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--brand-500) 0%, var(--peach-500) 100%);
    box-shadow: 0 0 0 5px rgba(241, 197, 109, 0.12);
  }

  .timeline-line {
    width: 2px;
    flex: 1;
    margin-top: 10px;
    background: linear-gradient(180deg, rgba(220, 154, 95, 0.45) 0%, rgba(220, 154, 95, 0.06) 100%);
  }

  .timeline-card {
    flex: 1;
    padding: 22px;
    margin-bottom: 22px;
  }

  .timeline-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .timeline-day {
    display: block;
    font-size: 28px;
    font-weight: 700;
    margin-bottom: 4px;
  }

  .timeline-meal,
  .timeline-calories {
    display: block;
    font-size: 20px;
    color: var(--ink-500);
  }

  .timeline-mood {
    padding: 8px 14px;
    border-radius: 999px;
    background: #fff0d8;
    color: var(--brand-600);
    font-size: 20px;
  }

  .timeline-image {
    width: 100%;
    height: 220px;
    border-radius: 20px;
    margin-bottom: 16px;
  }

  .timeline-title {
    display: block;
    font-size: 28px;
    font-weight: 700;
    margin-bottom: 10px;
  }

  .timeline-note {
    display: block;
    font-size: 22px;
    line-height: 1.7;
    color: var(--ink-700);
    margin-bottom: 12px;
  }
}
</style>
