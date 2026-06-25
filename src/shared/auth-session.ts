import Taro from '@tarojs/taro'

const AUTH_TOKEN_STORAGE_KEY = 'xingshangshuyuan:auth-token'

let authToken: string | undefined
const unauthorizedListeners = new Set<() => void>()

function readStorageToken() {
  try {
    const token = Taro.getStorageSync<string>(AUTH_TOKEN_STORAGE_KEY)
    return typeof token === 'string' && token.trim() ? token : undefined
  } catch {
    return undefined
  }
}

function writeStorageToken(token: string | undefined) {
  try {
    if (token) {
      Taro.setStorageSync(AUTH_TOKEN_STORAGE_KEY, token)
      return
    }

    Taro.removeStorageSync(AUTH_TOKEN_STORAGE_KEY)
  } catch {
    // Storage can fail in restricted runtimes; keep the in-memory token usable.
  }
}

export function getAuthToken() {
  authToken = authToken ?? readStorageToken()
  return authToken
}

export function setAuthToken(token: string | undefined) {
  authToken = token?.trim() || undefined
  writeStorageToken(authToken)
}

export function clearAuthToken() {
  setAuthToken(undefined)
}

export function onUnauthorized(listener: () => void) {
  unauthorizedListeners.add(listener)
  return () => unauthorizedListeners.delete(listener)
}

export function notifyUnauthorized() {
  clearAuthToken()
  unauthorizedListeners.forEach((listener) => listener())
}
