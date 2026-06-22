import { useEffect, useState } from 'react'
import Taro from '@tarojs/taro'
import { EmptyState, FormPreview } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import {
  getEventDetail,
  getEvents,
  getUserProfile,
  registerEvent,
  type GetEventDetailData,
  type GetUserProfileData
} from '@/services'
import { router, routes } from '@/shared/router'
import { getPageParam, priceOf, textOrPlaceholder } from '@/shared/view-data'

async function resolveEventId() {
  const pageId = getPageParam('event_id')

  if (pageId) {
    return pageId
  }

  const events = await getEvents({ page: 1, page_size: 1 })
  return events.data.list?.[0]?.id
}

export default function EventSignupPage() {
  const [event, setEvent] = useState<GetEventDetailData | null>(null)
  const [profile, setProfile] = useState<GetUserProfileData | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    async function loadData() {
      const [eventId, profileResult] = await Promise.all([resolveEventId(), getUserProfile().catch(() => null)])

      if (profileResult) {
        setProfile(profileResult.data)
      }

      if (!eventId) {
        setEvent(null)
        return
      }

      const eventResult = await getEventDetail({ event_id: eventId })
      setEvent(eventResult.data.id ? eventResult.data : null)
    }

    void loadData().catch(() => setEvent(null))
  }, [])

  async function handleRegister() {
    if (!event?.id) {
      Taro.showToast({ title: '暂无活动数据', icon: 'none' })
      return
    }

    setIsSubmitting(true)
    Taro.showLoading({ title: '报名中' })

    try {
      await registerEvent({
        event_id: event.id,
        real_name: profile?.nickname,
        phone: profile?.phone,
        company_name: profile?.company_name
      })
      Taro.showToast({ title: '报名已提交', icon: 'success' })
      router.redirect(routes.eventTicket, { event_id: event.id })
    } finally {
      Taro.hideLoading()
      setIsSubmitting(false)
    }
  }

  return (
    <PageShell title="活动报名" subtitle="确认参会人和票务信息。">
      {event ? (
        <FormPreview
          title="报名信息"
          desc="提交后使用 Apifox mock 活动报名接口生成报名结果。"
          fields={[
            { label: '活动', value: textOrPlaceholder(event.title) },
            { label: '参会人', value: textOrPlaceholder(profile?.nickname) },
            { label: '手机号', value: textOrPlaceholder(profile?.phone) },
            { label: '公司', value: textOrPlaceholder(profile?.company_name) },
            { label: '票价', value: priceOf(event.price) ?? '未提供' }
          ]}
          actions={[
            { label: '对公转账', variant: 'outline', path: routes.paymentTransfer },
            { label: isSubmitting ? '提交中' : '确认报名', disabled: isSubmitting, onClick: handleRegister }
          ]}
        />
      ) : (
        <EmptyState title="暂无可报名活动" desc="Apifox mock 未返回活动详情数据。" />
      )}
    </PageShell>
  )
}
