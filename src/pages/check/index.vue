<template>
  <view class="mobile-shell detail-page">
    <view class="screen-frame">
      <view v-if="loading" class="info-card glass-card">加载中...</view>
      <view v-else-if="errorMessage" class="info-card glass-card">{{ errorMessage }}</view>
      <template v-else-if="record">
        <image class="cover-image glass-card" :src="coverImage" mode="aspectFill" />

        <view class="meta-row">
          <view class="author-card glass-card">
            <view class="author-avatar">{{ authorInitial }}</view>
            <view>
              <text class="author-name">{{ authorName }}</text>
              <text class="author-title">记录时间 {{ publishTime }}</text>
            </view>
          </view>
          <view class="score-card glass-card">
            <text class="score-value">{{ ratingLevelLabel }}</text>
            <view class="star-row">
              <text v-for="star in 5" :key="star">★</text>
            </view>
          </view>
        </view>

        <view class="headline-block">
          <text class="detail-title">{{ record.food.name }}</text>
          <text class="detail-subtitle">{{ record.food.location }} | RMB {{ record.food.price }}</text>
        </view>

        <view class="info-card glass-card">
          <text class="section-label">美食评价</text>
          <text class="body-copy">{{ record.review_text || '这条记录暂时没有文字评价。' }}</text>
        </view>

        <view class="info-card glass-card">
          <text class="section-label">记录标签</text>
          <view class="tag-row">
            <text class="detail-chip">{{ sentimentLabel }}</text>
            <text class="detail-chip">{{ ratingLevelLabel }}</text>
            <text class="detail-chip">food_id: {{ record.food_id }}</text>
            <text class="detail-chip">record_id: {{ record.id }}</text>
          </view>
        </view>

        <view class="info-card glass-card">
          <view class="action-grid">
            <view class="action-btn primary-btn" @click="toggleEditMode">
              {{ editMode ? '收起编辑' : '编辑记录' }}
            </view>
            <view class="action-btn secondary-btn" @click="handleReuseRecord">复用记录</view>
            <view class="action-btn danger-btn" @click="handleDeleteRecord">删除记录</view>
          </view>

          <view v-if="editMode" class="editor-panel">
            <text class="section-label">编辑记录</text>

            <view class="field">
              <text class="field-label">食物名称</text>
              <input class="field-input" :value="editForm.foodName" @input="handleFoodNameInput" />
            </view>

            <view class="field">
              <text class="field-label">位置</text>
              <input class="field-input" :value="editForm.location" @input="handleLocationInput" />
            </view>

            <view class="field">
              <text class="field-label">价格</text>
              <input class="field-input" type="digit" :value="editForm.price" @input="handlePriceInput" />
            </view>

            <view class="field">
              <text class="field-label">评价等级</text>
              <picker class="picker-box" mode="selector" :range="ratingLevels" :value="ratingLevelIndex" @change="onRatingLevelChange">
                {{ editForm.ratingLevel }}
              </picker>
            </view>

            <view class="field">
              <text class="field-label">情绪标签</text>
              <view class="tag-row">
                <view class="detail-chip selectable-chip" :class="{ active: editForm.sentiment === 'like' }" @click="updateEditForm('sentiment', 'like')">喜欢</view>
                <view class="detail-chip selectable-chip" :class="{ active: editForm.sentiment === 'dislike' }" @click="updateEditForm('sentiment', 'dislike')">劝退</view>
              </view>
            </view>

            <view class="field">
              <text class="field-label">food.image_url</text>
              <input class="field-input" :value="editForm.foodImageUrl" @input="handleFoodImageInput" />
            </view>

            <view class="field">
              <text class="field-label">record.image_url</text>
              <input class="field-input" :value="editForm.recordImageUrl" @input="handleRecordImageInput" />
            </view>

            <view class="field">
              <text class="field-label">评价内容</text>
              <textarea class="field-textarea" :value="editForm.reviewText" maxlength="300" @input="handleReviewTextInput" />
            </view>

            <view class="submit-btn" @click="handleUpdateRecord">保存修改</view>
          </view>
        </view>

        <view class="info-card glass-card">
          <view class="comment-head">
            <text class="section-label">评论区</text>
            <text class="comment-count">{{ comments.length }} 条</text>
          </view>
          <view class="comment-editor">
            <textarea
              class="comment-textarea"
              :value="commentDraft"
              maxlength="200"
              placeholder="写下你的评论"
              @input="handleCommentInput"
            />
            <view class="submit-btn" @click="handleCreateComment">发布评论</view>
          </view>
          <view v-if="comments.length === 0" class="empty-comments">暂时还没有评论</view>
          <view v-for="comment in comments" :key="comment.id" class="comment-item">
            <view class="comment-avatar">{{ getInitial(comment.user?.nickname || 'U') }}</view>
            <view class="comment-content">
              <view class="comment-meta">
                <text class="comment-user">{{ comment.user?.nickname || `用户 ${comment.user?.id || ''}` }}</text>
                <text class="comment-time">{{ formatDateTime(comment.created_at) }}</text>
              </view>
              <text class="comment-text">{{ comment.content }}</text>
            </view>
          </view>
        </view>
      </template>
      <view v-else class="info-card glass-card">没有找到对应记录</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import Taro, { useDidShow } from '@tarojs/taro'
import { computed, reactive, ref } from 'vue'
import {
  createFoodRecordComment,
  deleteFoodRecord,
  getFoodRecordComments,
  getFoodRecordDetail,
  getFoodRecords,
  reuseFoodRecord,
  updateFoodRecord,
} from '../../api/foods'
import type { FoodComment, FoodRecord, Sentiment, UpdateFoodRecordPayload } from '../../api/types'
import { hasAccessToken } from '../../utils/auth'
import { RATING_LEVEL_OPTIONS, type RatingLevelLabel, ratingLabelToValue, ratingLevelToLabel } from '../../utils/rating'

const route = Taro.getCurrentInstance().router?.params || {}
const recordId = route.id
const foodName = route.foodName ? decodeURIComponent(route.foodName) : ''
const location = route.location ? decodeURIComponent(route.location) : ''

const PLACEHOLDER_IMAGE = 'https://dummyimage.com/640x420/eaf1ff/7a90c2&text=Chilemei'

const record = ref<FoodRecord | null>(null)
const comments = ref<FoodComment[]>([])
const loading = ref(false)
const errorMessage = ref('')
const editMode = ref(false)
const commentDraft = ref('')

const ratingLevels = RATING_LEVEL_OPTIONS.map((item) => item.label)

const editForm = reactive({
  foodName: '',
  location: '',
  price: '',
  ratingLevel: '顶级' as RatingLevelLabel,
  sentiment: 'like' as Sentiment,
  foodImageUrl: '',
  recordImageUrl: '',
  reviewText: '',
})

const coverImage = computed(() => record.value?.image_url || record.value?.food.image_url || PLACEHOLDER_IMAGE)
const authorName = computed(() => record.value?.user?.nickname || `用户 ${record.value?.user_id || ''}`)
const authorInitial = computed(() => getInitial(authorName.value))
const publishTime = computed(() => formatDateTime(record.value?.uploaded_at))
const sentimentLabel = computed(() => (record.value?.sentiment === 'dislike' ? '劝退' : '喜欢'))
const ratingLevelLabel = computed(() => ratingLevelToLabel(record.value?.rating_level))
const ratingLevelIndex = computed(() => {
  const index = ratingLevels.findIndex((item) => item === editForm.ratingLevel)
  return index < 0 ? 0 : index
})

const getInitial = (value: string) => {
  return value.slice(0, 1).toUpperCase()
}

const formatDateTime = (value?: string) => {
  if (!value) {
    return '未知时间'
  }

  return value.replace('T', ' ').slice(0, 16)
}

const loadByFilters = async () => {
  const records = await getFoodRecords({
    food_name: foodName || undefined,
    location: location || undefined,
  })

  return records[0] || null
}

const syncEditForm = (targetRecord: FoodRecord) => {
  editForm.foodName = targetRecord.food.name
  editForm.location = targetRecord.food.location
  editForm.price = String(targetRecord.food.price)
  editForm.ratingLevel = ratingLevelToLabel(targetRecord.rating_level) as RatingLevelLabel
  editForm.sentiment = targetRecord.sentiment
  editForm.foodImageUrl = targetRecord.food.image_url || ''
  editForm.recordImageUrl = targetRecord.image_url || ''
  editForm.reviewText = targetRecord.review_text || ''
}

const updateEditForm = (field: keyof typeof editForm, value: string) => {
  editForm[field] = value as never
}

const onRatingLevelChange = (event) => {
  editForm.ratingLevel = (ratingLevels[event.detail.value] || ratingLevels[0]) as RatingLevelLabel
}

const toggleEditMode = () => {
  editMode.value = !editMode.value

  if (editMode.value && record.value) {
    syncEditForm(record.value)
  }
}

const getCurrentRecordId = () => {
  return record.value?.id
}

const loadData = async () => {
  if (!hasAccessToken()) {
    errorMessage.value = '请先登录后再查看记录详情。'
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    const targetRecord = recordId ? await getFoodRecordDetail(recordId) : await loadByFilters()

    if (!targetRecord) {
      record.value = null
      comments.value = []
      return
    }

    record.value = targetRecord
    syncEditForm(targetRecord)
    comments.value = await getFoodRecordComments(targetRecord.id)
  } catch (error) {
    const message = error instanceof Error ? error.message : '记录详情加载失败'
    errorMessage.value = message
    Taro.showToast({
      title: message,
      icon: 'none',
    })
  } finally {
    loading.value = false
  }
}

const handleCreateComment = async () => {
  const currentRecordId = getCurrentRecordId()

  if (!currentRecordId) {
    return
  }

  if (!commentDraft.value.trim()) {
    Taro.showToast({ title: '请输入评论内容', icon: 'none' })
    return
  }

  try {
    await createFoodRecordComment(currentRecordId, {
      content: commentDraft.value.trim(),
    })

    commentDraft.value = ''
    comments.value = await getFoodRecordComments(currentRecordId)
    Taro.showToast({ title: '评论已发布', icon: 'success' })
  } catch (error) {
    const message = error instanceof Error ? error.message : '评论发布失败'
    Taro.showToast({ title: message, icon: 'none' })
  }
}

const handleCommentInput = (event) => {
  commentDraft.value = event.detail.value
}

const handleFoodNameInput = (event) => {
  updateEditForm('foodName', event.detail.value)
}

const handleLocationInput = (event) => {
  updateEditForm('location', event.detail.value)
}

const handlePriceInput = (event) => {
  updateEditForm('price', event.detail.value)
}

const handleFoodImageInput = (event) => {
  updateEditForm('foodImageUrl', event.detail.value)
}

const handleRecordImageInput = (event) => {
  updateEditForm('recordImageUrl', event.detail.value)
}

const handleReviewTextInput = (event) => {
  updateEditForm('reviewText', event.detail.value)
}

const buildUpdatePayload = (): UpdateFoodRecordPayload | null => {
  if (!editForm.foodName || !editForm.location || !editForm.price) {
    return null
  }

  return {
    food: {
      name: editForm.foodName,
      location: editForm.location,
      price: Number(editForm.price),
      ...(editForm.foodImageUrl ? { image_url: editForm.foodImageUrl } : {}),
    },
    sentiment: editForm.sentiment,
    rating_level: ratingLabelToValue(editForm.ratingLevel),
    review_text: editForm.reviewText,
    ...(editForm.recordImageUrl ? { image_url: editForm.recordImageUrl } : {}),
  }
}

const handleUpdateRecord = async () => {
  const currentRecordId = getCurrentRecordId()
  const payload = buildUpdatePayload()

  if (!currentRecordId || !payload) {
    Taro.showToast({ title: '请补全编辑信息', icon: 'none' })
    return
  }

  try {
    record.value = await updateFoodRecord(currentRecordId, payload)
    editMode.value = false
    Taro.showToast({ title: '记录已更新', icon: 'success' })
  } catch (error) {
    const message = error instanceof Error ? error.message : '记录更新失败'
    Taro.showToast({ title: message, icon: 'none' })
  }
}

const handleDeleteRecord = async () => {
  const currentRecordId = getCurrentRecordId()

  if (!currentRecordId) {
    return
  }

  try {
    await deleteFoodRecord(currentRecordId)
    Taro.showToast({ title: '记录已删除', icon: 'success' })
    setTimeout(() => {
      Taro.navigateBack()
    }, 400)
  } catch (error) {
    const message = error instanceof Error ? error.message : '记录删除失败'
    Taro.showToast({ title: message, icon: 'none' })
  }
}

const handleReuseRecord = async () => {
  const currentRecordId = getCurrentRecordId()

  if (!currentRecordId) {
    return
  }

  try {
    const newRecord = await reuseFoodRecord(currentRecordId)
    Taro.showToast({ title: '已复用为新记录', icon: 'success' })
    Taro.redirectTo({
      url: `/pages/check/index?id=${newRecord.id}`,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : '记录复用失败'
    Taro.showToast({ title: message, icon: 'none' })
  }
}

useDidShow(() => {
  void loadData()
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

  .author-avatar,
  .comment-avatar {
    width: 58px;
    height: 58px;
    border-radius: 50%;
    background: linear-gradient(135deg, #2f6bff 0%, #7dbbff 100%);
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
  .comment-count,
  .empty-comments {
    font-size: 18px;
    color: var(--ink-500);
  }

  .score-card {
    width: 132px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .score-value {
    font-size: 28px;
    font-weight: 700;
    color: var(--brand-600);
    margin-bottom: 8px;
  }

  .star-row {
    color: #ffb648;
    font-size: 18px;
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

  .selectable-chip.active {
    background: linear-gradient(135deg, #2f6bff 0%, #7dbbff 100%);
    color: #fff;
  }

  .action-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
    margin-bottom: 18px;
  }

  .action-btn,
  .submit-btn {
    min-height: 78px;
    padding: 0 18px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    font-weight: 700;
  }

  .primary-btn,
  .submit-btn {
    background: linear-gradient(135deg, #2f6bff 0%, #7dbbff 100%);
    color: #fff;
  }

  .secondary-btn {
    background: #eef4ff;
    color: var(--brand-600);
  }

  .danger-btn {
    background: #fff1f1;
    color: #cc3f48;
  }

  .editor-panel,
  .comment-editor {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .field-label {
    font-size: 20px;
    color: var(--ink-500);
  }

  .field-input,
  .field-textarea,
  .picker-box,
  .comment-textarea {
    width: 100%;
    box-sizing: border-box;
    border-radius: 18px;
    border: 1px solid #d9e6ff;
    background: #f8fbff;
    padding: 18px;
    font-size: 22px;
    color: var(--ink-700);
  }

  .field-textarea,
  .comment-textarea {
    min-height: 140px;
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
