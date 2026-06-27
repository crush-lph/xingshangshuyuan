// Generated from Apifox export. Update through the Apifox document, not by hand.

import { api, type ApiBodyRequestOptions } from '@/shared/request'
import type { ApiResponse } from './types'

export interface WxLoginPayload {
  code?: string
}

export interface WxLoginData {
  token?: string
  user_id?: number
  nickname?: string
  avatar?: string
  phone?: string
  is_new?: boolean
}

export type WxLoginResponse = ApiResponse<WxLoginData>

export function wxLogin(data: WxLoginPayload, options?: ApiBodyRequestOptions<WxLoginPayload>) {
  return api.post<WxLoginResponse, WxLoginPayload>('/api/auth/wx_login', data, options)
}

export interface BindPhonePayload {
  code?: string
}

export interface BindPhoneData {
  phone?: string
}

export type BindPhoneResponse = ApiResponse<BindPhoneData>

export function bindPhone(data: BindPhonePayload, options?: ApiBodyRequestOptions<BindPhonePayload>) {
  return api.post<BindPhoneResponse, BindPhonePayload>('/api/auth/bind_phone', data, options)
}

export interface PhoneLoginPayload {
  phone?: string
  sms_code?: string
}

export interface PhoneLoginData {
  token?: string
  user_id?: number
  nickname?: string
  avatar?: string
  phone?: string
  is_new?: boolean
}

export type PhoneLoginResponse = ApiResponse<PhoneLoginData>

export function phoneLogin(data: PhoneLoginPayload, options?: ApiBodyRequestOptions<PhoneLoginPayload>) {
  return api.post<PhoneLoginResponse, PhoneLoginPayload>('/api/auth/phone_login', data, options)
}

export interface SendSmsCodePayload {
  phone?: string
  scene?: string
}

export interface SendSmsCodeData {
  expire_in?: number
}

export type SendSmsCodeResponse = ApiResponse<SendSmsCodeData>

export function sendSmsCode(data: SendSmsCodePayload, options?: ApiBodyRequestOptions<SendSmsCodePayload>) {
  return api.post<SendSmsCodeResponse, SendSmsCodePayload>('/api/auth/sms_code', data, options)
}
