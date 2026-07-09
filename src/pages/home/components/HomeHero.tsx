import type { CSSProperties } from 'react'
import { Text, View } from '@tarojs/components'

const HOME_TRUST_STATS = [
  { value: '7000+', label: '合作机构' },
  { value: '3000+', label: '付费会员' },
  { value: '10000+', label: '业务对接' },
  { value: '10+', label: '战略供应商' }
]

const TRUST_PANEL_GAP = 4
const TRUST_PANEL_HEIGHT = 62
const HERO_BOTTOM_SPACE = 16

interface HomeHeroProps {
  navbarHeight: number
}

export function HomeHero({ navbarHeight }: HomeHeroProps) {
  const heroStyle: CSSProperties = {
    height: `${navbarHeight + TRUST_PANEL_GAP + TRUST_PANEL_HEIGHT + HERO_BOTTOM_SPACE}px`
  }
  const trustPanelStyle: CSSProperties = {
    top: `${navbarHeight + TRUST_PANEL_GAP}px`,
    height: `${TRUST_PANEL_HEIGHT}px`
  }

  return (
    <View
      className="relative overflow-hidden bg-[linear-gradient(145deg,#07143A_0%,#0A1F5C_58%,#0B3348_100%)]"
      style={heroStyle}
    >
      <View className="absolute left-4 right-4 top-[330rpx] h-[3rpx] rounded-full bg-gradient-to-r from-transparent via-gold-light/85 to-transparent" />
      <View
        className="absolute inset-x-4 overflow-hidden rounded-[18px] border border-white/20 bg-white/[0.16] shadow-medium"
        style={trustPanelStyle}
      >
        <View className="h-[4rpx] bg-gradient-to-r from-transparent via-gold-light/90 to-transparent" />
        <View className="grid h-full grid-cols-4">
          {HOME_TRUST_STATS.map((item, index) => (
            <View
              key={item.label}
              className={`flex min-w-0 flex-col items-center justify-center px-1 text-center ${
                index === 0 ? '' : 'border-l border-white/16'
              }`}
            >
              <Text className="block text-[28rpx] font-bold leading-[36rpx] text-gold-light">{item.value}</Text>
              <Text className="mt-[4rpx] block text-[20rpx] font-semibold leading-[28rpx] text-white/82">
                {item.label}
              </Text>
            </View>
          ))}
        </View>
      </View>
      <View className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-b from-transparent to-canvas" />
    </View>
  )
}
