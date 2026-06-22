import { routes, type KnownRoutePath, type RoutePath } from './router'
import { textOf } from './view-data'

export type AppIconName =
  | 'apps-2-line'
  | 'archive-line'
  | 'book-open-line'
  | 'briefcase-4-line'
  | 'building-2-line'
  | 'calendar-event-line'
  | 'coins-line'
  | 'file-list-3-line'
  | 'graduation-cap-line'
  | 'hand-heart-line'
  | 'search-line'
  | 'service-line'
  | 'settings-3-line'
  | 'shopping-bag-3-line'
  | 'star-line'
  | 'trophy-line'
  | 'user-3-line'
  | 'vip-crown-line'
  | (string & {})

const remixIconNamePattern = /^[a-z0-9]+(?:-[a-z0-9]+)*-(line|fill)$/

const iconByRoute: Partial<Record<KnownRoutePath, AppIconName>> = {
  [routes.services]: 'service-line',
  [routes.shuyuan]: 'book-open-line',
  [routes.resourceHome]: 'archive-line',
  [routes.resourceList]: 'archive-line',
  [routes.resourceSubmit]: 'archive-line',
  [routes.resourcePurchase]: 'shopping-bag-3-line',
  [routes.eventHome]: 'calendar-event-line',
  [routes.eventList]: 'calendar-event-line',
  [routes.eventTicket]: 'calendar-event-line',
  [routes.memberBenefit]: 'vip-crown-line',
  [routes.opportunityHome]: 'briefcase-4-line',
  [routes.opportunityPublish]: 'briefcase-4-line',
  [routes.userCert]: 'building-2-line',
  [routes.userOrders]: 'file-list-3-line',
  [routes.userEvents]: 'calendar-event-line',
  [routes.userBenefits]: 'vip-crown-line',
  [routes.userPoints]: 'coins-line',
  [routes.userReviews]: 'star-line'
}

const iconByKeyword: Array<{ keywords: string[]; icon: AppIconName }> = [
  { keywords: ['会员', '权益', 'vip', 'VIP'], icon: 'vip-crown-line' },
  { keywords: ['订单', '单据'], icon: 'file-list-3-line' },
  { keywords: ['活动', '票券', '报名'], icon: 'calendar-event-line' },
  { keywords: ['资源', '商品', '商城'], icon: 'archive-line' },
  { keywords: ['商机', '机会', '需求'], icon: 'briefcase-4-line' },
  { keywords: ['企业', '认证', '公司'], icon: 'building-2-line' },
  { keywords: ['积分', '金币'], icon: 'coins-line' },
  { keywords: ['评价', '收藏'], icon: 'star-line' },
  { keywords: ['书苑', '课程', '学习', '培训'], icon: 'book-open-line' },
  { keywords: ['服务', '客服', '咨询'], icon: 'service-line' }
]

export function normalizeRemixIconName(value: string | null | undefined): AppIconName | undefined {
  const iconName = textOf(value)?.replace(/^ri-/, '')

  if (!iconName || !remixIconNamePattern.test(iconName)) {
    return undefined
  }

  return iconName
}

export function getAppIconName(
  label: string,
  rawIcon?: string | null,
  path?: RoutePath,
  fallback: AppIconName = 'apps-2-line'
): AppIconName {
  const iconFromApi = normalizeRemixIconName(rawIcon)

  if (iconFromApi) {
    return iconFromApi
  }

  const iconFromRoute = path ? iconByRoute[path as KnownRoutePath] : undefined

  if (iconFromRoute) {
    return iconFromRoute
  }

  return iconByKeyword.find((item) => item.keywords.some((keyword) => label.includes(keyword)))?.icon ?? fallback
}
