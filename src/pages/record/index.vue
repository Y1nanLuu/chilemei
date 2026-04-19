<template>
  <view class="mobile-shell record-page">
    <view class="screen-frame">
      <view v-if="!loading && !errorMessage && records.length > 0" class="record-toolbar">
        <view class="record-toolbar-left">
          <picker mode="date" :value="pickerBindValue" @change="onDatePickChange">
            <view class="filter-chip date-chip" :class="{ 'is-selected': !!selectedDate }">
              {{ dateFilterLabel }}
            </view>
          </picker>
          <view
            v-if="selectedDate"
            class="filter-chip date-clear-chip"
            @click.stop="clearDateFilter"
          >
            全部日期
          </view>
        </view>
        <view class="record-toolbar-right">
          <view
            v-for="opt in sentimentFilterOptions"
            :key="opt.value"
            class="filter-chip"
            :class="{ 'is-selected': sentimentFilter === opt.value }"
            @click="setSentimentFilter(opt.value)"
          >
            {{ opt.label }}
          </view>
        </view>
      </view>

      <view v-if="loading" class="status-card glass-card">正在整理你的用餐时间轴...</view>
      <view v-else-if="errorMessage" class="status-card glass-card">{{ errorMessage }}</view>
      <view v-else-if="records.length === 0" class="status-card glass-card">
        还没有个人记录，先去发布一条新记录吧。
      </view>

      <view v-else-if="records.length > 0 && timelineRecords.length === 0" class="status-card glass-card">
        当前筛选下没有记录，可更换日期或切回「全部日期」「全部」查看。
      </view>

      <view v-else class="timeline">
        <view
          v-for="item in timelineRecords"
          :key="item.id"
          class="timeline-item"
          @click="openDetail(item.id)"
        >
          <view class="timeline-rail">
            <view class="timeline-dot"></view>
            <view class="timeline-line"></view>
          </view>

          <view class="timeline-card glass-card">
            <view class="timeline-head">
              <view>
                <text class="timeline-day">{{ item.day }}</text>
                <text class="timeline-time">{{ item.time }}</text>
              </view>
              <text class="timeline-mood" :class="item.sentimentClass">{{ item.sentiment }}</text>
            </view>

            <image class="timeline-image" :src="item.image" mode="aspectFill" />

            <view class="timeline-body">
              <text class="timeline-title">{{ item.title }}</text>
              <text class="timeline-note">{{ item.note }}</text>
              <view class="timeline-foot">
                <text class="timeline-meta">{{ item.meta }}</text>
                <text class="timeline-link">查看详情</text>
              </view>
            </view>
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

type SentimentFilter = 'all' | 'like' | 'dislike'

const sentimentFilterOptions: { value: SentimentFilter; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'like', label: '喜欢' },
  { value: 'dislike', label: '劝退' },
]

const records = ref<FoodRecord[]>([])
const loading = ref(false)
const errorMessage = ref('')
const sentimentFilter = ref<SentimentFilter>('all')
/** 为 null 表示不按日期筛选；有值时为 YYYY-MM-DD */
const selectedDate = ref<string | null>(null)

const setSentimentFilter = (value: SentimentFilter) => {
  sentimentFilter.value = value
}

const ymdToday = () => {
  const d = new Date()
  const y = d.getFullYear()
  const m = `${d.getMonth() + 1}`.padStart(2, '0')
  const day = `${d.getDate()}`.padStart(2, '0')
  return `${y}-${m}-${day}`
}

const dateFilterLabel = computed(() => selectedDate.value ?? '按日期查看')

const pickerBindValue = computed(() => selectedDate.value ?? ymdToday())

const onDatePickChange = (event: { detail: { value: string } }) => {
  selectedDate.value = event.detail.value
}

const clearDateFilter = () => {
  selectedDate.value = null
}

const timelineRecords = computed(() => {
  let list = [...records.value]
  if (sentimentFilter.value === 'like') {
    list = list.filter((item) => item.sentiment === 'like')
  } else if (sentimentFilter.value === 'dislike') {
    list = list.filter((item) => item.sentiment === 'dislike')
  }

  if (selectedDate.value) {
    list = list.filter((item) => formatDate(item.uploaded_at) === selectedDate.value)
  }

  return list
    .sort((a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime())
    .map((item) => ({
      id: item.id,
      day: formatDate(item.uploaded_at),
      time: formatTime(item.uploaded_at),
      title: item.food.name,
      note: item.review_text || '\u8fd9\u6761\u8bb0\u5f55\u6ca1\u6709\u8865\u5145\u8bc4\u4ef7\u3002',
      image: getMediaUrl(item.image_url || item.food.image_url) || PLACEHOLDER_IMAGE,
      sentiment: item.sentiment === 'dislike' ? '\u529d\u9000' : '\u559c\u6b22',
      sentimentClass: item.sentiment === 'dislike' ? 'is-dislike' : 'is-like',
      meta: `${item.food.location} | RMB ${item.food.price}`,
    }))
})

const formatDate = (value: string) => value.replace('T', ' ').slice(0, 10)
const formatTime = (value: string) => value.replace('T', ' ').slice(11, 16)

const loadData = async () => {
  if (!hasAccessToken()) {
    errorMessage.value = '\u8bf7\u5148\u767b\u5f55\u540e\u518d\u67e5\u770b\u4e2a\u4eba\u8bb0\u5f55\u3002'
    records.value = []
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    records.value = await getFoodRecords({ mine_only: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : '\u4e2a\u4eba\u8bb0\u5f55\u52a0\u8f7d\u5931\u8d25'
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
  sentimentFilter.value = 'all'
  selectedDate.value = null
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
  /* 固定一层底色，避免列表高度随筛选变化时渐变露底看起来「一块一个色」 */
  background-color: #f0faf5;
  background-image:
    radial-gradient(circle at 78% 4%, rgba(255, 210, 195, 0.75), transparent 22%),
    radial-gradient(circle at 12% 18%, rgba(186, 236, 220, 0.55), transparent 28%),
    radial-gradient(circle at 50% 0%, rgba(255, 241, 233, 0.9), transparent 32%),
    linear-gradient(180deg, #dff5ec 0%, #e8faf4 18%, #f6fffb 42%, #fffaf6 72%, #fff2ea 100%);

  .screen-frame,
  .glass-card,
  .timeline-item,
  .timeline-card,
  .timeline-body,
  .timeline-foot {
    box-sizing: border-box;
    min-width: 0;
    max-width: 100%;
  }

  .screen-frame {
    position: relative;
    padding: 0 2px 20px;
  }

  .record-toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px 12px;
    margin-bottom: 16px;
    padding: 4px 2px 0;
  }

  .record-toolbar-left,
  .record-toolbar-right {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }

  .record-toolbar-right {
    margin-left: auto;
    justify-content: flex-end;
  }

  .record-toolbar-left picker {
    display: inline-flex;
    vertical-align: middle;
  }

  .date-clear-chip {
    color: #c57960;
    border-color: rgba(239, 145, 114, 0.35);
    background: rgba(255, 252, 250, 0.65);
  }

  .filter-chip {
    padding: 10px 16px;
    border-radius: 999px;
    font-size: 24px;
    font-weight: 600;
    line-height: 1.35;
    color: #9e9084;
    background: rgba(255, 255, 255, 0.55);
    border: 1px solid rgba(255, 210, 200, 0.45);
    -webkit-tap-highlight-color: transparent;
  }

  /* 与通用类名 active 解耦，避免和全局 .tab-item.active 等规则撞车 */
  .filter-chip.is-selected {
    color: #fffaf8;
    font-weight: 700;
    background: linear-gradient(135deg, #ef9172 0%, #f4b19d 100%);
    border-color: rgba(255, 255, 255, 0.35);
    box-shadow: 0 4px 12px rgba(239, 145, 114, 0.22);
  }

  /* 与榜单 rank-panel 卡片一致 */
  .glass-card {
    background: rgba(255, 255, 255, 0.28);
    border: 1px solid rgba(255, 255, 255, 0.58);
    box-shadow: 0 8px 16px rgba(202, 221, 214, 0.08);
    backdrop-filter: blur(12px);
  }

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
    color: #98a8a1;
    font-size: 24px;
    line-height: 1.6;
    word-break: break-word;
  }

  .timeline-item {
    display: flex;
    gap: 28px;
  }

  .timeline-rail {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 12px;
  }

  .timeline-dot {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: linear-gradient(145deg, #6fd4a8 0%, #8ee4c0 42%, #f4a08a 72%, #ef9172 100%);
    box-shadow:
      0 0 0 4px rgba(130, 210, 175, 0.2),
      0 0 0 7px rgba(255, 175, 155, 0.12);
  }

  .timeline-line {
    width: 2px;
    flex: 1;
    margin-top: 10px;
    background: linear-gradient(180deg, rgba(110, 210, 165, 0.55) 0%, rgba(255, 175, 150, 0.45) 100%);
  }

  .timeline-card {
    flex: 1;
    margin-bottom: 16px;
    padding: 16px;
    overflow: hidden;
    border-radius: 24px;
  }

  .timeline-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    margin-bottom: 14px;
  }

  .timeline-day {
    display: block;
    font-size: 30px;
    font-weight: 700;
    margin-bottom: 4px;
    color: #5d433a;
  }

  .timeline-time {
    display: block;
    font-size: 22px;
    color: #9e9084;
  }

  .timeline-meta {
    display: block;
    font-size: 24px;
    font-weight: 600;
    line-height: 1.45;
    color: #7e817d;
  }

  .timeline-mood {
    flex-shrink: 0;
    min-width: 124px;
    padding: 10px 18px;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(105deg, rgba(236, 252, 244, 0.95) 0%, rgba(255, 242, 234, 0.98) 100%);
    border: 1px solid rgba(200, 228, 210, 0.5);
    color: #c57960;
    font-size: 22px;
    font-weight: 700;
  }

  .timeline-mood.is-like {
    color: #c57960;
  }

  .timeline-mood.is-dislike {
    background: linear-gradient(105deg, rgba(255, 245, 240, 0.98) 0%, rgba(255, 228, 218, 0.95) 100%);
    border-color: rgba(255, 190, 170, 0.55);
    color: #b86a5c;
  }

  .timeline-image {
    width: 100%;
    height: 248px;
    border-radius: 20px;
    margin-bottom: 16px;
  }

  .timeline-body {
    padding: 2px 4px 4px;
  }

  .timeline-title {
    display: block;
    font-size: 30px;
    font-weight: 700;
    margin-bottom: 10px;
    color: #5d433a;
  }

  .timeline-note {
    display: block;
    font-size: 24px;
    line-height: 1.7;
    color: #7e817d;
    margin-bottom: 14px;
  }

  .timeline-foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }

  .timeline-link {
    flex-shrink: 0;
    font-size: 22px;
    font-weight: 700;
    color: #ef9172;
  }

  .timeline {
    width: 100%;
    padding-bottom: 30px;
  }
}
</style>
