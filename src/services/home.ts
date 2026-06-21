// Generated from Apifox export. Update through the Apifox document, not by hand.

import { api, type ApiRequestOptions } from '@/shared/request'
import type { ApiResponse, QueryValue } from './types'

export interface GetBannersData {
  list?: Array<{
    id?: number
    title?: string
    subtitle?: string
    image_url?: string
    action_type?: number
    action_url?: string
    sort_order?: number
  }>
}

export type GetBannersResponse = ApiResponse<GetBannersData>

export function getBanners(options?: ApiRequestOptions) {
  return api.get<GetBannersResponse>('/api/banners', options)
}

export interface GetCoreBusinessData {
  list?: Array<{
    id?: number
    title?: string
    subtitle?: string
    action_text?: string
    product_type?: number
    product_type_text?: string
    sort_order?: number
  }>
}

export type GetCoreBusinessResponse = ApiResponse<GetCoreBusinessData>

export function getCoreBusiness(options?: ApiRequestOptions) {
  return api.get<GetCoreBusinessResponse>('/api/core-business', options)
}

export interface GetNotificationsQuery {
  type?: QueryValue
  page?: QueryValue
  page_size?: QueryValue
}

export interface GetNotificationsData {
  list?: Array<{
    id?: number
    type?: number
    type_text?: string
    title?: string
    summary?: string
    is_top?: number
    view_count?: number
    published_at?: string
  }>
  total?: number
  page?: number
  page_size?: number
  total_page?: number
}

export type GetNotificationsResponse = ApiResponse<GetNotificationsData>

export function getNotifications(
  params?: GetNotificationsQuery,
  options?: Omit<ApiRequestOptions<GetNotificationsQuery>, 'data'>
) {
  return api.get<GetNotificationsResponse, GetNotificationsQuery>('/api/notifications', {
    ...options,
    data: params
  })
}

export interface GetQuickEntriesData {
  list?: Array<{
    id?: number
    name?: string
    icon?: string
    link_type?: string
    link_url?: string
  }>
}

export type GetQuickEntriesResponse = ApiResponse<GetQuickEntriesData>

export function getQuickEntries(options?: ApiRequestOptions) {
  return api.get<GetQuickEntriesResponse>('/api/quick-entries', options)
}

export interface GetSearchSuggestQuery {
  keyword: QueryValue
}

export interface GetSearchSuggestData {
  products?: Array<{
    id?: number
    name?: string
    type?: string
    price?: string
  }>
  courses?: Array<{
    id?: number
    title?: string
    teacher?: string
    price?: string
  }>
  opportunities?: Array<{
    id?: number
    title?: string
  }>
}

export type GetSearchSuggestResponse = ApiResponse<GetSearchSuggestData>

export function getSearchSuggest(
  params: GetSearchSuggestQuery,
  options?: Omit<ApiRequestOptions<GetSearchSuggestQuery>, 'data'>
) {
  return api.get<GetSearchSuggestResponse, GetSearchSuggestQuery>('/api/search/suggest', {
    ...options,
    data: params
  })
}

export interface GetPlatformStatsData {
  list?: Array<{
    stat_key?: string
    stat_value?: string
    stat_label?: string
  }>
}

export type GetPlatformStatsResponse = ApiResponse<GetPlatformStatsData>

export function getPlatformStats(options?: ApiRequestOptions) {
  return api.get<GetPlatformStatsResponse>('/api/stats/platform', options)
}
