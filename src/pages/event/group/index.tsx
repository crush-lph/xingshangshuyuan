import { useEffect, useState } from 'react'
import { Text, View } from '@tarojs/components'
import { ActionBar, EmptyState, FieldList, SectionCard } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { getEventDetail, getEvents, type GetEventDetailData } from '@/services'
import { routes } from '@/shared/router'
import { getPageParam, priceOf, textOrPlaceholder } from '@/shared/view-data'

async function resolveEventId() {
  const pageId = getPageParam('event_id')

  if (pageId) {
    return pageId
  }

  const events = await getEvents({ page: 1, page_size: 1 })
  return events.data.list?.[0]?.id
}

export default function EventGroupPage() {
  const [event, setEvent] = useState<GetEventDetailData | null>(null)

  useEffect(() => {
    async function loadEvent() {
      const eventId = await resolveEventId()

      if (!eventId) {
        setEvent(null)
        return
      }

      const response = await getEventDetail({ event_id: eventId })
      setEvent(response.data.id ? response.data : null)
    }

    void loadEvent().catch(() => setEvent(null))
  }, [])

  return (
    <PageShell title="拼团参与" subtitle="邀请同行一起报名，成团后享受优惠价。">
      {event ? (
        <View className="grid gap-3">
          <SectionCard title="当前活动">
            <Text className="block text-lg font-bold text-gold">{textOrPlaceholder(event.title)}</Text>
            <Text className="mt-2 block text-sm text-muted">拼团规则以接口返回的活动配置为准。</Text>
          </SectionCard>
          <FieldList
            fields={[
              { label: '活动城市', value: textOrPlaceholder(event.city) },
              { label: '活动地点', value: textOrPlaceholder(event.location) },
              { label: '活动时间', value: textOrPlaceholder(event.start_time) },
              { label: '活动价格', value: priceOf(event.price) ?? '未提供' }
            ]}
          />
          <ActionBar
            actions={[
              { label: '支付并加入', path: routes.eventTicket, query: event.id ? { event_id: event.id } : undefined }
            ]}
          />
        </View>
      ) : (
        <EmptyState title="暂无拼团活动" />
      )}
    </PageShell>
  )
}
