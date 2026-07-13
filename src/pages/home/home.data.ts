import type {
  GetEventsData,
  GetNotificationsData,
  GetOpportunitiesData,
  GetPlatformStatsData,
  GetProductsData
} from '@/services'
import type { StatItem } from '@/components/business'
import { getAppIconName, type AppIconName } from '@/shared/app-icons'
import { parseRouteUrl, routes, type Query, type RoutePath } from '@/shared/router'
import { compactJoin, priceOf, textOf, textOrPlaceholder } from '@/shared/view-data'

export interface QuickEntry {
  label: string
  icon: AppIconName
  path: RoutePath
  query?: Query
  iconBackground: string
  iconColor: string
}

export interface NotificationEntry {
  id?: number
  title: string
  summary?: string
  meta?: string
  tag?: string
}

export interface ProductEntry {
  id?: number
  title: string
  desc: string
  price?: string
}

export interface EventEntry {
  id?: number
  title: string
  meta: string
  month: string
  day: string
  status?: number
  status_text?: string
}

export interface OpportunityEntry {
  id?: number
  title: string
  tag?: string
  meta: string
  time?: string
}

export interface CoreBusinessEntry {
  title: string
  subtitle?: string
  actionText?: string
}

export interface HomeSectionErrors {
  products: boolean
  event: boolean
  opportunity: boolean
}

export const HOME_QUICK_ENTRIES: QuickEntry[] = [
  {
    label: '找资源',
    icon: 'archive-line',
    path: routes.resourceHome,
    iconBackground: 'linear-gradient(135deg, rgba(22, 119, 255, 0.14), rgba(22, 119, 255, 0.28))',
    iconColor: '#1677FF'
  },
  {
    label: '采购标品',
    icon: 'shopping-bag-3-line',
    path: routes.resourcePurchase,
    iconBackground: 'linear-gradient(135deg, rgba(200, 150, 12, 0.14), rgba(240, 180, 41, 0.28))',
    iconColor: '#C8960C'
  },
  {
    label: '报名活动',
    icon: 'calendar-event-line',
    path: routes.eventHome,
    iconBackground: 'linear-gradient(135deg, rgba(56, 161, 105, 0.14), rgba(56, 161, 105, 0.28))',
    iconColor: '#38A169'
  },
  {
    label: '发布商机',
    icon: 'briefcase-4-line',
    path: routes.opportunityPublish,
    iconBackground: 'linear-gradient(135deg, rgba(123, 94, 167, 0.14), rgba(123, 94, 167, 0.28))',
    iconColor: '#7B5EA7'
  },
  {
    label: '加入会员',
    icon: 'vip-crown-line',
    path: routes.memberBenefit,
    iconBackground: 'linear-gradient(135deg, rgba(229, 62, 62, 0.14), rgba(229, 62, 62, 0.28))',
    iconColor: '#E53E3E'
  },
  {
    label: '企业认证',
    icon: 'trophy-line',
    path: routes.userCert,
    iconBackground: 'linear-gradient(135deg, rgba(10, 31, 92, 0.14), rgba(10, 31, 92, 0.28))',
    iconColor: '#0A1F5C'
  }
]

const knownRoutePaths = new Set<RoutePath>(Object.values(routes))

function routeFromApi(linkUrl: string | undefined) {
  const parsed = parseRouteUrl(linkUrl)
  return parsed && knownRoutePaths.has(parsed.path) ? parsed : undefined
}

export function routePathFromApi(linkUrl: string | undefined): RoutePath | undefined {
  return routeFromApi(linkUrl)?.path
}

function routeFromQuickEntryLabel(label: string): Pick<QuickEntry, 'path' | 'query'> | undefined {
  if (label.includes('代账')) return { path: routes.resourceList, query: { keyword: label } }
  if (label.includes('课程') || label.includes('学习') || label.includes('书苑') || label.includes('财税资讯')) {
    return { path: routes.shuyuan }
  }
  if (label.includes('商机')) return { path: routes.opportunityHome }
  if (label.includes('资质') || label.includes('认证')) return { path: routes.userCert }
  if (label.includes('咨询')) return { path: routes.services }
  return undefined
}

function getDateParts(value: string | null | undefined): Pick<EventEntry, 'month' | 'day'> {
  const text = textOf(value)
  if (!text) return { month: '--月', day: '--' }

  const date = new Date(text.replace(/-/g, '/'))
  if (Number.isNaN(date.getTime())) return { month: '--月', day: '--' }

  return {
    month: `${String(date.getMonth() + 1).padStart(2, '0')}月`,
    day: String(date.getDate()).padStart(2, '0')
  }
}

export function mapProduct(item: NonNullable<GetProductsData['list']>[number]): ProductEntry {
  return {
    id: item.id,
    title: textOrPlaceholder(item.name, '未命名资源'),
    desc: textOrPlaceholder(item.description ?? item.product_type_text, '接口未返回资源描述'),
    price: priceOf(item.vip_price ?? item.price, item.price_unit)
  }
}

export function mapEvent(item: NonNullable<GetEventsData['list']>[number]): EventEntry {
  return {
    id: item.id,
    title: textOrPlaceholder(item.title, '未命名活动'),
    meta: compactJoin([item.city, item.location, item.start_time]) || '接口未返回活动时间地点',
    status: item.status,
    status_text: item.status_text,
    ...getDateParts(item.event_date ?? item.start_time)
  }
}

export function isOpenRegistrationEvent(item: NonNullable<GetEventsData['list']>[number]) {
  return item.status === 1 || textOf(item.status_text) === '报名中'
}

export function mapOpportunity(item: NonNullable<GetOpportunitiesData['list']>[number]): OpportunityEntry {
  return {
    id: item.id,
    title: textOrPlaceholder(item.title, '未命名商机'),
    tag: item.apply_count ? `${item.apply_count}人申请` : textOf(item.type_text),
    meta: compactJoin([item.type_text, item.city, item.tags?.join('/')]) || '接口未返回商机摘要',
    time: textOf(item.time_ago ?? item.created_at)
  }
}

export function mapNotification(item: NonNullable<GetNotificationsData['list']>[number]): NotificationEntry {
  return {
    id: item.id,
    title: textOrPlaceholder(item.title, '未命名动态'),
    summary: textOf(item.summary),
    meta: textOf(item.published_at),
    tag: item.is_top ? '置顶' : textOf(item.type_text)
  }
}

export function mapPlatformStat(item: NonNullable<GetPlatformStatsData['list']>[number]): StatItem {
  return {
    label: textOrPlaceholder(item.stat_label ?? item.stat_key, '平台数据'),
    value: textOrPlaceholder(item.stat_value),
    tone: 'brand'
  }
}

export function mapQuickEntry(item: { name?: string; icon?: string; link_url?: string }, index: number): QuickEntry {
  const fallback = HOME_QUICK_ENTRIES[index % HOME_QUICK_ENTRIES.length]
  const label = textOrPlaceholder(item.name, fallback.label)
  const apiRoute = routeFromApi(item.link_url)
  const labelRoute = routeFromQuickEntryLabel(label)
  const path = apiRoute?.path ?? labelRoute?.path ?? fallback.path

  return {
    label,
    icon: getAppIconName(label, item.icon, path, fallback.icon),
    path,
    query: apiRoute?.query ?? labelRoute?.query,
    iconBackground: fallback.iconBackground,
    iconColor: fallback.iconColor
  }
}
