<template>
  <view class="mobile-shell preferences-page">
    <view class="screen-frame">
      <view v-if="loading" class="status-card glass-card">画像加载中...</view>
      <view v-else-if="errorMessage" class="status-card glass-card">{{ errorMessage }}</view>
      <template v-else>
        <view class="hero-card glass-card">
          <text class="hero-title">口味画像</text>
          <text class="hero-copy">管理偏爱口味、忌口和吃辣等级，让个性化推荐更贴近你。</text>
        </view>

        <view class="glass-card editor-card">
          <view class="section-head">
            <text class="section-title">偏爱口味</text>
            <text class="section-tip">支持直接点选，也支持输入自定义标签</text>
          </view>
          <view class="chip-row">
            <view
              v-for="tag in tasteSuggestions"
              :key="tag"
              class="suggestion-chip"
              :class="{ active: hasTag(form.taste_preferences, tag) }"
              @click="toggleTag('taste_preferences', tag)"
            >
              {{ tag }}
            </view>
          </view>
          <view class="input-row">
            <input
              class="field-input"
              :value="tasteInput"
              placeholder="例如：川菜、面食、酸辣"
              @input="tasteInput = $event.detail.value"
              @confirm="commitInputTag('taste_preferences')"
            />
            <view class="add-btn" @click="commitInputTag('taste_preferences')">添加</view>
          </view>
          <view v-if="form.taste_preferences.length" class="selected-row">
            <view v-for="tag in form.taste_preferences" :key="tag" class="selected-chip">
              <text>{{ tag }}</text>
              <text class="remove-mark" @click="removeTag('taste_preferences', tag)">×</text>
            </view>
          </view>
          <view v-else class="empty-copy">还没有设置偏爱口味</view>
        </view>

        <view class="glass-card editor-card">
          <view class="section-head">
            <text class="section-title">忌口清单</text>
            <text class="section-tip">这些内容会帮助推荐结果规避不适合的食物</text>
          </view>
          <view class="chip-row">
            <view
              v-for="tag in tabooSuggestions"
              :key="tag"
              class="suggestion-chip taboo-chip"
              :class="{ active: hasTag(form.taboo_list, tag) }"
              @click="toggleTag('taboo_list', tag)"
            >
              {{ tag }}
            </view>
          </view>
          <view class="input-row">
            <input
              class="field-input"
              :value="tabooInput"
              placeholder="例如：香菜、内脏、花生"
              @input="tabooInput = $event.detail.value"
              @confirm="commitInputTag('taboo_list')"
            />
            <view class="add-btn secondary" @click="commitInputTag('taboo_list')">添加</view>
          </view>
          <view v-if="form.taboo_list.length" class="selected-row">
            <view
              v-for="tag in form.taboo_list"
              :key="tag"
              class="selected-chip taboo-selected-chip"
            >
              <text>{{ tag }}</text>
              <text class="remove-mark" @click="removeTag('taboo_list', tag)">×</text>
            </view>
          </view>
          <view v-else class="empty-copy">当前没有设置忌口</view>
        </view>

        <view class="glass-card editor-card">
          <view class="section-head">
            <text class="section-title">吃辣等级</text>
            <text class="section-tip">0 为完全不辣，5 为无辣不欢</text>
          </view>
          <view class="spicy-panel">
            <text class="spicy-value">{{ spicyLabels[form.spicy_level] }}</text>
            <slider
              class="spicy-slider"
              :value="form.spicy_level"
              :min="0"
              :max="5"
              :step="1"
              :show-value="false"
              activeColor="#ef8f67"
              backgroundColor="#f6d7ca"
              block-color="#ffffff"
              block-size="22"
              @change="handleSpicyChange"
            />
            <view class="spicy-scale">
              <text v-for="(_, index) in spicyLabels" :key="index" class="spicy-scale-item">{{ index }}</text>
            </view>
          </view>
        </view>

        <view class="save-btn" @click="handleSave">
          {{ saving ? '保存中...' : '保存画像' }}
        </view>
      </template>
    </view>
  </view>
</template>

<script setup lang="ts">
import Taro, { useDidShow } from '@tarojs/taro'
import { reactive, ref } from 'vue'
import { getCurrentUser, updateUserPreferences } from '../../api/user'
import type { UserPreferenceProfile } from '../../api/types'
import { hasAccessToken } from '../../utils/auth'
import { markUserPreferencesUpdated } from '../../utils/preferences'

type PreferenceField = 'taste_preferences' | 'taboo_list'

const tasteSuggestions = ['川菜', '粤菜', '面食', '烧烤', '甜口', '酸辣', '清淡', '火锅']
const tabooSuggestions = ['香菜', '内脏', '花生', '海鲜', '乳制品', '葱姜蒜']
const spicyLabels = ['不吃辣', '微微辣', '小辣', '中辣', '很能吃辣', '无辣不欢']

const form = reactive<UserPreferenceProfile>({
  taste_preferences: [],
  taboo_list: [],
  spicy_level: 0,
})

const loading = ref(false)
const saving = ref(false)
const errorMessage = ref('')
const tasteInput = ref('')
const tabooInput = ref('')

const normalizeTags = (tags?: string[]) => {
  return Array.from(
    new Set(
      (tags || [])
        .map((tag) => tag.trim())
        .filter(Boolean),
    ),
  )
}

const syncForm = (profile?: Partial<UserPreferenceProfile>) => {
  form.taste_preferences = normalizeTags(profile?.taste_preferences)
  form.taboo_list = normalizeTags(profile?.taboo_list)
  form.spicy_level = Math.min(5, Math.max(0, Number(profile?.spicy_level ?? 0) || 0))
}

const loadProfile = async () => {
  if (!hasAccessToken()) {
    errorMessage.value = '请先登录后再编辑口味画像。'
    syncForm()
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    const user = await getCurrentUser()
    syncForm(user)
  } catch (error) {
    const message = error instanceof Error ? error.message : '画像加载失败'
    errorMessage.value = message
    Taro.showToast({ title: message, icon: 'none' })
  } finally {
    loading.value = false
  }
}

const hasTag = (list: string[], tag: string) => list.includes(tag)

const addTag = (field: PreferenceField, rawTag: string) => {
  const tag = rawTag.trim()
  if (!tag) {
    return
  }

  if (!form[field].includes(tag)) {
    form[field] = [...form[field], tag]
  }
}

const removeTag = (field: PreferenceField, tag: string) => {
  form[field] = form[field].filter((item) => item !== tag)
}

const toggleTag = (field: PreferenceField, tag: string) => {
  if (form[field].includes(tag)) {
    removeTag(field, tag)
    return
  }

  addTag(field, tag)
}

const commitInputTag = (field: PreferenceField) => {
  const rawValue = field === 'taste_preferences' ? tasteInput.value : tabooInput.value

  rawValue
    .split(/[,，、\s]+/)
    .map((tag) => tag.trim())
    .filter(Boolean)
    .forEach((tag) => addTag(field, tag))

  if (field === 'taste_preferences') {
    tasteInput.value = ''
    return
  }

  tabooInput.value = ''
}

const handleSpicyChange = (event: { detail: { value: number } }) => {
  form.spicy_level = Number(event.detail.value) || 0
}

const handleSave = async () => {
  if (!hasAccessToken()) {
    Taro.showToast({ title: '请先登录', icon: 'none' })
    return
  }

  if (saving.value) {
    return
  }

  saving.value = true

  try {
    const payload: UserPreferenceProfile = {
      taste_preferences: normalizeTags(form.taste_preferences),
      taboo_list: normalizeTags(form.taboo_list),
      spicy_level: Math.min(5, Math.max(0, form.spicy_level)),
    }

    const nextProfile = await updateUserPreferences(payload)
    syncForm(nextProfile)
    markUserPreferencesUpdated()
    Taro.showToast({ title: '口味画像已更新', icon: 'success' })
  } catch (error) {
    const message = error instanceof Error ? error.message : '保存失败'
    Taro.showToast({ title: message, icon: 'none' })
  } finally {
    saving.value = false
  }
}

useDidShow(() => {
  void loadProfile()
})
</script>

<style lang="scss">
.preferences-page {
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
    padding: 0 4px 30px;
  }

  .glass-card,
  .status-card,
  .hero-card,
  .editor-card {
    border-radius: 28px;
    background: rgba(255, 255, 255, 0.28);
    border: 1px solid rgba(255, 255, 255, 0.58);
    box-shadow: 0 8px 16px rgba(202, 221, 214, 0.08);
    backdrop-filter: blur(12px);
  }

  .status-card,
  .hero-card,
  .editor-card {
    padding: 22px;
    margin-bottom: 18px;
  }

  .hero-card {
    background: rgba(255, 255, 255, 0.36);
  }

  .hero-title {
    display: block;
    font-size: 34px;
    font-weight: 800;
    color: #5c4336;
    margin-bottom: 10px;
  }

  .hero-copy,
  .section-tip,
  .empty-copy {
    font-size: 22px;
    line-height: 1.6;
    color: #866b60;
  }

  .section-head {
    margin-bottom: 14px;
  }

  .section-title {
    display: block;
    font-size: 28px;
    font-weight: 700;
    color: #5c4336;
    margin-bottom: 6px;
  }

  .chip-row,
  .selected-row {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }

  .chip-row {
    margin-bottom: 16px;
  }

  .suggestion-chip,
  .selected-chip {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: 64px;
    padding: 0 20px;
    border-radius: 999px;
    font-size: 22px;
  }

  .suggestion-chip {
    color: #b46d4d;
    background: #fff7f1;
    border: 1px solid #f5d3c3;
  }

  .suggestion-chip.active {
    background: linear-gradient(135deg, #ef9172 0%, #f4b19d 100%);
    color: #fff;
    border-color: transparent;
  }

  .taboo-chip {
    color: #946260;
    background: #fff5f5;
    border-color: #f0d5d5;
  }

  .input-row {
    display: flex;
    gap: 12px;
    align-items: center;
    margin-bottom: 16px;
  }

  .field-input {
    flex: 1;
    min-height: 84px;
    padding: 0 24px;
    border-radius: 22px;
    background: #fffdfa;
    border: 1px solid #f0ddd2;
    font-size: 24px;
    color: #5c4336;
  }

  .add-btn {
    width: 128px;
    min-height: 84px;
    border-radius: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #ef9172 0%, #f4b19d 100%);
    color: #fff;
    font-size: 24px;
    font-weight: 700;
  }

  .add-btn.secondary {
    background: linear-gradient(135deg, #cf8f86 0%, #dfb2ac 100%);
  }

  .selected-chip {
    color: #7f4f3f;
    background: #fff2e8;
  }

  .taboo-selected-chip {
    background: #fff1f1;
    color: #875f5e;
  }

  .remove-mark {
    font-size: 28px;
    line-height: 1;
  }

  .spicy-panel {
    padding-top: 6px;
  }

  .spicy-value {
    display: block;
    font-size: 30px;
    font-weight: 700;
    color: #ef8f67;
    margin-bottom: 18px;
  }

  .spicy-slider {
    margin: 0;
  }

  .spicy-scale {
    display: flex;
    justify-content: space-between;
    margin-top: 10px;
  }

  .spicy-scale-item {
    font-size: 20px;
    color: #aa8d80;
  }

  .save-btn {
    height: 92px;
    border-radius: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #ef9172 0%, #f4b19d 100%);
    color: #fff;
    font-size: 28px;
    font-weight: 800;
    box-shadow: 0 16px 30px rgba(239, 145, 114, 0.26);
  }
}
</style>
