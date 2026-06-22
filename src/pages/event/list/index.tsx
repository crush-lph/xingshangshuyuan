import { useEffect, useMemo, useState } from 'react'
import { Text, View } from '@tarojs/components'
import { EmptyState, ItemList, SectionCard, type ListItem } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { getEvents } from '@/services'
import { routes } from '@/shared/router'
import { compactJoin, priceOf, textOf, textOrPlaceholder } from '@/shared/view-data'

interface EventItem extends ListItem {
  city: string
}

export default function EventListPage() {
  const [activeCity, setActiveCity] = useState('全部')
  const [cities, setCities] = useState(['全部'])
  const [items, setItems] = useState<EventItem[]>([])

  useEffect(() => {
    async function loadEvents() {
      const response = await getEvents({ page: 1, page_size: 20 })
      const events = response.data.list ?? []
      const nextItems = events.map((item) => {
        const city = textOrPlaceholder(item.city, '未提供城市')

        return {
          title: textOrPlaceholder(item.title, '未命名活动'),
          desc: textOrPlaceholder(item.status_text, '接口未返回活动状态'),
          meta: compactJoin([
            city,
            item.location,
            item.start_time,
            item.current_count ? `${item.current_count}人已报名` : ''
          ]),
          price: priceOf(item.price),
          city,
          path: routes.eventDetail,
          query: item.id ? { event_id: item.id } : undefined,
          action: '报名'
        }
      })

      setItems(nextItems)
      setCities([
        '全部',
        ...Array.from(new Set(nextItems.map((item) => textOf(item.city)).filter(Boolean) as string[]))
      ])
    }

    void loadEvents().catch(() => {
      setItems([])
      setCities(['全部'])
    })
  }, [])

  const visibleItems = useMemo(
    () => items.filter((item) => activeCity === '全部' || item.city === activeCity),
    [activeCity, items]
  )

  return (
    <PageShell title="活动列表" subtitle="按城市、主题和会员权益筛选活动。">
      <View className="grid gap-3">
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
        {visibleItems.length ? (
          <ItemList items={visibleItems} />
        ) : (
          <EmptyState title="暂无活动" desc="当前接口或筛选条件没有返回活动。" />
        )}
      </View>
    </PageShell>
  )
}
