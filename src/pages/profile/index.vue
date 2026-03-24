<template>
  <view class="mobile-shell profile-page">
    <view class="screen-frame">
      <view class="profile-hero glass-card">
        <view class="hero-top">
          <view class="hero-avatar">M</view>
          <view>
            <text class="hero-name">Mia 同学</text>
            <text class="hero-signature">偏爱轻食、烤物和所有看起来会发光的甜品。</text>
          </view>
        </view>
        <view class="hero-actions">
          <view class="follow-btn">编辑资料</view>
          <view class="share-btn">分享主页</view>
        </view>
      </view>

      <view class="stats-grid">
        <view v-for="item in profileHighlights" :key="item.label" class="stat-card glass-card">
          <text class="stat-value">{{ item.value }}</text>
          <text class="stat-label">{{ item.label }}</text>
        </view>
      </view>

      <view class="section-title">
        <text class="title">互动功能</text>
        <text class="caption">评论、点赞、收藏、想吃</text>
      </view>

      <view class="action-list">
        <view v-for="action in quickActions" :key="action" class="action-card glass-card">
          <text class="action-name">{{ action }}</text>
          <text class="action-arrow">→</text>
        </view>
      </view>

      <view class="favorites glass-card">
        <text class="favorite-title">最近收藏</text>
        <view v-for="dish in featuredDishes.slice(0, 2)" :key="dish.id" class="favorite-item">
          <image class="favorite-image" :src="dish.image" mode="aspectFill" />
          <view class="favorite-content">
            <text class="favorite-name">{{ dish.name }}</text>
            <text class="favorite-meta">{{ dish.restaurant }} · ￥{{ dish.price }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { featuredDishes, profileHighlights, quickActions } from '../../data/mock'
</script>

<style lang="scss">
.profile-page {
  .profile-hero {
    padding: 24px;
    margin-bottom: 22px;
    background: linear-gradient(135deg, #2f6bff 0%, #7bbcff 100%);
    color: #fff;
  }

  .hero-top {
    display: flex;
    gap: 16px;
    align-items: center;
  }

  .hero-top > view:last-child {
    flex: 1;
    min-width: 0;
  }

  .hero-avatar {
    width: 82px;
    height: 82px;
    border-radius: 26px;
    background: rgba(255, 255, 255, 0.18);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 34px;
    font-weight: 800;
  }

  .hero-name {
    display: block;
    font-size: 32px;
    font-weight: 700;
    margin-bottom: 8px;
    word-break: break-word;
  }

  .hero-signature {
    display: block;
    font-size: 22px;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.82);
    word-break: break-word;
  }

  .hero-actions {
    display: flex;
    gap: 12px;
    margin-top: 22px;
  }

  .follow-btn,
  .share-btn {
    flex: 1;
    height: 78px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    font-weight: 700;
  }

  .follow-btn {
    background: #fff;
    color: var(--brand-600);
  }

  .share-btn {
    background: rgba(255, 255, 255, 0.16);
    color: #fff;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
    margin-bottom: 24px;
  }

  .stat-card,
  .action-card,
  .favorites {
    padding: 20px;
  }

  .stat-value {
    display: block;
    font-size: 34px;
    font-weight: 800;
    color: var(--brand-600);
    margin-bottom: 8px;
  }

  .stat-label {
    font-size: 20px;
    color: var(--ink-500);
  }

  .action-list {
    display: flex;
    flex-direction: column;
    gap: 14px;
    margin-bottom: 24px;
  }

  .action-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .action-name {
    font-size: 24px;
    font-weight: 600;
  }

  .action-arrow {
    color: var(--brand-600);
    font-size: 24px;
  }

  .favorite-title {
    display: block;
    font-size: 28px;
    font-weight: 700;
    margin-bottom: 16px;
  }

  .favorite-item {
    display: flex;
    gap: 14px;
  }

  .favorite-item + .favorite-item {
    margin-top: 14px;
  }

  .favorite-image {
    width: 124px;
    height: 124px;
    border-radius: 18px;
    flex-shrink: 0;
  }

  .favorite-content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .favorite-name {
    display: block;
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 8px;
    word-break: break-word;
  }

  .favorite-meta {
    font-size: 20px;
    color: var(--ink-500);
  }
}
</style>
