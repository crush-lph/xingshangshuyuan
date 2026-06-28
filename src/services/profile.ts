// Generated from Apifox export. Update through the Apifox document, not by hand.

import { api, type ApiRequestOptions } from '@/shared/request'
import type { ApiResponse, QueryValue } from './types'

export interface ProfileRecord {
  [key: string]: unknown
}

export interface PaginatedListData<TItem extends ProfileRecord = ProfileRecord> {
  list?: TItem[]
  total?: number
  page?: number
  page_size?: number
  [key: string]: unknown
}

export interface GetUserVipData extends ProfileRecord {
  level?: number
  level_text?: string
  vip_level?: number
  vip_level_text?: string
  expire_at?: string
  perks?: ProfileRecord[] | PaginatedListData
  rights?: ProfileRecord[] | PaginatedListData
  items?: ProfileRecord[] | PaginatedListData
  list?: ProfileRecord[]
}

export type GetUserVipResponse = ApiResponse<GetUserVipData>

export function getUserVip(options?: ApiRequestOptions) {
  return api.get<GetUserVipResponse>('/api/user/vip', options)
}

export interface GetOrdersQuery {
  status?: QueryValue
  page?: QueryValue
  page_size?: QueryValue
}

export interface OrderListItem extends ProfileRecord {
  id?: number | string
  order_id?: number
  order_no?: string
  title?: string
  description?: string
  remark?: string
  status?: number
  status_text?: string
  pay_amount?: string
  total_amount?: string
  amount?: string
}

export type GetOrdersData = PaginatedListData<OrderListItem> | OrderListItem[]

export type GetOrdersResponse = ApiResponse<GetOrdersData>

export function getOrders(params?: GetOrdersQuery, options?: Omit<ApiRequestOptions<GetOrdersQuery>, 'data'>) {
  return api.get<GetOrdersResponse, GetOrdersQuery>('/api/orders', {
    ...options,
    data: params
  })
}

export interface UserCertificateItem extends ProfileRecord {
  id?: number | string
  title?: string
  name?: string
  certificate_name?: string
  status?: number
  status_text?: string
  issued_at?: string
  created_at?: string
}

export type GetUserCertificatesData = UserCertificateItem[]

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

export interface UserCustomerItem extends ProfileRecord {
  id?: number | string
  name?: string
  customer_name?: string
  title?: string
  company_name?: string
  description?: string
  status?: number
  status_text?: string
  created_at?: string
}

export type GetUserCustomersData = PaginatedListData<UserCustomerItem> | UserCustomerItem[]

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

export interface ContractItem extends ProfileRecord {
  id?: number | string
  contract_id?: number | string
  contract_no?: string
  title?: string
  name?: string
  description?: string
  status?: number
  status_text?: string
  created_at?: string
}

export type GetContractsData = PaginatedListData<ContractItem> | ContractItem[]

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

export interface GetContractDetailData extends ContractItem {
  content?: string
  file_url?: string
  start_time?: string
  end_time?: string
}

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

export interface InvoiceItem extends ProfileRecord {
  id?: number | string
  invoice_no?: string
  title?: string
  description?: string
  amount?: string
  status?: number
  status_text?: string
  created_at?: string
}

export type GetInvoicesData = PaginatedListData<InvoiceItem> | InvoiceItem[]

export type GetInvoicesResponse = ApiResponse<GetInvoicesData>

export function getInvoices(params?: GetInvoicesQuery, options?: Omit<ApiRequestOptions<GetInvoicesQuery>, 'data'>) {
  return api.get<GetInvoicesResponse, GetInvoicesQuery>('/api/invoices', {
    ...options,
    data: params
  })
}

export interface GetCustomerServiceConfigData extends ProfileRecord {
  name?: string
  manager_name?: string
  phone?: string
  manager_phone?: string
  qrcode_url?: string
}

export type GetCustomerServiceConfigResponse = ApiResponse<GetCustomerServiceConfigData>

export function getCustomerServiceConfig(options?: ApiRequestOptions) {
  return api.get<GetCustomerServiceConfigResponse>('/api/customer-service/config', options)
}

export interface GetAboutData extends ProfileRecord {
  title?: string
  description?: string
  content?: string
  about?: string
}

export type GetAboutResponse = ApiResponse<GetAboutData>

export function getAbout(options?: ApiRequestOptions) {
  return api.get<GetAboutResponse>('/api/about', options)
}

export interface GetVipLevelPerksData extends ProfileRecord {
  list?: ProfileRecord[]
  perks?: ProfileRecord[] | PaginatedListData
  levels?: ProfileRecord[] | PaginatedListData
  items?: ProfileRecord[] | PaginatedListData
}

export type GetVipLevelPerksResponse = ApiResponse<GetVipLevelPerksData>

export function getVipLevelPerks(options?: ApiRequestOptions) {
  return api.get<GetVipLevelPerksResponse>('/api/user/vip/level-perks', options)
}
