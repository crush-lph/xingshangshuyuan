// Generated from Apifox export. Update through the Apifox document, not by hand.

import { api, type ApiRequestOptions, type ApiBodyRequestOptions } from '@/shared/request'
import { normalizeOrderPaymentStatus } from '@/shared/order-payment-status'
export { normalizeOrderPaymentStatus } from '@/shared/order-payment-status'
import type { ApiResponse, EmptyObject, QueryValue } from './types'

export interface GetOrderDetailQuery {
  order_no: QueryValue
}

export interface GetOrderDetailData {
  order_id?: number
  order_no?: string
  user_id?: number
  total_amount?: string
  discount_amount?: string
  pay_amount?: string
  status?: number
  status_text?: string
  pay_method?: number | null
  pay_time?: string | null
  remark?: string
  items?: Array<{
    product_id?: number
    product_name?: string
    spec_name?: string
    price?: string
    quantity?: number
    subtotal?: string
  }>
  created_at?: string
}

export type GetOrderDetailResponse = ApiResponse<GetOrderDetailData>

export function getOrderDetail(
  params: GetOrderDetailQuery,
  options?: Omit<ApiRequestOptions<GetOrderDetailQuery>, 'data'>
) {
  return api.get<GetOrderDetailResponse, GetOrderDetailQuery>('/api/order/detail', {
    ...options,
    data: params
  })
}

export interface PayOrderPayload {
  order_no?: string
  pay_method?: number
}

export interface PayOrderData {
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

export type PayOrderResponse = ApiResponse<PayOrderData>

export function payOrder(data: PayOrderPayload, options?: ApiBodyRequestOptions<PayOrderPayload>) {
  return api.post<PayOrderResponse, PayOrderPayload>('/api/order/pay', data, options)
}

export interface CancelOrderPayload {
  order_no?: string
  cancel_reason?: string
}

export type CancelOrderData = EmptyObject

export type CancelOrderResponse = ApiResponse<CancelOrderData>

export function cancelOrder(data: CancelOrderPayload, options?: ApiBodyRequestOptions<CancelOrderPayload>) {
  return api.post<CancelOrderResponse, CancelOrderPayload>('/api/order/cancel', data, options)
}

export async function queryOrderPaymentStatus(orderNo: string) {
  const response = await getOrderDetail({ order_no: orderNo })
  return normalizeOrderPaymentStatus(response.data)
}
