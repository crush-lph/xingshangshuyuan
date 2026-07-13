import { useEffect, useRef, useState } from 'react'
import Taro from '@tarojs/taro'
import { View } from '@tarojs/components'
import {
  ActionBar,
  FieldList,
  FormSection,
  FormTextField,
  PaymentStatusPoller,
  StateNotice
} from '@/components/business'
import { PageShell } from '@/components/PageShell'
import {
  getEventDetail,
  getUserProfile,
  payOrder,
  queryOrderPaymentStatus,
  registerEvent,
  type GetEventDetailData
} from '@/services'
import { ensureLoggedIn } from '@/shared/auth-guard'
import { isEventRegistrationOpen, showEventRegistrationUnavailable } from '@/shared/event-registration'
import { router, routes } from '@/shared/router'
import { dateTimeRangeOf, getPageParam, priceOf, textOf, textOrPlaceholder } from '@/shared/view-data'
import { getWechatPaymentErrorMessage, requestWechatPayment } from '@/shared/wechat-payment'

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
  return getPageParam('event_id')
}

export default function EventSignupPage() {
  const [event, setEvent] = useState<GetEventDetailData | null>(null)
  const [form, setForm] = useState<SignupForm>(initialForm)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pollingOrderNo, setPollingOrderNo] = useState('')
  const submissionLockRef = useRef(false)

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
      const nextEvent = eventResult.data.id ? eventResult.data : null

      if (nextEvent && !isEventRegistrationOpen(nextEvent)) {
        showEventRegistrationUnavailable(nextEvent)
        setEvent(null)
        setTimeout(() => {
          if (Taro.getCurrentPages().length > 1) {
            void router.back()
            return
          }

          void router.redirect(routes.eventDetail, { event_id: nextEvent.id })
        }, 800)
        return
      }

      setEvent(nextEvent)
    }

    void loadData()
      .catch(() => {
        setEvent(null)
        setHasError(true)
      })
      .finally(() => setIsLoading(false))
  }, [])

  async function handleRegister() {
    if (submissionLockRef.current) {
      return
    }

    if (!(await ensureLoggedIn('登录后才能报名活动'))) {
      return
    }

    if (!event?.id) {
      Taro.showToast({ title: '暂无活动数据', icon: 'none' })
      return
    }

    if (event.is_registered) {
      Taro.showToast({ title: '您已报名该活动', icon: 'none' })
      router.redirect(routes.userEvents)
      return
    }

    if (!isEventRegistrationOpen(event)) {
      showEventRegistrationUnavailable(event)
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

    submissionLockRef.current = true
    setIsSubmitting(true)
    Taro.showLoading({ title: '报名中' })

    try {
      const response = await registerEvent({
        event_id: event.id,
        real_name: form.realName.trim(),
        phone: form.phone.trim(),
        company_name: textOf(form.companyName)
      })
      if (response.data.order_no) {
        const orderNo = response.data.order_no
        setPollingOrderNo(orderNo)
        Taro.showLoading({ title: '拉起支付中' })
        const payResult = await payOrder({ order_no: orderNo, pay_method: 1 })
        await requestWechatPayment(payResult.data.pay_params)
        Taro.showToast({ title: '正在确认支付结果', icon: 'none' })
        return
      }

      if (!response.data.registration_id) {
        throw new Error('报名接口未返回报名记录或支付订单')
      }

      Taro.showToast({ title: '报名成功', icon: 'success' })
      router.redirect(routes.eventTicket, {
        event_id: event.id,
        registration_id: response.data.registration_id
      })
    } catch (error) {
      Taro.showToast({ title: getWechatPaymentErrorMessage(error) || '报名失败，请稍后重试', icon: 'none' })
    } finally {
      submissionLockRef.current = false
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
              {
                label: '时间',
                value: textOrPlaceholder(dateTimeRangeOf(event.event_date, event.start_time, event.end_time))
              },
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
              {
                label: isSubmitting || pollingOrderNo ? '支付处理中' : '确认报名',
                disabled: isSubmitting || Boolean(pollingOrderNo),
                onClick: handleRegister
              }
            ]}
          />
          {pollingOrderNo ? (
            <PaymentStatusPoller
              orderNo={pollingOrderNo}
              queryStatus={queryOrderPaymentStatus}
              backLabel="查看我的活动"
              onBack={() => {
                void router.redirect(routes.userEvents)
              }}
              onRetryPayment={(reason) => {
                if (reason !== 'timeout') {
                  setPollingOrderNo('')
                  Taro.showToast({ title: '订单已终止，请重新报名', icon: 'none' })
                  return
                }

                void (async () => {
                  if (submissionLockRef.current) return
                  submissionLockRef.current = true
                  setIsSubmitting(true)
                  const orderNo = pollingOrderNo
                  setPollingOrderNo('')
                  try {
                    const payResult = await payOrder({ order_no: orderNo, pay_method: 1 })
                    setPollingOrderNo(orderNo)
                    await requestWechatPayment(payResult.data.pay_params)
                  } catch (error) {
                    Taro.showToast({ title: getWechatPaymentErrorMessage(error), icon: 'none' })
                  } finally {
                    submissionLockRef.current = false
                    setIsSubmitting(false)
                  }
                })()
              }}
              onSuccess={() => {
                setPollingOrderNo('')
                Taro.showToast({ title: '支付成功，报名已确认', icon: 'success' })
                router.redirect(routes.userEvents)
              }}
            />
          ) : null}
        </View>
      ) : (
        <StateNotice state="empty" copy={{ title: '暂无可报名活动', desc: '当前接口没有返回可报名活动。' }} />
      )}
    </PageShell>
  )
}
