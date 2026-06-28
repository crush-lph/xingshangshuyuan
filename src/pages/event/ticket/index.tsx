import { useEffect, useState } from 'react'
import { Text, View } from '@tarojs/components'
import { ActionBar, FieldList, SectionCard, StateNotice } from '@/components/business'
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
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    async function loadTicket() {
      setIsLoading(true)
      setHasError(false)

      const [eventId, profileResult] = await Promise.all([resolveEventId(), getUserProfile().catch(() => null)])

      if (profileResult) {
        setProfile(profileResult.data)
      }

      if (!eventId) {
        setEvent(null)
        setIsLoading(false)
        return
      }

      const response = await getEventDetail({ event_id: eventId })
      setEvent(response.data.id ? response.data : null)
    }

    void loadTicket()
      .catch(() => {
        setEvent(null)
        setHasError(true)
      })
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <PageShell title="报名状态" subtitle="展示报名接口返回状态，核销凭证以后台返回为准。">
      {isLoading ? (
        <StateNotice state="loading" />
      ) : hasError ? (
        <StateNotice state="error" />
      ) : event ? (
        <View className="grid gap-3">
          <SectionCard title="报名结果">
            <View className="py-2">
              <Text className="block text-lg font-bold text-brand">
                {event.is_registered ? '已报名' : textOrPlaceholder(event.status_text, '报名状态待确认')}
              </Text>
              <Text className="mt-2 block text-sm leading-6 text-muted">
                {event.is_registered
                  ? '当前接口未返回真实票号或核销码，现场核销信息以后台返回为准。'
                  : '当前接口尚未确认报名成功，请查看我的活动或返回报名页确认。'}
              </Text>
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
        <StateNotice state="empty" copy={{ title: '暂无报名状态', desc: '当前接口没有返回活动报名状态。' }} />
      )}
    </PageShell>
  )
}
