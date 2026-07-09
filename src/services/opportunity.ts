// Generated from Apifox export. Update through the Apifox document, not by hand.

import { api, type ApiRequestOptions, type ApiBodyRequestOptions } from '@/shared/request'
import type { ApiResponse, EmptyObject, QueryValue } from './types'

export interface GetOpportunityStatsData {
  total_match_count?: string
  total_revenue?: string
  satisfaction_rate?: string
}

export type GetOpportunityStatsResponse = ApiResponse<GetOpportunityStatsData>

export function getOpportunityStats(options?: ApiRequestOptions) {
  return api.get<GetOpportunityStatsResponse>('/api/opportunities/stats', options)
}

export interface GetOpportunitiesQuery {
  type?: QueryValue
  city?: QueryValue
  sort?: QueryValue
  page?: QueryValue
  page_size?: QueryValue
}

export interface GetOpportunitiesData {
  list?: Array<{
    id?: number
    title?: string
    type?: number
    type_text?: string
    city?: string
    tags?: Array<string>
    apply_count?: number
    is_confidential?: number
    time_ago?: string
    created_at?: string
  }>
  total?: number
  page?: number
  page_size?: number
  total_page?: number
}

export type GetOpportunitiesResponse = ApiResponse<GetOpportunitiesData>

export function getOpportunities(
  params?: GetOpportunitiesQuery,
  options?: Omit<ApiRequestOptions<GetOpportunitiesQuery>, 'data'>
) {
  return api.get<GetOpportunitiesResponse, GetOpportunitiesQuery>('/api/opportunities', {
    ...options,
    data: params
  })
}

export interface CreateOpportunityPayload {
  title?: string
  type?: number
  city?: string
  description?: string
  is_confidential?: number
}

export interface CreateOpportunityData {
  opportunity_id?: number
  status?: number
  status_text?: string
}

export type CreateOpportunityResponse = ApiResponse<CreateOpportunityData>

export function createOpportunity(
  data: CreateOpportunityPayload,
  options?: ApiBodyRequestOptions<CreateOpportunityPayload>
) {
  return api.post<CreateOpportunityResponse, CreateOpportunityPayload>('/api/opportunities', data, options)
}

export interface GetOpportunityDetailQuery {
  opportunity_id: QueryValue
}

export interface GetOpportunityDetailData {
  id?: number
  title?: string
  type?: number
  type_text?: string
  city?: string
  description?: string
  is_confidential?: number
  tags?: Array<string>
  status?: number
  status_text?: string
  publisher?: {
    user_id?: number
    nickname?: string
    company_name?: string
  }
  view_count?: number
  apply_count?: number
  is_owner?: boolean
  expired_at?: string | null
  created_at?: string
}

export type GetOpportunityDetailResponse = ApiResponse<GetOpportunityDetailData>

export function getOpportunityDetail(
  params: GetOpportunityDetailQuery,
  options?: Omit<ApiRequestOptions<GetOpportunityDetailQuery>, 'data'>
) {
  return api.get<GetOpportunityDetailResponse, GetOpportunityDetailQuery>('/api/opportunity/detail', {
    ...options,
    data: params
  })
}

export interface ApplyOpportunityPayload {
  opportunity_id?: number
  reason?: string
  quote_type?: number
  quote_price?: number
  attachment_url?: string
}

export interface ApplyOpportunityData {
  application_id?: number
  status?: number
  status_text?: string
}

export type ApplyOpportunityResponse = ApiResponse<ApplyOpportunityData>

export function applyOpportunity(
  data: ApplyOpportunityPayload,
  options?: ApiBodyRequestOptions<ApplyOpportunityPayload>
) {
  return api.post<ApplyOpportunityResponse, ApplyOpportunityPayload>('/api/opportunity/apply', data, options)
}

export interface GetMyOpportunitiesQuery {
  status?: QueryValue
  page?: QueryValue
  page_size?: QueryValue
}

export interface GetMyOpportunitiesData {
  list?: Array<{
    id?: number
    title?: string
    type?: number
    type_text?: string
    city?: string
    status?: number
    status_text?: string
    apply_count?: number
    view_count?: number
    created_at?: string
  }>
  total?: number
  page?: number
  page_size?: number
  total_page?: number
}

export type GetMyOpportunitiesResponse = ApiResponse<GetMyOpportunitiesData>

export function getMyOpportunities(
  params?: GetMyOpportunitiesQuery,
  options?: Omit<ApiRequestOptions<GetMyOpportunitiesQuery>, 'data'>
) {
  return api.get<GetMyOpportunitiesResponse, GetMyOpportunitiesQuery>('/api/opportunities/mine', {
    ...options,
    data: params
  })
}

export interface GetOpportunityApplicationsQuery {
  opportunity_id: QueryValue
}

export interface GetOpportunityApplicationsData {
  list?: Array<{
    application_id?: number
    user_id?: number
    nickname?: string
    company_name?: string
    reason?: string
    quote_type?: number
    quote_price?: string | null
    attachment_url?: string
    status?: number
    status_text?: string
    created_at?: string
  }>
  total?: number
}

export type GetOpportunityApplicationsResponse = ApiResponse<GetOpportunityApplicationsData>

export function getOpportunityApplications(
  params: GetOpportunityApplicationsQuery,
  options?: Omit<ApiRequestOptions<GetOpportunityApplicationsQuery>, 'data'>
) {
  return api.get<GetOpportunityApplicationsResponse, GetOpportunityApplicationsQuery>('/api/opportunity/applications', {
    ...options,
    data: params
  })
}

export interface GetUserApplicationsQuery {
  status?: QueryValue
  page?: QueryValue
  page_size?: QueryValue
}

export interface GetUserApplicationsData {
  list?: Array<{
    application_id?: number
    opportunity_id?: number
    opportunity_title?: string
    type_text?: string
    city?: string
    status?: number
    status_text?: string
    created_at?: string
  }>
  total?: number
  page?: number
  page_size?: number
  total_page?: number
}

export type GetUserApplicationsResponse = ApiResponse<GetUserApplicationsData>

export function getUserApplications(
  params?: GetUserApplicationsQuery,
  options?: Omit<ApiRequestOptions<GetUserApplicationsQuery>, 'data'>
) {
  return api.get<GetUserApplicationsResponse, GetUserApplicationsQuery>('/api/user/applications', {
    ...options,
    data: params
  })
}

export interface UpdateOpportunityStatusPayload {
  opportunity_id?: number
  status?: number
}

export type UpdateOpportunityStatusData = EmptyObject

export type UpdateOpportunityStatusResponse = ApiResponse<UpdateOpportunityStatusData>

export function updateOpportunityStatus(
  data: UpdateOpportunityStatusPayload,
  options?: ApiBodyRequestOptions<UpdateOpportunityStatusPayload>
) {
  return api.post<UpdateOpportunityStatusResponse, UpdateOpportunityStatusPayload>(
    '/api/opportunity/status',
    data,
    options
  )
}

export interface GetCompanyProfileData {
  id?: number
  name?: string
  credit_code?: string
  city?: string
  team_size?: number | null
  client_count?: number | null
  business_scope?: string
  service_cities?: string
  is_cross_region?: number
  cert_status?: number
}

export type GetCompanyProfileResponse = ApiResponse<GetCompanyProfileData>

export function getCompanyProfile(options?: ApiRequestOptions) {
  return api.get<GetCompanyProfileResponse>('/api/companies/profile', options)
}

export interface SaveCompanyProfilePayload {
  name?: string
  credit_code?: string
  city?: string
  team_size?: number
  client_count?: number
  business_scope?: string
  service_cities?: string
  is_cross_region?: number
}

export interface SaveCompanyProfileData {
  id?: number
  is_new?: boolean
}

export type SaveCompanyProfileResponse = ApiResponse<SaveCompanyProfileData>

export function saveCompanyProfile(
  data: SaveCompanyProfilePayload,
  options?: ApiBodyRequestOptions<SaveCompanyProfilePayload>
) {
  return api.post<SaveCompanyProfileResponse, SaveCompanyProfilePayload>('/api/companies/profile', data, options)
}
