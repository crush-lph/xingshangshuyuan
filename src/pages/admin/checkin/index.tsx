import { useState } from 'react'
import Taro from '@tarojs/taro'
import { Text, View } from '@tarojs/components'
import { ActionBar, FieldList, SectionCard } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { checkinEvent, type CheckinEventData } from '@/services'
import { textOrPlaceholder } from '@/shared/view-data'
import { AdminGuard } from '../components/AdminGuard'

const EMPTY_FIELD_TEXT = '-'

function AdminCheckinContent() {
  const [checkinResult, setCheckinResult] = useState<CheckinEventData | null>(null)
  const [checkinMessage, setCheckinMessage] = useState('')
  const [isCheckingIn, setIsCheckingIn] = useState(false)

  async function handleScanCheckin() {
    setIsCheckingIn(true)
    setCheckinMessage('')
    setCheckinResult(null)

    try {
      const scanResult = await Taro.scanCode({
        onlyFromCamera: true,
        scanType: ['qrCode']
      })
      const code = (scanResult.result || scanResult.path || '').trim()

      if (!code) {
        Taro.showToast({ title: '未识别到核销码', icon: 'none' })
        return
      }

      Taro.showLoading({ title: '核验中' })
      const response = await checkinEvent({ code })
      const message = response.data.status_text || response.info || '核验成功'
      setCheckinResult(response.data)
      setCheckinMessage(message)
      Taro.showToast({ title: message, icon: 'success' })
    } catch (error) {
      const errMsg =
        typeof error === 'object' && error
          ? String((error as { errMsg?: string; message?: string }).errMsg ?? (error as Error).message ?? '')
          : ''

      if (!/cancel/i.test(errMsg)) {
        Taro.showToast({ title: '核验失败，请重试', icon: 'none' })
      }
    } finally {
      Taro.hideLoading()
      setIsCheckingIn(false)
    }
  }

  return (
    <PageShell title="核验门票" subtitle="扫描电子票二维码，核验后展示对应报名信息。">
      <View className="grid gap-3">
        <SectionCard title="核验入口">
          <Text className="block rounded-lg border border-line bg-canvas px-4 py-4 text-sm leading-6 text-muted">
            点击扫码后调起微信扫一扫，识别到的二维码内容会提交到后台核验接口。
          </Text>
          <View className="mt-3">
            <ActionBar
              actions={[
                {
                  label: isCheckingIn ? '核验中' : '扫码核验',
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
              { label: '核验结果', value: checkinMessage },
              { label: '活动', value: textOrPlaceholder(checkinResult?.event_title, EMPTY_FIELD_TEXT) },
              { label: '参会人', value: textOrPlaceholder(checkinResult?.real_name, EMPTY_FIELD_TEXT) },
              { label: '手机号', value: textOrPlaceholder(checkinResult?.phone, EMPTY_FIELD_TEXT) },
              { label: '报名记录', value: textOrPlaceholder(checkinResult?.registration_id, EMPTY_FIELD_TEXT) }
            ]}
          />
        ) : null}
      </View>
    </PageShell>
  )
}

export default function AdminCheckinPage() {
  return (
    <AdminGuard title="核验门票">
      <AdminCheckinContent />
    </AdminGuard>
  )
}
