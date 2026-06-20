import { useEffect, useState } from 'react'
import Taro from '@tarojs/taro'
import { Text, View } from '@tarojs/components'
import { ActionBar, FieldList, SectionCard } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { createMemberOrder, getMockOrders, submitTransferVoucher, type MemberOrder } from '@/shared/frontend-test-flow'
import { router, routes } from '@/shared/router'

export default function PaymentTransferPage() {
  const [order, setOrder] = useState<MemberOrder | null>(null)
  const [voucherFilename, setVoucherFilename] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    async function prepareOrder() {
      const orders = await getMockOrders()
      const existingOrder = orders.find((item) => item.status === 'pending') ?? null

      if (existingOrder) {
        setOrder(existingOrder)
        return
      }

      const nextOrder = await createMemberOrder({
        planId: 'elite-yearly',
        paymentMethod: 'transfer'
      })
      setOrder(nextOrder)
    }

    void prepareOrder()
  }, [])

  function handlePickVoucher() {
    setVoucherFilename('bank-receipt-mock.png')
    Taro.showToast({ title: '已选择测试凭证', icon: 'success' })
  }

  async function handleSubmitVoucher() {
    if (!order) {
      Taro.showToast({ title: '订单准备中', icon: 'none' })
      return
    }

    if (!voucherFilename) {
      Taro.showToast({ title: '请先上传凭证', icon: 'none' })
      return
    }

    setIsSubmitting(true)
    Taro.showLoading({ title: '提交中' })

    try {
      await submitTransferVoucher(order.id, { filename: voucherFilename })
      Taro.showToast({ title: '凭证已提交', icon: 'success' })
      router.redirect(routes.userOrders)
    } finally {
      Taro.hideLoading()
      setIsSubmitting(false)
    }
  }

  return (
    <PageShell title="对公支付凭证" subtitle="上传转账凭证后由财务确认到账。">
      <View className="grid gap-3">
        <FieldList
          fields={[
            { label: '订单编号', value: order?.id ?? '准备中' },
            { label: '订单金额', value: order ? `¥${order.amount.toLocaleString()}` : '准备中' },
            { label: '收款户名', value: '行商书苑科技有限公司' },
            { label: '备注信息', value: '请备注订单编号' }
          ]}
        />
        <SectionCard title="凭证上传">
          <View className="rounded-lg border border-dashed border-line bg-canvas px-4 py-8" onClick={handlePickVoucher}>
            <Text className="block text-center text-sm text-muted">
              {voucherFilename ? `已选择：${voucherFilename}` : '点击上传银行回单截图'}
            </Text>
          </View>
        </SectionCard>
        <ActionBar
          actions={[
            {
              label: isSubmitting ? '提交中' : '提交凭证',
              disabled: isSubmitting,
              onClick: handleSubmitVoucher
            }
          ]}
        />
      </View>
    </PageShell>
  )
}
