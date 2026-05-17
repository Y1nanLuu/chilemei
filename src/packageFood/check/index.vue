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
          <text class="section-label">食物标签</text>
          <view class="tag-row">
            <text v-for="tag in recordTagChips" :key="tag" class="detail-chip">{{ tag }}</text>
            <text v-if="!recordTagChips.length" class="tag-empty">暂无标签</text>
          </view>
        </view>

        <view class="info-card glass-card">
          <view class="action-grid">
            <view class="action-btn primary-btn" @click="toggleEditMode">
              {{ editMode ? '收起编辑' : '编辑记录' }}
            </view>
            <view class="action-btn danger-btn" @click="handleDeleteRecord">删除记录</view>
          </view>

          <view v-if="editMode" class="editor-panel publish-like-editor">
            <text class="section-label editor-title">编辑记录</text>

            <view class="field">
              <text class="field-label">食物名称</text>
              <input
                class="field-input"
                :value="editForm.foodName"
                placeholder="今天吃了什么？"
                @input="handleFoodNameInput"
              />
            </view>

            <view class="field">
              <text class="field-label">餐厅</text>
              <input
                class="field-input"
                :value="editForm.location"
                placeholder="在哪里吃的？"
                @input="handleLocationInput"
              />
            </view>

            <view class="field">
              <text class="field-label">价格</text>
              <input
                class="field-input"
                type="digit"
                :value="editForm.price"
                placeholder="花了多少钱？"
                @input="handlePriceInput"
              />
            </view>

            <view class="field">
              <text class="field-label">评分</text>
              <picker class="picker-box" mode="selector" :range="ratingLevels" :value="ratingLevelIndex" @change="onRatingLevelChange">
                {{ editForm.ratingLevel }}
              </picker>
            </view>

            <view class="field mood-field">
              <text class="field-label">心情</text>
              <view class="mood-row">
                <view
                  class="mood-option"
                  :class="{ active: editForm.sentiment === 'like' }"
                  @click="updateEditForm('sentiment', 'like')"
                >
                  <text class="mood-icon mood-icon--like">♥</text>
                </view>
                <view
                  class="mood-option"
                  :class="{ active: editForm.sentiment === 'dislike' }"
                  @click="updateEditForm('sentiment', 'dislike')"
                >
                  <text class="mood-icon mood-icon--dislike">✖</text>
                </view>
              </view>
            </view>

            <view class="field">
              <text class="field-label">描述</text>
              <textarea
                class="field-textarea"
                :value="editForm.reviewText"
                maxlength="300"
                placeholder="这顿饭让你印象最深的是什么？"
                @input="handleReviewTextInput"
              />
            </view>

            <view class="field tag-field">
              <view class="field-head">
                <text class="field-label">添加标签</text>
                <view
                  class="mini-action-btn"
                  :class="{ disabled: tagExtracting }"
                  @tap.stop="generateAiTags"
                >
                  {{ tagExtracting ? '生成中...' : 'AI 智能生成' }}
                </view>
              </view>
              <view class="tag-input-row">
                <input
                  class="tag-input"
                  :value="tagInput"
                  confirm-type="done"
                  placeholder="输入标签，例如 香辣、宵夜"
                  @input="handleTagInput"
                  @confirm="addTagFromInput"
                />
                <view class="tag-add-btn" @tap.stop="addTagFromInput">添加</view>
              </view>
              <view class="edit-tag-chip-row">
                <view v-for="tag in editTags" :key="tag" class="edit-tag-chip">
                  <text class="edit-tag-text">{{ tag }}</text>
                  <text class="edit-tag-remove" @tap.stop="removeEditTag(tag)">×</text>
                </view>
                <text v-if="!editTags.length" class="tag-empty">暂无标签，可以手动添加或让 AI 生成</text>
              </view>
            </view>

            <view class="field">
              <view class="field-head">
                <text class="field-label">记录图片</text>
                <view v-if="editForm.recordImageUrl" class="field-link" @tap.stop="clearEditRecordImage">移除</view>
              </view>
              <view class="image-picker" @tap.stop="pickEditRecordImage">
                <image v-if="editPreviewUrl" class="preview-image" :src="editPreviewUrl" mode="aspectFill" />
                <view v-else class="placeholder">
                  <text class="placeholder-text">{{ editImagePlaceholderText }}</text>
                </view>
              </view>
            </view>

            <view class="ai-image-action" @tap.stop="handleAiImageClick">
              {{ aiImageButtonText }}
            </view>

            <view class="submit-btn edit-submit-btn" @tap.stop="handleUpdateRecord">保存修改</view>
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
  createSeedreamFoodImage,
  deleteFoodRecord,
  deleteUploadedImage,
  extractFoodTags,
  getFoodRecordComments,
  getFoodRecordDetail,
  getFoodRecords,
  updateFoodRecord,
  uploadFoodImage,
} from '@/api/foods'
import type { FoodComment, FoodRecord, FoodTagExtraction, Sentiment, UpdateFoodRecordPayload } from '@/api/types'
import { hasAccessToken } from '@/utils/auth'
import { getFoodTagChips } from '@/utils/food-tags'
import { RATING_LEVEL_OPTIONS, type RatingLevelLabel, ratingLabelToValue, ratingLevelToLabel } from '@/utils/rating'
import { getMediaUrl } from '@/utils/request'

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
const tagInput = ref('')
const editTags = ref<string[]>([])
const editFoodTagsDraft = ref<FoodTagExtraction | null>(null)
const tagExtracting = ref(false)
const imageUploading = ref(false)
const aiImageProcessing = ref(false)
const editTempImageFileIds = ref<string[]>([])

const ratingLevels = RATING_LEVEL_OPTIONS.map((item) => item.label)

const editForm = reactive({
  foodName: '',
  location: '',
  price: '',
  ratingLevel: '顶级' as RatingLevelLabel,
  sentiment: 'like' as Sentiment,
  foodImageUrl: '',
  recordImageUrl: '',
  recordImageFilename: '',
  recordImageFileId: '',
  reviewText: '',
})

const coverImage = computed(() => {
  const imageUrl = record.value?.image_url || record.value?.food.image_url
  return imageUrl ? getMediaUrl(imageUrl) : PLACEHOLDER_IMAGE
})
const authorName = computed(() => record.value?.user?.nickname || `用户 ${record.value?.user_id || ''}`)
const authorInitial = computed(() => getInitial(authorName.value))
const publishTime = computed(() => formatDateTime(record.value?.uploaded_at))
const ratingLevelLabel = computed(() => ratingLevelToLabel(record.value?.rating_level))
const recordTagChips = computed(() => getFoodTagChips(record.value?.food_tags, 8))
const editPreviewUrl = computed(() => getMediaUrl(editForm.recordImageUrl))
const editImagePlaceholderText = computed(() => {
  if (aiImageProcessing.value) {
    return 'AI 正在处理图片...'
  }

  if (imageUploading.value) {
    return '上传中...'
  }

  return '点击上传本次记录图片'
})
const aiImageButtonText = computed(() => {
  if (aiImageProcessing.value) {
    return editForm.recordImageUrl ? 'AI 美化中...' : 'AI 生图中...'
  }

  return editForm.recordImageUrl ? 'AI 智能美化' : 'AI 智能生图'
})
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

const normalizeEditTag = (tag: string) => tag.trim().replace(/^#/, '').slice(0, 12)

const getTagChipsFromExtraction = (tags: FoodTagExtraction) => {
  return Array.from(new Set([
    ...(tags.recommendation_tags || []),
    ...(tags.taste_preferences || []),
    ...(tags.cuisines || []),
    ...(tags.ingredients || []),
    ...(tags.seasonings || []),
    ...(tags.cooking_methods || []),
    ...(tags.texture_tags || []),
    ...(tags.scenario_tags || []),
    ...(tags.health_tags || []),
    tags.has_chili ? `辣度${tags.chili_level}` : '',
    tags.has_sichuan_pepper ? '花椒' : '',
    tags.delicious_level >= 4 ? '高好评' : '',
  ].map((tag) => normalizeEditTag(tag)).filter(Boolean))).slice(0, 16)
}

const buildFoodTagsFallback = (): FoodTagExtraction => {
  const ratingLevel = ratingLabelToValue(editForm.ratingLevel)
  const deliciousLevel = editForm.sentiment === 'dislike'
    ? Math.min(3, ratingLevel)
    : ratingLevel

  return {
    taste_preferences: [],
    taboo_candidates: [],
    cuisines: [],
    ingredients: [],
    seasonings: [],
    cooking_methods: [],
    texture_tags: [],
    scenario_tags: [],
    recommendation_tags: [
      editForm.sentiment === 'dislike' ? '劝退' : '喜欢',
      `评分${ratingLevel}`,
    ],
    chili_level: 0,
    has_chili: false,
    has_sichuan_pepper: false,
    delicious_level: deliciousLevel,
    health_tags: [],
    summary: editForm.foodName.trim(),
  }
}

const filterTagsBySelection = (
  tags: FoodTagExtraction,
  selectedTags: string[],
): FoodTagExtraction => {
  const selectedSet = new Set(selectedTags)
  const filterList = (items: string[]) => items.filter((item) => selectedSet.has(normalizeEditTag(item)))

  return {
    ...tags,
    taste_preferences: filterList(tags.taste_preferences),
    taboo_candidates: filterList(tags.taboo_candidates),
    cuisines: filterList(tags.cuisines),
    ingredients: filterList(tags.ingredients),
    seasonings: filterList(tags.seasonings),
    cooking_methods: filterList(tags.cooking_methods),
    texture_tags: filterList(tags.texture_tags),
    scenario_tags: filterList(tags.scenario_tags),
    health_tags: filterList(tags.health_tags),
    recommendation_tags: selectedTags,
  }
}

const buildEditFoodTags = () => {
  const baseTags = editFoodTagsDraft.value || buildFoodTagsFallback()
  return filterTagsBySelection(baseTags, editTags.value)
}

const syncEditForm = (targetRecord: FoodRecord) => {
  editForm.foodName = targetRecord.food.name
  editForm.location = targetRecord.food.location
  editForm.price = String(targetRecord.food.price)
  editForm.ratingLevel = ratingLevelToLabel(targetRecord.rating_level) as RatingLevelLabel
  editForm.sentiment = targetRecord.sentiment
  editForm.foodImageUrl = targetRecord.food.image_url || ''
  editForm.recordImageUrl = targetRecord.image_url || ''
  editForm.recordImageFilename = targetRecord.image_url?.split('/').pop() || ''
  editForm.recordImageFileId = targetRecord.image_url || ''
  editForm.reviewText = targetRecord.review_text || ''
  editFoodTagsDraft.value = targetRecord.food_tags || null
  editTags.value = targetRecord.food_tags ? getTagChipsFromExtraction(targetRecord.food_tags) : []
  tagInput.value = ''
  editTempImageFileIds.value = []
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

const handleTagInput = (event) => {
  tagInput.value = event.detail.value
}

const addEditTag = (rawTag: string) => {
  const tag = normalizeEditTag(rawTag)

  if (!tag || editTags.value.includes(tag)) {
    return
  }

  editTags.value = [...editTags.value, tag].slice(0, 16)
}

const addTagFromInput = (event?: { detail?: { value?: string } }) => {
  const nextValue = event?.detail?.value || tagInput.value

  nextValue
    .split(/[,\s，、]+/)
    .map((tag) => tag.trim())
    .filter(Boolean)
    .forEach(addEditTag)
  tagInput.value = ''
}

const removeEditTag = (tag: string) => {
  editTags.value = editTags.value.filter((item) => item !== tag)
}

const extractEditFoodTags = async () => {
  tagExtracting.value = true
  Taro.showLoading({
    title: '提取标签中',
    mask: true,
  })

  try {
    return await extractFoodTags({
      foodName: editForm.foodName.trim(),
      location: editForm.location.trim(),
      reviewText: editForm.reviewText.trim(),
      sentiment: editForm.sentiment,
      ratingLevel: ratingLabelToValue(editForm.ratingLevel),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : '标签提取失败'
    Taro.showToast({ title: `${message}，已使用基础标签`, icon: 'none' })
    return buildFoodTagsFallback()
  } finally {
    tagExtracting.value = false
    Taro.hideLoading()
  }
}

const generateAiTags = async () => {
  if (tagExtracting.value) {
    return
  }

  if (!editForm.foodName.trim()) {
    Taro.showToast({ title: '请先输入食物名称', icon: 'none' })
    return
  }

  const tags = await extractEditFoodTags()
  editFoodTagsDraft.value = tags
  editTags.value = getTagChipsFromExtraction(tags)
  Taro.showToast({ title: '标签已生成', icon: 'none' })
}

const cleanupTempImage = async (fileId?: string) => {
  if (!fileId || !editTempImageFileIds.value.includes(fileId)) {
    return
  }

  try {
    await deleteUploadedImage(fileId)
    editTempImageFileIds.value = editTempImageFileIds.value.filter((item) => item !== fileId)
  } catch {
    // Temp image cleanup is best-effort.
  }
}

const pickEditRecordImage = async () => {
  const previousImageFileId = editForm.recordImageFileId

  try {
    const chooseRes = await Taro.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
    })

    const tempFilePath = chooseRes.tempFiles?.[0]?.tempFilePath

    if (!tempFilePath) {
      Taro.showToast({ title: '未获取到图片', icon: 'none' })
      return
    }

    imageUploading.value = true
    const uploadRes = await uploadFoodImage(tempFilePath)
    editForm.recordImageUrl = uploadRes.image_url
    editForm.recordImageFilename = uploadRes.image_filename || uploadRes.stored_path.split('/').pop() || uploadRes.image_url.split('/').pop() || ''
    editForm.recordImageFileId = uploadRes.file_id || uploadRes.image_url
    editTempImageFileIds.value = Array.from(new Set([...editTempImageFileIds.value, editForm.recordImageFileId]))

    if (previousImageFileId && previousImageFileId !== editForm.recordImageFileId) {
      await cleanupTempImage(previousImageFileId)
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : '上传失败'
    Taro.showToast({ title: message, icon: 'none' })
  } finally {
    imageUploading.value = false
  }
}

const clearEditRecordImage = async () => {
  const previousImageFileId = editForm.recordImageFileId
  editForm.recordImageUrl = ''
  editForm.recordImageFilename = ''
  editForm.recordImageFileId = ''
  await cleanupTempImage(previousImageFileId)
}

const getEditRecordImageSource = () => {
  if (!editForm.recordImageUrl) {
    return {}
  }

  if (
    editForm.recordImageFileId &&
    /^(cloud|http):\/\//.test(editForm.recordImageFileId)
  ) {
    return {
      sourceImageFileId: editForm.recordImageFileId,
    }
  }

  return {
    sourceImageUrl: getMediaUrl(editForm.recordImageUrl),
  }
}

const applyAiFoodImage = async () => {
  if (aiImageProcessing.value) {
    return
  }

  const previousImageFileId = editForm.recordImageFileId
  const source = getEditRecordImageSource()
  const loadingTitle = editForm.recordImageUrl ? '正在美化图片' : '正在生成图片'

  aiImageProcessing.value = true
  Taro.showLoading({
    title: loadingTitle,
    mask: true,
  })

  try {
    const imageRes = await createSeedreamFoodImage({
      foodName: editForm.foodName.trim(),
      location: editForm.location.trim(),
      reviewText: editForm.reviewText.trim(),
      ...source,
    })

    editForm.recordImageUrl = imageRes.image_url
    editForm.recordImageFilename = imageRes.image_filename || imageRes.stored_path.split('/').pop() || imageRes.image_url.split('/').pop() || ''
    editForm.recordImageFileId = imageRes.file_id || imageRes.image_url
    editTempImageFileIds.value = Array.from(new Set([...editTempImageFileIds.value, editForm.recordImageFileId]))

    if (previousImageFileId && previousImageFileId !== editForm.recordImageFileId) {
      await cleanupTempImage(previousImageFileId)
    }
  } finally {
    aiImageProcessing.value = false
    Taro.hideLoading()
  }
}

const handleAiImageClick = async () => {
  if (!editForm.foodName.trim()) {
    Taro.showToast({ title: '请先输入食物名称', icon: 'none' })
    return
  }

  try {
    await applyAiFoodImage()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'AI 图片处理失败'
    Taro.showToast({ title: message, icon: 'none' })
  }
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
    image_url: editForm.recordImageUrl,
    ...(editForm.recordImageFilename ? { image_filename: editForm.recordImageFilename } : {}),
    food_tags: buildEditFoodTags(),
  }
}

const handleUpdateRecord = async () => {
  const currentRecordId = getCurrentRecordId()
  const payload = buildUpdatePayload()

  if (tagExtracting.value || imageUploading.value || aiImageProcessing.value) {
    return
  }

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

useDidShow(() => {
  void loadData()
})
</script>

<style lang="scss">
.detail-page {
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
    background: linear-gradient(135deg, var(--brand-500) 0%, var(--peach-500) 100%);
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
  .empty-comments,
  .tip-text {
    font-size: 18px;
    color: var(--ink-500);
  }

  .score-card {
    width: 112px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .score-value {
    font-size: 34px;
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
    align-items: center;
  }

  .detail-chip {
    padding: 10px 16px;
    border-radius: 999px;
    background: #fff3eb;
    color: #ef9172;
    font-size: 20px;
    font-weight: 700;
  }

  .tag-empty {
    color: #9aa7a0;
    font-size: 20px;
  }

  .selectable-chip.active {
    background: linear-gradient(135deg, #2f6bff 0%, #7dbbff 100%);
    color: #fff;
  }

  .action-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
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
    background: linear-gradient(135deg, #ef9172 0%, #f4b19d 100%);
    color: #fff;
    box-shadow: 0 8px 20px rgba(239, 145, 114, 0.24);
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

  .publish-like-editor {
    gap: 22px;
    padding: 20px 0 0;
    border-top: 1px solid rgba(217, 242, 235, 0.76);
  }

  .editor-title {
    margin-bottom: 0;
    color: #5d433a;
    font-size: 26px;
    font-weight: 800;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .field-label {
    display: block;
    font-size: 26px;
    font-weight: 700;
    color: #5e4a42;
  }

  .field-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }

  .field-head .field-label {
    margin-bottom: 0;
  }

  .field-link {
    flex-shrink: 0;
    color: #ef9172;
    font-size: 20px;
    font-weight: 700;
  }

  .field-input,
  .field-textarea,
  .picker-box {
    width: 100%;
    box-sizing: border-box;
    min-height: 96px;
    border-radius: 24px;
    border: 1px solid rgba(217, 242, 235, 0.88);
    background: rgba(255, 255, 255, 0.92);
    box-shadow: 0 12px 28px rgba(186, 223, 215, 0.16);
    color: #5d433a;
    font-size: 26px;
    outline: none;
  }

  .field-input,
  .picker-box {
    height: 96px;
    padding: 0 24px;
    line-height: 96px;
    font-weight: 500;
  }

  .field-textarea {
    min-height: 240px;
    padding: 24px;
    line-height: 1.6;
    resize: none;
    font-weight: 400;
  }

  .mini-action-btn,
  .tag-add-btn,
  .ai-image-action {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 56px;
    padding: 0 20px;
    border-radius: 18px;
    background: rgba(255, 245, 239, 0.92);
    color: #c45c48;
    font-size: 21px;
    font-weight: 700;
    line-height: 1.2;
  }

  .mini-action-btn.disabled {
    opacity: 0.62;
  }

  .tag-input-row {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
  }

  .tag-input {
    flex: 1;
    min-width: 0;
    height: 76px;
    padding: 0 22px;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.92);
    border: 1px solid rgba(217, 242, 235, 0.88);
    box-shadow: 0 10px 22px rgba(186, 223, 215, 0.12);
    color: #5d433a;
    font-size: 24px;
    line-height: 76px;
    box-sizing: border-box;
  }

  .edit-tag-chip-row {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    min-height: 54px;
    align-items: center;
  }

  .edit-tag-chip {
    display: inline-flex;
    align-items: center;
    max-width: 100%;
    min-height: 54px;
    padding: 0 10px 0 18px;
    border-radius: 999px;
    background: rgba(255, 245, 239, 0.92);
    border: 1px solid rgba(239, 145, 114, 0.2);
    color: #b86b52;
    box-sizing: border-box;
  }

  .edit-tag-text {
    max-width: 220px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 22px;
    font-weight: 700;
    line-height: 1.25;
  }

  .edit-tag-remove {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 42px;
    height: 42px;
    margin-left: 4px;
    color: #d6755e;
    font-size: 28px;
    font-weight: 700;
    line-height: 1;
  }

  .image-picker {
    width: 100%;
    height: 420px;
    border-radius: 28px;
    background: rgba(255, 255, 255, 0.92);
    border: 1px solid rgba(217, 242, 235, 0.88);
    box-shadow: 0 12px 28px rgba(186, 223, 215, 0.16);
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .preview-image {
    width: 100%;
    height: 100%;
  }

  .placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    color: #9e9084;
  }

  .placeholder-text {
    font-size: 24px;
  }

  .ai-image-action {
    width: 100%;
    height: 76px;
    border-radius: 20px;
    background: linear-gradient(135deg, #79cfb5 0%, #ef9172 100%);
    color: #fff;
    font-size: 25px;
    box-shadow: 0 8px 18px rgba(121, 207, 181, 0.22);
    box-sizing: border-box;
  }

  .comment-textarea {
    min-height: 140px;
  }

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

  .mood-row {
    display: flex;
    gap: 16px;
  }

  .mood-option {
    flex: 1;
    height: 92px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.82);
    border: 1px solid rgba(217, 242, 235, 0.88);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #9e9084;
  }

  .mood-icon {
    line-height: 1;
    color: #b8b3ac;
  }

  .mood-icon--like {
    font-size: 58px;
  }

  .mood-icon--dislike {
    font-size: 44px;
  }

  .mood-option.active {
    background: linear-gradient(135deg, #ef9172 0%, #f4b19d 100%);
    color: #fff;
    border-color: transparent;
    box-shadow: 0 8px 16px rgba(239, 145, 114, 0.2);
  }

  .mood-option.active .mood-icon {
    color: #ffd86f;
  }

  .publish-like-editor .edit-submit-btn {
    width: 100%;
    height: 86px;
    min-height: 86px;
    border-radius: 22px;
    font-size: 28px;
    font-weight: 800;
    margin-top: 8px;
    padding: 0;
    box-sizing: border-box;
    background: linear-gradient(135deg, #ef9172 0%, #f4b19d 100%);
    color: #fff;
    box-shadow: 0 8px 20px rgba(239, 145, 114, 0.24);
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

  .tip-list {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .tip-item {
    display: flex;
    gap: 12px;
  }

  .tip-dot {
    width: 12px;
    height: 12px;
    margin-top: 10px;
    border-radius: 50%;
    background: var(--peach-500);
    flex-shrink: 0;
  }
}
</style>
