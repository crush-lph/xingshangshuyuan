// Generated from Apifox export. Update through the Apifox document, not by hand.

import { api, type ApiBodyRequestOptions } from '@/shared/request'
import type { ApiResponse, EmptyObject } from './types'

export type CreateVipOrderPayload = EmptyObject

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
  order_no?: string
  status?: number | string
  status_text?: string
  pay_status?: number | string
  pay_status_text?: string
  is_paid?: boolean
  paid?: boolean
  vip_level?: number
  vip_level_text?: string
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
  const normalizedText = statusText.trim()

  if (data.is_paid || data.paid || rawStatus === 1 || rawStatus === '1' || normalizedText.includes('已支付')) {
    return { status: 'paid', message: normalizedText || '支付成功', data }
  }

  if (rawStatus === 2 || rawStatus === '2' || normalizedText.includes('取消')) {
    return { status: 'cancelled', message: normalizedText || '支付已取消', data }
  }

  if (rawStatus === -1 || rawStatus === 'failed' || rawStatus === 'fail' || normalizedText.includes('失败')) {
    return { status: 'failed', message: normalizedText || '支付失败', data }
  }

  return { status: 'pending', message: normalizedText || '支付结果确认中', data }
}

export async function queryVipPaymentStatus(orderNo: string) {
  const response = await queryVipPay({ order_no: orderNo })
  return normalizeVipPaymentStatus(response.data)
}
