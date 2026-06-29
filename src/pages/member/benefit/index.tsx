import { useEffect, useState } from 'react'
import Taro from '@tarojs/taro'
import { Text, View } from '@tarojs/components'
import Popup from '@nutui/nutui-react-taro/dist/es/packages/popup'
import '@nutui/nutui-react-taro/dist/es/packages/button/style/css'
import '@nutui/nutui-react-taro/dist/es/packages/popup/style/css'
import { PaymentStatusPoller, StateNotice } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import {
  createVipOrder,
  payVipOrder,
  queryVipPaymentStatus,
  type CreateVipOrderData,
  type VipLevelItem
} from '@/services'
import { ensureLoggedIn } from '@/shared/auth-guard'
import { getWechatPaymentErrorMessage, requestWechatPayment } from '@/shared/wechat-payment'
import { useUserInfo } from '@/stores/user-info'
import { MemberBenefitCompare } from './components/MemberBenefitCompare'
import { MemberBenefitFaq } from './components/MemberBenefitFaq'
import { MemberBenefitHero } from './components/MemberBenefitHero'
import { MemberPlanCard } from './components/MemberPlanCard'
import {
  DEFAULT_TARGET_LEVEL_VALUE,
  fetchMemberDataSnapshot,
  getLevelTitle,
  type MemberDataSnapshot
} from './member-benefit.helpers'

export default function MemberBenefitPage() {
  const refreshUserInfo = useUserInfo((state) => state.refreshUserInfo)
  const [levels, setLevels] = useState<VipLevelItem[]>([])
  const [targetLevel, setTargetLevel] = useState<VipLevelItem | null>(null)
  const [aboutText, setAboutText] = useState('')
  const [order, setOrder] = useState<CreateVipOrderData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [isPaying, setIsPaying] = useState(false)
  const [pollingOrderNo, setPollingOrderNo] = useState('')

  function applyMemberData(snapshot: MemberDataSnapshot) {
    setLevels(snapshot.levels)
    setTargetLevel(snapshot.targetLevel)
    setAboutText(snapshot.aboutText)
  }

  useEffect(() => {
    let isActive = true

    void fetchMemberDataSnapshot()
      .then((snapshot) => {
        if (isActive) {
          setHasError(!snapshot.hasAnySuccess)
          applyMemberData(snapshot)
        }
      })
      .catch(() => {
        if (isActive) {
          applyMemberData({ levelText: '', levels: [], targetLevel: null, aboutText: '', hasAnySuccess: false })
          setHasError(true)
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false)
        }
      })

    return () => {
      isActive = false
    }
  }, [])

  async function ensureOrder(level = targetLevel) {
    if (!(await ensureLoggedIn('登录后才能开通会员'))) {
      return null
    }

    if (order?.order_no && order.vip_level === level?.level) {
      return order
    }

    try {
      Taro.showLoading({ title: '生成订单中' })
      const orderResult = await createVipOrder({ vip_level: level?.level ?? DEFAULT_TARGET_LEVEL_VALUE })
      setOrder(orderResult.data)
      return orderResult.data
    } catch {
      Taro.showToast({ title: '会员订单生成失败，请稍后重试', icon: 'none' })
      return null
    } finally {
      Taro.hideLoading()
    }
  }

  async function handleWechatPayment(level = targetLevel) {
    if (level) {
      setTargetLevel(level)
    }

    setIsPaying(true)

    try {
      const nextOrder = await ensureOrder(level)

      if (!nextOrder?.order_no) {
        Taro.showToast({ title: '订单生成失败', icon: 'none' })
        return
      }

      Taro.showLoading({ title: '拉起支付中' })
      const payResult = await payVipOrder({ order_no: nextOrder.order_no })
      await requestWechatPayment(payResult.data.pay_params)

      setPollingOrderNo(nextOrder.order_no)
      Taro.showToast({ title: '正在确认支付结果', icon: 'none' })
    } catch (error) {
      Taro.showToast({ title: getWechatPaymentErrorMessage(error), icon: 'none' })
    } finally {
      Taro.hideLoading()
      setIsPaying(false)
    }
  }

  async function handlePaymentConfirmed() {
    await refreshUserInfo()
    applyMemberData(await fetchMemberDataSnapshot())
    setOrder(null)
    setPollingOrderNo('')
    Taro.showToast({ title: '会员权益已更新', icon: 'success' })
  }

  const isPaymentLocked = isPaying || Boolean(pollingOrderNo)

  return (
    <PageShell title="行商会员" subtitle="供应链底价、商机优先、线下课和客户经理支持。" showHeader={false}>
      <View className="-mx-4 -mb-6 -mt-4 min-h-screen bg-[#071124] pb-8 text-white">
        <MemberBenefitHero />
        <View className="grid gap-5 px-4 pb-8 pt-5">
          <View className="flex items-center justify-between">
            <Text className="text-lg font-bold text-white">选择适合你的会员</Text>
            <Text className="text-xs text-white/50">权益配置实时同步</Text>
          </View>

          {isLoading ? <StateNotice state="loading" /> : null}
          {hasError ? <StateNotice state="error" /> : null}

          {!isLoading && !hasError ? (
            levels.length ? (
              levels.map((level) => (
                <MemberPlanCard
                  key={level.level ?? getLevelTitle(level)}
                  level={level}
                  isPaymentLocked={isPaymentLocked}
                  onPay={(selectedLevel) => {
                    void handleWechatPayment(selectedLevel)
                  }}
                />
              ))
            ) : (
              <StateNotice state="empty" copy={{ title: '暂无会员配置', desc: '当前接口未返回可开通的会员等级。' }} />
            )
          ) : null}

          <MemberBenefitCompare levels={levels} />
          <MemberBenefitFaq aboutText={aboutText} />

          {pollingOrderNo ? (
            <Popup
              visible
              position="center"
              round
              destroyOnClose
              closeOnOverlayClick={false}
              overlayClassName="member-payment-popup-overlay"
              className="member-payment-popup w-[86vw] max-w-[640rpx] overflow-hidden rounded-lg bg-transparent"
            >
              <View className="bg-canvas p-3">
                <PaymentStatusPoller
                  orderNo={pollingOrderNo}
                  queryStatus={queryVipPaymentStatus}
                  backLabel="关闭弹窗"
                  onBack={() => setPollingOrderNo('')}
                  onRetryPayment={() => {
                    setPollingOrderNo('')
                    void handleWechatPayment()
                  }}
                  onSuccess={handlePaymentConfirmed}
                />
              </View>
            </Popup>
          ) : null}
        </View>
      </View>
    </PageShell>
  )
}
