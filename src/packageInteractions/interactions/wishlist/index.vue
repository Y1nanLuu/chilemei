<template>
  <view class="mobile-shell interaction-page">
    <view class="screen-frame">
      <view class="hero-card glass-card">
        <text class="hero-badge">互动中心</text>
        <text class="hero-title">我的想吃</text>
        <text class="hero-copy">这里作为想吃页入口，后续可以展示你标记过“想吃”的美食愿望单。</text>
      </view>

      <view class="panel-card glass-card">
        <text class="panel-title">当前已实现</text>
        <text class="panel-copy">从“我的”页面点击“想吃”卡片，可以跳转到这里。</text>
      </view>

      <view class="panel-card glass-card">
        <text class="panel-title">后续建议</text>
        <text class="panel-copy">可接入愿望清单、已吃转记录、优先级排序和到店提醒。</text>
      </view>
    </view>
  </view>
</template>

<style lang="scss">
.interaction-page {
  .hero-card,
  .panel-card {
    padding: 24px;
    margin-bottom: 18px;
  }

  .hero-badge {
    display: inline-flex;
    padding: 8px 14px;
    border-radius: 999px;
    background: #eef4ff;
    color: var(--brand-600);
    font-size: 20px;
    margin-bottom: 14px;
  }

  .hero-title,
  .panel-title {
    display: block;
    font-weight: 700;
    color: var(--ink-900);
  }

  .hero-title {
    font-size: 38px;
    margin-bottom: 10px;
  }

  .panel-title {
    font-size: 28px;
    margin-bottom: 10px;
  }

  .hero-copy,
  .panel-copy {
    display: block;
    font-size: 22px;
    line-height: 1.7;
    color: var(--ink-600);
  }
}
</style>
