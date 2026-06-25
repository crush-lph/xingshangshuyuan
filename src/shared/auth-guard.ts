import Taro from '@tarojs/taro'
import { getAuthToken } from './auth-session'
import { router, routes } from './router'

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
    router.to(routes.profile)
  }

  return false
}
