import { useEffect, useState } from 'react'
import Taro from '@tarojs/taro'
import { Text, View } from '@tarojs/components'
import { ActionBar, EmptyState, FieldList, SectionCard } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import {
  createProductOrder,
  getProductDetail,
  getProducts,
  type CreateProductOrderData,
  type GetProductDetailData
} from '@/services'
import { ensurePhoneBound } from '@/shared/auth-guard'
import { router, routes } from '@/shared/router'
import { getPageParam, priceOf, textOrPlaceholder } from '@/shared/view-data'

async function resolveProductId() {
  const pageId = getPageParam('product_id')

  if (pageId) {
    return pageId
  }

  const response = await getProducts({ page: 1, page_size: 1 })
  return response.data.list?.[0]?.id
}

export default function ResourcePurchasePage() {
  const [product, setProduct] = useState<GetProductDetailData | null>(null)
  const [order, setOrder] = useState<CreateProductOrderData | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    async function loadProduct() {
      const productId = await resolveProductId()

      if (!productId) {
        setProduct(null)
        return
      }

      const response = await getProductDetail({ product_id: productId })
      setProduct(response.data.id ? response.data : null)
    }

    void loadProduct().catch(() => setProduct(null))
  }, [])

  async function handleCreateOrder(redirectToOrders = true) {
    if (!(await ensurePhoneBound('绑定手机号后才能采购资源'))) {
      return null
    }

    if (!product?.id) {
      Taro.showToast({ title: '暂无商品数据', icon: 'none' })
      return null
    }

    setIsSubmitting(true)
    Taro.showLoading({ title: '生成订单中' })

    try {
      const response = await createProductOrder({
        items: [{ product_id: product.id, spec_id: product.specs?.[0]?.id, quantity: 1 }]
      })
      setOrder(response.data)
      Taro.showToast({ title: '订单已生成', icon: 'success' })
      if (redirectToOrders) {
        router.redirect(routes.userOrders)
      }
      return response.data
    } finally {
      Taro.hideLoading()
      setIsSubmitting(false)
    }
  }

  async function handleTransferPayment() {
    if (order?.order_no) {
      router.to(routes.paymentTransfer, { order_no: order.order_no })
      return
    }

    const nextOrder = await handleCreateOrder(false)

    if (nextOrder?.order_no) {
      router.to(routes.paymentTransfer, { order_no: nextOrder.order_no })
    }
  }

  return (
    <PageShell title="采购确认" subtitle="确认资源、权益和支付方式后生成订单。">
      {product ? (
        <View className="grid gap-3">
          <SectionCard title="订单资源">
            <Text className="block text-base font-bold text-ink">{textOrPlaceholder(product.name)}</Text>
            <Text className="mt-2 block text-sm text-muted">
              {textOrPlaceholder(product.description, '接口未返回资源描述')}
            </Text>
            {order?.order_no ? <Text className="mt-2 block text-xs text-brand">最近订单：{order.order_no}</Text> : null}
          </SectionCard>
          <FieldList
            fields={[
              { label: '商品金额', value: priceOf(product.price, product.price_unit) ?? '未提供' },
              { label: '会员价', value: priceOf(product.vip_price, product.price_unit) ?? '未提供' },
              { label: '规格', value: textOrPlaceholder(product.specs?.[0]?.spec_name) },
              { label: '支付方式', value: '由订单接口返回' }
            ]}
          />
          <ActionBar
            actions={[
              {
                label: '对公转账',
                variant: 'outline',
                disabled: isSubmitting,
                onClick: handleTransferPayment
              },
              {
                label: isSubmitting ? '生成中' : '确认支付',
                disabled: isSubmitting,
                onClick: async () => {
                  await handleCreateOrder()
                }
              }
            ]}
          />
        </View>
      ) : (
        <EmptyState title="暂无采购商品" />
      )}
    </PageShell>
  )
}
