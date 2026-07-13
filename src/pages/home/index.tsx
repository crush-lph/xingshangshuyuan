import { useEffect, useState } from 'react'
import { Text, View } from '@tarojs/components'
import Button from '@nutui/nutui-react-taro/dist/es/packages/button'
import '@nutui/nutui-react-taro/dist/es/packages/button/style/css'
import {
  getBanners,
  getCoreBusiness,
  getEvents,
  getNotifications,
  getOpportunities,
  getPlatformStats,
  getProducts,
  getQuickEntries
} from '@/services'
import { AppIcon } from '@/components/AppIcon'
import { StateNotice, StatGrid, type StatItem } from '@/components/business'
import { openEventSignupIfAvailable } from '@/shared/event-registration'
import { router, routes } from '@/shared/router'
import { textOf, textOrPlaceholder } from '@/shared/view-data'
import { HomeBannerCarousel, type HomeBannerItem } from './components/HomeBannerCarousel'
import { HomeHero } from './components/HomeHero'
import { DEFAULT_IMMERSIVE_NAVBAR_HEIGHT, ImmersiveNavbar } from './components/ImmersiveNavbar'
import {
  HOME_QUICK_ENTRIES,
  isOpenRegistrationEvent,
  mapEvent,
  mapNotification,
  mapOpportunity,
  mapPlatformStat,
  mapProduct,
  mapQuickEntry,
  routePathFromApi,
  type CoreBusinessEntry,
  type EventEntry,
  type HomeSectionErrors,
  type NotificationEntry,
  type OpportunityEntry,
  type ProductEntry,
  type QuickEntry
} from './home.data'

export default function HomePage() {
  const [navbarHeight, setNavbarHeight] = useState(DEFAULT_IMMERSIVE_NAVBAR_HEIGHT)
  const [products, setProducts] = useState<ProductEntry[]>([])
  const [event, setEvent] = useState<EventEntry | null>(null)
  const [opportunity, setOpportunity] = useState<OpportunityEntry | null>(null)
  const [banners, setBanners] = useState<HomeBannerItem[]>([])
  const [coreBusiness, setCoreBusiness] = useState<CoreBusinessEntry[]>([])
  const [quickEntries, setQuickEntries] = useState<QuickEntry[]>(HOME_QUICK_ENTRIES)
  const [platformStats, setPlatformStats] = useState<StatItem[]>([])
  const [notifications, setNotifications] = useState<NotificationEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [sectionErrors, setSectionErrors] = useState<HomeSectionErrors>({
    products: false,
    event: false,
    opportunity: false
  })

  useEffect(() => {
    async function loadHomeData() {
      setIsLoading(true)
      setHasError(false)
      setSectionErrors({
        products: false,
        event: false,
        opportunity: false
      })

      const [
        bannersResult,
        coreBusinessResult,
        quickEntriesResult,
        platformStatsResult,
        notificationsResult,
        productsResult,
        eventsResult,
        opportunitiesResult
      ] = await Promise.allSettled([
        getBanners(),
        getCoreBusiness(),
        getQuickEntries(),
        getPlatformStats(),
        getNotifications({ page: 1, page_size: 3 }),
        getProducts({ page: 1, page_size: 2 }),
        getEvents({ status: 1, page: 1, page_size: 5 }),
        getOpportunities({ page: 1, page_size: 1 })
      ])

      setHasError(
        bannersResult.status === 'rejected' &&
          coreBusinessResult.status === 'rejected' &&
          quickEntriesResult.status === 'rejected' &&
          platformStatsResult.status === 'rejected' &&
          notificationsResult.status === 'rejected' &&
          productsResult.status === 'rejected' &&
          eventsResult.status === 'rejected' &&
          opportunitiesResult.status === 'rejected'
      )
      setSectionErrors({
        products: productsResult.status === 'rejected',
        event: eventsResult.status === 'rejected',
        opportunity: opportunitiesResult.status === 'rejected'
      })

      if (bannersResult.status === 'fulfilled') {
        setBanners(
          (bannersResult.value.data.list ?? []).map((item) => ({
            title: textOrPlaceholder(item.title, '未命名轮播'),
            subtitle: textOf(item.subtitle),
            imageUrl: textOf(item.image_url),
            path: routePathFromApi(item.action_url)
          }))
        )
      }

      if (coreBusinessResult.status === 'fulfilled') {
        setCoreBusiness(
          (coreBusinessResult.value.data.list ?? []).map((item) => ({
            title: textOrPlaceholder(item.title, '未命名业务'),
            subtitle: textOf(item.subtitle ?? item.product_type_text),
            actionText: textOf(item.action_text)
          }))
        )
      }

      if (quickEntriesResult.status === 'fulfilled') {
        const entries = quickEntriesResult.value.data.list ?? []
        setQuickEntries(entries.length ? entries.slice(0, 6).map(mapQuickEntry) : HOME_QUICK_ENTRIES)
      }

      if (platformStatsResult.status === 'fulfilled') {
        setPlatformStats((platformStatsResult.value.data.list ?? []).slice(0, 4).map(mapPlatformStat))
      }

      if (notificationsResult.status === 'fulfilled') {
        setNotifications((notificationsResult.value.data.list ?? []).slice(0, 3).map(mapNotification))
      }

      if (productsResult.status === 'fulfilled') {
        setProducts((productsResult.value.data.list ?? []).slice(0, 2).map(mapProduct))
      }

      if (eventsResult.status === 'fulfilled') {
        const eventList = eventsResult.value.data.list ?? []
        const item = eventList.find(isOpenRegistrationEvent) ?? eventList[0]
        setEvent(item ? mapEvent(item) : null)
      }

      if (opportunitiesResult.status === 'fulfilled') {
        const item = opportunitiesResult.value.data.list?.[0]
        setOpportunity(item ? mapOpportunity(item) : null)
      }

      setIsLoading(false)
    }

    void loadHomeData()
  }, [])

  return (
    <View className="min-h-screen bg-canvas pb-6 text-ink">
      <ImmersiveNavbar
        title="行商书苑"
        subtitle="笃行致远 · 聚商共赢"
        onSearchClick={() => router.to(routes.resourceList)}
        onHeightChange={setNavbarHeight}
      />

      <HomeHero navbarHeight={navbarHeight} />

      <View className="px-4 py-3">
        {isLoading ? <StateNotice state="loading" /> : null}
        {!isLoading && hasError ? <StateNotice state="error" /> : null}

        {!isLoading && !hasError ? (
          <>
            <HomeBannerCarousel items={banners} />

            <View className="mt-3 rounded-lg bg-white p-[14px] shadow-soft">
              <View className="grid grid-cols-3 gap-3">
                {quickEntries.map((entry) => (
                  <View
                    key={entry.label}
                    className="items-center text-center"
                    onClick={() => router.to(entry.path, entry.query)}
                  >
                    <View
                      className="mx-auto flex h-12 w-12 items-center justify-center rounded-[14px]"
                      style={{ background: entry.iconBackground }}
                    >
                      <AppIcon name={entry.icon} size={22} color={entry.iconColor} />
                    </View>
                    <Text className="mt-2 block text-xs font-semibold text-ink">{entry.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            {coreBusiness.length ? (
              <View className="mt-3 rounded-lg bg-white p-4 shadow-soft">
                <View className="mb-3 flex items-center gap-2">
                  <View className="h-4 w-1 rounded bg-gold" />
                  <Text className="text-base font-bold text-ink">核心业务</Text>
                </View>
                <View className="grid gap-2">
                  {coreBusiness.map((item) => (
                    <View key={item.title} className="rounded-lg bg-canvas px-3 py-3">
                      <Text className="block text-sm font-semibold text-ink">{item.title}</Text>
                      {item.subtitle ? (
                        <Text className="mt-1 block text-xs leading-5 text-muted">{item.subtitle}</Text>
                      ) : null}
                      {item.actionText ? (
                        <Text className="mt-2 block text-xs font-semibold text-tech">{item.actionText}</Text>
                      ) : null}
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            {platformStats.length ? (
              <View className="mt-3">
                <StatGrid items={platformStats} />
              </View>
            ) : null}

            {notifications.length ? (
              <View className="mt-3 rounded-lg bg-white p-4 shadow-soft">
                <View className="mb-3 flex items-center gap-2">
                  <View className="h-4 w-1 rounded bg-gold" />
                  <Text className="text-base font-bold text-ink">平台动态</Text>
                </View>
                <View className="grid gap-3">
                  {notifications.map((item) => (
                    <View key={item.id ?? item.title} className="rounded-lg bg-canvas px-3 py-3">
                      <View className="flex items-start justify-between gap-2">
                        <Text className="flex-1 text-sm font-semibold leading-5 text-ink">{item.title}</Text>
                        {item.tag ? (
                          <Text className="rounded bg-brand-soft px-2 py-1 text-xs font-semibold text-brand">
                            {item.tag}
                          </Text>
                        ) : null}
                      </View>
                      {item.summary ? (
                        <Text className="mt-1 block text-xs leading-5 text-muted">{item.summary}</Text>
                      ) : null}
                      {item.meta ? <Text className="mt-2 block text-xs text-muted">{item.meta}</Text> : null}
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            <View className="mt-3 rounded-lg bg-white p-4 shadow-soft">
              <View className="mb-3 flex items-center justify-between">
                <View className="flex items-center gap-2">
                  <View className="h-4 w-1 rounded bg-gold" />
                  <Text className="text-base font-bold text-ink">热门资源推荐</Text>
                </View>
                <Text className="text-xs font-semibold text-tech" onClick={() => router.to(routes.resourceHome)}>
                  查看全部 ›
                </Text>
              </View>
              {products.length ? (
                products.map((item) => (
                  <View
                    key={`${item.id ?? item.title}`}
                    className="border-t border-line py-3"
                    onClick={() =>
                      router.to(routes.resourceStandardDetail, item.id ? { product_id: item.id } : undefined)
                    }
                  >
                    <View className="flex items-center justify-between gap-3">
                      <View className="flex-1">
                        <Text className="block text-sm font-semibold text-ink">{item.title}</Text>
                        <Text className="mt-1 block text-xs leading-5 text-muted">{item.desc}</Text>
                      </View>
                      {item.price ? <Text className="text-sm font-bold text-gold">{item.price}</Text> : null}
                    </View>
                  </View>
                ))
              ) : sectionErrors.products ? (
                <StateNotice
                  state="error"
                  copy={{ title: '资源加载失败', desc: '推荐资源暂时无法获取，请稍后重试。' }}
                />
              ) : (
                <StateNotice state="empty" copy={{ title: '暂无资源推荐', desc: '当前接口没有返回推荐资源。' }} />
              )}
            </View>

            <View className="mt-3 rounded-lg bg-white p-4 shadow-soft">
              <View className="mb-3 flex items-center justify-between">
                <View className="flex items-center gap-2">
                  <View className="h-4 w-1 rounded bg-gold" />
                  <Text className="text-base font-bold text-ink">近期线下活动</Text>
                </View>
                <Text className="text-xs font-semibold text-tech" onClick={() => router.to(routes.eventHome)}>
                  查看全部 ›
                </Text>
              </View>
              {event ? (
                <View
                  className="rounded-lg bg-canvas p-3"
                  onClick={() => router.to(routes.eventDetail, event.id ? { event_id: event.id } : undefined)}
                >
                  <View className="flex items-center gap-3">
                    <View className="rounded-lg bg-brand px-3 py-2 text-center">
                      <Text className="block text-xs text-white/70">{event.month}</Text>
                      <Text className="block text-lg font-bold text-white">{event.day}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="block text-sm font-semibold text-ink">{event.title}</Text>
                      <Text className="mt-1 block text-xs text-muted">{event.meta}</Text>
                    </View>
                    <Button
                      type="primary"
                      size="small"
                      className="h-10 rounded-full border-0 px-4"
                      onClick={(clickEvent) => {
                        clickEvent.stopPropagation()
                        openEventSignupIfAvailable(event)
                      }}
                    >
                      报名
                    </Button>
                  </View>
                </View>
              ) : sectionErrors.event ? (
                <StateNotice
                  state="error"
                  copy={{ title: '活动加载失败', desc: '近期活动暂时无法获取，请稍后重试。' }}
                />
              ) : (
                <StateNotice state="empty" copy={{ title: '暂无活动', desc: '当前接口没有返回近期活动。' }} />
              )}
            </View>

            <View className="mt-3 rounded-lg bg-brand-deep p-4 shadow-medium">
              <Text className="block text-xs font-semibold text-gold-light">行商会员特权</Text>
              <Text className="mt-1 block text-base font-bold text-white">加入会员，获取供应链底价</Text>
              <View className="mt-3 grid grid-cols-2 gap-2">
                <View className="rounded-lg bg-white/10 px-3 py-3" onClick={() => router.to(routes.memberBenefit)}>
                  <Text className="block text-xs font-semibold text-white">行商·菁英会员</Text>
                  <Text className="mt-1 block text-xs text-gold-light">查看年度权益</Text>
                </View>
                <View className="rounded-lg bg-white/10 px-3 py-3" onClick={() => router.to(routes.memberBenefit)}>
                  <Text className="block text-xs font-semibold text-white">行商·领航会员</Text>
                  <Text className="mt-1 block text-xs text-gold-light">升级企业服务</Text>
                </View>
              </View>
            </View>

            <View className="mt-3 rounded-lg bg-white p-4 shadow-soft">
              <View className="mb-3 flex items-center justify-between">
                <View className="flex items-center gap-2">
                  <View className="h-4 w-1 rounded bg-gold" />
                  <Text className="text-base font-bold text-ink">推荐商机</Text>
                </View>
                <Text className="text-xs font-semibold text-tech" onClick={() => router.to(routes.opportunityHome)}>
                  查看全部 ›
                </Text>
              </View>
              {opportunity ? (
                <View
                  className="rounded-lg border border-line p-3"
                  onClick={() =>
                    router.to(routes.opportunityDetail, opportunity.id ? { opportunity_id: opportunity.id } : undefined)
                  }
                >
                  <View className="flex items-start justify-between gap-3">
                    <Text className="flex-1 text-sm font-semibold leading-5 text-ink">{opportunity.title}</Text>
                    {opportunity.tag ? (
                      <Text className="rounded bg-gold-soft px-2 py-1 text-xs font-semibold text-gold">
                        {opportunity.tag}
                      </Text>
                    ) : null}
                  </View>
                  <Text className="mt-2 block text-xs text-muted">{opportunity.meta}</Text>
                  {opportunity.time ? <Text className="mt-3 block text-xs text-muted">{opportunity.time}</Text> : null}
                </View>
              ) : sectionErrors.opportunity ? (
                <StateNotice
                  state="error"
                  copy={{ title: '商机加载失败', desc: '推荐商机暂时无法获取，请稍后重试。' }}
                />
              ) : (
                <StateNotice state="empty" copy={{ title: '暂无推荐商机', desc: '当前接口没有返回推荐商机。' }} />
              )}
            </View>
          </>
        ) : null}
      </View>
    </View>
  )
}
