// Generated from Apifox export. Update through the Apifox document, not by hand.

import { api, type ApiRequestOptions, type ApiBodyRequestOptions } from '@/shared/request'
import type { ApiResponse, EmptyObject, QueryValue } from './types'

export type GetUserVipData = EmptyObject

export type GetUserVipResponse = ApiResponse<GetUserVipData>

export function getUserVip(options?: ApiRequestOptions) {
  return api.get<GetUserVipResponse>('/api/user/vip', options)
}

export interface GetOrdersQuery {
  status?: QueryValue
  page?: QueryValue
  page_size?: QueryValue
}

export type GetOrdersData = EmptyObject

export type GetOrdersResponse = ApiResponse<GetOrdersData>

export function getOrders(params?: GetOrdersQuery, options?: Omit<ApiRequestOptions<GetOrdersQuery>, 'data'>) {
  return api.get<GetOrdersResponse, GetOrdersQuery>('/api/orders', {
    ...options,
    data: params
  })
}

export type GetUserCertificatesData = Array<EmptyObject>

export type GetUserCertificatesResponse = ApiResponse<GetUserCertificatesData>

export function getUserCertificates(options?: ApiRequestOptions) {
  return api.get<GetUserCertificatesResponse>('/api/user/certificates', options)
}

export interface GetUserCustomersQuery {
  status?: QueryValue
  keyword?: QueryValue
  page?: QueryValue
  page_size?: QueryValue
}

export type GetUserCustomersData = EmptyObject

export type GetUserCustomersResponse = ApiResponse<GetUserCustomersData>

export function getUserCustomers(
  params?: GetUserCustomersQuery,
  options?: Omit<ApiRequestOptions<GetUserCustomersQuery>, 'data'>
) {
  return api.get<GetUserCustomersResponse, GetUserCustomersQuery>('/api/user/customers', {
    ...options,
    data: params
  })
}

export interface GetContractsQuery {
  status?: QueryValue
  page?: QueryValue
  page_size?: QueryValue
}

export type GetContractsData = EmptyObject

export type GetContractsResponse = ApiResponse<GetContractsData>

export function getContracts(params?: GetContractsQuery, options?: Omit<ApiRequestOptions<GetContractsQuery>, 'data'>) {
  return api.get<GetContractsResponse, GetContractsQuery>('/api/contracts', {
    ...options,
    data: params
  })
}

export interface GetContractDetailQuery {
  contract_id: QueryValue
}

export type GetContractDetailData = EmptyObject

export type GetContractDetailResponse = ApiResponse<GetContractDetailData>

export function getContractDetail(
  params: GetContractDetailQuery,
  options?: Omit<ApiRequestOptions<GetContractDetailQuery>, 'data'>
) {
  return api.get<GetContractDetailResponse, GetContractDetailQuery>('/api/contract/detail', {
    ...options,
    data: params
  })
}

export interface GetInvoicesQuery {
  status?: QueryValue
  page?: QueryValue
  page_size?: QueryValue
}

export type GetInvoicesData = EmptyObject

export type GetInvoicesResponse = ApiResponse<GetInvoicesData>

export function getInvoices(params?: GetInvoicesQuery, options?: Omit<ApiRequestOptions<GetInvoicesQuery>, 'data'>) {
  return api.get<GetInvoicesResponse, GetInvoicesQuery>('/api/invoices', {
    ...options,
    data: params
  })
}

export interface UploadFileRecordPayload {
  order_no?: string
  file_path?: string
  scene?: string
}

export type UploadFileRecordData = EmptyObject

export type UploadFileRecordResponse = ApiResponse<UploadFileRecordData>

export function uploadFileRecord(
  data?: UploadFileRecordPayload,
  options?: ApiBodyRequestOptions<UploadFileRecordPayload>
) {
  return api.post<UploadFileRecordResponse, UploadFileRecordPayload>('/api/upload', data, options)
}

export type GetCustomerServiceConfigData = EmptyObject

export type GetCustomerServiceConfigResponse = ApiResponse<GetCustomerServiceConfigData>

export function getCustomerServiceConfig(options?: ApiRequestOptions) {
  return api.get<GetCustomerServiceConfigResponse>('/api/customer-service/config', options)
}

export type GetAboutData = EmptyObject

export type GetAboutResponse = ApiResponse<GetAboutData>

export function getAbout(options?: ApiRequestOptions) {
  return api.get<GetAboutResponse>('/api/about', options)
}

export type GetVipLevelPerksData = EmptyObject

export type GetVipLevelPerksResponse = ApiResponse<GetVipLevelPerksData>

export function getVipLevelPerks(options?: ApiRequestOptions) {
  return api.get<GetVipLevelPerksResponse>('/api/user/vip/level-perks', options)
}
