import { useEffect, useState } from 'react'
import { RichText, Text, View } from '@tarojs/components'
import { ActionBar, FieldList, ReviewList, SectionCard, StateNotice } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { getProductDetail, getProductReviews, type GetProductDetailData, type ProductReviewItem } from '@/services'
import { routes } from '@/shared/router'
import { compactJoin, getPageParam, priceOf, textOf, textOrPlaceholder } from '@/shared/view-data'

async function resolveProductId() {
  return getPageParam('product_id')
}

export default function ResourceStandardDetailPage() {
  const [product, setProduct] = useState<GetProductDetailData | null>(null)
  const [selectedSpecIndex, setSelectedSpecIndex] = useState(0)
  const [reviews, setReviews] = useState<ProductReviewItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

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
      setProduct(nextProduct)
      setSelectedSpecIndex(0)

      void getProductReviews({ product_id: productId, page: 1, page_size: 3 })
        .then((reviewsResponse) => setReviews(reviewsResponse.data.list ?? []))
        .catch(() => setReviews([]))
    }

    void loadProduct()
      .catch(() => {
        setProduct(null)
        setReviews([])
        setHasError(true)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  const reviewItems = reviews.map((item) => ({
    key: String(item.id ?? `${item.user_id}-${item.created_at}`),
    title: textOrPlaceholder(item.nickname, '匿名用户'),
    content: textOrPlaceholder(item.content, '暂无评价内容'),
    rating: item.rating,
    thumbnail: textOf(item.avatar),
    time: textOf(item.created_at)
  }))
  const selectedSpec = product?.specs?.[selectedSpecIndex]

  return (
    <PageShell
      title={product ? textOrPlaceholder(product.name) : '资源详情'}
      subtitle="标准化工具资源，支持在线采购和会员优惠。"
    >
      {isLoading ? (
        <StateNotice state="loading" />
      ) : hasError ? (
        <StateNotice state="error" />
      ) : product ? (
        <View className="grid gap-3">
          <View className="rounded-lg bg-brand-deep p-4 shadow-medium">
            <View className="flex items-start justify-between gap-3">
              <View className="flex-1">
                <Text className="block text-xs font-semibold text-gold-light">
                  {textOrPlaceholder(product.product_type_text, '未分类')}
                </Text>
                <Text className="mt-2 block text-xl font-bold text-white">
                  {priceOf(product.vip_price ?? product.price, product.price_unit) ?? '未提供价格'}
                </Text>
                <Text className="mt-1 block text-xs text-white/55">
                  {compactJoin([
                    product.original_price ? `原价 ${product.original_price}` : '',
                    product.sales_count ? `${product.sales_count}人购买` : ''
                  ])}
                </Text>
              </View>
              {product.vip_price ? (
                <View className="rounded bg-gold-soft px-2 py-1">
                  <Text className="text-xs font-semibold text-gold">会员价</Text>
                </View>
              ) : null}
            </View>
          </View>

          <FieldList
            fields={[
              { label: '商品名称', value: textOrPlaceholder(product.name) },
              { label: '商品分类', value: textOrPlaceholder(product.product_type_text) },
              { label: '浏览次数', value: textOrPlaceholder(product.view_count) },
              { label: '规格数量', value: String(product.specs?.length ?? 0) }
            ]}
          />

          <SectionCard title="资源说明">
            <Text className="block text-sm leading-6 text-muted">
              {textOrPlaceholder(product.description, '接口未返回资源说明')}
            </Text>
          </SectionCard>

          <SectionCard title="资源详情">
            {textOf(product.detail) ? (
              <RichText className="block text-sm leading-6 text-muted" nodes={textOf(product.detail) ?? ''} />
            ) : (
              <Text className="block text-sm leading-6 text-muted">接口未返回资源详情</Text>
            )}
          </SectionCard>

          <SectionCard title="商品规格">
            {product.specs?.length ? (
              <View className="grid gap-2">
                {product.specs.map((spec, index) => {
                  const isSelected = index === selectedSpecIndex

                  return (
                    <View
                      key={spec.id ?? `${spec.spec_name}-${index}`}
                      className={`rounded-lg border px-3 py-3 ${
                        isSelected ? 'border-brand bg-brand-soft' : 'border-transparent bg-canvas'
                      }`}
                      onClick={() => setSelectedSpecIndex(index)}
                    >
                      <Text className="block text-sm font-semibold text-ink">
                        {textOrPlaceholder(spec.spec_name, '未命名规格')}
                      </Text>
                      <Text className="mt-1 block text-xs text-muted">
                        {priceOf(spec.vip_price ?? spec.price, spec.price_unit) ?? '未提供价格'}
                      </Text>
                    </View>
                  )
                })}
              </View>
            ) : (
              <StateNotice state="empty" copy={{ title: '暂无规格', desc: '商品详情接口未返回规格数据。' }} />
            )}
          </SectionCard>

          <View className="grid gap-2">
            <View className="flex items-center gap-2 px-1">
              <View className="h-4 w-1 rounded bg-gold" />
              <Text className="block text-base font-bold text-ink">用户评价</Text>
            </View>
            {reviewItems.length ? (
              <ReviewList items={reviewItems} />
            ) : (
              <StateNotice state="empty" copy={{ title: '暂无评价', desc: '当前接口没有返回用户评价。' }} />
            )}
          </View>

          <ActionBar
            actions={[
              { label: '开通会员省钱', variant: 'gold', path: routes.memberBenefit },
              {
                label: '立即采购',
                path: routes.resourcePurchase,
                query: product.id ? { product_id: product.id, spec_id: selectedSpec?.id } : undefined
              }
            ]}
          />
        </View>
      ) : (
        <StateNotice state="empty" copy={{ title: '暂无资源详情', desc: '当前接口没有返回资源详情。' }} />
      )}
    </PageShell>
  )
}
