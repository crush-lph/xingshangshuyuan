import { useEffect, useState } from 'react'
import { Text, View } from '@tarojs/components'
import { ActionBar, FieldList, SectionCard, StateNotice } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { getEventDetail, getEvents, type GetEventDetailData } from '@/services'
import { openEventSignupIfAvailable } from '@/shared/event-registration'
import { routes } from '@/shared/router'
import { compactJoin, getPageParam, priceOf, textOrPlaceholder } from '@/shared/view-data'

async function resolveEventId() {
  const pageId = getPageParam('event_id')

  if (pageId) {
    return pageId
  }

  const events = await getEvents({ page: 1, page_size: 1 })
  return events.data.list?.[0]?.id
}

export default function EventDetailPage() {
  const [event, setEvent] = useState<GetEventDetailData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    async function loadEvent() {
      setIsLoading(true)
      setHasError(false)

      const eventId = await resolveEventId()

      if (!eventId) {
        setEvent(null)
        setIsLoading(false)
        return
      }

      const response = await getEventDetail({ event_id: eventId })
      setEvent(response.data.id ? response.data : null)
    }

    void loadEvent()
      .catch(() => {
        setEvent(null)
        setHasError(true)
      })
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <PageShell
      title="活动详情"
      subtitle={event ? compactJoin([event.city, event.start_time]) || '活动接口详情' : '活动接口详情'}
    >
      {isLoading ? (
        <StateNotice state="loading" />
      ) : hasError ? (
        <StateNotice state="error" />
      ) : event ? (
        <View className="grid gap-3">
          <View className="rounded-lg bg-brand-deep p-4 shadow-medium">
            <Text className="block text-xs font-semibold text-gold-light">
              {compactJoin([event.city, event.start_time, event.end_time]) || '接口未返回时间地点'}
            </Text>
            <Text className="mt-2 block text-xl font-bold text-white">
              {textOrPlaceholder(event.title, '未命名活动')}
            </Text>
            <Text className="mt-2 block text-sm leading-5 text-white/65">
              {textOrPlaceholder(event.description, '接口未返回活动介绍')}
            </Text>
          </View>

          <FieldList
            fields={[
              { label: '活动地点', value: textOrPlaceholder(event.location) },
              { label: '活动价格', value: priceOf(event.price) ?? '未提供' },
              { label: '报名人数', value: String(event.current_count ?? 0) },
              { label: '报名状态', value: textOrPlaceholder(event.status_text) }
            ]}
          />

          <SectionCard title="活动说明">
            <Text className="block text-sm leading-6 text-muted">
              {textOrPlaceholder(event.description, '接口未返回活动说明')}
            </Text>
          </SectionCard>

          <ActionBar
            actions={[
              {
                label: '发起拼团',
                variant: 'outline',
                path: routes.eventGroup,
                query: event.id ? { event_id: event.id } : undefined
              },
              { label: '会员优惠', variant: 'gold', path: routes.memberBenefit },
              { label: '立即报名', onClick: () => openEventSignupIfAvailable(event) }
            ]}
          />
        </View>
      ) : (
        <StateNotice state="empty" copy={{ title: '暂无活动详情', desc: '当前接口没有返回活动详情。' }} />
      )}
    </PageShell>
  )
}
