// Generated from Apifox export. Update through the Apifox document, not by hand.

import { api, type ApiRequestOptions, type ApiBodyRequestOptions } from '@/shared/request'
import type { ApiResponse, EmptyObject, QueryValue } from './types'

export type GetCourseCategoriesData = Array<{
  id?: number
  name?: string
}>

export type GetCourseCategoriesResponse = ApiResponse<GetCourseCategoriesData>

export function getCourseCategories(options?: ApiRequestOptions) {
  return api.get<GetCourseCategoriesResponse>('/api/course/categories', options)
}

export interface GetCoursesQuery {
  category_id?: QueryValue
  course_type?: QueryValue
  keyword?: QueryValue
  sort?: QueryValue
  page?: QueryValue
  page_size?: QueryValue
}

export interface GetCoursesData {
  total?: number
  page?: number
  page_size?: number
  total_page?: number
  list?: Array<{
    id?: number
    title?: string
    description?: string
    thumbnail?: string
    course_type?: number
    course_type_text?: string
    teacher_name?: string
    teacher_avatar?: string
    price?: string
    original_price?: string | null
    student_count?: number
    is_live?: number
    live_start_time?: string | null
    total_duration?: number
    section_count?: number
    category_id?: number
  }>
}

export type GetCoursesResponse = ApiResponse<GetCoursesData>

export function getCourses(params?: GetCoursesQuery, options?: Omit<ApiRequestOptions<GetCoursesQuery>, 'data'>) {
  return api.get<GetCoursesResponse, GetCoursesQuery>('/api/courses', {
    ...options,
    data: params
  })
}

export interface GetCourseDetailQuery {
  course_id: QueryValue
}

export interface GetCourseDetailData {
  id?: number
  title?: string
  description?: string
  detail?: string
  thumbnail?: string
  course_type?: number
  course_type_text?: string
  teacher_name?: string
  teacher_avatar?: string
  teacher_intro?: string
  price?: string
  original_price?: string | null
  student_count?: number
  total_duration?: number
  section_count?: number
  is_live?: number
  live_start_time?: string | null
  is_bought?: boolean
  category_id?: number
}

export type GetCourseDetailResponse = ApiResponse<GetCourseDetailData>

export function getCourseDetail(
  params: GetCourseDetailQuery,
  options?: Omit<ApiRequestOptions<GetCourseDetailQuery>, 'data'>
) {
  return api.get<GetCourseDetailResponse, GetCourseDetailQuery>('/api/course/detail', {
    ...options,
    data: params
  })
}

export interface GetCourseSectionsQuery {
  course_id: QueryValue
}

export type GetCourseSectionsData = Array<{
  id?: number
  title?: string
  parent_id?: number
  video_url?: string
  duration?: number
  duration_text?: string
  is_free?: number
  is_completed?: boolean
  last_position?: number
  sort_order?: number
  children?: Array<EmptyObject>
}>

export type GetCourseSectionsResponse = ApiResponse<GetCourseSectionsData>

export function getCourseSections(
  params: GetCourseSectionsQuery,
  options?: Omit<ApiRequestOptions<GetCourseSectionsQuery>, 'data'>
) {
  return api.get<GetCourseSectionsResponse, GetCourseSectionsQuery>('/api/course/sections', {
    ...options,
    data: params
  })
}

export interface BuyCoursePayload {
  course_id?: number
  spec_id?: number
}

export interface BuyCourseData {
  order_id?: number
  order_no?: string
  pay_amount?: string
  status?: number
  status_text?: string
}

export type BuyCourseResponse = ApiResponse<BuyCourseData>

export function buyCourse(data: BuyCoursePayload, options?: ApiBodyRequestOptions<BuyCoursePayload>) {
  return api.post<BuyCourseResponse, BuyCoursePayload>('/api/course/buy', data, options)
}

export interface GetUserCoursesQuery {
  is_completed?: QueryValue
  page?: QueryValue
  page_size?: QueryValue
}

export interface GetUserCoursesData {
  total?: number
  page?: number
  page_size?: number
  total_page?: number
  list?: Array<{
    course_id?: number
    title?: string
    thumbnail?: string
    teacher_name?: string
    progress?: number
    total_duration?: number
    learned_duration?: number
    is_completed?: number
    last_section_id?: number
    expire_at?: string | null
    bought_at?: string
  }>
}

export type GetUserCoursesResponse = ApiResponse<GetUserCoursesData>

export function getUserCourses(
  params?: GetUserCoursesQuery,
  options?: Omit<ApiRequestOptions<GetUserCoursesQuery>, 'data'>
) {
  return api.get<GetUserCoursesResponse, GetUserCoursesQuery>('/api/user/courses', {
    ...options,
    data: params
  })
}

export interface GetUserCourseProgressQuery {
  course_id: QueryValue
}

export interface GetUserCourseProgressData {
  course_id?: number
  progress?: number
  total_learn_duration?: number
  total_learn_duration_text?: string
  is_completed?: number
  last_section_id?: number
  sections_progress?: Array<{
    section_id?: number
    progress?: number
    is_completed?: boolean
    last_position?: number
  }>
}

export type GetUserCourseProgressResponse = ApiResponse<GetUserCourseProgressData>

export function getUserCourseProgress(
  params: GetUserCourseProgressQuery,
  options?: Omit<ApiRequestOptions<GetUserCourseProgressQuery>, 'data'>
) {
  return api.get<GetUserCourseProgressResponse, GetUserCourseProgressQuery>('/api/user/course/progress', {
    ...options,
    data: params
  })
}

export interface UpdateUserCourseProgressPayload {
  course_id?: number
  section_id?: number
  watched_duration?: number
  last_position?: number
  is_completed?: number
}

export interface UpdateUserCourseProgressData {
  section_progress?: number
  course_progress?: number
}

export type UpdateUserCourseProgressResponse = ApiResponse<UpdateUserCourseProgressData>

export function updateUserCourseProgress(
  data: UpdateUserCourseProgressPayload,
  options?: ApiBodyRequestOptions<UpdateUserCourseProgressPayload>
) {
  return api.post<UpdateUserCourseProgressResponse, UpdateUserCourseProgressPayload>(
    '/api/user/course/progress',
    data,
    options
  )
}

export interface GetEventsQuery {
  status?: QueryValue
  page?: QueryValue
  page_size?: QueryValue
}

export interface GetEventsData {
  total?: number
  page?: number
  page_size?: number
  total_page?: number
  list?: Array<{
    id?: number
    title?: string
    cover_image?: string
    event_date?: string
    start_time?: string
    location?: string
    city?: string
    max_participants?: number | null
    current_count?: number
    price?: string
    status?: number
    status_text?: string
  }>
}

export type GetEventsResponse = ApiResponse<GetEventsData>

export function getEvents(params?: GetEventsQuery, options?: Omit<ApiRequestOptions<GetEventsQuery>, 'data'>) {
  return api.get<GetEventsResponse, GetEventsQuery>('/api/events', {
    ...options,
    data: params
  })
}

export interface GetEventDetailQuery {
  event_id: QueryValue
}

export interface GetEventDetailData {
  id?: number
  title?: string
  description?: string
  cover_image?: string
  event_date?: string
  start_time?: string
  end_time?: string | null
  location?: string
  city?: string
  longitude?: number | null
  latitude?: number | null
  max_participants?: number | null
  current_count?: number
  price?: string
  status?: number
  status_text?: string
  is_registered?: boolean
}

export type GetEventDetailResponse = ApiResponse<GetEventDetailData>

export function getEventDetail(
  params: GetEventDetailQuery,
  options?: Omit<ApiRequestOptions<GetEventDetailQuery>, 'data'>
) {
  return api.get<GetEventDetailResponse, GetEventDetailQuery>('/api/event/detail', {
    ...options,
    data: params
  })
}

export interface RegisterEventPayload {
  event_id?: number
  real_name?: string
  phone?: string
  company_name?: string
}

export interface RegisterEventData {
  status?: number
  status_text?: string
  registration_id?: number | null
  event_title?: string | null
  event_date?: string | null
  order_id?: number | null
  order_no?: string | null
  pay_amount?: string | null
}

export type RegisterEventResponse = ApiResponse<RegisterEventData>

export function registerEvent(data: RegisterEventPayload, options?: ApiBodyRequestOptions<RegisterEventPayload>) {
  return api.post<RegisterEventResponse, RegisterEventPayload>('/api/event/register', data, options)
}

export interface GetUserEventsQuery {
  page?: QueryValue
  page_size?: QueryValue
}

export interface GetUserEventsData {
  total?: number
  page?: number
  page_size?: number
  total_page?: number
  list?: Array<{
    registration_id?: number
    event_id?: number
    order_id?: number | null
    event_title?: string
    cover_image?: string
    event_date?: string
    start_time?: string
    end_time?: string
    location?: string
    city?: string
    price?: string
    real_name?: string
    phone?: string
    company_name?: string
    status?: number
    status_text?: string
    created_at?: string
  }>
}

export type GetUserEventsResponse = ApiResponse<GetUserEventsData>

export function getUserEvents(
  params?: GetUserEventsQuery,
  options?: Omit<ApiRequestOptions<GetUserEventsQuery>, 'data'>
) {
  return api.get<GetUserEventsResponse, GetUserEventsQuery>('/api/user/events', {
    ...options,
    data: params
  })
}

export interface GetUserLearningStatsData {
  week_learn_duration?: number
  week_learn_duration_text?: string
  week_target_duration?: number
  week_target_duration_text?: string
  week_progress?: number
  total_courses?: number
  completed_courses?: number
  total_learn_duration?: number
  total_learn_duration_text?: string
  certificates_count?: number
}

export type GetUserLearningStatsResponse = ApiResponse<GetUserLearningStatsData>

export function getUserLearningStats(options?: ApiRequestOptions) {
  return api.get<GetUserLearningStatsResponse>('/api/user/learning/stats', options)
}
