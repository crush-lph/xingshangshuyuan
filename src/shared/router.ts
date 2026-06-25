import Taro from '@tarojs/taro'

export const routes = {
  home: '/pages/home/index',
  services: '/pages/services/index',
  shuyuan: '/pages/shuyuan/index',
  profile: '/pages/profile/index',
  resourceHome: '/pages/resource/home/index',
  resourceList: '/pages/resource/list/index',
  resourceStandardDetail: '/pages/resource/standard-detail/index',
  resourceNonstandardDetail: '/pages/resource/nonstandard-detail/index',
  resourceSubmit: '/pages/resource/submit/index',
  resourcePurchase: '/pages/resource/purchase/index',
  eventHome: '/pages/event/home/index',
  eventList: '/pages/event/list/index',
  eventDetail: '/pages/event/detail/index',
  eventSignup: '/pages/event/signup/index',
  eventGroup: '/pages/event/group/index',
  eventTicket: '/pages/event/ticket/index',
  memberBenefit: '/pages/member/benefit/index',
  memberConfirm: '/pages/member/confirm/index',
  paymentTransfer: '/pages/member/payment-transfer/index',
  opportunityHome: '/pages/opportunity/home/index',
  opportunityDetail: '/pages/opportunity/detail/index',
  opportunityPublish: '/pages/opportunity/publish/index',
  opportunityApply: '/pages/opportunity/apply/index',
  userCert: '/pages/user/cert/index',
  userLogin: '/pages/user/login/index',
  userBindPhone: '/pages/user/bind-phone/index',
  userOrders: '/pages/user/orders/index',
  userEvents: '/pages/user/events/index',
  userBenefits: '/pages/user/benefits/index',
  userPoints: '/pages/user/points/index',
  userReviews: '/pages/user/reviews/index',
  userSettings: '/pages/user/settings/index',
  adminCheckin: '/pages/admin/checkin/index',
  adminCert: '/pages/admin/cert/index',
  adminOrders: '/pages/admin/orders/index',
  adminResource: '/pages/admin/resource/index',
  adminOpportunity: '/pages/admin/opportunity/index'
} as const

export const tabRoutePaths = [routes.home, routes.services, routes.shuyuan, routes.profile] as const

export type KnownRoutePath = (typeof routes)[keyof typeof routes]
export type TabRoutePath = (typeof tabRoutePaths)[number]
export type RoutePath = KnownRoutePath | `/${string}`
export type PageRoutePath = Exclude<RoutePath, TabRoutePath>
export type QueryValue = string | number | boolean | null | undefined
export type Query = Record<string, QueryValue>
export interface ParsedRoute {
  path: RoutePath
  query?: Query
}

const tabRoutes = new Set<string>(tabRoutePaths)

function hasQuery(query?: Query) {
  return Object.values(query ?? {}).some((value) => value !== null && value !== undefined)
}

function assertTabRouteQuery(path: RoutePath, query?: Query) {
  if (tabRoutes.has(path) && hasQuery(query)) {
    throw new Error(`Tab route ${path} does not support query parameters`)
  }
}

function assertNotTabRoute(path: RoutePath, action: string) {
  if (tabRoutes.has(path)) {
    throw new Error(`${action} cannot open tab route ${path}; use router.to or router.switchTab`)
  }
}

export function buildUrl(path: RoutePath, query?: Query) {
  const search = Object.entries(query ?? {})
    .filter(([, value]) => value !== null && value !== undefined)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&')

  if (!search) {
    return path
  }

  return `${path}${path.includes('?') ? '&' : '?'}${search}`
}

function decodeRouteValue(value: string) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function parseQuery(search: string) {
  return search
    .split('&')
    .filter(Boolean)
    .reduce<Query>((query, item) => {
      const [rawKey, rawValue = ''] = item.split('=')
      const key = decodeRouteValue(rawKey)

      if (key) {
        query[key] = decodeRouteValue(rawValue)
      }

      return query
    }, {})
}

export function parseRouteUrl(url: string | undefined): ParsedRoute | undefined {
  if (!url) {
    return undefined
  }

  const normalizedUrl = url.startsWith('/pages/') ? url : decodeRouteValue(url)

  if (!normalizedUrl.startsWith('/pages/')) {
    return undefined
  }

  const [path, search = ''] = normalizedUrl.split('?')
  const query = parseQuery(search)

  return {
    path: path as RoutePath,
    query: tabRoutes.has(path) ? undefined : query
  }
}

export function getSafeRedirectRoute(redirect: string | undefined, fallback: RoutePath = routes.profile): ParsedRoute {
  const parsed = parseRouteUrl(redirect)

  if (!parsed || parsed.path === routes.userLogin || parsed.path === routes.userBindPhone) {
    return { path: fallback }
  }

  return parsed
}

export const router = {
  to(path: RoutePath, query?: Query) {
    if (tabRoutes.has(path)) {
      assertTabRouteQuery(path, query)
      return Taro.switchTab({ url: path })
    }

    return Taro.navigateTo({ url: buildUrl(path, query) })
  },
  redirect(path: PageRoutePath, query?: Query) {
    assertNotTabRoute(path, 'redirect')
    return Taro.redirectTo({ url: buildUrl(path, query) })
  },
  reLaunch(path: RoutePath, query?: Query) {
    assertTabRouteQuery(path, query)
    return Taro.reLaunch({ url: buildUrl(path, query) })
  },
  switchTab(path: TabRoutePath) {
    return Taro.switchTab({ url: path })
  },
  back(delta = 1) {
    return Taro.navigateBack({ delta })
  },
  open(route: ParsedRoute) {
    return router.to(route.path, route.query)
  }
}
