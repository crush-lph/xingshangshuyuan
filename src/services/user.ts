// Generated from Apifox export. Update through the Apifox document, not by hand.

import { api, type ApiRequestOptions, type ApiBodyRequestOptions } from '@/shared/request'
import type { ApiResponse, EmptyObject } from './types'

export interface GetUserProfileData {
  user_id?: number
  nickname?: string
  avatar?: string
  phone?: string
  company_name?: string
  role?: number
  role_text?: string
  vip_level?: number
  vip_level_text?: string
  certification_status?: number
  certification_status_text?: string
  city?: string
  position?: string
  created_at?: string
}

export type GetUserProfileResponse = ApiResponse<GetUserProfileData>

export function getUserProfile(options?: ApiRequestOptions) {
  return api.get<GetUserProfileResponse>('/api/user/profile', options)
}

export interface UpdateUserProfilePayload {
  nickname?: string
  avatar?: string
  company_name?: string
  city?: string
  position?: string
}

export type UpdateUserProfileData = EmptyObject

export type UpdateUserProfileResponse = ApiResponse<UpdateUserProfileData>

export function updateUserProfile(
  data: UpdateUserProfilePayload,
  options?: ApiBodyRequestOptions<UpdateUserProfilePayload>
) {
  return api.post<UpdateUserProfileResponse, UpdateUserProfilePayload>('/api/user/profile', data, options)
}

export interface GetUserCertificationData {
  certification_id?: number
  company_name?: string
  credit_code?: string
  legal_person?: string
  business_license_url?: string
  id_card_front_url?: string
  id_card_back_url?: string
  status?: number
  status_text?: string
  reject_reason?: string
  reviewed_at?: string
  created_at?: string
}

export type GetUserCertificationResponse = ApiResponse<GetUserCertificationData>

export function getUserCertification(options?: ApiRequestOptions) {
  return api.get<GetUserCertificationResponse>('/api/user/certification', options)
}

export interface SubmitUserCertificationPayload {
  company_name?: string
  credit_code?: string
  legal_person?: string
  business_license_url?: string
  id_card_front_url?: string
  id_card_back_url?: string
  contact_phone?: string
}

export interface SubmitUserCertificationData {
  certification_id?: number
  status?: number
  status_text?: string
}

export type SubmitUserCertificationResponse = ApiResponse<SubmitUserCertificationData>

export function submitUserCertification(
  data: SubmitUserCertificationPayload,
  options?: ApiBodyRequestOptions<SubmitUserCertificationPayload>
) {
  return api.post<SubmitUserCertificationResponse, SubmitUserCertificationPayload>(
    '/api/user/certification',
    data,
    options
  )
}

export interface GetUserInfoData {
  id?: number
  nickname?: string
  avatar?: string
  phone?: string
  role?: number
  role_text?: string
  vip_level?: number
  vip_level_text?: string
  last_login_at?: string
}

export type GetUserInfoResponse = ApiResponse<GetUserInfoData>

export function getUserInfo(options?: ApiRequestOptions) {
  return api.get<GetUserInfoResponse>('/api/user/info', options)
}

export interface DeleteUserPayload {
  user_id?: number
}

export type DeleteUserData = EmptyObject

export type DeleteUserResponse = ApiResponse<DeleteUserData>

export function deleteUser(data: DeleteUserPayload, options?: ApiBodyRequestOptions<DeleteUserPayload>) {
  return api.post<DeleteUserResponse, DeleteUserPayload>('/api/user/delete', data, options)
}

export interface UploadUserAvatarPayload {
  image?: string
}

export interface UploadUserAvatarData {
  url?: string
  key?: string
}

export type UploadUserAvatarResponse = ApiResponse<UploadUserAvatarData>

export function uploadUserAvatar(
  data: UploadUserAvatarPayload,
  options?: ApiBodyRequestOptions<UploadUserAvatarPayload>
) {
  return api.post<UploadUserAvatarResponse, UploadUserAvatarPayload>('/api/upload', data, options)
}
