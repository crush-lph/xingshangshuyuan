import { useEffect, useState } from 'react'
import { Text, View } from '@tarojs/components'
import { FieldList, SectionCard, StateNotice } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { getEventDetail, getEvents, type GetEventDetailData } from '@/services'
import { textOrPlaceholder } from '@/shared/view-data'
import { AdminGuard } from '../components/AdminGuard'

function AdminCheckinContent() {
  const [event, setEvent] = useState<GetEventDetailData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    async function loadEvent() {
      setIsLoading(true)
      setHasError(false)

      const list = await getEvents({ page: 1, page_size: 1 })
      const eventId = list.data.list?.[0]?.id

      if (!eventId) {
        setEvent(null)
        setIsLoading(false)
        return
      }

      const detail = await getEventDetail({ event_id: eventId })
      setEvent(detail.data.id ? detail.data : null)
    }

    void loadEvent()
      .catch(() => {
        setEvent(null)
        setHasError(true)
      })
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <PageShell title="活动核销" subtitle="当前接口文档未提供扫码核销接口，暂不展示核销操作。">
      {isLoading ? (
        <StateNotice state="loading" />
      ) : hasError ? (
        <StateNotice state="error" />
      ) : event ? (
        <View className="grid gap-3">
          <SectionCard title="核销入口">
            <Text className="block rounded-lg border border-line bg-canvas px-4 py-4 text-sm leading-6 text-muted">
              新版接口文档仅包含活动列表、活动详情、活动报名和我的活动列表，暂未提供电子票二维码或扫码核销接口。
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
        <StateNotice state="empty" copy={{ title: '暂无核销活动', desc: '当前接口没有返回可核销活动。' }} />
      )}
    </PageShell>
  )
}

export default function AdminCheckinPage() {
  return (
    <AdminGuard title="活动核销">
      <AdminCheckinContent />
    </AdminGuard>
  )
}
