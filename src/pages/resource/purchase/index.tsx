import { useEffect, useState } from 'react'
import Taro from '@tarojs/taro'
import { Text, View } from '@tarojs/components'
import { ActionBar, SectionCard, StateNotice } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import {
  createProductOrder,
  getProductDetail,
  getProducts,
  payOrder,
  type CreateProductOrderData,
  type GetProductDetailData
} from '@/services'
import { ensureLoggedIn } from '@/shared/auth-guard'
import { router, routes } from '@/shared/router'
import { getPageParam, numberOf, priceOf, textOrPlaceholder } from '@/shared/view-data'
import { getWechatPaymentErrorMessage, requestWechatPayment } from '@/shared/wechat-payment'

type ProductSpec = NonNullable<GetProductDetailData['specs']>[number]

async function resolveProductId() {
  const pageId = getPageParam('product_id')

  if (pageId) {
    return pageId
  }

  const response = await getProducts({ page: 1, page_size: 1 })
  return response.data.list?.[0]?.id
}

function getStandardPrice(product: GetProductDetailData, spec?: ProductSpec) {
  return priceOf(spec?.price ?? product.price, spec?.price_unit ?? product.price_unit) ?? '未提供'
}

function getMemberPrice(product: GetProductDetailData, spec?: ProductSpec) {
  return priceOf(spec?.vip_price ?? product.vip_price, spec?.price_unit ?? product.price_unit) ?? '未提供'
}

function getPayAmount(product: GetProductDetailData, spec?: ProductSpec) {
  return priceOf(
    spec?.vip_price ?? spec?.price ?? product.vip_price ?? product.price,
    spec?.price_unit ?? product.price_unit
  )
}

function getSavingsText(product: GetProductDetailData, spec?: ProductSpec) {
  const standardPrice = numberOf(spec?.price ?? product.price)
  const memberPrice = numberOf(spec?.vip_price ?? product.vip_price)

  if (!standardPrice || !memberPrice || standardPrice <= memberPrice) {
    return '按所选规格生成订单'
  }

  return `已按会员价优惠 ¥${(standardPrice - memberPrice).toFixed(2)}`
}

export default function ResourcePurchasePage() {
  const [product, setProduct] = useState<GetProductDetailData | null>(null)
  const [selectedSpecIndex, setSelectedSpecIndex] = useState(0)
  const [order, setOrder] = useState<CreateProductOrderData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    async function loadProduct() {
      setIsLoading(true)
      setHasError(false)

      const productId = await resolveProductId()

      if (!productId) {
        setProduct(null)
        setIsLoading(false)
        return
      }

      const response = await getProductDetail({ product_id: productId })
      const nextProduct = response.data.id ? response.data : null
      const pageSpecId = getPageParam('spec_id')
      const nextSpecIndex = nextProduct?.specs?.findIndex((spec) => String(spec.id) === String(pageSpecId)) ?? -1

      setProduct(nextProduct)
      setSelectedSpecIndex(nextSpecIndex >= 0 ? nextSpecIndex : 0)
    }

    void loadProduct()
      .catch(() => {
        setProduct(null)
        setHasError(true)
      })
      .finally(() => setIsLoading(false))
  }, [])

  async function ensureOrder() {
    if (!(await ensureLoggedIn('登录后才能采购资源'))) {
      return null
    }

    if (order?.order_no) {
      return order
    }

    if (!product?.id) {
      Taro.showToast({ title: '暂无商品数据', icon: 'none' })
      return null
    }

    Taro.showLoading({ title: '生成订单中' })

    try {
      const selectedSpec = product.specs?.[selectedSpecIndex]
      const response = await createProductOrder({
        items: [{ product_id: product.id, spec_id: selectedSpec?.id, quantity: 1 }]
      })
      setOrder(response.data)
      return response.data
    } catch {
      Taro.showToast({ title: '订单生成失败，请稍后重试', icon: 'none' })
      return null
    } finally {
      Taro.hideLoading()
    }
  }

  async function handleTransferPayment() {
    setIsSubmitting(true)

    try {
      const nextOrder = await ensureOrder()

      if (nextOrder?.order_no) {
        router.to(routes.paymentTransfer, { order_no: nextOrder.order_no })
      } else if (nextOrder) {
        Taro.showToast({ title: '订单未返回转账编号', icon: 'none' })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleWechatPayment() {
    setIsSubmitting(true)

    try {
      const nextOrder = await ensureOrder()

      if (!nextOrder?.order_no) {
        Taro.showToast({ title: '订单生成失败', icon: 'none' })
        return
      }

      Taro.showLoading({ title: '拉起支付中' })
      const payResult = await payOrder({ order_no: nextOrder.order_no, pay_method: 1 })
      await requestWechatPayment(payResult.data.pay_params)

      setOrder(null)
      Taro.showToast({ title: '正在确认支付结果', icon: 'none' })
      router.redirect(routes.userOrders)
    } catch (error) {
      Taro.showToast({ title: getWechatPaymentErrorMessage(error), icon: 'none' })
    } finally {
      Taro.hideLoading()
      setIsSubmitting(false)
    }
  }

  function handleSelectSpec(index: number) {
    setSelectedSpecIndex(index)
    setOrder(null)
  }

  const selectedSpec = product?.specs?.[selectedSpecIndex]

  return (
    <PageShell title="采购确认" subtitle="先选择采购规格，再确认金额并生成订单。">
      {isLoading ? (
        <StateNotice state="loading" />
      ) : hasError ? (
        <StateNotice state="error" />
      ) : product ? (
        <View className="grid gap-4">
          <View className="overflow-hidden rounded-lg bg-brand-deep shadow-medium">
            <View className="bg-[linear-gradient(135deg,rgba(240,180,41,0.18)_0%,rgba(26,53,128,0.82)_48%,rgba(5,14,46,1)_100%)] p-4">
              <View className="flex items-center justify-between gap-3">
                <View className="rounded-full bg-white/12 px-3 py-1">
                  <Text className="text-[20rpx] font-semibold text-gold-light">
                    {textOrPlaceholder(product.product_type_text, '资源采购')}
                  </Text>
                </View>
                <Text className="text-[20rpx] font-semibold text-white/70">
                  {product.specs?.length ? `${product.specs.length} 个规格可选` : '暂无规格'}
                </Text>
              </View>
              <Text className="mt-4 block text-xl font-bold leading-8 text-white">
                {textOrPlaceholder(product.name)}
              </Text>
              <Text className="mt-2 block text-sm leading-6 text-white/72">
                {textOrPlaceholder(product.description, '接口未返回资源描述')}
              </Text>
              {order?.order_no ? (
                <View className="mt-3 rounded bg-white/10 px-3 py-2">
                  <Text className="text-[20rpx] font-semibold text-white/80">最近订单：{order.order_no}</Text>
                </View>
              ) : null}
            </View>
          </View>

          <SectionCard title="选择规格">
            {product.specs?.length ? (
              <View className="grid gap-3">
                {product.specs.map((spec, index) => {
                  const isSelected = index === selectedSpecIndex
                  const standardPrice = priceOf(spec.price, spec.price_unit)
                  const memberPrice = priceOf(spec.vip_price ?? spec.price, spec.price_unit)

                  return (
                    <View
                      key={spec.id ?? `${spec.spec_name}-${index}`}
                      className={`rounded-lg border px-3 py-3 shadow-sm ${
                        isSelected ? 'border-brand bg-brand-soft' : 'border-line bg-canvas'
                      }`}
                      onClick={() => handleSelectSpec(index)}
                    >
                      <View className="flex items-start justify-between gap-3">
                        <View className="flex-1">
                          <Text className="block text-base font-bold text-ink">
                            {textOrPlaceholder(spec.spec_name, '未命名规格')}
                          </Text>
                          <View className="mt-2 flex items-baseline gap-2">
                            <Text className="text-lg font-bold text-brand">{memberPrice ?? '未提供价格'}</Text>
                            {standardPrice && standardPrice !== memberPrice ? (
                              <Text className="text-[20rpx] text-muted line-through">{standardPrice}</Text>
                            ) : null}
                          </View>
                        </View>
                        <View
                          className={`h-5 min-w-5 rounded-full border ${
                            isSelected ? 'border-brand bg-brand' : 'border-line bg-white'
                          }`}
                        >
                          {isSelected ? (
                            <Text className="block text-center text-[20rpx] leading-5 text-white">✓</Text>
                          ) : null}
                        </View>
                      </View>
                    </View>
                  )
                })}
              </View>
            ) : (
              <StateNotice state="empty" copy={{ title: '暂无规格', desc: '商品详情接口未返回规格数据。' }} />
            )}
          </SectionCard>

          <View className="rounded-lg bg-white p-4 shadow-soft">
            <View className="mb-4 flex items-center justify-between gap-3">
              <View className="flex items-center gap-2">
                <View className="h-4 w-1 rounded bg-gold" />
                <Text className="text-base font-bold text-ink">金额确认</Text>
              </View>
              <Text className="text-[20rpx] font-semibold text-gold">{getSavingsText(product, selectedSpec)}</Text>
            </View>

            <View className="grid gap-3 rounded-lg bg-canvas p-3">
              <View className="flex items-center justify-between gap-3">
                <Text className="text-sm font-semibold text-muted">已选规格</Text>
                <Text className="text-right text-sm font-bold text-ink">
                  {textOrPlaceholder(selectedSpec?.spec_name)}
                </Text>
              </View>
              <View className="flex items-center justify-between gap-3">
                <Text className="text-sm font-semibold text-muted">商品金额</Text>
                <Text className="text-right text-sm font-bold text-ink">{getStandardPrice(product, selectedSpec)}</Text>
              </View>
              <View className="flex items-center justify-between gap-3">
                <Text className="text-sm font-semibold text-muted">会员价</Text>
                <Text className="text-right text-sm font-bold text-gold">{getMemberPrice(product, selectedSpec)}</Text>
              </View>
            </View>

            <View className="mt-4 flex items-end justify-between gap-3">
              <View>
                <Text className="block text-sm font-semibold text-muted">应付金额</Text>
                <Text className="mt-1 block text-[20rpx] text-muted">以订单接口返回金额为准</Text>
              </View>
              <Text className="text-2xl font-bold text-brand">{getPayAmount(product, selectedSpec) ?? '待确认'}</Text>
            </View>
          </View>

          <ActionBar
            actions={[
              {
                label: '对公转账',
                variant: 'outline',
                disabled: isSubmitting,
                onClick: handleTransferPayment
              },
              {
                label: isSubmitting ? '处理中' : '立即购买',
                disabled: isSubmitting,
                onClick: handleWechatPayment
              }
            ]}
          />
        </View>
      ) : (
        <StateNotice state="empty" copy={{ title: '暂无采购商品', desc: '当前接口没有返回可采购商品。' }} />
      )}
    </PageShell>
  )
}
