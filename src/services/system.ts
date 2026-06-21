// Generated from Apifox export. Update through the Apifox document, not by hand.

import { api, type ApiRequestOptions } from '@/shared/request'
import type { ApiResponse } from './types'

export interface GetSystemStatusData {
  app?: string
  version?: string
  time?: string
}

export type GetSystemStatusResponse = ApiResponse<GetSystemStatusData>

export function getSystemStatus(options?: ApiRequestOptions) {
  return api.get<GetSystemStatusResponse>('/api/index/index', options)
}
