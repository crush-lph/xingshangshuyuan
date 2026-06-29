import { useState } from 'react'
import { Image, View } from '@tarojs/components'
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
  const bannerItems = items.filter((item) => item.imageUrl)
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
