import { useEffect, useRef, useState } from 'react'
import { ScrollView, Text, View } from '@tarojs/components'
import { AppIcon } from '@/components/AppIcon'
import { StateNotice } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { getUserEvents, type GetUserEventsData } from '@/services'
import { router, routes, type Query, type RoutePath } from '@/shared/router'
import { compactJoin, priceOf, textOf, textOrPlaceholder } from '@/shared/view-data'

type UserEventRecord = NonNullable<GetUserEventsData['list']>[number]

interface UserEventItem {
  title: string
  statusText: string
  tag?: string
  tone: 'brand' | 'success' | 'neutral'
  locationText?: string
  registeredText: string
  price?: string
  action: string
  path?: RoutePath
  query?: Query
  status?: number
}

const eventTabs = [
  { label: '全部' },
  { label: '已报名', status: 1 },
  { label: '已签到', status: 2 },
  { label: '已取消', status: 0 }
] as const

function getStatusTone(status?: number): UserEventItem['tone'] {
  if (status === 2) {
    return 'success'
  }

  if (status === 0) {
    return 'neutral'
  }

  return 'brand'
}

const statusToneClassName: Record<UserEventItem['tone'], string> = {
  brand: 'bg-brand-soft text-brand',
  success: 'bg-[#E6F7F0] text-[#2F855A]',
  neutral: 'bg-canvas text-muted'
}

function getEventAction(item: UserEventRecord) {
  if (item.status === 0) {
    return {
      action: '查看详情',
      path: routes.eventDetail,
      query: item.event_id ? { event_id: item.event_id } : undefined
    }
  }

  if (item.registration_id) {
    return {
      action: item.status === 2 ? '查看票券' : '查看电子票',
      path: routes.eventTicket,
      query: {
        registration_id: item.registration_id,
        event_id: item.event_id
      }
    }
  }

  return {
    action: '查看详情',
    path: routes.eventDetail,
    query: item.event_id ? { event_id: item.event_id } : undefined
  }
}

function mapUserEvent(item: UserEventRecord): UserEventItem {
  const action = getEventAction(item)

  return {
    title: textOrPlaceholder(item.event_title, '未命名活动'),
    statusText: textOrPlaceholder(item.status_text, '接口未返回报名状态'),
    locationText: compactJoin([item.city, item.location]) || undefined,
    registeredText: item.created_at
      ? `报名于 ${item.created_at}`
      : compactJoin([item.start_time ?? item.event_date]) || '接口未返回报名时间',
    price: priceOf(item.price),
    tag: textOf(item.status_text),
    tone: getStatusTone(item.status),
    status: item.status,
    ...action
  }
}

function UserEventCard({ item }: { item: UserEventItem }) {
  function openTarget() {
    if (item.path) {
      router.to(item.path, item.query)
    }
  }

  return (
    <View className="rounded-lg border border-line bg-white px-4 py-4 shadow-soft" onClick={openTarget}>
      <View className="flex items-start gap-3">
        <View className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
          <AppIcon name="calendar-event-line" size={21} />
        </View>
        <View className="min-w-0 flex-1">
          <View className="flex items-start justify-between gap-2">
            <Text className="min-w-0 flex-1 break-all text-base font-bold leading-6 text-ink">{item.title}</Text>
            {item.tag ? (
              <Text
                className={`shrink-0 rounded px-2 py-1 text-[20rpx] font-semibold ${statusToneClassName[item.tone]}`}
              >
                {item.tag}
              </Text>
            ) : null}
          </View>
          <View className="mt-2 flex items-end gap-3">
            <View className="grid min-w-0 flex-1 gap-1">
              <Text className="block text-sm leading-5 text-muted">{item.statusText}</Text>
              {item.locationText ? (
                <View className="flex min-w-0 items-start gap-1">
                  <AppIcon name="map-pin-line" size={15} color="#6B7897" />
                  <Text className="min-w-0 flex-1 break-all text-sm font-semibold leading-5 text-ink">
                    {item.locationText}
                  </Text>
                </View>
              ) : null}
            </View>
            {item.price ? (
              <Text className="max-w-[220rpx] shrink-0 break-all text-right text-lg font-bold leading-6 text-gold">
                {item.price}
              </Text>
            ) : null}
          </View>
        </View>
      </View>

      <View className="mt-3 h-px bg-line" />

      <View className="mt-3 flex items-center justify-between gap-3">
        <Text className="min-w-0 flex-1 break-all text-xs leading-5 text-muted">{item.registeredText}</Text>
        <View className="ml-auto flex shrink-0 items-center justify-end gap-1">
          <Text className="text-xs font-semibold leading-4 text-tech">{item.action}</Text>
          <AppIcon name="arrow-right-s-line" size={18} color="#1677FF" />
        </View>
      </View>
    </View>
  )
}

export default function UserEventsPage() {
  const [activeTab, setActiveTab] = useState<(typeof eventTabs)[number]['label']>('全部')
  const [items, setItems] = useState<UserEventItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const requestIdRef = useRef(0)

  useEffect(() => {
    const currentRequestId = requestIdRef.current + 1
    const activeItem = eventTabs.find((item) => item.label === activeTab)
    const activeStatus = activeItem && 'status' in activeItem ? activeItem.status : undefined

    requestIdRef.current = currentRequestId

    async function loadUserEvents() {
      setIsLoading(true)
      setHasError(false)

      try {
        const response = await getUserEvents({
          ...(activeStatus !== undefined ? { status: activeStatus } : {}),
          page: 1,
          page_size: 20
        })

        if (requestIdRef.current !== currentRequestId) {
          return
        }

        setItems((response.data.list ?? []).map(mapUserEvent))
      } catch {
        if (requestIdRef.current !== currentRequestId) {
          return
        }

        setItems([])
        setHasError(true)
      } finally {
        if (requestIdRef.current === currentRequestId) {
          setIsLoading(false)
        }
      }
    }

    void loadUserEvents()
  }, [activeTab])

  return (
    <PageShell title="我的活动" subtitle="查看已报名活动、报名状态和电子票。">
      <View className="grid gap-3">
        <ScrollView scrollX enhanced showScrollbar={false} className="whitespace-nowrap">
          <View className="inline-flex gap-2 pr-1">
            {eventTabs.map((item) => {
              const isActive = activeTab === item.label

              return (
                <View
                  key={item.label}
                  className={`shrink-0 rounded-full border px-4 py-2 ${
                    isActive ? 'border-brand bg-brand' : 'border-transparent bg-white'
                  }`}
                  onClick={() => setActiveTab(item.label)}
                >
                  <Text className={`text-xs font-semibold ${isActive ? 'text-white' : 'text-muted'}`}>
                    {item.label}
                  </Text>
                </View>
              )
            })}
          </View>
        </ScrollView>

        {isLoading ? (
          <StateNotice state="loading" copy={{ title: '正在加载活动记录', desc: '请稍候。' }} />
        ) : hasError ? (
          <StateNotice state="error" copy={{ title: '活动记录加载失败', desc: '请稍后重试。' }} />
        ) : items.length ? (
          <View className="grid gap-3">
            {items.map((item, index) => (
              <UserEventCard key={`${item.title}-${index}`} item={item} />
            ))}
          </View>
        ) : (
          <StateNotice state="empty" copy={{ title: '暂无活动记录', desc: '当前筛选条件下没有报名活动。' }} />
        )}
      </View>
    </PageShell>
  )
}
