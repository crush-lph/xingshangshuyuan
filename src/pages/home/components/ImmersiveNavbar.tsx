import { useEffect, useState, type CSSProperties } from 'react'
import { Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { AppIcon } from '@/components/AppIcon'
import { defaultCapsuleNavMetrics, getCapsuleNavMetrics } from '@/shared'

const NAV_SEARCH_GAP = 10
const NAV_SEARCH_HEIGHT = 44
const NAV_BOTTOM_PADDING = 8
const SCROLL_SOLID_DISTANCE = 112

export const DEFAULT_IMMERSIVE_NAVBAR_HEIGHT = 146

interface ImmersiveNavbarProps {
  title: string
  subtitle: string
  searchPlaceholder?: string
  onSearchClick?: () => void
  onHeightChange?: (height: number) => void
}

function getTransitionProgress(progress: number, start: number, end: number) {
  return Math.min(1, Math.max(0, (progress - start) / (end - start)))
}

export function ImmersiveNavbar({
  title,
  subtitle,
  searchPlaceholder = '搜索活动、资源方、合作需求',
  onSearchClick,
  onHeightChange
}: ImmersiveNavbarProps) {
  const [navProgress, setNavProgress] = useState(0)
  const [navMetrics] = useState(() => getCapsuleNavMetrics() ?? defaultCapsuleNavMetrics)

  Taro.usePageScroll(({ scrollTop }) => {
    const nextProgress = Math.min(1, Math.max(0, scrollTop / SCROLL_SOLID_DISTANCE))
    const roundedProgress = Math.round(nextProgress * 100) / 100

    setNavProgress((current) => (Math.abs(current - roundedProgress) < 0.02 ? current : roundedProgress))
  })

  const navVisualHeight = navMetrics.navHeight + NAV_SEARCH_GAP + NAV_SEARCH_HEIGHT + NAV_BOTTOM_PADDING

  useEffect(() => {
    onHeightChange?.(navVisualHeight)
  }, [navVisualHeight, onHeightChange])

  const textTransitionProgress = getTransitionProgress(navProgress, 0.32, 0.72)
  const lightTextOpacity = 1 - textTransitionProgress * 0.9
  const darkTextOpacity = textTransitionProgress
  const darkSubtitleOpacity = 0.18 + textTransitionProgress * 0.82

  const navStyle: CSSProperties = {
    height: `${navVisualHeight}px`,
    backgroundColor: `rgba(255, 255, 255, ${0.96 * navProgress})`,
    boxShadow: `0 2px 16px rgba(10, 31, 92, ${0.1 * navProgress})`
  }
  const navRowStyle: CSSProperties = {
    height: `${navMetrics.menuHeight}px`,
    marginTop: `${navMetrics.menuTop}px`
  }
  const navMenuSpacerStyle: CSSProperties = {
    width: `${navMetrics.menuPlaceholderWidth}px`
  }
  const isSolidNav = navProgress > 0.45
  const searchStyle: CSSProperties = {
    height: `${NAV_SEARCH_HEIGHT}px`,
    marginTop: `${NAV_SEARCH_GAP}px`,
    backgroundColor: isSolidNav
      ? `rgba(255, 255, 255, ${0.9 + navProgress * 0.08})`
      : `rgba(255, 255, 255, ${0.16 + navProgress * 0.52})`,
    borderColor: isSolidNav
      ? `rgba(10, 31, 92, ${0.08 + navProgress * 0.08})`
      : `rgba(255, 255, 255, ${0.2 + navProgress * 0.42})`,
    boxShadow: isSolidNav
      ? `0 8px 24px rgba(10, 31, 92, ${0.08 + navProgress * 0.05})`
      : `0 8px 20px rgba(10, 31, 92, ${0.04 + navProgress * 0.04})`
  }
  const searchIconColor = isSolidNav ? '#1E5EFF' : 'rgba(255, 255, 255, 0.88)'
  const searchTextStyle: CSSProperties = {
    color: isSolidNav ? '#5F6F8F' : 'rgba(255, 255, 255, 0.82)'
  }
  const lightTitleStyle: CSSProperties = {
    opacity: lightTextOpacity,
    textShadow: `0 1px 8px rgba(5, 14, 46, ${0.24 * (1 - textTransitionProgress)})`
  }
  const darkTitleStyle: CSSProperties = {
    color: '#333D55',
    opacity: darkTextOpacity
  }
  const lightSubtitleStyle: CSSProperties = {
    opacity: lightTextOpacity * 0.78,
    textShadow: `0 1px 8px rgba(5, 14, 46, ${0.2 * (1 - textTransitionProgress)})`
  }
  const darkSubtitleStyle: CSSProperties = {
    color: '#6B7A99',
    opacity: darkSubtitleOpacity
  }

  return (
    <View className="fixed left-0 right-0 top-0 z-50 px-4" style={navStyle}>
      <View className="flex items-center justify-between gap-3" style={navRowStyle}>
        <View className="min-w-0 flex-1">
          <View className="relative h-5">
            <Text
              className="absolute left-0 top-0 block text-lg font-bold leading-5 text-white"
              style={lightTitleStyle}
            >
              {title}
            </Text>
            <Text className="absolute left-0 top-0 block text-lg font-bold leading-5" style={darkTitleStyle}>
              {title}
            </Text>
          </View>
          <View className="relative mt-1 h-4">
            <Text className="absolute left-0 top-0 block text-xs leading-4 text-white" style={lightSubtitleStyle}>
              {subtitle}
            </Text>
            <Text className="absolute left-0 top-0 block text-xs leading-4" style={darkSubtitleStyle}>
              {subtitle}
            </Text>
          </View>
        </View>
        <View style={navMenuSpacerStyle} />
      </View>
      <View className="flex items-center gap-2 rounded-full border px-4" style={searchStyle} onClick={onSearchClick}>
        <AppIcon name="search-line" size={17} color={searchIconColor} />
        <Text className="flex-1 text-sm font-medium" style={searchTextStyle}>
          {searchPlaceholder}
        </Text>
      </View>
    </View>
  )
}
