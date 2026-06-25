import { useEffect, useState } from 'react'
import { Text, View } from '@tarojs/components'
import { ActionBar, EmptyState, FieldList, SectionCard } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { getProductDetail, getProducts, type GetProductDetailData } from '@/services'
import { routes } from '@/shared/router'
import { compactJoin, getPageParam, priceOf, textOrPlaceholder } from '@/shared/view-data'

async function resolveProductId() {
  const pageId = getPageParam('product_id')

  if (pageId) {
    return pageId
  }

  const response = await getProducts({ page: 1, page_size: 1 })
  return response.data.list?.[0]?.id
}

export default function ResourceStandardDetailPage() {
  const [product, setProduct] = useState<GetProductDetailData | null>(null)

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

  return (
    <PageShell
      title={product ? textOrPlaceholder(product.name) : '资源详情'}
      subtitle="标准化工具资源，支持在线采购和会员优惠。"
    >
      {product ? (
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
              {textOrPlaceholder(product.description ?? product.detail, '接口未返回资源说明')}
            </Text>
          </SectionCard>

          <SectionCard title="商品规格">
            {product.specs?.length ? (
              <View className="grid gap-2">
                {product.specs.map((spec) => (
                  <View key={spec.id ?? spec.spec_name} className="rounded-lg bg-canvas px-3 py-3">
                    <Text className="block text-sm font-semibold text-ink">
                      {textOrPlaceholder(spec.spec_name, '未命名规格')}
                    </Text>
                    <Text className="mt-1 block text-xs text-muted">
                      {priceOf(spec.vip_price ?? spec.price, spec.price_unit) ?? '未提供价格'}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <EmptyState title="暂无规格" desc="商品详情接口未返回规格数据。" />
            )}
          </SectionCard>

          <ActionBar
            actions={[
              { label: '开通会员省钱', variant: 'gold', path: routes.memberBenefit },
              {
                label: '立即采购',
                path: routes.resourcePurchase,
                query: product.id ? { product_id: product.id } : undefined
              }
            ]}
          />
        </View>
      ) : (
        <EmptyState title="暂无资源详情" />
      )}
    </PageShell>
  )
}
