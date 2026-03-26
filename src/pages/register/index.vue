<template>
  <view class="mobile-shell register-page">
    <view class="screen-frame">
      <view class="welcome-card glass-card">
        <text class="welcome-tag">Blue Edition</text>
        <text class="welcome-title">吃了没</text>
        <text class="welcome-copy">发现校园里最值得拍、最值得夸、最值得再吃一次的那份美味。</text>

        <view class="preview-card">
          <image
            class="preview-image"
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80"
            mode="aspectFill"
          />
          <view class="preview-info">
            <text class="preview-name">蓝湾海鲜烩饭</text>
            <text class="preview-meta">今日推荐 · 4.9 分</text>
          </view>
        </view>

        <view class="enter-btn" @click="goToHome">进入首页</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import Taro from '@tarojs/taro'

const goToHome = () => {
  Taro.switchTab({ url: '/pages/index/index' })
}
</script>

<style lang="scss">
.register-page {
  .welcome-card {
    padding: 28px;
    background: linear-gradient(180deg, rgba(255, 252, 247, 0.96) 0%, rgba(255, 242, 224, 0.96) 100%);
  }

  .welcome-tag {
    display: inline-flex;
    padding: 8px 14px;
    border-radius: 999px;
    background: var(--brand-50);
    color: var(--brand-600);
    font-size: 20px;
    margin-bottom: 16px;
  }

  .welcome-title {
    display: block;
    font-size: 58px;
    font-weight: 800;
    margin-bottom: 10px;
  }

  .welcome-copy {
    display: block;
    font-size: 24px;
    line-height: 1.7;
    color: var(--ink-700);
    margin-bottom: 24px;
  }

  .preview-card {
    overflow: hidden;
    border-radius: 24px;
    background: #fff;
    box-shadow: 0 10px 22px rgba(132, 101, 73, 0.06);
  }

  .preview-image {
    width: 100%;
    height: 360px;
  }

  .preview-info {
    padding: 20px;
  }

  .preview-name {
    display: block;
    font-size: 28px;
    font-weight: 700;
    margin-bottom: 8px;
  }

  .preview-meta {
    font-size: 22px;
    color: var(--ink-500);
  }

  .enter-btn {
    height: 92px;
    border-radius: 24px;
    background: linear-gradient(135deg, var(--brand-500) 0%, var(--peach-500) 100%);
    color: #fff;
    font-size: 28px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 24px;
    box-shadow: 0 8px 16px rgba(220, 154, 95, 0.12);
  }
}
</style>
