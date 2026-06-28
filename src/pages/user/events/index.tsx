import { useEffect, useMemo, useState } from 'react'
import { Text, View } from '@tarojs/components'
import { ItemList, StateNotice, type ListItem } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { getUserEvents, type GetUserEventsData } from '@/services'
import { routes } from '@/shared/router'
import { compactJoin, priceOf, textOf, textOrPlaceholder } from '@/shared/view-data'

type UserEventRecord = NonNullable<GetUserEventsData['list']>[number]

interface UserEventItem extends ListItem {
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
    desc: textOrPlaceholder(item.status_text, '接口未返回报名状态'),
    meta:
      compactJoin([
        item.city,
        item.location,
        item.start_time ?? item.event_date,
        item.created_at ? `报名于 ${item.created_at}` : ''
      ]) || '接口未返回活动时间地点',
    price: priceOf(item.price),
    tag: textOf(item.status_text),
    icon: 'calendar-event-line',
    tone: getStatusTone(item.status),
    status: item.status,
    ...action
  }
}

export default function UserEventsPage() {
  const [activeTab, setActiveTab] = useState<(typeof eventTabs)[number]['label']>('全部')
  const [items, setItems] = useState<UserEventItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    async function loadUserEvents() {
      setIsLoading(true)
      setHasError(false)

      const response = await getUserEvents({ page: 1, page_size: 20 })
      setItems((response.data.list ?? []).map(mapUserEvent))
    }

    void loadUserEvents()
      .catch(() => {
        setItems([])
        setHasError(true)
      })
      .finally(() => setIsLoading(false))
  }, [])

  const visibleItems = useMemo(() => {
    const activeItem = eventTabs.find((item) => item.label === activeTab)
    const activeStatus = activeItem && 'status' in activeItem ? activeItem.status : undefined

    if (activeStatus === undefined) {
      return items
    }

    return items.filter((item) => item.status === activeStatus)
  }, [activeTab, items])

  return (
    <PageShell title="我的活动" subtitle="查看已报名活动、报名状态和电子票。">
      <View className="grid gap-3">
        <View className="flex gap-2 overflow-x-auto">
          {eventTabs.map((item) => {
            const isActive = activeTab === item.label

            return (
              <View
                key={item.label}
                className={`shrink-0 rounded-full px-4 py-2 ${isActive ? 'bg-brand' : 'border border-line bg-white'}`}
                onClick={() => setActiveTab(item.label)}
              >
                <Text className={`text-xs font-semibold ${isActive ? 'text-white' : 'text-muted'}`}>{item.label}</Text>
              </View>
            )
          })}
        </View>

        {isLoading ? (
          <StateNotice state="loading" copy={{ title: '正在加载活动记录', desc: '请稍候。' }} />
        ) : hasError ? (
          <StateNotice state="error" copy={{ title: '活动记录加载失败', desc: '请稍后重试。' }} />
        ) : visibleItems.length ? (
          <ItemList items={visibleItems} />
        ) : (
          <StateNotice state="empty" copy={{ title: '暂无活动记录', desc: '当前筛选条件下没有报名活动。' }} />
        )}
      </View>
    </PageShell>
  )
}
