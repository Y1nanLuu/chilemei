import type { LoginPayload, LoginResponse, WechatLoginPayload } from './types'
import { request } from '../utils/request'

export const login = (payload: LoginPayload) => {
  return request<LoginResponse, LoginPayload>({
    url: '/auth/login',
    method: 'POST',
    data: payload,
    withAuth: false,
  })
}

export const wechatLogin = (payload: WechatLoginPayload) => {
  return request<LoginResponse, WechatLoginPayload>({
    url: '/auth/wechat-login',
    method: 'POST',
    data: payload,
    withAuth: false,
  })
}
