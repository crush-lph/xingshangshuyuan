import { useEffect, useState } from 'react'
import { ScrollView, Text, View } from '@tarojs/components'
import { ActionBar, ItemList, SectionCard, StateNotice, type ListItem } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { getProductCategories, getProducts } from '@/services'
import { router, routes } from '@/shared/router'
import { priceOf, textOrPlaceholder, textOf } from '@/shared/view-data'

export default function ResourceHomePage() {
  const [categories, setCategories] = useState<Array<{ id?: number; name: string }>>([])
  const [items, setItems] = useState<ListItem[]>([])
  const [notice, setNotice] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    async function loadResourceData() {
      setIsLoading(true)
      setHasError(false)

      const [categoriesResult, productsResult] = await Promise.allSettled([
        getProductCategories(),
        getProducts({ page: 1, page_size: 3 })
      ])

      setHasError(categoriesResult.status === 'rejected' && productsResult.status === 'rejected')

      if (categoriesResult.status === 'fulfilled') {
        setCategories(
          (categoriesResult.value.data.list ?? []).slice(0, 8).map((item) => ({
            id: item.id,
            name: textOrPlaceholder(item.name, '未命名分类')
          }))
        )
      }

      if (productsResult.status === 'fulfilled') {
        const products = productsResult.value.data.list ?? []
        setNotice(products[0]?.name ? `新上架：${products[0].name}` : '')
        setItems(
          products.slice(0, 3).map((item) => ({
            title: textOrPlaceholder(item.name, '未命名资源'),
            desc: textOrPlaceholder(item.description, '接口未返回资源描述'),
            price: priceOf(item.vip_price ?? item.price, item.price_unit),
            tag: textOf(item.product_type_text),
            icon: 'archive-line',
            tone: item.vip_price ? 'gold' : 'tech',
            action: '查看',
            path: routes.resourceStandardDetail,
            query: item.id ? { product_id: item.id } : undefined
          }))
        )
      }

      setIsLoading(false)
    }

    void loadResourceData()
  }, [])

  return (
    <PageShell title="资源库" subtitle="软件工具、会计工厂、资质许可与财税服务资源统一采购。">
      <View className="grid gap-3">
        {isLoading ? <StateNotice state="loading" /> : null}
        {!isLoading && hasError ? <StateNotice state="error" /> : null}

        {!isLoading && !hasError ? (
          <>
            {notice ? (
              <View className="rounded-lg bg-gold-soft px-4 py-3">
                <Text className="text-sm font-semibold text-gold">{notice}</Text>
              </View>
            ) : null}
            <View
              className="rounded-full bg-white px-4 py-3 shadow-soft"
              onClick={() => router.to(routes.resourceList)}
            >
              <Text className="text-sm text-muted">搜索项目、供应商、服务类型...</Text>
            </View>
            <SectionCard title="资源分类">
              {categories.length ? (
                <ScrollView
                  scrollX
                  enhanced
                  showScrollbar={false}
                  className="w-full max-w-full whitespace-nowrap overflow-hidden"
                >
                  {categories.map((item, index) => (
                    <View
                      key={`${item.id ?? item.name}-${index}`}
                      className={`mr-2 inline-flex shrink-0 rounded-full border px-4 py-2 ${
                        index === 0 ? 'border-brand bg-brand' : 'border-transparent bg-brand-soft'
                      }`}
                      onClick={() => router.to(routes.resourceList, item.id ? { category_id: item.id } : undefined)}
                    >
                      <Text className={`text-xs font-semibold ${index === 0 ? 'text-white' : 'text-brand'}`}>
                        {item.name}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              ) : (
                <StateNotice state="empty" copy={{ title: '暂无资源分类', desc: '当前接口没有返回资源分类。' }} />
              )}
            </SectionCard>
            <SectionCard title="战略供应商推荐">
              {items.length ? (
                <ItemList items={items} variant="embedded" />
              ) : (
                <StateNotice state="empty" copy={{ title: '暂无资源', desc: '当前接口没有返回推荐资源。' }} />
              )}
            </SectionCard>
            <View className="rounded-lg bg-brand-deep p-4 shadow-medium">
              <Text className="block text-base font-bold text-gold-light">会员采购入口</Text>
              <Text className="mt-2 block text-sm leading-5 text-white/65">
                接口返回会员权益后可在权益页查看具体折扣和服务。
              </Text>
              <View className="mt-3">
                <ActionBar actions={[{ label: '查看会员权益', variant: 'gold', path: routes.memberBenefit }]} />
              </View>
            </View>
          </>
        ) : null}
      </View>
    </PageShell>
  )
}
