import { useEffect, useState } from 'react'
import { View, Text } from '@tarojs/components'
import Button from '@nutui/nutui-react-taro/dist/es/packages/button'
import '@nutui/nutui-react-taro/dist/es/packages/button/style/css'
import { AppIcon } from '@/components/AppIcon'
import { EmptyState, ItemList, SectionCard, type ListItem } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { getProductCategories, getProducts } from '@/services'
import { getAppIconName, type AppIconName } from '@/shared/app-icons'
import { router, routes, type RoutePath } from '@/shared/router'
import { priceOf, textOf, textOrPlaceholder } from '@/shared/view-data'

interface Category {
  name: string
  icon: AppIconName
  path: RoutePath
}

export default function ServicesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [items, setItems] = useState<ListItem[]>([])

  useEffect(() => {
    async function loadServiceData() {
      const [categoriesResult, productsResult] = await Promise.allSettled([
        getProductCategories(),
        getProducts({ page: 1, page_size: 6 })
      ])

      if (categoriesResult.status === 'fulfilled') {
        setCategories(
          (categoriesResult.value.data.list ?? []).slice(0, 4).map((item) => ({
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
            icon: 'service-line',
            tone: item.vip_price ? 'gold' : 'tech',
            action: '查看',
            path: routes.resourceStandardDetail,
            query: item.id ? { product_id: item.id } : undefined
          }))
        )
      }
    }

    void loadServiceData()
  }, [])

  return (
    <PageShell title="服务商城" subtitle="工具、培训、咨询和资质服务统一入口。">
      <View className="grid gap-3">
        <SectionCard title="服务分类">
          {categories.length ? (
            <View className="grid grid-cols-2 gap-3">
              {categories.map((item) => (
                <View key={item.name} className="rounded-lg bg-brand-soft p-3" onClick={() => router.to(item.path)}>
                  <View className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-white text-brand">
                    <AppIcon name={item.icon} size={20} />
                  </View>
                  <Text className="block text-sm font-bold text-brand">{item.name}</Text>
                </View>
              ))}
            </View>
          ) : (
            <EmptyState title="暂无服务分类" />
          )}
        </SectionCard>

        {items.length ? <ItemList items={items} /> : <EmptyState title="暂无服务商品" />}

        <View className="rounded-lg bg-brand-deep p-4 shadow-medium">
          <View className="flex items-center justify-between gap-3">
            <View className="flex-1">
              <Text className="block text-base font-bold text-white">没有找到合适服务？</Text>
              <Text className="mt-1 block text-sm text-white/65">提交需求后由客户经理协助匹配。</Text>
            </View>
            <Button
              type="primary"
              size="small"
              className="bg-gold border-gold"
              onClick={() => router.to(routes.resourceSubmit)}
            >
              提需求
            </Button>
          </View>
        </View>
      </View>
    </PageShell>
  )
}
