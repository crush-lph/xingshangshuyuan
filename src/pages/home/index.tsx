import { useEffect, useState, type CSSProperties } from 'react'
import { Image, Text, View } from '@tarojs/components'
import Button from '@nutui/nutui-react-taro/dist/es/packages/button'
import '@nutui/nutui-react-taro/dist/es/packages/button/style/css'
import {
  getBanners,
  getCoreBusiness,
  getEvents,
  getOpportunities,
  getProducts,
  getSystemStatus,
  getUserProfile,
  type GetEventsData,
  type GetOpportunitiesData,
  type GetProductsData
} from '@/services'
import { AppIcon } from '@/components/AppIcon'
import { EmptyState } from '@/components/business'
import type { AppIconName } from '@/shared/app-icons'
import { router, routes, type RoutePath } from '@/shared/router'
import { compactJoin, priceOf, textOf, textOrPlaceholder } from '@/shared/view-data'
import { HomeBannerCarousel, type HomeBannerItem } from './components/HomeBannerCarousel'
import { DEFAULT_IMMERSIVE_NAVBAR_HEIGHT, ImmersiveNavbar } from './components/ImmersiveNavbar'

interface QuickEntry {
  label: string
  icon: AppIconName
  path: RoutePath
  iconBackground: string
  iconColor: string
}

interface ProductEntry {
  id?: number
  title: string
  desc: string
  price?: string
}

interface EventEntry {
  id?: number
  title: string
  meta: string
  month: string
  day: string
}

interface OpportunityEntry {
  id?: number
  title: string
  tag?: string
  meta: string
  time?: string
}

interface CoreBusinessEntry {
  title: string
  subtitle?: string
  actionText?: string
}

interface ProfileView {
  avatarText: string
  name: string
  companyName?: string
  memberText?: string
  certificationText?: string
}

const FALLBACK_HERO_IMAGE =
  'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1000&q=82'

const HOME_QUICK_ENTRIES: QuickEntry[] = [
  {
    label: '找资源',
    icon: 'archive-line',
    path: routes.resourceHome,
    iconBackground: 'linear-gradient(135deg, rgba(22, 119, 255, 0.14), rgba(22, 119, 255, 0.28))',
    iconColor: '#1677FF'
  },
  {
    label: '采购标品',
    icon: 'shopping-bag-3-line',
    path: routes.resourcePurchase,
    iconBackground: 'linear-gradient(135deg, rgba(200, 150, 12, 0.14), rgba(240, 180, 41, 0.28))',
    iconColor: '#C8960C'
  },
  {
    label: '报名活动',
    icon: 'calendar-event-line',
    path: routes.eventHome,
    iconBackground: 'linear-gradient(135deg, rgba(56, 161, 105, 0.14), rgba(56, 161, 105, 0.28))',
    iconColor: '#38A169'
  },
  {
    label: '发布商机',
    icon: 'briefcase-4-line',
    path: routes.opportunityPublish,
    iconBackground: 'linear-gradient(135deg, rgba(123, 94, 167, 0.14), rgba(123, 94, 167, 0.28))',
    iconColor: '#7B5EA7'
  },
  {
    label: '加入会员',
    icon: 'vip-crown-line',
    path: routes.memberBenefit,
    iconBackground: 'linear-gradient(135deg, rgba(229, 62, 62, 0.14), rgba(229, 62, 62, 0.28))',
    iconColor: '#E53E3E'
  },
  {
    label: '企业认证',
    icon: 'trophy-line',
    path: routes.userCert,
    iconBackground: 'linear-gradient(135deg, rgba(10, 31, 92, 0.14), rgba(10, 31, 92, 0.28))',
    iconColor: '#0A1F5C'
  }
]

function routeFromApi(linkUrl: string | undefined): RoutePath | undefined {
  return linkUrl?.startsWith('/pages/') ? (linkUrl as RoutePath) : undefined
}

function getDateParts(value: string | null | undefined): Pick<EventEntry, 'month' | 'day'> {
  const text = textOf(value)

  if (!text) {
    return { month: '--月', day: '--' }
  }

  const date = new Date(text.replace(/-/g, '/'))
  if (Number.isNaN(date.getTime())) {
    return { month: '--月', day: '--' }
  }

  return {
    month: `${String(date.getMonth() + 1).padStart(2, '0')}月`,
    day: String(date.getDate()).padStart(2, '0')
  }
}

function mapProduct(item: NonNullable<GetProductsData['list']>[number]): ProductEntry {
  return {
    id: item.id,
    title: textOrPlaceholder(item.name, '未命名资源'),
    desc: textOrPlaceholder(item.description ?? item.product_type_text, '接口未返回资源描述'),
    price: priceOf(item.vip_price ?? item.price, item.price_unit)
  }
}

function mapEvent(item: NonNullable<GetEventsData['list']>[number]): EventEntry {
  return {
    id: item.id,
    title: textOrPlaceholder(item.title, '未命名活动'),
    meta: compactJoin([item.city, item.location, item.start_time]) || '接口未返回活动时间地点',
    ...getDateParts(item.start_time ?? item.event_date)
  }
}

function mapOpportunity(item: NonNullable<GetOpportunitiesData['list']>[number]): OpportunityEntry {
  return {
    id: item.id,
    title: textOrPlaceholder(item.title, '未命名商机'),
    tag: item.apply_count ? `${item.apply_count}人申请` : textOf(item.type_text),
    meta: compactJoin([item.type_text, item.city, item.tags?.join('/')]) || '接口未返回商机摘要',
    time: textOf(item.time_ago ?? item.created_at)
  }
}

export default function HomePage() {
  const [navbarHeight, setNavbarHeight] = useState(DEFAULT_IMMERSIVE_NAVBAR_HEIGHT)
  const [products, setProducts] = useState<ProductEntry[]>([])
  const [event, setEvent] = useState<EventEntry | null>(null)
  const [opportunity, setOpportunity] = useState<OpportunityEntry | null>(null)
  const [profile, setProfile] = useState<ProfileView | null>(null)
  const [banners, setBanners] = useState<HomeBannerItem[]>([])
  const [coreBusiness, setCoreBusiness] = useState<CoreBusinessEntry[]>([])
  const [systemStatus, setSystemStatus] = useState('')

  useEffect(() => {
    async function loadHomeData() {
      const [
        bannersResult,
        coreBusinessResult,
        systemStatusResult,
        productsResult,
        eventsResult,
        opportunitiesResult,
        profileResult
      ] = await Promise.allSettled([
        getBanners(),
        getCoreBusiness(),
        getSystemStatus(),
        getProducts({ page: 1, page_size: 2 }),
        getEvents({ page: 1, page_size: 1 }),
        getOpportunities({ page: 1, page_size: 1 }),
        getUserProfile()
      ])

      if (bannersResult.status === 'fulfilled') {
        setBanners(
          (bannersResult.value.data.list ?? []).map((item) => ({
            title: textOrPlaceholder(item.title, '未命名轮播'),
            subtitle: textOf(item.subtitle),
            imageUrl: textOf(item.image_url),
            path: routeFromApi(item.action_url)
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

      if (systemStatusResult.status === 'fulfilled') {
        setSystemStatus(compactJoin([systemStatusResult.value.data.app, systemStatusResult.value.data.version]))
      }

      if (productsResult.status === 'fulfilled') {
        setProducts((productsResult.value.data.list ?? []).slice(0, 2).map(mapProduct))
      }

      if (eventsResult.status === 'fulfilled') {
        const item = eventsResult.value.data.list?.[0]
        setEvent(item ? mapEvent(item) : null)
      }

      if (opportunitiesResult.status === 'fulfilled') {
        const item = opportunitiesResult.value.data.list?.[0]
        setOpportunity(item ? mapOpportunity(item) : null)
      }

      if (profileResult.status === 'fulfilled') {
        const data = profileResult.value.data
        const name = textOf(data.nickname)

        setProfile(
          name
            ? {
                avatarText: name.slice(0, 1),
                name,
                companyName: textOf(data.company_name),
                memberText: textOf(data.vip_level_text),
                certificationText: textOf(data.certification_status_text)
              }
            : null
        )
      }
    }

    void loadHomeData()
  }, [])

  const primaryBanner = banners[0]
  const secondaryBanners = banners.slice(1)
  const heroImageUrl = primaryBanner?.imageUrl || FALLBACK_HERO_IMAGE
  const heroStyle: CSSProperties = {
    height: `${navbarHeight + 96}px`
  }

  return (
    <View className="min-h-screen bg-canvas pb-6 text-ink">
      <ImmersiveNavbar
        title="行商书苑"
        subtitle="上海 · 商业撮合与线下活动"
        onSearchClick={() => router.to(routes.resourceList)}
        onHeightChange={setNavbarHeight}
      />

      <View className="relative overflow-hidden bg-brand-deep" style={heroStyle}>
        <Image className="absolute inset-0 h-full w-full" src={heroImageUrl} mode="aspectFill" />
        <View className="absolute inset-0 bg-brand-deep/55" />
        <View className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-b from-transparent to-canvas" />
      </View>

      <View className="px-4 py-3">
        {profile ? (
          <View className="mb-3 flex items-center gap-3 rounded-lg bg-white px-4 py-4 shadow-soft">
            <View className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-soft text-brand">
              <Text className="font-bold">{profile.avatarText}</Text>
            </View>
            <View className="flex-1">
              <Text className="block text-sm font-semibold text-ink">
                {compactJoin([profile.name, profile.companyName])}
              </Text>
              {profile.memberText ? (
                <Text className="mt-1 block text-xs font-semibold text-gold">{profile.memberText}</Text>
              ) : (
                <Text className="mt-1 block text-xs text-muted">完善资料后获得更精准撮合推荐</Text>
              )}
            </View>
            {profile.certificationText ? (
              <View className="rounded bg-gold-soft px-2 py-1" onClick={() => router.to(routes.userCert)}>
                <Text className="text-xs font-semibold text-gold">{profile.certificationText}</Text>
              </View>
            ) : null}
          </View>
        ) : (
          <View className="mb-3 flex items-center gap-3 rounded-lg bg-white px-4 py-4 shadow-soft">
            <View className="flex h-11 w-11 items-center justify-center rounded-lg bg-canvas text-muted">
              <AppIcon name="user-3-line" size={22} color="#9AA7BD" />
            </View>
            <View className="flex-1">
              <Text className="block text-sm font-semibold text-ink">未登录</Text>
              <Text className="mt-1 block text-xs text-muted">登录后查看会员与认证信息</Text>
            </View>
            <View className="rounded bg-brand-soft px-2 py-1" onClick={() => router.to(routes.profile)}>
              <Text className="text-xs font-semibold text-brand">登录</Text>
            </View>
          </View>
        )}

        <HomeBannerCarousel items={secondaryBanners} />

        <View className="mt-3 flex items-center justify-between rounded-lg bg-white px-4 py-3 shadow-soft">
          <View>
            <Text className="block text-sm font-semibold text-ink">运营待办</Text>
            <Text className="mt-1 block text-xs text-muted">{systemStatus || '活动签到、资质审核和资源管理'}</Text>
          </View>
          <View className="rounded-lg bg-brand px-3 py-2" onClick={() => router.to(routes.adminCheckin)}>
            <Text className="text-xs font-semibold text-white">查看</Text>
          </View>
        </View>

        <View className="mt-3 rounded-lg bg-white p-[14px] shadow-soft">
          <View className="grid grid-cols-3 gap-3">
            {HOME_QUICK_ENTRIES.map((entry) => (
              <View key={entry.label} className="items-center text-center" onClick={() => router.to(entry.path)}>
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
                onClick={() => router.to(routes.resourceStandardDetail, item.id ? { product_id: item.id } : undefined)}
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
          ) : (
            <EmptyState title="暂无资源推荐" />
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
                  onClick={() => router.to(routes.eventSignup, event.id ? { event_id: event.id } : undefined)}
                >
                  报名
                </Button>
              </View>
            </View>
          ) : (
            <EmptyState title="暂无活动" />
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
          ) : (
            <EmptyState title="暂无推荐商机" />
          )}
        </View>
      </View>
    </View>
  )
}
