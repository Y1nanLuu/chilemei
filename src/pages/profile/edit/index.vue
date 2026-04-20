<template>
  <view class="mobile-shell edit-profile-page">
    <view class="screen-frame">
      <view class="page-head">
        <text class="page-title">编辑资料</text>
      </view>

      <view v-if="loading" class="status-panel">加载中...</view>
      <view v-else-if="errorMessage" class="status-panel">{{ errorMessage }}</view>

      <template v-else>
        <view class="avatar-panel">
          <view class="avatar-wrap" @tap="chooseAvatar">
            <image v-if="avatarPreviewUrl" class="avatar-image" :src="avatarPreviewUrl" mode="aspectFill" />
            <text v-else class="avatar-initial">{{ avatarInitial }}</text>
          </view>
          <view class="avatar-action" @tap="chooseAvatar">修改头像</view>
        </view>

        <view class="form-section">
          <view class="field">
            <text class="field-label">昵称</text>
            <input
              class="field-input"
              :value="form.nickname"
              placeholder="请输入昵称"
              maxlength="24"
              @input="handleNicknameInput"
            />
          </view>

          <view class="field">
            <text class="field-label">简介</text>
            <textarea
              class="field-textarea"
              :value="form.bio"
              placeholder="写一句你的美食宣言"
              maxlength="255"
              @input="handleBioInput"
            />
          </view>

          <view class="field">
            <text class="field-label">性别</text>
            <picker
              class="field-input picker-field"
              mode="selector"
              :range="genderLabels"
              :value="genderIndex"
              @change="handleGenderChange"
            >
              {{ genderLabels[genderIndex] }}
            </picker>
          </view>

          <view class="field">
            <text class="field-label">年级</text>
            <picker
              class="field-input picker-field"
              mode="selector"
              :range="gradeLabels"
              :value="gradeIndex"
              @change="handleGradeChange"
            >
              {{ gradeLabels[gradeIndex] }}
            </picker>
          </view>

          <view class="field">
            <text class="field-label">校区</text>
            <picker
              class="field-input picker-field"
              mode="selector"
              :range="campusLabels"
              :value="campusIndex"
              @change="handleCampusChange"
            >
              {{ campusLabels[campusIndex] }}
            </picker>
          </view>
        </view>

        <view class="save-btn" @tap="submitProfile">
          {{ saving ? '保存中...' : '保存资料' }}
        </view>
      </template>
    </view>
  </view>
</template>

<script setup lang="ts">
import Taro, { useDidShow } from '@tarojs/taro'
import { computed, reactive, ref } from 'vue'
import { getCurrentUser, updateUserProfile } from '../../../api/user'
import type { UserCampus, UserGender, UserGrade, UserProfile } from '../../../api/types'
import { getCloudEnv } from '../../../utils/cloud'
import { getCurrentUser as getStoredCurrentUser, hasAccessToken, setCurrentUser } from '../../../utils/auth'
import { getMediaUrl } from '../../../utils/request'

const genderOptions: Array<{ label: string; value: UserGender }> = [
  { label: '保密', value: 'unknown' },
  { label: '男', value: 'male' },
  { label: '女', value: 'female' },
]

const gradeOptions: Array<{ label: string; value: UserGrade }> = [
  { label: '大一', value: 'freshman' },
  { label: '大二', value: 'sophomore' },
  { label: '大三', value: 'junior' },
  { label: '大四', value: 'senior' },
  { label: '研一', value: 'master_1' },
  { label: '研二', value: 'master_2' },
  { label: '研三', value: 'master_3' },
  { label: '博一', value: 'phd_1' },
  { label: '博二', value: 'phd_2' },
  { label: '博三', value: 'phd_3' },
  { label: '博四', value: 'phd_4' },
  { label: '博五', value: 'phd_5' },
  { label: '已毕业', value: 'graduated' },
]

const campusOptions: Array<{ label: string; value: UserCampus }> = [
  { label: '沙河', value: 'shahe' },
  { label: '海淀', value: 'haidian' },
]

const form = reactive({
  id: 0,
  nickname: '',
  bio: '',
  gender: 'unknown' as UserGender,
  grade: 'freshman' as UserGrade,
  campus: 'shahe' as UserCampus,
  avatar_url: '',
})

const loading = ref(false)
const saving = ref(false)
const errorMessage = ref('')

const genderLabels = computed(() => genderOptions.map((item) => item.label))
const gradeLabels = computed(() => gradeOptions.map((item) => item.label))
const campusLabels = computed(() => campusOptions.map((item) => item.label))

const genderIndex = computed(() => {
  const index = genderOptions.findIndex((item) => item.value === form.gender)
  return index < 0 ? 0 : index
})

const gradeIndex = computed(() => {
  const index = gradeOptions.findIndex((item) => item.value === form.grade)
  return index < 0 ? 0 : index
})

const campusIndex = computed(() => {
  const index = campusOptions.findIndex((item) => item.value === form.campus)
  return index < 0 ? 0 : index
})

const avatarPreviewUrl = computed(() => getMediaUrl(form.avatar_url))
const avatarInitial = computed(() => (form.nickname || 'C').slice(0, 1).toUpperCase())

const getWechatCloud = () => {
  return (globalThis as { wx?: { cloud?: any } }).wx?.cloud
}

const buildAvatarPath = (filePath: string) => {
  const ext = filePath.match(/\.([a-zA-Z0-9]+)(?:\?|$)/)?.[1]?.toLowerCase() || 'jpg'
  const filename = `avatar_${Date.now()}_${Math.random().toString(16).slice(2, 10)}.${ext}`
  return `media/users/${form.id}/${filename}`
}

const uploadAvatar = async (filePath: string) => {
  if (!form.id) {
    throw new Error('缺少用户 ID，无法上传头像')
  }

  const cloud = getWechatCloud()
  const cloudEnv = getCloudEnv()

  if (!cloud?.uploadFile || !cloudEnv) {
    throw new Error('缺少微信云存储上传配置')
  }

  const cloudPath = buildAvatarPath(filePath)

  await new Promise<{ fileID: string }>((resolve, reject) => {
    cloud.uploadFile({
      cloudPath,
      filePath,
      config: {
        env: cloudEnv,
      },
      success: (res) => resolve({ fileID: res.fileID }),
      fail: (error) => reject(new Error(error?.errMsg || '头像上传失败')),
    })
  })

  return `/${cloudPath}`
}

const syncForm = (profile: UserProfile) => {
  form.id = profile.id
  form.nickname = profile.nickname || ''
  form.bio = profile.bio || ''
  form.gender = profile.gender || 'unknown'
  form.grade = profile.grade || 'freshman'
  form.campus = profile.campus || 'shahe'
  form.avatar_url = profile.avatar_url || ''
}

const loadProfile = async () => {
  if (!hasAccessToken()) {
    errorMessage.value = '请先登录后再编辑资料。'
    return
  }

  const storedUser = getStoredCurrentUser()
  if (storedUser && !form.id) {
    form.id = storedUser.id
    form.nickname = storedUser.nickname || ''
    form.avatar_url = storedUser.avatar_url || ''
  }

  loading.value = !form.id
  errorMessage.value = ''

  try {
    const profile = await getCurrentUser()
    syncForm(profile)
  } catch (error) {
    const message = error instanceof Error ? error.message : '资料加载失败'
    if (!form.id) {
      errorMessage.value = message
    }
    Taro.showToast({ title: message, icon: 'none' })
  } finally {
    loading.value = false
  }
}

const handleNicknameInput = (event) => {
  form.nickname = event.detail.value
}

const handleBioInput = (event) => {
  form.bio = event.detail.value
}

const handleGenderChange = (event) => {
  form.gender = genderOptions[Number(event.detail.value)]?.value || 'unknown'
}

const handleGradeChange = (event) => {
  form.grade = gradeOptions[Number(event.detail.value)]?.value || 'freshman'
}

const handleCampusChange = (event) => {
  form.campus = campusOptions[Number(event.detail.value)]?.value || 'shahe'
}

const chooseAvatar = async () => {
  if (saving.value) {
    return
  }

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

    saving.value = true
    form.avatar_url = await uploadAvatar(tempFilePath)
    Taro.showToast({ title: '头像已上传', icon: 'success' })
  } catch (error) {
    const message = error instanceof Error ? error.message : '头像上传失败'
    Taro.showToast({ title: message, icon: 'none' })
  } finally {
    saving.value = false
  }
}

const submitProfile = async () => {
  if (saving.value) {
    return
  }

  if (!form.nickname.trim()) {
    Taro.showToast({ title: '请输入昵称', icon: 'none' })
    return
  }

  try {
    saving.value = true
    const profile = await updateUserProfile({
      nickname: form.nickname.trim(),
      bio: form.bio.trim(),
      gender: form.gender,
      grade: form.grade,
      campus: form.campus,
      ...(form.avatar_url ? { avatar_url: form.avatar_url } : {}),
    })

    setCurrentUser({
      id: profile.id,
      nickname: profile.nickname,
      avatar_url: profile.avatar_url || null,
    })
    Taro.showToast({ title: '资料已保存', icon: 'success' })
    setTimeout(() => {
      Taro.navigateBack()
    }, 350)
  } catch (error) {
    const message = error instanceof Error ? error.message : '资料保存失败'
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
.edit-profile-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at 78% 4%, rgba(255, 210, 195, 0.75), transparent 22%),
    radial-gradient(circle at 12% 18%, rgba(186, 236, 220, 0.55), transparent 28%),
    linear-gradient(180deg, #dff5ec 0%, #f6fffb 42%, #fffaf6 72%, #fff2ea 100%);

  &.mobile-shell {
    padding: 40px 30px 220px;
  }

  .page-head {
    margin-bottom: 28px;
  }

  .page-title {
    display: block;
    font-size: 42px;
    font-weight: 800;
    color: #5d433a;
  }

  .status-panel,
  .avatar-panel,
  .form-section {
    padding: 24px;
    border-radius: 24px;
    background: rgba(255, 255, 255, 0.72);
    border: 1px solid rgba(255, 255, 255, 0.92);
    backdrop-filter: blur(12px);
  }

  .status-panel {
    color: #6a6f6c;
    font-size: 24px;
  }

  .avatar-panel {
    display: flex;
    align-items: center;
    gap: 22px;
    margin-bottom: 22px;
  }

  .avatar-wrap {
    width: 128px;
    height: 128px;
    border-radius: 32px;
    overflow: hidden;
    background: #fff7f3;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .avatar-image {
    width: 100%;
    height: 100%;
  }

  .avatar-initial {
    color: #ef9172;
    font-size: 48px;
    font-weight: 800;
  }

  .avatar-action {
    min-height: 68px;
    padding: 0 26px;
    border-radius: 999px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fffaf8;
    background: linear-gradient(135deg, #ef9172 0%, #f4b19d 100%);
    font-size: 24px;
    font-weight: 700;
  }

  .form-section {
    margin-bottom: 26px;
  }

  .field + .field {
    margin-top: 24px;
  }

  .field-label {
    display: block;
    margin-bottom: 10px;
    color: #7f8a84;
    font-size: 22px;
    font-weight: 700;
  }

  .field-input {
    width: 100%;
    min-height: 82px;
    box-sizing: border-box;
    padding: 20px 22px;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.86);
    color: #5d433a;
    font-size: 26px;
  }

  .field-textarea {
    width: 100%;
    min-height: 150px;
    box-sizing: border-box;
    padding: 20px 22px;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.86);
    color: #5d433a;
    font-size: 26px;
    line-height: 1.5;
  }

  .picker-field {
    display: flex;
    align-items: center;
  }

  .save-btn {
    min-height: 92px;
    border-radius: 999px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fffaf8;
    background: linear-gradient(135deg, #ef9172 0%, #f4b19d 100%);
    font-size: 29px;
    font-weight: 800;
    box-shadow: 0 12px 28px rgba(239, 145, 114, 0.24);
  }
}
</style>
