import { useEffect, useState } from 'react'
import Taro from '@tarojs/taro'
import { Text, View } from '@tarojs/components'
import { ActionBar, FieldList, PaymentStatusPoller, SectionCard, StateNotice } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import {
  createVipOrder,
  getUserProfile,
  getVipLevels,
  payVipOrder,
  queryVipPaymentStatus,
  type CreateVipOrderData
} from '@/services'
import type { VipLevelItem } from '@/services'
import { ensureLoggedIn } from '@/shared/auth-guard'
import { router, routes } from '@/shared/router'
import { priceOf, textOf, textOrPlaceholder } from '@/shared/view-data'
import { getWechatPaymentErrorMessage, requestWechatPayment } from '@/shared/wechat-payment'
import { useUserInfo } from '@/stores/user-info'

const DEFAULT_TARGET_LEVEL = '行商·领航会员'
const DEFAULT_TARGET_LEVEL_VALUE = 2

function getVipLevelTitle(level: VipLevelItem | null | undefined) {
  return textOf(level?.level_text ?? level?.name)
}

function getNavigatorLevel(levels: VipLevelItem[]) {
  return (
    levels.find((item) => item.level === DEFAULT_TARGET_LEVEL_VALUE || getVipLevelTitle(item)?.includes('领航')) ??
    levels[0]
  )
}

function getPerkFields(level: VipLevelItem | null) {
  return (level?.perks ?? []).map((item, index) => ({
    label: textOrPlaceholder(typeof item === 'string' ? item : item.perk_name, `权益${index + 1}`),
    value: '已包含'
  }))
}

export default function MemberConfirmPage() {
  const refreshUserInfo = useUserInfo((state) => state.refreshUserInfo)
  const [isPaying, setIsPaying] = useState(false)
  const [pollingOrderNo, setPollingOrderNo] = useState('')
  const [levelText, setLevelText] = useState('')
  const [targetLevel, setTargetLevel] = useState<VipLevelItem | null>(null)
  const [perkFields, setPerkFields] = useState<Array<{ label: string; value: string }>>([])
  const [order, setOrder] = useState<CreateVipOrderData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    async function loadMemberConfig() {
      setIsLoading(true)
      setHasError(false)

      const [profileResult, levelsResult] = await Promise.allSettled([getUserProfile(), getVipLevels()])

      if (profileResult.status === 'fulfilled') {
        setLevelText(textOf(profileResult.value.data.vip_level_text) ?? '')
      }

      if (levelsResult.status === 'fulfilled') {
        const level = getNavigatorLevel(levelsResult.value.data)

        setTargetLevel(level ?? null)
        setPerkFields(getPerkFields(level ?? null))
      }

      setHasError(profileResult.status === 'rejected' && levelsResult.status === 'rejected')
    }

    void loadMemberConfig()
      .catch(() => {
        setLevelText('')
        setTargetLevel(null)
        setPerkFields([])
        setHasError(true)
      })
      .finally(() => setIsLoading(false))
  }, [])

  async function ensureOrder() {
    if (!(await ensureLoggedIn('登录后才能开通会员'))) {
      return null
    }

    if (order?.order_no) {
      return order
    }

    try {
      Taro.showLoading({ title: '生成订单中' })
      const orderResult = await createVipOrder({ vip_level: targetLevel?.level ?? DEFAULT_TARGET_LEVEL_VALUE })
      setOrder(orderResult.data)
      return orderResult.data
    } catch {
      Taro.showToast({ title: '会员订单生成失败，请稍后重试', icon: 'none' })
      return null
    } finally {
      Taro.hideLoading()
    }
  }

  async function handleWechatPayment() {
    setIsPaying(true)

    try {
      const nextOrder = await ensureOrder()

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

  async function handleTransferPayment() {
    setIsPaying(true)

    try {
      const nextOrder = await ensureOrder()

      if (!nextOrder?.order_no) {
        Taro.showToast({ title: '订单生成失败', icon: 'none' })
        return
      }

      router.to(routes.paymentTransfer, { order_no: nextOrder.order_no })
    } finally {
      Taro.hideLoading()
      setIsPaying(false)
    }
  }

  async function handlePaymentConfirmed() {
    await refreshUserInfo()
    Taro.showToast({ title: '会员权益已更新', icon: 'success' })
    router.redirect(routes.userBenefits)
  }

  function handleRetryPayment() {
    setPollingOrderNo('')
    void handleWechatPayment()
  }

  function handleBackToBenefit() {
    router.redirect(routes.memberBenefit)
  }

  const displayTargetLevel = textOrPlaceholder(
    order?.vip_level_text ?? getVipLevelTitle(targetLevel),
    DEFAULT_TARGET_LEVEL
  )
  const displayAmount = priceOf(order?.amount ?? targetLevel?.current_price) ?? '生成订单后确认'
  const isPaymentLocked = isPaying || Boolean(pollingOrderNo)

  return (
    <PageShell title="会员升级确认" subtitle="确认升级行商·领航会员后生成订单。">
      <View className="grid gap-3">
        {isLoading ? <StateNotice state="loading" /> : null}
        {hasError ? <StateNotice state="error" /> : null}
        {!isLoading && !hasError && !targetLevel ? (
          <StateNotice state="empty" copy={{ title: '暂无会员方案', desc: '当前接口没有返回可开通会员等级。' }} />
        ) : null}
        {!isLoading && !hasError && targetLevel ? (
          <>
            <SectionCard title="会员方案">
              <Text className="block text-base font-bold text-ink">{displayTargetLevel}</Text>
              <Text className="mt-2 block text-sm leading-6 text-muted">
                升级后可获得更高等级的供应链底价、商机优先和客户经理支持，最终权益以接口返回配置为准。
              </Text>
              {order?.order_no ? (
                <Text className="mt-2 block text-xs text-brand">最近订单：{order.order_no}</Text>
              ) : null}
            </SectionCard>
            <FieldList
              fields={[
                { label: '当前会员', value: levelText || '暂无会员信息' },
                { label: '目标等级', value: displayTargetLevel },
                { label: '支付金额', value: displayAmount },
                { label: '原价', value: priceOf(targetLevel?.original_price) ?? '未提供' },
                { label: '订单状态', value: textOrPlaceholder(order?.status_text, '未生成') },
                { label: '到期时间', value: textOrPlaceholder(order?.expire_at, '支付后生效') }
              ]}
            />
          </>
        ) : null}
        {perkFields.length ? (
          <SectionCard title="升级权益">
            <View className="grid gap-3">
              {perkFields.map((item) => (
                <View key={item.label}>
                  <Text className="block text-sm font-semibold text-ink">{item.label}</Text>
                  <Text className="mt-1 block text-sm leading-6 text-muted">{item.value}</Text>
                </View>
              ))}
            </View>
          </SectionCard>
        ) : null}
        {pollingOrderNo ? (
          <PaymentStatusPoller
            orderNo={pollingOrderNo}
            queryStatus={queryVipPaymentStatus}
            onBack={handleBackToBenefit}
            onRetryPayment={handleRetryPayment}
            onSuccess={handlePaymentConfirmed}
          />
        ) : null}
        <ActionBar
          actions={[
            {
              label: '对公转账',
              variant: 'outline',
              disabled: isPaymentLocked,
              onClick: handleTransferPayment
            },
            {
              label: isPaymentLocked ? '支付处理中' : '微信支付升级',
              disabled: isPaymentLocked,
              onClick: handleWechatPayment
            }
          ]}
        />
      </View>
    </PageShell>
  )
}
