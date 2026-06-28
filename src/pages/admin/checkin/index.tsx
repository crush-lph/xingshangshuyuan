import { useEffect, useState } from 'react'
import Taro from '@tarojs/taro'
import { Text, View } from '@tarojs/components'
import { ActionBar, FieldList, SectionCard, StateNotice } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { checkinEvent, getEventDetail, getEvents, type CheckinEventData, type GetEventDetailData } from '@/services'
import { textOrPlaceholder } from '@/shared/view-data'
import { AdminGuard } from '../components/AdminGuard'

function AdminCheckinContent() {
  const [event, setEvent] = useState<GetEventDetailData | null>(null)
  const [checkinResult, setCheckinResult] = useState<CheckinEventData | null>(null)
  const [checkinMessage, setCheckinMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [isCheckingIn, setIsCheckingIn] = useState(false)

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

  async function handleScanCheckin() {
    setIsCheckingIn(true)
    setCheckinMessage('')

    try {
      const scanResult = await Taro.scanCode({})
      const code = scanResult.result?.trim()

      if (!code) {
        Taro.showToast({ title: '未识别到核销码', icon: 'none' })
        return
      }

      Taro.showLoading({ title: '核销中' })
      const response = await checkinEvent({ code })
      const message = response.data.status_text || response.info || '核销成功'
      setCheckinResult(response.data)
      setCheckinMessage(message)
      Taro.showToast({ title: message, icon: 'success' })
    } catch {
      Taro.showToast({ title: '核销失败，请重试', icon: 'none' })
    } finally {
      Taro.hideLoading()
      setIsCheckingIn(false)
    }
  }

  return (
    <PageShell title="活动核销" subtitle="现场工作人员核验电子票并完成签到。">
      {isLoading ? (
        <StateNotice state="loading" />
      ) : hasError ? (
        <StateNotice state="error" />
      ) : event ? (
        <View className="grid gap-3">
          <SectionCard title="核销入口">
            <Text className="block rounded-lg border border-line bg-canvas px-4 py-4 text-sm leading-6 text-muted">
              扫描电子票二维码后，系统会把二维码原文提交到后台核销接口。
            </Text>
            <View className="mt-3">
              <ActionBar
                actions={[
                  {
                    label: isCheckingIn ? '核销中' : '扫码核销',
                    disabled: isCheckingIn,
                    onClick: handleScanCheckin
                  }
                ]}
              />
            </View>
          </SectionCard>
          {checkinMessage ? (
            <FieldList
              fields={[
                { label: '核销结果', value: checkinMessage },
                { label: '活动', value: textOrPlaceholder(checkinResult?.event_title) },
                { label: '参会人', value: textOrPlaceholder(checkinResult?.real_name) },
                { label: '手机号', value: textOrPlaceholder(checkinResult?.phone) },
                { label: '报名记录', value: textOrPlaceholder(checkinResult?.registration_id) }
              ]}
            />
          ) : null}
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
