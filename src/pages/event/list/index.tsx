import { useEffect, useState } from 'react'
import { Text, View } from '@tarojs/components'
import { ItemList, ListLoadMore, SectionCard, StateNotice, type ListItem } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { getEvents } from '@/services'
import { routes } from '@/shared/router'
import { usePaginatedList } from '@/shared/use-paginated-list'
import { compactJoin, dateTimeRangeOf, priceOf, textOf, textOrPlaceholder } from '@/shared/view-data'

interface EventItem extends ListItem {
  city: string
}

type EventRecord = NonNullable<Awaited<ReturnType<typeof getEvents>>['data']['list']>[number]

function mapEvents(events: EventRecord[]): EventItem[] {
  return events.map((item) => {
    const city = textOrPlaceholder(item.city, '未提供城市')

    return {
      title: textOrPlaceholder(item.title, '未命名活动'),
      desc: textOrPlaceholder(item.status_text, '接口未返回活动状态'),
      meta: compactJoin([
        city,
        item.location,
        dateTimeRangeOf(item.event_date, item.start_time, item.end_time),
        item.current_count ? `${item.current_count}人已报名` : ''
      ]),
      price: priceOf(item.price),
      icon: 'calendar-event-line',
      tone: item.price ? 'gold' : 'success',
      city,
      path: routes.eventDetail,
      query: item.id ? { event_id: item.id } : undefined,
      action: '报名'
    }
  })
}

export default function EventListPage() {
  const [activeCity, setActiveCity] = useState('全部')
  const [cities, setCities] = useState(['全部'])
  const { hasError, hasMore, isLoading, isLoadingMore, items } = usePaginatedList<EventRecord, EventItem>({
    deps: [activeCity],
    fetchPage: ({ page, page_size }) =>
      getEvents({
        ...(activeCity !== '全部' ? { city: activeCity } : {}),
        page,
        page_size
      }),
    mapItems: mapEvents
  })

  useEffect(() => {
    async function loadCities() {
      const response = await getEvents({ page: 1, page_size: 50 })
      const nextCities = (response.data.list ?? []).map((item) => textOf(item.city)).filter(Boolean) as string[]

      setCities(['全部', ...Array.from(new Set(nextCities))])
    }

    void loadCities().catch(() => undefined)
  }, [])

  return (
    <PageShell title="活动列表" subtitle="按城市、主题和会员权益筛选活动。">
      <View className="grid gap-3">
        {isLoading ? <StateNotice state="loading" /> : null}
        {!isLoading && hasError ? <StateNotice state="error" /> : null}

        {!isLoading && !hasError ? (
          <>
            <SectionCard>
              <View className="flex flex-wrap gap-2">
                {cities.map((item) => (
                  <View
                    key={item}
                    className={`rounded-full px-3 py-2 ${activeCity === item ? 'bg-brand' : 'border border-line bg-white'}`}
                    onClick={() => setActiveCity(item)}
                  >
                    <Text className={`text-xs font-semibold ${activeCity === item ? 'text-white' : 'text-muted'}`}>
                      {item}
                    </Text>
                  </View>
                ))}
              </View>
            </SectionCard>
            {items.length ? (
              <>
                <ItemList items={items} />
                <ListLoadMore hasItems={items.length > 0} hasMore={hasMore} isLoadingMore={isLoadingMore} />
              </>
            ) : (
              <StateNotice state="empty" copy={{ title: '暂无活动', desc: '当前接口或筛选条件没有返回活动。' }} />
            )}
          </>
        ) : null}
      </View>
    </PageShell>
  )
}
