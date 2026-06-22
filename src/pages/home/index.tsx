import { useEffect, useState } from 'react'
import { View, Text } from '@tarojs/components'
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
  getQuickEntries,
  getSystemStatus,
  getUserProfile,
  type GetEventsData,
  type GetOpportunitiesData,
  type GetProductsData
} from '@/services'
import { EmptyState } from '@/components/business'
import { router, routes, type RoutePath } from '@/shared/router'
import { compactJoin, priceOf, textOf, textOrPlaceholder } from '@/shared/view-data'

interface QuickEntry {
  label: string
  icon: string
  path: RoutePath
}

interface StatEntry {
  value: string
  label: string
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

interface BannerEntry {
  title: string
  subtitle?: string
  path?: RoutePath
}

interface CoreBusinessEntry {
  title: string
  subtitle?: string
  actionText?: string
}

interface NotificationEntry {
  title: string
  summary?: string
  meta?: string
}

interface ProfileView {
  avatarText: string
  name: string
  companyName?: string
  memberText?: string
  certificationText?: string
}

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
  const [stats, setStats] = useState<StatEntry[]>([])
  const [quickEntries, setQuickEntries] = useState<QuickEntry[]>([])
  const [products, setProducts] = useState<ProductEntry[]>([])
  const [event, setEvent] = useState<EventEntry | null>(null)
  const [opportunity, setOpportunity] = useState<OpportunityEntry | null>(null)
  const [profile, setProfile] = useState<ProfileView | null>(null)
  const [banners, setBanners] = useState<BannerEntry[]>([])
  const [coreBusiness, setCoreBusiness] = useState<CoreBusinessEntry[]>([])
  const [notifications, setNotifications] = useState<NotificationEntry[]>([])
  const [systemStatus, setSystemStatus] = useState('')

  useEffect(() => {
    async function loadHomeData() {
      const [
        bannersResult,
        coreBusinessResult,
        notificationsResult,
        systemStatusResult,
        statsResult,
        quickEntriesResult,
        productsResult,
        eventsResult,
        opportunitiesResult,
        profileResult
      ] = await Promise.allSettled([
        getBanners(),
        getCoreBusiness(),
        getNotifications({ page: 1, page_size: 3 }),
        getSystemStatus(),
        getPlatformStats(),
        getQuickEntries(),
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

      if (notificationsResult.status === 'fulfilled') {
        setNotifications(
          (notificationsResult.value.data.list ?? []).map((item) => ({
            title: textOrPlaceholder(item.title, '未命名动态'),
            summary: textOf(item.summary),
            meta: compactJoin([item.type_text, item.published_at])
          }))
        )
      }

      if (systemStatusResult.status === 'fulfilled') {
        setSystemStatus(compactJoin([systemStatusResult.value.data.app, systemStatusResult.value.data.version]))
      }

      if (statsResult.status === 'fulfilled') {
        setStats(
          (statsResult.value.data.list ?? []).slice(0, 4).map((item) => ({
            value: textOrPlaceholder(item.stat_value, '0'),
            label: textOrPlaceholder(item.stat_label, '统计')
          }))
        )
      }

      if (quickEntriesResult.status === 'fulfilled') {
        setQuickEntries(
          (quickEntriesResult.value.data.list ?? []).slice(0, 6).map((item) => {
            const label = textOrPlaceholder(item.name, '入口')

            return {
              label,
              icon: textOf(item.icon) ?? label.slice(0, 1),
              path: routeFromApi(item.link_url) ?? routes.home
            }
          })
        )
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

  return (
    <View className="min-h-screen bg-canvas pb-6 text-ink">
      <View className="bg-brand px-5 pb-6 pt-5">
        <View className="flex items-start justify-between gap-3">
          <View>
            <Text className="block text-xl font-bold text-white">行商书苑</Text>
            <Text className="mt-1 block text-xs text-white/70">财税产业生态平台</Text>
          </View>
          <View className="rounded-full bg-white/15 px-3 py-1" onClick={() => router.to(routes.adminCheckin)}>
            <Text className="text-xs font-semibold text-white">待办</Text>
          </View>
          {systemStatus ? <Text className="mt-2 block text-xs text-white/50">{systemStatus}</Text> : null}
        </View>

        {profile ? (
          <View className="mt-4 flex items-center gap-3 rounded-lg bg-white/10 px-3 py-3">
            <View className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-brand">
              <Text className="font-bold">{profile.avatarText}</Text>
            </View>
            <View className="flex-1">
              <Text className="block text-sm font-semibold text-white">
                {compactJoin([profile.name, profile.companyName])}
              </Text>
              {profile.memberText ? (
                <Text className="mt-1 block text-xs text-gold-light">{profile.memberText}</Text>
              ) : null}
            </View>
            {profile.certificationText ? (
              <View className="rounded bg-white/15 px-2 py-1" onClick={() => router.to(routes.userCert)}>
                <Text className="text-xs font-semibold text-white">{profile.certificationText}</Text>
              </View>
            ) : null}
          </View>
        ) : (
          <View className="mt-4 rounded-lg bg-white/10 px-3 py-3">
            <Text className="text-sm font-semibold text-white">暂无用户信息</Text>
          </View>
        )}

        <View className="mt-4 rounded-full bg-white px-4 py-3" onClick={() => router.to(routes.resourceList)}>
          <Text className="text-sm text-muted">搜索资源、活动、商机...</Text>
        </View>
      </View>

      <View className="px-4 py-3">
        {banners.length ? (
          banners.map((banner) => (
            <View
              key={banner.title}
              className="mb-3 rounded-lg bg-brand-deep p-4 shadow-medium"
              onClick={() => (banner.path ? router.to(banner.path) : undefined)}
            >
              <Text className="rounded bg-white/10 px-2 py-1 text-xs font-semibold text-gold-light">平台推荐</Text>
              <Text className="mt-3 block text-xl font-bold leading-7 text-white">{banner.title}</Text>
              {banner.subtitle ? (
                <Text className="mt-2 block text-sm leading-5 text-white/65">{banner.subtitle}</Text>
              ) : null}
            </View>
          ))
        ) : (
          <EmptyState title="暂无轮播" desc="Apifox mock 未返回首页轮播数据。" />
        )}

        {stats.length ? (
          <View className="mt-3 grid grid-cols-4 overflow-hidden rounded-lg bg-white shadow-soft">
            {stats.map((item, index) => (
              <View
                key={item.label}
                className={`px-1 py-4 text-center ${index === stats.length - 1 ? '' : 'border-r border-line'}`}
              >
                <Text className="block text-base font-bold text-brand">{item.value}</Text>
                <Text className="mt-1 block text-xs text-muted">{item.label}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View className="mt-3">
            <EmptyState title="暂无平台统计" desc="Apifox mock 未返回平台统计数据。" />
          </View>
        )}

        <View className="mt-3 rounded-lg bg-white p-4 shadow-soft">
          {quickEntries.length ? (
            <View className="grid grid-cols-3 gap-3">
              {quickEntries.map((entry) => (
                <View key={entry.label} className="items-center text-center" onClick={() => router.to(entry.path)}>
                  <View className="mx-auto flex h-11 w-11 items-center justify-center rounded-lg bg-brand-soft">
                    <Text className="text-sm font-bold text-brand">{entry.icon}</Text>
                  </View>
                  <Text className="mt-2 block text-xs font-semibold text-ink">{entry.label}</Text>
                </View>
              ))}
            </View>
          ) : (
            <EmptyState title="暂无快捷入口" desc="Apifox mock 未返回快捷入口数据。" />
          )}
        </View>

        <View className="mt-3 rounded-lg bg-white p-4 shadow-soft">
          <View className="mb-3 flex items-center justify-between">
            <Text className="text-base font-bold text-ink">核心业务</Text>
          </View>
          {coreBusiness.length ? (
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
          ) : (
            <EmptyState title="暂无核心业务" desc="Apifox mock 未返回核心业务配置。" />
          )}
        </View>

        <View className="mt-3 rounded-lg bg-white p-4 shadow-soft">
          <View className="mb-3 flex items-center justify-between">
            <Text className="text-base font-bold text-ink">热门资源推荐</Text>
            <Text className="text-xs font-medium text-tech" onClick={() => router.to(routes.resourceHome)}>
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
            <EmptyState title="暂无资源推荐" desc="Apifox mock 未返回商品列表数据。" />
          )}
        </View>

        <View className="mt-3 rounded-lg bg-white p-4 shadow-soft">
          <View className="mb-3 flex items-center justify-between">
            <Text className="text-base font-bold text-ink">近期线下活动</Text>
            <Text className="text-xs font-medium text-tech" onClick={() => router.to(routes.eventHome)}>
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
            <EmptyState title="暂无活动" desc="Apifox mock 未返回近期活动数据。" />
          )}
        </View>

        <View className="mt-3 rounded-lg bg-white p-4 shadow-soft">
          <View className="mb-3 flex items-center justify-between">
            <Text className="text-base font-bold text-ink">平台动态</Text>
          </View>
          {notifications.length ? (
            <View className="grid gap-2">
              {notifications.map((item) => (
                <View key={item.title} className="rounded-lg bg-canvas px-3 py-3">
                  <Text className="block text-sm font-semibold text-ink">{item.title}</Text>
                  {item.summary ? (
                    <Text className="mt-1 block text-xs leading-5 text-muted">{item.summary}</Text>
                  ) : null}
                  {item.meta ? <Text className="mt-2 block text-xs text-muted">{item.meta}</Text> : null}
                </View>
              ))}
            </View>
          ) : (
            <EmptyState title="暂无平台动态" desc="Apifox mock 未返回平台动态数据。" />
          )}
        </View>

        <View className="mt-3 rounded-lg bg-white p-4 shadow-soft">
          <View className="mb-3 flex items-center justify-between">
            <Text className="text-base font-bold text-ink">推荐商机</Text>
            <Text className="text-xs font-medium text-tech" onClick={() => router.to(routes.opportunityHome)}>
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
            <EmptyState title="暂无推荐商机" desc="Apifox mock 未返回商机列表数据。" />
          )}
        </View>
      </View>
    </View>
  )
}
