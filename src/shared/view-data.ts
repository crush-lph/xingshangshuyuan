import Taro from '@tarojs/taro'
import type { Query, RoutePath } from './router'

export type UnknownRecord = Record<string, unknown>

export function isRecord(value: unknown): value is UnknownRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

export function textOf(value: unknown) {
  if (typeof value === 'string') {
    const text = value.trim()
    return text || undefined
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }

  return undefined
}

export function numberOf(value: unknown) {
  if (typeof value === 'number') {
    return value
  }

  if (typeof value === 'string' && value.trim()) {
    const number = Number(value)
    return Number.isNaN(number) ? undefined : number
  }

  return undefined
}

export function textOrPlaceholder(value: unknown, placeholder = '未提供') {
  return textOf(value) ?? placeholder
}

export function priceOf(value: unknown, unit?: unknown) {
  const price = textOf(value)

  if (!price) {
    return undefined
  }

  const suffix = textOf(unit)
  const normalized = price.startsWith('¥') ? price : `¥${price}`
  return suffix ? `${normalized}/${suffix}` : normalized
}

export function compactJoin(values: unknown[], separator = ' · ') {
  return values
    .map((value) => textOf(value))
    .filter((value): value is string => Boolean(value))
    .join(separator)
}

export function firstRecordList(...values: unknown[]) {
  for (const value of values) {
    if (Array.isArray(value)) {
      return value.filter(isRecord)
    }

    if (isRecord(value) && Array.isArray(value.list)) {
      return value.list.filter(isRecord)
    }
  }

  return []
}

export function firstId(value: unknown) {
  if (!isRecord(value)) {
    return undefined
  }

  return textOf(value.id ?? value.product_id ?? value.course_id ?? value.event_id ?? value.opportunity_id)
}

export function routeWithQuery(path: RoutePath, query: Query): RoutePath {
  const search = Object.entries(query)
    .filter(([, value]) => value !== null && value !== undefined)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&')

  return search ? (`${path}?${search}` as RoutePath) : path
}

export function getPageParam(name: string) {
  return Taro.getCurrentInstance().router?.params?.[name]
}
