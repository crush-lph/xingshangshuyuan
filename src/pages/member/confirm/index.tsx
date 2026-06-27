import { useEffect, useState } from 'react'
import Taro from '@tarojs/taro'
import { Text, View } from '@tarojs/components'
import { ActionBar, EmptyState, FieldList, SectionCard } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { createProductOrder, getProducts, payOrder, type CreateProductOrderData } from '@/services'
import { ensureLoggedIn } from '@/shared/auth-guard'
import { router, routes } from '@/shared/router'
import { priceOf, textOrPlaceholder } from '@/shared/view-data'
import { getWechatPaymentErrorMessage, requestWechatPayment } from '@/shared/wechat-payment'

interface MemberProduct {
  id: number
  name: string
  desc?: string
  price?: string
}

export default function MemberConfirmPage() {
  const [isPaying, setIsPaying] = useState(false)
  const [product, setProduct] = useState<MemberProduct | null>(null)
  const [order, setOrder] = useState<CreateProductOrderData | null>(null)

  useEffect(() => {
    async function loadProduct() {
      const response = await getProducts({ page: 1, page_size: 1 })
      const item = response.data.list?.[0]
      setProduct(
        item?.id
          ? {
              id: item.id,
              name: textOrPlaceholder(item.name),
              desc: item.description,
              price: priceOf(item.vip_price ?? item.price, item.price_unit)
            }
          : null
      )
    }

    void loadProduct().catch(() => setProduct(null))
  }, [])

  async function ensureOrder() {
    if (!(await ensureLoggedIn('登录后才能开通会员'))) {
      return null
    }

    if (!product) {
      Taro.showToast({ title: '暂无商品数据', icon: 'none' })
      return null
    }

    if (order?.order_no) {
      return order
    }

    Taro.showLoading({ title: '生成订单中' })
    const orderResult = await createProductOrder({
      items: [{ product_id: product.id, quantity: 1 }]
    })
    setOrder(orderResult.data)
    return orderResult.data
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
      const payResult = await payOrder({ order_no: nextOrder.order_no, pay_method: 1 })
      await requestWechatPayment(payResult.data.pay_params)

      Taro.showToast({ title: '支付成功', icon: 'success' })
      router.redirect(routes.userBenefits)
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

  return (
    <PageShell title="会员开通确认" subtitle="确认会员方案与企业信息后生成订单。">
      {product ? (
        <View className="grid gap-3">
          <SectionCard title="会员方案">
            <Text className="block text-base font-bold text-ink">{product.name}</Text>
            {product.desc ? <Text className="mt-2 block text-sm text-muted">{product.desc}</Text> : null}
            {order?.order_no ? <Text className="mt-2 block text-xs text-brand">最近订单：{order.order_no}</Text> : null}
          </SectionCard>
          <FieldList
            fields={[
              { label: '商品价格', value: product.price ?? '未提供' },
              { label: '支付方式', value: '微信支付 / 对公转账' },
              { label: '订单状态', value: textOrPlaceholder(order?.status_text, '未生成') }
            ]}
          />
          <ActionBar
            actions={[
              {
                label: '对公转账',
                variant: 'outline',
                disabled: isPaying,
                onClick: handleTransferPayment
              },
              {
                label: isPaying ? '支付处理中' : '微信支付开通',
                disabled: isPaying,
                onClick: handleWechatPayment
              }
            ]}
          />
        </View>
      ) : (
        <EmptyState title="暂无可开通商品" />
      )}
    </PageShell>
  )
}
