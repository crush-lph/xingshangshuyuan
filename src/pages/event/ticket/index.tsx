import { useEffect, useState } from 'react'
import { Image, Text, View } from '@tarojs/components'
import { ActionBar, FieldList, SectionCard, StateNotice } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import {
  getEventDetail,
  getEventTicket,
  getUserProfile,
  type GetEventDetailData,
  type GetEventTicketData,
  type GetUserProfileData
} from '@/services'
import { routes } from '@/shared/router'
import { dateTimeRangeOf, getPageParam, textOrPlaceholder } from '@/shared/view-data'

async function resolveEventId() {
  return getPageParam('event_id')
}

export default function EventTicketPage() {
  const [event, setEvent] = useState<GetEventDetailData | null>(null)
  const [ticket, setTicket] = useState<GetEventTicketData | null>(null)
  const [profile, setProfile] = useState<GetUserProfileData | null>(null)
  const [hasRegistrationParam, setHasRegistrationParam] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    async function loadTicket() {
      setIsLoading(true)
      setHasError(false)

      const registrationId = getPageParam('registration_id')
      setHasRegistrationParam(Boolean(registrationId))
      const [eventId, profileResult] = await Promise.all([resolveEventId(), getUserProfile().catch(() => null)])

      if (profileResult) {
        setProfile(profileResult.data)
      }

      if (registrationId) {
        const ticketResult = await getEventTicket({ registration_id: registrationId })
        setTicket(ticketResult.data.registration_id ? ticketResult.data : null)
        setEvent(null)
        setIsLoading(false)
        return
      }

      if (!eventId) {
        setEvent(null)
        setTicket(null)
        setIsLoading(false)
        return
      }

      const response = await getEventDetail({ event_id: eventId })
      setEvent(response.data.id ? response.data : null)
      setTicket(null)
    }

    void loadTicket()
      .catch(() => {
        setEvent(null)
        setTicket(null)
        setHasError(true)
      })
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <PageShell title="电子票" subtitle="展示后台返回的电子票二维码，现场扫码核销。">
      {isLoading ? (
        <StateNotice state="loading" />
      ) : hasError ? (
        <StateNotice state="error" />
      ) : ticket ? (
        <View className="grid gap-3">
          <SectionCard title="核销二维码">
            <View className="flex flex-col items-center rounded-lg border border-line bg-canvas px-4 py-5">
              {ticket.qrcode ? (
                <Image className="h-48 w-48 rounded bg-white" mode="aspectFit" src={ticket.qrcode} />
              ) : (
                <Text className="block rounded-lg border border-dashed border-line bg-white px-4 py-8 text-center text-sm leading-6 text-muted">
                  后台未返回二维码图片，请联系现场工作人员使用核销码核验。
                </Text>
              )}
              <Text className="mt-3 block text-center text-xs leading-5 text-muted">
                {textOrPlaceholder(ticket.qrcode_content, '未返回核销码')}
              </Text>
            </View>
          </SectionCard>
          <FieldList
            fields={[
              { label: '活动', value: textOrPlaceholder(ticket.event_title) },
              { label: '参会人', value: textOrPlaceholder(ticket.real_name) },
              { label: '手机号', value: textOrPlaceholder(ticket.phone) },
              { label: '公司', value: textOrPlaceholder(ticket.company_name) },
              { label: '地点', value: textOrPlaceholder(ticket.location) },
              {
                label: '时间',
                value: textOrPlaceholder(dateTimeRangeOf(ticket.event_date, ticket.start_time, ticket.end_time))
              },
              { label: '状态', value: textOrPlaceholder(ticket.status_text) }
            ]}
          />
          <ActionBar actions={[{ label: '查看我的活动', path: routes.userEvents }]} />
        </View>
      ) : event ? (
        <View className="grid gap-3">
          <SectionCard title="报名结果">
            <View className="py-2">
              <Text className="block text-lg font-bold text-brand">
                {event.is_registered ? '已报名' : textOrPlaceholder(event.status_text, '报名状态待确认')}
              </Text>
              <Text className="mt-2 block text-sm leading-6 text-muted">
                {event.is_registered
                  ? '当前入口未携带报名记录ID，暂不能拉取电子票二维码。请从报名成功页或我的活动进入。'
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
        <StateNotice
          state="empty"
          copy={
            hasRegistrationParam
              ? { title: '未查询到电子票', desc: '当前报名记录没有返回电子票信息，请确认报名状态或联系现场工作人员。' }
              : { title: '暂无报名状态', desc: '当前接口没有返回活动报名状态。' }
          }
        />
      )}
    </PageShell>
  )
}
