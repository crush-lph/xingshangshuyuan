import Taro from '@tarojs/taro'
import { getAuthToken, notifyUnauthorized } from './auth-session'

export type RequestData = string | TaroGeneral.IAnyObject | ArrayBuffer

export type HttpMethod = 'OPTIONS' | 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'TRACE' | 'CONNECT' | 'PATCH'

export type RequestHeader = TaroGeneral.IAnyObject

export interface RequestConfig {
  baseURL?: string
  header?: RequestHeader
  timeout?: number
}

export interface RequestOptions<TData extends RequestData = TaroGeneral.IAnyObject> {
  url: string
  method?: HttpMethod
  data?: TData
  header?: RequestHeader
  baseURL?: string
  timeout?: number
  dataType?: string
  responseType?: 'text' | 'arraybuffer'
}

export type ApiRequestOptions<TData extends RequestData = TaroGeneral.IAnyObject> = Omit<
  RequestOptions<TData>,
  'url' | 'method'
>

export type ApiBodyRequestOptions<TData extends RequestData = TaroGeneral.IAnyObject> = Omit<
  ApiRequestOptions<TData>,
  'data'
>

export interface RequestError<TData = unknown> extends Error {
  statusCode?: number
  data?: TData
}

export interface BusinessError<TData = unknown> extends Error {
  code: number
  data?: TData
}

let requestConfig: RequestConfig = {
  header: {
    'content-type': 'application/json'
  }
}

export function setRequestConfig(config: RequestConfig) {
  requestConfig = {
    ...requestConfig,
    ...config,
    header: {
      ...requestConfig.header,
      ...config.header
    }
  }
}

function isAbsoluteUrl(url: string) {
  return /^https?:\/\//i.test(url)
}

export function resolveRequestUrl(url: string, baseURL = requestConfig.baseURL) {
  if (!baseURL || isAbsoluteUrl(url)) {
    return url
  }

  return `${baseURL.replace(/\/+$/, '')}/${url.replace(/^\/+/, '')}`
}

export function getRequestHeader(header?: RequestHeader) {
  const token = getAuthToken()

  return {
    ...requestConfig.header,
    ...(token ? { Authorization: `Bearer ${token}` } : undefined),
    ...header
  }
}

function isSuccessStatus(statusCode: number) {
  return statusCode >= 200 && statusCode < 300
}

function createRequestError<TData>(statusCode: number, data: TData): RequestError<TData> {
  return Object.assign(new Error(`Request failed with status ${statusCode}`), {
    name: 'RequestError',
    statusCode,
    data
  })
}

function isApiEnvelope(value: unknown): value is { code: number; info?: unknown; data?: unknown } {
  return value !== null && typeof value === 'object' && 'code' in value && typeof value.code === 'number'
}

function isUnauthorizedBusinessError(code: number, info: string) {
  return code === 401 || /未登录|请先登录|登录.*失效|token.*失效/i.test(info)
}

export function assertBusinessSuccess<TResponse>(response: TResponse): TResponse {
  if (!isApiEnvelope(response) || response.code === 1) {
    return response
  }

  const info = typeof response.info === 'string' && response.info.trim() ? response.info.trim() : '业务请求失败'

  if (isUnauthorizedBusinessError(response.code, info)) {
    notifyUnauthorized()
  }

  throw Object.assign(new Error(info), {
    name: 'BusinessError',
    code: response.code,
    data: response.data
  }) as BusinessError
}

export async function request<TResponse = unknown, TData extends RequestData = TaroGeneral.IAnyObject>(
  options: RequestOptions<TData>
): Promise<TResponse> {
  const { baseURL, data, dataType, header, method = 'GET', responseType, timeout, url } = options
  const response = await Taro.request<TResponse, TData>({
    data,
    dataType,
    method,
    responseType,
    url: resolveRequestUrl(url, baseURL ?? requestConfig.baseURL),
    header: getRequestHeader(header),
    timeout: timeout ?? requestConfig.timeout
  })

  if (isSuccessStatus(response.statusCode)) {
    return assertBusinessSuccess(response.data)
  }

  if (response.statusCode === 401) {
    notifyUnauthorized()
  }

  throw createRequestError(response.statusCode, response.data)
}

function requestWithMethod<TResponse, TData extends RequestData = TaroGeneral.IAnyObject>(
  method: HttpMethod,
  url: string,
  options?: ApiRequestOptions<TData>
) {
  return request<TResponse, TData>({
    ...options,
    method,
    url
  })
}

function requestWithBody<TResponse, TData extends RequestData = TaroGeneral.IAnyObject>(
  method: HttpMethod,
  url: string,
  data?: TData,
  options?: ApiBodyRequestOptions<TData>
) {
  return request<TResponse, TData>({
    ...options,
    data,
    method,
    url
  })
}

export const api = {
  get<TResponse = unknown, TData extends RequestData = TaroGeneral.IAnyObject>(
    url: string,
    options?: ApiRequestOptions<TData>
  ) {
    return requestWithMethod<TResponse, TData>('GET', url, options)
  },
  post<TResponse = unknown, TData extends RequestData = TaroGeneral.IAnyObject>(
    url: string,
    data?: TData,
    options?: ApiBodyRequestOptions<TData>
  ) {
    return requestWithBody<TResponse, TData>('POST', url, data, options)
  },
  put<TResponse = unknown, TData extends RequestData = TaroGeneral.IAnyObject>(
    url: string,
    data?: TData,
    options?: ApiBodyRequestOptions<TData>
  ) {
    return requestWithBody<TResponse, TData>('PUT', url, data, options)
  },
  patch<TResponse = unknown, TData extends RequestData = TaroGeneral.IAnyObject>(
    url: string,
    data?: TData,
    options?: ApiBodyRequestOptions<TData>
  ) {
    return requestWithBody<TResponse, TData>('PATCH', url, data, options)
  },
  delete<TResponse = unknown, TData extends RequestData = TaroGeneral.IAnyObject>(
    url: string,
    options?: ApiRequestOptions<TData>
  ) {
    return requestWithMethod<TResponse, TData>('DELETE', url, options)
  }
}
