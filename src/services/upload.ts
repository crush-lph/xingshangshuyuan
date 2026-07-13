import Taro from '@tarojs/taro'
import { notifyUnauthorized } from '@/shared/auth-session'
import { assertBusinessSuccess, getRequestHeader, resolveRequestUrl } from '@/shared/request'

export interface UploadFileOptions {
  filePath: string
  scene?: string
  name?: string
  formData?: Record<string, string | number | boolean>
}

export interface UploadFileResult {
  fileUrl: string
  raw: unknown
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
  const fields = ['url', 'file_url', 'fileUrl', 'file_path', 'filePath', 'path', 'src', 'full_url', 'fullUrl', 'key']

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

function parseUploadResponse(data: string) {
  try {
    return JSON.parse(data) as unknown
  } catch {
    return data
  }
}

function createUploadHeader() {
  const header = getRequestHeader()

  // Let the mini-program runtime generate the multipart boundary.
  delete header['content-type']
  delete header['Content-Type']

  return header
}

export async function uploadFile(options: UploadFileOptions): Promise<UploadFileResult> {
  const response = await Taro.uploadFile({
    url: resolveRequestUrl('/api/upload'),
    filePath: options.filePath,
    name: options.name ?? 'file',
    header: createUploadHeader(),
    formData: {
      ...options.formData,
      ...(options.scene ? { scene: options.scene } : {})
    }
  })

  if (response.statusCode < 200 || response.statusCode >= 300) {
    if (response.statusCode === 401) {
      notifyUnauthorized()
    }
    throw new Error(`文件上传失败（${response.statusCode}）`)
  }

  const raw = assertBusinessSuccess(parseUploadResponse(response.data))
  const fileUrl = extractFileUrl(raw)

  if (!fileUrl) {
    throw new Error('上传接口未返回文件地址')
  }

  return { fileUrl, raw }
}
