<template>
  <view class="mobile-shell publish-page">
    <view class="screen-frame">
      <view class="hero glass-card">
        <text class="hero-tag">发布新鲜食记</text>
        <text class="hero-title">把今天最想推荐的一口，发给整个校园。</text>
        <text class="hero-desc">照片、评分、亮点和实用贴士都可以一起记录。</text>
      </view>

      <view class="composer glass-card">
        <view class="composer-head">
          <view>
            <text class="label">封面图片</text>
            <text class="hint">支持上传多张，优先展示最能勾起食欲的一张。</text>
          </view>
          <view class="cover-placeholder">
            <text class="cover-plus">+</text>
          </view>
        </view>

        <view class="field">
          <text class="label">美食标题</text>
          <view class="input-box">例如：蓝湾海鲜烩饭</view>
        </view>

        <view class="field row">
          <view class="field-half">
            <text class="label">所属餐厅</text>
            <view class="input-box">潮汐轻食厨房</view>
          </view>
          <view class="field-half">
            <text class="label">价格</text>
            <view class="input-box">￥32</view>
          </view>
        </view>

        <view class="field">
          <text class="label">你的评分</text>
          <view class="score-row">
            <text v-for="star in 5" :key="star" class="score-star">★</text>
            <text class="score-value">4.8</text>
          </view>
        </view>

        <view class="field">
          <text class="label">特色亮点</text>
          <view class="tag-row">
            <text v-for="tag in tags" :key="tag" class="tag-pill">{{ tag }}</text>
          </view>
        </view>

        <view class="field">
          <text class="label">美食点评</text>
          <view class="textarea-box">
            米粒吸满海鲜高汤，整体口感浓郁但不腻，趁热吃更有层次。
          </view>
        </view>

        <view class="actions">
          <view class="draft-btn">存为草稿</view>
          <view class="publish-btn">立即发布</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
const tags = ['高颜值摆盘', '奶香浓郁', '适合约饭']
</script>

<style lang="scss">
.publish-page {
  .hero {
    padding: 28px;
    background: linear-gradient(135deg, #3476ff 0%, #59a7ff 100%);
    color: #fff;
  }

  .hero-tag {
    display: inline-block;
    padding: 8px 14px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.18);
    font-size: 20px;
    margin-bottom: 16px;
  }

  .hero-title {
    display: block;
    font-size: 38px;
    line-height: 1.35;
    font-weight: 700;
    margin-bottom: 12px;
  }

  .hero-desc {
    display: block;
    font-size: 24px;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.84);
  }

  .composer {
    margin-top: 22px;
    padding: 24px;
  }

  .composer-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 24px;
  }

  .composer-head > view:first-child {
    flex: 1;
    min-width: 0;
  }

  .cover-placeholder {
    width: 112px;
    height: 112px;
    border-radius: 24px;
    background: linear-gradient(135deg, #edf4ff 0%, #d6e5ff 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .cover-plus {
    font-size: 56px;
    color: var(--brand-500);
  }

  .field {
    margin-bottom: 24px;
  }

  .row {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
  }

  .field-half {
    flex: 1 1 0;
    min-width: 0;
  }

  .label {
    display: block;
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 12px;
  }

  .hint {
    display: block;
    font-size: 20px;
    line-height: 1.5;
    color: var(--ink-500);
    margin-top: 8px;
    word-break: break-word;
  }

  .input-box,
  .textarea-box {
    border-radius: 20px;
    background: #f7faff;
    border: 1px solid #e1ebff;
    color: var(--ink-700);
    font-size: 24px;
    line-height: 1.6;
  }

  .input-box {
    padding: 20px;
  }

  .textarea-box {
    min-height: 160px;
    padding: 20px;
  }

  .score-row {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .score-star {
    font-size: 34px;
    color: #ffb648;
  }

  .score-value {
    font-size: 26px;
    font-weight: 700;
    color: var(--brand-600);
    margin-left: 8px;
  }

  .tag-row {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }

  .tag-pill {
    padding: 12px 18px;
    border-radius: 999px;
    background: var(--brand-50);
    color: var(--brand-600);
    font-size: 22px;
    font-weight: 600;
  }

  .actions {
    display: flex;
    gap: 14px;
  }

  .draft-btn,
  .publish-btn {
    flex: 1;
    height: 88px;
    border-radius: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 26px;
    font-weight: 700;
  }

  .draft-btn {
    background: #eef4ff;
    color: var(--brand-600);
  }

  .publish-btn {
    background: linear-gradient(135deg, #3476ff 0%, #59a7ff 100%);
    color: #fff;
    box-shadow: 0 16px 24px rgba(52, 118, 255, 0.24);
  }
}
</style>
