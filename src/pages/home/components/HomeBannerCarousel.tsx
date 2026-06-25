import { useState } from 'react'
import { Image, Text, View } from '@tarojs/components'
import Swiper from '@nutui/nutui-react-taro/dist/es/packages/swiper'
import SwiperItem from '@nutui/nutui-react-taro/dist/es/packages/swiperitem'
import '@nutui/nutui-react-taro/dist/es/packages/swiper/style/css'
import { router, type RoutePath } from '@/shared/router'

export interface HomeBannerItem {
  title: string
  subtitle?: string
  imageUrl?: string
  path?: RoutePath
}

interface HomeBannerCarouselProps {
  items?: HomeBannerItem[]
}

export function HomeBannerCarousel({ items = [] }: HomeBannerCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const bannerItems = items.filter((item) => item.title)
  const normalizedActiveIndex = bannerItems.length ? activeIndex % bannerItems.length : 0

  if (!bannerItems.length) {
    return null
  }

  return (
    <View className="relative overflow-hidden rounded-lg bg-brand-deep shadow-medium">
      <Swiper
        height={148}
        indicator={false}
        autoplay
        loop
        interval={3600}
        duration={420}
        onChange={(event) => setActiveIndex(event.detail.current)}
      >
        {bannerItems.map((item) => (
          <SwiperItem key={`${item.title}-${item.imageUrl ?? 'banner'}`}>
            <View
              className="relative h-full overflow-hidden bg-brand-deep"
              onClick={() => {
                if (item.path) {
                  router.to(item.path)
                }
              }}
            >
              {item.imageUrl ? (
                <Image className="absolute inset-0 h-full w-full" src={item.imageUrl} mode="aspectFill" />
              ) : null}
              <View className="absolute inset-0 bg-brand-deep/45" />
              <View className="absolute bottom-0 left-0 right-0 p-4">
                <Text className="block text-lg font-extrabold text-white">{item.title}</Text>
                {item.subtitle ? <Text className="mt-1 block text-xs text-white/75">{item.subtitle}</Text> : null}
              </View>
            </View>
          </SwiperItem>
        ))}
      </Swiper>
      <View className="absolute bottom-2 left-0 right-0 flex items-center justify-center gap-[5px]">
        {bannerItems.map((item, index) => (
          <View
            key={`${item.title}-indicator`}
            className={`h-[4rpx] rounded-sm ${index === normalizedActiveIndex ? 'w-6 bg-gold-light' : 'w-[18px] bg-white/35'}`}
          />
        ))}
      </View>
    </View>
  )
}
