import { useEffect, useState } from 'react'
import { ScrollView, View, Text } from '@tarojs/components'
import Button from '@nutui/nutui-react-taro/dist/es/packages/button'
import '@nutui/nutui-react-taro/dist/es/packages/button/style/css'
import { AppIcon } from '@/components/AppIcon'
import { ListLoadMore, SectionCard, StateNotice } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { getProductCategories, getProducts } from '@/services'
import { getAppIconName, type AppIconName } from '@/shared/app-icons'
import { router, routes, type Query, type RoutePath } from '@/shared/router'
import { usePaginatedList } from '@/shared/use-paginated-list'
import { priceOf, textOf, textOrPlaceholder } from '@/shared/view-data'

interface Category {
  id?: number
  name: string
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

type ServiceProductRecord = NonNullable<Awaited<ReturnType<typeof getProducts>>['data']['list']>[number]

function mapServiceProducts(list: ServiceProductRecord[]): ServiceProduct[] {
  return list.map((item) => ({
    title: textOrPlaceholder(item.name, '未命名服务'),
    desc: textOrPlaceholder(item.description, '接口未返回服务描述'),
    price: priceOf(item.vip_price ?? item.price, item.price_unit),
    tag: textOf(item.product_type_text),
    icon: getAppIconName(textOrPlaceholder(item.name, '未命名服务'), undefined, routes.resourceStandardDetail),
    path: routes.resourceStandardDetail,
    query: item.id ? { product_id: item.id } : undefined
  }))
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
  const [activeCategoryId, setActiveCategoryId] = useState<number | undefined>()
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true)
  const [hasCategoriesError, setHasCategoriesError] = useState(false)
  const {
    hasError: hasProductsError,
    hasMore,
    isLoading: isProductsLoading,
    isLoadingMore,
    items
  } = usePaginatedList<ServiceProductRecord, ServiceProduct>({
    deps: [activeCategoryId],
    fetchPage: ({ page, page_size }) =>
      getProducts({
        ...(activeCategoryId !== undefined ? { category_id: activeCategoryId } : {}),
        page,
        page_size
      }),
    mapItems: mapServiceProducts
  })
  const isLoading = isCategoriesLoading && isProductsLoading
  const hasError = hasCategoriesError && hasProductsError

  useEffect(() => {
    async function loadCategories() {
      setIsCategoriesLoading(true)
      setHasCategoriesError(false)

      try {
        const response = await getProductCategories()
        setCategories(
          (response.data.list ?? []).map((item) => ({
            id: item.id,
            name: textOrPlaceholder(item.name, '未命名分类')
          }))
        )
      } catch {
        setCategories([])
        setHasCategoriesError(true)
      } finally {
        setIsCategoriesLoading(false)
      }
    }

    void loadCategories()
  }, [])

  return (
    <PageShell showHeader={false} title="服务商城" subtitle="工具、培训、咨询和资质服务统一入口。">
      <View className="grid gap-3">
        {isLoading ? <StateNotice state="loading" /> : null}
        {!isLoading && hasError ? <StateNotice state="error" /> : null}

        {!isLoading && !hasError ? (
          <>
            <SectionCard title="服务分类">
              {categories.length ? (
                <ScrollView scrollX enhanced showScrollbar={false} className="w-full max-w-full overflow-hidden">
                  <View className="inline-flex gap-2 pr-1">
                    {[{ id: undefined, name: '全部' }, ...categories].map((item) => {
                      const isActive = activeCategoryId === item.id

                      return (
                        <View
                          key={item.id ?? 'all'}
                          className={`shrink-0 rounded-full border px-4 py-2 ${
                            isActive ? 'border-brand bg-brand' : 'border-transparent bg-brand-soft'
                          }`}
                          onClick={() => setActiveCategoryId(item.id)}
                        >
                          <Text className={`text-xs font-semibold ${isActive ? 'text-white' : 'text-brand'}`}>
                            {item.name}
                          </Text>
                        </View>
                      )
                    })}
                  </View>
                </ScrollView>
              ) : (
                <StateNotice state="empty" copy={{ title: '暂无服务分类', desc: '当前接口没有返回服务分类。' }} />
              )}
            </SectionCard>

            {isProductsLoading ? (
              <StateNotice state="loading" />
            ) : hasProductsError ? (
              <StateNotice state="error" />
            ) : items.length ? (
              <View className="grid gap-3">
                {items.map((item, index) => (
                  <ServiceProductCard key={`${item.title}-${index}`} item={item} />
                ))}
                <ListLoadMore hasItems={items.length > 0} hasMore={hasMore} isLoadingMore={isLoadingMore} />
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
