import { useState } from 'react'
import Taro from '@tarojs/taro'
import { Text, View } from '@tarojs/components'
import { ActionBar, FieldList, SectionCard } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { createMemberOrder, isFrontendMockEnabled, loginWithWechat, payMemberOrder } from '@/shared/frontend-test-flow'
import { router, routes } from '@/shared/router'

export default function MemberConfirmPage() {
  const [isPaying, setIsPaying] = useState(false)
  const [lastOrderId, setLastOrderId] = useState('')

  async function handleWechatPayment() {
    setIsPaying(true)
    Taro.showLoading({ title: '生成订单中' })

    try {
      await loginWithWechat()
      const order = await createMemberOrder({
        planId: 'elite-yearly',
        paymentMethod: 'wechat'
      })
      setLastOrderId(order.id)
      Taro.showLoading({ title: '拉起支付中' })
      await payMemberOrder(order.id)
      Taro.showToast({
        title: isFrontendMockEnabled() ? 'Mock 支付成功' : '支付成功',
        icon: 'success'
      })
      router.redirect(routes.userBenefits, { orderId: order.id })
    } finally {
      Taro.hideLoading()
      setIsPaying(false)
    }
  }

  return (
    <PageShell title="会员开通确认" subtitle="确认会员方案与企业信息后生成订单。">
      <View className="grid gap-3">
        <SectionCard title="会员方案">
          <Text className="block text-base font-bold text-ink">行商·菁英会员</Text>
          <Text className="mt-2 block text-sm text-muted">有效期 12 个月，含资源、课程、商机优先权益。</Text>
          {lastOrderId ? <Text className="mt-2 block text-xs text-brand">最近测试订单：{lastOrderId}</Text> : null}
        </SectionCard>
        <FieldList
          fields={[
            { label: '开通企业', value: '鑫财财税有限公司' },
            { label: '会员费用', value: '¥4,980' },
            { label: '开票类型', value: '增值税普通发票' },
            { label: '支付方式', value: '微信支付 / 对公转账' }
          ]}
        />
        <ActionBar
          actions={[
            { label: '对公转账', variant: 'outline', path: routes.paymentTransfer },
            {
              label: isPaying ? '支付处理中' : '微信支付开通',
              disabled: isPaying,
              onClick: handleWechatPayment
            }
          ]}
        />
      </View>
    </PageShell>
  )
}
