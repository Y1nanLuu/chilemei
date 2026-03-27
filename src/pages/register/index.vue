<template>
  <view class="mobile-shell register-page">
    <view class="screen-frame">
      <view class="welcome-card glass-card">
        <text class="welcome-tag">开发期登录</text>
        <text class="welcome-title">吃了没</text>
        <text class="welcome-copy">这里同时支持开发期账号密码登录，以及小程序环境下的微信授权登录。微信登录流程会先调用微信接口拿 code，再请求后端 POST /auth/wechat-login。</text>

        <view class="field">
          <text class="field-label">用户名</text>
          <input class="field-input" :value="form.username" placeholder="alice" @input="updateField('username', $event.detail.value)" />
        </view>

        <view class="field">
          <text class="field-label">密码</text>
          <input class="field-input" password :value="form.password" placeholder="123456" @input="updateField('password', $event.detail.value)" />
        </view>

        <view class="action-row">
          <view class="secondary-btn" @click="fillDemo">填充示例</view>
          <view class="enter-btn" @click="submitLogin">{{ loading ? '登录中...' : '登录并进入首页' }}</view>
        </view>

        <view class="wechat-btn" @click="submitWechatLogin">{{ loading ? '请稍候...' : '微信登录' }}</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import Taro, { useDidShow } from '@tarojs/taro'
import { reactive, ref } from 'vue'
import { login, wechatLogin } from '../../api/auth'
import { hasAccessToken, setAccessToken, setCurrentUser } from '../../utils/auth'

const form = reactive({
  username: '',
  password: '',
})
const loading = ref(false)

const updateField = (field: keyof typeof form, value: string) => {
  form[field] = value
}

const fillDemo = () => {
  form.username = 'alice'
  form.password = '123456'
}

const submitLogin = async () => {
  if (loading.value) {
    return
  }

  if (!form.username || !form.password) {
    Taro.showToast({ title: '请输入用户名和密码', icon: 'none' })
    return
  }

  try {
    loading.value = true
    const result = await login({
      username: form.username,
      password: form.password,
    })

    setAccessToken(result.access_token)
    setCurrentUser(result.user || null)
    Taro.showToast({ title: '登录成功', icon: 'success' })
    Taro.switchTab({ url: '/pages/index/index' })
  } catch (error) {
    const message = error instanceof Error ? error.message : '登录失败'
    Taro.showToast({ title: message, icon: 'none' })
  } finally {
    loading.value = false
  }
}

const submitWechatLogin = async () => {
  if (loading.value) {
    return
  }

  const env = Taro.getEnv()

  if (env !== Taro.ENV_TYPE.WEAPP) {
    Taro.showToast({ title: '微信登录仅支持小程序环境', icon: 'none' })
    return
  }

  try {
    loading.value = true
    const loginResult = await Taro.login()

    if (!loginResult.code) {
      Taro.showToast({ title: '未获取到微信 code', icon: 'none' })
      return
    }

    const result = await wechatLogin({ code: loginResult.code })
    setAccessToken(result.access_token)
    setCurrentUser(result.user || null)
    Taro.showToast({ title: '微信登录成功', icon: 'success' })
    Taro.switchTab({ url: '/pages/index/index' })
  } catch (error) {
    const message = error instanceof Error ? error.message : '微信登录失败'
    Taro.showToast({ title: message, icon: 'none' })
  } finally {
    loading.value = false
  }
}

useDidShow(() => {
  if (hasAccessToken()) {
    Taro.switchTab({ url: '/pages/index/index' })
  }
})
</script>

<style lang="scss">
.register-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at 82% 7%, rgba(255, 210, 195, 0.82), transparent 20%),
    radial-gradient(circle at 16% 12%, rgba(231, 252, 246, 0.94), transparent 24%),
    radial-gradient(circle at 52% 0%, rgba(255, 241, 233, 0.85), transparent 26%),
    linear-gradient(180deg, #f4fffd 0%, #f6fffb 24%, #fffaf6 58%, #fff2ea 100%);

  .welcome-card {
    padding: 28px;
    background: linear-gradient(180deg, rgba(255, 252, 247, 0.96) 0%, rgba(255, 242, 224, 0.96) 100%);
  }

  .preview-card {
    overflow: hidden;
    border-radius: 24px;
    background: #fff;
    box-shadow: 0 10px 22px rgba(132, 101, 73, 0.06);
    margin-bottom: 24px;
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

  .field {
    margin-bottom: 18px;
  }

  .field-label {
    display: block;
    font-size: 22px;
    font-weight: 600;
    margin-bottom: 10px;
  }

  .field-input {
    width: 100%;
    padding: 20px;
    border-radius: 20px;
    background: #fff;
    box-shadow: 0 16px 28px rgba(35, 74, 155, 0.08);
    font-size: 24px;
    box-sizing: border-box;
  }

  .action-row {
    display: flex;
    gap: 16px;
    margin-top: 24px;
  }

  .secondary-btn,
  .enter-btn {
    height: 92px;
    border-radius: 24px;
    font-size: 28px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
  }

  .secondary-btn {
    background: #eef4ff;
    color: var(--brand-600);
  }

  .enter-btn {
    background: linear-gradient(135deg, var(--brand-500) 0%, var(--peach-500) 100%);
    color: #fff;
    box-shadow: 0 8px 16px rgba(220, 154, 95, 0.12);
  }

  .wechat-btn {
    height: 92px;
    border-radius: 24px;
    font-size: 28px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 16px;
    background: #1aad19;
    color: #fff;
    box-shadow: 0 18px 30px rgba(26, 173, 25, 0.2);
  }
}
</style>
