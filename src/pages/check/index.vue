<template>
  <view class="mobile-shell detail-page">
    <view class="screen-frame">
      <image class="cover-image glass-card" :src="dish.image" mode="aspectFill" />

      <view class="meta-row">
        <view class="author-card glass-card">
          <view class="author-avatar">{{ dish.author.slice(0, 1) }}</view>
          <view>
            <text class="author-name">{{ dish.author }}</text>
            <text class="author-title">{{ dish.authorTitle }} · {{ dish.publishTime }}</text>
          </view>
        </view>
        <view class="score-card glass-card">
          <text class="score-value">{{ dish.rating }}</text>
          <view class="star-row">
            <text v-for="star in 5" :key="star">★</text>
          </view>
        </view>
      </view>

      <view class="headline-block">
        <text class="detail-title">{{ dish.name }}</text>
        <text class="detail-subtitle">{{ dish.restaurant }} · {{ dish.location }} · ￥{{ dish.price }}</text>
      </view>

      <view class="info-card glass-card">
        <text class="section-label">美食评价</text>
        <text class="body-copy">{{ dish.summary }}</text>
      </view>

      <view class="info-card glass-card">
        <text class="section-label">特色亮点</text>
        <view class="tag-row">
          <text v-for="item in dish.highlights" :key="item" class="detail-chip">{{ item }}</text>
        </view>
      </view>

      <view class="info-card glass-card">
        <text class="section-label">实用贴士</text>
        <view class="tip-list">
          <view v-for="tip in dish.tips" :key="tip" class="tip-item">
            <text class="tip-dot"></text>
            <text class="tip-text">{{ tip }}</text>
          </view>
        </view>
      </view>

      <view class="info-card glass-card">
        <view class="comment-head">
          <text class="section-label">评论区</text>
          <text class="comment-count">{{ dish.comments.length }} 条</text>
        </view>
        <view v-for="comment in dish.comments" :key="comment.user" class="comment-item">
          <image class="comment-avatar" :src="comment.avatar" mode="aspectFill" />
          <view class="comment-content">
            <view class="comment-meta">
              <text class="comment-user">{{ comment.user }}</text>
              <text class="comment-time">{{ comment.time }}</text>
            </view>
            <view class="star-row">
              <text v-for="star in comment.rating" :key="star">★</text>
            </view>
            <text class="comment-text">{{ comment.content }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import Taro from '@tarojs/taro'
import { computed } from 'vue'
import { featuredDishes } from '../../data/mock'

const routeId = Taro.getCurrentInstance().router?.params?.id

const dish = computed(() => {
  return featuredDishes.find((item) => item.id === routeId) ?? featuredDishes[0]
})
</script>

<style lang="scss">
.detail-page {
  .cover-image {
    width: 100%;
    height: 340px;
    border-radius: 28px;
    overflow: hidden;
    margin-bottom: 20px;
  }

  .meta-row {
    display: flex;
    gap: 14px;
    margin-bottom: 18px;
  }

  .author-card,
  .score-card,
  .info-card {
    padding: 22px;
  }

  .author-card {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .author-avatar {
    width: 58px;
    height: 58px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--brand-500) 0%, var(--peach-500) 100%);
    color: #fff;
    font-size: 26px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .author-name {
    display: block;
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 4px;
  }

  .author-title,
  .detail-subtitle,
  .comment-time,
  .comment-count {
    font-size: 18px;
    color: var(--ink-500);
  }

  .score-card {
    width: 112px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .score-value {
    font-size: 34px;
    font-weight: 700;
    color: var(--brand-600);
    margin-bottom: 8px;
  }

  .headline-block {
    margin-bottom: 20px;
  }

  .detail-title {
    display: block;
    font-size: 42px;
    line-height: 1.32;
    font-weight: 800;
    margin-bottom: 8px;
  }

  .info-card {
    margin-bottom: 18px;
  }

  .section-label {
    display: block;
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 14px;
  }

  .body-copy,
  .tip-text,
  .comment-text {
    font-size: 22px;
    line-height: 1.7;
    color: var(--ink-700);
  }

  .tag-row {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }

  .detail-chip {
    padding: 10px 16px;
    border-radius: 999px;
    background: var(--brand-50);
    color: var(--brand-600);
    font-size: 20px;
    font-weight: 600;
  }

  .tip-list {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .tip-item {
    display: flex;
    gap: 12px;
  }

  .tip-dot {
    width: 12px;
    height: 12px;
    margin-top: 10px;
    border-radius: 50%;
    background: var(--peach-500);
    flex-shrink: 0;
  }

  .comment-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .comment-item {
    display: flex;
    gap: 14px;
    padding-top: 18px;
    margin-top: 18px;
    border-top: 1px solid #e8eefc;
  }

  .comment-avatar {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .comment-content {
    flex: 1;
  }

  .comment-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .comment-user {
    font-size: 22px;
    font-weight: 700;
  }
}
</style>
