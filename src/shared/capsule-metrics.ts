import Taro from '@tarojs/taro'

export interface CapsuleNavMetrics {
  navHeight: number
  menuTop: number
  menuHeight: number
  menuPlaceholderWidth: number
}

export const defaultCapsuleNavMetrics: CapsuleNavMetrics = {
  navHeight: 84,
  menuTop: 48,
  menuHeight: 32,
  menuPlaceholderWidth: 104
}

export function getCapsuleNavMetrics(): CapsuleNavMetrics {
  try {
    const systemInfo = Taro.getSystemInfoSync()
    const statusBarHeight = systemInfo.statusBarHeight ?? 44
    const menuButton = Taro.getMenuButtonBoundingClientRect()
    const navHeight = menuButton.bottom + menuButton.top - statusBarHeight
    const menuPlaceholderWidth =
      systemInfo.windowWidth && menuButton.left ? systemInfo.windowWidth - menuButton.left + 8 : 104

    return {
      navHeight,
      menuTop: menuButton.top,
      menuHeight: menuButton.height,
      menuPlaceholderWidth
    }
  } catch {
    return defaultCapsuleNavMetrics
  }
}
