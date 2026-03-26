<template>
  <view class="mobile-shell home-page">
    <view class="screen-frame">
      <view class="header">
        <view class="header-copy">
          <view class="headline-wrap">
            <text class="headline-kicker">今日心动存档 ✦</text>
            <view class="headline-row">
              <view class="headline" aria-label="把今天想记住的美味，轻轻存下来。">
                <text
                  v-for="(char, index) in headlineChars"
                  :key="`${char}-${index}`"
                  class="headline-char"
                  :style="{ animationDelay: `${0.18 + index * 0.05}s` }"
                >
                  {{ char }}
                </text>
              </view>
              <text class="headline-face">(•͈ᴗ•͈)◞♡</text>
            </view>
            <text class="headline-sub">说不定，下一口心动已经在和你招手啦 ~</text>
          </view>
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

const headlineChars = Array.from('把今天想记住的美味，轻轻存下来。')

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
  
  .screen-frame {
    padding: 0 2px;
  }

  .header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 24px;
    gap: 20px;
  }

  .header-copy {
    flex: 1;
    min-width: 0;
  }

  .headline-wrap {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .headline-kicker {
    align-self: flex-start;
    padding: 8px 16px;
    border-radius: 999px;
    background: rgba(244, 177, 157, 0.18);
    color: var(--peach-600);
    font-size: 18px;
    letter-spacing: 1px;
    text-transform: lowercase;
    animation: pop-in 0.7s ease-out both;
  }

  .headline-row {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    flex-wrap: wrap;
  }

  .headline {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    column-gap: 2px;
    font-size: 34px;
    line-height: 1.35;
    font-weight: 700;
    color: var(--ink-900);
    word-break: break-word;
  }

  .headline-char {
    opacity: 0;
    transform: translateY(20px) scale(0.9);
    animation: char-bounce-in 0.55s cubic-bezier(0.22, 1.1, 0.3, 1) forwards;
  }

  .headline-face {
    flex-shrink: 0;
    margin-top: 6px;
    font-size: 28px;
    line-height: 1.2;
    opacity: 0;
    animation:
      face-pop 0.45s ease-out 0.95s forwards,
      wiggle 2.8s ease-in-out 1.45s infinite;
    transform-origin: center bottom;
  }

  .headline-sub {
    display: block;
    font-size: 20px;
    line-height: 1.5;
    color: var(--ink-500);
    animation: float-up 0.8s ease-out 0.2s both;
  }

  .search-box {
    display: flex;
    align-items: center;
    gap: 16px;
    width: 100%;
    padding: 16px 16px;
    margin-bottom: 30px;
    overflow: hidden;
  }

  .search-icon {
    flex-shrink: 0;
    color: var(--brand-600);
    font-size: 30px;
    line-height: 1;
  }

  .search-text {
    flex: 1;
    min-width: 0;
    color: var(--ink-500);
    font-size: 28px;
    word-break: break-word;
  }

  .section-title {
    margin-bottom: 16px;
  }

  .title {
    font-size: 35px;
    font-weight: 700;
    color: var(--ink-900);
  }

  .hero-clip {
    width: 100%;
    overflow: hidden;
    border-radius: 24px;
    margin-bottom: 30px;
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
    padding: 24px;
    background: linear-gradient(180deg, rgba(70, 42, 19, 0.05) 18%, rgba(58, 35, 18, 0.56) 100%);
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
    color: var(--brand-500);
  }

  .restaurant-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
    width: 100%;
    margin-bottom: 30px;
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
    gap: 16px;
    width: 100%;
    padding-bottom: 30px;
  }

  .recommend-card {
    display: flex;
    gap: 18px;
    width: 100%;
    padding: 16px;
    overflow: hidden;
  }

  .recommend-image {
    width: 140px;
    height: 140px;
    border-radius: 20px;
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
    line-height: 1.5;
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
    color: var(--peach-600);
  }

  @keyframes float-up {
    0% {
      opacity: 0;
      transform: translateY(18px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes char-bounce-in {
    0% {
      opacity: 0;
      transform: translateY(20px) scale(0.88);
    }
    70% {
      opacity: 1;
      transform: translateY(-4px) scale(1.04);
    }
    100% {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @keyframes face-pop {
    0% {
      opacity: 0;
      transform: scale(0.7) rotate(-10deg);
    }
    100% {
      opacity: 1;
      transform: scale(1) rotate(0deg);
    }
  }

  @keyframes pop-in {
    0% {
      opacity: 0;
      transform: translateY(-8px) scale(0.92);
    }
    100% {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @keyframes wiggle {
    0%,
    100% {
      transform: rotate(0deg) translateY(0);
    }
    25% {
      transform: rotate(-8deg) translateY(-2px);
    }
    50% {
      transform: rotate(6deg) translateY(1px);
    }
    75% {
      transform: rotate(-4deg) translateY(-1px);
    }
  }
}
</style>
