import { useEffect, useState } from 'react'
import { Text, View } from '@tarojs/components'
import { EmptyState, FieldList, SectionCard } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { getEventDetail, getEvents, type GetEventDetailData } from '@/services'
import { textOrPlaceholder } from '@/shared/view-data'

export default function AdminCheckinPage() {
  const [event, setEvent] = useState<GetEventDetailData | null>(null)

  useEffect(() => {
    async function loadEvent() {
      const list = await getEvents({ page: 1, page_size: 1 })
      const eventId = list.data.list?.[0]?.id

      if (!eventId) {
        setEvent(null)
        return
      }

      const detail = await getEventDetail({ event_id: eventId })
      setEvent(detail.data.id ? detail.data : null)
    }

    void loadEvent().catch(() => setEvent(null))
  }, [])

  return (
    <PageShell title="活动核销" subtitle="现场工作人员核验电子票并完成签到。">
      {event ? (
        <View className="grid gap-3">
          <SectionCard title="核销入口">
            <Text className="block rounded-lg border border-dashed border-line bg-canvas px-4 py-8 text-center text-sm text-muted">
              活动编号：EVENT-{event.id}
            </Text>
          </SectionCard>
          <FieldList
            fields={[
              { label: '活动', value: textOrPlaceholder(event.title) },
              { label: '地点', value: textOrPlaceholder(event.location) },
              { label: '时间', value: textOrPlaceholder(event.start_time) },
              { label: '状态', value: textOrPlaceholder(event.status_text) }
            ]}
          />
        </View>
      ) : (
        <EmptyState title="暂无核销活动" desc="Apifox mock 未返回活动数据。" />
      )}
    </PageShell>
  )
}
