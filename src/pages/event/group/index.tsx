import { useEffect, useState } from 'react'
import { Text, View } from '@tarojs/components'
import { ActionBar, FieldList, SectionCard, StateNotice } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { getEventDetail, getEvents, type GetEventDetailData } from '@/services'
import { openEventSignupIfAvailable } from '@/shared/event-registration'
import { dateTimeRangeOf, getPageParam, priceOf, textOrPlaceholder } from '@/shared/view-data'

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
    <PageShell title="拼团参与" subtitle="当前展示活动信息，拼团状态以后台配置为准。">
      {isLoading ? (
        <StateNotice state="loading" />
      ) : hasError ? (
        <StateNotice state="error" />
      ) : event ? (
        <View className="grid gap-3">
          <SectionCard title="当前活动">
            <Text className="block text-lg font-bold text-gold">{textOrPlaceholder(event.title)}</Text>
            <Text className="mt-2 block text-sm text-muted">
              当前接口未返回独立拼团状态，拼团规则以后台活动配置为准。
            </Text>
          </SectionCard>
          <FieldList
            fields={[
              { label: '活动城市', value: textOrPlaceholder(event.city) },
              { label: '活动地点', value: textOrPlaceholder(event.location) },
              {
                label: '活动时间',
                value: textOrPlaceholder(dateTimeRangeOf(event.event_date, event.start_time, event.end_time))
              },
              { label: '活动价格', value: priceOf(event.price) ?? '未提供' }
            ]}
          />
          <ActionBar actions={[{ label: '前往报名', onClick: () => openEventSignupIfAvailable(event) }]} />
        </View>
      ) : (
        <StateNotice state="empty" copy={{ title: '暂无拼团活动', desc: '当前接口没有返回可参与拼团的活动。' }} />
      )}
    </PageShell>
  )
}
