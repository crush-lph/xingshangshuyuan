import { readImageFileAsDataUri } from '@/shared/image-file'
import { api } from '@/shared/request'

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

export async function uploadFile(options: UploadFileOptions): Promise<UploadFileResult> {
  const image = readImageFileAsDataUri(options.filePath)
  const raw = await api.post<unknown>('/api/upload', {
    ...options.formData,
    ...(options.scene ? { scene: options.scene } : {}),
    image
  })
  const fileUrl = extractFileUrl(raw)

  if (!fileUrl) {
    throw new Error('上传接口未返回文件地址')
  }

  return { fileUrl, raw }
}
