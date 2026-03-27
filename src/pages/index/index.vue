<template>
  <view class="mobile-shell home-page">
    <view class="screen-frame">
      <view class="header">
        <view class="header-copy">
          <view class="headline-wrap">
            <view class="headline-row">
              <view class="headline-shell">
                <view class="headline-bubbles" aria-hidden="true">
                  <text
                    v-for="bubble in bubbleDots"
                    :key="bubble.id"
                    class="bubble-dot"
                    :style="{
                      width: `${bubble.size}px`,
                      height: `${bubble.size}px`,
                      left: bubble.left,
                      bottom: bubble.bottom,
                      animationDelay: bubble.delay,
                      animationDuration: bubble.duration,
                    }"
                  />
                </view>
                <view class="headline" aria-label="把今天想记住的美味，轻轻存下来">
                  <text
                    v-for="(char, index) in headlineChars"
                    :key="`${char}-${index}`"
                    class="headline-char"
                    :style="{
                      animationDelay: `${1.4 + (index % 5) * 0.18}s`,
                      animationDuration: `${4.2 + (index % 3) * 0.22}s`,
                    }"
                  >
                    {{ char }}
                  </text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="search-box glass-card">
        <text class="search-icon">⌕</text>
        <text class="search-text">搜搜今天想收藏的餐厅、味道和小惊喜</text>
      </view>

      <view class="section-title">
        <text class="title">今日气泡推荐</text>
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
        <text class="title">想再看一眼</text>
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
import { featuredDishes } from '../../data/mock'

const headlineChars = Array.from('把今天想记住的美味，轻轻存下来')
const bubbleDots = [
  { id: 'b1', size: 7, left: '3%', bottom: '4px', delay: '0.1s', duration: '2.9s' },
  { id: 'b2', size: 10, left: '9%', bottom: '0px', delay: '0.5s', duration: '3.3s' },
  { id: 'b3', size: 6, left: '16%', bottom: '5px', delay: '1s', duration: '2.7s' },
  { id: 'b4', size: 9, left: '23%', bottom: '1px', delay: '1.4s', duration: '3.4s' },
  { id: 'b5', size: 5, left: '31%', bottom: '6px', delay: '0.8s', duration: '2.8s' },
  { id: 'b6', size: 8, left: '38%', bottom: '2px', delay: '1.9s', duration: '3.1s' },
  { id: 'b7', size: 6, left: '46%', bottom: '4px', delay: '0.3s', duration: '2.6s' },
  { id: 'b8', size: 10, left: '54%', bottom: '-1px', delay: '1.2s', duration: '3.6s' },
  { id: 'b9', size: 5, left: '61%', bottom: '6px', delay: '2.1s', duration: '2.9s' },
  { id: 'b10', size: 8, left: '69%', bottom: '0px', delay: '0.7s', duration: '3.2s' },
  { id: 'b11', size: 6, left: '77%', bottom: '5px', delay: '1.6s', duration: '2.8s' },
  { id: 'b12', size: 9, left: '85%', bottom: '1px', delay: '2.3s', duration: '3.5s' },
  { id: 'b13', size: 5, left: '92%', bottom: '4px', delay: '1.1s', duration: '2.7s' },
  { id: 'b14', size: 6, left: '6%', bottom: '7px', delay: '1.7s', duration: '2.5s' },
  { id: 'b15', size: 7, left: '13%', bottom: '3px', delay: '2.4s', duration: '3s' },
  { id: 'b16', size: 5, left: '20%', bottom: '8px', delay: '0.6s', duration: '2.4s' },
  { id: 'b17', size: 6, left: '28%', bottom: '2px', delay: '1.5s', duration: '2.9s' },
  { id: 'b18', size: 7, left: '43%', bottom: '6px', delay: '2.2s', duration: '2.7s' },
  { id: 'b19', size: 5, left: '58%', bottom: '3px', delay: '0.9s', duration: '2.6s' },
  { id: 'b20', size: 6, left: '65%', bottom: '7px', delay: '1.8s', duration: '2.8s' },
  { id: 'b21', size: 5, left: '73%', bottom: '2px', delay: '2.5s', duration: '2.5s' },
  { id: 'b22', size: 7, left: '80%', bottom: '6px', delay: '1.3s', duration: '3s' },
  { id: 'b23', size: 6, left: '88%', bottom: '3px', delay: '0.4s', duration: '2.6s' },
]

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
  min-height: 100vh;
  background:
    radial-gradient(circle at 82% 7%, rgba(255, 210, 195, 0.82), transparent 20%),
    radial-gradient(circle at 16% 12%, rgba(231, 252, 246, 0.94), transparent 24%),
    radial-gradient(circle at 52% 0%, rgba(255, 241, 233, 0.85), transparent 26%),
    linear-gradient(180deg, #f4fffd 0%, #f6fffb 24%, #fffaf6 58%, #fff2ea 100%);

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
    position: relative;
    padding: 0 2px 20px;
  }

  .screen-frame::before,
  .screen-frame::after {
    content: '';
    position: absolute;
    border-radius: 999px;
    pointer-events: none;
    opacity: 0.32;
    filter: blur(1px);
  }

  .screen-frame::before {
    top: 30px;
    right: 24px;
    width: 88px;
    height: 88px;
    background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.96), rgba(255, 223, 214, 0.2));
  }

  .screen-frame::after {
    top: 198px;
    left: -8px;
    width: 48px;
    height: 48px;
    background: radial-gradient(circle at 35% 35%, rgba(255, 255, 255, 0.9), rgba(214, 249, 241, 0.2));
  }

  .header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 12px;
    gap: 20px;
    padding: 8px 0 4px;
  }

  .header-copy {
    flex: 1;
    min-width: 0;
  }

  .headline-wrap {
    position: relative;
    z-index: 1;
  }

  .headline-row {
    display: flex;
    align-items: flex-start;
    gap: 0;
    flex-wrap: wrap;
  }

  .headline-shell {
    position: relative;
    flex: 1;
    min-width: 0;
    padding-bottom: 20px;
    overflow: visible;
  }

  .headline-bubbles {
    position: absolute;
    left: 0;
    right: 4px;
    bottom: 2px;
    height: 46px;
    pointer-events: none;
    overflow: visible;
    z-index: 2;
  }

  .bubble-dot {
    position: absolute;
    border-radius: 50%;
    background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.98), rgba(255, 211, 198, 0.24) 72%);
    border: 1px solid rgba(255, 215, 204, 0.78);
    box-shadow:
      0 8px 16px rgba(255, 194, 178, 0.16),
      inset 0 0 0 1px rgba(255, 255, 255, 0.28);
    opacity: 0;
    animation-name: bubble-rise;
    animation-timing-function: ease-in-out;
    animation-iteration-count: infinite;
    animation-fill-mode: both;
  }

  .headline {
    position: relative;
    z-index: 3;
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    column-gap: 2px;
    font-size: 34px;
    line-height: 1.35;
    font-weight: 700;
    color: #5d433a;
    word-break: break-word;
  }

  .headline-char {
    display: inline-block;
    opacity: 1;
    transform: translateY(0) scale(1);
    text-shadow: 0 6px 18px rgba(255, 208, 193, 0.16);
    animation: fizz-text 4.4s ease-in-out infinite;
    animation-fill-mode: both;
  }

  .glass-card {
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.84), rgba(251, 255, 253, 0.76)),
      radial-gradient(circle at top right, rgba(255, 229, 220, 0.22), transparent 30%);
    border: 1px solid rgba(217, 242, 235, 0.92);
    box-shadow: 0 18px 34px rgba(186, 223, 215, 0.14);
    backdrop-filter: blur(12px);
  }

  .search-box {
    display: flex;
    align-items: center;
    gap: 16px;
    width: 100%;
    padding: 18px 18px;
    margin-bottom: 32px;
    overflow: hidden;
    border-radius: 24px;
    position: relative;
  }

  .search-box::after {
    content: '';
    position: absolute;
    top: 10px;
    right: 16px;
    width: 54px;
    height: 18px;
    border-radius: 999px;
    background: linear-gradient(90deg, rgba(255, 255, 255, 0.52), rgba(255, 255, 255, 0));
    opacity: 0.9;
  }

  .search-icon {
    flex-shrink: 0;
    color: #f09a7e;
    font-size: 30px;
    line-height: 1;
  }

  .search-text {
    flex: 1;
    min-width: 0;
    color: #98a8a1;
    font-size: 24px;
    word-break: break-word;
  }

  .section-title {
    margin-bottom: 16px;
  }

  .title {
    font-size: 31px;
    font-weight: 700;
    color: #5e4a42;
    letter-spacing: 1px;
  }

  .hero-clip {
    width: 100%;
    overflow: hidden;
    border-radius: 28px;
    margin-bottom: 30px;
    box-shadow: 0 18px 36px rgba(197, 221, 214, 0.2);
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
    border-radius: 28px;
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
    background: linear-gradient(180deg, rgba(248, 255, 252, 0.06) 12%, rgba(93, 70, 58, 0.58) 100%);
    color: #fffaf8;
  }

  .hero-top {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .hero-tag {
    padding: 10px 16px;
    border-radius: 999px;
    background: rgba(255, 250, 246, 0.24);
    border: 1px solid rgba(255, 255, 255, 0.18);
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
    color: rgba(255, 247, 244, 0.88);
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
    color: #ffd47a;
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
    color: #5d433a;
    word-break: break-word;
  }

  .restaurant-theme {
    display: block;
    font-size: 20px;
    color: #9da9a3;
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
    border-radius: 24px;
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
    color: #7e817d;
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
    color: #9aaaa3;
    word-break: break-word;
  }

  .recommend-price {
    flex-shrink: 0;
    font-size: 24px;
    font-weight: 700;
    color: #ef9172;
  }

  @keyframes bubble-rise {
    0% {
      opacity: 0;
      transform: translate3d(0, 8px, 0) scale(0.74);
    }
    20% {
      opacity: 0.74;
    }
    60% {
      opacity: 0.92;
      transform: translate3d(8px, -18px, 0) scale(1.06);
    }
    100% {
      opacity: 0;
      transform: translate3d(-6px, -36px, 0) scale(1.14);
    }
  }

  @keyframes fizz-text {
    0%,
    100% {
      transform: translateY(0) scale(1);
    }
    25% {
      transform: translateY(-0.03px) scale(1.0001);
    }
    50% {
      transform: translateY(0.02px) scale(0.99996);
    }
    75% {
      transform: translateY(-0.03px) scale(1.00008);
    }
  }
}
</style>
