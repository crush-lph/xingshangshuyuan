import { getAbout, getUserProfile, getVipLevels, type VipLevelItem } from '@/services'
import {
  firstRecordList,
  isRecord,
  numberOf,
  priceOf,
  textOf,
  textOrPlaceholder,
  type UnknownRecord
} from '@/shared/view-data'

export const DEFAULT_TARGET_LEVEL_VALUE = 2

export interface MemberDataSnapshot {
  levelText: string
  levels: VipLevelItem[]
  targetLevel: VipLevelItem | null
  aboutText: string
  hasAnySuccess: boolean
}

export const compareRows = [
  { label: '供应链价格', elite: '会员价', navigator: '战略底价' },
  { label: '线下课程', elite: '基础会务费', navigator: '权益票' },
  { label: '年度峰会', elite: '会员价', navigator: '免费含晚宴' },
  { label: '商机申请', elite: '优先', navigator: '高优先级' },
  { label: '知行塾', elite: '暂未开放', navigator: '私董会资格' },
  { label: '系统权益', elite: '1个月试用', navigator: '1年免费' }
]

const fallbackPerks = {
  elite: ['资源供应链底价采购', '线下课基础会务费', '商机优先申请权', '授牌·菁英会员资格', '1个月系统试用权益'],
  navigator: [
    '战略供应商底价',
    '峰会免费门票（含晚宴）',
    '高价值商机优先获取',
    '知行塾·私董会参与资格',
    '1年系统免费使用权益',
    '授牌·领航标杆资格'
  ]
}

function normalizePerk(record: UnknownRecord, index: number) {
  return {
    perk_name: textOrPlaceholder(record.perk_name ?? record.name ?? record.title ?? record.label, `权益${index + 1}`),
    perk_icon: textOf(record.perk_icon ?? record.icon)
  }
}

function normalizePerks(value: unknown) {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map((item, index) => {
      if (typeof item === 'string') {
        return { perk_name: textOrPlaceholder(item, `权益${index + 1}`) }
      }

      return isRecord(item) ? normalizePerk(item, index) : null
    })
    .filter((item): item is { perk_name: string; perk_icon?: string } => Boolean(item))
}

function firstPerks(...values: unknown[]) {
  for (const value of values) {
    const perks = normalizePerks(value)

    if (perks.length) {
      return perks
    }
  }

  return []
}

function priceValueOf(value: unknown) {
  return typeof value === 'number' || value === null ? value : textOf(value)
}

function normalizeVipLevel(record: UnknownRecord): VipLevelItem {
  const directPerks = firstPerks(record.perks, record.rights, record.items)
  const listPerks = firstRecordList(record.list).map(normalizePerk)

  return {
    level: numberOf(record.level ?? record.vip_level),
    level_text: textOf(record.level_text ?? record.vip_level_text),
    name: textOf(record.name ?? record.title),
    original_price: priceValueOf(record.original_price ?? record.market_price ?? record.origin_price),
    current_price: priceValueOf(record.current_price ?? record.price ?? record.amount),
    discount_rate: numberOf(record.discount_rate),
    perks: directPerks.length ? directPerks : listPerks
  }
}

function normalizeVipLevels(data: unknown) {
  return firstRecordList(data)
    .map(normalizeVipLevel)
    .sort((left, right) => (left.level ?? 0) - (right.level ?? 0))
}

export function getNavigatorLevel(levels: VipLevelItem[]) {
  return (
    levels.find((item) => item.level === DEFAULT_TARGET_LEVEL_VALUE || getLevelTitle(item)?.includes('领航')) ??
    levels[0]
  )
}

export async function fetchMemberDataSnapshot(): Promise<MemberDataSnapshot> {
  const [profileResult, levelsResult, aboutResult] = await Promise.allSettled([
    getUserProfile(),
    getVipLevels(),
    getAbout()
  ])

  const aboutData = aboutResult.status === 'fulfilled' ? aboutResult.value.data : null
  const levels = levelsResult.status === 'fulfilled' ? normalizeVipLevels(levelsResult.value.data) : []

  return {
    levelText: profileResult.status === 'fulfilled' ? (textOf(profileResult.value.data.vip_level_text) ?? '') : '',
    levels,
    targetLevel: getNavigatorLevel(levels) ?? null,
    aboutText: isRecord(aboutData) ? (textOf(aboutData.description ?? aboutData.content ?? aboutData.about) ?? '') : '',
    hasAnySuccess: [profileResult, levelsResult, aboutResult].some((result) => result.status === 'fulfilled')
  }
}

export function isNavigatorLevel(level: VipLevelItem) {
  return level.level === DEFAULT_TARGET_LEVEL_VALUE || Boolean(getLevelTitle(level)?.includes('领航'))
}

export function getLevelTitle(level: VipLevelItem | null | undefined) {
  return textOf(level?.level_text ?? level?.name)
}

export function getPerkNames(level: VipLevelItem) {
  const apiPerks = (level.perks ?? [])
    .map((item) => (typeof item === 'string' ? textOf(item) : textOf(item.perk_name)))
    .filter((item): item is string => Boolean(item))
  return apiPerks.length ? apiPerks : isNavigatorLevel(level) ? fallbackPerks.navigator : fallbackPerks.elite
}

export function isFreeLevel(level: VipLevelItem | null) {
  return numberOf(level?.current_price) === 0
}

export function getVipPriceText(value: unknown) {
  const price = numberOf(value)

  if (price === 0) {
    return '免费'
  }

  return price === undefined ? priceOf(value) : `¥${price.toLocaleString('zh-CN', { maximumFractionDigits: 2 })}`
}

export function getDisplayPriceText(level: VipLevelItem) {
  return getVipPriceText(level.current_price) ?? (isNavigatorLevel(level) ? '¥12,800' : '¥4,980')
}

export function getButtonText(level: VipLevelItem) {
  if (isFreeLevel(level)) {
    return `免费开通${textOrPlaceholder(getLevelTitle(level), '会员')}`
  }

  const price = getVipPriceText(level.current_price)
  return price ? `立即开通 ${price}` : '立即开通'
}

export function getLevelDescription(level: VipLevelItem) {
  return isNavigatorLevel(level)
    ? '适合需要商机优先、峰会资源和战略底价的机构'
    : '适合开始接入平台资源和基础会员权益的机构'
}
