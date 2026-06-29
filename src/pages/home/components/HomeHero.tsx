import type { CSSProperties } from 'react'
import { Image, Text, View } from '@tarojs/components'

const HOME_TRUST_STATS = [
  { value: '7000+', label: '合作机构' },
  { value: '3000+', label: '付费会员' },
  { value: '10000+', label: '业务对接' },
  { value: '10+', label: '战略供应商' }
]

interface HomeHeroProps {
  navbarHeight: number
  imageUrl?: string
}

export function HomeHero({ navbarHeight, imageUrl }: HomeHeroProps) {
  const heroStyle: CSSProperties = {
    height: `${navbarHeight + 96}px`
  }

  return (
    <View
      className="relative overflow-hidden bg-[linear-gradient(145deg,#07143A_0%,#0A1F5C_58%,#0B3348_100%)]"
      style={heroStyle}
    >
      {imageUrl ? <Image className="absolute inset-0 h-full w-full" src={imageUrl} mode="aspectFill" /> : null}
      {imageUrl ? <View className="absolute inset-0 bg-brand-deep/58" /> : null}
      <View className="absolute left-4 right-4 top-[330rpx] h-[3rpx] rounded-full bg-gradient-to-r from-transparent via-gold-light/85 to-transparent" />
      <View className="absolute inset-x-4 bottom-5 overflow-hidden rounded-[18px] border border-white/20 bg-white/[0.16] shadow-medium">
        <View className="h-[4rpx] bg-gradient-to-r from-transparent via-gold-light/90 to-transparent" />
        <View className="grid grid-cols-4">
          {HOME_TRUST_STATS.map((item, index) => (
            <View key={item.label} className={`px-1 py-3 text-center ${index === 0 ? '' : 'border-l border-white/16'}`}>
              <Text className="block text-[28rpx] font-bold leading-[36rpx] text-gold-light">{item.value}</Text>
              <Text className="mt-1 block text-[20rpx] font-semibold leading-[28rpx] text-white/82">{item.label}</Text>
            </View>
          ))}
        </View>
      </View>
      <View className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-b from-transparent to-canvas" />
    </View>
  )
}
