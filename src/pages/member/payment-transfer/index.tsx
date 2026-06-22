import { useEffect, useState } from 'react'
import Taro from '@tarojs/taro'
import { Text, View } from '@tarojs/components'
import { ActionBar, EmptyState, FieldList, SectionCard } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { cancelOrder, getOrderDetail, paymentCallback, uploadFileRecord, type GetOrderDetailData } from '@/services'
import { router, routes } from '@/shared/router'
import { getPageParam, priceOf, textOrPlaceholder } from '@/shared/view-data'

export default function PaymentTransferPage() {
  const [order, setOrder] = useState<GetOrderDetailData | null>(null)
  const [voucherSelected, setVoucherSelected] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    async function loadOrder() {
      const orderNo = getPageParam('order_no')

      if (!orderNo) {
        setOrder(null)
        return
      }

      const response = await getOrderDetail({ order_no: orderNo })
      setOrder(response.data.order_no ? response.data : null)
    }

    void loadOrder().catch(() => setOrder(null))
  }, [])

  function handlePickVoucher() {
    setVoucherSelected(true)
    Taro.showToast({ title: '已选择凭证', icon: 'success' })
  }

  async function handleSubmitVoucher() {
    if (!order?.order_no) {
      Taro.showToast({ title: '暂无订单数据', icon: 'none' })
      return
    }

    if (!voucherSelected) {
      Taro.showToast({ title: '请先上传凭证', icon: 'none' })
      return
    }

    setIsSubmitting(true)
    Taro.showLoading({ title: '提交中' })

    try {
      await uploadFileRecord()
      await paymentCallback()
      Taro.showToast({ title: '凭证接口已调用', icon: 'success' })
      router.redirect(routes.userOrders)
    } finally {
      Taro.hideLoading()
      setIsSubmitting(false)
    }
  }

  async function handleCancelOrder() {
    if (!order?.order_no) {
      return
    }

    await cancelOrder({ order_no: order.order_no })
    Taro.showToast({ title: '订单已取消', icon: 'success' })
    router.redirect(routes.userOrders)
  }

  return (
    <PageShell title="对公支付凭证" subtitle="上传转账凭证后由财务确认到账。">
      {order ? (
        <View className="grid gap-3">
          <FieldList
            fields={[
              { label: '订单编号', value: textOrPlaceholder(order.order_no) },
              { label: '订单金额', value: priceOf(order.pay_amount ?? order.total_amount) ?? '未提供' },
              { label: '订单状态', value: textOrPlaceholder(order.status_text) },
              { label: '备注信息', value: textOrPlaceholder(order.remark) }
            ]}
          />
          <SectionCard title="凭证上传">
            <View
              className="rounded-lg border border-dashed border-line bg-canvas px-4 py-8"
              onClick={handlePickVoucher}
            >
              <Text className="block text-center text-sm text-muted">
                {voucherSelected ? '已选择凭证' : '点击上传银行回单截图'}
              </Text>
            </View>
          </SectionCard>
          <ActionBar
            actions={[
              { label: '取消订单', variant: 'outline', onClick: handleCancelOrder },
              {
                label: isSubmitting ? '提交中' : '提交凭证',
                disabled: isSubmitting,
                onClick: handleSubmitVoucher
              }
            ]}
          />
        </View>
      ) : (
        <EmptyState title="暂无订单详情" desc="缺少订单编号，或 Apifox mock 未返回订单详情数据。" />
      )}
    </PageShell>
  )
}
