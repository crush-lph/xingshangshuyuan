import { useEffect, useState } from 'react'
import { Text, View } from '@tarojs/components'
import { ActionBar, EmptyState, FieldList, SectionCard } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { getEventDetail, getEvents, getUserProfile, type GetEventDetailData, type GetUserProfileData } from '@/services'
import { routes } from '@/shared/router'
import { getPageParam, textOrPlaceholder } from '@/shared/view-data'

async function resolveEventId() {
  const pageId = getPageParam('event_id')

  if (pageId) {
    return pageId
  }

  const events = await getEvents({ page: 1, page_size: 1 })
  return events.data.list?.[0]?.id
}

export default function EventTicketPage() {
  const [event, setEvent] = useState<GetEventDetailData | null>(null)
  const [profile, setProfile] = useState<GetUserProfileData | null>(null)

  useEffect(() => {
    async function loadTicket() {
      const [eventId, profileResult] = await Promise.all([resolveEventId(), getUserProfile().catch(() => null)])

      if (profileResult) {
        setProfile(profileResult.data)
      }

      if (!eventId) {
        setEvent(null)
        return
      }

      const response = await getEventDetail({ event_id: eventId })
      setEvent(response.data.id ? response.data : null)
    }

    void loadTicket().catch(() => setEvent(null))
  }, [])

  return (
    <PageShell title="我的电子票" subtitle="报名成功，请凭电子票现场核销。">
      {event ? (
        <View className="grid gap-3">
          <SectionCard>
            <View className="items-center py-4 text-center">
              <Text className="block text-3xl font-bold text-brand">EVENT-{event.id}</Text>
              <Text className="mt-2 block text-sm text-muted">现场出示编号完成核销</Text>
            </View>
          </SectionCard>
          <FieldList
            fields={[
              { label: '活动', value: textOrPlaceholder(event.title) },
              { label: '参会人', value: textOrPlaceholder(profile?.nickname) },
              { label: '地点', value: textOrPlaceholder(event.location) },
              { label: '状态', value: event.is_registered ? '已报名' : textOrPlaceholder(event.status_text) }
            ]}
          />
          <ActionBar actions={[{ label: '查看我的活动', path: routes.userEvents }]} />
        </View>
      ) : (
        <EmptyState title="暂无电子票" />
      )}
    </PageShell>
  )
}
