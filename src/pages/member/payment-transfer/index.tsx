import { useEffect, useRef, useState } from 'react'
import Taro from '@tarojs/taro'
import { View } from '@tarojs/components'
import { ActionBar, FieldList, PaymentStatusPoller, StateNotice } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { cancelOrder, getOrderDetail, payOrder, queryOrderPaymentStatus, type GetOrderDetailData } from '@/services'
import { ensureLoggedIn } from '@/shared/auth-guard'
import { router, routes } from '@/shared/router'
import { getPageParam, priceOf, textOrPlaceholder } from '@/shared/view-data'
import { getWechatPaymentErrorMessage, requestWechatPayment } from '@/shared/wechat-payment'

export default function PaymentTransferPage() {
  const [order, setOrder] = useState<GetOrderDetailData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [pollingOrderNo, setPollingOrderNo] = useState('')
  const [isPaying, setIsPaying] = useState(false)
  const paymentLockRef = useRef(false)
  const isPaidOrder = Boolean(order?.pay_time) || order?.status === 1 || order?.status === 2
  const canReviewOrder =
    isPaidOrder &&
    order?.status !== 3 &&
    order?.status !== 4 &&
    Boolean(order?.order_id) &&
    Boolean(order?.items?.some((item) => item.product_id))

  async function refreshOrder() {
    const orderNo = getPageParam('order_no')

    if (!orderNo) {
      setOrder(null)
      return
    }

    const response = await getOrderDetail({ order_no: orderNo })
    setOrder(response.data.order_no ? response.data : null)
  }

  useEffect(() => {
    async function loadOrder() {
      setIsLoading(true)
      setHasError(false)

      await refreshOrder()
    }

    void loadOrder()
      .catch(() => {
        setOrder(null)
        setHasError(true)
      })
      .finally(() => setIsLoading(false))
  }, [])

  async function handleWechatPayment() {
    if (paymentLockRef.current || !order?.order_no || order.status !== 0) return
    paymentLockRef.current = true
    setIsPaying(true)
    setPollingOrderNo('')

    try {
      const response = await payOrder({ order_no: order.order_no, pay_method: 1 })
      setPollingOrderNo(order.order_no)
      await requestWechatPayment(response.data.pay_params)
      Taro.showToast({ title: '正在确认支付结果', icon: 'none' })
    } catch (error) {
      Taro.showToast({ title: getWechatPaymentErrorMessage(error), icon: 'none' })
    } finally {
      paymentLockRef.current = false
      setIsPaying(false)
    }
  }

  async function handleCancelOrder() {
    if (!(await ensureLoggedIn('登录后才能取消订单'))) {
      return
    }

    if (!order?.order_no || order.status !== 0) {
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
    <PageShell title="订单详情" subtitle="查看订单状态，并继续处理待支付订单。">
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
          {order.status === 0 ? (
            <ActionBar
              actions={[
                { label: '取消订单', variant: 'outline', disabled: isPaying, onClick: handleCancelOrder },
                { label: isPaying ? '支付处理中' : '微信支付', disabled: isPaying, onClick: handleWechatPayment }
              ]}
            />
          ) : null}
          {canReviewOrder && order.order_id ? (
            <ActionBar
              actions={[
                { label: '返回订单列表', variant: 'outline', path: routes.userOrders },
                {
                  label: '评价订单',
                  path: routes.userReviews,
                  query: {
                    order_id: order.order_id,
                    order_no: order.order_no,
                    title: order.items?.[0]?.product_name
                  }
                }
              ]}
            />
          ) : null}
          {pollingOrderNo ? (
            <PaymentStatusPoller
              orderNo={pollingOrderNo}
              queryStatus={queryOrderPaymentStatus}
              onBack={() => {
                void router.redirect(routes.userOrders)
              }}
              onRetryPayment={(reason) => {
                if (reason !== 'timeout') {
                  setPollingOrderNo('')
                  void refreshOrder()
                  return
                }
                void handleWechatPayment()
              }}
              onSuccess={() => {
                setPollingOrderNo('')
                Taro.showToast({ title: '支付已确认', icon: 'success' })
                void refreshOrder()
              }}
            />
          ) : null}
        </View>
      ) : (
        <StateNotice state="empty" copy={{ title: '暂无订单详情', desc: '当前缺少订单号或接口没有返回订单详情。' }} />
      )}
    </PageShell>
  )
}
