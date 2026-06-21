// Generated from Apifox export. Update through the Apifox document, not by hand.

import { api, type ApiRequestOptions, type ApiBodyRequestOptions } from '@/shared/request'
import type { ApiResponse, QueryValue } from './types'

export interface GetProductCategoriesData {
  list?: Array<{
    id?: number
    name?: string
    icon?: string
    sort_order?: number
  }>
}

export type GetProductCategoriesResponse = ApiResponse<GetProductCategoriesData>

export function getProductCategories(options?: ApiRequestOptions) {
  return api.get<GetProductCategoriesResponse>('/api/product/categories', options)
}

export interface GetProductsQuery {
  category_id?: QueryValue
  product_type?: QueryValue
  keyword?: QueryValue
  sort?: QueryValue
  page?: QueryValue
  page_size?: QueryValue
}

export interface GetProductsData {
  list?: Array<{
    id?: number
    category_id?: number
    name?: string
    description?: string
    thumbnail?: string
    product_type?: number
    product_type_text?: string
    price?: string
    original_price?: string | null
    vip_price?: string | null
    price_unit?: string
    sales_count?: number
    has_spec?: boolean
  }>
  total?: number
  page?: number
  page_size?: number
  total_page?: number
}

export type GetProductsResponse = ApiResponse<GetProductsData>

export function getProducts(params?: GetProductsQuery, options?: Omit<ApiRequestOptions<GetProductsQuery>, 'data'>) {
  return api.get<GetProductsResponse, GetProductsQuery>('/api/products', {
    ...options,
    data: params
  })
}

export interface GetProductDetailQuery {
  product_id: QueryValue
}

export interface GetProductDetailData {
  id?: number
  category_id?: number
  name?: string
  description?: string
  detail?: string
  thumbnail?: string
  images?: Array<string>
  product_type?: number
  product_type_text?: string
  price?: string
  original_price?: string | null
  vip_price?: string | null
  price_unit?: string
  sales_count?: number
  view_count?: number
  specs?: Array<{
    id?: number
    spec_name?: string
    price?: string
    original_price?: string | null
    vip_price?: string | null
    price_unit?: string
    duration_days?: number | null
  }>
}

export type GetProductDetailResponse = ApiResponse<GetProductDetailData>

export function getProductDetail(
  params: GetProductDetailQuery,
  options?: Omit<ApiRequestOptions<GetProductDetailQuery>, 'data'>
) {
  return api.get<GetProductDetailResponse, GetProductDetailQuery>('/api/product/detail', {
    ...options,
    data: params
  })
}

export interface CreateProductOrderPayload {
  items?: Array<{
    product_id?: number
    spec_id?: number
    quantity?: number
  }>
  remark?: string
}

export interface CreateProductOrderData {
  order_id?: number
  order_no?: string
  total_amount?: string
  discount_amount?: string
  pay_amount?: string
  status?: number
  status_text?: string
  items?: Array<{
    product_id?: number
    product_name?: string
    spec_name?: string
    price?: string
    quantity?: number
    subtotal?: string
  }>
  expire_at?: string
}

export type CreateProductOrderResponse = ApiResponse<CreateProductOrderData>

export function createProductOrder(
  data: CreateProductOrderPayload,
  options?: ApiBodyRequestOptions<CreateProductOrderPayload>
) {
  return api.post<CreateProductOrderResponse, CreateProductOrderPayload>('/api/product/order', data, options)
}
