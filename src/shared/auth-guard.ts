import Taro from '@tarojs/taro'
import { useUserInfo } from '@/stores/user-info'
import { getAuthToken } from './auth-session'
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

export async function ensurePhoneBound(message = '绑定手机号后才能继续操作') {
  if (!getAuthToken()) {
    return ensureLoggedIn('请先登录并绑定手机号后继续操作')
  }

  const state = useUserInfo.getState()

  if (!state.userInfo && !state.profile) {
    await state.loadUserInfo().catch(() => undefined)
  }

  if (useUserInfo.getState().isPhoneBound) {
    return true
  }

  const result = await Taro.showModal({
    title: '需要绑定手机号',
    content: message,
    confirmText: '去绑定',
    cancelText: '取消'
  })

  if (result.confirm) {
    router.to(routes.userBindPhone, { redirect: getCurrentRoute() })
  }

  return false
}
