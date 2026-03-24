<template>
  <view class="mobile-shell record-page">
    <view class="screen-frame">
      <view class="section-title">
        <text class="title">每日记录</text>
        <text class="caption">竖向时间轴</text>
      </view>

      <view class="summary glass-card">
        <view class="summary-pill">本周记录 7 餐</view>
        <text class="summary-title">你最近更偏爱高颜值轻食和海鲜风味。</text>
        <text class="summary-copy">时间轴保留每次用餐的照片、情绪和热量，让回看更有画面感。</text>
      </view>

      <view class="timeline">
        <view v-for="(item, index) in timelineRecords" :key="item.day" class="timeline-item">
          <view class="timeline-rail">
            <view class="timeline-dot"></view>
            <view v-if="index !== timelineRecords.length - 1" class="timeline-line"></view>
          </view>
          <view class="timeline-card glass-card">
            <view class="timeline-head">
              <view>
                <text class="timeline-day">{{ item.day }}</text>
                <text class="timeline-meal">{{ item.meal }}</text>
              </view>
              <text class="timeline-mood">{{ item.mood }}</text>
            </view>
            <image class="timeline-image" :src="item.image" mode="aspectFill" />
            <text class="timeline-title">{{ item.title }}</text>
            <text class="timeline-note">{{ item.note }}</text>
            <text class="timeline-calories">{{ item.calories }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { timelineRecords } from '../../data/mock'
</script>

<style lang="scss">
.record-page {
  .summary {
    padding: 24px;
    margin-bottom: 24px;
  }

  .summary-pill {
    display: inline-flex;
    padding: 8px 14px;
    border-radius: 999px;
    background: var(--brand-50);
    color: var(--brand-600);
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
    background: linear-gradient(135deg, #2f6bff 0%, #74b7ff 100%);
    box-shadow: 0 0 0 8px rgba(47, 107, 255, 0.12);
  }

  .timeline-line {
    width: 2px;
    flex: 1;
    margin-top: 10px;
    background: linear-gradient(180deg, rgba(47, 107, 255, 0.45) 0%, rgba(47, 107, 255, 0.06) 100%);
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
    background: #edf4ff;
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
