import { useEffect, useState } from 'react'
import Taro from '@tarojs/taro'
import { View } from '@tarojs/components'
import { ActionBar, FieldList, FormSection, FormTextField, StateNotice } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { getEventDetail, getEvents, getUserProfile, registerEvent, type GetEventDetailData } from '@/services'
import { ensureLoggedIn } from '@/shared/auth-guard'
import { router, routes } from '@/shared/router'
import { getPageParam, priceOf, textOf, textOrPlaceholder } from '@/shared/view-data'

interface SignupForm {
  realName: string
  phone: string
  companyName: string
}

const initialForm: SignupForm = {
  realName: '',
  phone: '',
  companyName: ''
}

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
  const [form, setForm] = useState<SignupForm>(initialForm)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      setHasError(false)

      const [eventId, profileResult] = await Promise.all([resolveEventId(), getUserProfile().catch(() => null)])

      if (profileResult) {
        setForm({
          realName: textOf(profileResult.data.nickname) ?? '',
          phone: textOf(profileResult.data.phone) ?? '',
          companyName: textOf(profileResult.data.company_name) ?? ''
        })
      }

      if (!eventId) {
        setEvent(null)
        setIsLoading(false)
        return
      }

      const eventResult = await getEventDetail({ event_id: eventId })
      setEvent(eventResult.data.id ? eventResult.data : null)
    }

    void loadData()
      .catch(() => {
        setEvent(null)
        setHasError(true)
      })
      .finally(() => setIsLoading(false))
  }, [])

  async function handleRegister() {
    if (!(await ensureLoggedIn('登录后才能报名活动'))) {
      return
    }

    if (!event?.id) {
      Taro.showToast({ title: '暂无活动数据', icon: 'none' })
      return
    }

    if (!textOf(form.realName)) {
      Taro.showToast({ title: '请填写参会人', icon: 'none' })
      return
    }

    if (!textOf(form.phone)) {
      Taro.showToast({ title: '请填写手机号', icon: 'none' })
      return
    }

    setIsSubmitting(true)
    Taro.showLoading({ title: '报名中' })

    try {
      const response = await registerEvent({
        event_id: event.id,
        real_name: form.realName.trim(),
        phone: form.phone.trim(),
        company_name: textOf(form.companyName)
      })
      Taro.showToast({ title: '报名已提交', icon: 'success' })
      router.redirect(routes.eventTicket, {
        event_id: event.id,
        registration_id: response.data.registration_id ?? undefined
      })
    } catch {
      Taro.showToast({ title: '报名失败，请稍后重试', icon: 'none' })
    } finally {
      Taro.hideLoading()
      setIsSubmitting(false)
    }
  }

  return (
    <PageShell title="活动报名" subtitle="确认参会人信息，提交后以后台报名状态为准。">
      {isLoading ? (
        <StateNotice state="loading" />
      ) : hasError ? (
        <StateNotice state="error" />
      ) : event ? (
        <View className="grid gap-3">
          <FieldList
            fields={[
              { label: '活动', value: textOrPlaceholder(event.title) },
              { label: '时间', value: textOrPlaceholder(event.start_time ?? event.event_date) },
              { label: '地点', value: textOrPlaceholder(event.location ?? event.city) },
              { label: '票价', value: priceOf(event.price) ?? '未提供' }
            ]}
          />

          <FormSection title="参会信息" desc="已根据个人资料预填，可按本次报名实际参会人修改。">
            <FormTextField
              label="参会人"
              required
              value={form.realName}
              placeholder="请输入姓名"
              onChange={(value) => setForm((current) => ({ ...current, realName: value }))}
            />
            <FormTextField
              label="手机号"
              required
              type="number"
              value={form.phone}
              placeholder="请输入联系手机号"
              onChange={(value) => setForm((current) => ({ ...current, phone: value }))}
            />
            <FormTextField
              label="公司"
              value={form.companyName}
              placeholder="请输入公司名称"
              onChange={(value) => setForm((current) => ({ ...current, companyName: value }))}
            />
          </FormSection>

          <ActionBar
            actions={[
              { label: '对公转账', variant: 'outline', path: routes.paymentTransfer },
              { label: isSubmitting ? '提交中' : '确认报名', disabled: isSubmitting, onClick: handleRegister }
            ]}
          />
        </View>
      ) : (
        <StateNotice state="empty" copy={{ title: '暂无可报名活动', desc: '当前接口没有返回可报名活动。' }} />
      )}
    </PageShell>
  )
}
