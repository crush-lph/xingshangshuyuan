import Taro from '@tarojs/taro'

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

export function dateTimeRangeOf(date: unknown, startTime?: unknown, endTime?: unknown) {
  const dateText = textOf(date)
  const startText = textOf(startTime)
  const endText = textOf(endTime)

  if (dateText && startText && endText) {
    return `${dateText} ${startText}-${endText}`
  }

  if (dateText && startText) {
    return `${dateText} ${startText}`
  }

  if (startText && endText) {
    return `${startText}-${endText}`
  }

  return dateText ?? startText ?? endText
}

function normalizePriceText(value: string) {
  const text = value.trim()

  if (!text) {
    return undefined
  }

  if (/^(免费|面议)$/u.test(text)) {
    return text
  }

  const amount = text.replace(/^￥/u, '¥').replace(/元$/u, '')
  return amount.startsWith('¥') ? amount : `¥${amount}`
}

function isStandalonePriceText(value: string) {
  return /^(免费|面议)$/u.test(value)
}

function normalizePriceUnit(unit: unknown) {
  const text = textOf(unit)

  if (!text) {
    return undefined
  }

  const normalized = text
    .replace(/^\/+/u, '')
    .replace(/^每/u, '')
    .replace(/^元\/?/u, '')

  return normalized && normalized !== '元' ? normalized : undefined
}

export function priceOf(value: unknown, unit?: unknown) {
  const price = textOf(value)

  if (!price) {
    return undefined
  }

  const normalized = normalizePriceText(price)

  if (!normalized) {
    return undefined
  }

  if (normalized.includes('/') || isStandalonePriceText(normalized)) {
    return normalized
  }

  const suffix = normalizePriceUnit(unit)
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

export function getPageParam(name: string) {
  return Taro.getCurrentInstance().router?.params?.[name]
}
