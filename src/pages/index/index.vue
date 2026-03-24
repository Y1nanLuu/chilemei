<template>
  <view class="mobile-shell home-page">
    <view class="screen-frame">
      <view class="header">
        <view class="header-copy">
          <text class="headline">Find something worth saving today.</text>
        </view>
      </view>

      <view class="search-box glass-card">
        <text class="search-icon">⌕</text>
        <text class="search-text">Search dishes, restaurants, or flavors</text>
      </view>

      <view class="section-title">
        <text class="title">Today Picks</text>
      </view>

      <view class="hero-clip">
        <swiper class="hero-swiper" circular autoplay interval="3600" duration="420">
          <swiper-item v-for="dish in featuredDishes" :key="dish.id">
            <view class="hero-card glass-card" @click="openDetail(dish.id)">
              <image class="hero-image" :src="dish.image" mode="aspectFill" />
              <view class="hero-overlay">
                <view class="hero-top">
                  <text v-for="tag in dish.tags.slice(0, 2)" :key="tag" class="hero-tag">{{ tag }}</text>
                </view>
                <view class="hero-bottom">
                  <text class="hero-name">{{ dish.name }}</text>
                  <text class="hero-meta">{{ dish.restaurant }} · ${{ dish.price }}</text>
                  <view class="hero-rating">
                    <text class="star">★</text>
                    <text>{{ dish.rating }}</text>
                  </view>
                </view>
              </view>
            </view>
          </swiper-item>
        </swiper>
      </view>

      <view class="section-title">
        <text class="title">Hot Spots</text>
      </view>

      <view class="restaurant-grid">
        <view v-for="restaurant in restaurantCards" :key="restaurant.id" class="restaurant-card glass-card">
          <image class="restaurant-image" :src="restaurant.image" mode="aspectFill" />
          <view class="restaurant-body">
            <text class="restaurant-name">{{ restaurant.name }}</text>
            <text class="restaurant-theme">{{ restaurant.theme }}</text>
            <view class="restaurant-score">
              <text class="star">★</text>
              <text>{{ restaurant.score }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="section-title">
        <text class="title">Recommended</text>
      </view>

      <view class="recommend-list">
        <view
          v-for="dish in featuredDishes"
          :key="dish.id"
          class="recommend-card glass-card"
          @click="openDetail(dish.id)"
        >
          <image class="recommend-image" :src="dish.image" mode="aspectFill" />
          <view class="recommend-content">
            <text class="recommend-name">{{ dish.name }}</text>
            <text class="recommend-summary">{{ dish.summary }}</text>
            <view class="recommend-foot">
              <text class="recommend-meta">{{ dish.location }}</text>
              <text class="recommend-price">${{ dish.price }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import Taro from '@tarojs/taro'
import { featuredDishes, restaurantCards } from '../../data/mock'

const openDetail = (id: string) => {
  Taro.navigateTo({
    url: `/pages/check/index?id=${id}`,
  })
}
</script>

<style lang="scss">
.home-page {
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;

  .screen-frame,
  .glass-card,
  .search-box,
  .hero-clip,
  .hero-swiper,
  .hero-card,
  .hero-overlay,
  .restaurant-grid,
  .restaurant-card,
  .restaurant-body,
  .recommend-list,
  .recommend-card,
  .recommend-content,
  .recommend-foot {
    box-sizing: border-box;
    min-width: 0;
    max-width: 100%;
  }

  .header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 28px;
    gap: 20px;
  }

  .header-copy {
    flex: 1;
    min-width: 0;
  }

  .headline {
    display: block;
    font-size: 34px;
    line-height: 1.35;
    font-weight: 700;
    color: var(--ink-900);
    word-break: break-word;
  }

  .search-box {
    display: flex;
    align-items: center;
    gap: 18px;
    width: 100%;
    padding: 24px 28px;
    margin-bottom: 36px;
    overflow: hidden;
  }

  .search-icon {
    flex-shrink: 0;
    color: var(--brand-500);
    font-size: 28px;
    line-height: 1;
  }

  .search-text {
    flex: 1;
    min-width: 0;
    color: var(--ink-500);
    font-size: 24px;
    word-break: break-word;
  }

  .hero-clip {
    width: 100%;
    overflow: hidden;
    border-radius: 32px;
    margin-bottom: 36px;
  }

  .hero-swiper {
    width: 100%;
    height: 440px;
    overflow: hidden;
  }

  .hero-swiper swiper-item {
    width: 100%;
    overflow: hidden;
  }

  .hero-card {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  .hero-image {
    width: 100%;
    height: 100%;
  }

  .hero-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 100%;
    padding: 28px;
    background: linear-gradient(180deg, rgba(7, 21, 48, 0.04) 18%, rgba(7, 21, 48, 0.66) 100%);
    color: #fff;
  }

  .hero-top {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .hero-tag {
    padding: 10px 16px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.2);
    font-size: 20px;
  }

  .hero-name {
    display: block;
    font-size: 36px;
    font-weight: 700;
    margin-bottom: 10px;
    word-break: break-word;
  }

  .hero-meta {
    display: block;
    font-size: 22px;
    color: rgba(255, 255, 255, 0.84);
    margin-bottom: 12px;
    word-break: break-word;
  }

  .hero-rating,
  .restaurant-score {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 22px;
    font-weight: 700;
  }

  .star {
    color: #ffb648;
  }

  .restaurant-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px;
    width: 100%;
    margin-bottom: 36px;
    overflow: hidden;
  }

  .restaurant-card {
    width: 100%;
    overflow: hidden;
  }

  .restaurant-image {
    width: 100%;
    height: 200px;
  }

  .restaurant-body {
    width: 100%;
    padding: 22px;
  }

  .restaurant-name,
  .recommend-name {
    display: block;
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 8px;
    word-break: break-word;
  }

  .restaurant-theme {
    display: block;
    font-size: 20px;
    color: var(--ink-500);
    margin-bottom: 10px;
    word-break: break-word;
  }

  .recommend-list {
    display: flex;
    flex-direction: column;
    gap: 22px;
    width: 100%;
  }

  .recommend-card {
    display: flex;
    gap: 18px;
    width: 100%;
    padding: 18px;
    overflow: hidden;
  }

  .recommend-image {
    width: 152px;
    height: 152px;
    border-radius: 24px;
    flex-shrink: 0;
  }

  .recommend-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .recommend-summary {
    display: block;
    font-size: 20px;
    color: var(--ink-700);
    line-height: 1.6;
    word-break: break-word;
  }

  .recommend-foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
    width: 100%;
    margin-top: 12px;
  }

  .recommend-meta {
    flex: 1;
    min-width: 0;
    font-size: 18px;
    color: var(--ink-500);
    word-break: break-word;
  }

  .recommend-price {
    flex-shrink: 0;
    font-size: 24px;
    font-weight: 700;
    color: var(--brand-600);
  }
}
</style>
