import { useEffect, useState } from 'react'
import Taro from '@tarojs/taro'
import { Text, View } from '@tarojs/components'
import Button from '@nutui/nutui-react-taro/dist/es/packages/button'
import Popup from '@nutui/nutui-react-taro/dist/es/packages/popup'
import '@nutui/nutui-react-taro/dist/es/packages/button/style/css'
import '@nutui/nutui-react-taro/dist/es/packages/popup/style/css'
import { EmptyState, PaymentStatusPoller, SectionCard, StateNotice } from '@/components/business'
import { AppIcon } from '@/components/AppIcon'
import { PageShell } from '@/components/PageShell'
import {
  createVipOrder,
  getAbout,
  getUserProfile,
  getVipLevels,
  payVipOrder,
  queryVipPaymentStatus,
  type CreateVipOrderData,
  type VipLevelItem
} from '@/services'
import { ensureLoggedIn } from '@/shared/auth-guard'
import { isRecord, priceOf, textOf, textOrPlaceholder } from '@/shared/view-data'
import { getWechatPaymentErrorMessage, requestWechatPayment } from '@/shared/wechat-payment'
import { useUserInfo } from '@/stores/user-info'

const DEFAULT_TARGET_LEVEL_VALUE = 2

function getNavigatorLevel(levels: VipLevelItem[]) {
  return levels.find((item) => item.level === DEFAULT_TARGET_LEVEL_VALUE || item.name?.includes('领航')) ?? levels[0]
}

interface MemberDataSnapshot {
  levelText: string
  levels: VipLevelItem[]
  targetLevel: VipLevelItem | null
  aboutText: string
  hasAnySuccess: boolean
}

const compareRows = [
  { label: '供应链价格', elite: '会员价', navigator: '战略底价' },
  { label: '线下课程', elite: '基础会务费', navigator: '权益票' },
  { label: '年度峰会', elite: '会员价', navigator: '免费含晚宴' },
  { label: '商机申请', elite: '优先', navigator: '高优先级' },
  { label: '知行塾', elite: '暂未开放', navigator: '私董会资格' },
  { label: '系统权益', elite: '1个月试用', navigator: '1年免费' }
]

const partnerBenefits = ['浏览公开资源', '报名公开活动', '提交企业认证']

const fallbackPerks = {
  elite: ['资源供应链底价采购', '线下课基础会务费', '商机优先申请权', '授牌·菁英会员资格', '1个月系统试用权益'],
  navigator: [
    '战略供应商底价',
    '峰会免费门票（含晚宴）',
    '高价值商机优先获取',
    '知行塾·私董会参与资格',
    '1年系统免费使用权益',
    '授牌·领航标杆资格'
  ]
}

async function fetchMemberDataSnapshot(): Promise<MemberDataSnapshot> {
  let nextLevelText = ''
  let nextLevels: VipLevelItem[] = []
  let nextTargetLevel: VipLevelItem | null = null
  let nextAboutText = ''

  const [profileResult, levelsResult, aboutResult] = await Promise.allSettled([
    getUserProfile(),
    getVipLevels(),
    getAbout()
  ])

  if (profileResult.status === 'fulfilled') {
    nextLevelText = textOf(profileResult.value.data.vip_level_text) ?? ''
  }

  if (levelsResult.status === 'fulfilled') {
    nextLevels = levelsResult.value.data
    nextTargetLevel = getNavigatorLevel(nextLevels) ?? null
  }

  if (aboutResult.status === 'fulfilled' && isRecord(aboutResult.value.data)) {
    nextAboutText =
      textOf(aboutResult.value.data.description ?? aboutResult.value.data.content ?? aboutResult.value.data.about) ?? ''
  }

  return {
    levelText: nextLevelText,
    levels: nextLevels,
    targetLevel: nextTargetLevel,
    aboutText: nextAboutText,
    hasAnySuccess: [profileResult, levelsResult, aboutResult].some((result) => result.status === 'fulfilled')
  }
}

function isNavigatorLevel(level: VipLevelItem) {
  return level.level === DEFAULT_TARGET_LEVEL_VALUE || Boolean(level.name?.includes('领航'))
}

function getLevelTone(level: VipLevelItem) {
  return isNavigatorLevel(level)
    ? {
        eyebrow: '推荐升级',
        icon: 'trophy-line',
        border: 'border-brand',
        background: 'bg-gradient-to-br from-[#EEF3FF] via-white to-[#FFF8E7]',
        text: 'text-brand',
        accent: 'text-gold',
        iconBg: 'bg-brand',
        softBg: 'bg-[#EEF3FF]',
        button: 'border-brand bg-brand text-white'
      }
    : {
        eyebrow: '基础会员',
        icon: 'star-line',
        border: 'border-gold',
        background: 'bg-gradient-to-br from-[#FFF9E6] to-white',
        text: 'text-gold',
        accent: 'text-gold',
        iconBg: 'bg-gold',
        softBg: 'bg-gold-soft',
        button: 'border-gold bg-gold text-white'
      }
}

function getPerkNames(level: VipLevelItem) {
  const apiPerks = (level.perks ?? []).map((item, index) => textOrPlaceholder(item.perk_name, `权益${index + 1}`))

  if (apiPerks.length) {
    return apiPerks
  }

  return isNavigatorLevel(level) ? fallbackPerks.navigator : fallbackPerks.elite
}

function getButtonText(level: VipLevelItem) {
  const price = priceOf(level.current_price)
  return price ? `立即开通 ${price}` : '立即开通'
}

function getLevelDescription(level: VipLevelItem) {
  return isNavigatorLevel(level)
    ? '适合需要商机优先、峰会资源和战略底价的机构'
    : '适合开始接入平台资源和基础会员权益的机构'
}

function getDiscountText(level: VipLevelItem) {
  if (typeof level.discount_rate !== 'number') {
    return undefined
  }

  if (level.discount_rate >= 1) {
    return '权益价'
  }

  return `${Math.round(level.discount_rate * 10)}折权益`
}

export default function MemberBenefitPage() {
  const refreshUserInfo = useUserInfo((state) => state.refreshUserInfo)
  const [levelText, setLevelText] = useState('')
  const [levels, setLevels] = useState<VipLevelItem[]>([])
  const [targetLevel, setTargetLevel] = useState<VipLevelItem | null>(null)
  const [aboutText, setAboutText] = useState('')
  const [order, setOrder] = useState<CreateVipOrderData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [isPaying, setIsPaying] = useState(false)
  const [pollingOrderNo, setPollingOrderNo] = useState('')

  function applyMemberData(snapshot: MemberDataSnapshot) {
    setLevelText(snapshot.levelText)
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
          setLevelText(snapshot.levelText)
          setLevels(snapshot.levels)
          setTargetLevel(snapshot.targetLevel)
          setAboutText(snapshot.aboutText)
        }
      })
      .catch(() => {
        if (isActive) {
          setLevelText('')
          setLevels([])
          setTargetLevel(null)
          setAboutText('')
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

  function handleClosePaymentPopup() {
    setPollingOrderNo('')
  }

  function handleRetryPayment() {
    setPollingOrderNo('')
    void handleWechatPayment()
  }

  const isPaymentLocked = isPaying || Boolean(pollingOrderNo)

  return (
    <PageShell title="行商会员" subtitle="供应链底价、商机优先、线下课和客户经理支持。">
      <View className="-mx-4 -mt-3">
        <View className="bg-brand-deep px-5 pb-7 pt-6">
          <View className="mb-4 flex items-center justify-between gap-3">
            <View className="flex-1">
              <Text className="block text-xs font-semibold text-white/65">行商书苑会员体系</Text>
              <Text className="mt-1 block text-2xl font-bold text-gold-light">资源、商机与圈层权益</Text>
            </View>
            <View className="rounded-lg border border-gold/45 bg-gold/10 px-3 py-2">
              <Text className="block text-right text-xs text-white/65">当前身份</Text>
              <Text className="mt-1 block text-right text-sm font-bold text-gold-light">{levelText || '注册伙伴'}</Text>
            </View>
          </View>
          <Text className="block text-sm leading-6 text-white/72">
            加入行商会员，获得供应链底价、线下课程、峰会席位、商机优先和平台授牌资格。
          </Text>
          <View className="mt-5 grid grid-cols-3 gap-2">
            {['供应链底价', '商机优先', '圈层活动'].map((item) => (
              <View key={item} className="rounded bg-white/10 px-2 py-2 text-center">
                <Text className="text-xs font-semibold text-white">{item}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View className="grid gap-4">
        {isLoading ? <StateNotice state="loading" /> : null}
        {hasError ? <StateNotice state="error" /> : null}

        {!isLoading && !hasError ? (
          <>
            <View className="rounded-lg border border-line bg-white p-4 shadow-soft">
              <View className="flex items-start justify-between gap-3">
                <View className="flex items-center gap-3">
                  <View className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#E7F6EF]">
                    <AppIcon name="user-3-line" size={22} color="#2F855A" />
                  </View>
                  <View>
                    <Text className="block text-base font-bold text-ink">注册伙伴</Text>
                    <Text className="mt-1 block text-xs text-muted">完成注册即可获得基础访问权限</Text>
                  </View>
                </View>
                <Text className="rounded bg-[#E7F6EF] px-2 py-1 text-xs font-semibold text-[#2F855A]">免费</Text>
              </View>
              <View className="mt-4 grid grid-cols-3 gap-2">
                {partnerBenefits.map((item) => (
                  <View key={item} className="rounded bg-canvas px-2 py-3 text-center">
                    <Text className="text-xs font-semibold leading-4 text-muted">{item}</Text>
                  </View>
                ))}
              </View>
            </View>

            {levels.length ? (
              levels.map((level) => {
                const tone = getLevelTone(level)
                const perks = getPerkNames(level)
                const discountText = getDiscountText(level)

                return (
                  <View
                    key={level.level ?? level.name}
                    className={`overflow-hidden rounded-lg border-2 ${tone.border} ${tone.background} shadow-soft`}
                  >
                    <View className="p-4">
                      <View className="mb-4 flex items-start justify-between gap-3">
                        <View className="flex flex-1 items-center gap-3">
                          <View className={`flex h-12 w-12 items-center justify-center rounded-lg ${tone.iconBg}`}>
                            <AppIcon name={tone.icon} size={24} color="#FFFFFF" />
                          </View>
                          <View className="flex-1">
                            <Text className={`block text-base font-bold ${tone.text}`}>
                              {textOrPlaceholder(level.name, '行商会员')}
                            </Text>
                            <Text className="mt-1 block text-xs leading-5 text-muted">
                              {getLevelDescription(level)}
                            </Text>
                          </View>
                        </View>
                        <Text className={`rounded px-2 py-1 text-xs font-semibold ${tone.softBg} ${tone.text}`}>
                          {tone.eyebrow}
                        </Text>
                      </View>

                      <View className="mb-4 rounded-lg bg-white/80 px-3 py-3">
                        <View className="flex items-end justify-between gap-2">
                          <View>
                            <Text className="block text-xs text-muted">年度权益价</Text>
                            <Text className={`mt-1 block text-2xl font-bold ${tone.accent}`}>
                              {priceOf(level.current_price) ?? '价格待定'}
                              <Text className="text-xs font-semibold"> / 年</Text>
                            </Text>
                          </View>
                          <View className="text-right">
                            {level.original_price ? (
                              <Text className="block text-xs text-muted line-through">
                                {priceOf(level.original_price)}
                              </Text>
                            ) : null}
                            {discountText ? (
                              <Text className={`mt-1 block text-xs font-semibold ${tone.text}`}>{discountText}</Text>
                            ) : null}
                          </View>
                        </View>
                      </View>

                      <View className="grid gap-2">
                        {perks.map((item) => (
                          <View key={item} className="flex items-start gap-2">
                            <View
                              className={`mt-0.5 flex h-4 w-4 items-center justify-center rounded-full ${tone.iconBg}`}
                            >
                              <AppIcon name="check-line" size={12} color="#FFFFFF" />
                            </View>
                            <Text className="flex-1 text-sm leading-5 text-ink">{item}</Text>
                          </View>
                        ))}
                      </View>

                      <View className="mt-4 grid grid-cols-2 gap-2">
                        <View className={`rounded ${tone.softBg} px-3 py-2`}>
                          <Text className="block text-xs text-muted">有效期</Text>
                          <Text className={`mt-1 block text-sm font-bold ${tone.text}`}>1年</Text>
                        </View>
                        <View className={`rounded ${tone.softBg} px-3 py-2`}>
                          <Text className="block text-xs text-muted">支付方式</Text>
                          <Text className={`mt-1 block text-sm font-bold ${tone.text}`}>微信支付</Text>
                        </View>
                      </View>

                      <Button
                        block
                        className={`mt-4 h-12 rounded-lg ${tone.button}`}
                        disabled={isPaymentLocked}
                        type="primary"
                        onClick={() => {
                          void handleWechatPayment(level)
                        }}
                      >
                        {isPaymentLocked && targetLevel?.level === level.level ? '支付处理中' : getButtonText(level)}
                      </Button>
                    </View>
                  </View>
                )
              })
            ) : (
              <EmptyState title="暂无会员配置" desc="当前接口未返回可开通的会员等级。" />
            )}
          </>
        ) : null}

        <SectionCard title="权益对比">
          <View className="overflow-hidden rounded-lg border border-line">
            <View className="grid grid-cols-3 bg-brand-deep">
              <Text className="px-2 py-3 text-xs font-semibold text-white">权益项</Text>
              <Text className="px-2 py-3 text-center text-xs font-semibold text-gold-light">菁英会员</Text>
              <Text className="px-2 py-3 text-center text-xs font-semibold text-white">领航会员</Text>
            </View>
            {compareRows.map((item, index) => (
              <View
                key={item.label}
                className={`grid grid-cols-3 ${index === compareRows.length - 1 ? '' : 'border-b border-line'} bg-white`}
              >
                <Text className="px-2 py-3 text-xs font-semibold text-ink">{item.label}</Text>
                <Text className="px-2 py-3 text-center text-xs text-muted">{item.elite}</Text>
                <Text className="px-2 py-3 text-center text-xs font-semibold text-brand">{item.navigator}</Text>
              </View>
            ))}
          </View>
        </SectionCard>

        <SectionCard title="开通说明">
          <View className="grid gap-3">
            <View className="rounded bg-canvas px-3 py-3">
              <Text className="block text-sm font-semibold text-ink">有效期多久？</Text>
              <Text className="mt-1 block text-sm leading-6 text-muted">开通之日起 1 年有效，到期可续费。</Text>
            </View>
            <View className="rounded bg-canvas px-3 py-3">
              <Text className="block text-sm font-semibold text-ink">支持对公转账吗？</Text>
              <Text className="mt-1 block text-sm leading-6 text-muted">支持微信支付和对公转账，财务确认后开通。</Text>
            </View>
            <View className="rounded bg-canvas px-3 py-3">
              <Text className="block text-sm font-semibold text-ink">是否可以升级？</Text>
              <Text className="mt-1 block text-sm leading-6 text-muted">
                {aboutText || '支持从菁英升级到领航，最终规则以平台配置为准。'}
              </Text>
            </View>
          </View>
        </SectionCard>

        <Popup
          visible={Boolean(pollingOrderNo)}
          position="center"
          round
          destroyOnClose
          closeOnOverlayClick={false}
          overlayClassName="member-payment-popup-overlay"
          className="member-payment-popup w-[86vw] max-w-[640rpx] overflow-hidden rounded-lg bg-transparent"
        >
          <View className="bg-canvas p-3">
            {pollingOrderNo ? (
              <PaymentStatusPoller
                orderNo={pollingOrderNo}
                queryStatus={queryVipPaymentStatus}
                backLabel="关闭弹窗"
                onBack={handleClosePaymentPopup}
                onRetryPayment={handleRetryPayment}
                onSuccess={handlePaymentConfirmed}
              />
            ) : null}
          </View>
        </Popup>
      </View>
    </PageShell>
  )
}
