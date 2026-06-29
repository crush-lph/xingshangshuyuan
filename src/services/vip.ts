// Generated from Apifox export. Update through the Apifox document, not by hand.

import { api, type ApiBodyRequestOptions, type ApiRequestOptions } from '@/shared/request'
import type { ApiResponse } from './types'

export interface CreateVipOrderPayload {
  vip_level?: number
}

export interface CreateVipOrderData {
  order_id?: number
  order_no?: string
  vip_level?: number
  vip_level_text?: string
  amount?: string
  status?: number
  status_text?: string
  expire_at?: string
}

export type CreateVipOrderResponse = ApiResponse<CreateVipOrderData>

export function createVipOrder(
  data: CreateVipOrderPayload = {},
  options?: ApiBodyRequestOptions<CreateVipOrderPayload>
) {
  return api.post<CreateVipOrderResponse, CreateVipOrderPayload>('/api/vip/order', data, options)
}

export interface PayVipOrderPayload {
  order_no?: string
}

export interface PayVipOrderData {
  order_no?: string
  pay_method?: number
  pay_params?: {
    timeStamp?: string
    nonceStr?: string
    package?: string
    signType?: string
    paySign?: string
  }
}

export type PayVipOrderResponse = ApiResponse<PayVipOrderData>

export function payVipOrder(data: PayVipOrderPayload, options?: ApiBodyRequestOptions<PayVipOrderPayload>) {
  return api.post<PayVipOrderResponse, PayVipOrderPayload>('/api/vip/pay', data, options)
}

export interface QueryVipPayPayload {
  order_no?: string
}

export interface QueryVipPayData {
  order_id?: number
  order_no?: string
  status?: number | string
  status_text?: string
  pay_status?: number | string
  pay_status_text?: string
  is_paid?: boolean
  paid?: boolean
  vip_level?: number
  vip_level_text?: string
  amount?: string
  pay_time?: string
  transaction_id?: string
  expire_at?: string
}

export type QueryVipPayResponse = ApiResponse<QueryVipPayData>

export type VipPaymentStatus = 'pending' | 'paid' | 'failed' | 'cancelled'

export interface NormalizedVipPaymentStatus {
  status: VipPaymentStatus
  message: string
  data: QueryVipPayData
}

export function queryVipPay(data: QueryVipPayPayload, options?: ApiBodyRequestOptions<QueryVipPayPayload>) {
  return api.post<QueryVipPayResponse, QueryVipPayPayload>('/api/vip/query_pay', data, options)
}

export function normalizeVipPaymentStatus(data: QueryVipPayData): NormalizedVipPaymentStatus {
  const rawStatus = data.pay_status ?? data.status
  const statusText = data.pay_status_text ?? data.status_text ?? ''
  const normalizedRawStatus = typeof rawStatus === 'string' ? rawStatus.trim().toLowerCase() : rawStatus
  const normalizedText = statusText.trim()
  const normalizedLowerText = normalizedText.toLowerCase()
  const hasCancelledText =
    normalizedText.includes('取消') ||
    normalizedText.includes('已关闭') ||
    normalizedText.includes('关闭') ||
    normalizedLowerText.includes('cancel')
  const hasFailedText =
    normalizedText.includes('失败') ||
    normalizedText.includes('未成功') ||
    normalizedText.includes('不成功') ||
    normalizedText.includes('异常') ||
    normalizedText.includes('错误') ||
    normalizedLowerText.includes('fail') ||
    normalizedLowerText.includes('error')
  const hasPaidText =
    !hasCancelledText &&
    !hasFailedText &&
    (normalizedText.includes('已支付') || normalizedText.includes('支付成功') || normalizedText.includes('成功'))

  if (
    data.is_paid ||
    data.paid ||
    normalizedRawStatus === 1 ||
    normalizedRawStatus === '1' ||
    normalizedRawStatus === 'paid' ||
    normalizedRawStatus === 'success' ||
    normalizedRawStatus === 'succeeded' ||
    hasPaidText
  ) {
    return { status: 'paid', message: normalizedText || '支付成功', data }
  }

  if (
    normalizedRawStatus === 2 ||
    normalizedRawStatus === '2' ||
    normalizedRawStatus === 'cancelled' ||
    normalizedRawStatus === 'canceled' ||
    normalizedRawStatus === 'cancel' ||
    normalizedRawStatus === 'closed' ||
    hasCancelledText
  ) {
    return { status: 'cancelled', message: normalizedText || '支付已取消', data }
  }

  if (
    normalizedRawStatus === -1 ||
    normalizedRawStatus === '-1' ||
    normalizedRawStatus === 'failed' ||
    normalizedRawStatus === 'fail' ||
    normalizedRawStatus === 'failure' ||
    normalizedRawStatus === 'error' ||
    hasFailedText
  ) {
    return { status: 'failed', message: normalizedText || '支付失败', data }
  }

  return { status: 'pending', message: normalizedText || '支付结果确认中', data }
}

export async function queryVipPaymentStatus(orderNo: string) {
  const response = await queryVipPay({ order_no: orderNo })
  return normalizeVipPaymentStatus(response.data)
}

export interface VipLevelPerk {
  perk_name?: string
  perk_icon?: string
}

export interface VipLevelItem {
  level?: number
  level_text?: string
  name?: string
  original_price?: string | number | null
  current_price?: string | number | null
  discount_rate?: number
  perks?: Array<VipLevelPerk | string>
}

export type GetVipLevelsData = VipLevelItem[]

export type GetVipLevelsResponse = ApiResponse<GetVipLevelsData>

export function getVipLevels(options?: ApiRequestOptions) {
  return api.get<GetVipLevelsResponse>('/api/user/vip/level-perks', options)
}
