import { useEffect, useState } from 'react'
import Taro from '@tarojs/taro'
import { Text, View } from '@tarojs/components'
import { ActionBar, FieldList, SectionCard, StateNotice } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { cancelOrder, getOrderDetail, paymentCallback, uploadFile, type GetOrderDetailData } from '@/services'
import { ensureLoggedIn } from '@/shared/auth-guard'
import { router, routes } from '@/shared/router'
import { getPageParam, priceOf, textOrPlaceholder } from '@/shared/view-data'

export default function PaymentTransferPage() {
  const [order, setOrder] = useState<GetOrderDetailData | null>(null)
  const [voucherPath, setVoucherPath] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    async function loadOrder() {
      setIsLoading(true)
      setHasError(false)

      const orderNo = getPageParam('order_no')

      if (!orderNo) {
        setOrder(null)
        setIsLoading(false)
        return
      }

      const response = await getOrderDetail({ order_no: orderNo })
      setOrder(response.data.order_no ? response.data : null)
    }

    void loadOrder()
      .catch(() => {
        setOrder(null)
        setHasError(true)
      })
      .finally(() => setIsLoading(false))
  }, [])

  async function handlePickVoucher() {
    try {
      const result = await Taro.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera']
      })
      const selectedPath = result.tempFilePaths[0]

      if (selectedPath) {
        setVoucherPath(selectedPath)
        Taro.showToast({ title: '已选择凭证', icon: 'success' })
      }
    } catch {
      Taro.showToast({ title: '未选择凭证', icon: 'none' })
    }
  }

  async function handleSubmitVoucher() {
    if (!(await ensureLoggedIn('登录后才能提交支付凭证'))) {
      return
    }

    if (!order?.order_no) {
      Taro.showToast({ title: '暂无订单数据', icon: 'none' })
      return
    }

    if (!voucherPath) {
      Taro.showToast({ title: '请先上传凭证', icon: 'none' })
      return
    }

    setIsSubmitting(true)
    Taro.showLoading({ title: '提交中' })

    try {
      const voucher = await uploadFile({
        filePath: voucherPath,
        scene: 'bank_transfer_voucher',
        formData: {
          order_no: order.order_no
        }
      })

      await paymentCallback({
        order_no: order.order_no,
        voucher_url: voucher.fileUrl,
        pay_method: 'bank_transfer'
      })
      Taro.showToast({ title: '凭证已提交', icon: 'success' })
      router.redirect(routes.userOrders)
    } catch {
      Taro.showToast({ title: '凭证提交失败，请稍后重试', icon: 'none' })
    } finally {
      Taro.hideLoading()
      setIsSubmitting(false)
    }
  }

  async function handleCancelOrder() {
    if (!(await ensureLoggedIn('登录后才能取消订单'))) {
      return
    }

    if (!order?.order_no) {
      return
    }

    try {
      await cancelOrder({ order_no: order.order_no })
      Taro.showToast({ title: '订单已取消', icon: 'success' })
      router.redirect(routes.userOrders)
    } catch {
      Taro.showToast({ title: '取消订单失败，请稍后重试', icon: 'none' })
    }
  }

  return (
    <PageShell title="对公支付凭证" subtitle="上传转账凭证后进入财务审核。">
      {isLoading ? (
        <StateNotice state="loading" />
      ) : hasError ? (
        <StateNotice state="error" />
      ) : order ? (
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
                {voucherPath ? '已选择银行回单截图' : '点击上传银行回单截图'}
              </Text>
              {voucherPath ? <Text className="mt-2 block text-center text-xs text-muted">{voucherPath}</Text> : null}
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
        <StateNotice state="empty" copy={{ title: '暂无订单详情', desc: '当前缺少订单号或接口没有返回订单详情。' }} />
      )}
    </PageShell>
  )
}
