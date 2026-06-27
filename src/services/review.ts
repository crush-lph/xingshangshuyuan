// Generated from Apifox export. Update through the Apifox document, not by hand.

import { api, type ApiBodyRequestOptions, type ApiRequestOptions } from '@/shared/request'
import type { ApiResponse, QueryValue } from './types'

export interface ReviewListQuery {
  page?: QueryValue
  page_size?: QueryValue
}

export interface UserReviewItem {
  id?: number
  product_id?: number
  product_name?: string
  thumbnail?: string
  order_id?: number
  rating?: number
  content?: string
  status?: number
  created_at?: string
}

export interface GetUserReviewsData {
  list?: UserReviewItem[]
  total?: number
  page?: number
  page_size?: number
  total_page?: number
}

export type GetUserReviewsResponse = ApiResponse<GetUserReviewsData>

export function getUserReviews(params?: ReviewListQuery, options?: Omit<ApiRequestOptions<ReviewListQuery>, 'data'>) {
  return api.get<GetUserReviewsResponse, ReviewListQuery>('/api/user/reviews', {
    ...options,
    data: params
  })
}

export interface ProductReviewsQuery extends ReviewListQuery {
  product_id?: QueryValue
}

export interface ProductReviewItem {
  id?: number
  user_id?: number
  nickname?: string
  avatar?: string
  rating?: number
  content?: string
  created_at?: string
}

export interface GetProductReviewsData {
  list?: ProductReviewItem[]
  total?: number
  page?: number
  page_size?: number
  total_page?: number
}

export type GetProductReviewsResponse = ApiResponse<GetProductReviewsData>

export function getProductReviews(
  params?: ProductReviewsQuery,
  options?: Omit<ApiRequestOptions<ProductReviewsQuery>, 'data'>
) {
  return api.get<GetProductReviewsResponse, ProductReviewsQuery>('/api/product/reviews', {
    ...options,
    data: params
  })
}

export interface SubmitReviewPayload {
  order_id?: number
  rating?: number
  content?: string
}

export interface SubmitReviewData {
  id?: number
  rating?: number
  content?: string
  created_at?: string
}

export type SubmitReviewResponse = ApiResponse<SubmitReviewData>

export function submitReview(data: SubmitReviewPayload, options?: ApiBodyRequestOptions<SubmitReviewPayload>) {
  return api.post<SubmitReviewResponse, SubmitReviewPayload>('/api/review/submit', data, options)
}
