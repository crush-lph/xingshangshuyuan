import { useEffect, useState } from 'react'
import { Text, View } from '@tarojs/components'
import { ItemList, SectionCard, StatGrid, StateNotice, type ListItem, type StatItem } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { getEvents } from '@/services'
import { routes } from '@/shared/router'
import { compactJoin, dateTimeRangeOf, priceOf, textOrPlaceholder, textOf } from '@/shared/view-data'

export default function EventHomePage() {
  const [notice, setNotice] = useState('')
  const [stats, setStats] = useState<StatItem[]>([])
  const [items, setItems] = useState<ListItem[]>([])
  const [cities, setCities] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    async function loadEventData() {
      setIsLoading(true)
      setHasError(false)

      try {
        const response = await getEvents({ page: 1, page_size: 6 })
        const events = response.data.list ?? []

        setNotice(events[0]?.title ? `${events[0].title}开放报名` : '')
        setCities(Array.from(new Set(events.map((item) => textOf(item.city)).filter(Boolean) as string[])))
        setStats(
          events.length
            ? [
                { label: '活动数量', value: String(response.data.total ?? events.length), tone: 'brand' },
                {
                  label: '覆盖城市',
                  value: String(new Set(events.map((item) => item.city).filter(Boolean)).size),
                  tone: 'success'
                },
                {
                  label: '报名人数',
                  value: String(events.reduce((sum, item) => sum + (item.current_count ?? 0), 0)),
                  tone: 'gold'
                }
              ]
            : []
        )
        setItems(
          events.map((item) => ({
            title: textOrPlaceholder(item.title, '未命名活动'),
            desc: textOrPlaceholder(item.status_text, '接口未返回活动状态'),
            meta:
              compactJoin([
                item.city,
                item.location,
                dateTimeRangeOf(item.event_date, item.start_time, item.end_time)
              ]) || '接口未返回活动时间地点',
            price: priceOf(item.price),
            tag: item.max_participants ? `限${item.max_participants}人` : undefined,
            icon: 'calendar-event-line',
            tone: item.price ? 'gold' : 'success',
            path: routes.eventDetail,
            query: item.id ? { event_id: item.id } : undefined,
            action: '报名'
          }))
        )
      } catch {
        setNotice('')
        setStats([])
        setItems([])
        setCities([])
        setHasError(true)
      } finally {
        setIsLoading(false)
      }
    }

    void loadEventData()
  }, [])

  return (
    <PageShell title="活动" subtitle="线下峰会、训练营和城市沙龙，服务财税机构增长。">
      <View className="grid gap-3">
        {isLoading ? <StateNotice state="loading" /> : null}
        {!isLoading && hasError ? <StateNotice state="error" /> : null}

        {!isLoading && !hasError ? (
          <>
            {notice ? (
              <View className="rounded-lg bg-gold-soft px-4 py-3">
                <Text className="text-sm font-semibold text-gold">{notice}</Text>
              </View>
            ) : null}

            {stats.length ? (
              <StatGrid items={stats} />
            ) : (
              <StateNotice state="empty" copy={{ title: '暂无活动统计', desc: '当前接口没有返回活动统计。' }} />
            )}

            <SectionCard title="活动城市">
              {cities.length ? (
                <View className="grid grid-cols-3 gap-2">
                  {cities.map((item) => (
                    <View key={item} className="rounded-lg bg-brand-soft px-3 py-3 text-center">
                      <Text className="text-xs font-semibold text-brand">{item}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <StateNotice state="empty" copy={{ title: '暂无活动城市', desc: '活动接口没有返回城市数据。' }} />
              )}
            </SectionCard>

            {items.length ? (
              <ItemList items={items} />
            ) : (
              <StateNotice state="empty" copy={{ title: '暂无活动', desc: '当前接口没有返回活动。' }} />
            )}
          </>
        ) : null}
      </View>
    </PageShell>
  )
}
