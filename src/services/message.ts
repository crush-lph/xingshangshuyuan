// Generated from Apifox export. Update through the Apifox document, not by hand.

import { api, type ApiRequestOptions, type ApiBodyRequestOptions } from '@/shared/request'
import type { ApiResponse, EmptyObject, QueryValue } from './types'

export interface GetUserMessagesQuery {
  type?: QueryValue
  page?: QueryValue
  page_size?: QueryValue
}

export type GetUserMessagesData = EmptyObject

export type GetUserMessagesResponse = ApiResponse<GetUserMessagesData>

export function getUserMessages(
  params?: GetUserMessagesQuery,
  options?: Omit<ApiRequestOptions<GetUserMessagesQuery>, 'data'>
) {
  return api.get<GetUserMessagesResponse, GetUserMessagesQuery>('/api/user/messages', {
    ...options,
    data: params
  })
}

export interface MarkUserMessageReadPayload {
  message_id?: number
}

export type MarkUserMessageReadData = unknown

export type MarkUserMessageReadResponse = ApiResponse<MarkUserMessageReadData>

export function markUserMessageRead(
  data: MarkUserMessageReadPayload,
  options?: ApiBodyRequestOptions<MarkUserMessageReadPayload>
) {
  return api.post<MarkUserMessageReadResponse, MarkUserMessageReadPayload>('/api/user/message/read', data, options)
}

export type MarkAllUserMessagesReadData = unknown

export type MarkAllUserMessagesReadResponse = ApiResponse<MarkAllUserMessagesReadData>

export function markAllUserMessagesRead(options?: ApiBodyRequestOptions) {
  return api.post<MarkAllUserMessagesReadResponse>('/api/user/messages/read-all', undefined, options)
}

export interface GetUnreadMessageCountData {
  unread_count?: number
}

export type GetUnreadMessageCountResponse = ApiResponse<GetUnreadMessageCountData>

export function getUnreadMessageCount(options?: ApiRequestOptions) {
  return api.get<GetUnreadMessageCountResponse>('/api/user/messages/unread-count', options)
}
