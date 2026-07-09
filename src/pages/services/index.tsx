import { useEffect, useState } from 'react'
import { View, Text } from '@tarojs/components'
import Button from '@nutui/nutui-react-taro/dist/es/packages/button'
import '@nutui/nutui-react-taro/dist/es/packages/button/style/css'
import { AppIcon } from '@/components/AppIcon'
import { SectionCard, StateNotice } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { getProductCategories, getProducts } from '@/services'
import { getAppIconName, type AppIconName } from '@/shared/app-icons'
import { router, routes, type Query, type RoutePath } from '@/shared/router'
import { priceOf, textOf, textOrPlaceholder } from '@/shared/view-data'

interface Category {
  id?: number
  name: string
  icon: AppIconName
  path: RoutePath
}

interface ServiceProduct {
  title: string
  desc: string
  price?: string
  tag?: string
  icon: AppIconName
  path: RoutePath
  query?: Query
}

function ServiceProductCard({ item }: { item: ServiceProduct }) {
  return (
    <View
      className="rounded-lg border border-line bg-white px-4 py-4 shadow-soft"
      onClick={() => router.to(item.path, item.query)}
    >
      <View className="flex items-start gap-3">
        <View className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gold-soft text-gold">
          <AppIcon name={item.icon} size={21} />
        </View>
        <View className="min-w-0 flex-1">
          <View className="flex items-start justify-between gap-2">
            <Text className="min-w-0 flex-1 text-base font-bold leading-6 text-ink">{item.title}</Text>
            {item.tag ? (
              <Text className="shrink-0 rounded bg-brand-soft px-2 py-1 text-[20rpx] font-semibold text-brand">
                {item.tag}
              </Text>
            ) : null}
          </View>
          <Text className="mt-2 block text-sm leading-6 text-muted">{item.desc}</Text>
        </View>
      </View>

      <View className="mt-3 h-px bg-line" />

      <View className="mt-3 flex items-center justify-between gap-3">
        <Text className="min-w-0 flex-1 text-lg font-bold leading-6 text-gold">{item.price ?? '价格待确认'}</Text>
        <View className="flex shrink-0 items-center gap-1">
          <Text className="text-xs font-semibold text-tech">详情</Text>
          <AppIcon name="arrow-right-s-line" size={18} color="#1677FF" />
        </View>
      </View>
    </View>
  )
}

export default function ServicesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [items, setItems] = useState<ServiceProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    async function loadServiceData() {
      setIsLoading(true)
      setHasError(false)

      const [categoriesResult, productsResult] = await Promise.allSettled([
        getProductCategories(),
        getProducts({ page: 1, page_size: 6 })
      ])

      setHasError(categoriesResult.status === 'rejected' && productsResult.status === 'rejected')

      if (categoriesResult.status === 'fulfilled') {
        setCategories(
          (categoriesResult.value.data.list ?? []).slice(0, 4).map((item) => ({
            id: item.id,
            name: textOrPlaceholder(item.name, '未命名分类'),
            icon: getAppIconName(textOrPlaceholder(item.name, '未命名分类'), item.icon, routes.resourceList),
            path: routes.resourceList
          }))
        )
      }

      if (productsResult.status === 'fulfilled') {
        setItems(
          (productsResult.value.data.list ?? []).slice(0, 6).map((item) => ({
            title: textOrPlaceholder(item.name, '未命名服务'),
            desc: textOrPlaceholder(item.description, '接口未返回服务描述'),
            price: priceOf(item.vip_price ?? item.price, item.price_unit),
            tag: textOf(item.product_type_text),
            icon: getAppIconName(textOrPlaceholder(item.name, '未命名服务'), undefined, routes.resourceStandardDetail),
            path: routes.resourceStandardDetail,
            query: item.id ? { product_id: item.id } : undefined
          }))
        )
      }

      setIsLoading(false)
    }

    void loadServiceData()
  }, [])

  return (
    <PageShell title="服务商城" subtitle="工具、培训、咨询和资质服务统一入口。">
      <View className="grid gap-3">
        {isLoading ? <StateNotice state="loading" /> : null}
        {!isLoading && hasError ? <StateNotice state="error" /> : null}

        {!isLoading && !hasError ? (
          <>
            <SectionCard title="服务分类">
              {categories.length ? (
                <View className="grid grid-cols-2 gap-3">
                  {categories.map((item) => (
                    <View
                      key={item.name}
                      className="rounded-lg bg-brand-soft p-3"
                      onClick={() => router.to(item.path, item.id ? { category_id: item.id } : undefined)}
                    >
                      <View className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-white text-brand">
                        <AppIcon name={item.icon} size={20} />
                      </View>
                      <Text className="block text-sm font-bold text-brand">{item.name}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <StateNotice state="empty" copy={{ title: '暂无服务分类', desc: '当前接口没有返回服务分类。' }} />
              )}
            </SectionCard>

            {items.length ? (
              <View className="grid gap-3">
                {items.map((item, index) => (
                  <ServiceProductCard key={`${item.title}-${index}`} item={item} />
                ))}
              </View>
            ) : (
              <StateNotice state="empty" copy={{ title: '暂无服务商品', desc: '当前接口没有返回可展示服务。' }} />
            )}

            <View className="rounded-lg bg-brand-deep p-4 shadow-medium">
              <View className="flex items-center justify-between gap-3">
                <View className="flex-1">
                  <Text className="block text-base font-bold text-white">没有找到合适服务？</Text>
                  <Text className="mt-1 block text-sm text-white/65">提交需求后由客户经理协助匹配。</Text>
                </View>
                <Button
                  type="primary"
                  size="small"
                  className="h-10 rounded-full border-0 bg-gold px-4 text-white"
                  onClick={() => router.to(routes.resourceSubmit)}
                >
                  提需求
                </Button>
              </View>
            </View>
          </>
        ) : null}
      </View>
    </PageShell>
  )
}
