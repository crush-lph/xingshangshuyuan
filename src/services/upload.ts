import Taro from '@tarojs/taro'

import { API_BASE_URL } from '@/shared/api-config'
import { getAuthToken, notifyUnauthorized } from '@/shared/auth-session'

type UploadFormValue = string | number | boolean

export interface UploadFileOptions {
  filePath: string
  scene?: string
  name?: string
  formData?: Record<string, UploadFormValue>
}

export interface UploadFileResult {
  fileUrl: string
  raw: unknown
}

function isAbsoluteUrl(url: string) {
  return /^https?:\/\//i.test(url)
}

function joinUrl(baseURL: string | undefined, url: string) {
  if (!baseURL || isAbsoluteUrl(url)) {
    return url
  }

  return `${baseURL.replace(/\/+$/, '')}/${url.replace(/^\/+/, '')}`
}

function toRecord(value: unknown): Record<string, unknown> | undefined {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>
  }

  return undefined
}

function toNonEmptyString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function parseUploadData(data: string) {
  try {
    return JSON.parse(data) as unknown
  } catch {
    return data
  }
}

function extractFileUrl(response: unknown): string | undefined {
  const directValue = toNonEmptyString(response)
  if (directValue) {
    return directValue
  }

  const record = toRecord(response)
  if (!record) {
    return undefined
  }

  const nestedData = record.data
  const nestedDataValue = toNonEmptyString(nestedData)
  if (nestedDataValue) {
    return nestedDataValue
  }

  const dataRecord = toRecord(nestedData)
  const fields = ['url', 'file_url', 'fileUrl', 'file_path', 'filePath', 'path', 'src', 'full_url', 'fullUrl']

  for (const field of fields) {
    const nestedValue = dataRecord ? toNonEmptyString(dataRecord[field]) : undefined
    const rootValue = toNonEmptyString(record[field])

    if (nestedValue) {
      return nestedValue
    }

    if (rootValue) {
      return rootValue
    }
  }

  return undefined
}

export async function uploadFile(options: UploadFileOptions): Promise<UploadFileResult> {
  const token = getAuthToken()
  const response = await Taro.uploadFile({
    url: joinUrl(API_BASE_URL, '/api/upload'),
    filePath: options.filePath,
    name: options.name ?? 'file',
    header: token ? { Authorization: `Bearer ${token}` } : undefined,
    formData: {
      ...(options.scene ? { scene: options.scene } : {}),
      ...options.formData
    }
  })

  if (response.statusCode === 401) {
    notifyUnauthorized()
  }

  if (response.statusCode < 200 || response.statusCode >= 300) {
    throw new Error(`文件上传失败(${response.statusCode})`)
  }

  const raw = parseUploadData(response.data)
  const fileUrl = extractFileUrl(raw)

  if (!fileUrl) {
    throw new Error('上传接口未返回文件地址')
  }

  return { fileUrl, raw }
}
