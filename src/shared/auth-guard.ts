import Taro from '@tarojs/taro'
import { getAuthToken, onUnauthorized } from './auth-session'
import { buildUrl, router, routes, type Query, type RoutePath } from './router'

function getCurrentRoute() {
  const currentRouter = Taro.getCurrentInstance().router
  const path = currentRouter?.path

  if (!path) {
    return undefined
  }

  const routePath = path.startsWith('/') ? path : `/${path}`
  const query = Object.entries(currentRouter.params ?? {}).reduce<Query>((result, [key, value]) => {
    if (key !== '$taroTimestamp') {
      result[key] = value
    }

    return result
  }, {})

  return buildUrl(routePath as RoutePath, query)
}

let isRedirectingToLogin = false

function isLoginRoute() {
  const path = Taro.getCurrentInstance().router?.path
  const normalizedPath = path?.startsWith('/') ? path : path ? `/${path}` : undefined
  return normalizedPath === routes.userLogin || normalizedPath === routes.userBindPhone
}

async function redirectUnauthorizedToLogin() {
  if (isLoginRoute() || isRedirectingToLogin) {
    return
  }

  const redirect = getCurrentRoute()
  isRedirectingToLogin = true

  try {
    await router.to(routes.userLogin, { redirect })
  } finally {
    isRedirectingToLogin = false
  }
}

export function bindUnauthorizedLoginPrompt() {
  return onUnauthorized(() => {
    void redirectUnauthorizedToLogin().catch(() => {
      // A navigation failure should not create an unhandled rejection.
    })
  })
}

export async function ensureLoggedIn(message = '登录后才能继续操作') {
  if (getAuthToken()) {
    return true
  }

  const result = await Taro.showModal({
    title: '需要登录',
    content: message,
    confirmText: '去登录',
    cancelText: '取消'
  })

  if (result.confirm) {
    router.to(routes.userLogin, { redirect: getCurrentRoute() })
  }

  return false
}

export async function openRouteWithAuth(path: RoutePath, query?: Query) {
  const requiresLogin = path.startsWith('/pages/user/') || path.startsWith('/pages/admin/')

  if (!requiresLogin || getAuthToken()) {
    router.to(path, query)
    return true
  }

  const result = await Taro.showModal({
    title: '需要登录',
    content: '登录后才能查看该页面',
    confirmText: '去登录',
    cancelText: '取消'
  })

  if (result.confirm) {
    router.to(routes.userLogin, { redirect: buildUrl(path, query) })
  }

  return false
}
