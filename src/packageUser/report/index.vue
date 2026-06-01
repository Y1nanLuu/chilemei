<template>
  <view class="mobile-shell report-page">
    <view class="screen-frame">
      <view v-if="!loggedIn" class="status-card glass-card">
        请先登录后再查看美食报告。
      </view>

      <view v-else class="report-body">
        <view class="hero-card glass-card">
          <text class="hero-title">美食报告</text>
          <text class="hero-copy">回顾你的用餐记录、消费趋势和饮食偏好。</text>
          <view v-if="titleTags.length" class="tag-row">
            <text v-for="tag in titleTags" :key="tag" class="title-tag">{{ tag }}</text>
          </view>
        </view>

        <view class="toolbar">
          <view class="mode-tabs">
            <view
              class="mode-tab"
              :class="{ 'is-selected': reportMode === 'annual' }"
              @tap="switchMode('annual')"
            >
              年度报告
            </view>
            <view
              class="mode-tab"
              :class="{ 'is-selected': reportMode === 'monthly' }"
              @tap="switchMode('monthly')"
            >
              月度报告
            </view>
          </view>

          <picker
            v-if="reportMode === 'annual'"
            mode="date"
            fields="year"
            :value="yearPickerValue"
            @change="onYearChange"
          >
            <view class="period-chip">{{ selectedYear }} 年</view>
          </picker>
          <picker
            v-else
            mode="date"
            fields="month"
            :value="monthPickerValue"
            @change="onMonthChange"
          >
            <view class="period-chip">{{ selectedYear }} 年 {{ selectedMonth }} 月</view>
          </picker>
        </view>

        <view v-if="loading" class="status-card glass-card">报告生成中...</view>
        <view v-else-if="errorMessage" class="status-card glass-card">{{ errorMessage }}</view>

        <view v-else-if="activeReport" class="report-content">
          <view class="stats-grid">
            <view class="stat-card glass-card">
              <text class="stat-value">{{ activeReport.total_records }}</text>
              <text class="stat-label">记录数</text>
            </view>
            <view class="stat-card glass-card">
              <text class="stat-value">￥{{ formatReportMoney(activeReport.total_spend) }}</text>
              <text class="stat-label">总消费</text>
            </view>
            <view class="stat-card glass-card">
              <text class="stat-value">￥{{ formatReportMoney(activeReport.average_spend) }}</text>
              <text class="stat-label">均单消费</text>
            </view>
            <view class="stat-card glass-card">
              <text class="stat-value">{{ likePercent }}%</text>
              <text class="stat-label">喜欢占比</text>
            </view>
          </view>

          <view class="panel-card glass-card">
            <text class="section-title">心情分布</text>
            <view class="sentiment-row">
              <view class="sentiment-item">
                <text class="sentiment-label">喜欢</text>
                <text class="sentiment-value">{{ sentimentSummary.like_count }} 条</text>
                <view class="sentiment-bar">
                  <view class="sentiment-fill is-like" :style="{ width: `${likePercent}%` }"></view>
                </view>
              </view>
              <view class="sentiment-item">
                <text class="sentiment-label">劝退</text>
                <text class="sentiment-value">{{ sentimentSummary.dislike_count }} 条</text>
                <view class="sentiment-bar">
                  <view class="sentiment-fill is-dislike" :style="{ width: `${dislikePercent}%` }"></view>
                </view>
              </view>
            </view>
          </view>

          <view class="panel-card glass-card">
            <view class="section-head">
              <text class="section-title">{{ chartTitle }}</text>
              <text class="section-tip">金额单位：元</text>
            </view>
            <view v-if="chartBars.length === 0" class="empty-copy">暂无趋势数据</view>
            <scroll-view
              v-else
              class="chart-scroll"
              :scroll-x="reportMode === 'monthly'"
            >
              <view class="chart-bars" :class="{ 'is-daily': reportMode === 'monthly' }">
                <view v-for="bar in chartBars" :key="bar.key" class="chart-bar-item">
                  <text class="chart-bar-value">{{ bar.spendLabel }}</text>
                  <view class="chart-bar-track">
                    <view class="chart-bar-fill" :style="{ height: `${bar.heightPercent}%` }"></view>
                  </view>
                  <text class="chart-bar-label">{{ bar.label }}</text>
                  <text v-if="bar.count > 0" class="chart-bar-count">{{ bar.count }}条</text>
                </view>
              </view>
            </scroll-view>
          </view>

          <view class="panel-card glass-card">
            <text class="section-title">高频美食</text>
            <view v-if="topFoods.length === 0" class="empty-copy">还没有高频美食</view>
            <view v-for="(food, index) in topFoods" :key="food.name" class="rank-item">
              <text class="rank-index">{{ index + 1 }}</text>
              <text class="rank-name">{{ food.name }}</text>
              <text class="rank-count">{{ food.count }} 次</text>
            </view>
          </view>

          <view class="panel-card glass-card">
            <text class="section-title">常去地点</text>
            <view v-if="topLocations.length === 0" class="empty-copy">还没有常去地点</view>
            <view v-for="(location, index) in topLocations" :key="location.name" class="rank-item">
              <text class="rank-index">{{ index + 1 }}</text>
              <text class="rank-name">{{ location.name }}</text>
              <text class="rank-count">{{ location.count }} 次</text>
            </view>
          </view>
        </view>

        <view v-else class="status-card glass-card">暂无报告数据</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import Taro, { useDidShow } from '@tarojs/taro'
import { computed, ref } from 'vue'
import { getAnnualReport, getMonthlyReport } from '@/api/reports'
import type { AnnualReport, MonthlyReport, ReportRankItem, ReportSentimentSummary } from '@/api/types'
import { hasAccessToken } from '@/utils/auth'
import { formatReportMoney, formatReportPercent, toReportNumber } from '@/utils/report-format'

type ReportMode = 'annual' | 'monthly'

const emptySentiment = (): ReportSentimentSummary => ({
  like_count: 0,
  dislike_count: 0,
  like_rate: '0',
  dislike_rate: '0',
})

const normalizeAnnualReport = (raw: Partial<AnnualReport>, year: number): AnnualReport => ({
  year: raw.year ?? year,
  total_records: raw.total_records ?? 0,
  total_spend: raw.total_spend ?? '0',
  average_spend: raw.average_spend ?? '0',
  sentiment_summary: raw.sentiment_summary ?? emptySentiment(),
  top_foods: raw.top_foods ?? [],
  top_locations: raw.top_locations ?? [],
  monthly_spend: raw.monthly_spend ?? [],
  title_tags: raw.title_tags ?? [],
})

const normalizeMonthlyReport = (raw: Partial<MonthlyReport>, year: number, month: number): MonthlyReport => ({
  year: raw.year ?? year,
  month: raw.month ?? month,
  total_records: raw.total_records ?? 0,
  total_spend: raw.total_spend ?? '0',
  average_spend: raw.average_spend ?? '0',
  sentiment_summary: raw.sentiment_summary ?? emptySentiment(),
  top_foods: raw.top_foods ?? [],
  top_locations: raw.top_locations ?? [],
  daily_spend: raw.daily_spend ?? [],
  title_tags: raw.title_tags ?? [],
})

const now = new Date()
const reportMode = ref<ReportMode>('annual')
const selectedYear = ref(now.getFullYear())
const selectedMonth = ref(now.getMonth() + 1)
const loading = ref(true)
const loggedIn = ref(hasAccessToken())
const errorMessage = ref('')
const annualReport = ref<AnnualReport | null>(null)
const monthlyReport = ref<MonthlyReport | null>(null)

const yearPickerValue = computed(() => `${selectedYear.value}-01-01`)
const monthPickerValue = computed(() => {
  const month = String(selectedMonth.value).padStart(2, '0')
  return `${selectedYear.value}-${month}-01`
})

const activeReport = computed(() => {
  if (reportMode.value === 'annual') {
    return annualReport.value
  }
  return monthlyReport.value
})

const titleTags = computed(() => activeReport.value?.title_tags || [])

const sentimentSummary = computed(() => activeReport.value?.sentiment_summary || emptySentiment())

const topFoods = computed<ReportRankItem[]>(() => activeReport.value?.top_foods || [])

const topLocations = computed<ReportRankItem[]>(() => activeReport.value?.top_locations || [])

const likePercent = computed(() => {
  const rate = activeReport.value?.sentiment_summary?.like_rate
  return Number(formatReportPercent(rate, 0))
})

const dislikePercent = computed(() => {
  const rate = activeReport.value?.sentiment_summary?.dislike_rate
  return Number(formatReportPercent(rate, 0))
})

const chartTitle = computed(() => {
  return reportMode.value === 'annual' ? '月度消费趋势' : '每日消费趋势'
})

type ChartBar = {
  key: string
  label: string
  spend: number
  spendLabel: string
  count: number
  heightPercent: number
}

const chartBars = computed<ChartBar[]>(() => {
  const report = activeReport.value
  if (!report) {
    return []
  }

  const items = reportMode.value === 'annual'
    ? ((report as AnnualReport).monthly_spend || [])
    : ((report as MonthlyReport).daily_spend || [])

  if (!items.length) {
    return []
  }

  const spends = items.map((item) => toReportNumber(item.total_spend))
  const maxSpend = Math.max(...spends, 1)

  return items.map((item) => {
    const spend = toReportNumber(item.total_spend)
    const label = reportMode.value === 'annual'
      ? `${item.month}月`
      : `${item.day}日`

    return {
      key: `${reportMode.value}-${label}`,
      label,
      spend,
      spendLabel: spend > 0 ? spend.toFixed(0) : '',
      count: item.record_count,
      heightPercent: spend > 0 ? Math.max((spend / maxSpend) * 100, 8) : 0,
    }
  })
})

const switchMode = (mode: ReportMode) => {
  if (reportMode.value === mode) {
    return
  }
  reportMode.value = mode
  void loadReport()
}

const onYearChange = (event: { detail: { value: string } }) => {
  const nextYear = Number(event.detail.value.slice(0, 4))
  if (!Number.isFinite(nextYear) || nextYear === selectedYear.value) {
    return
  }
  selectedYear.value = nextYear
  void loadReport()
}

const onMonthChange = (event: { detail: { value: string } }) => {
  const [yearText, monthText] = event.detail.value.split('-')
  const nextYear = Number(yearText)
  const nextMonth = Number(monthText)
  if (!Number.isFinite(nextYear) || !Number.isFinite(nextMonth)) {
    return
  }
  if (nextYear === selectedYear.value && nextMonth === selectedMonth.value) {
    return
  }
  selectedYear.value = nextYear
  selectedMonth.value = nextMonth
  void loadReport()
}

const loadReport = async () => {
  loggedIn.value = hasAccessToken()

  if (!loggedIn.value) {
    annualReport.value = null
    monthlyReport.value = null
    errorMessage.value = ''
    loading.value = false
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    if (reportMode.value === 'annual') {
      const raw = await getAnnualReport(selectedYear.value)
      annualReport.value = normalizeAnnualReport(raw, selectedYear.value)
      monthlyReport.value = null
    } else {
      const raw = await getMonthlyReport(selectedYear.value, selectedMonth.value)
      monthlyReport.value = normalizeMonthlyReport(raw, selectedYear.value, selectedMonth.value)
      annualReport.value = null
    }
  } catch (error) {
    annualReport.value = null
    monthlyReport.value = null
    const message = error instanceof Error ? error.message : '美食报告加载失败'
    errorMessage.value = message
    Taro.showToast({ title: message, icon: 'none' })
  } finally {
    loading.value = false
  }
}

useDidShow(() => {
  void loadReport()
})
</script>

<style lang="scss">
.report-page {
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  min-height: 100vh;

  &.mobile-shell {
    padding: 40px 30px 260px;
  }

  background:
    radial-gradient(circle at 78% 4%, rgba(255, 210, 195, 0.75), transparent 22%),
    radial-gradient(circle at 12% 18%, rgba(186, 236, 220, 0.55), transparent 28%),
    radial-gradient(circle at 50% 0%, rgba(255, 241, 233, 0.9), transparent 32%),
    linear-gradient(180deg, #dff5ec 0%, #e8faf4 18%, #f6fffb 42%, #fffaf6 72%, #fff2ea 100%);

  .screen-frame {
    width: 100%;
    max-width: 100%;
    margin: 0 auto;
    padding: 0 4px 20px;
  }

  .report-body,
  .report-content {
    width: 100%;
  }

  .glass-card {
    background: rgba(255, 255, 255, 0.28);
    border: 1px solid rgba(255, 255, 255, 0.58);
    box-shadow: 0 8px 16px rgba(202, 221, 214, 0.08);
    backdrop-filter: blur(12px);
    border-radius: 24px;
  }

  .hero-card,
  .panel-card,
  .stat-card,
  .status-card {
    padding: 22px;
    margin-bottom: 18px;
  }

  .status-card {
    color: #98a8a1;
    font-size: 24px;
    line-height: 1.6;
  }

  .hero-title {
    display: block;
    font-size: 34px;
    font-weight: 800;
    color: #5c4336;
    margin-bottom: 10px;
  }

  .hero-copy,
  .empty-copy,
  .section-tip {
    font-size: 22px;
    line-height: 1.6;
    color: #866b60;
  }

  .tag-row {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 16px;
  }

  .title-tag {
    padding: 8px 16px;
    border-radius: 999px;
    background: linear-gradient(135deg, #ef9172 0%, #f4b19d 100%);
    color: #fff;
    font-size: 20px;
    font-weight: 700;
  }

  .toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 18px;
    flex-wrap: wrap;
  }

  .mode-tabs {
    display: flex;
    gap: 8px;
  }

  .mode-tab,
  .period-chip {
    min-height: 64px;
    padding: 0 20px;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    font-weight: 600;
    color: #9e9084;
    background: rgba(255, 255, 255, 0.55);
    border: 1px solid rgba(255, 210, 200, 0.45);
    -webkit-tap-highlight-color: transparent;
  }

  .mode-tab.is-selected {
    color: #fffaf8;
    font-weight: 700;
    background: linear-gradient(135deg, #ef9172 0%, #f4b19d 100%);
    border-color: rgba(255, 255, 255, 0.35);
    box-shadow: 0 4px 12px rgba(239, 145, 114, 0.22);
  }

  .period-chip {
    color: #b46d4d;
    background: #fff7f1;
    border-color: #f5d3c3;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
    margin-bottom: 18px;
  }

  .stat-card {
    margin-bottom: 0;
    text-align: center;
  }

  .stat-value {
    display: block;
    font-size: 30px;
    font-weight: 800;
    color: #5d433a;
    margin-bottom: 8px;
    word-break: break-word;
  }

  .stat-label {
    display: block;
    font-size: 20px;
    color: #9aa7a0;
  }

  .section-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 14px;
  }

  .section-title {
    display: block;
    font-size: 28px;
    font-weight: 700;
    color: #5c4336;
    margin-bottom: 14px;
  }

  .section-head .section-title {
    margin-bottom: 0;
  }

  .sentiment-row {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .sentiment-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .sentiment-label,
  .sentiment-value {
    font-size: 22px;
    color: #6a6f6c;
  }

  .sentiment-bar {
    width: 100%;
    height: 16px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.55);
    overflow: hidden;
  }

  .sentiment-fill {
    height: 100%;
    border-radius: 999px;
    transition: width 0.3s ease;
  }

  .sentiment-fill.is-like {
    background: linear-gradient(135deg, #ef9172 0%, #f4b19d 100%);
  }

  .sentiment-fill.is-dislike {
    background: linear-gradient(135deg, #cf8f86 0%, #dfb2ac 100%);
  }

  .chart-scroll {
    width: 100%;
    white-space: nowrap;
  }

  .chart-bars {
    display: flex;
    align-items: flex-end;
    gap: 10px;
    min-height: 220px;
    padding-top: 8px;
  }

  .chart-bars.is-daily {
    min-width: 1240px;
    padding-right: 12px;
  }

  .chart-bar-item {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }

  .chart-bars.is-daily .chart-bar-item {
    flex: 0 0 36px;
    min-width: 36px;
  }

  .chart-bar-value {
    min-height: 24px;
    font-size: 18px;
    color: #ef9172;
    font-weight: 700;
  }

  .chart-bar-track {
    width: 100%;
    height: 140px;
    display: flex;
    align-items: flex-end;
    justify-content: center;
  }

  .chart-bar-fill {
    width: 72%;
    min-height: 0;
    border-radius: 12px 12px 6px 6px;
    background: linear-gradient(180deg, #ef9172 0%, #f4b19d 100%);
  }

  .chart-bar-label {
    font-size: 18px;
    color: #866b60;
  }

  .chart-bar-count {
    font-size: 16px;
    color: #b8b3ac;
  }

  .rank-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 0;
    border-top: 1px solid rgba(217, 242, 235, 0.76);
  }

  .rank-item:first-of-type {
    border-top: 0;
    padding-top: 0;
  }

  .rank-index {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(255, 245, 239, 0.92);
    color: #ef9172;
    font-size: 20px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .rank-name {
    flex: 1;
    min-width: 0;
    font-size: 24px;
    font-weight: 700;
    color: #5d433a;
    word-break: break-word;
  }

  .rank-count {
    flex-shrink: 0;
    font-size: 20px;
    color: #9aa7a0;
  }
}
</style>
